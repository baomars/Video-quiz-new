import path from 'path';
import fs from 'fs';
import { NativeQuizRenderer } from '../backend/src/render/native/nativeQuizRenderer.js';
import { TEMPLATE_LIBRARY } from '../remotion/types/templates.js';
import { Channel, Quiz, TimelineQuestionCue } from '../remotion/types/index.js';
import { RENDER_PRESETS } from '../backend/src/render/renderManager.js';

async function runBenchmark() {
  const outputDir = path.resolve(process.cwd(), 'output', 'benchmark');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, 'bench_before.mp4');
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }

  const templateItem = TEMPLATE_LIBRARY[0]; // Template 01
  const template = JSON.parse(JSON.stringify(templateItem.template));
  // Ensure static background
  template.components.background = {
    x: 0, y: 0, width: 100, height: 100,
    type: 'solid',
    backgroundColor: '#0f172a'
  };

  const channel: Channel = {
    id: 'bench-ch',
    name: 'Benchmark Channel',
    branding: {
      colors: templateItem.branding.colors,
      typography: { headingFont: 'Montserrat, sans-serif', bodyFont: 'Be Vietnam Pro, sans-serif' },
      identity: { channelName: 'Benchmark', showLogo: false, showChannelName: false }
    }
  };

  const quiz: Quiz = {
    id: 'bench-q',
    title: 'BENCHMARK QUIZ',
    questions: [
      {
        id: 'q1',
        text: 'Thủ đô của Việt Nam là thành phố nào?',
        options: {
          A: 'Hà Nội',
          B: 'Đà Nẵng',
          C: 'TP. Hồ Chí Minh'
        },
        correctAnswer: 'A',
        explanation: 'Hà Nội là thủ đô của Việt Nam từ năm 1976.'
      }
    ]
  };

  const totalFrames = 150; // 5 seconds at 30 fps
  const cues: TimelineQuestionCue[] = [
    {
      questionIndex: 0,
      startFrame: 0,
      endFrame: 150,
      durationFrames: 150,
      phases: {
        introStart: 0,
        questionTtsStart: 0,
        questionTtsEnd: 50,
        countdownStart: 50,
        countdownEnd: 110,
        revealStart: 110,
        explanationTtsStart: 110,
        explanationTtsEnd: 150
      },
      audioCues: []
    }
  ];

  console.log('=== STARTING BENCHMARK (BEFORE OPTIMIZATION) ===');
  console.log(`Resolution: 720x1280, FPS: 30, Frames: ${totalFrames}, Background: Solid Static`);
  const startTime = Date.now();

  await NativeQuizRenderer.renderVideo({
    channel,
    template,
    quiz,
    cues,
    totalDurationFrames: totalFrames,
    fps: 30,
    width: 720,
    height: 1280,
    outputPath,
    presetConfig: RENDER_PRESETS.standard,
    nvencEnabled: false
  });

  const totalElapsed = (Date.now() - startTime) / 1000;
  const avgFps = (totalFrames / totalElapsed).toFixed(2);
  console.log('=== BENCHMARK RESULT (BEFORE) ===');
  console.log(`Total time: ${totalElapsed.toFixed(3)}s`);
  console.log(`Average FPS: ${avgFps}`);
  console.log(`File size: ${fs.statSync(outputPath).size} bytes`);
}

runBenchmark().catch(err => {
  console.error('Benchmark error:', err);
  process.exit(1);
});
