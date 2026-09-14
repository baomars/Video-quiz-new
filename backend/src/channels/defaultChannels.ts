import { Channel, VideoTemplate } from '../../../remotion/types/index.js';

export const defaultTemplates: Record<string, VideoTemplate> = {
  'classic-stacked': {
    id: 'classic-stacked',
    name: 'A1 — Sáng Chuẩn (Classic Light)',
    layoutType: 'classic-stacked',
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
        type: 'gradient',
        backgroundColor: '#ffffff',
        secondaryColor: '#eff6ff',
        gradientAngle: 180,
        opacity: 1
      },
      header: {
        x: 7,
        y: 8, // Below top safe zone (~100px)
        width: 86,
        height: 6,
        fontSize: 26,
        fontWeight: '800',
        color: '#1e3a8a',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#bfdbfe',
        boxShadow: '0 4px 14px rgba(37, 99, 235, 0.1)',
        padding: 10,
        textAlign: 'center',
        horizontalAlign: 'center',
        verticalAlign: 'center',
        badgeStyle: true,
        animation: 'slide-up'
      },
      questionNumber: {
        x: 10,
        y: 15,
        width: 80,
        height: 4,
        fontSize: 20,
        fontWeight: '700',
        color: '#2563eb',
        textAlign: 'center',
        horizontalAlign: 'center',
        format: 'câu-n'
      },
      illustration: {
        x: 8,
        y: 20,
        width: 84,
        height: 25,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#93c5fd',
        boxShadow: '0 12px 28px rgba(0, 0, 0, 0.08)',
        backgroundColor: '#f8fafc',
        objectFit: 'cover',
        zoomEffect: true,
        paddingFrame: 0,
        horizontalAlign: 'center',
        verticalAlign: 'center',
        animation: 'scale-in'
      },
      questionBox: {
        x: 6,
        y: 47,
        width: 88,
        height: 14,
        fontSize: 28,
        fontWeight: '800',
        color: '#0f172a',
        backgroundColor: '#ffffff',
        borderRadius: 18,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.06)',
        padding: 16,
        textAlign: 'center',
        horizontalAlign: 'center',
        verticalAlign: 'center',
        lineHeight: 1.35,
        glassmorphism: false,
        animation: 'pop'
      },
      answerButtons: {
        x: 6,
        y: 63,
        width: 88,
        height: 20, // 3 options vertically
        fontSize: 24,
        fontWeight: '700',
        color: '#1e293b',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
        padding: 12,
        gap: 12,
        horizontalAlign: 'center',
        verticalAlign: 'center',
        textAlign: 'left',
        optionBadgeShape: 'circle',
        animation: 'slide-up'
      },
      countdown: {
        x: 40,
        y: 84,
        width: 20,
        height: 6,
        color: '#2563eb',
        backgroundColor: 'transparent',
        borderRadius: 10,
        strokeWidth: 6,
        fontSize: 28,
        showSeconds: true,
        horizontalAlign: 'center'
      },
      logo: {
        x: 75,
        y: 8,
        width: 16,
        height: 6,
        opacity: 0.95,
        watermark: false
      }
    }
  },

  'split-modern': {
    id: 'split-modern',
    name: 'A2 — Trẻ Trung Tươi Sáng (Vibrant Light)',
    layoutType: 'split-modern',
    illustrationLayout: 'split-2-horizontal',
    answerLayout: 'vertical-list',
    countdownStyle: 'circle-radial',
    transitionType: 'zoom',
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
        type: 'mesh',
        backgroundColor: '#fffbeb',
        secondaryColor: '#fef3c7',
        gradientAngle: 135,
        opacity: 1
      },
      header: {
        x: 7,
        y: 8,
        width: 60,
        height: 6,
        fontSize: 24,
        fontWeight: '800',
        color: '#b45309',
        backgroundColor: '#ffffff',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#fde68a',
        boxShadow: '0 4px 12px rgba(217, 119, 6, 0.1)',
        padding: 8,
        textAlign: 'left',
        horizontalAlign: 'left',
        verticalAlign: 'center',
        badgeStyle: true,
        animation: 'slide-up'
      },
      questionNumber: {
        x: 7,
        y: 15,
        width: 86,
        height: 4,
        fontSize: 20,
        fontWeight: '700',
        color: '#d97706',
        textAlign: 'left',
        horizontalAlign: 'left',
        format: 'q-n'
      },
      illustration: {
        x: 7,
        y: 20,
        width: 86,
        height: 24,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: '#fcd34d',
        boxShadow: '0 8px 24px rgba(217, 119, 6, 0.12)',
        backgroundColor: '#ffffff',
        objectFit: 'cover',
        zoomEffect: false,
        paddingFrame: 3,
        horizontalAlign: 'center',
        verticalAlign: 'center',
        animation: 'fade'
      },
      questionBox: {
        x: 7,
        y: 46,
        width: 86,
        height: 14,
        fontSize: 27,
        fontWeight: '800',
        color: '#1e293b',
        backgroundColor: '#ffffff',
        borderRadius: 18,
        borderWidth: 2,
        borderColor: '#fde68a',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.05)',
        padding: 16,
        textAlign: 'center',
        horizontalAlign: 'center',
        verticalAlign: 'center',
        lineHeight: 1.35,
        glassmorphism: false,
        animation: 'pop'
      },
      answerButtons: {
        x: 7,
        y: 62,
        width: 86,
        height: 21,
        fontSize: 23,
        fontWeight: '700',
        color: '#1e293b',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
        padding: 12,
        gap: 10,
        horizontalAlign: 'center',
        verticalAlign: 'center',
        textAlign: 'left',
        optionBadgeShape: 'square',
        animation: 'pop'
      },
      countdown: {
        x: 73,
        y: 8,
        width: 20,
        height: 6,
        color: '#d97706',
        backgroundColor: 'transparent',
        strokeWidth: 6,
        fontSize: 22,
        fontWeight: '800',
        showSeconds: true,
        horizontalAlign: 'right'
      },
      logo: {
        x: 7,
        y: 85,
        width: 20,
        height: 4,
        opacity: 0.8,
        watermark: true
      }
    }
  },

  'image-focus': {
    id: 'image-focus',
    name: 'A3 — Tối Giản Hiện Đại (Pastel Clean)',
    layoutType: 'image-focus',
    illustrationLayout: 'single',
    answerLayout: 'compact-pills',
    countdownStyle: 'pill-timer',
    transitionType: 'wipe',
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
        type: 'gradient',
        backgroundColor: '#faf5ff',
        secondaryColor: '#f3e8ff',
        gradientAngle: 180,
        opacity: 1
      },
      header: {
        x: 7,
        y: 8,
        width: 86,
        height: 6,
        fontSize: 25,
        fontWeight: '800',
        color: '#6b21a8',
        backgroundColor: '#ffffff',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#e9d5ff',
        boxShadow: '0 4px 15px rgba(147, 51, 234, 0.08)',
        padding: 8,
        textAlign: 'center',
        horizontalAlign: 'center',
        verticalAlign: 'center',
        badgeStyle: true,
        animation: 'slide-up'
      },
      questionNumber: {
        x: 35,
        y: 15,
        width: 30,
        height: 3.5,
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
        backgroundColor: '#7c3aed',
        borderRadius: 20,
        textAlign: 'center',
        horizontalAlign: 'center',
        format: 'badge'
      },
      illustration: {
        x: 8,
        y: 20,
        width: 84,
        height: 25,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: '#d8b4fe',
        boxShadow: '0 10px 25px rgba(124, 58, 237, 0.1)',
        backgroundColor: '#ffffff',
        objectFit: 'cover',
        zoomEffect: true,
        paddingFrame: 0,
        horizontalAlign: 'center',
        verticalAlign: 'center',
        animation: 'scale-in'
      },
      questionBox: {
        x: 7,
        y: 47,
        width: 86,
        height: 14,
        fontSize: 26,
        fontWeight: '800',
        color: '#1e1b4b',
        backgroundColor: '#ffffff',
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#e9d5ff',
        boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
        padding: 14,
        textAlign: 'center',
        horizontalAlign: 'center',
        verticalAlign: 'center',
        lineHeight: 1.35,
        glassmorphism: false,
        animation: 'pop'
      },
      answerButtons: {
        x: 7,
        y: 63,
        width: 86,
        height: 20,
        fontSize: 22,
        fontWeight: '700',
        color: '#1e1b4b',
        backgroundColor: '#ffffff',
        borderRadius: 25,
        borderWidth: 2,
        borderColor: '#e9d5ff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
        padding: 12,
        gap: 10,
        horizontalAlign: 'center',
        verticalAlign: 'center',
        textAlign: 'left',
        optionBadgeShape: 'pill',
        animation: 'slide-up'
      },
      countdown: {
        x: 35,
        y: 85,
        width: 30,
        height: 4.5,
        color: '#7c3aed',
        backgroundColor: '#ffffff',
        borderRadius: 25,
        fontSize: 20,
        fontWeight: '800',
        strokeWidth: 3,
        showSeconds: true,
        horizontalAlign: 'center'
      },
      logo: {
        x: 8,
        y: 8,
        width: 12,
        height: 5,
        opacity: 0.9,
        watermark: false
      }
    }
  },

  'minimal-clean': {
    id: 'minimal-clean',
    name: 'A4 — Tối Giản Tinh Tế (Minimal Clean)',
    layoutType: 'classic-stacked',
    illustrationLayout: 'single',
    answerLayout: 'vertical-list',
    countdownStyle: 'circle-radial',
    transitionType: 'fade',
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
        type: 'solid',
        backgroundColor: '#f8fafc',
        opacity: 1
      },
      header: {
        x: 10,
        y: 8,
        width: 80,
        height: 5,
        fontSize: 22,
        fontWeight: '700',
        color: '#334155',
        backgroundColor: 'transparent',
        textAlign: 'center',
        horizontalAlign: 'center',
        verticalAlign: 'center',
        animation: 'fade'
      },
      questionNumber: {
        x: 10,
        y: 15,
        width: 80,
        height: 4,
        fontSize: 18,
        fontWeight: '600',
        color: '#64748b',
        textAlign: 'center',
        horizontalAlign: 'center',
        format: 'n-total'
      },
      illustration: {
        x: 10,
        y: 20,
        width: 80,
        height: 25,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        boxShadow: 'none',
        backgroundColor: '#f1f5f9',
        objectFit: 'cover',
        zoomEffect: false,
        paddingFrame: 0,
        horizontalAlign: 'center',
        verticalAlign: 'center',
        animation: 'fade'
      },
      questionBox: {
        x: 8,
        y: 47,
        width: 84,
        height: 14,
        fontSize: 26,
        fontWeight: '700',
        color: '#0f172a',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        padding: 14,
        textAlign: 'center',
        horizontalAlign: 'center',
        verticalAlign: 'center',
        lineHeight: 1.35,
        glassmorphism: false,
        animation: 'fade'
      },
      answerButtons: {
        x: 8,
        y: 63,
        width: 84,
        height: 20,
        fontSize: 22,
        fontWeight: '600',
        color: '#334155',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
        padding: 12,
        gap: 10,
        horizontalAlign: 'center',
        verticalAlign: 'center',
        textAlign: 'left',
        optionBadgeShape: 'circle',
        animation: 'slide-up'
      },
      countdown: {
        x: 40,
        y: 84,
        width: 20,
        height: 6,
        color: '#0f172a',
        backgroundColor: 'transparent',
        borderRadius: 8,
        strokeWidth: 5,
        fontSize: 26,
        showSeconds: true,
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
  }
};

export const defaultChannels: Channel[] = [
  {
    id: 'channel_trivia_master',
    name: 'Kiến Thức Tươi Sáng (Knowledge Bright)',
    description: 'Kênh câu đố kiến thức tổng hợp giao diện Light tươi sáng, sạch sẽ và hiện đại.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    branding: {
      identity: {
        channelName: 'KIẾN THỨC MỖI NGÀY',
        description: 'Khám phá điều kỳ diệu quanh ta',
        avatarUrl: '/assets/default_avatar_gold.svg',
        logoUrl: '/assets/default_logo_gold.svg',
        watermarkUrl: '',
        watermarkOpacity: 0.85,
        watermarkPosition: 'top-right',
        showWatermark: true
      },
      colors: {
        primary: '#2563eb', // Vibrant Blue
        secondary: '#eff6ff',
        accent: '#f59e0b',
        background: '#ffffff',
        cardBg: '#ffffff',
        text: '#0f172a',
        textMuted: '#64748b',
        correct: '#16a34a', // Fresh Green
        wrong: '#dc2626',
        buttonBg: '#ffffff',
        border: '#e2e8f0'
      },
      fonts: {
        primary: 'Be Vietnam Pro',
        secondary: 'Noto Sans',
        headingWeight: '800',
        bodyWeight: '600'
      },
      effects: {
        shadowStyle: 'subtle',
        borderRadius: 18,
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
        introScript: 'Chào mừng các bạn đến với thử thách kiến thức hôm nay!',
        outroScript: 'Đừng quên bấm theo dõi để cùng thử tài mỗi ngày nhé!',
        revealScript: 'Đáp án chính xác là'
      },
      en: {
        language: 'en',
        voice: 'en-US-JennyNeural',
        rate: '+0%',
        pitch: '+0Hz',
        volume: '+0%',
        readOptions: false,
        introScript: 'Welcome to today knowledge quiz challenge!',
        outroScript: 'Like and subscribe for more fun daily quizzes!',
        revealScript: 'The correct answer is'
      }
    },
    audio: {
      bgmTrack: '/assets/audio/bgm/bgm_trivia_energetic.mp3',
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
    activeTemplateId: 'classic-stacked',
    templates: [
      defaultTemplates['classic-stacked'],
      defaultTemplates['split-modern'],
      defaultTemplates['image-focus'],
      defaultTemplates['minimal-clean']
    ]
  },

  {
    id: 'channel_tech_pulse',
    name: 'Thế Giới Công Nghệ (Vibrant Youth)',
    description: 'Kênh công nghệ khám phá phong cách tươi sáng, năng động và bắt mắt.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
        primary: '#d97706', // Vibrant Amber
        secondary: '#fffbeb',
        accent: '#0284c7',
        background: '#fffbeb',
        cardBg: '#ffffff',
        text: '#1e293b',
        textMuted: '#64748b',
        correct: '#15803d',
        wrong: '#e11d48',
        buttonBg: '#ffffff',
        border: '#fde68a'
      },
      fonts: {
        primary: 'Be Vietnam Pro',
        secondary: 'Noto Sans',
        headingWeight: '800',
        bodyWeight: '600'
      },
      effects: {
        shadowStyle: 'subtle',
        borderRadius: 16,
        glassmorphism: false
      }
    },
    languages: {
      vi: {
        language: 'vi',
        voice: 'vi-VN-NamMinhNeural',
        rate: '+5%',
        pitch: '+0Hz',
        volume: '+0%',
        readOptions: false,
        introScript: 'Chào các bạn! Cùng kiểm tra kiến thức công nghệ nhé.',
        outroScript: 'Đăng ký kênh để đón xem câu đố công nghệ mới nhất!',
        revealScript: 'Chính xác! Đáp án là'
      },
      en: {
        language: 'en',
        voice: 'en-US-GuyNeural',
        rate: '+5%',
        pitch: '+0Hz',
        volume: '+0%',
        readOptions: false,
        introScript: 'Hello tech lovers! Test your tech knowledge today.',
        outroScript: 'Subscribe for daily cutting edge quizzes!',
        revealScript: 'Bingo! The correct choice is'
      }
    },
    audio: {
      bgmTrack: '/assets/audio/bgm/bgm_mystery_suspense.mp3',
      bgmVolume: 0.25,
      duckingIntensity: 0.2,
      sfx: {
        tick: '/assets/audio/sfx/tick.wav',
        finish: '/assets/audio/sfx/finish.wav',
        reveal: '/assets/audio/sfx/reveal.wav',
        correct: '/assets/audio/sfx/correct.wav',
        transition: '/assets/audio/sfx/transition.wav'
      },
      volumes: {
        tick: 0.7,
        finish: 0.85,
        reveal: 0.95,
        correct: 1.0,
        transition: 0.6
      }
    },
    activeTemplateId: 'split-modern',
    templates: [
      defaultTemplates['split-modern'],
      defaultTemplates['classic-stacked'],
      defaultTemplates['image-focus'],
      defaultTemplates['minimal-clean']
    ]
  },

  {
    id: 'channel_visual_mystery',
    name: 'Đố Vui Tinh Mắt (Pastel Clean)',
    description: 'Kênh đố vui hình ảnh phong cách pastel sáng, thanh lịch và cuốn hút.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    branding: {
      identity: {
        channelName: 'ĐỐ VUI TINH MẮT',
        description: 'Nhìn hình đoán vật - Thử tài tinh mắt',
        avatarUrl: '/assets/default_avatar_red.svg',
        logoUrl: '/assets/default_logo_red.svg',
        watermarkUrl: '',
        watermarkOpacity: 0.85,
        watermarkPosition: 'top-left',
        showWatermark: true
      },
      colors: {
        primary: '#7c3aed', // Purple Violet
        secondary: '#faf5ff',
        accent: '#db2777',
        background: '#faf5ff',
        cardBg: '#ffffff',
        text: '#1e1b4b',
        textMuted: '#6b7280',
        correct: '#16a34a',
        wrong: '#e11d48',
        buttonBg: '#ffffff',
        border: '#e9d5ff'
      },
      fonts: {
        primary: 'Be Vietnam Pro',
        secondary: 'Noto Sans',
        headingWeight: '800',
        bodyWeight: '600'
      },
      effects: {
        shadowStyle: 'subtle',
        borderRadius: 20,
        glassmorphism: false
      }
    },
    languages: {
      vi: {
        language: 'vi',
        voice: 'vi-VN-HoaiMyNeural',
        rate: '+5%',
        pitch: '+0Hz',
        volume: '+0%',
        readOptions: false,
        introScript: 'Thử tài tinh mắt cùng câu hỏi thú vị sau đây!',
        outroScript: 'Bạn trả lời đúng mấy câu? Để lại bình luận nhé!',
        revealScript: 'Đáp án là'
      },
      en: {
        language: 'en',
        voice: 'en-US-JennyNeural',
        rate: '+5%',
        pitch: '+0Hz',
        volume: '+0%',
        readOptions: false,
        introScript: 'Test your eyes with today fun mystery challenge!',
        outroScript: 'Comment your score below and subscribe!',
        revealScript: 'The answer is'
      }
    },
    audio: {
      bgmTrack: '/assets/audio/bgm/bgm_chill_lofi.mp3',
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
    activeTemplateId: 'image-focus',
    templates: [
      defaultTemplates['image-focus'],
      defaultTemplates['classic-stacked'],
      defaultTemplates['split-modern'],
      defaultTemplates['minimal-clean']
    ]
  }
];
