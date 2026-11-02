import { TimelineEngine } from '../backend/src/timeline/timelineEngine';
import { Quiz, Channel, VideoTemplate } from '../remotion/types';

const engine = new TimelineEngine(30);

const mockChannel: Channel = {
  id: 'test_ch',
  name: 'Test Channel',
  branding: { colors: { primary: '#2563eb' } },
  audio: {
    bgm: '/bgm.mp3',
    sfx: { tick: '/tick.wav', correct: '/correct.wav', transition: '/trans.wav' },
    volumes: { bgm: 0.2, tick: 0.8, correct: 1, transition: 0.6 }
  },
  languages: {
    vi: { voice: 'Hải Đăng', readQuestion: true, readOptions: false, readAnswer: true, revealScript: 'Đáp án là' }
  }
};

const mockQuiz: Quiz = {
  id: 'test_quiz',
  title: 'Quiz Demo',
  language: 'vi',
  questions: [
    {
      id: 'q1',
      question: 'Hà Nội là thủ đô của nước nào?',
      options: { A: 'Việt Nam', B: 'Lào', C: 'Campuchia' },
      correctAnswer: 'A',
      explanation: 'Hà Nội là thủ đô ngàn năm văn hiến.'
    },
    {
      id: 'q2',
      question: 'Núi cao nhất Việt Nam là?',
      options: { A: 'Fansipan', B: 'Bà Đen', C: 'Ngọc Linh' },
      correctAnswer: 'A',
      explanation: ''
    }
  ]
};

const baseTemplate: VideoTemplate = {
  id: 'tmpl-test',
  name: 'Test Template',
  layoutType: 'split-modern',
  illustrationLayout: 'single',
  answerLayout: 'vertical-list',
  countdownStyle: 'circle-radial',
  transitionType: 'zoom',
  timing: {
    countdownSeconds: 5,
    revealSeconds: 2.5,
    transitionFrames: 15,
    endBufferSeconds: 2.0
  },
  components: {
    answerButtons: { readTts: true },
    explanation: { enabled: true, readTts: true, displayDurationSec: 3.0 }
  }
};

const ttsMap = {
  q1: {
    questionUrl: '/q1.mp3',
    questionDuration: 3.0,
    revealUrl: '/ans1.mp3',
    revealDuration: 2.0,
    explanationUrl: '/exp1.mp3',
    explanationDuration: 3.5
  },
  q2: {
    questionUrl: '/q2.mp3',
    questionDuration: 2.5,
    revealUrl: '/ans2.mp3',
    revealDuration: 1.8
  }
};

console.log('--- TEST 1: Full Explanation with TTS ---');
const res1 = engine.computeTimeline(mockQuiz, mockChannel, baseTemplate, ttsMap);
engine.validateTimeline(mockQuiz, res1.cues, res1.totalDurationFrames, 2.0);
console.log('✅ Test 1 Passed! Total duration frames:', res1.totalDurationFrames);

console.log('--- TEST 2: Explanation Disabled (enabled: false) ---');
const tmplDisabled = {
  ...baseTemplate,
  components: {
    ...baseTemplate.components,
    explanation: { enabled: false, readTts: false, displayDurationSec: 3.0 }
  }
};
const res2 = engine.computeTimeline(mockQuiz, mockChannel, tmplDisabled, ttsMap);
engine.validateTimeline(mockQuiz, res2.cues, res2.totalDurationFrames, 2.0);
const q1Cue = res2.cues[0];
const answerTtsEnd = q1Cue.phases.answerTtsEnd!;
const revealEndBeforeTrans = q1Cue.endFrame - 15;
const diffFrames = revealEndBeforeTrans - answerTtsEnd;
console.log('Q1 answerTtsEnd:', answerTtsEnd, 'revealEndBeforeTrans:', revealEndBeforeTrans, 'Difference (frames):', diffFrames);
if (diffFrames > 10) {
  throw new Error('FAILED: Delay after answer is too long when explanation is disabled! Diff: ' + diffFrames);
}
console.log(`✅ Test 2 Passed! Immediate transition verified (delay is only ${diffFrames} frames = ${(diffFrames / 30).toFixed(2)}s)`);

console.log('--- TEST 3: Explanation readTts is OFF (enabled: true, readTts: false) ---');
const tmplNoTts = {
  ...baseTemplate,
  components: {
    ...baseTemplate.components,
    explanation: { enabled: true, readTts: false, displayDurationSec: 3.0 }
  }
};
const res3 = engine.computeTimeline(mockQuiz, mockChannel, tmplNoTts, ttsMap);
engine.validateTimeline(mockQuiz, res3.cues, res3.totalDurationFrames, 2.0);
const q1Cue3 = res3.cues[0];
const answerTtsEnd3 = q1Cue3.phases.answerTtsEnd!;
const revealEndBeforeTrans3 = q1Cue3.endFrame - 15;
const diffFrames3 = revealEndBeforeTrans3 - answerTtsEnd3;
console.log('Q1 answerTtsEnd:', answerTtsEnd3, 'revealEndBeforeTrans:', revealEndBeforeTrans3, 'Difference (frames):', diffFrames3);
if (diffFrames3 > 10) {
  throw new Error('FAILED: Delay after answer is too long when readTts is false! Diff: ' + diffFrames3);
}
console.log(`✅ Test 3 Passed! Immediate transition verified (delay is only ${diffFrames3} frames = ${(diffFrames3 / 30).toFixed(2)}s)`);

console.log('--- TEST 4: Question with Empty Explanation Text ---');
const res4 = engine.computeTimeline(mockQuiz, mockChannel, baseTemplate, ttsMap);
const q2Cue = res4.cues[1];
const answerTtsEnd4 = q2Cue.phases.answerTtsEnd!;
const revealEndBeforeBuffer = q2Cue.endFrame - Math.ceil(2.0 * 30);
const diffFrames4 = revealEndBeforeBuffer - answerTtsEnd4;
console.log('Q2 (no explanation) answerTtsEnd:', answerTtsEnd4, 'revealEndBeforeBuffer:', revealEndBeforeBuffer, 'Difference (frames):', diffFrames4);
if (diffFrames4 > 10) {
  throw new Error('FAILED: Delay after answer is too long when question explanation is empty! Diff: ' + diffFrames4);
}
console.log(`✅ Test 4 Passed! Immediate transition verified for question without explanation text (delay is only ${diffFrames4} frames = ${(diffFrames4 / 30).toFixed(2)}s)`);

console.log('\n--- TEST 5: Frontend computeLocalTimeline (No Explanation / readTts OFF) ---');
import { computeLocalTimeline } from '../frontend/src/utils/defaultStudioState';
const localRes = computeLocalTimeline(mockQuiz, mockChannel, tmplDisabled, 30);
const localQ1Cue = localRes.cues[0];
const localAnswerTtsEnd = localQ1Cue.phases.answerTtsEnd!;
const localRevealEndBeforeTrans = localQ1Cue.endFrame - 15;
const localDiff = localRevealEndBeforeTrans - localAnswerTtsEnd;
console.log('Local Q1 answerTtsEnd:', localAnswerTtsEnd, 'localRevealEndBeforeTrans:', localRevealEndBeforeTrans, 'Difference (frames):', localDiff);
if (localDiff > 10) {
  throw new Error('FAILED: Local timeline delay after answer is too long! Diff: ' + localDiff);
}
console.log(`✅ Test 5 Passed! Frontend local timeline immediate transition verified (delay is only ${localDiff} frames = ${(localDiff / 30).toFixed(2)}s)`);

console.log('\n========================================');
console.log('🎉 ALL EXPLANATION TIMING TESTS PASSED!');
console.log('========================================');
