import { VideoTemplate, ChannelBranding, Channel } from './index.js';

export interface UiPreset {
  id: string;
  name: string;
  tag: string;
  description: string;
  icon: string;
  previewGradient: string;
  accentColors: [string, string, string];
  template: VideoTemplate;
  branding: ChannelBranding;
}

export const UI_PRESETS: UiPreset[] = [
  // ---------------------------------------------------------------------------
  // PRESET 1 — NEON FUTURE (Cyberpunk Floating Capsule / Staggered)
  // ---------------------------------------------------------------------------
  {
    id: 'neon-future',
    name: 'Neon Future',
    tag: 'Cyberpunk / Staggered Pills',
    description: 'Lưới không gian 3D Synthwave, Question capsule kính mờ, 3 Đáp án dạng Floating Pill bo tròn tuyệt đối xếp so le ziczac.',
    icon: '⚡',
    previewGradient: 'linear-gradient(135deg, #050515 0%, #1e1035 50%, #00f0ff 100%)',
    accentColors: ['#00f0ff', '#a855f7', '#ff007f'],
    template: {
      id: 'neon-future',
      name: 'Neon Future',
      layoutType: 'split-modern',
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
          type: 'neon',
          neonPresetId: 'neon-grid',
          neonColor1: '#00f0ff',
          neonColor2: '#a855f7',
          neonColor3: '#ff007f',
          neonSpeed: 1.2,
          neonIntensity: 30,
          blur: 0
        },
        header: {
          x: 6, y: 5, width: 88, height: 6,
          enabled: true,
          badgeStyle: true,
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 16,
          fontWeight: '700',
          color: '#00f0ff'
        },
        quizTitle: {
          x: 6, y: 6, width: 88, height: 6,
          enabled: true,
          badgeStyle: true,
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 20,
          fontWeight: '800',
          color: '#ffffff',
          backgroundColor: 'rgba(10, 15, 35, 0.75)',
          borderRadius: 9999,
          borderWidth: 1.5,
          borderColor: '#00f0ff',
          boxShadow: '0 0 15px rgba(0, 240, 255, 0.4)'
        },
        questionNumber: {
          x: 6, y: 13, width: 88, height: 5,
          format: 'câu-n',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 14,
          fontWeight: '700',
          color: '#00f0ff'
        },
        illustration: {
          x: 6, y: 19, width: 88, height: 26,
          borderRadius: 24,
          borderWidth: 2,
          borderColor: '#00f0ff',
          objectFit: 'cover',
          zoomEffect: true
        },
        questionBox: {
          x: 6, y: 20, width: 88, height: 20,
          shape: 'pill',
          borderRadius: 9999,
          borderWidth: 2,
          borderColor: '#00f0ff',
          backgroundColor: '#0a0d24',
          bgOpacity: 0.88,
          backdropBlur: 16,
          color: '#ffffff',
          textColor: '#ffffff',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 23,
          fontWeight: '700',
          boxShadow: '0 0 24px rgba(0, 240, 255, 0.4)',
          padding: 16,
          animation: 'pop'
        },
        answerButtons: {
          x: 6, y: 49, width: 88, height: 24,
          shape: 'pill',
          layoutComposition: 'staggered',
          optionBadgeShape: 'pill',
          readTts: true,
          gap: 12,
          borderRadius: 9999,
          borderWidth: 1.5,
          borderColor: '#a855f7',
          backgroundColor: '#13112c',
          bgOpacity: 0.9,
          backdropBlur: 12,
          color: '#ffffff',
          textColor: '#ffffff',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 19,
          fontWeight: '600',
          boxShadow: '0 0 16px rgba(168, 85, 247, 0.3)',
          padding: 12,
          animation: 'pop'
        },
        countdown: {
          x: 38, y: 11, width: 24, height: 7,
          countdownStyle: 'circle-radial',
          strokeWidth: 6,
          color: '#00f0ff',
          warningColor: '#ff007f',
          showIcon: false,
          fontSize: 30,
          fontWeight: '800'
        },
        explanation: {
          enabled: true,
          readTts: true,
          displayDurationSec: 3.0,
          showIcon: true,
          x: 6, y: 82, width: 88, height: 10,
          shape: 'pill',
          borderRadius: 9999,
          borderWidth: 2,
          borderColor: '#00f0ff',
          backgroundColor: '#0a0d24',
          bgOpacity: 0.95,
          color: '#ffffff',
          textColor: '#ffffff',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 15,
          fontWeight: '600',
          boxShadow: '0 0 20px rgba(0, 240, 255, 0.35)',
          padding: 12,
          titleText: 'GIẢI THÍCH CHI TIẾT'
        },
        logo: {
          x: 82, y: 4, width: 12, height: 6,
          showLogo: true,
          logoSize: 42
        }
      }
    },
    branding: {
      identity: { channelName: 'Neon Future' },
      colors: {
        primary: '#00f0ff',
        secondary: '#a855f7',
        correct: '#00f59b',
        wrong: '#ff007f',
        background: '#050515',
        cardBg: '#0a0d24',
        text: '#ffffff',
        accent: '#00f0ff'
      }
    }
  },

  // ---------------------------------------------------------------------------
  // PRESET 2 — GLASSMORPHIC (2-Top 1-Bottom Grid / Frosted Glass)
  // ---------------------------------------------------------------------------
  {
    id: 'glassmorphic',
    name: 'Glassmorphic',
    tag: 'Grid 2 Trên 1 Dưới / Kính Mờ',
    description: 'Bố cục lưới đối xứng độc đáo: 2 đáp án A & B nằm hàng trên, C bo tròn nằm giữa hàng dưới, kính mờ Frosted Glass.',
    icon: '💎',
    previewGradient: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #38bdf8 100%)',
    accentColors: ['#38bdf8', '#818cf8', '#34d399'],
    template: {
      id: 'glassmorphic',
      name: 'Glassmorphic',
      layoutType: 'split-modern',
      illustrationLayout: 'single',
      answerLayout: 'vertical-list',
      countdownStyle: 'circle-radial',
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
          type: 'neon',
          neonPresetId: 'cyber-glow',
          neonColor1: '#38bdf8',
          neonColor2: '#818cf8',
          neonColor3: '#c084fc',
          neonSpeed: 0.8,
          neonIntensity: 25,
          blur: 15
        },
        header: {
          x: 6, y: 5, width: 88, height: 6,
          enabled: true,
          fontFamily: 'Inter, sans-serif',
          fontSize: 16,
          fontWeight: '600',
          color: '#e2e8f0'
        },
        quizTitle: {
          x: 6, y: 6, width: 88, height: 6,
          enabled: true,
          badgeStyle: true,
          fontFamily: 'Inter, sans-serif',
          fontSize: 19,
          fontWeight: '700',
          color: '#ffffff',
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          borderRadius: 20,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.3)',
          backdropBlur: 16
        },
        questionNumber: {
          x: 6, y: 13, width: 88, height: 5,
          format: 'câu-n',
          fontFamily: 'Inter, sans-serif',
          fontSize: 14,
          fontWeight: '600',
          color: '#38bdf8'
        },
        illustration: {
          x: 8, y: 19, width: 84, height: 26,
          borderRadius: 24,
          borderWidth: 1.5,
          borderColor: 'rgba(255, 255, 255, 0.3)',
          objectFit: 'cover'
        },
        questionBox: {
          x: 8, y: 22, width: 84, height: 22,
          shape: 'rounded',
          borderRadius: 24,
          borderWidth: 1.5,
          borderColor: 'rgba(255, 255, 255, 0.4)',
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          bgOpacity: 0.2,
          backdropBlur: 20,
          color: '#ffffff',
          textColor: '#ffffff',
          fontFamily: 'Inter, sans-serif',
          fontSize: 22,
          fontWeight: '700',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          padding: 18,
          animation: 'fade'
        },
        answerButtons: {
          x: 6, y: 50, width: 88, height: 26,
          layoutComposition: 'grid-2-top-1-bottom',
          useIndividualStyles: true,
          readTts: true,
          shape: 'rounded',
          optionBadgeShape: 'pill',
          options: {
            A: {
              x: 6, y: 49, width: 42, height: 13,
              shape: 'rounded',
              borderRadius: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              bgOpacity: 0.25,
              borderWidth: 1.5,
              borderColor: 'rgba(255, 255, 255, 0.35)',
              textColor: '#ffffff',
              fontSize: 18,
              fontWeight: '600'
            },
            B: {
              x: 52, y: 49, width: 42, height: 13,
              shape: 'rounded',
              borderRadius: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              bgOpacity: 0.25,
              borderWidth: 1.5,
              borderColor: 'rgba(255, 255, 255, 0.35)',
              textColor: '#ffffff',
              fontSize: 18,
              fontWeight: '600'
            },
            C: {
              x: 16, y: 64, width: 68, height: 12,
              shape: 'pill',
              borderRadius: 9999,
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              bgOpacity: 0.3,
              borderWidth: 1.5,
              borderColor: 'rgba(255, 255, 255, 0.4)',
              textColor: '#ffffff',
              fontSize: 18,
              fontWeight: '600'
            }
          }
        },
        countdown: {
          x: 39, y: 12, width: 22, height: 22,
          countdownStyle: 'circle-radial',
          strokeWidth: 5,
          color: '#38bdf8',
          warningColor: '#f43f5e',
          showIcon: false,
          fontSize: 28,
          fontWeight: '700'
        },
        explanation: {
          enabled: true,
          readTts: true,
          displayDurationSec: 3.0,
          showIcon: true,
          x: 8, y: 81, width: 84, height: 11,
          shape: 'rounded',
          borderRadius: 22,
          borderWidth: 1.5,
          borderColor: 'rgba(56, 189, 248, 0.5)',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          bgOpacity: 0.85,
          backdropBlur: 20,
          color: '#ffffff',
          textColor: '#ffffff',
          fontFamily: 'Inter, sans-serif',
          fontSize: 15,
          fontWeight: '500',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          padding: 14,
          titleText: 'GIẢI THÍCH CHI TIẾT'
        },
        logo: {
          x: 82, y: 4, width: 12, height: 6,
          showLogo: true,
          logoSize: 40
        }
      }
    },
    branding: {
      identity: { channelName: 'Glassmorphic' },
      colors: {
        primary: '#38bdf8',
        secondary: '#818cf8',
        correct: '#34d399',
        wrong: '#f43f5e',
        background: '#0f172a',
        cardBg: '#1e1b4b',
        text: '#ffffff',
        accent: '#38bdf8'
      }
    }
  },

  // ---------------------------------------------------------------------------
  // PRESET 3 — BOLD POP & MULTI-SHAPE (Neo-Brutalism Multi-Color & Shapes)
  // ---------------------------------------------------------------------------
  {
    id: 'bold-pop',
    name: 'Bold Pop & Multi-Shape',
    tag: '3 Hình Khối & 3 Màu Khác Nhau',
    description: 'A = Bubble vàng sáp, B = Pill xanh cyan, C = Bo góc hồng tím. Viền đen 3.5px, đổ bóng Pop Shadow 6px siêu cá tính!',
    icon: '💥',
    previewGradient: 'linear-gradient(135deg, #fef08a 0%, #ffde59 50%, #ff007f 100%)',
    accentColors: ['#ffde59', '#38bdf8', '#ff007f'],
    template: {
      id: 'bold-pop',
      name: 'Bold Pop & Multi-Shape',
      layoutType: 'split-modern',
      illustrationLayout: 'single',
      answerLayout: 'vertical-list',
      countdownStyle: 'pill-timer',
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
          neonPresetId: 'light-particles',
          neonColor1: '#ffde59',
          neonColor2: '#ff007f',
          neonColor3: '#00f0ff',
          neonSpeed: 1.0,
          neonIntensity: 20
        },
        header: {
          x: 6, y: 5, width: 88, height: 6,
          enabled: true,
          badgeStyle: true,
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 16,
          fontWeight: '900',
          color: '#111827'
        },
        quizTitle: {
          x: 6, y: 6, width: 88, height: 6,
          enabled: true,
          badgeStyle: true,
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 20,
          fontWeight: '900',
          color: '#111827',
          backgroundColor: '#ffde59',
          borderRadius: 16,
          borderWidth: 3,
          borderColor: '#111827',
          boxShadow: '4px 4px 0px #111827'
        },
        questionNumber: {
          x: 6, y: 13, width: 88, height: 5,
          format: 'q-n',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 15,
          fontWeight: '900',
          color: '#ffde59'
        },
        illustration: {
          x: 6, y: 19, width: 88, height: 26,
          borderRadius: 20,
          borderWidth: 3.5,
          borderColor: '#111827',
          objectFit: 'cover'
        },
        questionBox: {
          x: 6, y: 20, width: 88, height: 22,
          shape: 'bubble',
          borderRadius: 24,
          borderWidth: 3.5,
          borderColor: '#111827',
          backgroundColor: '#fffbeb',
          bgOpacity: 1,
          color: '#111827',
          textColor: '#111827',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 24,
          fontWeight: '900',
          popShadow: true,
          popShadowOffset: 8,
          popShadowColor: '#111827',
          padding: 16,
          animation: 'bounce'
        },
        answerButtons: {
          x: 6, y: 48, width: 88, height: 27,
          layoutComposition: 'stacked',
          useIndividualStyles: true,
          readTts: true,
          options: {
            A: {
              x: 6, y: 47, width: 88, height: 8.5,
              shape: 'bubble',
              backgroundColor: '#fef08a',
              textColor: '#111827',
              borderWidth: 3,
              borderColor: '#111827',
              popShadow: true,
              popShadowOffset: 6,
              popShadowColor: '#111827',
              fontSize: 20,
              fontWeight: '800',
              labelShape: 'circle',
              labelBgColor: '#111827',
              labelColor: '#fef08a'
            },
            B: {
              x: 10, y: 57.5, width: 84, height: 8.5,
              shape: 'pill',
              borderRadius: 9999,
              backgroundColor: '#bae6fd',
              textColor: '#111827',
              borderWidth: 3,
              borderColor: '#111827',
              popShadow: true,
              popShadowOffset: 6,
              popShadowColor: '#111827',
              fontSize: 20,
              fontWeight: '800',
              labelShape: 'pill',
              labelBgColor: '#111827',
              labelColor: '#38bdf8'
            },
            C: {
              x: 6, y: 68, width: 88, height: 8.5,
              shape: 'rounded',
              borderRadius: 16,
              backgroundColor: '#fbcfe8',
              textColor: '#111827',
              borderWidth: 3,
              borderColor: '#111827',
              popShadow: true,
              popShadowOffset: 6,
              popShadowColor: '#111827',
              fontSize: 20,
              fontWeight: '800',
              labelShape: 'square',
              labelBgColor: '#111827',
              labelColor: '#f472b6'
            }
          }
        },
        countdown: {
          x: 35, y: 11, width: 30, height: 6,
          countdownStyle: 'pill-timer',
          strokeWidth: 3,
          color: '#ffde59',
          warningColor: '#ff007f',
          showIcon: true,
          fontSize: 22,
          fontWeight: '900'
        },
        explanation: {
          enabled: true,
          readTts: true,
          displayDurationSec: 3.0,
          showIcon: true,
          x: 6, y: 81, width: 88, height: 11,
          shape: 'bubble',
          borderRadius: 20,
          borderWidth: 3,
          borderColor: '#111827',
          backgroundColor: '#ffffff',
          bgOpacity: 1,
          color: '#111827',
          textColor: '#111827',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 15,
          fontWeight: '700',
          popShadow: true,
          popShadowOffset: 6,
          popShadowColor: '#111827',
          padding: 12,
          titleText: 'GIẢI THÍCH CHI TIẾT'
        },
        logo: {
          x: 82, y: 4, width: 12, height: 6,
          showLogo: true,
          logoSize: 42
        }
      }
    },
    branding: {
      identity: { channelName: 'Bold Pop' },
      colors: {
        primary: '#ffde59',
        secondary: '#ff007f',
        correct: '#00f59b',
        wrong: '#ff007f',
        background: '#0a0a14',
        cardBg: '#fffbeb',
        text: '#111827',
        accent: '#ffde59'
      }
    }
  },

  // ---------------------------------------------------------------------------
  // PRESET 4 — MINIMAL PREMIUM (Editorial Minimal Line & Typographic Focus)
  // ---------------------------------------------------------------------------
  {
    id: 'minimal-premium',
    name: 'Minimal Premium',
    tag: 'Đường Kẻ Tối Giản / Sang Trọng',
    description: 'Thiết kế tối giản phong cách Thụy Sĩ: Question không viền trang nhã, đáp án đường kẻ thanh mảnh, typography đẳng cấp.',
    icon: '✨',
    previewGradient: 'linear-gradient(135deg, #18181b 0%, #27272a 60%, #52525b 100%)',
    accentColors: ['#f4f4f5', '#a1a1aa', '#22c55e'],
    template: {
      id: 'minimal-premium',
      name: 'Minimal Premium',
      layoutType: 'split-modern',
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
          backgroundColor: '#09090b',
          blur: 0
        },
        header: {
          x: 8, y: 5, width: 84, height: 5,
          enabled: true,
          fontFamily: 'Inter, sans-serif',
          fontSize: 14,
          fontWeight: '500',
          color: '#a1a1aa'
        },
        quizTitle: {
          x: 8, y: 6, width: 84, height: 6,
          enabled: true,
          badgeStyle: false,
          fontFamily: 'Inter, sans-serif',
          fontSize: 18,
          fontWeight: '600',
          color: '#f4f4f5',
          backgroundColor: 'transparent',
          borderWidth: 0
        },
        questionNumber: {
          x: 8, y: 12, width: 84, height: 5,
          format: 'badge',
          fontFamily: 'Inter, sans-serif',
          fontSize: 13,
          fontWeight: '600',
          color: '#f4f4f5'
        },
        illustration: {
          x: 8, y: 18, width: 84, height: 26,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.15)',
          objectFit: 'cover'
        },
        questionBox: {
          x: 8, y: 18, width: 84, height: 26,
          shape: 'minimal',
          borderRadius: 0,
          borderWidth: 0,
          backgroundColor: 'transparent',
          bgOpacity: 0,
          color: '#f4f4f5',
          textColor: '#f4f4f5',
          fontFamily: 'Inter, sans-serif',
          fontSize: 24,
          fontWeight: '600',
          textAlign: 'center',
          boxShadow: 'none',
          padding: 16,
          animation: 'fade'
        },
        answerButtons: {
          x: 8, y: 50, width: 84, height: 25,
          shape: 'minimal',
          layoutComposition: 'stacked',
          optionBadgeShape: 'square',
          readTts: true,
          gap: 12,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.15)',
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          bgOpacity: 0.1,
          color: '#f4f4f5',
          textColor: '#f4f4f5',
          fontFamily: 'Inter, sans-serif',
          fontSize: 19,
          fontWeight: '500',
          boxShadow: 'none',
          padding: 14,
          animation: 'fade'
        },
        countdown: {
          x: 8, y: 46, width: 84, height: 4,
          countdownStyle: 'bar-horizontal',
          strokeWidth: 4,
          color: '#f4f4f5',
          warningColor: '#ef4444',
          showIcon: false,
          fontSize: 18,
          fontWeight: '600'
        },
        explanation: {
          enabled: true,
          readTts: true,
          displayDurationSec: 3.0,
          showIcon: true,
          x: 8, y: 81, width: 84, height: 11,
          shape: 'minimal',
          borderRadius: 8,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.2)',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          bgOpacity: 0.1,
          color: '#e4e4e7',
          textColor: '#e4e4e7',
          fontFamily: 'Inter, sans-serif',
          fontSize: 15,
          fontWeight: '400',
          boxShadow: 'none',
          padding: 12,
          titleText: 'GIẢI THÍCH CHI TIẾT'
        },
        logo: {
          x: 84, y: 4, width: 10, height: 6,
          showLogo: true,
          logoSize: 36
        }
      }
    },
    branding: {
      identity: { channelName: 'Minimal Premium' },
      colors: {
        primary: '#f4f4f5',
        secondary: '#a1a1aa',
        correct: '#22c55e',
        wrong: '#ef4444',
        background: '#09090b',
        cardBg: '#18181b',
        text: '#f4f4f5',
        accent: '#f4f4f5'
      }
    }
  },

  // ---------------------------------------------------------------------------
  // PRESET 5 — PAPER DOODLE & SKETCH (Tilted Stickers & Dashed Borders)
  // ---------------------------------------------------------------------------
  {
    id: 'paper-doodle',
    name: 'Paper Doodle & Sketch',
    tag: 'Sticker Nghiêng / Nét Đứt / Dạ Quang',
    description: 'Nền giấy cổ Parchment, viền nét đứt vẽ tay thủ công, các đáp án nghiêng ziczac như sticker dán sổ, highlight bút dạ quang.',
    icon: '✏️',
    previewGradient: 'linear-gradient(135deg, #faf7ee 0%, #f4edd4 60%, #e2d9bc 100%)',
    accentColors: ['#78350f', '#f59e0b', '#16a34a'],
    template: {
      id: 'paper-doodle',
      name: 'Paper Doodle & Sketch',
      layoutType: 'split-modern',
      illustrationLayout: 'single',
      answerLayout: 'vertical-list',
      countdownStyle: 'badge',
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
          backgroundColor: '#faf7ee',
          blur: 0
        },
        header: {
          x: 6, y: 5, width: 88, height: 6,
          enabled: true,
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 16,
          fontWeight: '700',
          color: '#78350f'
        },
        quizTitle: {
          x: 6, y: 6, width: 88, height: 6,
          enabled: true,
          badgeStyle: true,
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 19,
          fontWeight: '800',
          color: '#78350f',
          backgroundColor: '#fef08a',
          borderRadius: 12,
          borderWidth: 2,
          borderColor: '#78350f',
          borderStyle: 'solid'
        },
        questionNumber: {
          x: 6, y: 13, width: 88, height: 5,
          format: 'câu-n',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 14,
          fontWeight: '700',
          color: '#c2410c'
        },
        illustration: {
          x: 6, y: 19, width: 88, height: 26,
          borderRadius: 16,
          borderWidth: 2.5,
          borderColor: '#78350f',
          borderStyle: 'dashed',
          objectFit: 'cover'
        },
        questionBox: {
          x: 6, y: 20, width: 88, height: 24,
          shape: 'doodle',
          borderRadius: 18,
          borderWidth: 2.5,
          borderColor: '#1e293b',
          borderStyle: 'dashed',
          backgroundColor: '#ffffff',
          bgOpacity: 0.98,
          color: '#0f172a',
          textColor: '#0f172a',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 22,
          fontWeight: '800',
          boxShadow: '0 4px 15px rgba(120, 53, 15, 0.1)',
          padding: 16,
          animation: 'pop'
        },
        answerButtons: {
          x: 6, y: 48, width: 88, height: 27,
          layoutComposition: 'stacked',
          useIndividualStyles: true,
          shape: 'doodle',
          markerHighlight: true,
          readTts: true,
          options: {
            A: {
              x: 6, y: 48, width: 86, height: 8.5,
              rotation: -1.5,
              shape: 'doodle',
              borderStyle: 'dashed',
              borderWidth: 2.5,
              borderColor: '#1e293b',
              backgroundColor: '#ffffff',
              textColor: '#0f172a',
              fontSize: 19,
              fontWeight: '700',
              labelShape: 'circle',
              labelBgColor: '#fef08a',
              labelColor: '#78350f'
            },
            B: {
              x: 8, y: 59, width: 86, height: 8.5,
              rotation: 1.8,
              shape: 'doodle',
              borderStyle: 'dashed',
              borderWidth: 2.5,
              borderColor: '#1e293b',
              backgroundColor: '#ffffff',
              textColor: '#0f172a',
              fontSize: 19,
              fontWeight: '700',
              labelShape: 'circle',
              labelBgColor: '#fed7aa',
              labelColor: '#9a3412'
            },
            C: {
              x: 6, y: 70, width: 86, height: 8.5,
              rotation: -1.0,
              shape: 'doodle',
              borderStyle: 'dashed',
              borderWidth: 2.5,
              borderColor: '#1e293b',
              backgroundColor: '#ffffff',
              textColor: '#0f172a',
              fontSize: 19,
              fontWeight: '700',
              labelShape: 'circle',
              labelBgColor: '#bbf7d0',
              labelColor: '#166534'
            }
          }
        },
        countdown: {
          x: 35, y: 10, width: 30, height: 6,
          countdownStyle: 'badge',
          strokeWidth: 2,
          color: '#78350f',
          warningColor: '#dc2626',
          showIcon: true,
          fontSize: 22,
          fontWeight: '800'
        },
        explanation: {
          enabled: true,
          readTts: true,
          displayDurationSec: 3.0,
          showIcon: true,
          x: 6, y: 82, width: 88, height: 11,
          shape: 'doodle',
          borderRadius: 16,
          borderWidth: 2,
          borderColor: '#ca8a04',
          borderStyle: 'solid',
          backgroundColor: '#fffbeb',
          bgOpacity: 1,
          color: '#78350f',
          textColor: '#78350f',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 15,
          fontWeight: '600',
          padding: 12,
          titleText: 'GIẢI THÍCH CHI TIẾT'
        },
        logo: {
          x: 82, y: 4, width: 12, height: 6,
          showLogo: true,
          logoSize: 42
        }
      }
    },
    branding: {
      identity: { channelName: 'Paper Doodle' },
      colors: {
        primary: '#78350f',
        secondary: '#f59e0b',
        correct: '#ca8a04',
        wrong: '#dc2626',
        background: '#faf7ee',
        cardBg: '#ffffff',
        text: '#0f172a',
        accent: '#f59e0b'
      }
    }
  },

  // ---------------------------------------------------------------------------
  // PRESET 6 — GAMING HUD & SCI-FI (45° Chamfer Hexagon / Split Left-Right)
  // ---------------------------------------------------------------------------
  {
    id: 'gaming-hud',
    name: 'Gaming HUD & Sci-Fi',
    tag: 'Cột Trái - Phải / Vát Góc 45°',
    description: 'Bố cục Game eSports: A & C cột bên trái, B thẻ dài chiến thuật cột bên phải, góc vát chamfer polygon 45° và nhãn lục giác.',
    icon: '🎮',
    previewGradient: 'linear-gradient(135deg, #020617 0%, #082f49 50%, #00f0ff 100%)',
    accentColors: ['#00f0ff', '#a855f7', '#00f59b'],
    template: {
      id: 'gaming-hud',
      name: 'Gaming HUD & Sci-Fi',
      layoutType: 'split-modern',
      illustrationLayout: 'single',
      answerLayout: 'vertical-list',
      countdownStyle: 'pill-timer',
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
          type: 'neon',
          neonPresetId: 'energy-lines',
          neonColor1: '#00f0ff',
          neonColor2: '#a855f7',
          neonColor3: '#0ea5e9',
          neonSpeed: 1.5,
          neonIntensity: 35
        },
        header: {
          x: 6, y: 5, width: 88, height: 6,
          enabled: true,
          badgeStyle: true,
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 16,
          fontWeight: '800',
          color: '#00f0ff'
        },
        quizTitle: {
          x: 6, y: 6, width: 88, height: 6,
          enabled: true,
          badgeStyle: true,
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 19,
          fontWeight: '800',
          color: '#ffffff',
          backgroundColor: 'rgba(2, 6, 23, 0.85)',
          borderWidth: 2,
          borderColor: '#00f0ff',
          shape: 'hud',
          chamferSize: 10
        },
        questionNumber: {
          x: 6, y: 13, width: 88, height: 5,
          format: 'q-n',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 14,
          fontWeight: '800',
          color: '#00f0ff'
        },
        illustration: {
          x: 6, y: 18, width: 88, height: 26,
          shape: 'hud',
          chamferSize: 14,
          borderWidth: 2,
          borderColor: '#00f0ff',
          objectFit: 'cover'
        },
        questionBox: {
          x: 6, y: 18, width: 88, height: 24,
          shape: 'hud',
          chamferSize: 16,
          borderWidth: 2,
          borderColor: '#00f0ff',
          backgroundColor: '#050515',
          bgOpacity: 0.92,
          color: '#ffffff',
          textColor: '#ffffff',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 22,
          fontWeight: '800',
          boxShadow: '0 0 20px rgba(0, 240, 255, 0.3)',
          padding: 16,
          animation: 'slide-up'
        },
        answerButtons: {
          x: 6, y: 46, width: 88, height: 32,
          layoutComposition: 'split-left-right',
          useIndividualStyles: true,
          readTts: true,
          shape: 'hud',
          options: {
            A: {
              x: 6, y: 46, width: 42, height: 14,
              shape: 'hud',
              chamferSize: 12,
              borderWidth: 2,
              borderColor: '#00f0ff',
              backgroundColor: '#0a0d24',
              textColor: '#ffffff',
              fontSize: 17,
              fontWeight: '700',
              labelShape: 'hexagon',
              labelBgColor: '#00f0ff',
              labelColor: '#020617'
            },
            C: {
              x: 6, y: 63, width: 42, height: 14,
              shape: 'hud',
              chamferSize: 12,
              borderWidth: 2,
              borderColor: '#00f0ff',
              backgroundColor: '#0a0d24',
              textColor: '#ffffff',
              fontSize: 17,
              fontWeight: '700',
              labelShape: 'hexagon',
              labelBgColor: '#00f0ff',
              labelColor: '#020617'
            },
            B: {
              x: 52, y: 46, width: 42, height: 31,
              shape: 'hud',
              chamferSize: 16,
              borderWidth: 2.5,
              borderColor: '#a855f7',
              backgroundColor: '#100a28',
              textColor: '#ffffff',
              fontSize: 18,
              fontWeight: '800',
              labelShape: 'hexagon',
              labelBgColor: '#a855f7',
              labelColor: '#ffffff'
            }
          }
        },
        countdown: {
          x: 32, y: 10, width: 36, height: 6,
          countdownStyle: 'pill-timer',
          strokeWidth: 2,
          color: '#00f0ff',
          warningColor: '#ff007f',
          showIcon: true,
          fontSize: 22,
          fontWeight: '800'
        },
        explanation: {
          enabled: true,
          readTts: true,
          displayDurationSec: 3.0,
          showIcon: true,
          x: 6, y: 81, width: 88, height: 11,
          shape: 'hud',
          chamferSize: 12,
          borderWidth: 2,
          borderColor: '#00f0ff',
          backgroundColor: '#050515',
          bgOpacity: 0.95,
          color: '#ffffff',
          textColor: '#ffffff',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 14,
          fontWeight: '600',
          boxShadow: '0 0 16px rgba(0, 240, 255, 0.3)',
          padding: 12,
          titleText: 'INTEL / GIẢI THÍCH'
        },
        logo: {
          x: 82, y: 4, width: 12, height: 6,
          showLogo: true,
          logoSize: 42
        }
      }
    },
    branding: {
      identity: { channelName: 'Gaming HUD' },
      colors: {
        primary: '#00f0ff',
        secondary: '#a855f7',
        correct: '#00f59b',
        wrong: '#ff007f',
        background: '#020617',
        cardBg: '#050515',
        text: '#ffffff',
        accent: '#00f0ff'
      }
    }
  },

  // ---------------------------------------------------------------------------
  // PRESET 7 — GRADIENT WAVE (Triangle Composition / Fluid Capsules)
  // ---------------------------------------------------------------------------
  {
    id: 'gradient-wave',
    name: 'Gradient Wave',
    tag: 'Tam Giác Triangle / Sóng Mềm',
    description: 'Bố cục dạng tam giác: A ở đỉnh giữa, B & C ở 2 góc đáy, các thẻ Capsule bo tròn mềm mại kết hợp sóng ánh sáng chuyển động.',
    icon: '🌊',
    previewGradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #7c3aed 80%, #06b6d4 100%)',
    accentColors: ['#a78bfa', '#38bdf8', '#34d399'],
    template: {
      id: 'gradient-wave',
      name: 'Gradient Wave',
      layoutType: 'split-modern',
      illustrationLayout: 'single',
      answerLayout: 'vertical-list',
      countdownStyle: 'circle-radial',
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
          type: 'neon',
          neonPresetId: 'light-waves',
          neonColor1: '#7c3aed',
          neonColor2: '#38bdf8',
          neonColor3: '#ec4899',
          neonSpeed: 1.0,
          neonIntensity: 30
        },
        header: {
          x: 8, y: 5, width: 84, height: 6,
          enabled: true,
          fontFamily: 'Inter, sans-serif',
          fontSize: 16,
          fontWeight: '700',
          color: '#c4b5fd'
        },
        quizTitle: {
          x: 8, y: 6, width: 84, height: 6,
          enabled: true,
          badgeStyle: true,
          fontFamily: 'Inter, sans-serif',
          fontSize: 19,
          fontWeight: '700',
          color: '#ffffff',
          backgroundColor: 'rgba(49, 46, 129, 0.7)',
          borderRadius: 9999,
          borderWidth: 1.5,
          borderColor: '#a78bfa'
        },
        questionNumber: {
          x: 8, y: 13, width: 84, height: 5,
          format: 'câu-n',
          fontFamily: 'Inter, sans-serif',
          fontSize: 14,
          fontWeight: '600',
          color: '#a78bfa'
        },
        illustration: {
          x: 8, y: 19, width: 84, height: 26,
          borderRadius: 24,
          borderWidth: 2,
          borderColor: '#a78bfa',
          objectFit: 'cover'
        },
        questionBox: {
          x: 8, y: 20, width: 84, height: 22,
          shape: 'rounded',
          borderRadius: 28,
          borderWidth: 2,
          borderColor: '#a78bfa',
          backgroundColor: '#1e1b4b',
          bgOpacity: 0.88,
          color: '#ffffff',
          textColor: '#ffffff',
          fontFamily: 'Inter, sans-serif',
          fontSize: 22,
          fontWeight: '700',
          boxShadow: '0 8px 30px rgba(124, 58, 237, 0.25)',
          padding: 16,
          animation: 'fade'
        },
        answerButtons: {
          x: 6, y: 48, width: 88, height: 28,
          layoutComposition: 'triangle',
          useIndividualStyles: true,
          readTts: true,
          options: {
            A: {
              x: 16, y: 48, width: 68, height: 11,
              shape: 'pill',
              borderRadius: 9999,
              backgroundColor: '#2e1065',
              textColor: '#ffffff',
              borderWidth: 2,
              borderColor: '#a78bfa',
              fontSize: 18,
              fontWeight: '600',
              labelShape: 'pill',
              labelBgColor: '#a78bfa',
              labelColor: '#2e1065'
            },
            B: {
              x: 6, y: 62, width: 42, height: 14,
              shape: 'pill',
              borderRadius: 9999,
              backgroundColor: '#1e1b4b',
              textColor: '#ffffff',
              borderWidth: 2,
              borderColor: '#38bdf8',
              fontSize: 17,
              fontWeight: '600',
              labelShape: 'circle',
              labelBgColor: '#38bdf8',
              labelColor: '#0f172a'
            },
            C: {
              x: 52, y: 62, width: 42, height: 14,
              shape: 'pill',
              borderRadius: 9999,
              backgroundColor: '#1e1b4b',
              textColor: '#ffffff',
              borderWidth: 2,
              borderColor: '#38bdf8',
              fontSize: 17,
              fontWeight: '600',
              labelShape: 'circle',
              labelBgColor: '#38bdf8',
              labelColor: '#0f172a'
            }
          }
        },
        countdown: {
          x: 38, y: 11, width: 24, height: 24,
          countdownStyle: 'circle-radial',
          strokeWidth: 5,
          color: '#a78bfa',
          warningColor: '#f43f5e',
          showIcon: false,
          fontSize: 28,
          fontWeight: '700'
        },
        explanation: {
          enabled: true,
          readTts: true,
          displayDurationSec: 3.0,
          showIcon: true,
          x: 8, y: 81, width: 84, height: 11,
          shape: 'pill',
          borderRadius: 9999,
          borderWidth: 2,
          borderColor: '#a78bfa',
          backgroundColor: '#1e1b4b',
          bgOpacity: 0.95,
          color: '#ffffff',
          textColor: '#ffffff',
          fontFamily: 'Inter, sans-serif',
          fontSize: 15,
          fontWeight: '500',
          boxShadow: '0 8px 30px rgba(124, 58, 237, 0.3)',
          padding: 12,
          titleText: 'GIẢI THÍCH CHI TIẾT'
        },
        logo: {
          x: 82, y: 4, width: 12, height: 6,
          showLogo: true,
          logoSize: 42
        }
      }
    },
    branding: {
      identity: { channelName: 'Gradient Wave' },
      colors: {
        primary: '#a78bfa',
        secondary: '#38bdf8',
        correct: '#34d399',
        wrong: '#f43f5e',
        background: '#1e1b4b',
        cardBg: '#2e1065',
        text: '#ffffff',
        accent: '#a78bfa'
      }
    }
  },

  // ---------------------------------------------------------------------------
  // PRESET 8 — CLEAN COLOR BLOCK (Swiss Design / Multi Solid Color Blocks)
  // ---------------------------------------------------------------------------
  {
    id: 'clean-color-block',
    name: 'Clean Color Block',
    tag: 'Swiss Multi-Block / 3 Màu Tương Phản',
    description: 'Phong cách đồ họa Thụy Sĩ: 3 khối đáp án mang 3 gam màu nổi bật (Xanh Navy, Cam Rực, Xanh Rừng), nhãn vuông geometric.',
    icon: '🟩',
    previewGradient: 'linear-gradient(135deg, #1e40af 0%, #ea580c 50%, #059669 100%)',
    accentColors: ['#1d4ed8', '#ea580c', '#059669'],
    template: {
      id: 'clean-color-block',
      name: 'Clean Color Block',
      layoutType: 'split-modern',
      illustrationLayout: 'single',
      answerLayout: 'vertical-list',
      countdownStyle: 'bar-horizontal',
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
          backgroundColor: '#0f172a',
          blur: 0
        },
        header: {
          x: 6, y: 5, width: 88, height: 6,
          enabled: true,
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 16,
          fontWeight: '800',
          color: '#ffffff'
        },
        quizTitle: {
          x: 6, y: 6, width: 88, height: 6,
          enabled: true,
          badgeStyle: true,
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 20,
          fontWeight: '900',
          color: '#ffffff',
          backgroundColor: '#1e293b',
          borderRadius: 6,
          borderWidth: 2,
          borderColor: '#38bdf8'
        },
        questionNumber: {
          x: 6, y: 13, width: 88, height: 5,
          format: 'badge',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 14,
          fontWeight: '800',
          color: '#38bdf8'
        },
        illustration: {
          x: 6, y: 19, width: 88, height: 26,
          borderRadius: 6,
          borderWidth: 2,
          borderColor: '#38bdf8',
          objectFit: 'cover'
        },
        questionBox: {
          x: 6, y: 20, width: 88, height: 22,
          shape: 'rounded',
          borderRadius: 6,
          borderWidth: 2,
          borderColor: '#475569',
          backgroundColor: '#1e293b',
          bgOpacity: 0.95,
          color: '#ffffff',
          textColor: '#ffffff',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 22,
          fontWeight: '800',
          boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
          padding: 16,
          animation: 'slide-up'
        },
        answerButtons: {
          x: 6, y: 47, width: 88, height: 28,
          layoutComposition: 'stacked',
          useIndividualStyles: true,
          readTts: true,
          options: {
            A: {
              x: 6, y: 46, width: 88, height: 8.5,
              shape: 'rounded',
              borderRadius: 6,
              backgroundColor: '#1d4ed8',
              textColor: '#ffffff',
              borderWidth: 2,
              borderColor: '#3b82f6',
              fontSize: 19,
              fontWeight: '800',
              labelShape: 'square',
              labelBgColor: '#ffffff',
              labelColor: '#1d4ed8'
            },
            B: {
              x: 6, y: 57, width: 88, height: 8.5,
              shape: 'rounded',
              borderRadius: 6,
              backgroundColor: '#c2410c',
              textColor: '#ffffff',
              borderWidth: 2,
              borderColor: '#f97316',
              fontSize: 19,
              fontWeight: '800',
              labelShape: 'square',
              labelBgColor: '#ffffff',
              labelColor: '#c2410c'
            },
            C: {
              x: 6, y: 68, width: 88, height: 8.5,
              shape: 'rounded',
              borderRadius: 6,
              backgroundColor: '#047857',
              textColor: '#ffffff',
              borderWidth: 2,
              borderColor: '#10b981',
              fontSize: 19,
              fontWeight: '800',
              labelShape: 'square',
              labelBgColor: '#ffffff',
              labelColor: '#047857'
            }
          }
        },
        countdown: {
          x: 6, y: 11, width: 88, height: 4,
          countdownStyle: 'bar-horizontal',
          strokeWidth: 4,
          color: '#38bdf8',
          warningColor: '#ef4444',
          showIcon: false,
          fontSize: 18,
          fontWeight: '800'
        },
        explanation: {
          enabled: true,
          readTts: true,
          displayDurationSec: 3.0,
          showIcon: true,
          x: 6, y: 81, width: 88, height: 11,
          shape: 'rounded',
          borderRadius: 6,
          borderWidth: 2,
          borderColor: '#10b981',
          backgroundColor: '#064e3b',
          bgOpacity: 0.95,
          color: '#ffffff',
          textColor: '#ffffff',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 15,
          fontWeight: '700',
          padding: 12,
          titleText: 'GIẢI THÍCH CHI TIẾT'
        },
        logo: {
          x: 82, y: 4, width: 12, height: 6,
          showLogo: true,
          logoSize: 40
        }
      }
    },
    branding: {
      identity: { channelName: 'Clean Color Block' },
      colors: {
        primary: '#38bdf8',
        secondary: '#f97316',
        correct: '#10b981',
        wrong: '#ef4444',
        background: '#0f172a',
        cardBg: '#1e293b',
        text: '#ffffff',
        accent: '#38bdf8'
      }
    }
  },

  // ---------------------------------------------------------------------------
  // PRESET 9 — SCIENCE & KNOWLEDGE (Telemetry Data Pods / Lab Interface)
  // ---------------------------------------------------------------------------
  {
    id: 'science-knowledge',
    name: 'Science & Knowledge',
    tag: 'Telemetry Pods / Viền Kỹ Thuật',
    description: 'Giao diện trạm nghiên cứu khoa học: Question viền chamfer 8px, các Pod phương án dạng chip dữ liệu telemetry.',
    icon: '🔬',
    previewGradient: 'linear-gradient(135deg, #030712 0%, #0c4a6e 60%, #38bdf8 100%)',
    accentColors: ['#38bdf8', '#0284c7', '#22c55e'],
    template: {
      id: 'science-knowledge',
      name: 'Science & Knowledge',
      layoutType: 'split-modern',
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
          type: 'neon',
          neonPresetId: 'particles',
          neonColor1: '#0284c7',
          neonColor2: '#38bdf8',
          neonColor3: '#0f172a',
          neonSpeed: 0.9,
          neonIntensity: 25
        },
        header: {
          x: 6, y: 5, width: 88, height: 6,
          enabled: true,
          badgeStyle: true,
          fontFamily: 'Inter, sans-serif',
          fontSize: 15,
          fontWeight: '700',
          color: '#38bdf8'
        },
        quizTitle: {
          x: 6, y: 6, width: 88, height: 6,
          enabled: true,
          badgeStyle: true,
          fontFamily: 'Inter, sans-serif',
          fontSize: 19,
          fontWeight: '700',
          color: '#ffffff',
          backgroundColor: '#082f49',
          borderWidth: 1.5,
          borderColor: '#38bdf8',
          shape: 'hud',
          chamferSize: 8
        },
        questionNumber: {
          x: 6, y: 13, width: 88, height: 5,
          format: 'câu-n',
          fontFamily: 'Inter, sans-serif',
          fontSize: 14,
          fontWeight: '600',
          color: '#38bdf8'
        },
        illustration: {
          x: 6, y: 18, width: 88, height: 26,
          shape: 'hud',
          chamferSize: 10,
          borderWidth: 1.5,
          borderColor: '#0284c7',
          objectFit: 'cover'
        },
        questionBox: {
          x: 6, y: 18, width: 88, height: 24,
          shape: 'hud',
          chamferSize: 10,
          borderWidth: 1.5,
          borderColor: '#38bdf8',
          backgroundColor: '#030712',
          bgOpacity: 0.92,
          color: '#ffffff',
          textColor: '#ffffff',
          fontFamily: 'Inter, sans-serif',
          fontSize: 22,
          fontWeight: '700',
          boxShadow: '0 0 16px rgba(56, 189, 248, 0.25)',
          padding: 16,
          animation: 'fade'
        },
        answerButtons: {
          x: 6, y: 48, width: 88, height: 27,
          layoutComposition: 'staggered',
          useIndividualStyles: true,
          readTts: true,
          shape: 'hud',
          options: {
            A: {
              x: 6, y: 47, width: 84, height: 8.5,
              shape: 'hud',
              chamferSize: 8,
              borderWidth: 1.5,
              borderColor: '#0284c7',
              backgroundColor: '#082f49',
              textColor: '#f0f9ff',
              fontSize: 18,
              fontWeight: '600',
              labelShape: 'hexagon',
              labelBgColor: '#0284c7',
              labelColor: '#ffffff'
            },
            B: {
              x: 10, y: 58, width: 84, height: 8.5,
              shape: 'hud',
              chamferSize: 8,
              borderWidth: 1.5,
              borderColor: '#0284c7',
              backgroundColor: '#082f49',
              textColor: '#f0f9ff',
              fontSize: 18,
              fontWeight: '600',
              labelShape: 'hexagon',
              labelBgColor: '#0284c7',
              labelColor: '#ffffff'
            },
            C: {
              x: 6, y: 69, width: 84, height: 8.5,
              shape: 'hud',
              chamferSize: 8,
              borderWidth: 1.5,
              borderColor: '#0284c7',
              backgroundColor: '#082f49',
              textColor: '#f0f9ff',
              fontSize: 18,
              fontWeight: '600',
              labelShape: 'hexagon',
              labelBgColor: '#0284c7',
              labelColor: '#ffffff'
            }
          }
        },
        countdown: {
          x: 35, y: 11, width: 30, height: 6,
          countdownStyle: 'pill-timer',
          strokeWidth: 2,
          color: '#38bdf8',
          warningColor: '#f43f5e',
          showIcon: true,
          fontSize: 22,
          fontWeight: '700'
        },
        explanation: {
          enabled: true,
          readTts: true,
          displayDurationSec: 3.0,
          showIcon: true,
          x: 6, y: 81, width: 88, height: 11,
          shape: 'hud',
          chamferSize: 8,
          borderWidth: 1.5,
          borderColor: '#38bdf8',
          backgroundColor: '#030712',
          bgOpacity: 0.95,
          color: '#ffffff',
          textColor: '#ffffff',
          fontFamily: 'Inter, sans-serif',
          fontSize: 14,
          fontWeight: '500',
          padding: 12,
          titleText: 'DỮ LIỆU GIẢI THÍCH'
        },
        logo: {
          x: 82, y: 4, width: 12, height: 6,
          showLogo: true,
          logoSize: 40
        }
      }
    },
    branding: {
      identity: { channelName: 'Science' },
      colors: {
        primary: '#38bdf8',
        secondary: '#0284c7',
        correct: '#22c55e',
        wrong: '#f43f5e',
        background: '#030712',
        cardBg: '#082f49',
        text: '#ffffff',
        accent: '#38bdf8'
      }
    }
  },

  // ---------------------------------------------------------------------------
  // PRESET 10 — DARK GLOW (Central Floating Capsules / Deep Aurora)
  // ---------------------------------------------------------------------------
  {
    id: 'dark-glow',
    name: 'Dark Glow',
    tag: 'Tâm Điểm Nổi Bật / Cực Quang',
    description: 'Nền đen vô cực với cực quang Aurora xanh ngọc ma mị, các viên nhộng Floating Pill tập trung ở tâm điểm phát sáng nổi bật.',
    icon: '🔮',
    previewGradient: 'linear-gradient(135deg, #000000 0%, #064e3b 50%, #10b981 100%)',
    accentColors: ['#10b981', '#34d399', '#6ee7b7'],
    template: {
      id: 'dark-glow',
      name: 'Dark Glow',
      layoutType: 'split-modern',
      illustrationLayout: 'single',
      answerLayout: 'vertical-list',
      countdownStyle: 'circle-radial',
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
          type: 'neon',
          neonPresetId: 'aurora-neon',
          neonColor1: '#10b981',
          neonColor2: '#064e3b',
          neonColor3: '#047857',
          neonSpeed: 0.8,
          neonIntensity: 30,
          blur: 10
        },
        header: {
          x: 8, y: 5, width: 84, height: 6,
          enabled: true,
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 16,
          fontWeight: '700',
          color: '#34d399'
        },
        quizTitle: {
          x: 8, y: 6, width: 84, height: 6,
          enabled: true,
          badgeStyle: true,
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 19,
          fontWeight: '800',
          color: '#ffffff',
          backgroundColor: '#041c14',
          borderRadius: 9999,
          borderWidth: 1.5,
          borderColor: '#10b981',
          boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
        },
        questionNumber: {
          x: 8, y: 13, width: 84, height: 5,
          format: 'câu-n',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 14,
          fontWeight: '700',
          color: '#34d399'
        },
        illustration: {
          x: 8, y: 19, width: 84, height: 26,
          borderRadius: 24,
          borderWidth: 2,
          borderColor: '#10b981',
          objectFit: 'cover'
        },
        questionBox: {
          x: 8, y: 22, width: 84, height: 20,
          shape: 'pill',
          borderRadius: 9999,
          borderWidth: 2,
          borderColor: '#10b981',
          backgroundColor: '#020e0a',
          bgOpacity: 0.9,
          color: '#ffffff',
          textColor: '#ffffff',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 22,
          fontWeight: '700',
          boxShadow: '0 0 28px rgba(16, 185, 129, 0.35)',
          padding: 16,
          animation: 'pop'
        },
        answerButtons: {
          x: 8, y: 50, width: 84, height: 25,
          shape: 'pill',
          layoutComposition: 'stacked',
          optionBadgeShape: 'pill',
          readTts: true,
          gap: 12,
          borderRadius: 9999,
          borderWidth: 1.5,
          borderColor: '#10b981',
          backgroundColor: '#041812',
          bgOpacity: 0.9,
          color: '#ffffff',
          textColor: '#ffffff',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 19,
          fontWeight: '600',
          boxShadow: '0 0 16px rgba(16, 185, 129, 0.25)',
          padding: 12,
          animation: 'pop'
        },
        countdown: {
          x: 38, y: 11, width: 24, height: 24,
          countdownStyle: 'circle-radial',
          strokeWidth: 5,
          color: '#34d399',
          warningColor: '#f43f5e',
          showIcon: false,
          fontSize: 28,
          fontWeight: '800'
        },
        explanation: {
          enabled: true,
          readTts: true,
          displayDurationSec: 3.0,
          showIcon: true,
          x: 8, y: 81, width: 84, height: 10,
          shape: 'pill',
          borderRadius: 9999,
          borderWidth: 2,
          borderColor: '#10b981',
          backgroundColor: '#020e0a',
          bgOpacity: 0.95,
          color: '#ffffff',
          textColor: '#ffffff',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 15,
          fontWeight: '600',
          boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)',
          padding: 12,
          titleText: 'GIẢI THÍCH CHI TIẾT'
        },
        logo: {
          x: 82, y: 4, width: 12, height: 6,
          showLogo: true,
          logoSize: 42
        }
      }
    },
    branding: {
      identity: { channelName: 'Dark Glow' },
      colors: {
        primary: '#10b981',
        secondary: '#064e3b',
        correct: '#34d399',
        wrong: '#f43f5e',
        background: '#000000',
        cardBg: '#020e0a',
        text: '#ffffff',
        accent: '#10b981'
      }
    }
  }
];

export function applyUiPreset(
  presetId: string,
  currentTemplate: VideoTemplate,
  currentChannel: Channel
): { template: VideoTemplate; channel: Channel } {
  const found = UI_PRESETS.find(p => p.id === presetId) || UI_PRESETS[0];

  const newTemplate: VideoTemplate = {
    ...JSON.parse(JSON.stringify(found.template)),
    id: currentTemplate.id,
    name: found.name
  };

  const headingFont = found.branding?.typography?.headingFont || currentChannel.branding?.fonts?.primary || 'Montserrat, sans-serif';
  const bodyFont = found.branding?.typography?.bodyFont || currentChannel.branding?.fonts?.secondary || 'Be Vietnam Pro, sans-serif';

  const currentColors = currentChannel.branding?.colors || {};
  const currentIdentity = currentChannel.branding?.identity || {};

  const newChannel: Channel = {
    ...currentChannel,
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
