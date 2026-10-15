import { VideoTemplate, Channel } from './index.js';

export interface LayoutTemplateItem {
  id: string;
  name: string;
  tag: string;
  badgeColor: string;
  description: string;
  icon: string;
  previewGradient: string;
  accentColors: string[];
  template: VideoTemplate;
  branding: {
    colors: Channel['branding']['colors'];
    typography?: Channel['branding']['typography'];
  };
}

export const TEMPLATE_LIBRARY: LayoutTemplateItem[] = [
  // ---------------------------------------------------------------------------
  // TEMPLATE 01 — CLASSIC QUIZ (White + Blue / Cân Đối Kinh Điển)
  // ---------------------------------------------------------------------------
  {
    id: 'tmpl-classic-quiz',
    name: '01. Classic Quiz',
    tag: 'Sáng Chuẩn • White + Blue',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    description: 'Header trên cùng, Ảnh lớn 26% ở trung tâm, Câu hỏi thẻ trắng viền xanh, 3 Đáp án dọc cân đối và thanh đếm ngược đáy.',
    icon: '🎯',
    previewGradient: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)',
    accentColors: ['#2563eb', '#38bdf8', '#0284c7'],
    branding: {
      colors: {
        primary: '#2563eb',
        secondary: '#38bdf8',
        accent: '#0284c7',
        background: '#f8fafc',
        cardBg: '#ffffff',
        text: '#0f172a',
        correct: '#16a34a',
        wrong: '#dc2626',
        border: '#cbd5e1'
      }
    },
    template: {
      id: 'tmpl-classic-quiz',
      name: 'Classic Quiz',
      layoutType: 'classic-stacked',
      illustrationLayout: 'single',
      answerLayout: 'vertical-list',
      countdownStyle: 'bar-horizontal',
      transitionType: 'fade',
      timing: {
        countdownSeconds: 5,
        revealSeconds: 3,
        transitionFrames: 15,
        endBufferSeconds: 2.5,
        explanationDisplayDuration: 3.0
      },
      components: {
        background: {
          x: 0, y: 0, width: 100, height: 100,
          type: 'gradient',
          backgroundColor: '#f8fafc',
          secondaryColor: '#e0f2fe',
          gradientAngle: 135
        },
        header: {
          x: 6, y: 5, width: 88, height: 5,
          enabled: true,
          badgeStyle: true,
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 16,
          fontWeight: '900',
          color: '#1e3a8a',
          backgroundColor: '#dbeafe',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#93c5fd'
        },
        quizTitle: {
          x: 6, y: 5, width: 88, height: 5,
          enabled: true,
          badgeStyle: true,
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 18,
          fontWeight: '800',
          color: '#1e3a8a',
          backgroundColor: '#dbeafe',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#93c5fd'
        },
        questionNumber: {
          x: 6, y: 11, width: 88, height: 4,
          format: 'câu-n',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 14,
          fontWeight: '800',
          color: '#2563eb'
        },
        illustration: {
          x: 6, y: 16, width: 88, height: 26,
          borderRadius: 20,
          borderWidth: 2,
          borderColor: '#93c5fd',
          objectFit: 'cover'
        },
        questionBox: {
          x: 6, y: 44, width: 88, height: 17,
          shape: 'rounded',
          borderRadius: 20,
          borderWidth: 2,
          borderColor: '#bfdbfe',
          backgroundColor: '#ffffff',
          bgOpacity: 0.98,
          color: '#0f172a',
          textColor: '#0f172a',
          fontFamily: 'Be Vietnam Pro, sans-serif',
          fontSize: 22,
          fontWeight: '700',
          boxShadow: '0 10px 25px rgba(37, 99, 235, 0.08)',
          padding: 16,
          animation: 'pop'
        },
        answerButtons: {
          x: 6, y: 63, width: 88, height: 22,
          shape: 'rounded',
          layoutComposition: 'stacked',
          optionBadgeShape: 'circle',
          readTts: true,
          gap: 10,
          borderRadius: 16,
          borderWidth: 1.5,
          borderColor: '#cbd5e1',
          backgroundColor: '#ffffff',
          bgOpacity: 0.96,
          color: '#1e293b',
          textColor: '#1e293b',
          fontFamily: 'Be Vietnam Pro, sans-serif',
          fontSize: 18,
          fontWeight: '600',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          padding: 12,
          animation: 'slide-up'
        },
        countdown: {
          x: 6, y: 87, width: 88, height: 4,
          countdownStyle: 'bar-horizontal',
          strokeWidth: 4,
          color: '#2563eb',
          warningColor: '#ef4444',
          fontSize: 18,
          fontWeight: '800'
        },
        explanation: {
          enabled: true,
          readTts: true,
          displayDurationSec: 3.0,
          showIcon: true,
          x: 6, y: 86, width: 88, height: 10,
          shape: 'rounded',
          borderRadius: 16,
          borderWidth: 1.5,
          borderColor: '#86efac',
          backgroundColor: '#f0fdf4',
          bgOpacity: 0.98,
          color: '#14532d',
          textColor: '#14532d',
          fontFamily: 'Be Vietnam Pro, sans-serif',
          fontSize: 14,
          fontWeight: '500',
          boxShadow: '0 8px 20px rgba(22, 163, 74, 0.1)',
          padding: 12
        }
      }
    }
  },

  // ---------------------------------------------------------------------------
  // TEMPLATE 07 — BUBBLE QUIZ (Pink + Purple / Bóng Thoại Hoạt Hình)
  // ---------------------------------------------------------------------------
  {
    id: 'tmpl-bubble-quiz',
    name: '07. Bubble Quiz',
    tag: 'Bóng Thoại • Pink + Purple',
    badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
    description: 'Khung câu hỏi & đáp án dạng Speech Bubble trẻ trung, góc bo lệch bất đối xứng ngộ nghĩnh, hiệu ứng pop vui nhộn.',
    icon: '🫧',
    previewGradient: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe8 100%)',
    accentColors: ['#ec4899', '#d946ef', '#a855f7'],
    branding: {
      colors: {
        primary: '#ec4899',
        secondary: '#d946ef',
        accent: '#a855f7',
        background: '#fdf2f8',
        cardBg: '#ffffff',
        text: '#701a75',
        correct: '#16a34a',
        wrong: '#dc2626',
        border: '#fbcfe8'
      }
    },
    template: {
      id: 'tmpl-bubble-quiz',
      name: 'Bubble Quiz',
      layoutType: 'split-modern',
      illustrationLayout: 'single',
      answerLayout: 'vertical-list',
      countdownStyle: 'badge',
      transitionType: 'zoom',
      timing: {
        countdownSeconds: 5,
        revealSeconds: 3,
        transitionFrames: 15,
        endBufferSeconds: 2.5,
        explanationDisplayDuration: 3.0
      },
      components: {
        background: {
          x: 0, y: 0, width: 100, height: 100,
          type: 'gradient',
          backgroundColor: '#fdf2f8',
          secondaryColor: '#f3e8ff',
          gradientAngle: 135
        },
        quizTitle: {
          x: 6, y: 5, width: 88, height: 5,
          enabled: true,
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 17,
          fontWeight: '900',
          color: '#831843',
          backgroundColor: '#fce7f3',
          borderRadius: 14,
          borderWidth: 1.5,
          borderColor: '#f472b6'
        },
        questionNumber: {
          x: 6, y: 11, width: 88, height: 4,
          format: 'câu-n',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 14,
          fontWeight: '800',
          color: '#ec4899'
        },
        questionBox: {
          x: 6, y: 16, width: 88, height: 23,
          shape: 'speech-bubble',
          borderRadius: 24,
          borderWidth: 2.5,
          borderColor: '#f472b6',
          backgroundColor: '#ffffff',
          bgOpacity: 0.98,
          color: '#701a75',
          textColor: '#701a75',
          fontFamily: 'Be Vietnam Pro, sans-serif',
          fontSize: 22,
          fontWeight: '800',
          boxShadow: '0 10px 24px rgba(236, 72, 153, 0.15)',
          padding: 16,
          animation: 'pop'
        },
        answerButtons: {
          x: 6, y: 43, width: 88, height: 38,
          shape: 'bubble',
          layoutComposition: 'stacked',
          optionBadgeShape: 'pill',
          readTts: true,
          useIndividualStyles: true,
          options: {
            A: {
              x: 6, y: 44, width: 88, height: 10.5,
              shape: 'speech-bubble',
              backgroundColor: '#ffffff',
              borderColor: '#f472b6',
              borderWidth: 2,
              textColor: '#701a75',
              fontSize: 18,
              fontWeight: '700',
              labelShape: 'pill',
              labelBgColor: '#fce7f3',
              labelColor: '#be185d'
            },
            B: {
              x: 8, y: 56, width: 84, height: 10.5,
              shape: 'pill',
              backgroundColor: '#ffffff',
              borderColor: '#c084fc',
              borderWidth: 2,
              textColor: '#581c87',
              fontSize: 18,
              fontWeight: '700',
              labelShape: 'circle',
              labelBgColor: '#f3e8ff',
              labelColor: '#7e22ce'
            },
            C: {
              x: 5, y: 68, width: 89, height: 10.5,
              shape: 'blob',
              backgroundColor: '#ffffff',
              borderColor: '#fb7185',
              borderWidth: 2,
              textColor: '#881337',
              fontSize: 18,
              fontWeight: '700',
              labelShape: 'pill',
              labelBgColor: '#ffe4e6',
              labelColor: '#be123c'
            }
          },
          animation: 'pop'
        },
        countdown: {
          x: 35, y: 7, width: 30, height: 6,
          countdownStyle: 'badge',
          strokeWidth: 2,
          color: '#ec4899',
          warningColor: '#dc2626',
          fontSize: 18,
          fontWeight: '800'
        },
        explanation: {
          enabled: true,
          readTts: true,
          displayDurationSec: 3.0,
          showIcon: true,
          x: 6, y: 83, width: 88, height: 11,
          shape: 'speech-bubble',
          borderRadius: 16,
          borderWidth: 1.5,
          borderColor: '#86efac',
          backgroundColor: '#ffffff',
          color: '#14532d',
          textColor: '#14532d',
          fontFamily: 'Be Vietnam Pro, sans-serif',
          fontSize: 14,
          fontWeight: '500',
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
          padding: 12
        }
      }
    }
  },

  // ---------------------------------------------------------------------------
  // TEMPLATE 03 — TIKTOK NEON PULSE (Cyan + Magenta / Trending Trivia)
  // ---------------------------------------------------------------------------
  {
    id: 'tmpl-tiktok-neon-pulse',
    name: '03. TikTok Neon Pulse',
    tag: 'Trending Trivia • Neon Cyan & Magenta',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    description: 'Khung câu hỏi lớn bo tròn viền neon kép; Ring Timer phát sáng ở trung tâm; 3 thẻ đáp án Floating Pills bo cong hiện đại.',
    icon: '⚡',
    previewGradient: 'linear-gradient(135deg, #050b14 0%, #0d1b2a 50%, #1b263b 100%)',
    accentColors: ['#00f0ff', '#ff007f', '#7928ca'],
    branding: {
      colors: {
        primary: '#00f0ff',
        secondary: '#ff007f',
        accent: '#7928ca',
        background: '#050b14',
        cardBg: '#0a1628',
        text: '#ffffff',
        correct: '#00f0ff',
        wrong: '#ff007f',
        border: '#00f0ff'
      }
    },
    template: {
      id: 'tmpl-tiktok-neon-pulse',
      name: 'TikTok Neon Pulse',
      layoutType: 'neon-pulse',
      illustrationLayout: 'single',
      answerLayout: 'vertical-list',
      countdownStyle: 'circle-radial',
      transitionType: 'zoom',
      timing: {
        countdownSeconds: 5,
        revealSeconds: 3,
        transitionFrames: 15,
        endBufferSeconds: 2.5,
        explanationDisplayDuration: 3.0
      },
      components: {
        background: {
          x: 0, y: 0, width: 100, height: 100,
          type: 'neon',
          neonPresetId: 'neon-gradient',
          neonSpeed: 1.0,
          neonIntensity: 1.2,
          neonColor1: '#00f0ff',
          neonColor2: '#ff007f',
          neonColor3: '#7928ca',
          backgroundColor: '#050b14'
        },
        quizTitle: {
          x: 6, y: 5, width: 88, height: 5,
          enabled: true,
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 16,
          fontWeight: '900',
          color: '#00f0ff',
          backgroundColor: 'rgba(0, 240, 255, 0.1)',
          borderRadius: 14,
          borderWidth: 1.5,
          borderColor: '#00f0ff'
        },
        questionNumber: {
          x: 6, y: 11, width: 88, height: 4,
          format: 'câu-n',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 14,
          fontWeight: '800',
          color: '#ff007f'
        },
        questionBox: {
          x: 6, y: 16, width: 88, height: 20,
          shape: 'rounded',
          borderRadius: 24,
          borderWidth: 2.5,
          borderColor: '#00f0ff',
          backgroundColor: 'rgba(10, 22, 40, 0.88)',
          bgOpacity: 0.92,
          color: '#ffffff',
          textColor: '#ffffff',
          fontFamily: 'Be Vietnam Pro, sans-serif',
          fontSize: 23,
          fontWeight: '800',
          boxShadow: '0 0 25px rgba(0, 240, 255, 0.3)',
          padding: 16,
          animation: 'pop'
        },
        illustration: {
          x: 37, y: 38, width: 26, height: 14,
          borderRadius: 16,
          borderWidth: 2,
          borderColor: '#ff007f',
          objectFit: 'cover'
        },
        countdown: {
          x: 50, y: 44, width: 24, height: 12,
          countdownStyle: 'circle-radial',
          strokeWidth: 5,
          color: '#00f0ff',
          warningColor: '#ff007f',
          fontSize: 22,
          fontWeight: '900'
        },
        answerButtons: {
          x: 6, y: 59, width: 88, height: 27,
          shape: 'pill',
          layoutComposition: 'stacked',
          optionBadgeShape: 'circle',
          readTts: true,
          gap: 10,
          borderRadius: 30,
          borderWidth: 2,
          borderColor: '#00f0ff',
          backgroundColor: 'rgba(10, 22, 40, 0.88)',
          bgOpacity: 0.9,
          color: '#ffffff',
          textColor: '#ffffff',
          fontFamily: 'Be Vietnam Pro, sans-serif',
          fontSize: 19,
          fontWeight: '700',
          boxShadow: '0 0 15px rgba(0, 240, 255, 0.15)',
          padding: 12,
          animation: 'slide-up'
        },
        explanation: {
          enabled: true,
          readTts: true,
          displayDurationSec: 3.0,
          showIcon: true,
          x: 6, y: 88, width: 88, height: 9,
          shape: 'pill',
          borderRadius: 20,
          borderWidth: 1.5,
          borderColor: '#00f0ff',
          backgroundColor: '#0a1628',
          color: '#00f0ff',
          textColor: '#00f0ff',
          fontFamily: 'Be Vietnam Pro, sans-serif',
          fontSize: 14,
          fontWeight: '600',
          padding: 10
        }
      }
    }
  },

  // ---------------------------------------------------------------------------
  // TEMPLATE 04 — GAMESHOW POP STICKER (Neo-Brutalism / MrBeast Style)
  // ---------------------------------------------------------------------------
  {
    id: 'tmpl-gameshow-pop-sticker',
    name: '04. GameShow Pop Sticker',
    tag: 'Neo-Brutalism • MrBeast Style',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    description: 'Khung thoại Sticker vàng rực rỡ, viền đen dày và bóng đổ cứng; Đồng hồ quả bom ngộ nghĩnh; 3 thẻ đáp án dạng khối 3D đa sắc.',
    icon: '💥',
    previewGradient: 'linear-gradient(135deg, #3b0764 0%, #581c87 50%, #7e22ce 100%)',
    accentColors: ['#facc15', '#f43f5e', '#06b6d4'],
    branding: {
      colors: {
        primary: '#facc15',
        secondary: '#f43f5e',
        accent: '#06b6d4',
        background: '#3b0764',
        cardBg: '#facc15',
        text: '#000000',
        correct: '#22c55e',
        wrong: '#ef4444',
        border: '#000000'
      }
    },
    template: {
      id: 'tmpl-gameshow-pop-sticker',
      name: 'GameShow Pop Sticker',
      layoutType: 'pop-sticker',
      illustrationLayout: 'single',
      answerLayout: 'vertical-list',
      countdownStyle: 'badge',
      transitionType: 'bounce',
      timing: {
        countdownSeconds: 5,
        revealSeconds: 3,
        transitionFrames: 15,
        endBufferSeconds: 2.5,
        explanationDisplayDuration: 3.0
      },
      components: {
        background: {
          x: 0, y: 0, width: 100, height: 100,
          type: 'solid',
          backgroundColor: '#3b0764'
        },
        quizTitle: {
          x: 6, y: 4, width: 88, height: 5,
          enabled: true,
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 16,
          fontWeight: '900',
          color: '#ffffff',
          backgroundColor: '#000000',
          borderRadius: 8,
          borderWidth: 2.5,
          borderColor: '#ffffff',
          boxShadow: '3px 3px 0px #000000'
        },
        questionNumber: {
          x: 6, y: 10, width: 88, height: 4,
          format: 'câu-n',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 14,
          fontWeight: '900',
          color: '#facc15'
        },
        questionBox: {
          x: 6, y: 15, width: 88, height: 21,
          shape: 'speech-bubble',
          borderRadius: 14,
          borderWidth: 3.5,
          borderColor: '#000000',
          backgroundColor: '#facc15',
          bgOpacity: 1.0,
          color: '#000000',
          textColor: '#000000',
          fontFamily: 'Be Vietnam Pro, sans-serif',
          fontSize: 24,
          fontWeight: '900',
          boxShadow: '6px 6px 0px #000000',
          padding: 16,
          animation: 'pop'
        },
        illustration: {
          x: 10, y: 38, width: 42, height: 18,
          borderRadius: 12,
          borderWidth: 3,
          borderColor: '#000000',
          boxShadow: '4px 4px 0px #000000',
          objectFit: 'cover'
        },
        countdown: {
          x: 65, y: 41, width: 25, height: 14,
          countdownStyle: 'badge',
          strokeWidth: 3,
          color: '#f43f5e',
          warningColor: '#ef4444',
          fontSize: 24,
          fontWeight: '900'
        },
        answerButtons: {
          x: 6, y: 59, width: 88, height: 28,
          shape: 'sharp',
          layoutComposition: 'stacked',
          optionBadgeShape: 'square',
          readTts: true,
          useIndividualStyles: true,
          options: {
            A: {
              x: 6, y: 59, width: 88, height: 8.5,
              shape: 'rounded',
              backgroundColor: '#f87171',
              borderColor: '#000000',
              borderWidth: 3,
              borderRadius: 10,
              textColor: '#000000',
              fontSize: 19,
              fontWeight: '900',
              labelShape: 'square',
              labelBgColor: '#000000',
              labelColor: '#ffffff',
              boxShadow: '4px 4px 0px #000000'
            },
            B: {
              x: 6, y: 69, width: 88, height: 8.5,
              shape: 'rounded',
              backgroundColor: '#38bdf8',
              borderColor: '#000000',
              borderWidth: 3,
              borderRadius: 10,
              textColor: '#000000',
              fontSize: 19,
              fontWeight: '900',
              labelShape: 'square',
              labelBgColor: '#000000',
              labelColor: '#ffffff',
              boxShadow: '4px 4px 0px #000000'
            },
            C: {
              x: 6, y: 79, width: 88, height: 8.5,
              shape: 'rounded',
              backgroundColor: '#a3e635',
              borderColor: '#000000',
              borderWidth: 3,
              borderRadius: 10,
              textColor: '#000000',
              fontSize: 19,
              fontWeight: '900',
              labelShape: 'square',
              labelBgColor: '#000000',
              labelColor: '#ffffff',
              boxShadow: '4px 4px 0px #000000'
            }
          },
          animation: 'pop'
        },
        explanation: {
          enabled: true,
          readTts: true,
          displayDurationSec: 3.0,
          showIcon: true,
          x: 6, y: 89, width: 88, height: 8,
          shape: 'rounded',
          borderRadius: 8,
          borderWidth: 2.5,
          borderColor: '#000000',
          backgroundColor: '#ffffff',
          color: '#000000',
          textColor: '#000000',
          fontFamily: 'Be Vietnam Pro, sans-serif',
          fontSize: 14,
          fontWeight: '700',
          boxShadow: '4px 4px 0px #000000',
          padding: 10
        }
      }
    }
  },

  // ---------------------------------------------------------------------------
  // TEMPLATE 05 — CINEMATIC DARK MYSTERY (Lịch Sử & Bí Ẩn / Brushed Gold)
  // ---------------------------------------------------------------------------
  {
    id: 'tmpl-cinematic-dark-mystery',
    name: '05. Cinematic Dark Mystery',
    tag: 'Lịch Sử & Bí Ẩn • Brushed Gold',
    badgeColor: 'bg-amber-600/20 text-amber-200 border-amber-600/40',
    description: 'Thẻ kính mờ viền chỉ vàng kim; Thanh đếm ngược vàng kim nằm ngang; Khung ảnh tròn điện ảnh; 3 thanh kính tối nằm ngang.',
    icon: '🏛️',
    previewGradient: 'linear-gradient(135deg, #090a0f 0%, #12141d 50%, #1a1c24 100%)',
    accentColors: ['#d4af37', '#e5c158', '#997a15'],
    branding: {
      colors: {
        primary: '#d4af37',
        secondary: '#e5c158',
        accent: '#997a15',
        background: '#090a0f',
        cardBg: '#14161f',
        text: '#ffffff',
        correct: '#22c55e',
        wrong: '#ef4444',
        border: '#d4af37'
      }
    },
    template: {
      id: 'tmpl-cinematic-dark-mystery',
      name: 'Cinematic Dark Mystery',
      layoutType: 'cinematic-mystery',
      illustrationLayout: 'single',
      answerLayout: 'vertical-list',
      countdownStyle: 'bar-horizontal',
      transitionType: 'fade',
      timing: {
        countdownSeconds: 5,
        revealSeconds: 3,
        transitionFrames: 15,
        endBufferSeconds: 2.5,
        explanationDisplayDuration: 3.0
      },
      components: {
        background: {
          x: 0, y: 0, width: 100, height: 100,
          type: 'solid',
          backgroundColor: '#090a0f'
        },
        quizTitle: {
          x: 6, y: 4, width: 88, height: 5,
          enabled: true,
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 16,
          fontWeight: '700',
          color: '#d4af37',
          backgroundColor: 'transparent',
          borderWidth: 0
        },
        questionNumber: {
          x: 6, y: 9, width: 88, height: 4,
          format: 'câu-n',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 13,
          fontWeight: '700',
          color: '#e5c158'
        },
        questionBox: {
          x: 6, y: 13, width: 88, height: 16,
          shape: 'rounded',
          borderRadius: 16,
          borderWidth: 1.5,
          borderColor: '#d4af37',
          backgroundColor: 'rgba(20, 22, 31, 0.88)',
          bgOpacity: 0.9,
          color: '#ffffff',
          textColor: '#ffffff',
          fontFamily: 'Be Vietnam Pro, sans-serif',
          fontSize: 22,
          fontWeight: '700',
          boxShadow: '0 8px 30px rgba(212, 175, 55, 0.12)',
          padding: 16,
          animation: 'fade'
        },
        countdown: {
          x: 10, y: 31, width: 80, height: 3,
          countdownStyle: 'bar-horizontal',
          strokeWidth: 3,
          color: '#d4af37',
          warningColor: '#ef4444',
          fontSize: 16,
          fontWeight: '700'
        },
        illustration: {
          x: 20, y: 36, width: 60, height: 30,
          borderRadius: 999,
          borderWidth: 3,
          borderColor: '#d4af37',
          objectFit: 'cover',
          boxShadow: '0 0 35px rgba(212, 175, 55, 0.2)'
        },
        answerButtons: {
          x: 6, y: 68, width: 88, height: 21,
          shape: 'rounded',
          layoutComposition: 'stacked',
          optionBadgeShape: 'square',
          readTts: true,
          gap: 8,
          borderRadius: 12,
          borderWidth: 1.5,
          borderColor: 'rgba(212, 175, 55, 0.5)',
          backgroundColor: 'rgba(20, 22, 31, 0.92)',
          bgOpacity: 0.92,
          color: '#ffffff',
          textColor: '#ffffff',
          fontFamily: 'Be Vietnam Pro, sans-serif',
          fontSize: 18,
          fontWeight: '700',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
          padding: 10,
          animation: 'slide-up'
        },
        explanation: {
          enabled: true,
          readTts: true,
          displayDurationSec: 3.0,
          showIcon: true,
          x: 6, y: 90, width: 88, height: 8,
          shape: 'rounded',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#d4af37',
          backgroundColor: '#14161f',
          color: '#e5c158',
          textColor: '#e5c158',
          fontFamily: 'Be Vietnam Pro, sans-serif',
          fontSize: 14,
          fontWeight: '500',
          padding: 10
        }
      }
    }
  },

  // ---------------------------------------------------------------------------
  // TEMPLATE 06 — ASYMMETRIC BENTO GRID (Gen-Z Brain Quiz / Bento UI)
  // ---------------------------------------------------------------------------
  {
    id: 'tmpl-asymmetric-bento',
    name: '06. Asymmetric Bento Grid',
    tag: 'Gen-Z Brain Quiz • Bento UI',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    description: 'Bố cục Bento chia đôi ở giữa: bên trái ảnh minh họa vuông, bên phải đồng hồ tròn to bản; 3 thẻ đáp án capsule viền dạ quang.',
    icon: '🍱',
    previewGradient: 'linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e293b 100%)',
    accentColors: ['#10b981', '#38bdf8', '#a3e635'],
    branding: {
      colors: {
        primary: '#10b981',
        secondary: '#38bdf8',
        accent: '#a3e635',
        background: '#090d16',
        cardBg: '#0f172a',
        text: '#ffffff',
        correct: '#10b981',
        wrong: '#ef4444',
        border: '#10b981'
      }
    },
    template: {
      id: 'tmpl-asymmetric-bento',
      name: 'Asymmetric Bento Grid',
      layoutType: 'bento-grid',
      illustrationLayout: 'single',
      answerLayout: 'vertical-list',
      countdownStyle: 'circle-radial',
      transitionType: 'slide',
      timing: {
        countdownSeconds: 5,
        revealSeconds: 3,
        transitionFrames: 15,
        endBufferSeconds: 2.5,
        explanationDisplayDuration: 3.0
      },
      components: {
        background: {
          x: 0, y: 0, width: 100, height: 100,
          type: 'solid',
          backgroundColor: '#090d16'
        },
        quizTitle: {
          x: 6, y: 4, width: 88, height: 5,
          enabled: true,
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 16,
          fontWeight: '800',
          color: '#38bdf8',
          backgroundColor: 'rgba(56, 189, 248, 0.12)',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#38bdf8'
        },
        questionNumber: {
          x: 6, y: 10, width: 88, height: 4,
          format: 'câu-n',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 13,
          fontWeight: '700',
          color: '#10b981'
        },
        questionBox: {
          x: 6, y: 14, width: 88, height: 21,
          shape: 'rounded',
          borderRadius: 22,
          borderWidth: 2,
          borderColor: 'rgba(56, 189, 248, 0.35)',
          backgroundColor: 'rgba(15, 23, 42, 0.92)',
          bgOpacity: 0.92,
          color: '#ffffff',
          textColor: '#ffffff',
          fontFamily: 'Be Vietnam Pro, sans-serif',
          fontSize: 23,
          fontWeight: '800',
          padding: 16,
          animation: 'pop'
        },
        illustration: {
          x: 6, y: 37, width: 44, height: 22,
          borderRadius: 18,
          borderWidth: 2,
          borderColor: '#10b981',
          objectFit: 'cover'
        },
        countdown: {
          x: 54, y: 39, width: 40, height: 18,
          countdownStyle: 'circle-radial',
          strokeWidth: 5,
          color: '#38bdf8',
          warningColor: '#ef4444',
          fontSize: 24,
          fontWeight: '900'
        },
        answerButtons: {
          x: 6, y: 62, width: 88, height: 26,
          shape: 'pill',
          layoutComposition: 'stacked',
          optionBadgeShape: 'pill',
          readTts: true,
          gap: 10,
          borderRadius: 30,
          borderWidth: 1.5,
          borderColor: '#10b981',
          backgroundColor: 'rgba(15, 23, 42, 0.92)',
          bgOpacity: 0.92,
          color: '#ffffff',
          textColor: '#ffffff',
          fontFamily: 'Be Vietnam Pro, sans-serif',
          fontSize: 18,
          fontWeight: '700',
          padding: 12,
          animation: 'slide-up'
        },
        explanation: {
          enabled: true,
          readTts: true,
          displayDurationSec: 3.0,
          showIcon: true,
          x: 6, y: 89, width: 88, height: 8,
          shape: 'pill',
          borderRadius: 20,
          borderWidth: 1,
          borderColor: '#10b981',
          backgroundColor: '#0f172a',
          color: '#10b981',
          textColor: '#10b981',
          fontFamily: 'Be Vietnam Pro, sans-serif',
          fontSize: 14,
          fontWeight: '600',
          padding: 10
        }
      }
    }
  },

  // ---------------------------------------------------------------------------
  // TEMPLATE 07 — RETRO SYNTHWAVE ARCADE (Nostalgia 80s / Arcade Marquee)
  // ---------------------------------------------------------------------------
  {
    id: 'tmpl-retro-synthwave-arcade',
    name: '07. Retro Synthwave Arcade',
    tag: 'Nostalgia 80s • Arcade Marquee',
    badgeColor: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40',
    description: 'Bảng hiệu Marquee rực rỡ; Khối hologram và đồng hồ LED điện tử màu hổ phách; 3 nút bấm máy game thẳng đứng.',
    icon: '🕹️',
    previewGradient: 'linear-gradient(135deg, #180026 0%, #2e0854 50%, #4a0e4e 100%)',
    accentColors: ['#ec4899', '#06b6d4', '#f59e0b'],
    branding: {
      colors: {
        primary: '#ec4899',
        secondary: '#06b6d4',
        accent: '#f59e0b',
        background: '#180026',
        cardBg: '#2e0854',
        text: '#ffffff',
        correct: '#06b6d4',
        wrong: '#ef4444',
        border: '#ec4899'
      }
    },
    template: {
      id: 'tmpl-retro-synthwave-arcade',
      name: 'Retro Synthwave Arcade',
      layoutType: 'retro-arcade',
      illustrationLayout: 'single',
      answerLayout: 'vertical-list',
      countdownStyle: 'pill-timer',
      transitionType: 'pop',
      timing: {
        countdownSeconds: 5,
        revealSeconds: 3,
        transitionFrames: 15,
        endBufferSeconds: 2.5,
        explanationDisplayDuration: 3.0
      },
      components: {
        background: {
          x: 0, y: 0, width: 100, height: 100,
          type: 'neon',
          neonPresetId: 'grid-wave',
          neonSpeed: 1.2,
          neonIntensity: 1.1,
          neonColor1: '#ec4899',
          neonColor2: '#06b6d4',
          neonColor3: '#3b0764',
          backgroundColor: '#180026'
        },
        quizTitle: {
          x: 6, y: 4, width: 88, height: 6,
          enabled: true,
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 17,
          fontWeight: '900',
          color: '#ec4899',
          backgroundColor: 'rgba(236, 72, 153, 0.15)',
          borderRadius: 12,
          borderWidth: 2,
          borderColor: '#ec4899'
        },
        questionNumber: {
          x: 6, y: 11, width: 88, height: 4,
          format: 'câu-n',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 13,
          fontWeight: '800',
          color: '#06b6d4'
        },
        questionBox: {
          x: 6, y: 15, width: 88, height: 20,
          shape: 'rounded',
          borderRadius: 16,
          borderWidth: 2.5,
          borderColor: '#06b6d4',
          backgroundColor: 'rgba(46, 8, 84, 0.92)',
          bgOpacity: 0.92,
          color: '#ffffff',
          textColor: '#ffffff',
          fontFamily: 'Be Vietnam Pro, sans-serif',
          fontSize: 23,
          fontWeight: '800',
          boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)',
          padding: 16,
          animation: 'pop'
        },
        illustration: {
          x: 34, y: 37, width: 32, height: 15,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: '#ec4899',
          objectFit: 'cover'
        },
        countdown: {
          x: 50, y: 54, width: 50, height: 8,
          countdownStyle: 'pill-timer',
          strokeWidth: 2,
          color: '#f59e0b',
          warningColor: '#ef4444',
          fontSize: 22,
          fontWeight: '900'
        },
        answerButtons: {
          x: 6, y: 64, width: 88, height: 24,
          shape: 'rounded',
          layoutComposition: 'stacked',
          optionBadgeShape: 'circle',
          readTts: true,
          gap: 10,
          borderRadius: 16,
          borderWidth: 2,
          borderColor: '#ec4899',
          backgroundColor: 'rgba(46, 8, 84, 0.92)',
          bgOpacity: 0.92,
          color: '#ffffff',
          textColor: '#ffffff',
          fontFamily: 'Be Vietnam Pro, sans-serif',
          fontSize: 18,
          fontWeight: '700',
          padding: 12,
          animation: 'slide-up'
        },
        explanation: {
          enabled: true,
          readTts: true,
          displayDurationSec: 3.0,
          showIcon: true,
          x: 6, y: 89, width: 88, height: 8,
          shape: 'rounded',
          borderRadius: 12,
          borderWidth: 1.5,
          borderColor: '#06b6d4',
          backgroundColor: '#180026',
          color: '#06b6d4',
          textColor: '#06b6d4',
          fontFamily: 'Be Vietnam Pro, sans-serif',
          fontSize: 14,
          fontWeight: '600',
          padding: 10
        }
      }
    }
  },
  // ---------------------------------------------------------------------------
  // TEMPLATE 08 — HEXAGON BANNER ARCADE (Comic • Pointed Hexagon White)
  // ---------------------------------------------------------------------------
  {
    id: 'tmpl-hexagon-banner',
    name: '08. Hexagon Banner Arcade',
    tag: 'Comic • Banner Lục Giác Trắng',
    badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
    description: 'Khung câu hỏi lục giác đỉnh nhọn viền đen dày, 3 nút đáp án capsule viền đen với nhãn A), B), C) comic sắc màu nổi bật.',
    icon: '⚡',
    previewGradient: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 50%, #e2e8f0 100%)',
    accentColors: ['#000000', '#38bdf8', '#f472b6', '#a3e635'],
    branding: {
      colors: {
        primary: '#000000',
        secondary: '#38bdf8',
        accent: '#f472b6',
        background: '#ffffff',
        cardBg: '#ffffff',
        text: '#000000',
        correct: '#16a34a',
        wrong: '#ef4444',
        border: '#000000'
      },
      typography: {
        headingFont: 'Montserrat, sans-serif',
        bodyFont: 'Montserrat, sans-serif'
      }
    },
    template: {
      id: 'tmpl-hexagon-banner',
      name: 'Hexagon Banner Arcade',
      layoutType: 'classic-stacked',
      illustrationLayout: 'single',
      answerLayout: 'vertical-list',
      countdownStyle: 'bar-horizontal',
      transitionType: 'fade',
      timing: {
        countdownSeconds: 5,
        revealSeconds: 3,
        transitionFrames: 15,
        endBufferSeconds: 2.5,
        explanationDisplayDuration: 3.0
      },
      components: {
        background: {
          x: 0, y: 0, width: 100, height: 100,
          type: 'solid',
          backgroundColor: '#ffffff'
        },
        header: {
          x: 8, y: 4, width: 84, height: 4,
          enabled: false,
          badgeStyle: false,
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 16,
          fontWeight: '900',
          color: '#000000',
          backgroundColor: 'transparent'
        },
        quizTitle: {
          x: 8, y: 4, width: 84, height: 4,
          enabled: false,
          badgeStyle: false,
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 18,
          fontWeight: '900',
          color: '#000000',
          backgroundColor: 'transparent'
        },
        questionNumber: {
          x: 8, y: 9, width: 84, height: 4,
          format: 'câu-n',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 16,
          fontWeight: '800',
          color: '#000000'
        },
        illustration: {
          x: 10, y: 6, width: 80, height: 26,
          borderRadius: 16,
          borderWidth: 4,
          borderColor: '#000000',
          objectFit: 'cover'
        },
        questionBox: {
          x: 6, y: 14, width: 88, height: 26,
          shape: 'banner-pointed',
          borderRadius: 0,
          borderWidth: 6,
          borderColor: '#000000',
          backgroundColor: '#ffffff',
          bgOpacity: 1.0,
          color: '#000000',
          textColor: '#000000',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 26,
          fontWeight: '900',
          boxShadow: 'none',
          padding: 24,
          animation: 'pop'
        },
        answerButtons: {
          x: 10, y: 56, width: 80, height: 28,
          shape: 'pill',
          layoutComposition: 'stacked',
          optionBadgeShape: 'comic-bracket',
          readTts: true,
          gap: 16,
          borderRadius: 9999,
          borderWidth: 5,
          borderColor: '#000000',
          backgroundColor: '#ffffff',
          bgOpacity: 1.0,
          color: '#000000',
          textColor: '#000000',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 22,
          fontWeight: '800',
          boxShadow: 'none',
          padding: 14,
          animation: 'slide-up',
          options: {
            A: { labelColor: '#38bdf8', labelBgColor: 'transparent', labelShape: 'comic-bracket' },
            B: { labelColor: '#f472b6', labelBgColor: 'transparent', labelShape: 'comic-bracket' },
            C: { labelColor: '#a3e635', labelBgColor: 'transparent', labelShape: 'comic-bracket' }
          }
        },
        countdown: {
          x: 10, y: 88, width: 80, height: 3,
          countdownStyle: 'bar-horizontal',
          strokeWidth: 6,
          color: '#000000',
          showSeconds: true
        },
        explanation: {
          enabled: true,
          readTts: true,
          displayDurationSec: 3.0,
          showIcon: true,
          x: 10, y: 88, width: 80, height: 7,
          shape: 'rounded',
          borderRadius: 14,
          borderWidth: 2,
          borderColor: '#000000',
          backgroundColor: '#ffffff',
          color: '#000000',
          textColor: '#000000',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 15,
          fontWeight: '700',
          padding: 10
        }
      }
    }
  },
  // ---------------------------------------------------------------------------
  // TEMPLATE 09 — CHROMA POP 3D (Sticker 3D • Phông Xanh TikTok)
  // ---------------------------------------------------------------------------
  {
    id: 'tmpl-chroma-pop-green',
    name: '09. Chroma Pop 3D',
    tag: 'Sticker 3D • Phông Xanh TikTok',
    badgeColor: 'bg-green-500/20 text-green-400 border-green-500/40',
    description: 'Nền phông xanh Chroma Green chuẩn TikTok/CapCut, khung câu hỏi và đáp án bo tròn viền đen đổ bóng 3D Pop Art, nhãn tròn Đỏ-Lam-Tím rực rỡ.',
    icon: '🟩',
    previewGradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
    accentColors: ['#22c55e', '#ef4444', '#3b82f6', '#8b5cf6'],
    branding: {
      colors: {
        primary: '#22c55e',
        secondary: '#3b82f6',
        accent: '#ef4444',
        background: '#22c55e',
        cardBg: '#ffffff',
        text: '#000000',
        correct: '#16a34a',
        wrong: '#ef4444',
        border: '#000000'
      },
      typography: {
        headingFont: 'Montserrat, sans-serif',
        bodyFont: 'Montserrat, sans-serif'
      }
    },
    template: {
      id: 'tmpl-chroma-pop-green',
      name: 'Chroma Pop 3D',
      layoutType: 'classic-stacked',
      illustrationLayout: 'single',
      answerLayout: 'vertical-list',
      countdownStyle: 'bar-horizontal',
      transitionType: 'pop',
      timing: {
        countdownSeconds: 5,
        revealSeconds: 3,
        transitionFrames: 15,
        endBufferSeconds: 2.5,
        explanationDisplayDuration: 3.0
      },
      components: {
        background: {
          x: 0, y: 0, width: 100, height: 100,
          type: 'solid',
          backgroundColor: '#22c55e'
        },
        header: {
          x: 8, y: 4, width: 84, height: 4,
          enabled: false,
          badgeStyle: false,
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 16,
          fontWeight: '900',
          color: '#ffffff',
          backgroundColor: 'transparent'
        },
        quizTitle: {
          x: 8, y: 4, width: 84, height: 4,
          enabled: false,
          badgeStyle: false,
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 18,
          fontWeight: '900',
          color: '#ffffff',
          backgroundColor: 'transparent'
        },
        questionNumber: {
          x: 8, y: 9, width: 84, height: 4,
          format: 'câu-n',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 16,
          fontWeight: '900',
          color: '#ffffff'
        },
        illustration: {
          x: 10, y: 6, width: 80, height: 26,
          borderRadius: 24,
          borderWidth: 5,
          borderColor: '#000000',
          popShadow: true,
          popShadowOffset: 8,
          popShadowColor: '#000000',
          objectFit: 'cover'
        },
        questionBox: {
          x: 8, y: 14, width: 84, height: 26,
          shape: 'rounded',
          borderRadius: 32,
          borderWidth: 6,
          borderColor: '#000000',
          backgroundColor: '#ffffff',
          bgOpacity: 1.0,
          popShadow: true,
          popShadowOffset: 10,
          popShadowColor: '#000000',
          color: '#000000',
          textColor: '#000000',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 26,
          fontWeight: '900',
          padding: 22,
          animation: 'pop'
        },
        answerButtons: {
          x: 8, y: 56, width: 84, height: 28,
          shape: 'pill',
          layoutComposition: 'stacked',
          optionBadgeShape: 'circle',
          readTts: true,
          gap: 16,
          borderRadius: 9999,
          borderWidth: 6,
          borderColor: '#000000',
          backgroundColor: '#ffffff',
          bgOpacity: 1.0,
          popShadow: true,
          popShadowOffset: 8,
          popShadowColor: '#000000',
          color: '#000000',
          textColor: '#000000',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 22,
          fontWeight: '800',
          padding: 14,
          animation: 'slide-up',
          options: {
            A: { labelColor: '#ffffff', labelBgColor: '#ef4444', labelShape: 'circle' },
            B: { labelColor: '#ffffff', labelBgColor: '#3b82f6', labelShape: 'circle' },
            C: { labelColor: '#ffffff', labelBgColor: '#8b5cf6', labelShape: 'circle' }
          }
        },
        countdown: {
          x: 8, y: 88, width: 84, height: 3,
          countdownStyle: 'bar-horizontal',
          strokeWidth: 6,
          color: '#ffffff',
          showSeconds: true
        },
        explanation: {
          enabled: true,
          readTts: true,
          displayDurationSec: 3.0,
          showIcon: true,
          x: 8, y: 88, width: 84, height: 7,
          shape: 'rounded',
          borderRadius: 16,
          borderWidth: 3,
          borderColor: '#000000',
          backgroundColor: '#ffffff',
          popShadow: true,
          popShadowOffset: 6,
          popShadowColor: '#000000',
          color: '#000000',
          textColor: '#000000',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 15,
          fontWeight: '700',
          padding: 10
        }
      }
    }
  }
];

export function validateAndSanitizeTemplate(template: VideoTemplate, fallback?: VideoTemplate): VideoTemplate {
  const defaultItem = TEMPLATE_LIBRARY.find(t => t.id === 'tmpl-gameshow-pop-sticker') || TEMPLATE_LIBRARY[0];
  const safeFallback = fallback || defaultItem.template;
  if (!template || typeof template !== 'object') {
    return JSON.parse(JSON.stringify(safeFallback));
  }

  const rawComps = template.components || safeFallback.components;
  const defaultQNum = safeFallback.components.questionNumber || { x: 7, y: 15, width: 86, height: 6 };
  const qNum = rawComps.questionNumber || defaultQNum;
  const sanitizedComps: VideoTemplate['components'] = {
    ...safeFallback.components,
    ...rawComps,
    questionBox: { ...safeFallback.components.questionBox, ...(rawComps.questionBox || {}) },
    answerButtons: { ...safeFallback.components.answerButtons, ...(rawComps.answerButtons || {}) },
    countdown: { ...safeFallback.components.countdown, ...(rawComps.countdown || {}) },
    background: { ...safeFallback.components.background, ...(rawComps.background || {}) },
    questionNumber: {
      ...defaultQNum,
      ...qNum,
      x: qNum?.x ?? defaultQNum.x,
      y: qNum?.y ?? defaultQNum.y,
      width: qNum?.width ?? defaultQNum.width,
      height: qNum?.height ?? defaultQNum.height
    }
  };

  return {
    ...safeFallback,
    ...template,
    components: sanitizedComps,
    answerLayout: template.answerLayout || safeFallback.answerLayout || 'vertical-stack',
    countdownStyle: template.countdownStyle || safeFallback.countdownStyle || 'bar-bottom',
    transitionType: template.transitionType || safeFallback.transitionType || 'slide'
  };
}

export function applyTemplateLayout(
  templateId: string,
  currentTemplate: VideoTemplate,
  currentChannel: Channel
): { template: VideoTemplate; channel: Channel } {
  const found = TEMPLATE_LIBRARY.find(t => t.id === templateId) || TEMPLATE_LIBRARY[0];

  const targetId = found.id;
  const rawTemplate: VideoTemplate = {
    ...JSON.parse(JSON.stringify(found.template)),
    id: targetId,
    name: found.name
  };

  const newTemplate = validateAndSanitizeTemplate(rawTemplate, TEMPLATE_LIBRARY[0].template);

  const existingTemplates = currentChannel.templates || [];
  const exists = existingTemplates.some((t: VideoTemplate) => t.id === newTemplate.id);
  const updatedTemplates = exists
    ? existingTemplates.map((t: VideoTemplate) => (t.id === newTemplate.id ? newTemplate : t))
    : [...existingTemplates, newTemplate];

  const headingFont = found.branding?.typography?.headingFont || currentChannel.branding?.fonts?.primary || 'Montserrat, sans-serif';
  const bodyFont = found.branding?.typography?.bodyFont || currentChannel.branding?.fonts?.secondary || 'Be Vietnam Pro, sans-serif';

  const currentColors = currentChannel.branding?.colors || {};
  const currentIdentity = currentChannel.branding?.identity || {};

  const newChannel: Channel = {
    ...currentChannel,
    activeTemplateId: newTemplate.id,
    templates: updatedTemplates,
    branding: {
      ...(currentChannel.branding || {}),
      identity: {
        channelName: currentIdentity.channelName || 'Quiz Channel',
        showLogo: currentIdentity.showLogo ?? true,
        showChannelName: currentIdentity.showChannelName ?? false,
        watermarkOpacity: currentIdentity.watermarkOpacity ?? 0.9,
        logoUrl: currentIdentity.logoUrl,
        avatarUrl: currentIdentity.avatarUrl
      },
      colors: {
        primary: found.branding.colors?.primary || currentColors.primary || '#2563eb',
        secondary: found.branding.colors?.secondary || currentColors.secondary || '#38bdf8',
        accent: found.branding.colors?.accent || currentColors.accent || '#0284c7',
        background: found.branding.colors?.background || currentColors.background || '#0f172a',
        cardBg: found.branding.colors?.cardBg || currentColors.cardBg || '#1e293b',
        text: found.branding.colors?.text || currentColors.text || '#ffffff',
        correct: found.branding.colors?.correct || currentColors.correct || '#16a34a',
        wrong: found.branding.colors?.wrong || currentColors.wrong || '#ef4444',
        textMuted: found.branding.colors?.textMuted || currentColors.textMuted || '#94a3b8'
      },
      typography: {
        headingFont,
        bodyFont,
        ...(currentChannel.branding?.typography || {})
      },
      fonts: {
        primary: headingFont,
        secondary: bodyFont,
        headingWeight: '800',
        bodyWeight: '500',
        ...(currentChannel.branding?.fonts || {})
      }
    }
  };

  return { template: newTemplate, channel: newChannel };
}
