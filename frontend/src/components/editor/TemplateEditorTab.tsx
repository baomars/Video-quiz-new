import React, { useState, useRef } from 'react';
import {
  VideoTemplate,
  LayoutType,
  IllustrationLayout,
  AnswerLayout,
  CountdownStyle,
  HorizontalAlign,
  VerticalAlign,
  AnimationType,
  MotionDirection
} from '../../../../remotion/types/index';
import {
  Layout,
  Sliders,
  Layers,
  Clock,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Shield,
  Eye,
  EyeOff,
  Sparkles,
  Check,
  Move,
  Type,
  Image as ImageIcon,
  Upload
} from 'lucide-react';
import { uploadImage } from '../../services/api';

type TextAlign = HorizontalAlign;

interface TemplateEditorTabProps {
  template: VideoTemplate;
  onChange: (updated: VideoTemplate) => void;
}

export type ComponentKey =
  | 'header'
  | 'questionNumber'
  | 'illustration'
  | 'questionBox'
  | 'answerButtons'
  | 'countdown'
  | 'progressBar'
  | 'logo'
  | 'background';

interface LayoutPresetDefinition {
  id: string;
  name: string;
  tag: string;
  badgeColor: string;
  layoutType: LayoutType;
  illustrationLayout: IllustrationLayout;
  answerLayout: AnswerLayout;
  countdownStyle: CountdownStyle;
  description: string;
  components: Record<string, any>;
}

const PRESET_TEMPLATES: LayoutPresetDefinition[] = [
  {
    id: 'classic-stacked',
    name: 'A1 — Sáng Chuẩn (Classic Stacked)',
    tag: 'Chuẩn 9:16',
    badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
    layoutType: 'classic-stacked',
    illustrationLayout: 'single',
    answerLayout: 'vertical-list',
    countdownStyle: 'bar-horizontal',
    description: 'Header → Ảnh lớn (25%) → Câu hỏi (14%) → 3 Đáp án dọc (20%) → Thanh đếm ngược đáy',
    components: {
      header: {
        x: 7,
        y: 8,
        width: 86,
        height: 6,
        fontSize: 26,
        fontWeight: '800',
        textAlign: 'center',
        horizontalAlign: 'center',
        verticalAlign: 'center',
        badgeStyle: true,
        borderRadius: 16,
        borderWidth: 1,
        animation: 'slide-up'
      },
      questionNumber: {
        x: 10,
        y: 15,
        width: 80,
        height: 4,
        fontSize: 20,
        fontWeight: '700',
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
        borderRadius: 18,
        borderWidth: 2,
        padding: 16,
        textAlign: 'center',
        horizontalAlign: 'center',
        verticalAlign: 'center',
        animation: 'pop'
      },
      answerButtons: {
        x: 6,
        y: 63,
        width: 88,
        height: 20,
        fontSize: 24,
        fontWeight: '700',
        borderRadius: 16,
        borderWidth: 2,
        padding: 12,
        gap: 12,
        horizontalAlign: 'center',
        verticalAlign: 'center',
        textAlign: 'left',
        optionBadgeShape: 'circle',
        animation: 'slide-up'
      },
      countdown: {
        x: 7,
        y: 85,
        width: 86,
        height: 2,
        borderRadius: 10,
        strokeWidth: 6,
        showSeconds: true,
        horizontalAlign: 'center'
      },
      progressBar: {
        x: 0,
        y: 0,
        width: 100,
        height: 1,
        thickness: 6
      },
      logo: {
        x: 75,
        y: 8,
        width: 16,
        height: 6,
        opacity: 0.95
      }
    }
  },
  {
    id: 'split-modern',
    name: 'A2 — Trẻ Trung Tươi Sáng (Split Modern)',
    tag: 'Năng động',
    badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
    layoutType: 'split-modern',
    illustrationLayout: 'split-2-horizontal',
    answerLayout: 'vertical-list',
    countdownStyle: 'circle-radial',
    description: 'Header + Đồng hồ tròn góc phải → 2 Cột Ảnh → Khung câu hỏi → 3 Đáp án dọc',
    components: {
      header: {
        x: 7,
        y: 8,
        width: 60,
        height: 6,
        fontSize: 24,
        fontWeight: '800',
        textAlign: 'left',
        horizontalAlign: 'left',
        verticalAlign: 'center',
        badgeStyle: true,
        borderRadius: 14,
        borderWidth: 1,
        animation: 'slide-up'
      },
      countdown: {
        x: 73,
        y: 8,
        width: 20,
        height: 6,
        strokeWidth: 6,
        showSeconds: true,
        horizontalAlign: 'right'
      },
      questionNumber: {
        x: 7,
        y: 15,
        width: 86,
        height: 4,
        fontSize: 20,
        fontWeight: '700',
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
        borderRadius: 18,
        borderWidth: 2,
        padding: 16,
        textAlign: 'center',
        horizontalAlign: 'center',
        verticalAlign: 'center',
        animation: 'pop'
      },
      answerButtons: {
        x: 7,
        y: 62,
        width: 86,
        height: 21,
        fontSize: 23,
        fontWeight: '700',
        borderRadius: 16,
        borderWidth: 2,
        padding: 12,
        gap: 10,
        horizontalAlign: 'center',
        verticalAlign: 'center',
        textAlign: 'left',
        optionBadgeShape: 'square',
        animation: 'pop'
      },
      progressBar: {
        x: 0,
        y: 99,
        width: 100,
        height: 1,
        thickness: 6
      },
      logo: {
        x: 7,
        y: 85,
        width: 20,
        height: 4,
        opacity: 0.85
      }
    }
  },
  {
    id: 'image-focus',
    name: 'A3 — Tối Giản Ảnh Lớn (Image Focus)',
    tag: 'Ảnh Hero',
    badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
    layoutType: 'image-focus',
    illustrationLayout: 'single',
    answerLayout: 'compact-pills',
    countdownStyle: 'pill-timer',
    description: 'Pill Header → Ảnh lớn (26%) → Câu hỏi → 3 Pills bo tròn → Pill Timer trung tâm',
    components: {
      header: {
        x: 7,
        y: 8,
        width: 86,
        height: 6,
        fontSize: 25,
        fontWeight: '800',
        textAlign: 'center',
        horizontalAlign: 'center',
        verticalAlign: 'center',
        badgeStyle: true,
        borderRadius: 24,
        borderWidth: 1,
        animation: 'slide-up'
      },
      questionNumber: {
        x: 35,
        y: 15,
        width: 30,
        height: 3.5,
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
        horizontalAlign: 'center',
        format: 'badge'
      },
      illustration: {
        x: 8,
        y: 20,
        width: 84,
        height: 26,
        borderRadius: 22,
        borderWidth: 2,
        horizontalAlign: 'center',
        verticalAlign: 'center',
        animation: 'scale-in'
      },
      questionBox: {
        x: 7,
        y: 48,
        width: 86,
        height: 13,
        fontSize: 26,
        fontWeight: '800',
        borderRadius: 20,
        borderWidth: 2,
        padding: 14,
        textAlign: 'center',
        horizontalAlign: 'center',
        verticalAlign: 'center',
        animation: 'pop'
      },
      answerButtons: {
        x: 7,
        y: 63,
        width: 86,
        height: 20,
        fontSize: 22,
        fontWeight: '700',
        borderRadius: 25,
        borderWidth: 2,
        padding: 12,
        gap: 10,
        horizontalAlign: 'center',
        verticalAlign: 'center',
        textAlign: 'left',
        optionBadgeShape: 'pill',
        animation: 'slide-up'
      },
      countdown: {
        x: 34,
        y: 85,
        width: 32,
        height: 4.5,
        borderRadius: 25,
        fontSize: 20,
        fontWeight: '800',
        strokeWidth: 3,
        showSeconds: true,
        horizontalAlign: 'center'
      },
      progressBar: {
        x: 0,
        y: 0,
        width: 100,
        height: 1,
        thickness: 6
      },
      logo: {
        x: 8,
        y: 8,
        width: 12,
        height: 5,
        opacity: 0.9
      }
    }
  },
  {
    id: 'minimal-clean',
    name: 'A4 — Tối Giản Tinh Tế (Minimal Clean)',
    tag: 'Tinh tế',
    badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    layoutType: 'classic-stacked',
    illustrationLayout: 'single',
    answerLayout: 'vertical-list',
    countdownStyle: 'bar-horizontal',
    description: 'Header tối giản → Khung ảnh thanh thoát → 3 Card đáp án mềm mại → Minimal Bar',
    components: {
      header: {
        x: 10,
        y: 8,
        width: 80,
        height: 5,
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'center',
        horizontalAlign: 'center',
        verticalAlign: 'center',
        badgeStyle: true,
        borderRadius: 14,
        borderWidth: 1,
        animation: 'slide-up'
      },
      questionNumber: {
        x: 10,
        y: 14,
        width: 80,
        height: 4,
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
        horizontalAlign: 'center',
        format: 'câu-n'
      },
      illustration: {
        x: 11,
        y: 19,
        width: 78,
        height: 24,
        borderRadius: 16,
        borderWidth: 1,
        horizontalAlign: 'center',
        verticalAlign: 'center',
        animation: 'scale-in'
      },
      questionBox: {
        x: 8,
        y: 45,
        width: 84,
        height: 15,
        fontSize: 27,
        fontWeight: '800',
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        textAlign: 'center',
        horizontalAlign: 'center',
        verticalAlign: 'center',
        animation: 'pop'
      },
      answerButtons: {
        x: 8,
        y: 62,
        width: 84,
        height: 20,
        fontSize: 23,
        fontWeight: '700',
        borderRadius: 14,
        borderWidth: 1,
        padding: 12,
        gap: 10,
        horizontalAlign: 'center',
        verticalAlign: 'center',
        textAlign: 'left',
        optionBadgeShape: 'circle',
        animation: 'slide-up'
      },
      countdown: {
        x: 8,
        y: 84,
        width: 84,
        height: 1.5,
        borderRadius: 8,
        strokeWidth: 4,
        showSeconds: true,
        horizontalAlign: 'center'
      },
      progressBar: {
        x: 0,
        y: 0,
        width: 100,
        height: 0.8,
        thickness: 4
      },
      logo: {
        x: 8,
        y: 8,
        width: 14,
        height: 5,
        opacity: 0.85
      }
    }
  }
];

export const TemplateEditorTab: React.FC<TemplateEditorTabProps> = ({ template, onChange }) => {
  const [selectedCompKey, setSelectedCompKey] = useState<ComponentKey>('questionBox');
  const [showSafeZone, setShowSafeZone] = useState<boolean>(true);

  const compLabels: Record<ComponentKey, string> = {
    questionBox: 'Khung câu hỏi (QuestionBox)',
    answerButtons: '3 Đáp án (A, B, C)',
    illustration: 'Khung ảnh minh họa',
    countdown: 'Đồng hồ đếm ngược',
    questionNumber: 'Số thứ tự câu (Câu 1/Q1)',
    header: 'Tiêu đề Kênh (Header)',
    progressBar: 'Thanh tiến trình (ProgressBar)',
    logo: 'Logo / Watermark',
    background: 'Nền video (Background)'
  };

  const activeComp = template.components[selectedCompKey] || {};
  const bgFileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingBg, setIsUploadingBg] = useState(false);

  const handleUploadBg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingBg(true);
      const res = await uploadImage(file);
      onChange({
        ...template,
        components: {
          ...template.components,
          background: {
            ...template.components.background,
            type: 'image',
            imageUrl: res.optimizedUrl || res.originalUrl
          }
        }
      });
    } catch (err: any) {
      alert(`Lỗi upload ảnh nền: ${err.message}`);
    } finally {
      setIsUploadingBg(false);
    }
  };

  const updateBgMotion = (prop: string, val: any) => {
    const currentBg = template.components.background || {};
    const currentMotion = currentBg.motion || {};
    onChange({
      ...template,
      components: {
        ...template.components,
        background: {
          ...currentBg,
          motion: {
            ...currentMotion,
            [prop]: val
          }
        }
      }
    });
  };

  // Direct prop update
  const updateComp = (key: ComponentKey, prop: string, value: any) => {
    const compData = template.components[key] || {};
    onChange({
      ...template,
      components: {
        ...template.components,
        [key]: {
          ...compData,
          [prop]: value
        }
      }
    });
  };

  // Center-preserving width update: shrinks/expands equally from both sides when horizontalAlign is center
  const updateWidth = (key: ComponentKey, newWidth: number) => {
    const compData = template.components[key] || {};
    const oldWidth = compData.width ?? (key === 'answerButtons' ? 88 : 80);
    const oldX = compData.x ?? ((100 - oldWidth) / 2);
    const hAlign = compData.horizontalAlign ?? (key === 'answerButtons' ? 'center' : 'center');

    let newX = oldX;
    if (hAlign === 'center') {
      const currentCenterX = oldX + oldWidth / 2;
      newX = Math.round((currentCenterX - newWidth / 2) * 10) / 10;
    } else if (hAlign === 'right') {
      const currentRight = oldX + oldWidth;
      newX = Math.round((currentRight - newWidth) * 10) / 10;
    }

    onChange({
      ...template,
      components: {
        ...template.components,
        [key]: {
          ...compData,
          horizontalAlign: hAlign,
          width: newWidth,
          x: Math.max(0, Math.min(100 - newWidth, newX))
        }
      }
    });
  };

  // Center-preserving height update: shrinks/expands equally from top & bottom when verticalAlign is center
  const updateHeight = (key: ComponentKey, newHeight: number) => {
    const compData = template.components[key] || {};
    const oldHeight = compData.height ?? 20;
    const oldY = compData.y ?? ((100 - oldHeight) / 2);
    const vAlign = compData.verticalAlign ?? 'center';

    let newY = oldY;
    if (vAlign === 'center') {
      const currentCenterY = oldY + oldHeight / 2;
      newY = Math.round((currentCenterY - newHeight / 2) * 10) / 10;
    } else if (vAlign === 'bottom') {
      const currentBottom = oldY + oldHeight;
      newY = Math.round((currentBottom - newHeight) * 10) / 10;
    }

    onChange({
      ...template,
      components: {
        ...template.components,
        [key]: {
          ...compData,
          verticalAlign: vAlign,
          height: newHeight,
          y: Math.max(0, Math.min(100 - newHeight, newY))
        }
      }
    });
  };

  // Reset Horizontal Alignment & re-center
  const setHorizontalAlign = (key: ComponentKey, align: HorizontalAlign) => {
    const compData = template.components[key] || {};
    const width = compData.width ?? (key === 'answerButtons' ? 88 : 80);
    let newX = compData.x ?? 6;

    if (align === 'center') {
      newX = Math.round(((100 - width) / 2) * 10) / 10;
    } else if (align === 'left') {
      newX = 6;
    } else if (align === 'right') {
      newX = Math.max(0, 100 - width - 6);
    }

    onChange({
      ...template,
      components: {
        ...template.components,
        [key]: {
          ...compData,
          horizontalAlign: align,
          x: newX
        }
      }
    });
  };

  // Reset Vertical Alignment & re-center
  const setVerticalAlign = (key: ComponentKey, align: VerticalAlign) => {
    const compData = template.components[key] || {};
    const height = compData.height ?? 20;
    let newY = compData.y ?? 20;

    if (align === 'center') {
      newY = Math.round(((100 - height) / 2) * 10) / 10;
    } else if (align === 'top') {
      newY = 8;
    } else if (align === 'bottom') {
      newY = Math.max(0, 100 - height - 16);
    }

    onChange({
      ...template,
      components: {
        ...template.components,
        [key]: {
          ...compData,
          verticalAlign: align,
          y: newY
        }
      }
    });
  };

  const updateTiming = (key: string, value: any) => {
    onChange({
      ...template,
      timing: {
        ...template.timing,
        [key]: value
      }
    });
  };

  // Apply layout preset
  const applyPreset = (preset: LayoutPresetDefinition) => {
    const mergedComponents: Record<string, any> = { ...template.components };
    Object.keys(preset.components).forEach((k) => {
      mergedComponents[k] = {
        ...(template.components[k] || {}),
        ...preset.components[k]
      };
    });

    onChange({
      ...template,
      layoutType: preset.layoutType,
      illustrationLayout: preset.illustrationLayout,
      answerLayout: preset.answerLayout,
      countdownStyle: preset.countdownStyle,
      components: mergedComponents
    });
  };

  // Check which preset is currently active
  const activePresetId = PRESET_TEMPLATES.find(
    (p) =>
      p.layoutType === template.layoutType &&
      p.illustrationLayout === template.illustrationLayout &&
      p.answerLayout === template.answerLayout &&
      p.countdownStyle === template.countdownStyle
  )?.id || (template.layoutType === 'split-modern' ? 'split-modern' : template.layoutType === 'image-focus' ? 'image-focus' : 'classic-stacked');

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* ========================================================================= */}
      {/* 1. VISUAL PRESET GALLERY                                                  */}
      {/* ========================================================================= */}
      <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Layout size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                1. Bộ Sưu Tập Bố Cục Video (Layout Presets)
              </h3>
              <p className="text-[11px] text-slate-500">
                Khung 9:16 (720×1280) • Chọn bố cục để xem trực quan ngay lập tức
              </p>
            </div>
          </div>
        </div>

        {/* Visual Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PRESET_TEMPLATES.map((preset) => {
            const isCurrent = activePresetId === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className={`group cursor-pointer relative p-3 rounded-xl border-2 transition-all flex items-start gap-3 ${
                  isCurrent
                    ? 'border-amber-500 bg-amber-50/40 shadow-xs ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:border-amber-300 hover:bg-slate-50/60'
                }`}
              >
                {/* 9:16 Miniature Visual Blueprint */}
                <div className="w-16 h-28 aspect-[9/16] bg-slate-900 rounded-lg p-1 flex flex-col justify-between shrink-0 shadow-inner relative overflow-hidden border border-slate-700">
                  {/* Progress Line */}
                  <div className="w-full h-0.5 bg-amber-400 rounded-full" />

                  {/* Header Bar */}
                  <div className="w-full flex justify-between items-center px-0.5">
                    <div className={`h-1.5 rounded-full bg-slate-300 ${preset.id === 'split-modern' ? 'w-8' : 'w-10 mx-auto'}`} />
                    {preset.id === 'split-modern' && (
                      <div className="w-2.5 h-2.5 rounded-full border border-amber-400 flex items-center justify-center text-[5px] text-amber-300">
                        5
                      </div>
                    )}
                  </div>

                  {/* Illustration Preview */}
                  <div className="w-full px-0.5">
                    {preset.illustrationLayout === 'split-2-horizontal' ? (
                      <div className="grid grid-cols-2 gap-0.5 h-6">
                        <div className="bg-sky-500/60 rounded-xs flex items-center justify-center text-[6px] text-white">L</div>
                        <div className="bg-amber-500/60 rounded-xs flex items-center justify-center text-[6px] text-white">R</div>
                      </div>
                    ) : (
                      <div className={`bg-sky-500/60 rounded-xs flex items-center justify-center text-[6px] text-white ${preset.id === 'image-focus' ? 'h-7' : 'h-6'}`}>
                        📷
                      </div>
                    )}
                  </div>

                  {/* Question Box */}
                  <div className="w-full bg-white/95 rounded-xs p-0.5 space-y-0.5 shadow-2xs">
                    <div className="w-full h-1 bg-slate-800 rounded-full" />
                    <div className="w-3/4 h-1 bg-slate-600 rounded-full mx-auto" />
                  </div>

                  {/* 3 Answers Preview */}
                  <div className="w-full space-y-0.5 px-0.5">
                    <div className={`h-2 rounded-xs flex items-center px-1 text-[5px] font-bold ${preset.answerLayout === 'compact-pills' ? 'rounded-full bg-slate-200 text-slate-800' : 'bg-slate-200 text-slate-800'}`}>
                      <span className="text-[5px] text-amber-600 font-bold mr-0.5">A</span> ...
                    </div>
                    <div className={`h-2 rounded-xs flex items-center px-1 text-[5px] font-bold ${preset.answerLayout === 'compact-pills' ? 'rounded-full bg-slate-200 text-slate-800' : 'bg-slate-200 text-slate-800'}`}>
                      <span className="text-[5px] text-amber-600 font-bold mr-0.5">B</span> ...
                    </div>
                    <div className={`h-2 rounded-xs flex items-center px-1 text-[5px] font-bold ${preset.answerLayout === 'compact-pills' ? 'rounded-full bg-slate-200 text-slate-800' : 'bg-slate-200 text-slate-800'}`}>
                      <span className="text-[5px] text-amber-600 font-bold mr-0.5">C</span> ...
                    </div>
                  </div>

                  {/* Countdown Preview */}
                  {preset.countdownStyle === 'bar-horizontal' && (
                    <div className="w-full h-1 bg-amber-500 rounded-full" />
                  )}
                  {preset.countdownStyle === 'pill-timer' && (
                    <div className="w-8 h-2 rounded-full bg-purple-500 mx-auto flex items-center justify-center text-[5px] text-white font-mono">
                      ⏱ 5s
                    </div>
                  )}
                  {preset.countdownStyle === 'circle-radial' && (
                    <div className="w-full h-0.5 bg-slate-600" />
                  )}
                </div>

                {/* Preset Information */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {preset.name}
                    </h4>
                    {isCurrent ? (
                      <span className="shrink-0 flex items-center gap-0.5 text-[10px] bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded-full font-extrabold shadow-2xs">
                        <Check size={10} /> Đang dùng
                      </span>
                    ) : (
                      <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-bold border ${preset.badgeColor}`}>
                        {preset.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-2">
                    {preset.description}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      applyPreset(preset);
                    }}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition ${
                      isCurrent
                        ? 'bg-amber-500 text-slate-950 shadow-2xs font-extrabold'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isCurrent ? 'Đang kích hoạt' : 'Áp dụng Bố Cục Này'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sub-layout Dropdowns for Advanced Fine-Tuning */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 sm:gap-3">
          <div>
            <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">Ảnh minh họa:</label>
            <select
              value={template.illustrationLayout}
              onChange={(e) => onChange({ ...template, illustrationLayout: e.target.value as IllustrationLayout })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-800 font-medium focus:bg-white focus:border-amber-500 focus:outline-none"
            >
              <option value="single">1 Khung ảnh lớn</option>
              <option value="split-2-horizontal">2 Cột ảnh (Chia đôi ngang)</option>
              <option value="split-2-vertical">2 Ảnh xếp chồng dọc</option>
              <option value="overlay">Ảnh nền lớn tràn viền</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">Khung 3 đáp án:</label>
            <select
              value={template.answerLayout}
              onChange={(e) => onChange({ ...template, answerLayout: e.target.value as AnswerLayout })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-800 font-medium focus:bg-white focus:border-amber-500 focus:outline-none"
            >
              <option value="vertical-list">Danh sách 3 hàng dọc</option>
              <option value="compact-pills">Viên thuốc bo tròn (Pills)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">Kiểu đồng hồ:</label>
            <select
              value={template.countdownStyle || 'circle-radial'}
              onChange={(e) => onChange({ ...template, countdownStyle: e.target.value as CountdownStyle })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-800 font-medium focus:bg-white focus:border-amber-500 focus:outline-none"
            >
              <option value="circle-radial">Đồng hồ tròn SVG</option>
              <option value="pill-timer">Hộp thời gian (Pill Timer)</option>
              <option value="clean-text">Số tối giản (Clean Text)</option>
            </select>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. REALTIME 9:16 LAYOUT BLUEPRINT WIREFRAME                               */}
      {/* ========================================================================= */}
      <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <Eye size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                2. Bản Đồ Bố Cục 9:16 Realtime (Wireframe Map)
              </h3>
              <p className="text-[10px] text-slate-500">
                Click vào bất kỳ khối nào để chọn và căn chỉnh vị trí
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowSafeZone(!showSafeZone)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition ${
              showSafeZone
                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                : 'bg-slate-100 text-slate-500 hover:text-slate-800'
            }`}
            title="Bật/Tắt hiển thị Safe Zone TikTok"
          >
            <Shield size={13} />
            <span>Safe Zone</span>
            {showSafeZone ? <Eye size={12} /> : <EyeOff size={12} />}
          </button>
        </div>

        {/* 9:16 Interactive Canvas Wireframe */}
        <div className="bg-slate-100 rounded-2xl p-4 flex flex-col items-center border border-slate-200/80">
          <div
            className="w-[200px] h-[355px] bg-slate-900 rounded-2xl relative shadow-md overflow-hidden border-2 border-slate-700 select-none cursor-default"
            style={{ aspectRatio: '9/16' }}
          >
            {/* Safe Zone Overlays */}
            {showSafeZone && (
              <>
                {/* Top Safe Zone: ~10% */}
                <div className="absolute top-0 left-0 right-0 h-[10%] bg-rose-500/10 border-b border-dashed border-rose-400/50 z-20 pointer-events-none flex items-center justify-center">
                  <span className="text-[7px] text-rose-300 font-bold uppercase tracking-wider">
                    Safe Zone Top (TikTok/FB)
                  </span>
                </div>

                {/* Bottom Safe Zone: ~18% */}
                <div className="absolute bottom-0 left-0 right-0 h-[18%] bg-rose-500/10 border-t border-dashed border-rose-400/50 z-20 pointer-events-none flex items-center justify-center">
                  <span className="text-[7px] text-rose-300 font-bold uppercase tracking-wider">
                    Safe Zone Bottom (Caption/Sound)
                  </span>
                </div>

                {/* Right Action Icons Zone: ~12% */}
                <div className="absolute top-[30%] bottom-[20%] right-0 w-[12%] bg-rose-500/10 border-l border-dashed border-rose-400/50 z-20 pointer-events-none flex items-center justify-center">
                  <span className="text-[6px] text-rose-300 font-bold rotate-90 whitespace-nowrap">
                    Icons
                  </span>
                </div>
              </>
            )}

            {/* Bounding Box: Header */}
            {template.components.header && (
              <div
                onClick={() => setSelectedCompKey('header')}
                style={{
                  left: `${template.components.header.x ?? 7}%`,
                  top: `${template.components.header.y ?? 8}%`,
                  width: `${template.components.header.width ?? 86}%`,
                  height: `${template.components.header.height ?? 6}%`
                }}
                className={`absolute rounded cursor-pointer transition-all flex items-center justify-center text-[7px] font-bold z-10 ${
                  selectedCompKey === 'header'
                    ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300 shadow-md'
                    : 'bg-white/80 text-slate-800 hover:bg-white border border-slate-300'
                }`}
                title="Header"
              >
                Tiêu đề Kênh
              </div>
            )}

            {/* Bounding Box: Question Number */}
            {template.components.questionNumber && (
              <div
                onClick={() => setSelectedCompKey('questionNumber')}
                style={{
                  left: `${template.components.questionNumber.x ?? 10}%`,
                  top: `${template.components.questionNumber.y ?? 15}%`,
                  width: `${template.components.questionNumber.width ?? 80}%`,
                  height: `${template.components.questionNumber.height ?? 4}%`
                }}
                className={`absolute rounded cursor-pointer transition-all flex items-center justify-center text-[6px] font-bold z-10 ${
                  selectedCompKey === 'questionNumber'
                    ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300 shadow-md'
                    : 'bg-sky-200/80 text-sky-900 hover:bg-sky-200'
                }`}
                title="Số thứ tự câu"
              >
                Câu 1
              </div>
            )}

            {/* Bounding Box: Illustration */}
            {template.components.illustration && (
              <div
                onClick={() => setSelectedCompKey('illustration')}
                style={{
                  left: `${template.components.illustration.x ?? 8}%`,
                  top: `${template.components.illustration.y ?? 20}%`,
                  width: `${template.components.illustration.width ?? 84}%`,
                  height: `${template.components.illustration.height ?? 25}%`
                }}
                className={`absolute rounded cursor-pointer transition-all flex flex-col items-center justify-center text-[7px] font-bold z-10 ${
                  selectedCompKey === 'illustration'
                    ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300 shadow-md'
                    : 'bg-sky-500/30 text-sky-100 hover:bg-sky-500/40 border border-sky-400/50'
                }`}
                title="Ảnh minh họa"
              >
                <span>Ảnh minh họa</span>
                <span className="text-[6px] opacity-75 font-normal">
                  {template.illustrationLayout === 'split-2-horizontal' ? '2 Cột ngang' : '1 Khung lớn'}
                </span>
              </div>
            )}

            {/* Bounding Box: Question Box */}
            {template.components.questionBox && (
              <div
                onClick={() => setSelectedCompKey('questionBox')}
                style={{
                  left: `${template.components.questionBox.x ?? 6}%`,
                  top: `${template.components.questionBox.y ?? 47}%`,
                  width: `${template.components.questionBox.width ?? 88}%`,
                  height: `${template.components.questionBox.height ?? 14}%`
                }}
                className={`absolute rounded cursor-pointer transition-all flex flex-col items-center justify-center text-[7px] font-bold z-10 p-1 ${
                  selectedCompKey === 'questionBox'
                    ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300 shadow-md'
                    : 'bg-white/90 text-slate-900 hover:bg-white border border-slate-300'
                }`}
                title="Khung câu hỏi"
              >
                <span>Khung Câu Hỏi</span>
                {/* Center crosshair indicator */}
                {selectedCompKey === 'questionBox' && (
                  <span className="text-[6px] text-slate-950 font-mono font-normal">
                    W: {template.components.questionBox.width}% • X: {template.components.questionBox.x}%
                  </span>
                )}
              </div>
            )}

            {/* Bounding Box: 3 Answer Choices */}
            {template.components.answerButtons && (
              <div
                onClick={() => setSelectedCompKey('answerButtons')}
                style={{
                  left: `${template.components.answerButtons.x ?? 6}%`,
                  top: `${template.components.answerButtons.y ?? 63}%`,
                  width: `${template.components.answerButtons.width ?? 88}%`,
                  height: `${template.components.answerButtons.height ?? 20}%`
                }}
                className={`absolute rounded cursor-pointer transition-all flex flex-col justify-between p-1 z-10 ${
                  selectedCompKey === 'answerButtons'
                    ? 'bg-amber-500/20 ring-2 ring-amber-400 border border-amber-500 shadow-md'
                    : 'bg-white/10 hover:bg-white/20 border border-white/20'
                }`}
                title="3 Đáp án A, B, C"
              >
                <div className="h-2 rounded bg-white text-slate-900 text-[6px] font-bold px-1 flex items-center shadow-2xs">
                  <span className="text-amber-600 font-extrabold mr-1">A</span> Đáp án 1
                </div>
                <div className="h-2 rounded bg-white text-slate-900 text-[6px] font-bold px-1 flex items-center shadow-2xs">
                  <span className="text-amber-600 font-extrabold mr-1">B</span> Đáp án 2
                </div>
                <div className="h-2 rounded bg-white text-slate-900 text-[6px] font-bold px-1 flex items-center shadow-2xs">
                  <span className="text-amber-600 font-extrabold mr-1">C</span> Đáp án 3
                </div>
              </div>
            )}

            {/* Bounding Box: Countdown Timer */}
            {template.components.countdown && (
              <div
                onClick={() => setSelectedCompKey('countdown')}
                style={{
                  left: `${template.components.countdown.x ?? 7}%`,
                  top: `${template.components.countdown.y ?? 85}%`,
                  width: `${template.components.countdown.width ?? 30}%`,
                  height: `${template.components.countdown.height ?? 3.5}%`
                }}
                className={`absolute rounded cursor-pointer transition-all flex items-center justify-center text-[7px] font-bold z-10 ${
                  selectedCompKey === 'countdown'
                    ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300 shadow-md font-extrabold'
                    : 'bg-white/90 text-amber-600 border border-amber-300 hover:bg-white shadow-2xs'
                }`}
                title="Đồng hồ đếm ngược"
              >
                {template.components.countdown.showIcon !== false ? '⏱️ 5s' : '5s'}
              </div>
            )}

            {/* Bounding Box: Progress Bar */}
            {template.components.progressBar && (
              <div
                onClick={() => setSelectedCompKey('progressBar')}
                style={{
                  left: '0%',
                  top: `${template.components.progressBar.y ?? 0}%`,
                  width: '100%',
                  height: '2%'
                }}
                className={`absolute cursor-pointer transition-all z-10 ${
                  selectedCompKey === 'progressBar' ? 'bg-amber-500 ring-1 ring-amber-300' : 'bg-sky-400/80'
                }`}
                title="Thanh tiến trình"
              />
            )}
          </div>

          <div className="text-[11px] text-slate-500 mt-2 font-medium flex items-center gap-2">
            <span>Đang chọn:</span>
            <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              {compLabels[selectedCompKey]}
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. REALTIME COMPONENT INSPECTOR & CENTER-PRESERVING GEOMETRY              */}
      {/* ========================================================================= */}
      <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Sliders size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                3. Căn Chỉnh Vị Trí & Tỷ Lệ (Alignment & Geometry)
              </h3>
              <p className="text-xs text-slate-500">
                Co đều hai bên khi thay đổi Width • Giữ nguyên tâm khi căn giữa
              </p>
            </div>
          </div>
        </div>

        {/* Component Selector Tabs */}
        <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          {(Object.keys(compLabels) as ComponentKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setSelectedCompKey(k)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedCompKey === k
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
              }`}
            >
              {compLabels[k]}
            </button>
          ))}
        </div>

        {/* Inspector Detail Controls */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <div className="flex items-center gap-2">
              <Layers size={15} className="text-amber-600" />
              <span className="text-xs font-bold uppercase text-slate-700">
                Đang cấu hình: <span className="text-amber-600">{compLabels[selectedCompKey]}</span>
              </span>
            </div>
          </div>

          {/* Alignment Controls (Text, Horizontal Frame, Vertical Frame) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            {/* 1. Text Alignment */}
            <div>
              <label className="text-[11px] text-slate-600 font-bold mb-1.5 block">
                Căn lề chữ (Text):
              </label>
              <div className="flex rounded-lg border border-slate-200 overflow-hidden p-0.5 bg-slate-50">
                {(['left', 'center', 'right'] as TextAlign[]).map((align) => (
                  <button
                    key={align}
                    onClick={() => updateComp(selectedCompKey, 'textAlign', align)}
                    className={`flex-1 py-1.5 flex items-center justify-center rounded transition text-xs font-semibold ${
                      (activeComp.textAlign || 'center') === align
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title={`Căn ${align}`}
                  >
                    {align === 'left' && <AlignLeft size={14} />}
                    {align === 'center' && <AlignCenter size={14} />}
                    {align === 'right' && <AlignRight size={14} />}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Horizontal Frame Align */}
            <div>
              <label className="text-[11px] text-slate-600 font-bold mb-1.5 block">
                Căn ngang khung:
              </label>
              <div className="flex rounded-lg border border-slate-200 overflow-hidden p-0.5 bg-slate-50">
                {(['left', 'center', 'right'] as HorizontalAlign[]).map((align) => (
                  <button
                    key={align}
                    onClick={() => setHorizontalAlign(selectedCompKey, align)}
                    className={`flex-1 py-1.5 flex items-center justify-center rounded transition text-xs font-semibold ${
                      (activeComp.horizontalAlign || 'center') === align
                        ? 'bg-sky-500 text-white font-bold shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title={`Căn ngang ${align}`}
                  >
                    <span className="capitalize">{align === 'left' ? 'Trái' : align === 'center' ? 'Giữa' : 'Phải'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Vertical Frame Align */}
            <div>
              <label className="text-[11px] text-slate-600 font-bold mb-1.5 block">
                Căn dọc khung:
              </label>
              <div className="flex rounded-lg border border-slate-200 overflow-hidden p-0.5 bg-slate-50">
                {(['top', 'center', 'bottom'] as VerticalAlign[]).map((align) => (
                  <button
                    key={align}
                    onClick={() => setVerticalAlign(selectedCompKey, align)}
                    className={`flex-1 py-1.5 flex items-center justify-center rounded transition text-xs font-semibold ${
                      (activeComp.verticalAlign || 'center') === align
                        ? 'bg-purple-600 text-white font-bold shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title={`Căn dọc ${align}`}
                  >
                    <span className="capitalize">{align === 'top' ? 'Trên' : align === 'center' ? 'Giữa' : 'Dưới'}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Position & Geometry Sliders */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            {/* Position X Slider */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-semibold">
                <span>Vị trí X:</span>
                <span className="font-mono font-bold text-amber-600">{activeComp.x ?? 0}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={activeComp.x ?? 0}
                onChange={(e) => updateComp(selectedCompKey, 'x', Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Position Y Slider */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-semibold">
                <span>Vị trí Y:</span>
                <span className="font-mono font-bold text-amber-600">{activeComp.y ?? 0}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={activeComp.y ?? 0}
                onChange={(e) => updateComp(selectedCompKey, 'y', Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Width Slider (Center-Preserving) */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-semibold">
                <span>Chiều rộng (W):</span>
                <span className="font-mono font-bold text-sky-600">
                  {activeComp.width ?? (selectedCompKey === 'answerButtons' ? 88 : 80)}%
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                step={1}
                value={activeComp.width ?? (selectedCompKey === 'answerButtons' ? 88 : 80)}
                onChange={(e) => updateWidth(selectedCompKey, Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <p className="text-[9px] text-slate-400 mt-0.5">Co đều hai bên khi căn giữa</p>
            </div>

            {/* Height Slider (Center-Preserving) */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-semibold">
                <span>Chiều cao (H):</span>
                <span className="font-mono font-bold text-sky-600">{activeComp.height ?? 20}%</span>
              </div>
              <input
                type="range"
                min={2}
                max={100}
                step={1}
                value={activeComp.height ?? 20}
                onChange={(e) => updateHeight(selectedCompKey, Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <p className="text-[9px] text-slate-400 mt-0.5">Giữ nguyên tâm trục Y</p>
            </div>
          </div>

          {/* Styling & Motion */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div>
              <label className="text-[11px] text-slate-600 font-bold mb-1 block">
                Cỡ chữ (Font Size):
              </label>
              <input
                type="number"
                value={activeComp.fontSize || 24}
                onChange={(e) => updateComp(selectedCompKey, 'fontSize', Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-600 font-bold mb-1 block">
                Bo góc (Radius):
              </label>
              <input
                type="number"
                value={activeComp.borderRadius ?? 16}
                onChange={(e) => updateComp(selectedCompKey, 'borderRadius', Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-600 font-bold mb-1 block">
                Độ dày viền (Border):
              </label>
              <input
                type="number"
                value={activeComp.borderWidth ?? 0}
                onChange={(e) => updateComp(selectedCompKey, 'borderWidth', Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-600 font-bold mb-1 block">
                Hiệu ứng vào (Entrance):
              </label>
              <select
                value={activeComp.animation || 'slide-up'}
                onChange={(e) => updateComp(selectedCompKey, 'animation', e.target.value as AnimationType)}
                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 focus:outline-none"
              >
                <option value="slide-up">Trượt lên (Slide Up)</option>
                <option value="pop">Bật nảy (Pop / Spring)</option>
                <option value="scale-in">Phóng to (Scale In)</option>
                <option value="bounce">Đàn hồi (Bounce)</option>
                <option value="fade">Mờ dần (Fade)</option>
              </select>
            </div>
          </div>
          {/* Dedicated Countdown Controls */}
          {selectedCompKey === 'countdown' && (
            <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200 space-y-3 mt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Clock size={15} className="text-amber-600" />
                  <span>Cấu hình Đồng hồ Đếm ngược</span>
                </span>
                <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded">
                  {template.countdownStyle || 'clean-text'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 mb-1 block">
                    Phong cách đếm:
                  </label>
                  <select
                    value={template.countdownStyle || 'circle-radial'}
                    onChange={(e) => onChange({ ...template, countdownStyle: e.target.value as CountdownStyle })}
                    className="w-full h-8 bg-white border border-amber-200 rounded-lg px-2 text-xs text-slate-800 font-semibold focus:outline-none"
                  >
                    <option value="circle-radial">Vòng tròn tiến trình (Radial Circle)</option>
                    <option value="pill-timer">Viên con nhộng (Pill Badge)</option>
                    <option value="clean-text">⏱️ Chữ & Số trực tiếp (Không viền hộp)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 mb-1 block">
                    Icon đồng hồ (⏱️):
                  </label>
                  <button
                    type="button"
                    onClick={() => updateComp('countdown', 'showIcon', activeComp.showIcon === false ? true : false)}
                    className={`w-full h-8 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      activeComp.showIcon !== false
                        ? 'bg-amber-500 text-slate-950 shadow-2xs'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {activeComp.showIcon !== false ? <Eye size={13} /> : <EyeOff size={13} />}
                    <span>{activeComp.showIcon !== false ? 'Hiện icon' : 'Ẩn icon'}</span>
                  </button>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 mb-1 block">
                    Kích thước Icon (px):
                  </label>
                  <input
                    type="number"
                    min={16}
                    max={60}
                    value={activeComp.iconSize || 30}
                    onChange={(e) => updateComp('countdown', 'iconSize', Number(e.target.value))}
                    className="w-full h-8 bg-white border border-amber-200 rounded-lg px-2.5 text-xs text-slate-800 font-mono focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Dedicated Background & Ken Burns Controls */}
          {selectedCompKey === 'background' && (
            <div className="p-4 bg-sky-50/70 rounded-xl border border-sky-200 space-y-3 mt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                  <ImageIcon size={15} className="text-sky-600" />
                  <span>Cấu hình Nền Video & Chuyển động Ken Burns (9:16)</span>
                </span>
                <span className="text-[10px] bg-sky-500 text-white font-bold px-2 py-0.5 rounded">
                  {activeComp.type || 'gradient'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 mb-1 block">
                    Loại hình nền:
                  </label>
                  <select
                    value={activeComp.type || 'gradient'}
                    onChange={(e) => updateComp('background', 'type', e.target.value)}
                    className="w-full h-8 bg-white border border-sky-200 rounded-lg px-2 text-xs text-slate-800 font-semibold focus:outline-none"
                  >
                    <option value="image">🖼️ Ảnh nền (Background Image 9:16)</option>
                    <option value="gradient">Chuyển sắc (Linear Gradient)</option>
                    <option value="solid">Đơn sắc (Solid Color)</option>
                    <option value="mesh">Lưới màu (Mesh Radial)</option>
                    <option value="pattern">Họa tiết chấm (Pattern Dot)</option>
                  </select>
                </div>

                {activeComp.type === 'image' && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 mb-1 block">
                      Tải lên ảnh nền:
                    </label>
                    <input
                      ref={bgFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleUploadBg}
                    />
                    <button
                      type="button"
                      onClick={() => bgFileInputRef.current?.click()}
                      disabled={isUploadingBg}
                      className="w-full h-8 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-2xs transition"
                    >
                      <Upload size={13} />
                      <span>{isUploadingBg ? 'Đang tải lên...' : 'Tải ảnh 9:16 từ máy'}</span>
                    </button>
                  </div>
                )}
              </div>

              {activeComp.type === 'image' && (
                <div className="bg-white p-3 rounded-xl border border-sky-100 space-y-3">
                  {/* Overlay Opacity Slider */}
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-semibold">
                      <span>Lớp phủ mờ chống chói text (Overlay):</span>
                      <span className="font-mono text-sky-700 font-bold">
                        {Math.round((activeComp.overlayOpacity ?? 0.2) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={80}
                      step={5}
                      value={Math.round((activeComp.overlayOpacity ?? 0.2) * 100)}
                      onChange={(e) => updateComp('background', 'overlayOpacity', Number(e.target.value) / 100)}
                      className="w-full accent-sky-500 cursor-pointer"
                    />
                  </div>

                  {/* Ken Burns settings */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Sparkles size={13} className="text-amber-500" />
                        <span>Chuyển động nhẹ nhàng (Ken Burns / Pan & Zoom):</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => updateBgMotion('enabled', activeComp.motion?.enabled === false ? true : false)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          activeComp.motion?.enabled !== false
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {activeComp.motion?.enabled !== false ? 'BẬT' : 'TẮT'}
                      </button>
                    </div>

                    {activeComp.motion?.enabled !== false && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                        <div>
                          <span className="text-[10px] font-semibold text-slate-500 block mb-0.5">
                            Hướng chuyển động:
                          </span>
                          <select
                            value={activeComp.motion?.direction || 'zoom-in'}
                            onChange={(e) => updateBgMotion('direction', e.target.value as MotionDirection)}
                            className="w-full h-7 bg-slate-50 border border-slate-200 rounded px-1.5 text-xs"
                          >
                            <option value="zoom-in">Phóng to (Zoom In)</option>
                            <option value="zoom-out">Thu nhỏ (Zoom Out)</option>
                            <option value="pan-left">Lướt trái (Pan Left)</option>
                            <option value="pan-right">Lướt phải (Pan Right)</option>
                            <option value="pan-up">Lướt lên (Pan Up)</option>
                            <option value="pan-down">Lướt xuống (Pan Down)</option>
                          </select>
                        </div>

                        <div>
                          <span className="text-[10px] font-semibold text-slate-500 block mb-0.5">
                            Zoom Bắt đầu ({activeComp.motion?.zoomStart ?? 1.05}x):
                          </span>
                          <input
                            type="range"
                            min={100}
                            max={130}
                            step={1}
                            value={Math.round((activeComp.motion?.zoomStart ?? 1.05) * 100)}
                            onChange={(e) => updateBgMotion('zoomStart', Number(e.target.value) / 100)}
                            className="w-full accent-sky-500 cursor-pointer"
                          />
                        </div>

                        <div>
                          <span className="text-[10px] font-semibold text-slate-500 block mb-0.5">
                            Zoom Kết thúc ({activeComp.motion?.zoomEnd ?? 1.18}x):
                          </span>
                          <input
                            type="range"
                            min={100}
                            max={140}
                            step={1}
                            value={Math.round((activeComp.motion?.zoomEnd ?? 1.18) * 100)}
                            onChange={(e) => updateBgMotion('zoomEnd', Number(e.target.value) / 100)}
                            className="w-full accent-sky-500 cursor-pointer"
                          />
                        </div>
                      </div>
                    )}
                    <p className="text-[9px] text-emerald-600 font-medium">
                      ✓ Chu kỳ chuyển động tự động làm mới ở mỗi câu hỏi mới
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. TIMING & DURATION SETTINGS                                             */}
      {/* ========================================================================= */}
      <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
            <Clock size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              4. Thời Lượng & Nhịp Độ Video (Timeline Timings)
            </h3>
            <p className="text-xs text-slate-500">
              Kiểm soát thời gian đếm ngược, mở đáp án và giữ hình đuôi video
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 font-semibold">Đếm ngược suy nghĩ:</span>
              <span className="text-amber-600 font-mono font-bold">
                {template.timing?.countdownSeconds || 5}s
              </span>
            </div>
            <input
              type="range"
              min={3}
              max={10}
              step={1}
              value={template.timing?.countdownSeconds || 5}
              onChange={(e) => updateTiming('countdownSeconds', Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 font-semibold">Mở đáp án & chúc mừng:</span>
              <span className="text-emerald-600 font-mono font-bold">
                {template.timing?.revealSeconds || 2.5}s
              </span>
            </div>
            <input
              type="range"
              min={1.5}
              max={6}
              step={0.5}
              value={template.timing?.revealSeconds || 2.5}
              onChange={(e) => updateTiming('revealSeconds', Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 font-semibold">Giữ hình đuôi video (End Buffer):</span>
              <span className="text-sky-600 font-mono font-bold">
                {template.timing?.endBufferSeconds ?? 2.5}s
              </span>
            </div>
            <input
              type="range"
              min={1.0}
              max={6.0}
              step={0.5}
              value={template.timing?.endBufferSeconds ?? 2.5}
              onChange={(e) => updateTiming('endBufferSeconds', Number(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
