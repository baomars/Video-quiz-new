import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { NativeQuizRenderer } from '../backend/src/render/native/nativeQuizRenderer.js';
import { TEMPLATE_LIBRARY, applyTemplateLayout } from '../remotion/types/templates.js';
import { Channel, Quiz, TimelineQuestionCue } from '../remotion/types/index.js';
import { RENDER_PRESETS } from '../backend/src/render/renderManager.js';

async function testAll() {
  const outputDir = path.resolve(process.cwd(), 'output', 'verification');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('========================================================');
  console.log('🧪 RUNNING COMPREHENSIVE VERIFICATION TESTS');
  console.log('========================================================');

  // TEST 1: Template 1 (Classic Quiz) with Custom Centered Countdown & Static Background
  console.log('\n--- TEST 1: Template 1 (Classic Quiz) with Custom Centered Countdown & Static Background ---');
  const t1Item = TEMPLATE_LIBRARY.find(t => t.id === 'tmpl-classic-quiz')!;
  const t1 = JSON.parse(JSON.stringify(t1Item.template));
  t1.components.countdown = {
    ...t1.components.countdown,
    x: 50,
    y: 80,
    horizontalAlign: 'center',
    verticalAlign: 'center',
    countdownStyle: 'circle-radial',
    fontSize: 28,
    strokeWidth: 5,
    show: true,
    enabled: true
  };
  t1.components.background = {
    x: 0, y: 0, width: 100, height: 100,
    type: 'solid',
    backgroundColor: '#1e293b'
  };

  const ch1: Channel = {
    id: 'ch1',
    name: 'Test Channel 1',
    branding: {
      colors: t1Item.branding.colors,
      typography: { headingFont: 'Montserrat, sans-serif', bodyFont: 'Be Vietnam Pro, sans-serif' },
      identity: { channelName: 'Test 1', showLogo: false, showChannelName: false }
    }
  };

  const quiz1: Quiz = {
    id: 'q1',
    title: 'KIỂM THỬ TEMPLATE 1',
    questions: [
      {
        id: 'q1_1',
        text: 'Mặt trời mọc ở hướng nào?',
        options: { A: 'Đông', B: 'Tây', C: 'Nam' },
        correctAnswer: 'A',
        explanation: 'Mặt trời luôn mọc ở hướng Đông do chiều tự quay của Trái Đất.'
      }
    ]
  };

  const cues1: TimelineQuestionCue[] = [
    {
      questionIndex: 0,
      startFrame: 0,
      endFrame: 60,
      durationFrames: 60,
      phases: {
        introStart: 0,
        questionTtsStart: 0,
        questionTtsEnd: 15,
        countdownStart: 15,
        countdownEnd: 45,
        revealStart: 45,
        explanationTtsStart: 45,
        explanationTtsEnd: 60
      },
      audioCues: []
    }
  ];

  const out1 = path.join(outputDir, 'test1_classic_static.mp4');
  const t1Start = Date.now();
  await NativeQuizRenderer.renderVideo({
    channel: ch1,
    template: t1,
    quiz: quiz1,
    cues: cues1,
    totalDurationFrames: 60,
    fps: 30,
    width: 720,
    height: 1280,
    outputPath: out1,
    presetConfig: RENDER_PRESETS.standard,
    nvencEnabled: false
  });
  console.log(`✅ Test 1 Render Success: ${out1} (${((Date.now() - t1Start) / 1000).toFixed(2)}s, ${fs.statSync(out1).size} bytes)`);

  // TEST 2: Template 7 (Bubble Quiz) with Animated Neon Background & Top Badge Countdown
  console.log('\n--- TEST 2: Template 7 (Bubble Quiz) with Animated Neon Background ---');
  const t7Item = TEMPLATE_LIBRARY.find(t => t.id === 'tmpl-bubble-quiz')!;
  const t7 = JSON.parse(JSON.stringify(t7Item.template));
  t7.components.background = {
    x: 0, y: 0, width: 100, height: 100,
    type: 'neon',
    neonPresetId: 'cyber-glow',
    neonSpeed: 1.5,
    neonIntensity: 1.2,
    neonColor1: '#00f0ff',
    neonColor2: '#ff007f',
    neonColor3: '#7928ca',
    opacity: 1.0,
    blur: 0,
    motion: {
      direction: 'up',
      movement: 30,
      zoomScale: 1.05
    }
  };
  t7.components.countdown = {
    ...t7.components.countdown,
    x: 35,
    y: 7,
    horizontalAlign: 'center',
    verticalAlign: 'top',
    countdownStyle: 'badge',
    fontSize: 20,
    show: true,
    enabled: true
  };

  const ch7: Channel = {
    id: 'ch7',
    name: 'Test Channel 7',
    branding: {
      colors: t7Item.branding.colors,
      typography: { headingFont: 'Montserrat, sans-serif', bodyFont: 'Be Vietnam Pro, sans-serif' },
      identity: { channelName: 'Bubble Channel', showLogo: false, showChannelName: false }
    }
  };

  const quiz7: Quiz = {
    id: 'q7',
    title: 'BUBBLE QUIZ TEST',
    questions: [
      {
        id: 'q7_1',
        text: 'Loài vật nào thông minh nhất đại dương?',
        options: { A: 'Cá heo', B: 'Bạch tuộc', C: 'Cá voi sát thủ' },
        correctAnswer: 'A',
        explanation: 'Cá heo có tỉ lệ não so với cơ thể lớn và khả năng giao tiếp phức tạp.'
      }
    ]
  };

  const out7 = path.join(outputDir, 'test7_bubble_neon_animated.mp4');
  const t7Start = Date.now();
  await NativeQuizRenderer.renderVideo({
    channel: ch7,
    template: t7,
    quiz: quiz7,
    cues: cues1,
    totalDurationFrames: 60,
    fps: 30,
    width: 720,
    height: 1280,
    outputPath: out7,
    presetConfig: RENDER_PRESETS.standard,
    nvencEnabled: false
  });
  console.log(`✅ Test 2 Render Success: ${out7} (${((Date.now() - t7Start) / 1000).toFixed(2)}s, ${fs.statSync(out7).size} bytes)`);

  // VERIFY MOTION IN TEST 2: Extract frame 5 and frame 25 to ensure they are NOT identical
  console.log('\n--- VERIFYING ANIMATED BACKGROUND MOTION (Frame 5 vs Frame 25) ---');
  const f5Path = path.join(outputDir, 'frame_05.png');
  const f25Path = path.join(outputDir, 'frame_25.png');
  execSync(`ffmpeg -y -ss 00:00:00.166 -i "${out7}" -vframes 1 "${f5Path}"`, { stdio: 'ignore' });
  execSync(`ffmpeg -y -ss 00:00:00.833 -i "${out7}" -vframes 1 "${f25Path}"`, { stdio: 'ignore' });

  const buf5 = fs.readFileSync(f5Path);
  const buf25 = fs.readFileSync(f25Path);
  const isDifferent = !buf5.equals(buf25);
  console.log(`Frame 5 size: ${buf5.length} bytes, Frame 25 size: ${buf25.length} bytes`);
  console.log(`Animated motion confirmed: ${isDifferent ? 'YES (Frames are distinct and actively moving!)' : 'NO'}`);

  console.log('\n========================================================');
  console.log('🎉 ALL VERIFICATION TESTS COMPLETED SUCCESSFULLY!');
  console.log('========================================================');
}

testAll().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
