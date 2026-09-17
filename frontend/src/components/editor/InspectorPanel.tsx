import React, { useRef, useState } from 'react';
import {
  VideoTemplate,
  Channel,
  LanguageCode,
  HorizontalAlign,
  VerticalAlign,
  AnimationType,
  CountdownStyle,
  MotionDirection,
  MotionEffect,
  Quiz,
  NeonPresetId,
  ExplanationConfig,
  DEFAULT_EXPLANATION_CONFIG,
  UI_PRESETS,
  applyUiPreset,
  UiPreset
} from '../../../../remotion/types/index';
import { TEMPLATE_LIBRARY, applyTemplateLayout } from '../../../../remotion/types/templates';
import {
  Sliders,
  Type,
  Move,
  Clock,
  Sparkles,
  Image as ImageIcon,
  Upload,
  Volume2,
  Mic,
  Check,
  Play,
  RotateCcw,
  Palette,
  Trash2,
  Heading,
  Wand2,
  Loader2,
  Download,
  Lightbulb,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Slider } from '../ui/slider';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { uploadImage, uploadAudio, removeImageBackground } from '../../services/api';

export type ComponentKey =
  | 'questionBox'
  | 'answerButtons'
  | 'illustration'
  | 'countdown'
  | 'questionNumber'
  | 'quizTitle'
  | 'header'
  | 'explanation'
  | 'logo'
  | 'background';

export type InspectorTab =
  | 'templates'
  | 'presets'
  | 'settings'
  | 'title'
  | 'layout'
  | 'typography'
  | 'illustration'
  | 'countdown'
  | 'explanation'
  | 'audio'
  | 'brand'
  | 'animation';

export interface NeonPresetItem {
  id: NeonPresetId;
  name: string;
  tag: string;
  desc: string;
  gradientPreview: string;
  icon: string;
}

export const NEON_PRESETS: NeonPresetItem[] = [
  {
    id: 'neon-gradient',
    name: 'Neon Gradient Sáng',
    tag: 'Rực rỡ',
    desc: 'Luồng gradient đa điểm neon chuyển dịch góc và sắc thái liên tục',
    gradientPreview: 'linear-gradient(135deg, #00f0ff 0%, #ff007f 50%, #7928ca 100%)',
    icon: '🌈'
  },
  {
    id: 'cyber-glow',
    name: 'Quầng Sáng Cyber Glow',
    tag: 'Huyền ảo',
    desc: 'Các khối plasma neon đa tâm co giãn, nhấp nháy quang sai tỏa sáng',
    gradientPreview: 'radial-gradient(circle, #f72585 20%, #00f2fe 60%, #04040d 100%)',
    icon: '💫'
  },
  {
    id: 'light-waves',
    name: 'Sóng Ánh Sáng Trừu Tượng',
    tag: 'Chuyển động mượt',
    desc: 'Dải sóng sin SVG phát sáng neon uốn lượn đa tần số mềm mại',
    gradientPreview: 'linear-gradient(90deg, #00f0ff 0%, #8b5cf6 50%, #ff007f 100%)',
    icon: '🌊'
  },
  {
    id: 'neon-grid',
    name: 'Lưới Không Gian Synthwave',
    tag: '3D Cyberpunk',
    desc: 'Lưới phối cảnh 3D di chuyển vô tận về phía chân trời rực rỡ',
    gradientPreview: 'linear-gradient(180deg, #ff007f 0%, #3b0764 45%, #00f0ff 100%)',
    icon: '🌐'
  },
  {
    id: 'energy-lines',
    name: 'Tia Năng Lượng Cực Quang',
    tag: 'Tốc độ cao',
    desc: '16 chùm tia laser neon quét dọc tốc độ cao có vệt phát sáng',
    gradientPreview: 'linear-gradient(180deg, #00f5d4 0%, #7b2cbf 60%, #ffe600 100%)',
    icon: '⚡'
  },
  {
    id: 'light-particles',
    name: 'Hạt Ánh Sáng & Bokeh',
    tag: 'Tinh tế',
    desc: 'Hạt bụi ánh sáng, bokeh neon bồng bềnh lơ lửng chuyển động',
    gradientPreview: 'radial-gradient(circle, #38bdf8 20%, #ec4899 55%, #050515 100%)',
    icon: '✨'
  },
  {
    id: 'geometric-neon',
    name: 'Đa Giác Neon Công Nghệ',
    tag: 'Hi-Tech',
    desc: 'Đa giác công nghệ viền neon xoay đảo chiều và radar phát quang',
    gradientPreview: 'radial-gradient(circle, #00f0ff 25%, #a855f7 65%, #050714 100%)',
    icon: '🔷'
  },
  {
    id: 'aurora-neon',
    name: 'Dải Cực Quang Aurora',
    tag: 'Kỳ ảo',
    desc: 'Dải lụa cực quang lượn sóng mềm mại huyền ảo ngọc bích và tím hồng',
    gradientPreview: 'linear-gradient(120deg, #10b981 0%, #06b6d4 40%, #d946ef 100%)',
    icon: '🌌'
  },
  {
    id: 'particles',
    name: 'Đốm Sáng Bokeh Bay',
    tag: 'Bay bổng',
    desc: 'Bụi sáng phát quang trôi nổi tự nhiên trong không gian',
    gradientPreview: 'radial-gradient(circle, #38bdf8 30%, #a855f7 70%, #030014 100%)',
    icon: '🔮'
  },
  {
    id: 'light-streaks',
    name: 'Tia Sáng Siêu Tốc',
    tag: 'Vũ trụ',
    desc: 'Chùm tia laser rơi nhanh như du hành không gian',
    gradientPreview: 'linear-gradient(180deg, #00f0ff 0%, #ff007f 70%, #ffffff 100%)',
    icon: '🌠'
  },
  {
    id: 'gradient-motion',
    name: 'Gradient Xoay Đổi Sắc',
    tag: 'Hiện đại',
    desc: 'Gradient 3 màu xoay góc mượt mà và biến thiên liên tục',
    gradientPreview: 'linear-gradient(45deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
    icon: '🌀'
  }
];

export const THEME_PALETTES = [
  {
    name: 'Xanh Cyber',
    primary: '#38bdf8',
    secondary: '#818cf8',
    bg: '#030712',
    cardBg: '#0f172a',
    cardOpacity: 0.88,
    text: '#ffffff',
    border: '#38bdf8'
  },
  {
    name: 'Đỏ Ruby',
    primary: '#f43f5e',
    secondary: '#fb7185',
    bg: '#180308',
    cardBg: '#2d0a14',
    cardOpacity: 0.9,
    text: '#ffffff',
    border: '#f43f5e'
  },
  {
    name: 'Vàng Hoàng Gia',
    primary: '#f59e0b',
    secondary: '#fbbf24',
    bg: '#0f0e0a',
    cardBg: '#1f1b0d',
    cardOpacity: 0.9,
    text: '#ffffff',
    border: '#f59e0b'
  },
  {
    name: 'Tím Neon',
    primary: '#a855f7',
    secondary: '#c084fc',
    bg: '#0b0416',
    cardBg: '#1a0933',
    cardOpacity: 0.88,
    text: '#ffffff',
    border: '#a855f7'
  },
  {
    name: 'Xanh Ngọc',
    primary: '#10b981',
    secondary: '#34d399',
    bg: '#021810',
    cardBg: '#062d1f',
    cardOpacity: 0.88,
    text: '#ffffff',
    border: '#10b981'
  },
  {
    name: 'Sáng Thanh Lịch',
    primary: '#2563eb',
    secondary: '#3b82f6',
    bg: '#ffffff',
    cardBg: '#ffffff',
    cardOpacity: 0.95,
    text: '#0f172a',
    border: '#93c5fd'
  }
];

interface InspectorPanelProps {
  template: VideoTemplate;
  channel: Channel;
  language: LanguageCode;
  quiz?: Quiz;
  onQuizChange?: (updated: Quiz) => void;
  onTemplateChange: (updated: VideoTemplate) => void;
  onChannelChange: (updated: Channel) => void;
  onLanguageChange?: (lang: LanguageCode) => void;
  onApplyTemplate?: (templateId: string) => void;
  selectedKey?: ComponentKey;
  onSelectKey?: (key: ComponentKey) => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  template,
  channel,
  language,
  quiz,
  onQuizChange,
  onTemplateChange,
  onChannelChange,
  onLanguageChange,
  onApplyTemplate,
  selectedKey = 'questionBox',
  onSelectKey
}) => {
  const [activeTab, setActiveTab] = useState<InspectorTab>('templates');
  const [layoutTarget, setLayoutTarget] = useState<'questionBox' | 'answerButtons' | 'questionNumber'>('questionBox');
  const [activeOptionTab, setActiveOptionTab] = useState<'A' | 'B' | 'C'>('A');

  const handleApplyPresetTemplate = (tmplId: string) => {
    if (onApplyTemplate) {
      onApplyTemplate(tmplId);
    } else {
      const res = applyTemplateLayout(tmplId, template, channel);
      onTemplateChange(res.template);
      onChannelChange(res.channel);
    }
    const found = TEMPLATE_LIBRARY.find((t) => t.id === tmplId);
    setPresetNotice(`Đã áp dụng mẫu "${found?.name || tmplId}" thành công! Bố cục và màu sắc đã đồng bộ.`);
    setTimeout(() => setPresetNotice(null), 3000);
  };

  const updateOptionProp = (optKey: 'A' | 'B' | 'C', prop: string, val: any) => {
    const ansComp = template.components.answerButtons || ({} as any);
    const existingOptions = ansComp.options || {};
    const currentOpt = existingOptions[optKey] || {};
    const updatedOpt = { ...currentOpt, [prop]: val };

    onUpdateTemplate({
      ...template,
      components: {
        ...template.components,
        answerButtons: {
          ...ansComp,
          useIndividualStyles: true,
          options: {
            ...existingOptions,
            [optKey]: updatedOpt
          }
        }
      }
    });
  };

  const toggleIndividualAnswerStyles = (enabled: boolean) => {
    const ansComp = template.components.answerButtons || ({} as any);
    onUpdateTemplate({
      ...template,
      components: {
        ...template.components,
        answerButtons: {
          ...ansComp,
          useIndividualStyles: enabled
        }
      }
    });
  };

  const updateLayoutComposition = (comp: any) => {
    const ansComp = template.components.answerButtons || ({} as any);
    onUpdateTemplate({
      ...template,
      components: {
        ...template.components,
        answerButtons: {
          ...ansComp,
          layoutComposition: comp
        }
      }
    });
  };

  const bgFileInputRef = useRef<HTMLInputElement | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [removeBgStatus, setRemoveBgStatus] = useState<string | null>(null);
  const [newPresetName, setNewPresetName] = useState('');
  const [savedPresets, setSavedPresets] = useState<any[]>(() => {
    try {
      const raw = localStorage.getItem('custom_quiz_presets');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [presetNotice, setPresetNotice] = useState<string | null>(null);
  const presetImportInputRef = useRef<HTMLInputElement | null>(null);

  const handleSaveCustomPreset = () => {
    if (!newPresetName.trim()) return;
    const newPreset = {
      id: `preset_${Date.now()}`,
      name: newPresetName.trim(),
      createdAt: new Date().toLocaleDateString('vi-VN'),
      template: JSON.parse(JSON.stringify(template)),
      branding: JSON.parse(JSON.stringify(channel.branding || {}))
    };
    const updated = [newPreset, ...savedPresets.filter(p => p.name !== newPreset.name)];
    localStorage.setItem('custom_quiz_presets', JSON.stringify(updated));
    setSavedPresets(updated);
    setNewPresetName('');
    setPresetNotice(`Đã lưu preset "${newPreset.name}" thành công!`);
    setTimeout(() => setPresetNotice(null), 3000);
  };

  const handleApplyCustomPreset = (p: any) => {
    onTemplateChange({
      ...p.template,
      id: template.id
    });
    if (p.branding) {
      onChannelChange({
        ...channel,
        branding: {
          ...channel.branding,
          ...p.branding
        }
      });
    }
    setPresetNotice(`Đã áp dụng preset "${p.name}"!`);
    setTimeout(() => setPresetNotice(null), 3000);
  };

  const handleDeleteCustomPreset = (id: string) => {
    const updated = savedPresets.filter(p => p.id !== id);
    localStorage.setItem('custom_quiz_presets', JSON.stringify(updated));
    setSavedPresets(updated);
  };

  const handleExportPresetJson = (p: any) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(p, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `quiz_preset_${p.name.replace(/[^a-zA-Z0-9_\-]/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportPresetJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (!imported.template) throw new Error('File JSON không hợp lệ (thiếu template)');
        const newPreset = {
          id: `preset_${Date.now()}`,
          name: imported.name || `Preset Nhập (${new Date().toLocaleDateString('vi-VN')})`,
          createdAt: new Date().toLocaleDateString('vi-VN'),
          template: imported.template,
          branding: imported.branding
        };
        const updated = [newPreset, ...savedPresets];
        localStorage.setItem('custom_quiz_presets', JSON.stringify(updated));
        setSavedPresets(updated);
        handleApplyCustomPreset(newPreset);
      } catch (err: any) {
        alert(`Lỗi nhập preset: ${err.message}`);
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  const handleApplyThemePalette = (tp: typeof THEME_PALETTES[0]) => {
    onChannelChange({
      ...channel,
      branding: {
        ...channel.branding,
        colors: {
          ...channel.branding?.colors,
          primary: tp.primary,
          secondary: tp.secondary
        }
      }
    });
    onTemplateChange({
      ...template,
      components: {
        ...template.components,
        background: {
          ...template.components.background,
          backgroundColor: tp.bg
        },
        questionBox: {
          ...template.components.questionBox,
          backgroundColor: tp.cardBg,
          textColor: tp.text,
          borderColor: tp.border
        },
        answerButtons: {
          ...template.components.answerButtons,
          backgroundColor: tp.cardBg,
          bgOpacity: tp.cardOpacity,
          textColor: tp.text,
          borderColor: tp.border
        }
      }
    });
    setPresetNotice(`Đã áp dụng theme "${tp.name}"!`);
    setTimeout(() => setPresetNotice(null), 3000);
  };

  const updateChannelColor = (key: 'primary' | 'secondary', val: string) => {
    onChannelChange({
      ...channel,
      branding: {
        ...channel.branding,
        colors: {
          ...channel.branding?.colors,
          [key]: val
        }
      }
    });
  };

  // Quick helper to update a component's style
  const updateCompStyle = (compKey: ComponentKey, prop: string, value: any) => {
    const existing = template.components[compKey] || {};
    onTemplateChange({
      ...template,
      components: {
        ...template.components,
        [compKey]: {
          ...existing,
          [prop]: value
        }
      }
    });
  };

  // Quiz Title Helpers
  const quizTitleStyle = template.components.quizTitle || {};
  const isTitleEnabled = quizTitleStyle.enabled !== false;
  const currentTitleText = quizTitleStyle.text !== undefined ? quizTitleStyle.text : (quiz?.title ?? '');

  const updateQuizTitleProp = (prop: string, value: any) => {
    onTemplateChange({
      ...template,
      components: {
        ...template.components,
        quizTitle: {
          ...template.components.quizTitle,
          [prop]: value
        }
      }
    });
  };

  const handleTitleTextChange = (val: string) => {
    updateQuizTitleProp('text', val);
    if (quiz && onQuizChange) {
      onQuizChange({
        ...quiz,
        title: val
      });
    }
  };

  // Width update preserving center
  const updateCompWidth = (compKey: ComponentKey, newWidth: number) => {
    const existing = template.components[compKey] || {};
    const oldWidth = existing.width ?? 88;
    const oldX = existing.x ?? ((100 - oldWidth) / 2);
    const hAlign = existing.horizontalAlign ?? 'center';

    let newX = oldX;
    if (hAlign === 'center') {
      const currentCenterX = oldX + oldWidth / 2;
      newX = Math.round((currentCenterX - newWidth / 2) * 10) / 10;
    } else if (hAlign === 'right') {
      const currentRight = oldX + oldWidth;
      newX = Math.round((currentRight - newWidth) * 10) / 10;
    }

    onTemplateChange({
      ...template,
      components: {
        ...template.components,
        [compKey]: {
          ...existing,
          horizontalAlign: hAlign,
          width: newWidth,
          x: Math.max(0, Math.min(100 - newWidth, newX))
        }
      }
    });
  };

  // Height update preserving center
  const updateCompHeight = (compKey: ComponentKey, newHeight: number) => {
    const existing = template.components[compKey] || {};
    const oldHeight = existing.height ?? 20;
    const oldY = existing.y ?? ((100 - oldHeight) / 2);
    const vAlign = existing.verticalAlign ?? 'center';

    let newY = oldY;
    if (vAlign === 'center') {
      const currentCenterY = oldY + oldHeight / 2;
      newY = Math.round((currentCenterY - newHeight / 2) * 10) / 10;
    } else if (vAlign === 'bottom') {
      const currentBottom = oldY + oldHeight;
      newY = Math.round((currentBottom - newHeight) * 10) / 10;
    }

    onTemplateChange({
      ...template,
      components: {
        ...template.components,
        [compKey]: {
          ...existing,
          verticalAlign: vAlign,
          height: newHeight,
          y: Math.max(0, Math.min(100 - newHeight, newY))
        }
      }
    });
  };

  const setCompHorizontalAlign = (compKey: ComponentKey, align: HorizontalAlign) => {
    const existing = template.components[compKey] || {};
    const width = existing.width ?? 88;
    let newX = existing.x ?? 6;

    if (align === 'center') {
      newX = Math.round(((100 - width) / 2) * 10) / 10;
    } else if (align === 'left') {
      newX = 6;
    } else if (align === 'right') {
      newX = Math.max(0, 100 - width - 6);
    }

    onTemplateChange({
      ...template,
      components: {
        ...template.components,
        [compKey]: {
          ...existing,
          horizontalAlign: align,
          x: newX
        }
      }
    });
  };

  // Background Image Upload
  const handleUploadBgImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const res = await uploadImage(file);
      onTemplateChange({
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
      setIsUploading(false);
    }
  };

  // Logo Upload
  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const res = await uploadImage(file);
      const newLogoUrl = res.optimizedUrl || res.originalUrl;
      onChannelChange({
        ...channel,
        branding: {
          ...channel.branding,
          identity: {
            ...channel.branding?.identity,
            logoUrl: newLogoUrl
          }
        },
        brand: {
          ...(channel as any).brand,
          logoUrl: newLogoUrl
        }
      });
      onTemplateChange({
        ...template,
        components: {
          ...template.components,
          logo: {
            ...template.components.logo,
            logoUrl: newLogoUrl,
            showLogo: true
          }
        }
      });
    } catch (err: any) {
      alert(`Lỗi upload logo: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Background Removal for Logo
  const handleRemoveLogoBg = async () => {
    const currentLogo =
      template.components.logo?.logoUrl ||
      channel.branding?.identity?.logoUrl ||
      (channel as any).brand?.logoUrl;
    if (!currentLogo) return;
    try {
      setIsRemovingBg(true);
      setRemoveBgStatus('Đang tách nền...');
      const res = await removeImageBackground(currentLogo);
      const transparentUrl = res.url || (res as any).transparentUrl;
      if (transparentUrl) {
        onChannelChange({
          ...channel,
          branding: {
            ...channel.branding,
            identity: {
              ...channel.branding?.identity,
              logoUrl: transparentUrl
            }
          },
          brand: {
            ...(channel as any).brand,
            logoUrl: transparentUrl
          }
        });
        onTemplateChange({
          ...template,
          components: {
            ...template.components,
            logo: {
              ...template.components.logo,
              logoUrl: transparentUrl
            }
          }
        });
        setRemoveBgStatus('Đã tách nền thành công!');
        setTimeout(() => setRemoveBgStatus(null), 3000);
      }
    } catch (err: any) {
      alert(`Lỗi tách nền logo: ${err.message}`);
      setRemoveBgStatus(null);
    } finally {
      setIsRemovingBg(false);
    }
  };

  // Delete Logo
  const handleDeleteLogo = () => {
    onChannelChange({
      ...channel,
      branding: {
        ...channel.branding,
        identity: {
          ...channel.branding?.identity,
          logoUrl: undefined
        }
      },
      brand: {
        ...(channel as any).brand,
        logoUrl: undefined
      }
    });
    onTemplateChange({
      ...template,
      components: {
        ...template.components,
        logo: {
          ...template.components.logo,
          logoUrl: undefined
        }
      }
    });
  };

  // SFX Custom Upload
  const handleUploadCustomSfx = async (sfxKey: string, file: File) => {
    try {
      setIsUploading(true);
      const res = await uploadAudio(file);
      const currentSfx = channel.audio?.sfx || {};
      onChannelChange({
        ...channel,
        audio: {
          ...channel.audio,
          sfx: {
            ...currentSfx,
            [sfxKey]: res.url
          }
        }
      });
    } catch (err: any) {
      alert(`Lỗi upload SFX: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // SFX Preview
  const playSfxPreview = (url?: string) => {
    if (!url) return;
    const audio = new Audio(url);
    audio.volume = channel.audio?.sfxVolume ?? 0.8;
    audio.play().catch((err) => console.error('Audio preview error:', err));
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 border-l border-slate-800 text-slate-200 select-none overflow-hidden">
      {/* 1. Top Header with Title and STRICTLY 1 SINGLE ROW OF TABS */}
      <div className="border-b border-slate-800 shrink-0 bg-slate-900/90 select-none">
        <div className="px-3 pt-2.5 pb-2 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
            <Sliders size={14} className="text-amber-400" />
            <span>Inspector Cài Đặt</span>
          </span>
          <Badge className="bg-amber-500/10 border-amber-500/30 text-amber-400 text-[10px] font-bold">
            Realtime Sync
          </Badge>
        </div>

        {/* The ONLY Tab Bar (Single horizontal scrollable row, exactly 1 row) */}
        <div className="flex items-center gap-1 px-2 pb-2 overflow-x-auto scrollbar-none">
          {[
            { id: 'templates', label: 'Mẫu Template', icon: <Wand2 size={12} /> },
            { id: 'settings', label: 'Cài Đặt', icon: <Sliders size={12} /> },
            { id: 'title', label: 'Tiêu đề', icon: <Heading size={12} /> },
            { id: 'layout', label: 'Bố cục', icon: <Move size={12} /> },
            { id: 'typography', label: 'Kiểu chữ', icon: <Type size={12} /> },
            { id: 'illustration', label: 'Ảnh minh họa', icon: <ImageIcon size={12} /> },
            { id: 'countdown', label: 'Đếm ngược', icon: <Clock size={12} /> },
            { id: 'explanation', label: 'Giải thích', icon: <Lightbulb size={12} /> },
            { id: 'audio', label: 'Audio & TTS', icon: <Volume2 size={12} /> },
            { id: 'brand', label: 'Logo & Nền', icon: <Palette size={12} /> },
            { id: 'animation', label: 'Hiệu ứng', icon: <Sparkles size={12} /> }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as InspectorTab)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                activeTab === t.id
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Scrollable Tab Content Body (Strict separation per tab) */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
        {/* ========================================================= */}
        {/* TAB TEMPLATES: 12 THƯ VIỆN TEMPLATE LAYOUT DỰNG SẴN      */}
        {/* ========================================================= */}
        {activeTab === 'templates' && (
          <div className="space-y-3.5">
            {presetNotice && (
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <Check size={14} className="text-emerald-400 shrink-0" />
                <span>{presetNotice}</span>
              </div>
            )}

            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Wand2 size={14} />
                <span>Thư Viện 12 Template Layout Dựng Sẵn</span>
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Mỗi template mang một bố cục (composition), hình khối (shapes) và bảng màu sáng hiện đại hoàn toàn khác biệt. Bấm để áp dụng toàn bộ composition, sau đó bạn có thể tinh chỉnh từng thông số trong tab Bố Cục.
              </p>
            </div>

            {/* Template Library Cards */}
            <div className="space-y-3">
              {TEMPLATE_LIBRARY.map((p) => {
                const isActive = template.name === p.name || template.id === p.id;
                const qShape = p.template.components.questionBox?.shape || 'rounded';
                const ansComp = p.template.components.answerButtons?.layoutComposition || 'stacked';
                return (
                  <div
                    key={p.id}
                    className={`bg-slate-900 rounded-xl border transition p-3 space-y-2.5 relative overflow-hidden ${
                      isActive
                        ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)] ring-1 ring-amber-500/50'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Header: Icon, Name, Tag & Active Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xl shrink-0">{p.icon}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-xs font-extrabold text-white truncate">
                              {p.name}
                            </h4>
                            {isActive && (
                              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[9px] px-1.5 py-0">
                                Đang chọn
                              </Badge>
                            )}
                          </div>
                          <span className="text-[10px] text-amber-400 font-medium block truncate">{p.tag}</span>
                        </div>
                      </div>

                      {/* Accent color pills */}
                      <div className="flex items-center gap-1 shrink-0">
                        {p.accentColors.map((color, cIdx) => (
                          <div
                            key={cIdx}
                            className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Gradient preview banner */}
                    <div
                      className="h-10 w-full rounded-lg border border-white/10 flex items-center justify-between px-3 text-[11px] font-bold shadow-inner"
                      style={{ background: p.previewGradient }}
                    >
                      <span className="drop-shadow-md text-slate-900 font-extrabold">Aa Bb 123</span>
                      <div className="flex items-center gap-1.5 text-[9px] opacity-90 drop-shadow-md text-slate-800 font-semibold">
                        <span className="bg-white/80 px-1.5 py-0.5 rounded border border-black/10">Shape: {qShape}</span>
                        <span className="bg-white/80 px-1.5 py-0.5 rounded border border-black/10">Bố cục: {ansComp}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {p.description}
                    </p>

                    {/* Action Button */}
                    <button
                      type="button"
                      onClick={() => handleApplyPresetTemplate(p.id)}
                      className={`w-full py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        isActive
                          ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-xs'
                      }`}
                    >
                      <Wand2 size={13} />
                      <span>{isActive ? 'Đang áp dụng mẫu này' : 'Áp dụng Template này'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 0: CÀI ĐẶT TOÀN DIỆN & PRESETS (SETTINGS MASTER)        */}
        {/* ========================================================= */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            {presetNotice && (
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <Check size={14} className="text-emerald-400 shrink-0" />
                <span>{presetNotice}</span>
              </div>
            )}

            {/* 1. PRESET MANAGEMENT (Lưu & Tải Preset Tùy Chỉnh) */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={14} />
                  <span>Preset Tùy Chỉnh (Custom Presets)</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Tái sử dụng nhanh</span>
              </div>

              {/* Save current configuration as preset */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 block">Lưu cấu hình hiện tại thành preset:</label>
                <div className="flex items-center gap-2">
                  <Input
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    placeholder="Nhập tên preset (VD: Theme Kênh Shorts Mới)..."
                    className="h-8 bg-slate-950 border-slate-700 text-xs text-white placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={handleSaveCustomPreset}
                    disabled={!newPresetName.trim()}
                    className="px-3 h-8 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shrink-0 transition disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Lưu Preset</span>
                  </button>
                </div>
              </div>

              {/* Saved Presets List */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400">Danh sách đã lưu ({savedPresets.length}):</span>
                  <label className="text-[10px] text-amber-400 hover:text-amber-300 cursor-pointer flex items-center gap-1">
                    <Upload size={11} />
                    <span>Nhập file JSON</span>
                    <input
                      type="file"
                      accept=".json,application/json"
                      ref={presetImportInputRef}
                      onChange={handleImportPresetJson}
                      className="hidden"
                    />
                  </label>
                </div>

                {savedPresets.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic py-1">
                    Chưa có preset tùy chỉnh nào. Bạn có thể lưu lại cấu hình màu, font, nhịp điệu của video để dùng cho các video sau.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {savedPresets.map((p) => (
                      <div
                        key={p.id}
                        className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-slate-200 block truncate">{p.name}</span>
                          <span className="text-[10px] text-slate-500">{p.createdAt}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleApplyCustomPreset(p)}
                            className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-slate-950 text-[10px] font-bold transition cursor-pointer"
                            title="Áp dụng preset này"
                          >
                            Áp dụng
                          </button>
                          <button
                            type="button"
                            onClick={() => handleExportPresetJson(p)}
                            className="p-1 rounded text-slate-400 hover:text-white transition"
                            title="Tải file JSON"
                          >
                            <Download size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomPreset(p.id)}
                            className="p-1 rounded text-rose-400 hover:text-rose-300 transition"
                            title="Xóa preset"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 2. MÀU SẮC CHỦ ĐẠO & GIAO DIỆN (COLORS & PALETTES) */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Palette size={14} className="text-amber-400" />
                  <span>Bảng Màu & Giao Diện (Theme Colors)</span>
                </span>
              </div>

              {/* Quick Themes */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 block">Theme màu nhanh (1-Click Theme):</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {THEME_PALETTES.map((tp) => (
                    <button
                      key={tp.name}
                      type="button"
                      onClick={() => handleApplyThemePalette(tp)}
                      className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 hover:border-amber-400 transition text-left cursor-pointer flex items-center gap-1.5"
                    >
                      <div className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs border border-white/20" style={{ backgroundColor: tp.primary }} />
                      <span className="text-[10px] font-bold text-slate-300 truncate">{tp.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Individual Colors */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800 text-xs">
                {/* Primary Color */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Màu chính (Primary):</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={channel.branding?.colors?.primary || '#38bdf8'}
                      onChange={(e) => updateChannelColor('primary', e.target.value)}
                      className="w-7 h-7 rounded border border-slate-700 cursor-pointer bg-transparent"
                    />
                    <Input
                      value={channel.branding?.colors?.primary || '#38bdf8'}
                      onChange={(e) => updateChannelColor('primary', e.target.value)}
                      className="h-7 text-[10px] font-mono bg-slate-950 border-slate-700 text-white"
                    />
                  </div>
                </div>

                {/* Secondary Color */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Màu phụ (Secondary):</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={channel.branding?.colors?.secondary || '#818cf8'}
                      onChange={(e) => updateChannelColor('secondary', e.target.value)}
                      className="w-7 h-7 rounded border border-slate-700 cursor-pointer bg-transparent"
                    />
                    <Input
                      value={channel.branding?.colors?.secondary || '#818cf8'}
                      onChange={(e) => updateChannelColor('secondary', e.target.value)}
                      className="h-7 text-[10px] font-mono bg-slate-950 border-slate-700 text-white"
                    />
                  </div>
                </div>

                {/* Card Background Color */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Nền thẻ đáp án (Cards):</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={template.components.answerButtons?.backgroundColor?.slice(0, 7) || '#0f172a'}
                      onChange={(e) => updateCompStyle('answerButtons', 'backgroundColor', e.target.value)}
                      className="w-7 h-7 rounded border border-slate-700 cursor-pointer bg-transparent"
                    />
                    <Input
                      value={template.components.answerButtons?.backgroundColor || '#0f172a'}
                      onChange={(e) => updateCompStyle('answerButtons', 'backgroundColor', e.target.value)}
                      className="h-7 text-[10px] font-mono bg-slate-950 border-slate-700 text-white"
                    />
                  </div>
                </div>

                {/* Text Color */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Màu chữ chính (Text):</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={template.components.questionBox?.textColor || '#ffffff'}
                      onChange={(e) => {
                        updateCompStyle('questionBox', 'textColor', e.target.value);
                        updateCompStyle('answerButtons', 'textColor', e.target.value);
                      }}
                      className="w-7 h-7 rounded border border-slate-700 cursor-pointer bg-transparent"
                    />
                    <Input
                      value={template.components.questionBox?.textColor || '#ffffff'}
                      onChange={(e) => {
                        updateCompStyle('questionBox', 'textColor', e.target.value);
                        updateCompStyle('answerButtons', 'textColor', e.target.value);
                      }}
                      className="h-7 text-[10px] font-mono bg-slate-950 border-slate-700 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Card Opacity */}
              <div className="pt-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Độ trong suốt thẻ đáp án (Card Opacity):</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {Math.round((template.components.answerButtons?.bgOpacity ?? 0.88) * 100)}%
                  </span>
                </div>
                <Slider
                  min={0.5}
                  max={1.0}
                  step={0.02}
                  value={[template.components.answerButtons?.bgOpacity ?? 0.88]}
                  onValueChange={([val]) => updateCompStyle('answerButtons', 'bgOpacity', val)}
                />
              </div>
            </div>

            {/* 3. ĐỘ PHÂN GIẢI & FPS (RESOLUTION & FRAME RATE) */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2.5">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                Độ Phân Giải & Tốc Độ Khung Hình (Video Format)
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Độ phân giải video:</label>
                  <select
                    value={`${(template as any).width || 720}x${(template as any).height || 1280}`}
                    onChange={(e) => {
                      const [w, h] = e.target.value.split('x').map(Number);
                      onTemplateChange({
                        ...template,
                        width: w,
                        height: h
                      } as any);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-white font-bold"
                  >
                    <option value="720x1280">720×1280 (Chuẩn Shorts/TikTok)</option>
                    <option value="1080x1920">1080×1920 (Full HD Shorts)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Tốc độ khung hình (FPS):</label>
                  <select
                    value={(template as any).fps || 30}
                    onChange={(e) => {
                      onTemplateChange({
                        ...template,
                        fps: Number(e.target.value)
                      } as any);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-white font-bold"
                  >
                    <option value={30}>30 FPS (Khuyên dùng - Render nhanh)</option>
                    <option value={60}>60 FPS (Siêu mượt mà)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 4. TIMING & NHỊP ĐỘ VIDEO (MASTER TIMING) */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                Timing & Nhịp Độ Video (Master Timing)
              </span>

              {/* Countdown Seconds */}
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1">
                  <span>Thời gian đếm ngược (Countdown):</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {template.timing?.countdownSeconds ?? (template.timing as any)?.countdownDurationSec ?? 5}s
                  </span>
                </div>
                <Slider
                  min={3}
                  max={15}
                  step={1}
                  value={[template.timing?.countdownSeconds ?? (template.timing as any)?.countdownDurationSec ?? 5]}
                  onValueChange={([val]) =>
                    onTemplateChange({
                      ...template,
                      timing: {
                        ...template.timing,
                        countdownSeconds: val,
                        ...({ countdownDurationSec: val } as any)
                      }
                    })
                  }
                />
              </div>

              {/* Reveal Duration */}
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1">
                  <span>Thời gian giữ mở đáp án (Reveal):</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {template.timing?.revealSeconds ?? 3}s
                  </span>
                </div>
                <Slider
                  min={2}
                  max={8}
                  step={0.5}
                  value={[template.timing?.revealSeconds ?? 3]}
                  onValueChange={([val]) =>
                    onTemplateChange({
                      ...template,
                      timing: {
                        ...template.timing,
                        revealSeconds: val
                      }
                    })
                  }
                />
              </div>

              {/* Transition Duration */}
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1">
                  <span>Thời lượng chuyển cảnh (Transition):</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {template.timing?.transitionFrames ?? (template.timing as any)?.transitionDurationFrames ?? 15} frames (~{(Number(template.timing?.transitionFrames ?? 15) / 30).toFixed(1)}s)
                  </span>
                </div>
                <Slider
                  min={6}
                  max={30}
                  step={2}
                  value={[template.timing?.transitionFrames ?? (template.timing as any)?.transitionDurationFrames ?? 15]}
                  onValueChange={([val]) =>
                    onTemplateChange({
                      ...template,
                      timing: {
                        ...template.timing,
                        transitionFrames: val,
                        ...({ transitionDurationFrames: val } as any)
                      }
                    })
                  }
                />
              </div>

              {/* End Buffer Duration */}
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1">
                  <span>Thời gian đệm kết thúc (End Buffer):</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {template.timing?.endBufferSeconds ?? (template.timing as any)?.finalHoldDurationSec ?? 2.5}s
                  </span>
                </div>
                <Slider
                  min={1}
                  max={6}
                  step={0.5}
                  value={[template.timing?.endBufferSeconds ?? (template.timing as any)?.finalHoldDurationSec ?? 2.5]}
                  onValueChange={([val]) =>
                    onTemplateChange({
                      ...template,
                      timing: {
                        ...template.timing,
                        endBufferSeconds: val,
                        ...({ finalHoldDurationSec: val } as any)
                      }
                    })
                  }
                />
              </div>
            </div>

            {/* 5. HIỆU ỨNG CHUYỂN CẢNH (TRANSITIONS) */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                Hiệu Ứng Chuyển Cảnh (Transition Effect)
              </span>
              <div className="grid grid-cols-4 gap-1 text-xs font-bold">
                {[
                  { id: 'slide', label: 'Slide' },
                  { id: 'zoom', label: 'Zoom' },
                  { id: 'fade', label: 'Fade' },
                  { id: 'wipe', label: 'Wipe' }
                ].map((tr) => (
                  <button
                    key={tr.id}
                    type="button"
                    onClick={() =>
                      onTemplateChange({
                        ...template,
                        transitionType: tr.id as any
                      })
                    }
                    className={`py-1.5 rounded-lg border text-center transition cursor-pointer ${
                      (template.transitionType || 'slide') === tr.id
                        ? 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-xs'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {tr.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 6. VỊ TRÍ & ĐỘ MỜ WATERMARK / LOGO */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                Vị Trí & Độ Mờ Logo / Watermark
              </span>

              {/* 4 Quick Corner Positions */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 block">Vị trí nhanh 4 góc:</label>
                <div className="grid grid-cols-2 gap-1.5 text-xs font-bold">
                  {[
                    { id: 'top-left', label: '↖ Trên Trái', x: 6, y: 6, h: 'left' },
                    { id: 'top-right', label: '↗ Trên Phải', x: 74, y: 6, h: 'right' },
                    { id: 'bottom-left', label: '↙ Dưới Trái', x: 6, y: 88, h: 'left' },
                    { id: 'bottom-right', label: '↘ Dưới Phải', x: 74, y: 88, h: 'right' }
                  ].map((pos) => (
                    <button
                      key={pos.id}
                      type="button"
                      onClick={() => {
                        updateCompStyle('logo', 'x', pos.x);
                        updateCompStyle('logo', 'y', pos.y);
                        updateCompStyle('logo', 'horizontalAlign', pos.h);
                      }}
                      className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-400 text-slate-300 hover:text-white transition text-center cursor-pointer"
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Watermark Opacity */}
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Độ mờ Watermark (Opacity):</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {Math.round((template.components.logo?.opacity ?? 0.85) * 100)}%
                  </span>
                </div>
                <Slider
                  min={0.1}
                  max={1.0}
                  step={0.05}
                  value={[template.components.logo?.opacity ?? 0.85]}
                  onValueChange={([val]) => updateCompStyle('logo', 'opacity', val)}
                />
              </div>

              {/* Watermark Size */}
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Kích thước Watermark:</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {template.components.logo?.logoSize ?? 42}px
                  </span>
                </div>
                <Slider
                  min={16}
                  max={96}
                  step={2}
                  value={[template.components.logo?.logoSize ?? 42]}
                  onValueChange={([val]) => updateCompStyle('logo', 'logoSize', val)}
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 1: TIÊU ĐỀ QUIZ (VIDEO QUIZ TITLE)                     */}
        {/* ========================================================= */}
        {activeTab === 'title' && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Cài đặt Tiêu Đề Video (Quiz Title):
              </span>
              <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px]">
                Độc lập Layout
              </Badge>
            </div>

            {/* 1. Show/Hide Switch */}
            <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
              <div>
                <span className="text-xs font-bold text-slate-200 block">Hiển thị Tiêu đề Video</span>
                <span className="text-[10px] text-slate-500">Bật/tắt component Quiz Title trên khung hình</span>
              </div>
              <Switch
                checked={isTitleEnabled}
                onCheckedChange={(val) => updateQuizTitleProp('enabled', val)}
              />
            </div>

            {/* 2. Title Text Input */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">Nội dung Tiêu đề</label>
                <span className="text-[10px] text-amber-400 font-mono">Đồng bộ Quiz</span>
              </div>
              <Input
                value={currentTitleText}
                onChange={(e) => handleTitleTextChange(e.target.value)}
                placeholder="Ví dụ: Kiến thức tổng hợp vui"
                className="bg-slate-950 border-slate-700 text-xs font-semibold text-white focus:border-amber-400"
              />
              <span className="text-[10px] text-slate-500 block">
                Tự động cập nhật khi import format "Tiêu đề: ..." hoặc chỉnh tay
              </span>
            </div>

            {/* 3. Font Family & Weight */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-300 block">Phông chữ & Độ đậm</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Font chữ</label>
                  <select
                    value={quizTitleStyle.fontFamily || 'Montserrat, sans-serif'}
                    onChange={(e) => updateQuizTitleProp('fontFamily', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                  >
                    <option value="Montserrat, sans-serif">Montserrat</option>
                    <option value="'Be Vietnam Pro', sans-serif">Be Vietnam Pro</option>
                    <option value="Inter, sans-serif">Inter</option>
                    <option value="Roboto, sans-serif">Roboto</option>
                    <option value="'Oswald', sans-serif">Oswald</option>
                    <option value="Arial, sans-serif">Arial</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Độ đậm</label>
                  <select
                    value={quizTitleStyle.fontWeight || '800'}
                    onChange={(e) => updateQuizTitleProp('fontWeight', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                  >
                    <option value="600">600 (Vừa)</option>
                    <option value="700">700 (Đậm)</option>
                    <option value="800">800 (Rất đậm)</option>
                    <option value="900">900 (Black)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 4. Font Size & Color */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>Cỡ chữ (Font Size):</span>
                <span className="font-mono text-amber-400">{quizTitleStyle.fontSize ?? 24}px</span>
              </div>
              <Slider
                min={16}
                max={44}
                step={1}
                value={[quizTitleStyle.fontSize ?? 24]}
                onValueChange={([val]) => updateQuizTitleProp('fontSize', val)}
              />

              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1.5">
                  <span>Màu chữ:</span>
                  <span className="font-mono text-amber-400 text-[11px]">{quizTitleStyle.color || '#1e3a8a'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={quizTitleStyle.color || '#1e3a8a'}
                    onChange={(e) => updateQuizTitleProp('color', e.target.value)}
                    className="w-8 h-8 rounded border border-slate-700 cursor-pointer bg-transparent"
                  />
                  <Input
                    value={quizTitleStyle.color || '#1e3a8a'}
                    onChange={(e) => updateQuizTitleProp('color', e.target.value)}
                    className="h-8 bg-slate-950 border-slate-700 text-xs font-mono text-white flex-1"
                  />
                </div>
                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 mt-2">
                  {['#1e3a8a', '#0f172a', '#ffffff', '#f59e0b', '#dc2626', '#16a34a', '#8b5cf6'].map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => updateQuizTitleProp('color', hex)}
                      className="w-5 h-5 rounded-full border border-slate-600 shadow-xs hover:scale-110 transition"
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* 5. Text Alignment */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-300 block">Căn lề chữ (Alignment)</span>
              <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                {(['left', 'center', 'right'] as const).map((align) => (
                  <button
                    key={align}
                    type="button"
                    onClick={() => updateQuizTitleProp('textAlign', align)}
                    className={`py-1 rounded text-xs font-bold capitalize transition ${
                      (quizTitleStyle.textAlign || 'center') === align
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {align === 'left' ? 'Trái' : align === 'center' ? 'Giữa' : 'Phải'}
                  </button>
                ))}
              </div>
            </div>

            {/* 6. Position & Dimensions */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-300 block">Tọa độ & Kích thước (% khung hình)</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Vị trí X:</span>
                    <span className="font-mono text-amber-400 font-bold">{quizTitleStyle.x ?? 7}%</span>
                  </div>
                  <Slider
                    min={0}
                    max={50}
                    step={0.5}
                    value={[quizTitleStyle.x ?? 7]}
                    onValueChange={([val]) => updateQuizTitleProp('x', val)}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Vị trí Y:</span>
                    <span className="font-mono text-amber-400 font-bold">{quizTitleStyle.y ?? 7}%</span>
                  </div>
                  <Slider
                    min={0}
                    max={50}
                    step={0.5}
                    value={[quizTitleStyle.y ?? 7]}
                    onValueChange={([val]) => updateQuizTitleProp('y', val)}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Chiều rộng:</span>
                    <span className="font-mono text-amber-400 font-bold">{quizTitleStyle.width ?? 86}%</span>
                  </div>
                  <Slider
                    min={40}
                    max={100}
                    step={1}
                    value={[quizTitleStyle.width ?? 86]}
                    onValueChange={([val]) => updateQuizTitleProp('width', val)}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Chiều cao:</span>
                    <span className="font-mono text-amber-400 font-bold">{quizTitleStyle.height ?? 6}%</span>
                  </div>
                  <Slider
                    min={4}
                    max={20}
                    step={0.5}
                    value={[quizTitleStyle.height ?? 6]}
                    onValueChange={([val]) => updateQuizTitleProp('height', val)}
                  />
                </div>
              </div>
            </div>

            {/* 7. Background, Border & Radius */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2.5">
              <span className="text-xs font-bold text-slate-300 block">Nền & Viền Box</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Màu nền</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={quizTitleStyle.backgroundColor || '#ffffff'}
                      onChange={(e) => updateQuizTitleProp('backgroundColor', e.target.value)}
                      className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <Input
                      value={quizTitleStyle.backgroundColor || '#ffffff'}
                      onChange={(e) => updateQuizTitleProp('backgroundColor', e.target.value)}
                      className="h-7 text-[11px] bg-slate-950 font-mono border-slate-700"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Màu viền</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={quizTitleStyle.borderColor || '#bfdbfe'}
                      onChange={(e) => updateQuizTitleProp('borderColor', e.target.value)}
                      className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <Input
                      value={quizTitleStyle.borderColor || '#bfdbfe'}
                      onChange={(e) => updateQuizTitleProp('borderColor', e.target.value)}
                      className="h-7 text-[11px] bg-slate-950 font-mono border-slate-700"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Bo góc (Radius):</span>
                    <span className="font-mono text-amber-400">{quizTitleStyle.borderRadius ?? 16}px</span>
                  </div>
                  <Slider
                    min={0}
                    max={40}
                    step={2}
                    value={[quizTitleStyle.borderRadius ?? 16]}
                    onValueChange={([val]) => updateQuizTitleProp('borderRadius', val)}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Độ dày viền:</span>
                    <span className="font-mono text-amber-400">{quizTitleStyle.borderWidth ?? 1}px</span>
                  </div>
                  <Slider
                    min={0}
                    max={6}
                    step={1}
                    value={[quizTitleStyle.borderWidth ?? 1]}
                    onValueChange={([val]) => updateQuizTitleProp('borderWidth', val)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 1: BỐ CỤC (LAYOUT & POSITION)                         */}
        {/* ========================================================= */}
        {activeTab === 'layout' && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Chọn phần tử để chỉnh vị trí:
              </span>
            </div>

            {/* Target element selector inside layout tab */}
            <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-bold">
              {[
                { id: 'questionBox', label: 'Khung Câu Hỏi' },
                { id: 'answerButtons', label: '3 Đáp Án' },
                { id: 'questionNumber', label: 'Số Thứ Tự' }
              ].map((target) => (
                <button
                  key={target.id}
                  onClick={() => {
                    setLayoutTarget(target.id as any);
                    onSelectKey?.(target.id as ComponentKey);
                  }}
                  className={`py-1.5 rounded text-[11px] font-bold transition truncate ${
                    layoutTarget === target.id
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {target.label}
                </button>
              ))}
            </div>

            {/* Shape Selector */}
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Hình Khối Thiết Kế (Shape Style):</span>
                <span className="text-[10px] text-amber-400 font-mono">
                  {template.components[layoutTarget]?.shape || 'rounded'}
                </span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-1">
                {[
                  { id: 'rounded', label: 'Bo góc' },
                  { id: 'pill', label: 'Pill' },
                  { id: 'bubble', label: 'Bubble' },
                  { id: 'speech-bubble', label: 'Bóng thoại' },
                  { id: 'hud', label: 'HUD 45°' },
                  { id: 'hexagon', label: 'Lục giác' },
                  { id: 'circle', label: 'Tròn' },
                  { id: 'ellipse', label: 'Elip' },
                  { id: 'diamond', label: 'Hình thoi' },
                  { id: 'blob', label: 'Blob' },
                  { id: 'ticket', label: 'Vé' },
                  { id: 'badge', label: 'Huy hiệu' },
                  { id: 'rectangle', label: 'Chữ nhật' },
                  { id: 'color-block', label: 'Color Block' },
                  { id: 'minimal', label: 'Tối giản' },
                  { id: 'glass', label: 'Kính mờ' },
                  { id: 'doodle', label: 'Vẽ tay' }
                ].map((sh) => (
                  <button
                    key={sh.id}
                    onClick={() => updateCompStyle(layoutTarget, 'shape', sh.id)}
                    className={`py-1.5 px-1 rounded text-[10px] font-bold transition truncate ${
                      (template.components[layoutTarget]?.shape || 'rounded') === sh.id
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {sh.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Answer Layout Composition & Individual Options Customization */}
            {layoutTarget === 'answerButtons' && (
              <div className="space-y-3">
                {/* Answer TTS Toggle */}
                <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">
                      Đọc đáp án đúng bằng AI (Answer TTS)
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Phát giọng đọc đáp án đúng khi hết giờ đếm ngược, độc lập với Giải thích
                    </span>
                  </div>
                  <Switch
                    checked={(template.components.answerButtons as any)?.readTts !== false}
                    onCheckedChange={(val) => updateCompStyle('answerButtons', 'readTts', val)}
                  />
                </div>

                {/* Bố cục Đáp án (Layout Composition) */}
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">
                      Bố Cục Phương Án (Composition):
                    </span>
                    <span className="text-[10px] text-amber-400 font-mono">
                      {template.components.answerButtons?.layoutComposition || 'stacked'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {[
                      { id: 'stacked', label: 'Dọc đều (Stack)' },
                      { id: 'one-right-two-left', label: '1 Phải - 2 Trái' },
                      { id: 'triangle', label: 'Tam giác (Tri)' },
                      { id: 'grid-2-top-1-bottom', label: '2 Trên 1 Dưới' },
                      { id: 'split-left-right', label: 'Trái - Phải' },
                      { id: 'circular-arc', label: 'Vòng cung (Arc)' },
                      { id: 'floating', label: 'Thẻ bay (Float)' },
                      { id: 'asymmetric', label: 'Bất đối xứng' },
                      { id: 'staggered', label: 'So le (Ziczac)' },
                      { id: 'custom', label: 'Tự do (Custom)' }
                    ].map((comp) => (
                      <button
                        key={comp.id}
                        onClick={() => updateLayoutComposition(comp.id)}
                        className={`py-1.5 px-1 rounded-lg text-[10px] font-bold transition truncate ${
                          (template.components.answerButtons?.layoutComposition || 'stacked') === comp.id
                            ? 'bg-amber-500 text-slate-950 shadow-xs'
                            : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        {comp.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chế độ Chỉnh sửa: Đồng bộ vs Tùy chỉnh riêng */}
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">
                        Tùy Chỉnh Riêng Từng Đáp Án (A / B / C)
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Cho phép A, B, C có hình khối, màu sắc, vị trí và kích thước khác nhau
                      </span>
                    </div>
                    <Switch
                      checked={Boolean(template.components.answerButtons?.useIndividualStyles)}
                      onCheckedChange={(val) => toggleIndividualAnswerStyles(val)}
                    />
                  </div>

                  {/* Sub-tabs for A, B, C */}
                  {template.components.answerButtons?.useIndividualStyles && (
                    <div className="pt-2 border-t border-slate-800 space-y-3">
                      <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
                        {(['A', 'B', 'C'] as const).map((optKey) => {
                          const optData = template.components.answerButtons?.options?.[optKey];
                          const optBg = optData?.backgroundColor || template.components.answerButtons?.backgroundColor || '#ffffff';
                          return (
                            <button
                              key={optKey}
                              onClick={() => setActiveOptionTab(optKey)}
                              className={`py-1.5 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                                activeOptionTab === optKey
                                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                                  : 'text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-black/30 inline-block shrink-0"
                                style={{ backgroundColor: optBg }}
                              />
                              <span>Đáp án {optKey}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Controls for current activeOptionTab */}
                      {(() => {
                        const opt = template.components.answerButtons?.options?.[activeOptionTab] || {};
                        return (
                          <div className="space-y-2.5 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                            {/* Shape Selector for this Option */}
                            <div>
                              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                                <span>Hình khối (Shape) Đáp án {activeOptionTab}:</span>
                                <span className="font-mono text-amber-400 font-bold">
                                  {opt.shape || template.components.answerButtons?.shape || 'rounded'}
                                </span>
                              </div>
                              <div className="grid grid-cols-4 sm:grid-cols-5 gap-1">
                                {[
                                  { id: 'rounded', label: 'Bo góc' },
                                  { id: 'pill', label: 'Pill' },
                                  { id: 'bubble', label: 'Bubble' },
                                  { id: 'speech-bubble', label: 'Bóng thoại' },
                                  { id: 'hud', label: 'HUD 45°' },
                                  { id: 'hexagon', label: 'Lục giác' },
                                  { id: 'circle', label: 'Tròn' },
                                  { id: 'ellipse', label: 'Elip' },
                                  { id: 'diamond', label: 'Hình thoi' },
                                  { id: 'blob', label: 'Blob' },
                                  { id: 'ticket', label: 'Vé' },
                                  { id: 'badge', label: 'Huy hiệu' },
                                  { id: 'rectangle', label: 'Chữ nhật' },
                                  { id: 'color-block', label: 'Color Block' },
                                  { id: 'minimal', label: 'Tối giản' },
                                  { id: 'glass', label: 'Kính mờ' },
                                  { id: 'doodle', label: 'Vẽ tay' }
                                ].map((sh) => (
                                  <button
                                    key={sh.id}
                                    onClick={() => updateOptionProp(activeOptionTab, 'shape', sh.id)}
                                    className={`py-1 rounded text-[10px] font-bold transition truncate ${
                                      (opt.shape || template.components.answerButtons?.shape || 'rounded') === sh.id
                                        ? 'bg-amber-500 text-slate-950'
                                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                                    }`}
                                  >
                                    {sh.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Position X and Y */}
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                                  <span>Vị trí X:</span>
                                  <span className="font-mono text-amber-400 font-bold">{opt.x ?? 6}%</span>
                                </div>
                                <Slider
                                  min={0}
                                  max={100}
                                  step={0.5}
                                  value={[opt.x ?? 6]}
                                  onValueChange={([val]) => updateOptionProp(activeOptionTab, 'x', val)}
                                />
                              </div>
                              <div>
                                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                                  <span>Vị trí Y:</span>
                                  <span className="font-mono text-amber-400 font-bold">{opt.y ?? 55}%</span>
                                </div>
                                <Slider
                                  min={0}
                                  max={100}
                                  step={0.5}
                                  value={[opt.y ?? 55]}
                                  onValueChange={([val]) => updateOptionProp(activeOptionTab, 'y', val)}
                                />
                              </div>
                            </div>

                            {/* Dimensions W and H */}
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                                  <span>Chiều rộng W:</span>
                                  <span className="font-mono text-amber-400 font-bold">{opt.width ?? 88}%</span>
                                </div>
                                <Slider
                                  min={15}
                                  max={100}
                                  step={1}
                                  value={[opt.width ?? 88]}
                                  onValueChange={([val]) => updateOptionProp(activeOptionTab, 'width', val)}
                                />
                              </div>
                              <div>
                                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                                  <span>Chiều cao H:</span>
                                  <span className="font-mono text-amber-400 font-bold">{opt.height ?? 8}%</span>
                                </div>
                                <Slider
                                  min={4}
                                  max={40}
                                  step={0.5}
                                  value={[opt.height ?? 8]}
                                  onValueChange={([val]) => updateOptionProp(activeOptionTab, 'height', val)}
                                />
                              </div>
                            </div>

                            {/* Rotation */}
                            <div>
                              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                                <span>Góc xoay nghiêng (Rotation):</span>
                                <span className="font-mono text-amber-400 font-bold">{opt.rotation ?? 0}°</span>
                              </div>
                              <Slider
                                min={-15}
                                max={15}
                                step={0.5}
                                value={[opt.rotation ?? 0]}
                                onValueChange={([val]) => updateOptionProp(activeOptionTab, 'rotation', val)}
                              />
                            </div>

                            {/* Background Color & Opacity */}
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-[10px] text-slate-400 block mb-1">Màu nền:</span>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="color"
                                    value={opt.backgroundColor?.slice(0, 7) || '#ffffff'}
                                    onChange={(e) => updateOptionProp(activeOptionTab, 'backgroundColor', e.target.value)}
                                    className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer shrink-0"
                                  />
                                  <Input
                                    value={opt.backgroundColor || '#ffffff'}
                                    onChange={(e) => updateOptionProp(activeOptionTab, 'backgroundColor', e.target.value)}
                                    className="h-7 text-xs bg-slate-900 border-slate-800"
                                  />
                                </div>
                              </div>
                              <div>
                                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                                  <span>Độ mờ nền:</span>
                                  <span className="font-mono text-amber-400 font-bold">
                                    {Math.round((opt.bgOpacity ?? 0.88) * 100)}%
                                  </span>
                                </div>
                                <Slider
                                  min={0}
                                  max={100}
                                  step={1}
                                  value={[Math.round((opt.bgOpacity ?? 0.88) * 100)]}
                                  onValueChange={([val]) => updateOptionProp(activeOptionTab, 'bgOpacity', val / 100)}
                                />
                              </div>
                            </div>

                            {/* Border Color & Width */}
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-[10px] text-slate-400 block mb-1">Màu viền:</span>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="color"
                                    value={opt.borderColor?.slice(0, 7) || '#38bdf8'}
                                    onChange={(e) => updateOptionProp(activeOptionTab, 'borderColor', e.target.value)}
                                    className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer shrink-0"
                                  />
                                  <Input
                                    value={opt.borderColor || '#38bdf8'}
                                    onChange={(e) => updateOptionProp(activeOptionTab, 'borderColor', e.target.value)}
                                    className="h-7 text-xs bg-slate-900 border-slate-800"
                                  />
                                </div>
                              </div>
                              <div>
                                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                                  <span>Độ dày viền:</span>
                                  <span className="font-mono text-amber-400 font-bold">{opt.borderWidth ?? 2}px</span>
                                </div>
                                <Slider
                                  min={0}
                                  max={8}
                                  step={0.5}
                                  value={[opt.borderWidth ?? 2]}
                                  onValueChange={([val]) => updateOptionProp(activeOptionTab, 'borderWidth', val)}
                                />
                              </div>
                            </div>

                            {/* Text Color & Size */}
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-[10px] text-slate-400 block mb-1">Màu chữ:</span>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="color"
                                    value={opt.textColor?.slice(0, 7) || '#0f172a'}
                                    onChange={(e) => updateOptionProp(activeOptionTab, 'textColor', e.target.value)}
                                    className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer shrink-0"
                                  />
                                  <Input
                                    value={opt.textColor || '#0f172a'}
                                    onChange={(e) => updateOptionProp(activeOptionTab, 'textColor', e.target.value)}
                                    className="h-7 text-xs bg-slate-900 border-slate-800"
                                  />
                                </div>
                              </div>
                              <div>
                                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                                  <span>Cỡ chữ:</span>
                                  <span className="font-mono text-amber-400 font-bold">{opt.fontSize ?? 20}px</span>
                                </div>
                                <Slider
                                  min={12}
                                  max={36}
                                  step={1}
                                  value={[opt.fontSize ?? 20]}
                                  onValueChange={([val]) => updateOptionProp(activeOptionTab, 'fontSize', val)}
                                />
                              </div>
                            </div>

                            {/* Label Badge Customization */}
                            <div className="pt-2 border-t border-slate-800 space-y-1.5">
                              <span className="text-[11px] font-bold text-slate-300 block">
                                Nhãn Ký Hiệu ({activeOptionTab}):
                              </span>
                              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
                                {[
                                  { id: 'circle', label: 'Tròn' },
                                  { id: 'square', label: 'Vuông' },
                                  { id: 'pill', label: 'Pill' },
                                  { id: 'hexagon', label: 'Lục giác' },
                                  { id: 'diamond', label: 'Thoi' },
                                  { id: 'badge', label: 'Huy hiệu' }
                                ].map((lb) => (
                                  <button
                                    key={lb.id}
                                    onClick={() => updateOptionProp(activeOptionTab, 'labelShape', lb.id)}
                                    className={`py-1 rounded text-[10px] font-bold transition truncate ${
                                      (opt.labelShape || 'circle') === lb.id
                                        ? 'bg-amber-500 text-slate-950'
                                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                                    }`}
                                  >
                                    {lb.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Position X / Y */}
            <div className="grid grid-cols-2 gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Vị trí X:</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {template.components[layoutTarget]?.x ?? 6}%
                  </span>
                </div>
                <Slider
                  min={0}
                  max={100}
                  step={0.5}
                  value={[template.components[layoutTarget]?.x ?? 6]}
                  onValueChange={([val]) => updateCompStyle(layoutTarget, 'x', val)}
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Vị trí Y:</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {template.components[layoutTarget]?.y ?? 20}%
                  </span>
                </div>
                <Slider
                  min={0}
                  max={100}
                  step={0.5}
                  value={[template.components[layoutTarget]?.y ?? 20]}
                  onValueChange={([val]) => updateCompStyle(layoutTarget, 'y', val)}
                />
              </div>
            </div>

            {/* Dimensions: Width & Height */}
            <div className="grid grid-cols-2 gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Chiều rộng:</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {template.components[layoutTarget]?.width ?? 88}%
                  </span>
                </div>
                <Slider
                  min={20}
                  max={100}
                  step={1}
                  value={[template.components[layoutTarget]?.width ?? 88]}
                  onValueChange={([val]) => updateCompWidth(layoutTarget, val)}
                />
                <span className="text-[9px] text-slate-500 block mt-1">Co đều 2 bên</span>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Chiều cao:</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {template.components[layoutTarget]?.height ?? 20}%
                  </span>
                </div>
                <Slider
                  min={5}
                  max={80}
                  step={1}
                  value={[template.components[layoutTarget]?.height ?? 20]}
                  onValueChange={([val]) => updateCompHeight(layoutTarget, val)}
                />
                <span className="text-[9px] text-slate-500 block mt-1">Co đều trên/dưới</span>
              </div>
            </div>

            {/* Alignment Quick Buttons */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400">Căn lề ngang:</span>
              <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                {(['left', 'center', 'right'] as HorizontalAlign[]).map((align) => (
                  <button
                    key={align}
                    onClick={() => setCompHorizontalAlign(layoutTarget, align)}
                    className={`py-1 rounded text-xs font-bold capitalize transition ${
                      template.components[layoutTarget]?.horizontalAlign === align
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>

            {/* 1. Crisp Border Controls */}
            <div className="space-y-2.5 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-slate-300 block">Khung Viền (Border):</span>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Độ dày viền:</span>
                    <span className="font-mono text-amber-400 font-bold">
                      {template.components[layoutTarget]?.borderWidth ?? 2}px
                    </span>
                  </div>
                  <Slider
                    min={0}
                    max={8}
                    step={1}
                    value={[template.components[layoutTarget]?.borderWidth ?? 2]}
                    onValueChange={([val]) => updateCompStyle(layoutTarget, 'borderWidth', val)}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Bo góc (Radius):</span>
                    <span className="font-mono text-amber-400 font-bold">
                      {template.components[layoutTarget]?.borderRadius ?? 16}px
                    </span>
                  </div>
                  <Slider
                    min={0}
                    max={48}
                    step={2}
                    value={[template.components[layoutTarget]?.borderRadius ?? 16]}
                    onValueChange={([val]) => updateCompStyle(layoutTarget, 'borderRadius', val)}
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Màu đường viền:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={template.components[layoutTarget]?.borderColor?.slice(0, 7) || '#38bdf8'}
                    onChange={(e) => updateCompStyle(layoutTarget, 'borderColor', e.target.value)}
                    className="w-7 h-7 rounded border border-slate-700 cursor-pointer bg-transparent"
                  />
                  <Input
                    value={template.components[layoutTarget]?.borderColor || '#38bdf8'}
                    onChange={(e) => updateCompStyle(layoutTarget, 'borderColor', e.target.value)}
                    className="h-7 text-xs bg-slate-950 border-slate-700 text-slate-100 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 2. Background Color, Opacity & Glassmorphism Blur */}
            <div className="space-y-2.5 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-slate-300 block">Nền Box & Kính Mờ (Glass):</span>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Màu nền cơ sở:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={template.components[layoutTarget]?.backgroundColor?.slice(0, 7) || '#ffffff'}
                    onChange={(e) => updateCompStyle(layoutTarget, 'backgroundColor', e.target.value)}
                    className="w-7 h-7 rounded border border-slate-700 cursor-pointer bg-transparent"
                  />
                  <Input
                    value={template.components[layoutTarget]?.backgroundColor || '#ffffff'}
                    onChange={(e) => updateCompStyle(layoutTarget, 'backgroundColor', e.target.value)}
                    className="h-7 text-xs bg-slate-950 border-slate-700 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Độ mờ đục (Opacity):</span>
                    <span className="font-mono text-amber-400 font-bold">
                      {Math.round((template.components[layoutTarget]?.bgOpacity ?? 0.88) * 100)}%
                    </span>
                  </div>
                  <Slider
                    min={10}
                    max={100}
                    step={5}
                    value={[Math.round((template.components[layoutTarget]?.bgOpacity ?? 0.88) * 100)]}
                    onValueChange={([val]) => updateCompStyle(layoutTarget, 'bgOpacity', val / 100)}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Kính mờ (Blur):</span>
                    <span className="font-mono text-amber-400 font-bold">
                      {template.components[layoutTarget]?.backdropBlur ?? 12}px
                    </span>
                  </div>
                  <Slider
                    min={0}
                    max={30}
                    step={2}
                    value={[template.components[layoutTarget]?.backdropBlur ?? 12]}
                    onValueChange={([val]) => updateCompStyle(layoutTarget, 'backdropBlur', val)}
                  />
                </div>
              </div>
            </div>

            {/* 3. Neon Glow Shadow */}
            <div className="space-y-2.5 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Quầng Sáng Neon (Glow):</span>
                <Switch
                  checked={(template.components[layoutTarget]?.glowRadius ?? 0) > 0}
                  onCheckedChange={(chk) => {
                    updateCompStyle(layoutTarget, 'glowRadius', chk ? 18 : 0);
                    if (chk && !template.components[layoutTarget]?.glowColor) {
                      updateCompStyle(layoutTarget, 'glowColor', 'rgba(56, 189, 248, 0.6)');
                    }
                  }}
                />
              </div>

              {(template.components[layoutTarget]?.glowRadius ?? 0) > 0 && (
                <div className="space-y-2 pt-1 border-t border-slate-800">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span>Bán kính tỏa sáng:</span>
                      <span className="font-mono text-amber-400 font-bold">
                        {template.components[layoutTarget]?.glowRadius ?? 18}px
                      </span>
                    </div>
                    <Slider
                      min={4}
                      max={40}
                      step={2}
                      value={[template.components[layoutTarget]?.glowRadius ?? 18]}
                      onValueChange={([val]) => updateCompStyle(layoutTarget, 'glowRadius', val)}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Màu ánh sáng Neon:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={template.components[layoutTarget]?.glowColor?.slice(0, 7) || '#38bdf8'}
                        onChange={(e) => updateCompStyle(layoutTarget, 'glowColor', e.target.value)}
                        className="w-7 h-7 rounded border border-slate-700 cursor-pointer bg-transparent"
                      />
                      <Input
                        value={template.components[layoutTarget]?.glowColor || 'rgba(56, 189, 248, 0.6)'}
                        onChange={(e) => updateCompStyle(layoutTarget, 'glowColor', e.target.value)}
                        className="h-7 text-xs bg-slate-950 border-slate-700 text-slate-100 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Padding & Gap Spacing */}
            <div className="space-y-2.5 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-slate-300 block">Khoảng Cách & Đệm Trong:</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Đệm trong (Padding):</span>
                    <span className="font-mono text-amber-400 font-bold">
                      {template.components[layoutTarget]?.padding ?? 16}px
                    </span>
                  </div>
                  <Slider
                    min={6}
                    max={36}
                    step={2}
                    value={[template.components[layoutTarget]?.padding ?? 16]}
                    onValueChange={([val]) => updateCompStyle(layoutTarget, 'padding', val)}
                  />
                </div>

                {layoutTarget === 'answerButtons' && (
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span>Cách nhau (Gap):</span>
                      <span className="font-mono text-amber-400 font-bold">
                        {template.components.answerButtons?.gap ?? 12}px
                      </span>
                    </div>
                    <Slider
                      min={4}
                      max={28}
                      step={2}
                      value={[template.components.answerButtons?.gap ?? 12]}
                      onValueChange={([val]) => updateCompStyle('answerButtons', 'gap', val)}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Layout Mode for Answer Buttons */}
            {layoutTarget === 'answerButtons' && (
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-300 block">Kiểu hiển thị 3 đáp án:</span>
                <div className="grid grid-cols-2 gap-1 text-xs font-bold">
                  {[
                    { id: 'stacked', label: '3 Hàng Dọc (Chuẩn)' },
                    { id: 'grid', label: 'Lưới 2 Cột' }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() =>
                        onTemplateChange({
                          ...template,
                          answerLayout: mode.id as any
                        })
                      }
                      className={`p-2 rounded-lg border text-left text-xs transition ${
                        (template.answerLayout || 'stacked') === mode.id
                          ? 'border-amber-400 bg-amber-500/10 text-amber-300 font-bold'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: KIỂU CHỮ (TYPOGRAPHY)                              */}
        {/* ========================================================= */}
        {activeTab === 'typography' && (
          <div className="space-y-3.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Phông chữ & Kiểu hiển thị văn bản:
            </span>

            {/* Global Font Family */}
            <div className="space-y-1 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <label className="text-[11px] text-slate-400 font-bold block mb-1">Phông chữ chung:</label>
              <select
                value={template.components.questionBox?.fontFamily || 'Inter'}
                onChange={(e) => {
                  const font = e.target.value;
                  onTemplateChange({
                    ...template,
                    components: {
                      ...template.components,
                      questionBox: { ...template.components.questionBox, fontFamily: font },
                      answerButtons: { ...template.components.answerButtons, fontFamily: font }
                    }
                  });
                }}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg p-2 text-xs font-bold focus:outline-none"
              >
                <option value="Inter">Inter (Hiện đại, tối giản)</option>
                <option value="Montserrat">Montserrat (Đậm nét, phong cách Shorts)</option>
                <option value="Roboto">Roboto (Chuẩn thanh lịch)</option>
                <option value="Be Vietnam Pro">Be Vietnam Pro (Tiếng Việt xuất sắc)</option>
                <option value="Oswald">Oswald (Hẹp cao, nổi bật)</option>
                <option value="Poppins">Poppins (Trẻ trung, bo tròn)</option>
              </select>
            </div>

            {/* Question Text Styling */}
            <div className="space-y-2.5 bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                Chữ Câu Hỏi:
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Cỡ chữ:</span>
                    <span className="font-mono text-amber-400 font-bold">
                      {template.components.questionBox?.fontSize ?? 26}px
                    </span>
                  </div>
                  <Slider
                    min={16}
                    max={54}
                    step={1}
                    value={[template.components.questionBox?.fontSize ?? 26]}
                    onValueChange={([val]) => updateCompStyle('questionBox', 'fontSize', val)}
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Độ đậm:</label>
                  <select
                    value={template.components.questionBox?.fontWeight || '700'}
                    onChange={(e) => updateCompStyle('questionBox', 'fontWeight', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-md p-1.5 text-xs font-bold"
                  >
                    <option value="400">Regular (400)</option>
                    <option value="600">SemiBold (600)</option>
                    <option value="700">Bold (700)</option>
                    <option value="800">ExtraBold (800)</option>
                    <option value="900">Black (900)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Màu chữ câu hỏi:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={template.components.questionBox?.textColor || '#ffffff'}
                    onChange={(e) => updateCompStyle('questionBox', 'textColor', e.target.value)}
                    className="w-7 h-7 rounded border border-slate-700 cursor-pointer bg-transparent"
                  />
                  <Input
                    value={template.components.questionBox?.textColor || '#ffffff'}
                    onChange={(e) => updateCompStyle('questionBox', 'textColor', e.target.value)}
                    className="h-7 text-xs bg-slate-950 border-slate-700 text-slate-100 font-mono"
                  />
                </div>
              </div>

              {/* Text Stroke for Question */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Viền chữ chống chìm (Text Stroke):</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {template.components.questionBox?.textStrokeWidth ?? 0}px
                  </span>
                </div>
                <Slider
                  min={0}
                  max={4}
                  step={0.5}
                  value={[template.components.questionBox?.textStrokeWidth ?? 0]}
                  onValueChange={([val]) => updateCompStyle('questionBox', 'textStrokeWidth', val)}
                />
                {(template.components.questionBox?.textStrokeWidth ?? 0) > 0 && (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="color"
                      value={template.components.questionBox?.textStrokeColor?.slice(0, 7) || '#000000'}
                      onChange={(e) => updateCompStyle('questionBox', 'textStrokeColor', e.target.value)}
                      className="w-6 h-6 rounded border border-slate-700 cursor-pointer bg-transparent"
                    />
                    <Input
                      value={template.components.questionBox?.textStrokeColor || 'rgba(0,0,0,0.85)'}
                      onChange={(e) => updateCompStyle('questionBox', 'textStrokeColor', e.target.value)}
                      className="h-6 text-[10px] bg-slate-950 border-slate-700 text-slate-100 font-mono"
                      placeholder="Màu viền chữ"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Answer Cards Text Styling */}
            <div className="space-y-2.5 bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                Chữ 3 Đáp Án:
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Cỡ chữ:</span>
                    <span className="font-mono text-amber-400 font-bold">
                      {template.components.answerButtons?.fontSize ?? 20}px
                    </span>
                  </div>
                  <Slider
                    min={14}
                    max={40}
                    step={1}
                    value={[template.components.answerButtons?.fontSize ?? 20]}
                    onValueChange={([val]) => updateCompStyle('answerButtons', 'fontSize', val)}
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Độ đậm:</label>
                  <select
                    value={template.components.answerButtons?.fontWeight || '600'}
                    onChange={(e) => updateCompStyle('answerButtons', 'fontWeight', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-md p-1.5 text-xs font-bold"
                  >
                    <option value="500">Medium (500)</option>
                    <option value="600">SemiBold (600)</option>
                    <option value="700">Bold (700)</option>
                    <option value="800">ExtraBold (800)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Màu chữ đáp án:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={template.components.answerButtons?.textColor || '#ffffff'}
                    onChange={(e) => updateCompStyle('answerButtons', 'textColor', e.target.value)}
                    className="w-7 h-7 rounded border border-slate-700 cursor-pointer bg-transparent"
                  />
                  <Input
                    value={template.components.answerButtons?.textColor || '#ffffff'}
                    onChange={(e) => updateCompStyle('answerButtons', 'textColor', e.target.value)}
                    className="h-7 text-xs bg-slate-950 border-slate-700 text-slate-100 font-mono"
                  />
                </div>
              </div>

              {/* Text Stroke for Answers */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Viền chữ chống chìm (Text Stroke):</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {template.components.answerButtons?.textStrokeWidth ?? 0}px
                  </span>
                </div>
                <Slider
                  min={0}
                  max={4}
                  step={0.5}
                  value={[template.components.answerButtons?.textStrokeWidth ?? 0]}
                  onValueChange={([val]) => updateCompStyle('answerButtons', 'textStrokeWidth', val)}
                />
                {(template.components.answerButtons?.textStrokeWidth ?? 0) > 0 && (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="color"
                      value={template.components.answerButtons?.textStrokeColor?.slice(0, 7) || '#000000'}
                      onChange={(e) => updateCompStyle('answerButtons', 'textStrokeColor', e.target.value)}
                      className="w-6 h-6 rounded border border-slate-700 cursor-pointer bg-transparent"
                    />
                    <Input
                      value={template.components.answerButtons?.textStrokeColor || 'rgba(0,0,0,0.85)'}
                      onChange={(e) => updateCompStyle('answerButtons', 'textStrokeColor', e.target.value)}
                      className="h-6 text-[10px] bg-slate-950 border-slate-700 text-slate-100 font-mono"
                      placeholder="Màu viền chữ"
                    />
                  </div>
                )}
              </div>
              {/* Answer Cards Text Shadow Controls */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-300 block">
                      Đổ bóng chữ đáp án (Text Shadow):
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Mặc định tắt (không bóng). Bật khi nền sáng hoặc muốn chữ nổi khối.
                    </span>
                  </div>
                  <Switch
                    checked={Boolean(
                      template.components.answerButtons?.textShadow &&
                      template.components.answerButtons?.textShadow !== 'none'
                    )}
                    onCheckedChange={(chk) => {
                      updateCompStyle(
                        'answerButtons',
                        'textShadow',
                        chk ? '0 2px 8px rgba(0,0,0,0.85)' : undefined
                      );
                    }}
                  />
                </div>

                {Boolean(
                  template.components.answerButtons?.textShadow &&
                  template.components.answerButtons?.textShadow !== 'none'
                ) && (
                  <div className="space-y-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 animate-in fade-in">
                    <span className="text-[10px] text-slate-400 font-bold block">Preset bóng chữ:</span>
                    <div className="grid grid-cols-3 gap-1 text-[11px] font-bold">
                      {[
                        { label: 'Nhẹ', val: '0 1px 4px rgba(0,0,0,0.6)' },
                        { label: 'Vừa', val: '0 2px 8px rgba(0,0,0,0.85)' },
                        { label: 'Đậm', val: '0 4px 14px rgba(0,0,0,0.95)' }
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => updateCompStyle('answerButtons', 'textShadow', preset.val)}
                          className={`py-1 rounded border text-center transition ${
                            template.components.answerButtons?.textShadow === preset.val
                              ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                              : 'border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                    <div className="space-y-1 pt-1">
                      <label className="text-[10px] text-slate-400">Tùy chỉnh CSS Text-Shadow:</label>
                      <Input
                        value={template.components.answerButtons?.textShadow || '0 2px 8px rgba(0,0,0,0.85)'}
                        onChange={(e) => updateCompStyle('answerButtons', 'textShadow', e.target.value)}
                        className="h-7 text-xs bg-slate-900 border-slate-700 text-slate-100 font-mono"
                        placeholder="0 2px 8px rgba(0,0,0,0.85)"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Question Box Text Shadow */}
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-300 block">Đổ bóng chữ câu hỏi:</span>
                  <span className="text-[10px] text-slate-500">Giúp chữ câu hỏi nổi bật trên nền video</span>
                </div>
                <Switch
                  checked={Boolean(
                    template.components.questionBox?.textShadow &&
                    template.components.questionBox?.textShadow !== 'none'
                  )}
                  onCheckedChange={(chk) => {
                    updateCompStyle('questionBox', 'textShadow', chk ? '0 2px 8px rgba(0,0,0,0.85)' : undefined);
                  }}
                />
              </div>
              {Boolean(
                template.components.questionBox?.textShadow &&
                template.components.questionBox?.textShadow !== 'none'
              ) && (
                <div className="space-y-1 bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <Input
                    value={template.components.questionBox?.textShadow || '0 2px 8px rgba(0,0,0,0.85)'}
                    onChange={(e) => updateCompStyle('questionBox', 'textShadow', e.target.value)}
                    className="h-6 text-[11px] bg-slate-900 border-slate-700 text-slate-100 font-mono"
                    placeholder="0 2px 8px rgba(0,0,0,0.85)"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: ẢNH MINH HỌA (ILLUSTRATION)                         */}
        {/* ========================================================= */}
        {activeTab === 'illustration' && (
          <div className="space-y-3.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Khung Hiển Thị Ảnh Minh Họa (Duy nhất 1 ảnh):
            </span>

            {/* Position X / Y */}
            <div className="grid grid-cols-2 gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Vị trí X:</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {template.components.illustration?.x ?? 8}%
                  </span>
                </div>
                <Slider
                  min={0}
                  max={60}
                  step={0.5}
                  value={[template.components.illustration?.x ?? 8]}
                  onValueChange={([val]) => updateCompStyle('illustration', 'x', val)}
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Vị trí Y:</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {template.components.illustration?.y ?? 18}%
                  </span>
                </div>
                <Slider
                  min={5}
                  max={70}
                  step={0.5}
                  value={[template.components.illustration?.y ?? 18]}
                  onValueChange={([val]) => updateCompStyle('illustration', 'y', val)}
                />
              </div>
            </div>

            {/* Dimensions: Width & Height */}
            <div className="grid grid-cols-2 gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Chiều rộng:</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {template.components.illustration?.width ?? 84}%
                  </span>
                </div>
                <Slider
                  min={30}
                  max={96}
                  step={1}
                  value={[template.components.illustration?.width ?? 84]}
                  onValueChange={([val]) => updateCompWidth('illustration', val)}
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Chiều cao:</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {template.components.illustration?.height ?? 32}%
                  </span>
                </div>
                <Slider
                  min={15}
                  max={60}
                  step={1}
                  value={[template.components.illustration?.height ?? 32]}
                  onValueChange={([val]) => updateCompHeight('illustration', val)}
                />
              </div>
            </div>

            {/* Crop / Fit Mode */}
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-300 block">Kiểu cắt / Hiển thị ảnh (Crop/Fit):</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'cover', label: 'Cover (Lấp đầy khung)' },
                  { id: 'contain', label: 'Contain (Hiển thị trọn vẹn)' }
                ].map((fit) => (
                  <button
                    key={fit.id}
                    onClick={() => updateCompStyle('illustration', 'objectFit', fit.id)}
                    className={`py-2 px-2.5 rounded-lg text-xs font-bold border transition text-center ${
                      (template.components.illustration?.objectFit || 'cover') === fit.id
                        ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {fit.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bo góc (Radius) & Viền (Border) */}
            <div className="space-y-2.5 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Bo góc (Border Radius):</span>
                  <span className="font-mono text-amber-400">
                    {template.components.illustration?.borderRadius ?? 20}px
                  </span>
                </div>
                <Slider
                  min={0}
                  max={40}
                  step={2}
                  value={[template.components.illustration?.borderRadius ?? 20]}
                  onValueChange={([val]) => updateCompStyle('illustration', 'borderRadius', val)}
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Độ dày viền (Border Width):</span>
                  <span className="font-mono text-amber-400">
                    {template.components.illustration?.borderWidth ?? 0}px
                  </span>
                </div>
                <Slider
                  min={0}
                  max={10}
                  step={1}
                  value={[template.components.illustration?.borderWidth ?? 0]}
                  onValueChange={([val]) => updateCompStyle('illustration', 'borderWidth', val)}
                />
              </div>

              {Boolean(template.components.illustration?.borderWidth) && (
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Màu viền ảnh:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={template.components.illustration?.borderColor || '#ffffff'}
                      onChange={(e) => updateCompStyle('illustration', 'borderColor', e.target.value)}
                      className="w-7 h-7 rounded border border-slate-700 cursor-pointer bg-transparent"
                    />
                    <Input
                      value={template.components.illustration?.borderColor || '#ffffff'}
                      onChange={(e) => updateCompStyle('illustration', 'borderColor', e.target.value)}
                      className="h-7 text-xs bg-slate-950 border-slate-700 text-slate-100 font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Ken Burns Zoom Effect */}
            <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <div>
                <span className="text-xs font-bold text-slate-300 block">Hiệu ứng Zoom nhẹ (Ken Burns):</span>
                <span className="text-[10px] text-slate-500">Phóng to nhẹ ảnh 1.0 sang 1.06 khi đang đọc</span>
              </div>
              <Switch
                checked={template.components.illustration?.zoomEffect !== false}
                onCheckedChange={(chk) => updateCompStyle('illustration', 'zoomEffect', chk)}
              />
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: ĐỒNG HỒ ĐẾM NGƯỢC (COUNTDOWN)                       */}
        {/* ========================================================= */}
        {activeTab === 'countdown' && (
          <div className="space-y-3.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Kiểu dáng & Thời lượng Đếm Ngược:
            </span>

            {/* Countdown Style Preset */}
            <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-bold">
              {([
                { id: 'circle-radial', label: 'Vòng Tròn' },
                { id: 'pill-timer', label: 'Viên Thuốc' },
                { id: 'clean-text', label: 'Số Tối Giản' }
              ] as const).map(({ id, label }) => {
                const isActive =
                  template.countdownStyle === id ||
                  (id === 'circle-radial' && (template.countdownStyle === ('circle' as any) || template.countdownStyle === ('bar-horizontal' as any) || template.countdownStyle === ('bar' as any))) ||
                  (id === 'clean-text' && template.countdownStyle === ('clean' as any));
                return (
                  <button
                    key={id}
                    onClick={() =>
                      onTemplateChange({
                        ...template,
                        countdownStyle: id as CountdownStyle
                      })
                    }
                    className={`py-1.5 rounded transition text-center ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Countdown Duration Seconds */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>Thời gian đếm ngược:</span>
                <span className="font-mono text-amber-400">
                  {template.timing?.countdownDurationSec ?? 5} giây
                </span>
              </div>
              <Slider
                min={3}
                max={15}
                step={1}
                value={[template.timing?.countdownDurationSec ?? 5]}
                onValueChange={([val]) =>
                  onTemplateChange({
                    ...template,
                    timing: {
                      ...template.timing,
                      countdownDurationSec: val
                    }
                  })
                }
              />
            </div>

            {/* Countdown Box Size & Font Size */}
            <div className="grid grid-cols-2 gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Kích thước Box:</span>
                  <span className="font-mono text-amber-400">
                    {template.components.countdown?.width ?? 18}%
                  </span>
                </div>
                <Slider
                  min={10}
                  max={40}
                  step={1}
                  value={[template.components.countdown?.width ?? 18]}
                  onValueChange={([val]) =>
                    onTemplateChange({
                      ...template,
                      components: {
                        ...template.components,
                        countdown: {
                          ...template.components.countdown,
                          width: val,
                          height: val
                        }
                      }
                    })
                  }
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Cỡ chữ số:</span>
                  <span className="font-mono text-amber-400">
                    {template.components.countdown?.fontSize ?? 36}px
                  </span>
                </div>
                <Slider
                  min={20}
                  max={72}
                  step={2}
                  value={[template.components.countdown?.fontSize ?? 36]}
                  onValueChange={([val]) => updateCompStyle('countdown', 'fontSize', val)}
                />
              </div>
            </div>

            {/* Warning Color Threshold */}
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-300 block">Màu cảnh báo khi sắp hết giờ:</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={template.components.countdown?.warningColor || '#ef4444'}
                  onChange={(e) => updateCompStyle('countdown', 'warningColor', e.target.value)}
                  className="w-7 h-7 rounded border border-slate-700 cursor-pointer bg-transparent"
                />
                <Input
                  value={template.components.countdown?.warningColor || '#ef4444'}
                  onChange={(e) => updateCompStyle('countdown', 'warningColor', e.target.value)}
                  className="h-7 text-xs bg-slate-950 border-slate-700 text-slate-100 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4.5: THẺ GIẢI THÍCH (EXPLANATION CARD)                */}
        {/* ========================================================= */}
        {activeTab === 'explanation' && (
          <div className="space-y-3.5">
            {(() => {
              const exp = template.components.explanation || DEFAULT_EXPLANATION_CONFIG;
              const updateExp = (prop: string, val: any) => {
                onTemplateChange({
                  ...template,
                  components: {
                    ...template.components,
                    explanation: {
                      ...(template.components.explanation || DEFAULT_EXPLANATION_CONFIG),
                      [prop]: val
                    }
                  }
                });
              };

              const isEnabled = exp.enabled !== false;
              const isTtsEnabled = exp.readTts !== false;
              const currentDuration = exp.displayDurationSec ?? 3.0;

              return (
                <>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Cấu Hình Thẻ Giải Thích & Giọng Đọc TTS:
                  </span>

                  {/* 1. KÍCH HOẠT & GIỌNG ĐỌC TTS */}
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-3">
                    {/* Bật/Tắt Hiển Thị Giải Thích */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">
                          Hiển thị Giải thích (Show Explanation)
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Bật/tắt hiển thị thẻ giải thích trên video khi công bố đáp án
                        </span>
                      </div>
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={(val) => updateExp('enabled', val)}
                      />
                    </div>

                    {/* Bật/Tắt Đọc TTS Giải Thích */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">
                          Đọc giọng TTS giải thích (Explanation TTS)
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Tắt nếu chỉ muốn người xem tự đọc trên màn hình mà không cần giọng đọc
                        </span>
                      </div>
                      <Switch
                        checked={isTtsEnabled}
                        onCheckedChange={(val) => updateExp('readTts', val)}
                      />
                    </div>

                    {/* Thời Gian Giữ Thẻ (Display Duration) */}
                    <div className={`p-2.5 rounded-xl border transition ${
                      !isTtsEnabled
                        ? 'bg-amber-500/10 border-amber-500/40'
                        : 'bg-slate-950/60 border-slate-800'
                    }`}>
                      <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                        <span className="text-slate-300">
                          Thời gian hiển thị thẻ:
                        </span>
                        <span className="font-mono text-amber-400 font-bold">
                          {currentDuration.toFixed(1)} giây
                        </span>
                      </div>
                      <Slider
                        min={1.0}
                        max={10.0}
                        step={0.5}
                        value={[currentDuration]}
                        onValueChange={([val]) => updateExp('displayDurationSec', val)}
                      />
                      <span className="text-[10px] text-slate-400 block mt-1.5 leading-relaxed">
                        {!isTtsEnabled
                          ? '⭐ Đang áp dụng: Khi tắt TTS, thẻ giải thích sẽ dừng đúng thời gian này để người xem đọc trước khi sang câu mới.'
                          : 'Thời lượng giữ màn hình khi không có audio TTS giải thích.'}
                      </span>
                    </div>

                    {/* Tiêu đề & Icon bóng đèn */}
                    <div className="pt-2 border-t border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-300">
                          Hiện icon bóng đèn 💡
                        </span>
                        <Switch
                          checked={exp.showIcon !== false}
                          onCheckedChange={(val) => updateExp('showIcon', val)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-400">
                          Tiêu đề phụ trên thẻ:
                        </label>
                        <Input
                          value={exp.titleText ?? 'Giải thích / Explanation'}
                          onChange={(e) => updateExp('titleText', e.target.value)}
                          placeholder="Ví dụ: GIẢI THÍCH CHI TIẾT"
                          className="h-7 text-xs bg-slate-950 border-slate-700 text-slate-200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. VỊ TRÍ & KÍCH THƯỚC */}
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2.5">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                      Vị trí & Kích thước:
                    </span>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span>Vị trí X (Ngang):</span>
                          <span className="font-mono text-amber-400 font-bold">{exp.x ?? 6}%</span>
                        </div>
                        <Slider
                          min={0}
                          max={60}
                          step={1}
                          value={[exp.x ?? 6]}
                          onValueChange={([val]) => updateExp('x', val)}
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span>Vị trí Y (Dọc):</span>
                          <span className="font-mono text-amber-400 font-bold">{exp.y ?? 84}%</span>
                        </div>
                        <Slider
                          min={10}
                          max={90}
                          step={1}
                          value={[exp.y ?? 84]}
                          onValueChange={([val]) => updateExp('y', val)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span>Chiều rộng:</span>
                          <span className="font-mono text-amber-400 font-bold">{exp.width ?? 88}%</span>
                        </div>
                        <Slider
                          min={40}
                          max={100}
                          step={1}
                          value={[exp.width ?? 88]}
                          onValueChange={([val]) => updateExp('width', val)}
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span>Chiều cao tối thiểu:</span>
                          <span className="font-mono text-amber-400 font-bold">{exp.height ?? 9}%</span>
                        </div>
                        <Slider
                          min={5}
                          max={30}
                          step={1}
                          value={[exp.height ?? 9]}
                          onValueChange={([val]) => updateExp('height', val)}
                        />
                      </div>
                    </div>

                    {/* Quick Align Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const w = exp.width ?? 88;
                          const newX = Math.round(((100 - w) / 2) * 10) / 10;
                          updateExp('x', newX);
                        }}
                        className="flex-1 py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold transition text-center"
                      >
                        Căn giữa ngang
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onTemplateChange({
                            ...template,
                            components: {
                              ...template.components,
                              explanation: {
                                ...(template.components.explanation || DEFAULT_EXPLANATION_CONFIG),
                                x: 6,
                                y: 84,
                                width: 88,
                                height: 9
                              }
                            }
                          });
                        }}
                        className="flex-1 py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold transition text-center"
                      >
                        Dưới cùng (Mặc định)
                      </button>
                    </div>
                  </div>

                  {/* 3. KIỂU CHỮ & CĂN LỀ */}
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2.5">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                      Kiểu Chữ & Căn Lề:
                    </span>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span>Cỡ chữ:</span>
                          <span className="font-mono text-amber-400 font-bold">{exp.fontSize ?? 15}px</span>
                        </div>
                        <Slider
                          min={11}
                          max={28}
                          step={1}
                          value={[exp.fontSize ?? 15]}
                          onValueChange={([val]) => updateExp('fontSize', val)}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Độ đậm:</label>
                        <select
                          value={exp.fontWeight || '600'}
                          onChange={(e) => updateExp('fontWeight', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-md p-1.5 text-xs font-bold"
                        >
                          <option value="400">Regular (400)</option>
                          <option value="500">Medium (500)</option>
                          <option value="600">SemiBold (600)</option>
                          <option value="700">Bold (700)</option>
                          <option value="800">ExtraBold (800)</option>
                        </select>
                      </div>
                    </div>

                    {/* Text Alignment */}
                    <div className="pt-1">
                      <label className="text-[11px] text-slate-400 block mb-1">Căn lề chữ:</label>
                      <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-bold">
                        {(['left', 'center', 'right'] as const).map((align) => (
                          <button
                            key={align}
                            type="button"
                            onClick={() => updateExp('textAlign', align)}
                            className={`py-1 rounded text-center transition ${
                              (exp.textAlign || 'left') === align
                                ? 'bg-amber-500 text-slate-950 shadow-xs'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {align === 'left' ? 'Trái' : align === 'center' ? 'Giữa' : 'Phải'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Màu chữ */}
                    <div className="pt-1">
                      <label className="text-[11px] text-slate-400 block mb-1">Màu chữ giải thích:</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={exp.textColor || exp.color || '#1e293b'}
                          onChange={(e) => {
                            updateExp('textColor', e.target.value);
                            updateExp('color', e.target.value);
                          }}
                          className="w-7 h-7 rounded border border-slate-700 cursor-pointer bg-transparent"
                        />
                        <Input
                          value={exp.textColor || exp.color || '#1e293b'}
                          onChange={(e) => {
                            updateExp('textColor', e.target.value);
                            updateExp('color', e.target.value);
                          }}
                          className="h-7 text-xs bg-slate-950 border-slate-700 text-slate-100 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4. NỀN, BO GÓC, VIỀN & HIỆU ỨNG */}
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2.5">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                      Nền, Bo Góc & Viền Thẻ:
                    </span>

                    {/* Màu nền & Độ mờ nền */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Màu nền:</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={exp.backgroundColor || '#ffffff'}
                            onChange={(e) => updateExp('backgroundColor', e.target.value)}
                            className="w-7 h-7 rounded border border-slate-700 cursor-pointer bg-transparent"
                          />
                          <Input
                            value={exp.backgroundColor || '#ffffff'}
                            onChange={(e) => updateExp('backgroundColor', e.target.value)}
                            className="h-7 text-xs bg-slate-950 border-slate-700 text-slate-100 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span>Độ mờ nền:</span>
                          <span className="font-mono text-amber-400 font-bold">
                            {Math.round((exp.bgOpacity ?? 0.98) * 100)}%
                          </span>
                        </div>
                        <Slider
                          min={20}
                          max={100}
                          step={5}
                          value={[Math.round((exp.bgOpacity ?? 0.98) * 100)]}
                          onValueChange={([val]) => updateExp('bgOpacity', val / 100)}
                        />
                      </div>
                    </div>

                    {/* Màu viền & Độ dày viền */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Màu viền thẻ:</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={exp.borderColor || '#22c55e'}
                            onChange={(e) => updateExp('borderColor', e.target.value)}
                            className="w-7 h-7 rounded border border-slate-700 cursor-pointer bg-transparent"
                          />
                          <Input
                            value={exp.borderColor || '#22c55e'}
                            onChange={(e) => updateExp('borderColor', e.target.value)}
                            className="h-7 text-xs bg-slate-950 border-slate-700 text-slate-100 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span>Độ dày viền:</span>
                          <span className="font-mono text-amber-400 font-bold">{exp.borderWidth ?? 2}px</span>
                        </div>
                        <Slider
                          min={0}
                          max={8}
                          step={1}
                          value={[exp.borderWidth ?? 2]}
                          onValueChange={([val]) => updateExp('borderWidth', val)}
                        />
                      </div>
                    </div>

                    {/* Bo góc & Padding */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span>Bo góc:</span>
                          <span className="font-mono text-amber-400 font-bold">{exp.borderRadius ?? 16}px</span>
                        </div>
                        <Slider
                          min={0}
                          max={32}
                          step={2}
                          value={[exp.borderRadius ?? 16]}
                          onValueChange={([val]) => updateExp('borderRadius', val)}
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span>Đệm trong:</span>
                          <span className="font-mono text-amber-400 font-bold">{exp.padding ?? 12}px</span>
                        </div>
                        <Slider
                          min={6}
                          max={28}
                          step={2}
                          value={[exp.padding ?? 12]}
                          onValueChange={([val]) => updateExp('padding', val)}
                        />
                      </div>
                    </div>

                    {/* Làm mờ kính (Backdrop Blur) & Đổ bóng (Shadow) */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span>Mờ kính (Blur):</span>
                          <span className="font-mono text-amber-400 font-bold">{exp.backdropBlur ?? 0}px</span>
                        </div>
                        <Slider
                          min={0}
                          max={24}
                          step={2}
                          value={[exp.backdropBlur ?? 0]}
                          onValueChange={([val]) => updateExp('backdropBlur', val)}
                        />
                      </div>
                      <div className="flex flex-col justify-between">
                        <span className="text-[11px] text-slate-400 mb-1">Đổ bóng thẻ:</span>
                        <div className="flex items-center justify-between bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                          <span className="text-[11px] text-slate-300 font-medium">Bật shadow</span>
                          <Switch
                            checked={Boolean(exp.boxShadow && exp.boxShadow !== 'none')}
                            onCheckedChange={(val) =>
                              updateExp('boxShadow', val ? '0 8px 25px rgba(22, 163, 74, 0.22)' : 'none')
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: ÂM THANH & GIỌNG ĐỌC (AUDIO & TTS)                  */}
        {/* ========================================================= */}
        {activeTab === 'audio' && (
          <div className="space-y-3.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Giọng đọc Edge-TTS & Hiệu ứng SFX (Đã bỏ BGM):
            </span>

            {/* TTS Voice Selector */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Mic size={14} className="text-amber-400" />
                  Giọng đọc ({language.toUpperCase()}):
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">Edge-TTS Online</span>
              </div>

              <select
                value={channel.tts?.[language]?.voice || (language === 'vi' ? 'vi-VN-HoaiMyNeural' : 'en-US-JennyNeural')}
                onChange={(e) =>
                  onChannelChange({
                    ...channel,
                    tts: {
                      ...channel.tts,
                      [language]: {
                        ...channel.tts?.[language],
                        voice: e.target.value
                      }
                    }
                  })
                }
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg p-2 text-xs font-bold"
              >
                {language === 'vi' ? (
                  <>
                    <option value="vi-VN-HoaiMyNeural">Hoài My (Nữ - Truyền cảm, tự nhiên)</option>
                    <option value="vi-VN-NamMinhNeural">Nam Minh (Nam - Trầm ấm, dứt khoát)</option>
                  </>
                ) : (
                  <>
                    <option value="en-US-JennyNeural">Jenny (Female - Warm, Friendly)</option>
                    <option value="en-US-GuyNeural">Guy (Male - Confident, Clear)</option>
                    <option value="en-GB-SoniaNeural">Sonia (British Female)</option>
                  </>
                )}
              </select>

              {/* TTS Speed Rate */}
              <div className="pt-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Tốc độ đọc (Speed Rate):</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {channel.tts?.[language]?.rate || '+0%'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {['-10%', '+0%', '+10%', '+20%', '+30%'].map((rate) => (
                    <button
                      key={rate}
                      onClick={() =>
                        onChannelChange({
                          ...channel,
                          tts: {
                            ...channel.tts,
                            [language]: {
                              ...channel.tts?.[language],
                              rate
                            }
                          }
                        })
                      }
                      className={`flex-1 py-1 rounded text-[11px] font-bold border transition ${
                        (channel.tts?.[language]?.rate || '+0%') === rate
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {rate}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* SFX Master Volume */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Volume2 size={14} className="text-amber-400" />
                  Âm lượng hiệu ứng SFX:
                </span>
                <span className="font-mono text-amber-400">
                  {Math.round((channel.audio?.sfxVolume ?? 0.8) * 100)}%
                </span>
              </div>
              <Slider
                min={0}
                max={1}
                step={0.05}
                value={[channel.audio?.sfxVolume ?? 0.8]}
                onValueChange={([val]) =>
                  onChannelChange({
                    ...channel,
                    audio: {
                      ...channel.audio,
                      sfxVolume: val
                    }
                  })
                }
              />
            </div>

            {/* 5 SFX Controls (Tick, Finish, Correct, Transition, Reveal) */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2.5">
              <span className="text-xs font-bold text-slate-300 block">
                5 Hiệu ứng âm thanh (SFX) trong video:
              </span>

              {[
                { id: 'countdown', label: 'Tích tắc đếm ngược (Tick SFX)', defaultUrl: '/assets/audio/sfx/tick.wav' },
                { id: 'countdownFinish', label: 'Chuông hết giờ (Bell SFX)', defaultUrl: '/assets/audio/sfx/finish.wav' },
                { id: 'correctAnswer', label: 'Keng đáp án đúng (Correct SFX)', defaultUrl: '/assets/audio/sfx/correct.wav' },
                { id: 'transition', label: 'Whoosh chuyển câu (Transition SFX)', defaultUrl: '/assets/audio/sfx/whoosh.wav' },
                { id: 'reveal', label: 'Swoosh mở đáp án (Reveal SFX)', defaultUrl: '/assets/audio/sfx/reveal.wav' }
              ].map((sfx) => {
                const customUrl = channel.audio?.sfx?.[sfx.id];
                return (
                  <div
                    key={sfx.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs"
                  >
                    <div className="min-w-0 flex-1 mr-2">
                      <span className="font-semibold text-slate-200 block truncate">
                        {sfx.label}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {customUrl ? 'Âm thanh tải lên' : 'Mặc định Studio'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => playSfxPreview(customUrl || sfx.defaultUrl)}
                        className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 transition"
                        title="Nghe thử"
                      >
                        <Play size={12} />
                      </button>

                      <label className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition">
                        <Upload size={12} />
                        <input
                          type="file"
                          accept="audio/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleUploadCustomSfx(sfx.id, f);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: LOGO & NỀN (BRAND & BACKGROUND)                     */}
        {/* ========================================================= */}
        {activeTab === 'brand' && (
          <div className="space-y-3.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Logo Kênh & Nền Video:
            </span>

            {/* A. LOGO & CHANNEL BRANDING (7 strictly required controls) */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 block">
                  Logo & Tên Kênh Thương Hiệu
                </span>
                {removeBgStatus && (
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px]">
                    {removeBgStatus}
                  </Badge>
                )}
              </div>

              {/* 1. Upload Logo Kênh + Tách nền */}
              <div className="space-y-2">
                {(() => {
                  const currentLogo =
                    template.components.logo?.logoUrl ||
                    channel.branding?.identity?.logoUrl ||
                    (channel as any).brand?.logoUrl;
                  return (
                    <>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => logoFileInputRef.current?.click()}
                          disabled={isUploading}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
                        >
                          <Upload size={13} />
                          <span>{currentLogo ? 'Đổi Logo' : 'Upload Logo'}</span>
                        </button>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,image/*"
                          ref={logoFileInputRef}
                          onChange={handleUploadLogo}
                          className="hidden"
                        />

                        {currentLogo && (
                          <button
                            type="button"
                            onClick={handleRemoveLogoBg}
                            disabled={isRemovingBg}
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
                            title="Tự động xóa nền màu/trắng của logo"
                          >
                            {isRemovingBg ? <Loader2 size={13} className="animate-spin" /> : <Wand2 size={13} />}
                            <span>{isRemovingBg ? 'Đang tách nền...' : '🪄 Tách nền Logo'}</span>
                          </button>
                        )}

                        {currentLogo && (
                          <button
                            type="button"
                            onClick={handleDeleteLogo}
                            className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition"
                            title="Xóa logo"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>

                      {/* Logo Preview box with checkerboard background so transparency is clearly visible */}
                      {currentLogo && (
                        <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                          <div
                            className="w-14 h-14 rounded-lg overflow-hidden flex items-center justify-center shrink-0 border border-slate-700"
                            style={{
                              backgroundImage:
                                'linear-gradient(45deg, #1e293b 25%, transparent 25%), linear-gradient(-45deg, #1e293b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1e293b 75%), linear-gradient(-45deg, transparent 75%, #1e293b 75%)',
                              backgroundSize: '12px 12px',
                              backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px'
                            }}
                          >
                            <img
                              src={currentLogo}
                              alt="Logo Preview"
                              className="max-w-full max-h-full object-contain p-1"
                            />
                          </div>
                          <div className="flex-1 min-w-0 text-[11px] text-slate-400">
                            <span className="font-bold text-slate-200 block truncate">Logo hiện tại</span>
                            <span className="text-[10px] text-slate-500 block truncate">{currentLogo}</span>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* 2. Tên kênh (Channel Name) */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">Tên Kênh</label>
                <Input
                  value={
                    template.components.logo?.channelName ??
                    channel.branding?.identity?.channelName ??
                    channel.name ??
                    ''
                  }
                  onChange={(e) => {
                    const newName = e.target.value;
                    onChannelChange({
                      ...channel,
                      branding: {
                        ...channel.branding,
                        identity: {
                          ...channel.branding?.identity,
                          channelName: newName
                        }
                      }
                    });
                    updateCompStyle('logo', 'channelName', newName);
                  }}
                  placeholder="Ví dụ: KIẾN THỨC MỖI NGÀY"
                  className="h-8 bg-slate-950 border-slate-700 text-xs font-semibold text-white"
                />
              </div>

              {/* 3 & 4. Bật/Tắt Logo và Bật/Tắt Tên Kênh */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="flex items-center justify-between bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-xs font-semibold text-slate-300">Hiện Logo</span>
                  <Switch
                    checked={
                      template.components.logo?.showLogo ??
                      channel.branding?.identity?.showLogo ??
                      true
                    }
                    onCheckedChange={(val) => {
                      updateCompStyle('logo', 'showLogo', val);
                      onChannelChange({
                        ...channel,
                        branding: {
                          ...channel.branding,
                          identity: {
                            ...channel.branding?.identity,
                            showLogo: val
                          }
                        }
                      });
                    }}
                  />
                </div>
                <div className="flex items-center justify-between bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-xs font-semibold text-slate-300">Hiện Tên Kênh</span>
                  <Switch
                    checked={
                      template.components.logo?.showChannelName ??
                      channel.branding?.identity?.showChannelName ??
                      false
                    }
                    onCheckedChange={(val) => {
                      updateCompStyle('logo', 'showChannelName', val);
                      onChannelChange({
                        ...channel,
                        branding: {
                          ...channel.branding,
                          identity: {
                            ...channel.branding?.identity,
                            showChannelName: val
                          }
                        }
                      });
                    }}
                  />
                </div>
              </div>

              {/* 5. Vị trí X, Y & Căn lề */}
              <div className="space-y-2 pt-1 border-t border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 block">Vị trí & Căn lề</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span>Vị trí X:</span>
                      <span className="font-mono text-amber-400 font-bold">{template.components.logo?.x ?? 75}%</span>
                    </div>
                    <Slider
                      min={0}
                      max={100}
                      step={0.5}
                      value={[template.components.logo?.x ?? 75]}
                      onValueChange={([val]) => updateCompStyle('logo', 'x', val)}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span>Vị trí Y:</span>
                      <span className="font-mono text-amber-400 font-bold">{template.components.logo?.y ?? 8}%</span>
                    </div>
                    <Slider
                      min={0}
                      max={100}
                      step={0.5}
                      value={[template.components.logo?.y ?? 8]}
                      onValueChange={([val]) => updateCompStyle('logo', 'y', val)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 mt-1">
                  {(['left', 'center', 'right'] as const).map((align) => (
                    <button
                      key={align}
                      type="button"
                      onClick={() => {
                        updateCompStyle('logo', 'horizontalAlign', align);
                        updateCompStyle('logo', 'textAlign', align);
                      }}
                      className={`py-1 rounded text-xs font-bold capitalize transition ${
                        (template.components.logo?.horizontalAlign || 'right') === align
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {align === 'left' ? 'Trái' : align === 'center' ? 'Giữa' : 'Phải'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 6. Kích thước Logo */}
              <div className="space-y-1 pt-1 border-t border-slate-800">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Kích thước Logo:</span>
                  <span className="font-mono text-amber-400 font-bold">{template.components.logo?.logoSize ?? 42}px</span>
                </div>
                <Slider
                  min={16}
                  max={96}
                  step={2}
                  value={[template.components.logo?.logoSize ?? 42]}
                  onValueChange={([val]) => updateCompStyle('logo', 'logoSize', val)}
                />
              </div>

              {/* 7. Độ mờ (Opacity) */}
              <div className="space-y-1 pt-1 border-t border-slate-800">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Độ mờ (Opacity):</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {Math.round(
                      (template.components.logo?.opacity ??
                        channel.branding?.identity?.watermarkOpacity ??
                        0.85) * 100
                    )}
                    %
                  </span>
                </div>
                <Slider
                  min={0.1}
                  max={1.0}
                  step={0.05}
                  value={[
                    template.components.logo?.opacity ??
                      channel.branding?.identity?.watermarkOpacity ??
                      0.85
                  ]}
                  onValueChange={([val]) => {
                    updateCompStyle('logo', 'opacity', val);
                    onChannelChange({
                      ...channel,
                      branding: {
                        ...channel.branding,
                        identity: {
                          ...channel.branding?.identity,
                          watermarkOpacity: val
                        }
                      }
                    });
                  }}
                />
              </div>
            </div>

            {/* B. CÀI ĐẶT NỀN VIDEO (BACKGROUND) */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-200 block">
                Nền Video
              </span>

              {/* Background Type Selector (5 modes: neon, gradient, image, mesh, solid) */}
              <div className="grid grid-cols-5 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-bold">
                {[
                  { id: 'neon', label: '🌟 Neon' },
                  { id: 'gradient', label: 'Gradient' },
                  { id: 'image', label: 'Ảnh 9:16' },
                  { id: 'mesh', label: 'Lưới' },
                  { id: 'solid', label: 'Đơn Sắc' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() =>
                      onTemplateChange({
                        ...template,
                        components: {
                          ...template.components,
                          background: {
                            ...template.components.background,
                            type: t.id as any,
                            neonPresetId: t.id === 'neon' ? (template.components.background?.neonPresetId || 'neon-gradient') : template.components.background?.neonPresetId
                          }
                        }
                      })
                    }
                    className={`py-1.5 rounded text-[11px] font-bold transition truncate ${
                      (template.components.background?.type || 'gradient') === t.id
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* SECTION: THƯ VIỆN BACKGROUND NEON CÓ SẴN (8 PRESETS CHUYỂN ĐỘNG THỰC TẾ) */}
              {(template.components.background?.type === 'neon') && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles size={13} className="text-amber-400" />
                      <span>Thư Viện Neon Động (8 Phong Cách):</span>
                    </span>
                    <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]">
                      Remotion Motion
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {NEON_PRESETS.map((p) => {
                      const isSelected =
                        (template.components.background?.neonPresetId || 'neon-gradient') === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() =>
                            onTemplateChange({
                              ...template,
                              components: {
                                ...template.components,
                                background: {
                                  ...template.components.background,
                                  type: 'neon',
                                  neonPresetId: p.id
                                }
                              }
                            })
                          }
                          className={`p-2 rounded-xl border text-left flex flex-col justify-between relative transition hover:scale-[1.02] ${
                            isSelected
                              ? 'border-amber-400 bg-amber-500/15 shadow-[0_0_15px_rgba(245,158,11,0.25)] ring-1 ring-amber-400'
                              : 'border-slate-800 bg-slate-950/80 hover:border-slate-700 hover:bg-slate-900'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-lg">{p.icon}</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                                isSelected
                                  ? 'bg-amber-400 text-slate-950'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {p.tag}
                            </span>
                          </div>

                          <div
                            className="h-7 w-full rounded-lg mb-1.5 border border-slate-700/60 shadow-xs"
                            style={{ background: p.gradientPreview }}
                          />

                          <div className="min-w-0">
                            <span
                              className={`text-xs font-bold block truncate ${
                                isSelected ? 'text-amber-300 font-black' : 'text-slate-200'
                              }`}
                            >
                              {p.name}
                            </span>
                            <span className="text-[10px] text-slate-400 line-clamp-1 block mt-0.5">
                              {p.desc}
                            </span>
                          </div>

                          {isSelected && (
                            <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Neon Speed, Intensity & Custom Colors */}
                  <div className="space-y-2.5 bg-slate-950 p-2.5 rounded-xl border border-slate-800 pt-3">
                    <span className="text-xs font-bold text-slate-300 block">Tinh Chỉnh Neon:</span>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span>Tốc độ chuyển động:</span>
                          <span className="font-mono text-amber-400 font-bold">
                            {(template.components.background?.neonSpeed ?? 1.0).toFixed(1)}x
                          </span>
                        </div>
                        <Slider
                          min={0.2}
                          max={2.5}
                          step={0.1}
                          value={[template.components.background?.neonSpeed ?? 1.0]}
                          onValueChange={([val]) => updateCompStyle('background', 'neonSpeed', val)}
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span>Cường độ sáng:</span>
                          <span className="font-mono text-amber-400 font-bold">
                            {Math.round((template.components.background?.neonIntensity ?? 1.0) * 100)}%
                          </span>
                        </div>
                        <Slider
                          min={0.3}
                          max={2.0}
                          step={0.1}
                          value={[template.components.background?.neonIntensity ?? 1.0]}
                          onValueChange={([val]) => updateCompStyle('background', 'neonIntensity', val)}
                        />
                      </div>
                    </div>

                    {/* Color Overrides for Neon (3 colors) */}
                    <div className="space-y-2 pt-1 border-t border-slate-800">
                      <span className="text-[11px] font-bold text-slate-300 block">Bộ 3 Màu Neon Động:</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">Màu 1:</label>
                          <div className="flex items-center gap-1">
                            <input
                              type="color"
                              value={template.components.background?.neonColor1 || '#00f0ff'}
                              onChange={(e) => updateCompStyle('background', 'neonColor1', e.target.value)}
                              className="w-5 h-5 rounded border border-slate-700 cursor-pointer bg-transparent shrink-0"
                            />
                            <Input
                              value={template.components.background?.neonColor1 || '#00f0ff'}
                              onChange={(e) => updateCompStyle('background', 'neonColor1', e.target.value)}
                              className="h-6 text-[9px] bg-slate-900 border-slate-700 text-slate-100 font-mono px-1"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">Màu 2:</label>
                          <div className="flex items-center gap-1">
                            <input
                              type="color"
                              value={template.components.background?.neonColor2 || '#ff007f'}
                              onChange={(e) => updateCompStyle('background', 'neonColor2', e.target.value)}
                              className="w-5 h-5 rounded border border-slate-700 cursor-pointer bg-transparent shrink-0"
                            />
                            <Input
                              value={template.components.background?.neonColor2 || '#ff007f'}
                              onChange={(e) => updateCompStyle('background', 'neonColor2', e.target.value)}
                              className="h-6 text-[9px] bg-slate-900 border-slate-700 text-slate-100 font-mono px-1"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">Màu 3:</label>
                          <div className="flex items-center gap-1">
                            <input
                              type="color"
                              value={template.components.background?.neonColor3 || '#7928ca'}
                              onChange={(e) => updateCompStyle('background', 'neonColor3', e.target.value)}
                              className="w-5 h-5 rounded border border-slate-700 cursor-pointer bg-transparent shrink-0"
                            />
                            <Input
                              value={template.components.background?.neonColor3 || '#7928ca'}
                              onChange={(e) => updateCompStyle('background', 'neonColor3', e.target.value)}
                              className="h-6 text-[9px] bg-slate-900 border-slate-700 text-slate-100 font-mono px-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Direction / Flow */}
                    <div className="pt-1 border-t border-slate-800 space-y-1">
                      <span className="text-[11px] font-bold text-slate-300 block">Hướng chuyển động:</span>
                      <div className="grid grid-cols-4 gap-1 text-[10px] font-bold">
                        {[
                          { id: 'down', label: '⬇️ Xuống' },
                          { id: 'up', label: '⬆️ Lên' },
                          { id: 'left', label: '⬅️ Trái' },
                          { id: 'right', label: '➡️ Phải' }
                        ].map((d) => {
                          const curDir = template.components.background?.motion?.direction || 'down';
                          const isSel = curDir === d.id;
                          return (
                            <button
                              key={d.id}
                              type="button"
                              onClick={() => {
                                const curMotion = template.components.background?.motion || {};
                                onTemplateChange({
                                  ...template,
                                  components: {
                                    ...template.components,
                                    background: {
                                      ...template.components.background,
                                      motion: {
                                        ...curMotion,
                                        direction: d.id as MotionDirection
                                      }
                                    }
                                  }
                                });
                              }}
                              className={`py-1 rounded border text-center transition ${
                                isSel
                                  ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                                  : 'border-slate-800 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              {d.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Movement Amplitude & Blur */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span>Biên độ sóng:</span>
                          <span className="font-mono text-amber-400 font-bold">
                            {template.components.background?.motion?.movement ?? 25}
                          </span>
                        </div>
                        <Slider
                          min={5}
                          max={50}
                          step={5}
                          value={[template.components.background?.motion?.movement ?? 25]}
                          onValueChange={([val]) => {
                            const curMotion = template.components.background?.motion || {};
                            onTemplateChange({
                              ...template,
                              components: {
                                ...template.components,
                                background: {
                                  ...template.components.background,
                                  motion: {
                                    ...curMotion,
                                    movement: val
                                  }
                                }
                              }
                            });
                          }}
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span>Làm mờ (Blur):</span>
                          <span className="font-mono text-amber-400 font-bold">
                            {template.components.background?.blur ?? 0}px
                          </span>
                        </div>
                        <Slider
                          min={0}
                          max={30}
                          step={2}
                          value={[template.components.background?.blur ?? 0]}
                          onValueChange={([val]) => updateCompStyle('background', 'blur', val)}
                        />
                      </div>
                    </div>

                    {/* Opacity & Zoom */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span>Độ rõ nền (Opacity):</span>
                          <span className="font-mono text-amber-400 font-bold">
                            {Math.round((template.components.background?.opacity ?? 1.0) * 100)}%
                          </span>
                        </div>
                        <Slider
                          min={20}
                          max={100}
                          step={5}
                          value={[Math.round((template.components.background?.opacity ?? 1.0) * 100)]}
                          onValueChange={([val]) => updateCompStyle('background', 'opacity', val / 100)}
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span>Zoom nền:</span>
                          <span className="font-mono text-amber-400 font-bold">
                            {(template.components.background?.motion?.zoomScale ?? 1.0).toFixed(2)}x
                          </span>
                        </div>
                        <Slider
                          min={1.0}
                          max={1.4}
                          step={0.02}
                          value={[template.components.background?.motion?.zoomScale ?? 1.0]}
                          onValueChange={([val]) => {
                            const curMotion = template.components.background?.motion || {};
                            onTemplateChange({
                              ...template,
                              components: {
                                ...template.components,
                                background: {
                                  ...template.components.background,
                                  motion: {
                                    ...curMotion,
                                    zoomScale: val
                                  }
                                }
                              }
                            });
                          }}
                        />
                      </div>
                    </div>

                    {/* Overlay Opacity for Readability */}
                    <div className="pt-1 border-t border-slate-800">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span>Lớp phủ chống chói chữ (Overlay):</span>
                        <span className="font-mono text-amber-400 font-bold">
                          {Math.round((template.components.background?.overlayOpacity ?? 0.15) * 100)}%
                        </span>
                      </div>
                      <Slider
                        min={0}
                        max={80}
                        step={5}
                        value={[Math.round((template.components.background?.overlayOpacity ?? 0.15) * 100)]}
                        onValueChange={([val]) => updateCompStyle('background', 'overlayOpacity', val / 100)}
                      />
                      <span className="text-[9px] text-slate-500 block mt-0.5">
                        Tăng độ mờ nếu chữ trên video bị lóa bởi các dải neon sáng
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Preset Gradients (when type is gradient) */}
              {(template.components.background?.type === 'gradient' || !template.components.background?.type) && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-400">Gradient Mẫu:</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { name: 'Dark Slate', val: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' },
                      { name: 'Amber Glow', val: 'linear-gradient(135deg, #18181b 0%, #451a03 100%)' },
                      { name: 'Deep Purple', val: 'linear-gradient(135deg, #020617 0%, #3b0764 100%)' },
                      { name: 'Emerald Night', val: 'linear-gradient(135deg, #022c22 0%, #064e3b 100%)' },
                      { name: 'Midnight Blue', val: 'linear-gradient(135deg, #030712 0%, #1e3a8a 100%)' },
                      { name: 'Crimson Dark', val: 'linear-gradient(135deg, #450a0a 0%, #000000 100%)' }
                    ].map((g) => (
                      <button
                        key={g.name}
                        onClick={() =>
                          onTemplateChange({
                            ...template,
                            components: {
                              ...template.components,
                              background: {
                                ...template.components.background,
                                type: 'gradient',
                                gradient: g.val
                              }
                            }
                          })
                        }
                        className="h-10 rounded-lg border border-slate-700 flex items-center justify-center text-[10px] font-bold shadow-xs hover:scale-105 transition"
                        style={{ background: g.val }}
                      >
                        <span className="px-1 py-0.5 rounded bg-black/60 text-white truncate max-w-[80px]">
                          {g.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Background Image */}
              <div className="space-y-2 pt-1 border-t border-slate-800">
                <span className="text-xs font-bold text-slate-300 block">Tải ảnh nền riêng:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => bgFileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Upload size={13} />
                    <span>Upload Ảnh Nền</span>
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    ref={bgFileInputRef}
                    onChange={handleUploadBgImage}
                    className="hidden"
                  />
                </div>

                {template.components.background?.imageUrl && (
                  <div className="relative h-20 rounded-lg overflow-hidden border border-slate-700">
                    <img
                      src={template.components.background.imageUrl}
                      alt="Current BG"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-xs font-bold text-white">
                      Ảnh nền đang dùng
                    </div>
                  </div>
                )}
              </div>

              {/* AI Watermark Zoom & Advanced Motion System */}
              <div className="space-y-3 pt-1 border-t border-slate-800">
                {/* 1. AI Watermark Safe Zoom Toggle */}
                <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <div className="pr-2">
                    <span className="text-xs font-bold text-slate-200 block">
                      AI Watermark Zoom (+20% từ tâm)
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Tự động phóng to 20% từ tâm ảnh để cắt sạch watermark của ảnh AI ở mép trước khi áp dụng chuyển động.
                    </span>
                  </div>
                  <Switch
                    checked={template.components.background?.motion?.aiWatermarkZoom !== false}
                    onCheckedChange={(val) => {
                      const curMotion = template.components.background?.motion || {};
                      onTemplateChange({
                        ...template,
                        components: {
                          ...template.components,
                          background: {
                            ...template.components.background,
                            motion: {
                              ...curMotion,
                              aiWatermarkZoom: val
                            }
                          }
                        }
                      });
                    }}
                  />
                </div>

                {/* 2. Motion Effects Multi-Selection (Choose 2-3 effects simultaneously) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 block">
                      Chuyển động nền (Chọn tối đa 3 hiệu ứng):
                    </span>
                    {(() => {
                      const motion = template.components.background?.motion || {};
                      const effects = motion.effects || (motion.direction ? [motion.direction as MotionEffect] : ['zoom-in']);
                      return (
                        <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]">
                          {effects.length} hiệu ứng
                        </Badge>
                      );
                    })()}
                  </div>

                  {(() => {
                    const motion = template.components.background?.motion || {};
                    const currentEffects: MotionEffect[] = motion.effects && motion.effects.length > 0
                      ? motion.effects
                      : (motion.direction ? [motion.direction as MotionEffect] : ['zoom-in']);

                    const availableEffects: Array<{ id: MotionEffect; label: string; icon: string }> = [
                      { id: 'random-motion', label: 'Random Motion (Vô tận)', icon: '🎲' },
                      { id: 'zoom-in', label: 'Phóng to (Zoom In)', icon: '🔍' },
                      { id: 'zoom-out', label: 'Thu nhỏ (Zoom Out)', icon: '🔎' },
                      { id: 'pan-left', label: 'Lướt sang trái', icon: '⬅️' },
                      { id: 'pan-right', label: 'Lướt sang phải', icon: '➡️' },
                      { id: 'pan-up', label: 'Lướt lên trên', icon: '⬆️' },
                      { id: 'pan-down', label: 'Lướt xuống dưới', icon: '⬇️' }
                    ];

                    const toggleEffect = (effId: MotionEffect) => {
                      let next: MotionEffect[];
                      if (currentEffects.includes(effId)) {
                        if (currentEffects.length > 1) {
                          next = currentEffects.filter(e => e !== effId);
                        } else {
                          next = currentEffects; // keep at least 1
                        }
                      } else {
                        if (currentEffects.length >= 3) {
                          next = [...currentEffects.slice(1), effId]; // rotate out oldest
                        } else {
                          next = [...currentEffects, effId];
                        }
                      }

                      onTemplateChange({
                        ...template,
                        components: {
                          ...template.components,
                          background: {
                            ...template.components.background,
                            motion: {
                              ...motion,
                              enabled: true,
                              effects: next,
                              direction: next[0] as MotionDirection
                            }
                          }
                        }
                      });
                    };

                    return (
                      <>
                        <div className="grid grid-cols-2 gap-1.5 text-xs font-bold">
                          {availableEffects.map((eff) => {
                            const isSelected = currentEffects.includes(eff.id);
                            return (
                              <button
                                key={eff.id}
                                type="button"
                                onClick={() => toggleEffect(eff.id)}
                                className={`p-2 rounded-lg border text-left text-[11px] transition flex items-center justify-between ${
                                  isSelected
                                    ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-bold shadow-xs ring-1 ring-amber-400/40'
                                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                                }`}
                              >
                                <span>{eff.icon} {eff.label}</span>
                                {isSelected && <Check size={12} className="text-amber-400 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>

                        {/* Active combo summary */}
                        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
                          <span className="font-bold text-amber-400">Tổ hợp chuyển động: </span>
                          <span>
                            {currentEffects
                              .map(e => availableEffects.find(a => a.id === e)?.label || e)
                              .join(' + ')}
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* 3. Motion Fine-Tuning Sliders (Intensity, Zoom Level, Speed) */}
                <div className="space-y-2.5 pt-1 border-t border-slate-800/80">
                  {/* Intensity / Distance */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span>Mức độ dịch chuyển (Intensity):</span>
                      <span className="font-mono text-amber-400 font-bold">
                        {template.components.background?.motion?.intensity ?? 20}px
                      </span>
                    </div>
                    <Slider
                      min={8}
                      max={40}
                      step={2}
                      value={[template.components.background?.motion?.intensity ?? 20]}
                      onValueChange={([val]) => {
                        const curMotion = template.components.background?.motion || {};
                        onTemplateChange({
                          ...template,
                          components: {
                            ...template.components,
                            background: {
                              ...template.components.background,
                              motion: {
                                ...curMotion,
                                intensity: val
                              }
                            }
                          }
                        });
                      }}
                    />
                  </div>

                  {/* Zoom Scale */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span>Mức Zoom thêm:</span>
                      <span className="font-mono text-amber-400 font-bold">
                        {(template.components.background?.motion?.zoomScale ?? 1.15).toFixed(2)}x
                      </span>
                    </div>
                    <Slider
                      min={1.05}
                      max={1.30}
                      step={0.01}
                      value={[template.components.background?.motion?.zoomScale ?? 1.15]}
                      onValueChange={([val]) => {
                        const curMotion = template.components.background?.motion || {};
                        onTemplateChange({
                          ...template,
                          components: {
                            ...template.components,
                            background: {
                              ...template.components.background,
                              motion: {
                                ...curMotion,
                                zoomScale: val
                              }
                            }
                          }
                        });
                      }}
                    />
                  </div>

                  {/* Speed */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span>Tốc độ chuyển động:</span>
                      <span className="font-mono text-amber-400 font-bold">
                        {(template.components.background?.motion?.speed ?? 1.0).toFixed(1)}x
                      </span>
                    </div>
                    <Slider
                      min={0.5}
                      max={2.0}
                      step={0.1}
                      value={[template.components.background?.motion?.speed ?? 1.0]}
                      onValueChange={([val]) => {
                        const curMotion = template.components.background?.motion || {};
                        onTemplateChange({
                          ...template,
                          components: {
                            ...template.components,
                            background: {
                              ...template.components.background,
                              motion: {
                                ...curMotion,
                                speed: val
                              }
                            }
                          }
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 7: HIỆU ỨNG (ANIMATION & TRANSITIONS)                  */}
        {/* ========================================================= */}
        {activeTab === 'animation' && (
          <div className="space-y-3.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Chuyển cảnh câu hỏi & Hiệu ứng chuyển động:
            </span>

            {/* Transition Type */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-300 block">Hiệu ứng chuyển sang câu mới:</span>
              <div className="grid grid-cols-2 gap-1.5 text-xs font-bold">
                {[
                  { id: 'slide', label: 'Trượt ngang (Slide)' },
                  { id: 'zoom', label: 'Thu phóng (Zoom)' },
                  { id: 'wipe', label: 'Quét màn hình (Wipe)' },
                  { id: 'fade', label: 'Mờ dần (Fade)' }
                ].map((tr) => (
                  <button
                    key={tr.id}
                    onClick={() =>
                      onTemplateChange({
                        ...template,
                        transitionType: tr.id as any
                      })
                    }
                    className={`p-2 rounded-lg border text-left text-xs transition ${
                      (template.transitionType || 'slide') === tr.id
                        ? 'border-amber-400 bg-amber-500/10 text-amber-300 font-bold'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tr.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Transition Duration */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>Thời lượng chuyển cảnh:</span>
                <span className="font-mono text-amber-400">
                  {template.timing?.transitionDurationFrames ?? 15} frames (~0.5s)
                </span>
              </div>
              <Slider
                min={6}
                max={30}
                step={2}
                value={[template.timing?.transitionDurationFrames ?? 15]}
                onValueChange={([val]) =>
                  onTemplateChange({
                    ...template,
                    timing: {
                      ...template.timing,
                      transitionDurationFrames: val
                    }
                  })
                }
              />
            </div>

            {/* Component Entrance Animations */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-300 block">
                Hiệu ứng xuất hiện khung câu hỏi & đáp án:
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-xs font-bold">
                {[
                  { id: 'slide-up', label: 'Trượt lên (Slide Up)' },
                  { id: 'pop', label: 'Nảy xuất hiện (Pop)' },
                  { id: 'bounce', label: 'Nhún nhảy (Bounce)' },
                  { id: 'fade', label: 'Hiện dần (Fade)' }
                ].map((anim) => (
                  <button
                    key={anim.id}
                    onClick={() => {
                      updateCompStyle('questionBox', 'animation', anim.id);
                      updateCompStyle('answerButtons', 'animation', anim.id);
                    }}
                    className={`p-2 rounded-lg border text-left text-xs transition ${
                      template.components.questionBox?.animation === anim.id
                        ? 'border-amber-400 bg-amber-500/10 text-amber-300 font-bold'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {anim.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Final Hold Duration */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>Thời gian giữ màn hình cuối (Final Hold):</span>
                <span className="font-mono text-amber-400">
                  {template.timing?.finalHoldDurationSec ?? 3} giây
                </span>
              </div>
              <Slider
                min={1}
                max={8}
                step={0.5}
                value={[template.timing?.finalHoldDurationSec ?? 3]}
                onValueChange={([val]) =>
                  onTemplateChange({
                    ...template,
                    timing: {
                      ...template.timing,
                      finalHoldDurationSec: val
                    }
                  })
                }
              />
              <span className="text-[10px] text-slate-500 block">
                Giữ lại câu trả lời và thông điệp trước khi kết thúc video
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
