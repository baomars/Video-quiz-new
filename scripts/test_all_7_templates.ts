import path from 'path';
import fs from 'fs';
import { NativeQuizRenderer } from '../backend/src/render/native/nativeQuizRenderer.js';
import { TEMPLATE_LIBRARY, applyTemplateLayout } from '../remotion/types/templates.js';
import { Channel, Quiz, TimelineQuestionCue } from '../remotion/types/index.js';
import { RENDER_PRESETS } from '../backend/src/render/renderManager.js';

async function testAllTemplates() {
  const outputDir = path.resolve(process.cwd(), 'output', 'test_templates');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('========================================================');
  console.log(`🧪 TESTING ALL ${TEMPLATE_LIBRARY.length} TEMPLATES IN TEMPLATE_LIBRARY`);
  console.log('========================================================');

  const sampleQuiz: Quiz = {
    id: 'test-quiz',
    title: 'TIKTOK & REELS QUIZ',
    questions: [
      {
        id: 'q1',
        text: 'Hành tinh nào trong hệ Mặt Trời được mệnh danh là Hành Tinh Đỏ?',
        options: {
          A: 'Sao Hỏa (Mars)',
          B: 'Sao Kim (Venus)',
          C: 'Sao Mộc (Jupiter)'
        },
        correctAnswer: 'A',
        explanation: 'Sao Hỏa có bề mặt chứa nhiều oxit sắt tạo nên màu đỏ đặc trưng.'
      }
    ]
  };

  const totalFrames = 30; // 1 second at 30 fps
  const cues: TimelineQuestionCue[] = [
    {
      questionIndex: 0,
      startFrame: 0,
      endFrame: 30,
      durationFrames: 30,
      phases: {
        introStart: 0,
        questionTtsStart: 0,
        questionTtsEnd: 10,
        countdownStart: 10,
        countdownEnd: 20,
        revealStart: 20,
        explanationTtsStart: 20,
        explanationTtsEnd: 30
      },
      audioCues: []
    }
  ];

  let passed = 0;
  for (let i = 0; i < TEMPLATE_LIBRARY.length; i++) {
    const item = TEMPLATE_LIBRARY[i];
    console.log(`\n▶ [${i + 1}/${TEMPLATE_LIBRARY.length}] Testing: ${item.name} (${item.id})...`);

    const baseChannel: Channel = {
      id: `ch-${item.id}`,
      name: `Channel ${item.name}`,
      activeTemplateId: item.id,
      branding: {
        colors: item.branding.colors,
        typography: { headingFont: 'Montserrat, sans-serif', bodyFont: 'Be Vietnam Pro, sans-serif' },
        identity: { channelName: item.name, showLogo: false, showChannelName: false }
      }
    };

    const { template, channel } = applyTemplateLayout(item.id, item.template, baseChannel);
    const outputPath = path.join(outputDir, `${item.id}.mp4`);

    const startTime = Date.now();
    await NativeQuizRenderer.renderVideo({
      channel,
      template,
      quiz: sampleQuiz,
      cues,
      totalDurationFrames: totalFrames,
      fps: 30,
      width: 720,
      height: 1280,
      outputPath,
      presetConfig: RENDER_PRESETS.standard,
      nvencEnabled: false
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    const size = fs.statSync(outputPath).size;
    console.log(`  ✅ SUCCESS: ${item.id}.mp4 generated in ${elapsed}s (${size} bytes)`);
    passed++;
  }

  console.log('\n========================================================');
  console.log(`🎉 ALL ${passed}/${TEMPLATE_LIBRARY.length} TEMPLATES TESTED AND RENDERED PERFECTLY!`);
  console.log('========================================================');
}

testAllTemplates().catch((err) => {
  console.error('❌ Template test failed:', err);
  process.exit(1);
});
