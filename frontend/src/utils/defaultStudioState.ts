import {
  Channel,
  Quiz,
  VideoTemplate,
  TimelineQuestionCue
} from '../../../remotion/types/index';
import { TEMPLATE_LIBRARY } from '../../../remotion/types/templates';

const defaultTmplItem = TEMPLATE_LIBRARY.find(t => t.id === 'tmpl-gameshow-pop-sticker') || TEMPLATE_LIBRARY[0];
export const DEFAULT_FALLBACK_TEMPLATE: VideoTemplate = JSON.parse(JSON.stringify(defaultTmplItem.template));

export const DEFAULT_FALLBACK_CHANNEL: Channel = {
  id: 'channel_gameshow_pop',
  name: 'GameShow Pop (Default)',
  description: 'Kênh đố vui phong cách Neo-Brutalism & Sticker cực kỳ bắt mắt trên TikTok & Reels.',
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
  branding: {
    identity: {
      channelName: 'GAMESHOW POP',
      description: 'Đố vui phong cách triệu view',
      avatarUrl: '/assets/default_avatar_cyber.svg',
      logoUrl: '/assets/default_logo_cyber.svg',
      watermarkUrl: '',
      watermarkOpacity: 0.85,
      watermarkPosition: 'top-right',
      showWatermark: true
    },
    colors: {
      primary: '#facc15',
      secondary: '#f43f5e',
      accent: '#06b6d4',
      background: '#3b0764',
      cardBg: '#facc15',
      text: '#000000',
      textMuted: '#64748b',
      correct: '#22c55e',
      wrong: '#ef4444',
      buttonBg: '#ffffff',
      border: '#000000'
    },
    fonts: {
      primary: 'Montserrat, sans-serif',
      secondary: 'Be Vietnam Pro, sans-serif',
      headingWeight: '900',
      bodyWeight: '700'
    },
    effects: {
      shadowStyle: 'glow',
      borderRadius: 14,
      glassmorphism: false
    }
  },
  languages: {
    vi: {
      language: 'vi',
      voice: 'Hải Đăng',
      rate: '+0%',
      pitch: '+0Hz',
      volume: '+0%',
      readOptions: false,
      introScript: 'Chào mừng các bạn đến với thử thách đố vui!',
      outroScript: 'Nhớ follow kênh để đón xem câu đố tiếp theo!',
      revealScript: 'Đáp án chính xác là'
    },
    en: {
      language: 'en',
      voice: 'en-US-Jenny',
      rate: '+0%',
      pitch: '+0Hz',
      volume: '+0%',
      readOptions: false,
      introScript: 'Welcome to the pop trivia challenge!',
      outroScript: 'Follow for more daily fun quizzes!',
      revealScript: 'The correct answer is'
    }
  },
  audio: {
    bgmTrack: '/assets/audio/bgm/bgm_cyber_upbeat.mp3',
    bgmVolume: 0.22,
    duckingIntensity: 0.15,
    sfx: {
      tick: '/assets/audio/sfx/tick.wav',
      finish: '/assets/audio/sfx/finish.wav',
      reveal: '/assets/audio/sfx/reveal.wav',
      correct: '/assets/audio/sfx/correct.wav',
      transition: '/assets/audio/sfx/transition.wav'
    },
    volumes: {
      tick: 0.6,
      finish: 0.8,
      reveal: 0.9,
      correct: 1.0,
      transition: 0.5
    }
  },
  activeTemplateId: 'tmpl-gameshow-pop-sticker',
  templates: [DEFAULT_FALLBACK_TEMPLATE]
};

export const DEFAULT_FALLBACK_QUIZ: Quiz = {
  id: 'quiz_tech_01',
  title: 'Kiến Thức Tổng Hợp Vui',
  language: 'vi',
  channelId: 'channel_tech_pulse',
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
  questions: [
    {
      id: 'q_vi_1',
      question: 'Thủ đô của Việt Nam là gì?',
      options: {
        A: 'TP. Hồ Chí Minh',
        B: 'Hà Nội',
        C: 'Đà Nẵng'
      },
      correctAnswer: 'B',
      explanation: 'Hà Nội là thủ đô của Việt Nam từ năm 1976.',
      illustrations: ['/assets/sample_images/eiffel_tower.svg']
    },
    {
      id: 'q_vi_2',
      question: 'Đỉnh núi nào cao nhất Việt Nam?',
      options: {
        A: 'Fansipan',
        B: 'Bạch Mộc Lương Tử',
        C: 'Pu Si Lung'
      },
      correctAnswer: 'A',
      explanation: 'Fansipan cao 3.143m, được mệnh danh là nóc nhà Đông Dương.',
      illustrations: ['/assets/sample_images/pyramids.svg']
    }
  ]
};

export function computeLocalTimeline(
  quiz: Quiz,
  channel: Channel,
  template: VideoTemplate,
  fps: number = 30
): { totalDurationFrames: number; cues: TimelineQuestionCue[] } {
  const cues: TimelineQuestionCue[] = [];
  let currentFrame = 0;

  const countdownSec = template?.timing?.countdownSeconds ?? 5;
  const revealSec = template?.timing?.revealSeconds ?? 2.5;
  const transitionFrames = template?.timing?.transitionFrames ?? 15;
  const endBufferFrames = Math.round((template?.timing?.endBufferSeconds ?? 2.5) * fps);

  const questions = quiz?.questions && quiz.questions.length > 0 ? quiz.questions : DEFAULT_FALLBACK_QUIZ.questions;

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const qStartFrame = currentFrame;

    // Estimated speech duration: ~3.0s for question
    const qDurationSec = q.durations?.questionTts || 3.0;
    const qFrames = Math.ceil(qDurationSec * fps);
    const questionTtsStart = currentFrame;
    const questionTtsEnd = questionTtsStart + qFrames;
    currentFrame += qFrames;

    // Countdown phase
    const countdownStart = currentFrame;
    const countdownEnd = countdownStart + Math.ceil(countdownSec * fps);
    currentFrame = countdownEnd;

    // Reveal phase: ~2.5s
    const revealDurationSec = q.durations?.explanationTts || revealSec;
    const revealStart = currentFrame;
    const revealEnd = revealStart + Math.ceil(revealDurationSec * fps);
    currentFrame = revealEnd;

    // Transition phase
    let transitionStart: number | undefined;
    let transitionEnd: number | undefined;
    if (i < questions.length - 1) {
      transitionStart = currentFrame;
      transitionEnd = transitionStart + transitionFrames;
      currentFrame = transitionEnd;
    }

    const cueDurationFrames = currentFrame - qStartFrame;

    cues.push({
      questionIndex: i,
      startFrame: qStartFrame,
      endFrame: currentFrame,
      durationFrames: cueDurationFrames,
      phases: {
        introStart: qStartFrame,
        questionTtsStart,
        questionTtsEnd,
        countdownStart,
        countdownEnd,
        revealStart,
        explanationTtsStart: revealStart,
        explanationTtsEnd: revealEnd
      },
      audioCues: []
    });
  }

  const totalDurationFrames = currentFrame + endBufferFrames;
  return { totalDurationFrames, cues };
}