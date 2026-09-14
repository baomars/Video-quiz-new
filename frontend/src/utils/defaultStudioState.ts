import {
  Channel,
  Quiz,
  VideoTemplate,
  TimelineQuestionCue
} from '../../../remotion/types/index';

export const DEFAULT_FALLBACK_TEMPLATE: VideoTemplate = {
  id: 'split-modern',
  name: 'A2 — Trẻ Trung Tươi Sáng (Vibrant Light)',
  layoutType: 'split-modern',
  illustrationLayout: 'single',
  answerLayout: 'vertical-list',
  countdownStyle: 'circle-radial',
  transitionType: 'slide',
  timing: {
    countdownSeconds: 5,
    revealSeconds: 2.5,
    transitionFrames: 15,
    endBufferSeconds: 2.5
  },
  components: {
    background: {
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      type: 'image',
      backgroundColor: '#fffbeb',
      secondaryColor: '#fef3c7',
      gradientAngle: 135,
      opacity: 1,
      imageUrl: '/assets/backgrounds/bg_modern_geometric.svg',
      motion: {
        enabled: true,
        effects: ['zoom-in'],
        intensity: 20,
        zoomScale: 1.15,
        speed: 1.0,
        aiWatermarkZoom: true
      }
    },
    header: {
      x: 7,
      y: 4,
      width: 86,
      height: 5,
      fontSize: 20,
      fontWeight: '800',
      color: '#0f172a',
      backgroundColor: '#ffffff',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: '#fde68a',
      padding: 8,
      textAlign: 'center',
      horizontalAlign: 'center',
      verticalAlign: 'center',
      badgeStyle: true,
      animation: 'slide-up'
    },
    quizTitle: {
      x: 7,
      y: 7,
      width: 86,
      height: 6,
      fontSize: 24,
      fontWeight: '900',
      color: '#b45309',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: '#fde68a',
      padding: 8,
      textAlign: 'center',
      horizontalAlign: 'center',
      verticalAlign: 'center',
      badgeStyle: true,
      enabled: true,
      text: 'Kiến Thức Tổng Hợp Vui'
    },
    questionNumber: {
      x: 10,
      y: 15,
      width: 80,
      height: 4,
      fontSize: 20,
      fontWeight: '800',
      color: '#d97706',
      textAlign: 'center',
      horizontalAlign: 'center',
      format: 'câu-n'
    },
    illustration: {
      x: 11,
      y: 19,
      width: 78,
      height: 24,
      borderRadius: 18,
      borderWidth: 2,
      borderColor: '#fef08a',
      boxShadow: '0 8px 24px rgba(217, 119, 6, 0.12)',
      objectFit: 'contain',
      zoomEffect: true,
      animation: 'pop',
      paddingFrame: 6
    },
    questionBox: {
      x: 8,
      y: 45,
      width: 84,
      height: 15,
      fontSize: 24,
      fontWeight: '800',
      color: '#0f172a',
      backgroundColor: '#ffffff',
      bgOpacity: 0.92,
      backdropBlur: 14,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: '#38bdf8',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
      glowRadius: 12,
      glowColor: 'rgba(56, 189, 248, 0.35)',
      padding: 16,
      textAlign: 'center',
      horizontalAlign: 'center',
      verticalAlign: 'center',
      lineHeight: 1.35,
      animation: 'scale-in',
      glassmorphism: true
    },
    answerButtons: {
      x: 8,
      y: 62,
      width: 84,
      height: 23,
      fontSize: 20,
      fontWeight: '700',
      color: '#0f172a',
      backgroundColor: '#ffffff',
      bgOpacity: 0.88,
      backdropBlur: 12,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: '#94a3b8',
      boxShadow: '0 4px 18px rgba(0, 0, 0, 0.12)',
      glowRadius: 8,
      glowColor: 'rgba(148, 163, 184, 0.3)',
      padding: 12,
      textAlign: 'left',
      gap: 10,
      optionBadgeShape: 'circle',
      animation: 'slide-up'
    },
    countdown: {
      x: 40,
      y: 85.5,
      width: 20,
      height: 4,
      color: '#d97706',
      backgroundColor: '#fef3c7',
      fontSize: 20,
      fontWeight: '900',
      showMiliseconds: false,
      soundEnabled: true,
      style: 'circle-radial',
      horizontalAlign: 'center'
    },
    logo: {
      x: 8,
      y: 8,
      width: 14,
      height: 5,
      opacity: 0.85,
      watermark: false
    }
  }
};

export const DEFAULT_FALLBACK_CHANNEL: Channel = {
  id: 'channel_tech_pulse',
  name: 'Thế Giới Công Nghệ (Vibrant Youth)',
  description: 'Kênh công nghệ khám phá phong cách tươi sáng, năng động và bắt mắt.',
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
  branding: {
    identity: {
      channelName: 'TECH VIBRANT',
      description: 'Đột phá công nghệ tương lai',
      avatarUrl: '/assets/default_avatar_cyber.svg',
      logoUrl: '/assets/default_logo_cyber.svg',
      watermarkUrl: '',
      watermarkOpacity: 0.85,
      watermarkPosition: 'top-right',
      showWatermark: true
    },
    colors: {
      primary: '#d97706',
      secondary: '#fffbeb',
      accent: '#0284c7',
      background: '#fffbeb',
      cardBg: '#ffffff',
      text: '#0f172a',
      textMuted: '#64748b',
      correct: '#16a34a',
      wrong: '#dc2626',
      buttonBg: '#ffffff',
      border: '#fde68a'
    },
    fonts: {
      primary: 'Montserrat',
      secondary: 'Noto Sans',
      headingWeight: '800',
      bodyWeight: '600'
    },
    effects: {
      shadowStyle: 'glow',
      borderRadius: 20,
      glassmorphism: false
    }
  },
  languages: {
    vi: {
      language: 'vi',
      voice: 'vi-VN-HoaiMyNeural',
      rate: '+0%',
      pitch: '+0Hz',
      volume: '+0%',
      readOptions: false,
      introScript: 'Chào mừng các bạn đến với thử thách công nghệ!',
      outroScript: 'Nhớ follow kênh để cập nhật xu hướng AI mỗi ngày!',
      revealScript: 'Đáp án chính xác là'
    },
    en: {
      language: 'en',
      voice: 'en-US-JennyNeural',
      rate: '+0%',
      pitch: '+0Hz',
      volume: '+0%',
      readOptions: false,
      introScript: 'Welcome to the tech and AI challenge!',
      outroScript: 'Follow us for daily high-tech insights!',
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
  activeTemplateId: 'split-modern',
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