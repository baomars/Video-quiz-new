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
  // TEMPLATE 02 — SPLIT SCREEN (Sky Blue + Yellow / Chia Đôi Cột)
  // ---------------------------------------------------------------------------
  {
    id: 'tmpl-split-screen',
    name: '02. Split Screen',
    tag: 'Chia Đôi • Sky Blue + Yellow',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    description: 'Cột trái chứa Câu hỏi & Ảnh minh họa, cột phải xếp 3 đáp án dạng Pill kéo dài không theo card 3 hàng thông thường.',
    icon: '⚡',
    previewGradient: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 50%, #fef08a 100%)',
    accentColors: ['#0284c7', '#fde047', '#f59e0b'],
    branding: {
      colors: {
        primary: '#0284c7',
        secondary: '#fde047',
        accent: '#f59e0b',
        background: '#f0f9ff',
        cardBg: '#ffffff',
        text: '#0c4a6e',
        correct: '#15803d',
        wrong: '#b91c1c',
        border: '#7dd3fc'
      }
    },
    template: {
      id: 'tmpl-split-screen',
      name: 'Split Screen',
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
          type: 'gradient',
          backgroundColor: '#f0f9ff',
          secondaryColor: '#fef9c3',
          gradientAngle: 120
        },
        quizTitle: {
          x: 5, y: 5, width: 44, height: 6,
          enabled: true,
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 16,
          fontWeight: '900',
          color: '#0369a1',
          backgroundColor: '#e0f2fe',
          borderRadius: 14,
          borderWidth: 1.5,
          borderColor: '#7dd3fc'
        },
        questionNumber: {
          x: 5, y: 12, width: 44, height: 4,
          format: 'q-n',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 13,
          fontWeight: '800',
          color: '#0284c7'
        },
        questionBox: {
          x: 5, y: 17, width: 44, height: 32,
          shape: 'rounded',
          borderRadius: 22,
          borderWidth: 2,
          borderColor: '#38bdf8',
          backgroundColor: '#ffffff',
          bgOpacity: 0.98,
          color: '#0c4a6e',
          textColor: '#0c4a6e',
          fontFamily: 'Be Vietnam Pro, sans-serif',
          fontSize: 20,
          fontWeight: '700',
          boxShadow: '0 8px 24px rgba(2, 132, 199, 0.12)',
          padding: 16,
          animation: 'pop'
        },
        illustration: {
          x: 5, y: 51, width: 44, height: 32,
          borderRadius: 20,
          borderWidth: 2,
          borderColor: '#fde047',
          objectFit: 'cover'
        },
        answerButtons: {
          x: 51, y: 17, width: 44, height: 66,
          shape: 'pill',
          layoutComposition: 'stacked',
          optionBadgeShape: 'circle',
          readTts: true,
          gap: 14,
          borderRadius: 9999,
          borderWidth: 2,
          borderColor: '#fde047',
          backgroundColor: '#ffffff',
          bgOpacity: 0.98,
          color: '#1e293b',
          textColor: '#1e293b',
          fontFamily: 'Be Vietnam Pro, sans-serif',
          fontSize: 17,
          fontWeight: '700',
          boxShadow: '0 4px 14px rgba(245, 158, 11, 0.15)',
          padding: 14,
          animation: 'slide-up'
        },
        countdown: {
          x: 51, y: 8, width: 44, height: 6,
          countdownStyle: 'badge',
          strokeWidth: 2,
          color: '#0369a1',
          warningColor: '#dc2626',
          fontSize: 18,
          fontWeight: '800'
        },
        explanation: {
          enabled: true,
          readTts: true,
          displayDurationSec: 3.0,
          showIcon: true,
          x: 5, y: 85, width: 90, height: 11,
          shape: 'rounded',
          borderRadius: 16,
          borderWidth: 1.5,
          borderColor: '#86efac',
          backgroundColor: '#ffffff',
          color: '#14532d',
          textColor: '#14532d',
          fontFamily: 'Be Vietnam Pro, sans-serif',
          fontSize: 14,
          fontWeight: '500',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08)',
          padding: 12
        }
      }
    }
  },

  // ---------------------------------------------------------------------------
  // TEMPLATE 03 — TRIANGLE (Cream + Orange / Tam Giác Ba Góc)
  // ---------------------------------------------------------------------------
  {
    id: 'tmpl-triangle',
    name: '03. Triangle',
    tag: 'Tam Giác • Cream + Orange',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    description: 'Câu hỏi ở trung tâm, A ở đỉnh tam giác trên, B & C ở 2 góc đáy, đồng hồ đếm ngược radial ở giữa.',
    icon: '🔺',
    previewGradient: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%)',
    accentColors: ['#f97316', '#ea580c', '#fb923c'],
    branding: {
      colors: {
        primary: '#ea580c',
        secondary: '#f97316',
        accent: '#fb923c',
        background: '#fff7ed',
        cardBg: '#ffffff',
        text: '#431407',
        correct: '#16a34a',
        wrong: '#dc2626',
        border: '#fed7aa'
      }
    },
    template: {
      id: 'tmpl-triangle',
      name: 'Triangle',
      layoutType: 'split-modern',
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
          type: 'gradient',
          backgroundColor: '#fff7ed',
          secondaryColor: '#fef3c7',
          gradientAngle: 150
        },
        quizTitle: {
          x: 6, y: 5, width: 88, height: 5,
          enabled: true,
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 17,
          fontWeight: '900',
          color: '#9a3412',
          backgroundColor: '#ffedd5',
          borderRadius: 14,
          borderWidth: 1.5,
          borderColor: '#fdba74'
        },
        questionNumber: {
          x: 6, y: 11, width: 88, height: 4,
          format: 'câu-n',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 14,
          fontWeight: '800',
          color: '#ea580c'
        },
        questionBox: {
          x: 8, y: 16, width: 84, height: 23,
          shape: 'rounded',
          borderRadius: 24,
          borderWidth: 2,
          borderColor: '#fb923c',
          backgroundColor: '#ffffff',
          bgOpacity: 0.98,
          color: '#431407',
          textColor: '#431407',
          fontFamily: 'Be Vietnam Pro, sans-serif',
          fontSize: 22,
          fontWeight: '700',
          boxShadow: '0 10px 25px rgba(234, 88, 12, 0.1)',
          padding: 16,
          animation: 'pop'
        },
        answerButtons: {
          x: 6, y: 43, width: 88, height: 38,
          shape: 'pill',
          layoutComposition: 'triangle',
          optionBadgeShape: 'pill',
          readTts: true,
          borderRadius: 9999,
          borderWidth: 2,
          borderColor: '#fdba74',
          backgroundColor: '#ffffff',
          bgOpacity: 0.98,
          color: '#7c2d12',
          textColor: '#7c2d12',
          fontFamily: 'Be Vietnam Pro, sans-serif',
          fontSize: 17,
          fontWeight: '700',
          boxShadow: '0 6px 16px rgba(234, 88, 12, 0.12)',
          padding: 12,
          animation: 'slide-up'
        },
        countdown: {
          x: 38, y: 64, width: 24, height: 8,
          countdownStyle: 'circle-radial',
          strokeWidth: 3.5,
          color: '#ea580c',
          warningColor: '#dc2626',
          fontSize: 18,
          fontWeight: '900'
        },
        explanation: {
          enabled: true,
          readTts: true,
          displayDurationSec: 3.0,
          showIcon: true,
          x: 6, y: 84, width: 88, height: 11,
          shape: 'rounded',
          borderRadius: 18,
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
  // TEMPLATE 04 — ONE RIGHT TWO LEFT (Mint + Green / 1 Phải 2 Trái)
  // ---------------------------------------------------------------------------
  {
    id: 'tmpl-one-right-two-left',
    name: '04. One Right Two Left',
    tag: '1 Phải 2 Trái • Mint + Green',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    description: 'A và C nằm cột bên trái, B nằm bên phải dạng thẻ cao nổi bật (tall featured card), bố cục lệch tự nhiên.',
    icon: '🌿',
    previewGradient: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #a7f3d0 100%)',
    accentColors: ['#10b981', '#059669', '#34d399'],
    branding: {
      colors: {
        primary: '#059669',
        secondary: '#10b981',
        accent: '#34d399',
        background: '#ecfdf5',
        cardBg: '#ffffff',
        text: '#064e3b',
        correct: '#15803d',
        wrong: '#dc2626',
        border: '#a7f3d0'
      }
    },
    template: {
      id: 'tmpl-one-right-two-left',
      name: 'One Right Two Left',
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
          type: 'gradient',
          backgroundColor: '#ecfdf5',
          secondaryColor: '#f0fdf4',
          gradientAngle: 135
        },
        quizTitle: {
          x: 6, y: 5, width: 88, height: 5,
          enabled: true,
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 17,
          fontWeight: '900',
          color: '#065f46',
          backgroundColor: '#d1fae5',
          borderRadius: 14,
          borderWidth: 1.5,
          borderColor: '#6ee7b7'
        },
        questionNumber: {
          x: 6, y: 11, width: 88, height: 4,
          format: 'câu-n',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 14,
          fontWeight: '800',
          color: '#059669'
        },
        questionBox: {
          x: 6, y: 16, width: 88, height: 22,
          shape: 'rounded',
          borderRadius: 22,
          borderWidth: 2,
          borderColor: '#6ee7b7',
          backgroundColor: '#ffffff',
          bgOpacity: 0.98,
          color: '#064e3b',
          textColor: '#064e3b',
          fontFamily: 'Be Vietnam Pro, sans-serif',
          fontSize: 22,
          fontWeight: '700',
          boxShadow: '0 10px 24px rgba(5, 150, 105, 0.1)',
          padding: 16,
          animation: 'pop'
        },
        answerButtons: {
          x: 6, y: 42, width: 88, height: 38,
          shape: 'rounded',
          layoutComposition: 'one-right-two-left',
          optionBadgeShape: 'square',
          readTts: true,
          borderRadius: 18,
          borderWidth: 2,
          borderColor: '#a7f3d0',
          backgroundColor: '#ffffff',
          bgOpacity: 0.98,
          color: '#064e3b',
          textColor: '#064e3b',
          fontFamily: 'Be Vietnam Pro, sans-serif',
          fontSize: 17,
          fontWeight: '700',
          boxShadow: '0 6px 18px rgba(16, 185, 129, 0.12)',
          padding: 12,
          animation: 'slide-up'
        },
        countdown: {
          x: 34, y: 8, width: 32, height: 5,
          countdownStyle: 'pill-timer',
          strokeWidth: 2,
          color: '#059669',
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
          shape: 'rounded',
          borderRadius: 16,
          borderWidth: 1.5,
          borderColor: '#6ee7b7',
          backgroundColor: '#ffffff',
          color: '#065f46',
          textColor: '#065f46',
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
  // TEMPLATE 05 — CIRCULAR QUIZ (Lavender + White / Vòng Cung)
  // ---------------------------------------------------------------------------
  {
    id: 'tmpl-circular-quiz',
    name: '05. Circular Quiz',
    tag: 'Vòng Cung • Lavender + Violet',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    description: 'Khung câu hỏi hình Oval/Circle trung tâm, 3 đáp án uốn lượn so le theo vòng cung mềm mại, Countdown radial ở đỉnh.',
    icon: '🔮',
    previewGradient: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 50%, #e9d5ff 100%)',
    accentColors: ['#8b5cf6', '#7c3aed', '#c084fc'],
    branding: {
      colors: {
        primary: '#7c3aed',
        secondary: '#8b5cf6',
        accent: '#c084fc',
        background: '#faf5ff',
        cardBg: '#ffffff',
        text: '#2e1065',
        correct: '#16a34a',
        wrong: '#dc2626',
        border: '#ddd6fe'
      }
    },
    template: {
      id: 'tmpl-circular-quiz',
      name: 'Circular Quiz',
      layoutType: 'split-modern',
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
          type: 'gradient',
          backgroundColor: '#faf5ff',
          secondaryColor: '#ede9fe',
          gradientAngle: 160
        },
        quizTitle: {
          x: 6, y: 5, width: 88, height: 5,
          enabled: true,
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 17,
          fontWeight: '900',
          color: '#5b21b6',
          backgroundColor: '#ede9fe',
          borderRadius: 14,
          borderWidth: 1.5,
          borderColor: '#c4b5fd'
        },
        countdown: {
          x: 38, y: 13, width: 24, height: 9,
          countdownStyle: 'circle-radial',
          strokeWidth: 3.5,
          color: '#7c3aed',
          warningColor: '#dc2626',
          fontSize: 18,
          fontWeight: '900'
        },
        questionBox: {
          x: 8, y: 24, width: 84, height: 23,
          shape: 'pill',
          borderRadius: 9999,
          borderWidth: 2.5,
          borderColor: '#c4b5fd',
          backgroundColor: '#ffffff',
          bgOpacity: 0.98,
          color: '#2e1065',
          textColor: '#2e1065',
          fontFamily: 'Be Vietnam Pro, sans-serif',
          fontSize: 22,
          fontWeight: '700',
          boxShadow: '0 12px 28px rgba(124, 58, 237, 0.12)',
          padding: 18,
          animation: 'pop'
        },
        answerButtons: {
          x: 6, y: 50, width: 88, height: 32,
          shape: 'pill',
          layoutComposition: 'circular-arc',
          optionBadgeShape: 'circle',
          readTts: true,
          borderRadius: 9999,
          borderWidth: 1.5,
          borderColor: '#ddd6fe',
          backgroundColor: '#ffffff',
          bgOpacity: 0.98,
          color: '#2e1065',
          textColor: '#2e1065',
          fontFamily: 'Be Vietnam Pro, sans-serif',
          fontSize: 18,
          fontWeight: '600',
          boxShadow: '0 6px 18px rgba(124, 58, 237, 0.1)',
          padding: 12,
          animation: 'slide-up'
        },
        explanation: {
          enabled: true,
          readTts: true,
          displayDurationSec: 3.0,
          showIcon: true,
          x: 6, y: 84, width: 88, height: 11,
          shape: 'pill',
          borderRadius: 9999,
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
  // TEMPLATE 06 — FLOATING CARDS (Coral + Cream / Thẻ Bay Đa Chiều)
  // ---------------------------------------------------------------------------
  {
    id: 'tmpl-floating-cards',
    name: '06. Floating Cards',
    tag: 'Thẻ Bay • Coral + Cream',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    description: '3 thẻ đáp án A, B, C bay lơ lửng lệch vị trí và xoay góc nhẹ (-1.2°, +1.5°, -0.8°) tạo chiều sâu không gian.',
    icon: '🪶',
    previewGradient: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 50%, #fecdd3 100%)',
    accentColors: ['#f43f5e', '#fb7185', '#e11d48'],
    branding: {
      colors: {
        primary: '#f43f5e',
        secondary: '#fb7185',
        accent: '#e11d48',
        background: '#fff1f2',
        cardBg: '#ffffff',
        text: '#881337',
        correct: '#16a34a',
        wrong: '#dc2626',
        border: '#fecdd3'
      }
    },
    template: {
      id: 'tmpl-floating-cards',
      name: 'Floating Cards',
      layoutType: 'split-modern',
      illustrationLayout: 'single',
      answerLayout: 'vertical-list',
      countdownStyle: 'pill-timer',
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
          backgroundColor: '#fff1f2',
          secondaryColor: '#fffbeb',
          gradientAngle: 140
        },
        quizTitle: {
          x: 6, y: 5, width: 88, height: 5,
          enabled: true,
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 17,
          fontWeight: '900',
          color: '#9f1239',
          backgroundColor: '#ffe4e6',
          borderRadius: 14,
          borderWidth: 1.5,
          borderColor: '#fda4af'
        },
        questionNumber: {
          x: 6, y: 11, width: 88, height: 4,
          format: 'câu-n',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 14,
          fontWeight: '800',
          color: '#f43f5e'
        },
        questionBox: {
          x: 6, y: 16, width: 88, height: 23,
          shape: 'rounded',
          borderRadius: 24,
          borderWidth: 2,
          borderColor: '#fda4af',
          backgroundColor: '#ffffff',
          bgOpacity: 0.98,
          color: '#881337',
          textColor: '#881337',
          fontFamily: 'Be Vietnam Pro, sans-serif',
          fontSize: 22,
          fontWeight: '700',
          boxShadow: '0 12px 28px rgba(244, 63, 94, 0.12)',
          padding: 16,
          animation: 'pop'
        },
        answerButtons: {
          x: 6, y: 43, width: 88, height: 38,
          shape: 'rounded',
          layoutComposition: 'floating',
          optionBadgeShape: 'pill',
          popShadow: true,
          popShadowOffset: 4,
          popShadowColor: 'rgba(244, 63, 94, 0.25)',
          readTts: true,
          borderRadius: 20,
          borderWidth: 1.5,
          borderColor: '#fecdd3',
          backgroundColor: '#ffffff',
          bgOpacity: 0.98,
          color: '#881337',
          textColor: '#881337',
          fontFamily: 'Be Vietnam Pro, sans-serif',
          fontSize: 18,
          fontWeight: '700',
          padding: 12,
          animation: 'slide-up'
        },
        countdown: {
          x: 32, y: 8, width: 36, height: 5,
          countdownStyle: 'pill-timer',
          strokeWidth: 2,
          color: '#f43f5e',
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
          shape: 'rounded',
          borderRadius: 18,
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
  // TEMPLATE 08 — GAME HUD (Cyan + Dark Neon / Giao Diện Game Sci-Fi)
  // ---------------------------------------------------------------------------
  {
    id: 'tmpl-game-hud',
    name: '08. Game HUD',
    tag: 'Sci-Fi • Cyan + Dark Neon',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    description: 'Khung vát góc HUD 45°, nhãn Lục giác (Hexagon), đường kẻ radar cybernetic, Countdown radar tròn phong cách game tương lai.',
    icon: '🎮',
    previewGradient: 'linear-gradient(135deg, #050b14 0%, #0a192f 50%, #00f0ff 100%)',
    accentColors: ['#00f0ff', '#a855f7', '#00f59b'],
    branding: {
      colors: {
        primary: '#00f0ff',
        secondary: '#a855f7',
        accent: '#00f59b',
        background: '#050b14',
        cardBg: '#0f172a',
        text: '#ffffff',
        correct: '#00f59b',
        wrong: '#ff0055',
        border: '#00f0ff'
      }
    },
    template: {
      id: 'tmpl-game-hud',
      name: 'Game HUD',
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
          neonPresetId: 'cyber-glow',
          neonColor1: '#00f0ff',
          neonColor2: '#a855f7',
          neonColor3: '#050b14',
          neonSpeed: 1.0,
          neonIntensity: 25
        },
        quizTitle: {
          x: 6, y: 5, width: 88, height: 6,
          enabled: true,
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 17,
          fontWeight: '900',
          color: '#00f0ff',
          backgroundColor: '#0a192f',
          borderRadius: 4,
          borderWidth: 1.5,
          borderColor: '#00f0ff',
          shape: 'hud',
          chamferSize: 10
        },
        questionNumber: {
          x: 6, y: 12, width: 88, height: 4,
          format: 'q-n',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 13,
          fontWeight: '800',
          color: '#00f0ff'
        },
        questionBox: {
          x: 6, y: 17, width: 88, height: 23,
          shape: 'hud',
          chamferSize: 16,
          borderWidth: 2,
          borderColor: '#00f0ff',
          backgroundColor: '#070d19',
          bgOpacity: 0.92,
          color: '#ffffff',
          textColor: '#ffffff',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 22,
          fontWeight: '800',
          boxShadow: '0 0 20px rgba(0, 240, 255, 0.35)',
          padding: 16,
          animation: 'pop'
        },
        answerButtons: {
          x: 6, y: 44, width: 88, height: 38,
          shape: 'hud',
          layoutComposition: 'split-left-right',
          optionBadgeShape: 'hexagon',
          chamferSize: 12,
          readTts: true,
          borderWidth: 1.5,
          borderColor: '#00f0ff',
          backgroundColor: '#0a1526',
          bgOpacity: 0.9,
          color: '#ffffff',
          textColor: '#ffffff',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 17,
          fontWeight: '700',
          boxShadow: '0 0 15px rgba(0, 240, 255, 0.2)',
          padding: 12,
          animation: 'slide-up'
        },
        countdown: {
          x: 38, y: 7, width: 24, height: 8,
          countdownStyle: 'circle-radial',
          strokeWidth: 3.5,
          color: '#00f0ff',
          warningColor: '#ff0055',
          fontSize: 18,
          fontWeight: '900'
        },
        explanation: {
          enabled: true,
          readTts: true,
          displayDurationSec: 3.0,
          showIcon: true,
          x: 6, y: 84, width: 88, height: 11,
          shape: 'hud',
          chamferSize: 12,
          borderWidth: 1.5,
          borderColor: '#00f59b',
          backgroundColor: '#071618',
          color: '#00f59b',
          textColor: '#00f59b',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 13,
          fontWeight: '600',
          boxShadow: '0 0 20px rgba(0, 245, 155, 0.25)',
          padding: 12
        }
      }
    }
  },

  // ---------------------------------------------------------------------------
  // TEMPLATE 09 — KNOWLEDGE BOARD (White + Purple / Bảng Tri Thức)
  // ---------------------------------------------------------------------------
  {
    id: 'tmpl-knowledge-board',
    name: '09. Knowledge Board',
    tag: 'Bảng Tri Thức • White + Purple',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    description: 'Ảnh minh họa lớn làm tâm điểm tri thức, Khung câu hỏi dạng bảng thông tin khoa học, Đáp án xếp viền trang nhã.',
    icon: '📚',
    previewGradient: 'linear-gradient(135deg, #ffffff 0%, #f5f3ff 50%, #ede9fe 100%)',
    accentColors: ['#6366f1', '#7c3aed', '#4f46e5'],
    branding: {
      colors: {
        primary: '#4f46e5',
        secondary: '#6366f1',
        accent: '#7c3aed',
        background: '#ffffff',
        cardBg: '#faf5ff',
        text: '#1e1b4b',
        correct: '#15803d',
        wrong: '#b91c1c',
        border: '#c7d2fe'
      }
    },
    template: {
      id: 'tmpl-knowledge-board',
      name: 'Knowledge Board',
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
          backgroundColor: '#ffffff',
          secondaryColor: '#f5f3ff',
          gradientAngle: 180
        },
        quizTitle: {
          x: 6, y: 5, width: 88, height: 5,
          enabled: true,
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 17,
          fontWeight: '900',
          color: '#312e81',
          backgroundColor: '#e0e7ff',
          borderRadius: 12,
          borderWidth: 1.5,
          borderColor: '#a5b4fc'
        },
        illustration: {
          x: 6, y: 12, width: 88, height: 28,
          borderRadius: 20,
          borderWidth: 2,
          borderColor: '#a5b4fc',
          objectFit: 'cover'
        },
        questionBox: {
          x: 6, y: 42, width: 88, height: 16,
          shape: 'rounded',
          borderRadius: 18,
          borderWidth: 2,
          borderColor: '#c7d2fe',
          backgroundColor: '#f8fafc',
          bgOpacity: 0.98,
          color: '#1e1b4b',
          textColor: '#1e1b4b',
          fontFamily: 'Be Vietnam Pro, sans-serif',
          fontSize: 21,
          fontWeight: '700',
          boxShadow: '0 8px 22px rgba(79, 70, 229, 0.08)',
          padding: 14,
          animation: 'pop'
        },
        answerButtons: {
          x: 6, y: 61, width: 88, height: 23,
          shape: 'rounded',
          layoutComposition: 'stacked',
          optionBadgeShape: 'square',
          readTts: true,
          gap: 10,
          borderRadius: 16,
          borderWidth: 1.5,
          borderColor: '#c7d2fe',
          backgroundColor: '#ffffff',
          bgOpacity: 0.98,
          color: '#1e1b4b',
          textColor: '#1e1b4b',
          fontFamily: 'Be Vietnam Pro, sans-serif',
          fontSize: 17,
          fontWeight: '600',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          padding: 12,
          animation: 'slide-up'
        },
        countdown: {
          x: 6, y: 86, width: 88, height: 4,
          countdownStyle: 'bar-horizontal',
          strokeWidth: 4,
          color: '#4f46e5',
          warningColor: '#dc2626',
          fontSize: 18,
          fontWeight: '800'
        },
        explanation: {
          enabled: true,
          readTts: true,
          displayDurationSec: 3.0,
          showIcon: true,
          x: 6, y: 85, width: 88, height: 11,
          shape: 'rounded',
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
  // TEMPLATE 10 — POP QUIZ (Yellow + Bold Blue / Neo-Brutalism)
  // ---------------------------------------------------------------------------
  {
    id: 'tmpl-pop-quiz',
    name: '10. Pop Quiz',
    tag: 'Neo-Brutalism • Yellow + Blue',
    badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    description: 'Chữ lớn nổi bật, viền đen dày 3.5px, đổ bóng Pop Shadow cứng cáp; Đáp án dạng sticker lệch tầng cá tính, reveal kiểu pop.',
    icon: '💥',
    previewGradient: 'linear-gradient(135deg, #fef08a 0%, #ffde59 50%, #60a5fa 100%)',
    accentColors: ['#ffde59', '#2563eb', '#111827'],
    branding: {
      colors: {
        primary: '#ffde59',
        secondary: '#2563eb',
        accent: '#ff007f',
        background: '#fffbeb',
        cardBg: '#ffffff',
        text: '#111827',
        correct: '#15803d',
        wrong: '#dc2626',
        border: '#111827'
      }
    },
    template: {
      id: 'tmpl-pop-quiz',
      name: 'Pop Quiz',
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
          type: 'gradient',
          backgroundColor: '#fffbeb',
          secondaryColor: '#fef3c7',
          gradientAngle: 135
        },
        quizTitle: {
          x: 6, y: 5, width: 88, height: 6,
          enabled: true,
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 18,
          fontWeight: '900',
          color: '#111827',
          backgroundColor: '#ffde59',
          borderRadius: 14,
          borderWidth: 3.5,
          borderColor: '#111827',
          popShadow: true,
          popShadowOffset: 5,
          popShadowColor: '#111827'
        },
        questionNumber: {
          x: 6, y: 13, width: 88, height: 4,
          format: 'q-n',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 14,
          fontWeight: '900',
          color: '#111827'
        },
        questionBox: {
          x: 6, y: 18, width: 88, height: 23,
          shape: 'color-block',
          borderRadius: 20,
          borderWidth: 3.5,
          borderColor: '#111827',
          backgroundColor: '#ffffff',
          bgOpacity: 1,
          color: '#111827',
          textColor: '#111827',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 23,
          fontWeight: '900',
          popShadow: true,
          popShadowOffset: 7,
          popShadowColor: '#111827',
          padding: 16,
          animation: 'pop'
        },
        answerButtons: {
          x: 6, y: 44, width: 88, height: 38,
          layoutComposition: 'custom',
          useIndividualStyles: true,
          readTts: true,
          options: {
            A: {
              x: 5, y: 45, width: 88, height: 10.5,
              shape: 'pill',
              borderWidth: 3,
              borderColor: '#111827',
              backgroundColor: '#ffde59',
              textColor: '#111827',
              fontSize: 18,
              fontWeight: '900',
              popShadow: true,
              popShadowOffset: 5,
              popShadowColor: '#111827',
              rotation: -1.2,
              labelShape: 'circle',
              labelBgColor: '#111827',
              labelColor: '#ffffff'
            },
            B: {
              x: 8, y: 57, width: 84, height: 10.5,
              shape: 'bubble',
              borderWidth: 3,
              borderColor: '#111827',
              backgroundColor: '#38bdf8',
              textColor: '#111827',
              fontSize: 18,
              fontWeight: '900',
              popShadow: true,
              popShadowOffset: 5,
              popShadowColor: '#111827',
              rotation: 1.5,
              labelShape: 'square',
              labelBgColor: '#111827',
              labelColor: '#ffffff'
            },
            C: {
              x: 4, y: 69, width: 90, height: 10.5,
              shape: 'rounded',
              borderRadius: 18,
              borderWidth: 3,
              borderColor: '#111827',
              backgroundColor: '#f472b6',
              textColor: '#111827',
              fontSize: 18,
              fontWeight: '900',
              popShadow: true,
              popShadowOffset: 5,
              popShadowColor: '#111827',
              rotation: -0.8,
              labelShape: 'circle',
              labelBgColor: '#111827',
              labelColor: '#ffffff'
            }
          },
          animation: 'pop'
        },
        countdown: {
          x: 32, y: 8, width: 36, height: 5,
          countdownStyle: 'pill-timer',
          strokeWidth: 2,
          color: '#111827',
          warningColor: '#dc2626',
          fontSize: 18,
          fontWeight: '900'
        },
        explanation: {
          enabled: true,
          readTts: true,
          displayDurationSec: 3.0,
          showIcon: true,
          x: 6, y: 83, width: 88, height: 11,
          shape: 'color-block',
          borderRadius: 16,
          borderWidth: 3,
          borderColor: '#111827',
          backgroundColor: '#ffffff',
          color: '#111827',
          textColor: '#111827',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 14,
          fontWeight: '700',
          popShadow: true,
          popShadowOffset: 5,
          popShadowColor: '#111827',
          padding: 12
        }
      }
    }
  },

  // ---------------------------------------------------------------------------
  // TEMPLATE 11 — MINIMAL EDITORIAL (Elegant White + Slate / Tạp Chí Tối Giản)
  // ---------------------------------------------------------------------------
  {
    id: 'tmpl-minimal-editorial',
    name: '11. Minimal Editorial',
    tag: 'Tạp Chí Tối Giản • White + Slate',
    badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
    description: 'Không dùng card bao quanh, Typography tinh tế cao cấp, Đáp án dùng đường kẻ gạch chân thanh mảnh và số thứ tự trang nhã.',
    icon: '🖋️',
    previewGradient: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
    accentColors: ['#0f172a', '#475569', '#94a3b8'],
    branding: {
      colors: {
        primary: '#0f172a',
        secondary: '#475569',
        accent: '#94a3b8',
        background: '#ffffff',
        cardBg: '#ffffff',
        text: '#0f172a',
        correct: '#15803d',
        wrong: '#b91c1c',
        border: '#e2e8f0'
      }
    },
    template: {
      id: 'tmpl-minimal-editorial',
      name: 'Minimal Editorial',
      layoutType: 'split-modern',
      illustrationLayout: 'single',
      answerLayout: 'vertical-list',
      countdownStyle: 'clean-text',
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
        quizTitle: {
          x: 8, y: 6, width: 84, height: 5,
          enabled: true,
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 16,
          fontWeight: '800',
          color: '#0f172a',
          backgroundColor: 'transparent',
          borderWidth: 0
        },
        countdown: {
          x: 70, y: 6, width: 22, height: 5,
          countdownStyle: 'clean-text',
          strokeWidth: 2,
          color: '#0f172a',
          warningColor: '#dc2626',
          fontSize: 22,
          fontWeight: '900'
        },
        questionNumber: {
          x: 8, y: 13, width: 84, height: 4,
          format: 'câu-n',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 13,
          fontWeight: '700',
          color: '#64748b'
        },
        questionBox: {
          x: 8, y: 19, width: 84, height: 24,
          shape: 'minimal',
          borderRadius: 0,
          borderWidth: 0,
          backgroundColor: 'transparent',
          bgOpacity: 0,
          color: '#0f172a',
          textColor: '#0f172a',
          fontFamily: 'Be Vietnam Pro, sans-serif',
          fontSize: 24,
          fontWeight: '800',
          padding: 8,
          animation: 'fade'
        },
        answerButtons: {
          x: 8, y: 47, width: 84, height: 32,
          shape: 'minimal',
          layoutComposition: 'stacked',
          optionBadgeShape: 'circle',
          readTts: true,
          gap: 16,
          borderRadius: 0,
          borderWidth: 1.5,
          borderColor: '#e2e8f0',
          backgroundColor: 'transparent',
          bgOpacity: 0,
          color: '#0f172a',
          textColor: '#0f172a',
          fontFamily: 'Be Vietnam Pro, sans-serif',
          fontSize: 18,
          fontWeight: '600',
          padding: 10,
          animation: 'fade'
        },
        explanation: {
          enabled: true,
          readTts: true,
          displayDurationSec: 3.0,
          showIcon: true,
          x: 8, y: 82, width: 84, height: 11,
          shape: 'minimal',
          borderRadius: 0,
          borderWidth: 1.5,
          borderColor: '#86efac',
          backgroundColor: '#f0fdf4',
          color: '#14532d',
          textColor: '#14532d',
          fontFamily: 'Be Vietnam Pro, sans-serif',
          fontSize: 14,
          fontWeight: '500',
          padding: 10
        }
      }
    }
  },

  // ---------------------------------------------------------------------------
  // TEMPLATE 12 — ASYMMETRIC (Pastel Gradient / Bố Cục Bất Đối Xứng)
  // ---------------------------------------------------------------------------
  {
    id: 'tmpl-asymmetric',
    name: '12. Asymmetric',
    tag: 'Bất Đối Xứng • Pastel Gradient',
    badgeColor: 'bg-rose-400/20 text-rose-300 border-rose-400/40',
    description: 'Câu hỏi lệch trái, Ảnh minh họa lệch phải, 3 đáp án A/B/C so le bất đối xứng tạo nên nhịp điệu thị giác ấn tượng.',
    icon: '🎨',
    previewGradient: 'linear-gradient(135deg, #fbcfe8 0%, #c4b5fd 50%, #93c5fd 100%)',
    accentColors: ['#f472b6', '#a78bfa', '#60a5fa'],
    branding: {
      colors: {
        primary: '#a855f7',
        secondary: '#f472b6',
        accent: '#60a5fa',
        background: '#fdf4ff',
        cardBg: '#ffffff',
        text: '#1e1b4b',
        correct: '#15803d',
        wrong: '#dc2626',
        border: '#f5d0fe'
      }
    },
    template: {
      id: 'tmpl-asymmetric',
      name: 'Asymmetric',
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
          type: 'gradient',
          backgroundColor: '#fdf4ff',
          secondaryColor: '#eff6ff',
          gradientAngle: 120
        },
        quizTitle: {
          x: 5, y: 5, width: 90, height: 5,
          enabled: true,
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 17,
          fontWeight: '900',
          color: '#6b21a8',
          backgroundColor: '#fae8ff',
          borderRadius: 16,
          borderWidth: 1.5,
          borderColor: '#e879f9'
        },
        questionNumber: {
          x: 5, y: 11, width: 40, height: 4,
          format: 'q-n',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 13,
          fontWeight: '800',
          color: '#a855f7'
        },
        countdown: {
          x: 55, y: 11, width: 40, height: 5,
          countdownStyle: 'pill-timer',
          strokeWidth: 2,
          color: '#a855f7',
          warningColor: '#dc2626',
          fontSize: 16,
          fontWeight: '800'
        },
        questionBox: {
          x: 5, y: 17, width: 55, height: 24,
          shape: 'rounded',
          borderRadius: 24,
          borderWidth: 2,
          borderColor: '#e879f9',
          backgroundColor: '#ffffff',
          bgOpacity: 0.98,
          color: '#1e1b4b',
          textColor: '#1e1b4b',
          fontFamily: 'Be Vietnam Pro, sans-serif',
          fontSize: 21,
          fontWeight: '700',
          boxShadow: '0 10px 24px rgba(168, 85, 247, 0.12)',
          padding: 16,
          animation: 'pop'
        },
        illustration: {
          x: 63, y: 17, width: 32, height: 24,
          borderRadius: 20,
          borderWidth: 2,
          borderColor: '#93c5fd',
          objectFit: 'cover'
        },
        answerButtons: {
          x: 5, y: 44, width: 90, height: 38,
          shape: 'pill',
          layoutComposition: 'asymmetric',
          optionBadgeShape: 'pill',
          readTts: true,
          borderRadius: 9999,
          borderWidth: 1.5,
          borderColor: '#f5d0fe',
          backgroundColor: '#ffffff',
          bgOpacity: 0.98,
          color: '#1e1b4b',
          textColor: '#1e1b4b',
          fontFamily: 'Be Vietnam Pro, sans-serif',
          fontSize: 17,
          fontWeight: '700',
          boxShadow: '0 6px 18px rgba(168, 85, 247, 0.1)',
          padding: 12,
          animation: 'slide-up'
        },
        explanation: {
          enabled: true,
          readTts: true,
          displayDurationSec: 3.0,
          showIcon: true,
          x: 5, y: 84, width: 90, height: 11,
          shape: 'rounded',
          borderRadius: 18,
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
  }
];

export function validateAndSanitizeTemplate(template: VideoTemplate, fallback?: VideoTemplate): VideoTemplate {
  const safeFallback = fallback || TEMPLATE_LIBRARY[0].template;
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
