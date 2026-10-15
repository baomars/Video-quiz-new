import React, { useRef, useState } from 'react';
import {
  VideoTemplate,
  Channel,
  LanguageCode,
  Quiz,
  NeonPresetId
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
  RotateCcw,
  Palette,
  Heading,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Layout,
  Layers,
  Eye,
  EyeOff,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyEnd
} from 'lucide-react';
import { Slider } from '../ui/slider';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { uploadImage, uploadAudio } from '../../services/api';

export type ComponentKey =
  | 'background'
  | 'quizTitle'
  | 'questionBox'
  | 'answerButtons'
  | 'countdown'
  | 'explanation'
  | 'illustration'
  | 'brand_audio';

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
    id: 'sunny-nature',
    name: 'Nắng Qua Tán Cây',
    tag: 'Nền sáng • Thiên nhiên',
    desc: 'Ánh nắng vàng ấm áp dọi qua tán lá cây xanh mướt chuyển động nhẹ',
    gradientPreview: 'linear-gradient(135deg, #fef9c3 0%, #dcfce7 50%, #bbf7d0 100%)',
    icon: '🌿'
  },
  {
    id: 'spring-garden',
    name: 'Vườn Hoa Mùa Xuân',
    tag: 'Nền sáng • Tươi mới',
    desc: 'Sắc xanh non lá mới kết hợp vạt nắng hồng phấn và cánh hoa bay',
    gradientPreview: 'linear-gradient(135deg, #fdf2f8 0%, #dcfce7 50%, #bbf7d0 100%)',
    icon: '🌸'
  },
  {
    id: 'pastel-clouds',
    name: 'Mây Trời Bồng Bềnh',
    tag: 'Nền sáng • Mơ màng',
    desc: 'Bầu trời xanh trong vắt với từng cụm mây trắng và cam đào trôi êm',
    gradientPreview: 'linear-gradient(180deg, #e0f2fe 0%, #bae6fd 50%, #ffedd5 100%)',
    icon: '☁️'
  },
  {
    id: 'bright-studio',
    name: 'Studio Trắng Tối Giản',
    tag: 'Nền sáng • Tinh tế',
    desc: 'Ánh sáng soft-box studio trắng sáng thanh lịch, tập trung vào nội dung',
    gradientPreview: 'radial-gradient(circle, #ffffff 40%, #f1f5f9 85%, #e2e8f0 100%)',
    icon: '💡'
  },
  {
    id: 'golden-sunray',
    name: 'Tia Nắng Ban Mai',
    tag: 'Nền sáng • Ấm áp',
    desc: 'Những luồng sáng vàng kim ban mai ấm áp chuyển động nhẹ nhàng',
    gradientPreview: 'linear-gradient(120deg, #fef3c7 0%, #fde68a 40%, #fef08a 100%)',
    icon: '☀️'
  },
  {
    id: 'watercolor-bloom',
    name: 'Vệt Màu Nước Nghệ Thuật',
    tag: 'Nền sáng • Nghệ thuật',
    desc: 'Vệt màu nước pastel loang nhẹ nhàng trên mặt giấy trắng thanh nhã',
    gradientPreview: 'linear-gradient(135deg, #f5f3ff 0%, #e0e7ff 45%, #ccfbf1 100%)',
    icon: '🎨'
  },
  {
    id: 'clean-paper',
    name: 'Giấy Sáng & Nắng Ấm',
    tag: 'Nền sáng • Tự nhiên',
    desc: 'Bề mặt giấy mỹ thuật sáng kết hợp ánh sáng tự nhiên lan tỏa êm dịu',
    gradientPreview: 'linear-gradient(135deg, #fafaf9 0%, #f5f5f4 50%, #e7e5e4 100%)',
    icon: '📜'
  },
  {
    id: 'fresh-mint',
    name: 'Làn Sóng Bạc Hà Mát Lạnh',
    tag: 'Nền sáng • Tươi mát',
    desc: 'Sóng nước xanh ngọc bạc hà trong trẻo gợn sóng nhịp nhàng',
    gradientPreview: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #a7f3d0 100%)',
    icon: '🍃'
  },
  {
    id: 'bamboo-grove',
    name: 'Rừng Trúc Xanh Mát',
    tag: 'Nền sáng • Tĩnh tại',
    desc: 'Màu xanh lá tre trúc tươi sáng với đốm nắng tự nhiên lấp lánh',
    gradientPreview: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #86efac 100%)',
    icon: '🎋'
  },
  {
    id: 'warm-sunrise',
    name: 'Bình Minh Rạng Rỡ',
    tag: 'Nền sáng • Năng lượng',
    desc: 'Chân trời bình minh ửng hồng cam ấm áp đón chào ngày mới',
    gradientPreview: 'linear-gradient(180deg, #fff7ed 0%, #ffedd5 45%, #fed7aa 100%)',
    icon: '🌅'
  }
];

const QUICK_COLORS = [
  '#ffffff', // White
  '#0f172a', // Dark Slate
  '#facc15', // Yellow / Gold
  '#00f0ff', // Electric Cyan
  '#2563eb', // Royal Blue
  '#a855f7', // Purple
  '#f43f5e', // Coral / Rose
  '#22c55e', // Green
];

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (val: number) => void;
  presets?: Array<{ label: string; value: number }>;
}

const SliderControl: React.FC<SliderControlProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  presets
}) => {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-[11px] text-slate-300">
        <span className="font-medium">{label}</span>
        <span className="font-bold text-sky-400 font-mono">
          {typeof value === 'number' ? (Number.isInteger(value) ? value : value.toFixed(1)) : value}{unit}
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value ?? min]}
        onValueChange={([v]) => onChange(v)}
      />
      {presets && presets.length > 0 && (
        <div className="flex items-center gap-1 pt-0.5 flex-wrap">
          {presets.map((p) => {
            const isCur = Math.abs(value - p.value) < 0.1;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => onChange(p.value)}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition ${
                  isCur
                    ? 'border-sky-500 bg-sky-950/50 text-sky-300 ring-1 ring-sky-500'
                    : 'border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 bg-slate-900/50'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface ColorControlProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
}

const ColorControl: React.FC<ColorControlProps> = ({ label, value, onChange }) => {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-[10px] text-slate-400">
        <span className="font-medium">{label}</span>
        <span className="font-mono text-slate-300 uppercase">{value || '#000000'}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-slate-700 shrink-0 shadow-xs cursor-pointer">
          <input
            type="color"
            value={value || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="absolute -inset-2 w-12 h-12 cursor-pointer opacity-100"
          />
        </div>
        <div className="flex items-center gap-1 flex-1 overflow-x-auto py-0.5 scrollbar-thin">
          {QUICK_COLORS.map((c) => {
            const isSelected = value?.toLowerCase() === c.toLowerCase();
            return (
              <button
                key={c}
                type="button"
                onClick={() => onChange(c)}
                style={{ backgroundColor: c }}
                className={`w-5 h-5 rounded-md border shrink-0 transition ${
                  isSelected ? 'border-sky-400 ring-2 ring-sky-400/50 scale-105' : 'border-slate-700/60 hover:scale-105'
                }`}
                title={c}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const FONT_FAMILIES = [
  { id: 'Montserrat', name: 'Montserrat (Mặc định)', sample: 'Aa Bb Cc' },
  { id: 'Be Vietnam Pro', name: 'Be Vietnam Pro', sample: 'Aa Bb Cc' },
  { id: 'Noto Sans', name: 'Noto Sans', sample: 'Aa Bb Cc' },
  { id: 'Roboto', name: 'Roboto', sample: 'Aa Bb Cc' },
  { id: 'Inter', name: 'Inter', sample: 'Aa Bb Cc' },
  { id: 'Outfit', name: 'Outfit', sample: 'Aa Bb Cc' },
  { id: 'Oswald', name: 'Oswald', sample: 'Aa Bb Cc' },
  { id: 'Lilita One', name: 'Lilita One', sample: 'Aa Bb Cc' },
  { id: 'Titan One', name: 'Titan One', sample: 'Aa Bb Cc' },
  { id: 'Fredoka', name: 'Fredoka', sample: 'Aa Bb Cc' }
];

export interface CountdownStyleItem {
  id: any;
  name: string;
  tag: string;
  desc: string;
  icon: string;
}

export const COUNTDOWN_STYLES: CountdownStyleItem[] = [
  {
    id: 'circular-progress',
    name: 'Circular Progress',
    tag: 'Vòng tròn',
    desc: 'Vòng tròn tiến trình SVG bao quanh số đếm giây mượt mà',
    icon: '⭕'
  },
  {
    id: 'radial-ring',
    name: 'Radial Ring',
    tag: 'Cung quét',
    desc: 'Cung tròn quét góc giảm dần kèm nhãn giây SEC',
    icon: '⏱️'
  },
  {
    id: 'horizontal-progress',
    name: 'Horizontal Progress',
    tag: 'Thanh ngang',
    desc: 'Thanh ngang thanh lịch chạy từ đầy về 0% mượt mà',
    icon: '➖'
  },
  {
    id: 'vertical-progress',
    name: 'Vertical Progress',
    tag: 'Cột dọc',
    desc: 'Cột năng lượng dọc rút cạn năng lượng theo thời gian',
    icon: '🔋'
  },
  {
    id: 'segmented-bar',
    name: 'Segmented Bar',
    tag: 'Vạch LED',
    desc: '5 khối vạch LED riêng biệt tắt dần theo từng giây',
    icon: '📶'
  },
  {
    id: 'neon-countdown',
    name: 'Neon Countdown',
    tag: 'Aura Neon',
    desc: 'Quầng sáng Neon phát quang đa lớp rực rỡ và đập nhịp',
    icon: '💫'
  },
  {
    id: 'digital-countdown',
    name: 'Digital Countdown',
    tag: 'Đồng hồ điện tử',
    desc: 'Màn hình LCD / Bezel số điện tử cổ điển 00:05',
    icon: '📟'
  },
  {
    id: 'flip-timer',
    name: 'Flip Timer',
    tag: 'Thẻ lật',
    desc: 'Thẻ Split-Flap lật số cổ điển có nếp gấp giữa',
    icon: '🎴'
  },
  {
    id: 'minimal-number',
    name: 'Minimal Number',
    tag: 'Chữ số lớn',
    desc: 'Chữ số khổng lồ phóng to tối giản ấn tượng',
    icon: '⚡'
  },
  {
    id: 'pill-timer',
    name: 'Pill Timer',
    tag: 'Capsule',
    desc: 'Viên thuốc capsule thanh lịch + thanh nước chạy',
    icon: '💊'
  },
  {
    id: 'dot-countdown',
    name: 'Dot Countdown',
    tag: 'Chấm bi',
    desc: 'Dãy chấm tròn phát quang biến mất dần theo thời gian',
    icon: '🟣'
  },
  {
    id: 'corner-hud',
    name: 'Corner HUD',
    tag: 'Sci-Fi HUD',
    desc: 'Khung góc vát Sci-Fi / Game show công nghệ góc cạnh',
    icon: '🎯'
  }
];

export interface TypographyControlSectionProps {
  title?: string;
  style: any;
  onChange: (patch: any) => void;
  defaultFontSize?: number;
  allowShadowDefaultOff?: boolean;
  showDimensions?: boolean;
  showAlignment?: boolean;
  showColors?: boolean;
  xPresets?: Array<{ label: string; value: number }>;
  yPresets?: Array<{ label: string; value: number }>;
  widthPresets?: Array<{ label: string; value: number }>;
  heightPresets?: Array<{ label: string; value: number }>;
}

export const TypographyControlSection: React.FC<TypographyControlSectionProps> = ({
  title = 'Typography & Chữ',
  style = {},
  onChange,
  defaultFontSize = 50,
  allowShadowDefaultOff = false,
  showDimensions = true,
  showAlignment = true,
  showColors = true,
  xPresets,
  yPresets,
  widthPresets,
  heightPresets
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const curFontFamily = style?.fontFamily || 'Montserrat';
  const curFontSize = style?.fontSize ?? defaultFontSize;
  const curFontWeight = String(style?.fontWeight || '700');
  const curTextColor = style?.textColor || style?.color || '#0f172a';
  const curTextAlign = style?.textAlign || 'center';
  const curLineHeight = typeof style?.lineHeight === 'number' ? style.lineHeight : 1.35;
  const curLetterSpacing = style?.letterSpacing ?? 0;
  const curOpacity = style?.opacity !== undefined ? Math.round(style.opacity * 100) : 100;

  // Stroke
  const strokeEnabled = Boolean(style?.textStrokeEnabled);
  const strokeWidth = style?.textStrokeWidth ?? 2;
  const strokeColor = style?.textStrokeColor || '#000000';

  // Shadow (Default OFF if allowShadowDefaultOff is true)
  const shadowEnabled = allowShadowDefaultOff
    ? Boolean(style?.textShadowEnabled)
    : (style?.textShadowEnabled !== false && style?.textShadowEnabled !== undefined);
  const shadowBlur = style?.textShadowBlur ?? 8;
  const shadowX = style?.textShadowOffsetX ?? 0;
  const shadowY = style?.textShadowOffsetY ?? 3;
  const shadowColor = style?.textShadowColor || 'rgba(0, 0, 0, 0.4)';

  return (
    <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/50 space-y-0">
      {/* Header bar */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2.5 flex items-center justify-between text-slate-200 hover:text-white cursor-pointer bg-slate-800/40 transition select-none"
      >
        <div className="flex items-center gap-2">
          <Type size={14} className="text-sky-400" />
          <span className="font-bold text-xs">{title}</span>
          <span className="text-[10px] text-sky-400 font-mono bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-800/50">
            {curFontFamily} • {curFontSize}px
          </span>
        </div>
        {isOpen ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
      </div>

      {isOpen && (
        <div className="p-3 space-y-3.5 border-t border-slate-800/80 bg-slate-900/40">
          {/* 1. Font Family Dropdown */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] text-slate-400">
              <span className="font-semibold uppercase tracking-wider">Font Chữ (Font Family)</span>
              <span className="text-sky-400 font-medium">{curFontFamily}</span>
            </div>
            <select
              value={curFontFamily}
              onChange={(e) => onChange({ fontFamily: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-medium"
            >
              {FONT_FAMILIES.map((f) => (
                <option key={f.id} value={f.id} className="bg-slate-900 text-slate-100">
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Font Size */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[11px] text-slate-300">
              <span className="font-medium">Cỡ chữ (Font Size)</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={14}
                  max={100}
                  value={curFontSize}
                  onChange={(e) => onChange({ fontSize: Math.max(14, Math.min(100, Number(e.target.value) || 14)) })}
                  className="w-12 h-5 bg-slate-950 border border-slate-700 rounded text-center text-[11px] text-sky-400 font-mono font-bold focus:outline-none focus:border-sky-500"
                />
                <span className="text-[11px] text-slate-400">px</span>
              </div>
            </div>
            <Slider
              min={14}
              max={100}
              step={1}
              value={[curFontSize]}
              onValueChange={([v]) => onChange({ fontSize: v })}
            />
            <div className="flex items-center gap-1 pt-0.5 flex-wrap">
              {[
                { label: '20px', value: 20 },
                { label: '28px', value: 28 },
                { label: '36px', value: 36 },
                { label: '50px (Chuẩn)', value: 50 },
                { label: '64px', value: 64 },
                { label: '80px', value: 80 }
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => onChange({ fontSize: p.value })}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border transition ${
                    curFontSize === p.value
                      ? 'border-sky-500 bg-sky-950/50 text-sky-300 ring-1 ring-sky-500'
                      : 'border-slate-800 text-slate-400 hover:text-slate-200 bg-slate-900/50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Font Weight */}
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Độ đậm chữ (Weight)</label>
            <div className="grid grid-cols-6 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[10px]">
              {[
                { id: '400', label: '400' },
                { id: '500', label: '500' },
                { id: '600', label: '600' },
                { id: '700', label: '700' },
                { id: '800', label: '800' },
                { id: '900', label: '900' }
              ].map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => onChange({ fontWeight: w.id })}
                  className={`py-1 rounded text-center font-semibold transition ${
                    curFontWeight === w.id
                      ? 'bg-sky-600 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Text Alignment */}
          {showAlignment && (
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Căn dòng chữ</label>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { id: 'left', label: 'Trái', icon: AlignLeft },
                  { id: 'center', label: 'Giữa', icon: AlignCenter },
                  { id: 'right', label: 'Phải', icon: AlignRight }
                ].map((a) => {
                  const Icon = a.icon;
                  const isCur = curTextAlign === a.id;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => onChange({ textAlign: a.id })}
                      className={`py-1.5 px-2 rounded-lg border font-semibold text-[11px] flex items-center justify-center gap-1 transition ${
                        isCur
                          ? 'border-sky-500 bg-sky-950/40 text-sky-300'
                          : 'border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon size={12} />
                      {a.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. Text Color */}
          {showColors && (
            <ColorControl
              label="Màu chữ (Text Color)"
              value={curTextColor}
              onChange={(val) => onChange({ textColor: val, color: val })}
            />
          )}

          {/* 6. Line Height & Letter Spacing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <SliderControl
              label="Giãn dòng (Line Height)"
              value={curLineHeight}
              min={1.0}
              max={2.5}
              step={0.05}
              unit="x"
              onChange={(v) => onChange({ lineHeight: v })}
              presets={[
                { label: 'Gọn 1.1x', value: 1.1 },
                { label: 'Chuẩn 1.35x', value: 1.35 },
                { label: 'Thoáng 1.6x', value: 1.6 }
              ]}
            />
            <SliderControl
              label="Giãn chữ (Letter Spacing)"
              value={curLetterSpacing}
              min={-2}
              max={10}
              step={0.5}
              unit="px"
              onChange={(v) => onChange({ letterSpacing: v })}
              presets={[
                { label: 'Khít 0px', value: 0 },
                { label: 'Vừa 1px', value: 1 },
                { label: 'Rộng 3px', value: 3 }
              ]}
            />
          </div>

          {/* 7. Text Stroke (Outline) */}
          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-[11px] text-slate-200 block">Viền chữ (Text Stroke / Outline)</span>
                <span className="text-[10px] text-slate-400">Tạo viền nổi bật chữ trên nền video</span>
              </div>
              <Switch
                checked={strokeEnabled}
                onCheckedChange={(val) => onChange({ textStrokeEnabled: val, textStrokeWidth: style?.textStrokeWidth || 2 })}
              />
            </div>
            {strokeEnabled && (
              <div className="space-y-2.5 pt-1 border-t border-slate-800/80">
                <SliderControl
                  label="Độ dày viền chữ (px)"
                  value={strokeWidth}
                  min={0.5}
                  max={10}
                  step={0.5}
                  unit="px"
                  onChange={(v) => onChange({ textStrokeWidth: v })}
                  presets={[
                    { label: 'Mảnh 1px', value: 1 },
                    { label: 'Chuẩn 2px', value: 2 },
                    { label: 'Đậm 4px', value: 4 }
                  ]}
                />
                <ColorControl
                  label="Màu viền chữ"
                  value={strokeColor}
                  onChange={(val) => onChange({ textStrokeColor: val })}
                />
              </div>
            )}
          </div>

          {/* 8. Text Shadow */}
          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-[11px] text-slate-200 block">Đổ bóng chữ (Text Shadow)</span>
                <span className="text-[10px] text-slate-400">Tạo chiều sâu và tách lớp cho văn bản</span>
              </div>
              <Switch
                checked={shadowEnabled}
                onCheckedChange={(val) => onChange({ textShadowEnabled: val, textShadowBlur: style?.textShadowBlur || 8, textShadowOffsetY: style?.textShadowOffsetY || 3 })}
              />
            </div>
            {shadowEnabled && (
              <div className="space-y-2.5 pt-1 border-t border-slate-800/80">
                <SliderControl
                  label="Độ mờ bóng (Blur)"
                  value={shadowBlur}
                  min={0}
                  max={30}
                  step={1}
                  unit="px"
                  onChange={(v) => onChange({ textShadowBlur: v })}
                />
                <div className="grid grid-cols-2 gap-2">
                  <SliderControl
                    label="Độ lệch X"
                    value={shadowX}
                    min={-15}
                    max={15}
                    step={1}
                    unit="px"
                    onChange={(v) => onChange({ textShadowOffsetX: v })}
                  />
                  <SliderControl
                    label="Độ lệch Y"
                    value={shadowY}
                    min={-15}
                    max={15}
                    step={1}
                    unit="px"
                    onChange={(v) => onChange({ textShadowOffsetY: v })}
                  />
                </div>
                <ColorControl
                  label="Màu bóng chữ"
                  value={shadowColor}
                  onChange={(val) => onChange({ textShadowColor: val })}
                />
              </div>
            )}
          </div>

          {/* 9. Opacity */}
          <SliderControl
            label="Độ trong suốt thành phần (Opacity)"
            value={curOpacity}
            min={10}
            max={100}
            step={5}
            unit="%"
            onChange={(v) => onChange({ opacity: v / 100 })}
            presets={[
              { label: 'Mờ 50%', value: 50 },
              { label: 'Rõ 85%', value: 85 },
              { label: 'Tối đa 100%', value: 100 }
            ]}
          />

          {/* 10. Position & Dimensions */}
          {showDimensions && (
            <div className="space-y-3 pt-2 border-t border-slate-800/80">
              <label className="text-[10px] text-slate-400 uppercase font-bold block">
                Vị trí & Kích thước (Tọa độ 9:16)
              </label>

              <SliderControl
                label="Vị trí X (%)"
                value={style?.x ?? 6}
                min={0}
                max={100}
                step={1}
                unit="%"
                onChange={(v) => onChange({ x: v })}
                presets={xPresets || [
                  { label: 'Trái (6%)', value: 6 },
                  { label: 'Giữa (50%)', value: 50 },
                  { label: 'Phải (85%)', value: 85 }
                ]}
              />

              <SliderControl
                label="Vị trí Y (%)"
                value={style?.y ?? 16}
                min={0}
                max={100}
                step={1}
                unit="%"
                onChange={(v) => onChange({ y: v })}
                presets={yPresets || [
                  { label: 'Đỉnh (12%)', value: 12 },
                  { label: 'Chuẩn (16%)', value: 16 },
                  { label: 'Giữa (50%)', value: 50 },
                  { label: 'Dưới (84%)', value: 84 }
                ]}
              />

              <SliderControl
                label="Chiều rộng (%)"
                value={style?.width ?? 88}
                min={10}
                max={100}
                step={1}
                unit="%"
                onChange={(v) => onChange({ width: v })}
                presets={widthPresets || [
                  { label: 'Nhỏ (50%)', value: 50 },
                  { label: 'Vừa (75%)', value: 75 },
                  { label: 'Chuẩn (88%)', value: 88 },
                  { label: 'Rộng (94%)', value: 94 }
                ]}
              />

              <SliderControl
                label="Chiều cao (%)"
                value={style?.height ?? 22}
                min={4}
                max={80}
                step={1}
                unit="%"
                onChange={(v) => onChange({ height: v })}
                presets={heightPresets || [
                  { label: 'Gọn (12%)', value: 12 },
                  { label: 'Chuẩn (22%)', value: 22 },
                  { label: 'Cao (36%)', value: 36 }
                ]}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export interface InspectorPanelProps {
  template: VideoTemplate;
  channel: Channel;
  language: LanguageCode;
  quiz?: Quiz;
  onQuizChange?: (quiz: Quiz) => void;
  onTemplateChange: (template: VideoTemplate) => void;
  onChannelChange: (channel: Channel) => void;
  onLanguageChange?: (lang: LanguageCode) => void;
  onApplyTemplate: (templateId: string) => void;
  selectedKey?: ComponentKey | string;
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
  // Top view mode: 'templates' or 'customize'
  const [panelMode, setPanelMode] = useState<'templates' | 'customize'>('customize');
  // Currently active component in 'customize' mode
  const [activeComp, setActiveComp] = useState<ComponentKey>(
    (selectedKey as ComponentKey) || 'questionBox'
  );
  // Accordion state for advanced settings
  const [isAdvancedOpen, setIsAdvancedOpen] = useState<boolean>(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Synchronize when external selectedKey changes (e.g. user clicked element in Preview Canvas)
  React.useEffect(() => {
    if (selectedKey) {
      const normalizedKey: ComponentKey =
        selectedKey === 'header' || selectedKey === 'questionNumber'
          ? 'quizTitle'
          : (selectedKey as ComponentKey);
      setActiveComp(normalizedKey);
      setPanelMode('customize');
    }
  }, [selectedKey]);

  const handleSelectComp = (key: ComponentKey) => {
    setActiveComp(key);
    onSelectKey?.(key);
  };

  // Helper to update specific component in template
  const updateComponent = (compKey: keyof VideoTemplate['components'], partial: any) => {
    const existing = (template.components as any)[compKey] || {};
    const updated = {
      ...template,
      components: {
        ...template.components,
        [compKey]: {
          ...existing,
          ...partial
        }
      }
    };
    onTemplateChange(updated);
  };

  // Helper to update timing
  const updateTiming = (partial: any) => {
    onTemplateChange({
      ...template,
      timing: {
        ...template.timing,
        ...partial
      }
    });
  };

  // Component definition metadata for selector pills
  const COMPONENT_TABS: { id: ComponentKey; label: string; icon: any }[] = [
    { id: 'background', label: 'Nền', icon: Sparkles },
    { id: 'quizTitle', label: 'Tiêu đề', icon: Heading },
    { id: 'questionBox', label: 'Câu hỏi', icon: HelpCircle },
    { id: 'answerButtons', label: 'Đáp án', icon: Layers },
    { id: 'countdown', label: 'Đếm ngược', icon: Clock },
    { id: 'explanation', label: 'Giải thích', icon: Type },
    { id: 'illustration', label: 'Minh họa', icon: ImageIcon },
    { id: 'brand_audio', label: 'Âm thanh & Brand', icon: Volume2 }
  ];

  const comps = template.components;
  const brand = channel.branding;

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 text-slate-200 text-xs select-none">
      {/* 1. TOP HEADER & MODE SWITCHER */}
      <div className="p-3 border-b border-slate-800 bg-slate-950/60 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sliders size={15} className="text-sky-400" />
            <span className="font-bold text-slate-100 uppercase tracking-wider text-[11px]">
              Inspector Studio
            </span>
          </div>
          <Badge variant="outline" className="text-[10px] text-sky-400 border-sky-500/30">
            {panelMode === 'templates' ? '2 Mẫu' : COMPONENT_TABS.find(t => t.id === activeComp)?.label}
          </Badge>
        </div>

        {/* Segmented control: Mẫu (2) vs Tùy chỉnh */}
        <div className="grid grid-cols-2 gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60">
          <button
            onClick={() => setPanelMode('templates')}
            className={`py-1.5 px-2 rounded-md font-semibold text-xs flex items-center justify-center gap-1.5 transition ${
              panelMode === 'templates'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layout size={13} />
            Mẫu dựng sẵn ({TEMPLATE_LIBRARY.length})
          </button>
          <button
            onClick={() => setPanelMode('customize')}
            className={`py-1.5 px-2 rounded-md font-semibold text-xs flex items-center justify-center gap-1.5 transition ${
              panelMode === 'customize'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders size={13} />
            Tùy chỉnh Component
          </button>
        </div>
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
        {/* ================================================================= */}
        {/* MODE A: TEMPLATE SELECTOR (ONLY TEMPLATE 1 & TEMPLATE 7)         */}
        {/* ================================================================= */}
        {panelMode === 'templates' && (
          <div className="space-y-3">
            <div className="text-[11px] text-slate-400">
              Chọn mẫu thiết kế dựng sẵn. Sau khi áp dụng, bạn có thể tùy chỉnh mọi thông số theo ý muốn:
            </div>

            <div className="grid grid-cols-1 gap-3">
              {TEMPLATE_LIBRARY.map((item) => {
                const isActive = template.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      onApplyTemplate(item.id);
                      setPanelMode('customize');
                    }}
                    className={`cursor-pointer rounded-xl border p-3 transition-all relative overflow-hidden ${
                      isActive
                        ? 'border-sky-500 bg-sky-950/20 ring-1 ring-sky-500 shadow-md'
                        : 'border-slate-800 bg-slate-800/40 hover:border-slate-700 hover:bg-slate-800/70'
                    }`}
                  >
                    {/* Header: Icon, Name & Tag */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{item.icon}</span>
                        <div>
                          <div className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                            {item.name}
                            {isActive && (
                              <span className="bg-sky-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                                Đang dùng
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">{item.tag}</div>
                        </div>
                      </div>
                    </div>

                    {/* Gradient preview banner */}
                    <div
                      className="h-10 rounded-lg border border-slate-700/50 mb-2 relative flex items-center justify-center overflow-hidden"
                      style={{ background: item.previewGradient }}
                    >
                      <div className="flex gap-1">
                        {item.accentColors.map((c, i) => (
                          <div
                            key={i}
                            className="w-4 h-4 rounded-full shadow-md border border-white/40"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                      {item.description}
                    </p>

                    {/* Action Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onApplyTemplate(item.id);
                        setPanelMode('customize');
                      }}
                      className={`w-full py-1.5 rounded-lg font-semibold text-xs transition flex items-center justify-center gap-1.5 ${
                        isActive
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                          : 'bg-slate-700 hover:bg-sky-600 text-white'
                      }`}
                    >
                      {isActive ? <Check size={13} /> : null}
                      {isActive ? 'Đang kích hoạt — Bấm để sửa' : 'Áp dụng mẫu này'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* MODE B: COMPONENT-BASED INSPECTOR                                */}
        {/* ================================================================= */}
        {panelMode === 'customize' && (
          <div className="space-y-4">
            {/* Component Selector Tabs */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Chọn thành phần để chỉnh sửa:
              </label>
              <div className="grid grid-cols-2 gap-1 bg-slate-950/60 p-1 rounded-lg border border-slate-800">
                {COMPONENT_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isSelected = activeComp === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleSelectComp(tab.id)}
                      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md font-medium text-[11px] transition text-left ${
                        isSelected
                          ? 'bg-sky-600 text-white font-semibold shadow'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      <Icon size={13} className={isSelected ? 'text-white' : 'text-slate-400'} />
                      <span className="truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* 1. COMPONENT: BACKGROUND (NỀN ĐỘNG / TĨNH)                   */}
            {/* ------------------------------------------------------------- */}
            {activeComp === 'background' && (
              <div className="space-y-4">
                <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 space-y-3">
                  <div className="font-bold text-slate-100 text-xs flex items-center justify-between">
                    <span>Loại Background</span>
                    <Badge variant="outline" className="text-[10px] text-sky-400 border-sky-500/30">
                      {comps.background?.type || 'gradient'}
                    </Badge>
                  </div>

                  {/* Background Type Selector */}
                  <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
                    {[
                      { id: 'gradient', label: 'Gradient' },
                      { id: 'neon', label: 'Neon Động' },
                      { id: 'solid', label: 'Màu Đơn' },
                      { id: 'image', label: 'Ảnh Nền' }
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => updateComponent('background', { type: t.id })}
                        className={`py-1 rounded text-center font-medium transition ${
                          (comps.background?.type || 'gradient') === t.id
                            ? 'bg-sky-600 text-white font-bold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* IF NEON ANIMATED BACKGROUND */}
                  {comps.background?.type === 'neon' && (
                    <div className="space-y-3 pt-2 border-t border-slate-700/60">
                      <label className="text-[11px] font-bold text-sky-300 block">
                        Chọn Preset Neon Động:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {NEON_PRESETS.map((p) => {
                          const isCur = (comps.background?.neonPresetId || 'neon-gradient') === p.id;
                          return (
                            <button
                              key={p.id}
                              onClick={() => updateComponent('background', { neonPresetId: p.id })}
                              className={`p-2 rounded-lg border text-left transition flex flex-col gap-1 ${
                                isCur
                                  ? 'border-sky-500 bg-sky-950/30 ring-1 ring-sky-500'
                                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm">{p.icon}</span>
                                <span className="text-[9px] text-sky-400 font-bold">{p.tag}</span>
                              </div>
                              <div className="font-semibold text-slate-200 text-[11px] truncate">
                                {p.name}
                              </div>
                              <div
                                className="h-2 rounded-full w-full"
                                style={{ background: p.gradientPreview }}
                              />
                            </button>
                          );
                        })}
                      </div>

                      {/* Neon Controls: Speed, Intensity, Direction, Movement, Zoom, Blur, Opacity */}
                      <div className="space-y-3 pt-2">
                        {/* Speed */}
                        <div>
                          <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                            <span>Tốc độ chuyển động (Speed)</span>
                            <span className="font-bold text-sky-400">
                              {(comps.background?.neonSpeed ?? 1.0).toFixed(1)}x
                            </span>
                          </div>
                          <Slider
                            min={0.2}
                            max={3.0}
                            step={0.1}
                            value={[comps.background?.neonSpeed ?? 1.0]}
                            onValueChange={([v]) => updateComponent('background', { neonSpeed: v })}
                          />
                        </div>

                        {/* Intensity */}
                        <div>
                          <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                            <span>Độ rực rỡ (Intensity)</span>
                            <span className="font-bold text-sky-400">
                              {Math.round((comps.background?.neonIntensity ?? 1.0) * 100)}%
                            </span>
                          </div>
                          <Slider
                            min={0.2}
                            max={2.5}
                            step={0.1}
                            value={[comps.background?.neonIntensity ?? 1.0]}
                            onValueChange={([v]) => updateComponent('background', { neonIntensity: v })}
                          />
                        </div>

                        {/* Direction */}
                        <div>
                          <label className="text-[11px] text-slate-300 block mb-1">Hướng chuyển động</label>
                          <div className="grid grid-cols-4 gap-1">
                            {[
                              { id: 'down', label: 'Xuống' },
                              { id: 'up', label: 'Lên' },
                              { id: 'left', label: 'Trái' },
                              { id: 'right', label: 'Phải' }
                            ].map((dir) => (
                              <button
                                key={dir.id}
                                onClick={() => {
                                  const curMotion = comps.background?.motion || {};
                                  updateComponent('background', {
                                    motion: { ...curMotion, direction: dir.id }
                                  });
                                }}
                                className={`py-1 rounded text-center text-[10px] font-semibold border ${
                                  (comps.background?.motion?.direction || 'down') === dir.id
                                    ? 'border-sky-500 bg-sky-950/40 text-sky-300'
                                    : 'border-slate-800 text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                {dir.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Movement Amplitude */}
                        <div>
                          <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                            <span>Biên độ dao động (Movement)</span>
                            <span className="font-bold text-sky-400">
                              {comps.background?.motion?.movement ?? 25}
                            </span>
                          </div>
                          <Slider
                            min={5}
                            max={60}
                            step={1}
                            value={[comps.background?.motion?.movement ?? 25]}
                            onValueChange={([v]) => {
                              const curMotion = comps.background?.motion || {};
                              updateComponent('background', {
                                motion: { ...curMotion, movement: v }
                              });
                            }}
                          />
                        </div>

                        {/* Zoom Scale */}
                        <div>
                          <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                            <span>Độ phóng to (Zoom Scale)</span>
                            <span className="font-bold text-sky-400">
                              {(comps.background?.motion?.zoomScale ?? 1.0).toFixed(2)}x
                            </span>
                          </div>
                          <Slider
                            min={1.0}
                            max={2.0}
                            step={0.05}
                            value={[comps.background?.motion?.zoomScale ?? 1.0]}
                            onValueChange={([v]) => {
                              const curMotion = comps.background?.motion || {};
                              updateComponent('background', {
                                motion: { ...curMotion, zoomScale: v }
                              });
                            }}
                          />
                        </div>

                        {/* Blur */}
                        <div>
                          <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                            <span>Làm mờ (Blur)</span>
                            <span className="font-bold text-sky-400">
                              {comps.background?.blur ?? 0}px
                            </span>
                          </div>
                          <Slider
                            min={0}
                            max={20}
                            step={1}
                            value={[comps.background?.blur ?? 0]}
                            onValueChange={([v]) => updateComponent('background', { blur: v })}
                          />
                        </div>

                        {/* Opacity */}
                        <div>
                          <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                            <span>Độ trong suốt (Opacity)</span>
                            <span className="font-bold text-sky-400">
                              {Math.round((comps.background?.opacity ?? 1.0) * 100)}%
                            </span>
                          </div>
                          <Slider
                            min={20}
                            max={100}
                            step={5}
                            value={[Math.round((comps.background?.opacity ?? 1.0) * 100)]}
                            onValueChange={([v]) => updateComponent('background', { opacity: v / 100 })}
                          />
                        </div>

                        {/* Colors */}
                        <div className="grid grid-cols-3 gap-2 pt-1">
                          <div>
                            <span className="text-[10px] text-slate-400 block mb-1">Màu 1</span>
                            <input
                              type="color"
                              value={comps.background?.neonColor1 || '#00f0ff'}
                              onChange={(e) => updateComponent('background', { neonColor1: e.target.value })}
                              className="w-full h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block mb-1">Màu 2</span>
                            <input
                              type="color"
                              value={comps.background?.neonColor2 || '#ff007f'}
                              onChange={(e) => updateComponent('background', { neonColor2: e.target.value })}
                              className="w-full h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block mb-1">Màu 3</span>
                            <input
                              type="color"
                              value={comps.background?.neonColor3 || '#7928ca'}
                              onChange={(e) => updateComponent('background', { neonColor3: e.target.value })}
                              className="w-full h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* IF GRADIENT BACKGROUND */}
                  {comps.background?.type === 'gradient' && (
                    <div className="space-y-3 pt-2 border-t border-slate-700/60">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] text-slate-400 block mb-1">Màu chính</span>
                          <input
                            type="color"
                            value={comps.background?.backgroundColor || '#f8fafc'}
                            onChange={(e) => updateComponent('background', { backgroundColor: e.target.value })}
                            className="w-full h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block mb-1">Màu phụ</span>
                          <input
                            type="color"
                            value={comps.background?.secondaryColor || '#e0f2fe'}
                            onChange={(e) => updateComponent('background', { secondaryColor: e.target.value })}
                            className="w-full h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                          <span>Góc Gradient (Góc xoay)</span>
                          <span className="font-bold text-sky-400">{comps.background?.gradientAngle ?? 135}°</span>
                        </div>
                        <Slider
                          min={0}
                          max={360}
                          step={5}
                          value={[comps.background?.gradientAngle ?? 135]}
                          onValueChange={([v]) => updateComponent('background', { gradientAngle: v })}
                        />
                      </div>
                    </div>
                  )}

                  {/* IF SOLID BACKGROUND */}
                  {comps.background?.type === 'solid' && (
                    <div className="space-y-2 pt-2 border-t border-slate-700/60">
                      <span className="text-[10px] text-slate-400 block mb-1">Màu nền đơn</span>
                      <input
                        type="color"
                        value={comps.background?.backgroundColor || '#0f172a'}
                        onChange={(e) => updateComponent('background', { backgroundColor: e.target.value })}
                        className="w-full h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                      />
                    </div>
                  )}

                  {/* IF IMAGE BACKGROUND */}
                  {comps.background?.type === 'image' && (
                    <div className="space-y-3 pt-2 border-t border-slate-700/60">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">URL ảnh nền</label>
                        <Input
                          value={comps.background?.imageUrl || ''}
                          onChange={(e) => updateComponent('background', { imageUrl: e.target.value })}
                          placeholder="https://... hoặc đường dẫn ảnh"
                          className="h-7 text-xs bg-slate-950 border-slate-800"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* 2. COMPONENT: COUNTDOWN (ĐỒNG HỒ ĐẾM NGƯỢC - 12 STYLES)      */}
            {/* ------------------------------------------------------------- */}
            {activeComp === 'countdown' && (
              <div className="space-y-4">
                <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 space-y-3">
                  {/* Toggle show/hide */}
                  <div className="flex items-center justify-between pb-1 border-b border-slate-700/60">
                    <div>
                      <span className="font-bold text-slate-100 text-xs block">Hiển thị Countdown Timer</span>
                      <span className="text-[10px] text-slate-400">Đồng hồ đếm ngược kịch tính cho câu hỏi</span>
                    </div>
                    <Switch
                      checked={(comps.countdown as any)?.show !== false && comps.countdown?.enabled !== false}
                      onCheckedChange={(val) => updateComponent('countdown', { show: val, enabled: val })}
                    />
                  </div>

                  {/* 12 COUNTDOWN STYLES GALLERY */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                        Thư viện 12 Kiểu Đếm Ngược (Styles)
                      </label>
                      <span className="text-[10px] text-sky-400 font-bold">
                        {COUNTDOWN_STYLES.find(s => s.id === (comps.countdown?.countdownStyle || template.countdownStyle))?.name || 'Circular Progress'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                      {COUNTDOWN_STYLES.map((s) => {
                        const isCur = (comps.countdown?.countdownStyle || template.countdownStyle) === s.id;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              updateComponent('countdown', { countdownStyle: s.id });
                              onTemplateChange({ ...template, countdownStyle: s.id as any });
                            }}
                            className={`p-2 rounded-lg border text-left transition flex flex-col gap-1 ${
                              isCur
                                ? 'border-sky-500 bg-sky-950/40 ring-1 ring-sky-500'
                                : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-base">{s.icon}</span>
                              <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                                isCur ? 'bg-sky-500/20 text-sky-300' : 'bg-slate-800 text-slate-400'
                              }`}>
                                {s.tag}
                              </span>
                            </div>
                            <div className="font-bold text-slate-200 text-[11px] truncate">
                              {s.name}
                            </div>
                            <div className="text-[9px] text-slate-400 line-clamp-1 leading-tight">
                              {s.desc}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Horizontal Alignment */}
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Căn lề ngang</label>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { id: 'left', label: 'Trái', icon: AlignLeft },
                        { id: 'center', label: 'Giữa (Center)', icon: AlignCenter },
                        { id: 'right', label: 'Phải', icon: AlignRight }
                      ].map((al) => {
                        const Icon = al.icon;
                        const isCur = (comps.countdown?.horizontalAlign || 'center') === al.id;
                        return (
                          <button
                            key={al.id}
                            type="button"
                            onClick={() => updateComponent('countdown', { horizontalAlign: al.id })}
                            className={`py-1.5 px-2 rounded-lg border font-semibold text-[11px] flex items-center justify-center gap-1 transition ${
                              isCur
                                ? 'border-sky-500 bg-sky-950/40 text-sky-300'
                                : 'border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <Icon size={12} />
                            {al.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Vertical Alignment */}
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Căn lề dọc</label>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { id: 'top', label: 'Trên', icon: AlignVerticalJustifyStart },
                        { id: 'center', label: 'Giữa (Center)', icon: AlignVerticalJustifyCenter },
                        { id: 'bottom', label: 'Đáy', icon: AlignVerticalJustifyEnd }
                      ].map((al) => {
                        const Icon = al.icon;
                        const isCur = (comps.countdown?.verticalAlign || 'center') === al.id;
                        return (
                          <button
                            key={al.id}
                            type="button"
                            onClick={() => updateComponent('countdown', { verticalAlign: al.id })}
                            className={`py-1.5 px-2 rounded-lg border font-semibold text-[11px] flex items-center justify-center gap-1 transition ${
                              isCur
                                ? 'border-sky-500 bg-sky-950/40 text-sky-300'
                                : 'border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <Icon size={12} />
                            {al.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Toggles: showSeconds, showProgressBar, showBackground, showBorder */}
                  <div className="pt-2 border-t border-slate-700/60 space-y-2">
                    <label className="text-[10px] text-slate-400 uppercase font-bold block">
                      Tùy chọn hiển thị chi tiết
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                        <span className="text-[10px] text-slate-300 font-medium">Hiện số giây</span>
                        <Switch
                          checked={comps.countdown?.showSeconds !== false}
                          onCheckedChange={(val) => updateComponent('countdown', { showSeconds: val })}
                        />
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                        <span className="text-[10px] text-slate-300 font-medium">Hiện tiến trình bar</span>
                        <Switch
                          checked={comps.countdown?.showProgressBar !== false}
                          onCheckedChange={(val) => updateComponent('countdown', { showProgressBar: val })}
                        />
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                        <span className="text-[10px] text-slate-300 font-medium">Hiện nền (Background)</span>
                        <Switch
                          checked={comps.countdown?.showBackground !== false}
                          onCheckedChange={(val) => updateComponent('countdown', { showBackground: val })}
                        />
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                        <span className="text-[10px] text-slate-300 font-medium">Hiện viền (Border)</span>
                        <Switch
                          checked={comps.countdown?.showBorder !== false}
                          onCheckedChange={(val) => updateComponent('countdown', { showBorder: val })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Colors Grid */}
                  <div className="pt-2 border-t border-slate-700/60 space-y-2">
                    <label className="text-[10px] text-slate-400 uppercase font-bold block">
                      Màu sắc Countdown
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <ColorControl
                        label="Màu số đếm (Color)"
                        value={comps.countdown?.color || '#2563eb'}
                        onChange={(val) => updateComponent('countdown', { color: val })}
                      />
                      <ColorControl
                        label="Màu thanh tiến trình (Progress)"
                        value={comps.countdown?.progressColor || comps.countdown?.color || '#2563eb'}
                        onChange={(val) => updateComponent('countdown', { progressColor: val })}
                      />
                      <ColorControl
                        label="Màu cảnh báo (≤ 2 giây)"
                        value={comps.countdown?.warningColor || '#ef4444'}
                        onChange={(val) => updateComponent('countdown', { warningColor: val })}
                      />
                      <ColorControl
                        label="Màu nền Countdown"
                        value={comps.countdown?.backgroundColor || '#ffffff'}
                        onChange={(val) => updateComponent('countdown', { backgroundColor: val })}
                      />
                      <ColorControl
                        label="Màu đường viền"
                        value={comps.countdown?.borderColor || '#bfdbfe'}
                        onChange={(val) => updateComponent('countdown', { borderColor: val })}
                      />
                    </div>
                  </div>

                  {/* Dimensions & Thickness */}
                  <div className="space-y-3 pt-2 border-t border-slate-700/60">
                    <label className="text-[10px] text-slate-400 uppercase font-bold block">
                      Kích thước & Vị trí (Mặc định ở chính giữa khung 9:16)
                    </label>

                    <SliderControl
                      label="Vị trí X (%) (Mặc định chính giữa 50%)"
                      value={comps.countdown?.x ?? 50}
                      min={0}
                      max={100}
                      step={1}
                      unit="%"
                      onChange={(v) => updateComponent('countdown', { x: v })}
                      presets={[
                        { label: 'Trái (15%)', value: 15 },
                        { label: 'Chính giữa (50%)', value: 50 },
                        { label: 'Phải (85%)', value: 85 }
                      ]}
                    />

                    <SliderControl
                      label="Vị trí Y (%) (Mặc định chính giữa 50%)"
                      value={comps.countdown?.y ?? 50}
                      min={0}
                      max={100}
                      step={1}
                      unit="%"
                      onChange={(v) => updateComponent('countdown', { y: v })}
                      presets={[
                        { label: 'Đỉnh (14%)', value: 14 },
                        { label: 'Chính giữa (50%)', value: 50 },
                        { label: 'Dưới (86%)', value: 86 }
                      ]}
                    />

                    <SliderControl
                      label="Chiều rộng (%)"
                      value={comps.countdown?.width ?? 32}
                      min={10}
                      max={100}
                      step={1}
                      unit="%"
                      onChange={(v) => updateComponent('countdown', { width: v })}
                      presets={[
                        { label: 'Gọn (25%)', value: 25 },
                        { label: 'Chuẩn (32%)', value: 32 },
                        { label: 'Rộng (50%)', value: 50 }
                      ]}
                    />

                    <SliderControl
                      label="Chiều cao (%)"
                      value={comps.countdown?.height ?? 8}
                      min={3}
                      max={30}
                      step={1}
                      unit="%"
                      onChange={(v) => updateComponent('countdown', { height: v })}
                      presets={[
                        { label: 'Mảnh (5%)', value: 5 },
                        { label: 'Chuẩn (8%)', value: 8 },
                        { label: 'Dày (14%)', value: 14 }
                      ]}
                    />

                    <SliderControl
                      label="Độ dày thanh / nét (px)"
                      value={comps.countdown?.thickness ?? comps.countdown?.strokeWidth ?? 8}
                      min={2}
                      max={24}
                      step={1}
                      unit="px"
                      onChange={(v) => updateComponent('countdown', { thickness: v, strokeWidth: v })}
                      presets={[
                        { label: 'Mảnh 4px', value: 4 },
                        { label: 'Chuẩn 8px', value: 8 },
                        { label: 'Dày 14px', value: 14 }
                      ]}
                    />

                    <SliderControl
                      label="Cỡ chữ số (px)"
                      value={comps.countdown?.fontSize ?? 28}
                      min={14}
                      max={72}
                      step={1}
                      unit="px"
                      onChange={(v) => updateComponent('countdown', { fontSize: v })}
                      presets={[
                        { label: '20px', value: 20 },
                        { label: '28px', value: 28 },
                        { label: '36px', value: 36 },
                        { label: '50px', value: 50 },
                        { label: '64px', value: 64 }
                      ]}
                    />

                    <SliderControl
                      label="Độ trong suốt (Opacity)"
                      value={comps.countdown?.opacity !== undefined ? Math.round(comps.countdown.opacity * 100) : 100}
                      min={20}
                      max={100}
                      step={5}
                      unit="%"
                      onChange={(v) => updateComponent('countdown', { opacity: v / 100 })}
                    />
                  </div>
                </div>

                {/* Typography Font cho Countdown */}
                <TypographyControlSection
                  title="Typography & Font Countdown"
                  style={comps.countdown || {}}
                  onChange={(patch) => updateComponent('countdown', patch)}
                  defaultFontSize={28}
                  showDimensions={false}
                  showColors={false}
                />
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* 3. COMPONENT: QUESTION BOX (KHUNG CÂU HỎI)                   */}
            {/* ------------------------------------------------------------- */}
            {activeComp === 'questionBox' && (
              <div className="space-y-4">
                {/* 1. Typography & Text Styling (Default: Montserrat 50px) */}
                <TypographyControlSection
                  title="Typography & Chữ Câu Hỏi"
                  style={comps.questionBox || {}}
                  onChange={(patch) => updateComponent('questionBox', patch)}
                  defaultFontSize={50}
                  allowShadowDefaultOff={false}
                  showDimensions={true}
                  showAlignment={true}
                  showColors={true}
                  xPresets={[
                    { label: 'Căn giữa (6%)', value: 6 },
                    { label: 'Sát mép (2%)', value: 2 },
                    { label: 'Thu lề (10%)', value: 10 }
                  ]}
                  yPresets={[
                    { label: 'Cao (10%)', value: 10 },
                    { label: 'Chuẩn (16%)', value: 16 },
                    { label: 'Hạ thấp (24%)', value: 24 }
                  ]}
                  widthPresets={[
                    { label: 'Vừa (75%)', value: 75 },
                    { label: 'Chuẩn (88%)', value: 88 },
                    { label: 'Tràn viền (94%)', value: 94 }
                  ]}
                  heightPresets={[
                    { label: 'Gọn (16%)', value: 16 },
                    { label: 'Chuẩn (22%)', value: 22 },
                    { label: 'Rộng (28%)', value: 28 }
                  ]}
                />

                {/* 2. Shape, Background & Border of Question Box */}
                <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 space-y-3">
                  <span className="font-bold text-slate-100 text-xs block">Khung Nền & Viền Câu Hỏi</span>

                  {/* Shape */}
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Hình khối khung (Shape)</label>
                    <div className="grid grid-cols-5 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[10px]">
                      {[
                        { id: 'rounded', label: 'Bo góc' },
                        { id: 'banner-pointed', label: 'Lục giác' },
                        { id: 'speech-bubble', label: 'Thoại' },
                        { id: 'pill', label: 'Capsule' },
                        { id: 'pop-art', label: 'Pop Art' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => updateComponent('questionBox', { shape: item.id as any })}
                          className={`py-1 rounded text-center font-semibold transition ${
                            (comps.questionBox?.shape || 'rounded') === item.id
                              ? 'bg-sky-600 text-white font-bold'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Colors: Background & Border */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <ColorControl
                      label="Màu nền khung"
                      value={comps.questionBox?.backgroundColor || '#ffffff'}
                      onChange={(val) => updateComponent('questionBox', { backgroundColor: val })}
                    />
                    <ColorControl
                      label="Màu đường viền"
                      value={comps.questionBox?.borderColor || '#bfdbfe'}
                      onChange={(val) => updateComponent('questionBox', { borderColor: val })}
                    />
                  </div>

                  {/* Sliders: Border Width & Border Radius */}
                  <div className="space-y-3 pt-1">
                    <SliderControl
                      label="Độ dày viền khung (px)"
                      value={comps.questionBox?.borderWidth ?? 2}
                      min={0}
                      max={10}
                      step={0.5}
                      unit="px"
                      onChange={(v) => updateComponent('questionBox', { borderWidth: v })}
                      presets={[
                        { label: 'Không viền', value: 0 },
                        { label: 'Mỏng 1.5px', value: 1.5 },
                        { label: 'Chuẩn 2.5px', value: 2.5 },
                        { label: 'Đậm 4px', value: 4 }
                      ]}
                    />

                    <SliderControl
                      label="Bo góc khung (Border Radius)"
                      value={comps.questionBox?.borderRadius ?? 20}
                      min={0}
                      max={45}
                      step={1}
                      unit="px"
                      onChange={(v) => updateComponent('questionBox', { borderRadius: v })}
                      presets={[
                        { label: 'Vuông (0px)', value: 0 },
                        { label: 'Bo nhẹ (12px)', value: 12 },
                        { label: 'Bo tròn (20px)', value: 20 },
                        { label: 'Viên thuốc (35px)', value: 35 }
                      ]}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* 4. COMPONENT: ANSWER BUTTONS (CÁC ĐÁP ÁN)                   */}
            {/* ------------------------------------------------------------- */}
            {activeComp === 'answerButtons' && (
              <div className="space-y-4">
                {/* 1. Typography & Text Styling for Answers (Default: Montserrat 36px, Shadow OFF by default) */}
                <TypographyControlSection
                  title="Typography & Chữ Đáp Án"
                  style={comps.answerButtons || {}}
                  onChange={(patch) => updateComponent('answerButtons', patch)}
                  defaultFontSize={36}
                  allowShadowDefaultOff={true}
                  showDimensions={true}
                  showAlignment={true}
                  showColors={true}
                  xPresets={[
                    { label: 'Căn giữa (6%)', value: 6 },
                    { label: 'Sát mép (2%)', value: 2 },
                    { label: 'Thu lề (10%)', value: 10 }
                  ]}
                  yPresets={[
                    { label: 'Cao (35%)', value: 35 },
                    { label: 'Chuẩn (43%)', value: 43 },
                    { label: 'Hạ thấp (52%)', value: 52 }
                  ]}
                  widthPresets={[
                    { label: 'Vừa (75%)', value: 75 },
                    { label: 'Chuẩn (88%)', value: 88 },
                    { label: 'Rộng (94%)', value: 94 }
                  ]}
                  heightPresets={[
                    { label: 'Gọn (30%)', value: 30 },
                    { label: 'Chuẩn (38%)', value: 38 },
                    { label: 'Cao (48%)', value: 48 }
                  ]}
                />

                {/* 2. Shape, Background & Card Styling for Answers */}
                <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 space-y-3">
                  <span className="font-bold text-slate-100 text-xs block">Khung Nút & Bố Cục Đáp Án</span>

                  {/* Shape */}
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Hình khối nút (Shape)</label>
                    <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[10px]">
                      {[
                        { id: 'pill', label: 'Capsule' },
                        { id: 'rounded', label: 'Bo góc' },
                        { id: 'bubble', label: 'Bong bóng' },
                        { id: 'pop-art', label: 'Pop Art' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => updateComponent('answerButtons', { shape: item.id as any })}
                          className={`py-1 rounded text-center font-semibold transition ${
                            (comps.answerButtons?.shape || 'rounded') === item.id
                              ? 'bg-sky-600 text-white font-bold'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Colors: Background & Border */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <ColorControl
                      label="Màu nền nút đáp án"
                      value={comps.answerButtons?.backgroundColor || '#ffffff'}
                      onChange={(val) => updateComponent('answerButtons', { backgroundColor: val })}
                    />
                    <ColorControl
                      label="Màu viền nút đáp án"
                      value={comps.answerButtons?.borderColor || '#bfdbfe'}
                      onChange={(val) => updateComponent('answerButtons', { borderColor: val })}
                    />
                  </div>

                  {/* Sliders: Gap, Border Width, Border Radius */}
                  <div className="space-y-3 pt-1">
                    <SliderControl
                      label="Khoảng cách giữa các đáp án (px)"
                      value={comps.answerButtons?.gap ?? 12}
                      min={4}
                      max={30}
                      step={1}
                      unit="px"
                      onChange={(v) => updateComponent('answerButtons', { gap: v })}
                      presets={[
                        { label: 'Hẹp 8px', value: 8 },
                        { label: 'Chuẩn 12px', value: 12 },
                        { label: 'Rộng 18px', value: 18 }
                      ]}
                    />

                    <SliderControl
                      label="Độ dày viền nút (px)"
                      value={comps.answerButtons?.borderWidth ?? 2}
                      min={0}
                      max={8}
                      step={0.5}
                      unit="px"
                      onChange={(v) => updateComponent('answerButtons', { borderWidth: v })}
                      presets={[
                        { label: 'Không viền', value: 0 },
                        { label: 'Mỏng 1.5px', value: 1.5 },
                        { label: 'Chuẩn 2px', value: 2 },
                        { label: 'Đậm 3.5px', value: 3.5 }
                      ]}
                    />

                    <SliderControl
                      label="Bo góc nút (Border Radius)"
                      value={comps.answerButtons?.borderRadius ?? 18}
                      min={0}
                      max={40}
                      step={1}
                      unit="px"
                      onChange={(v) => updateComponent('answerButtons', { borderRadius: v })}
                      presets={[
                        { label: 'Vuông (0px)', value: 0 },
                        { label: 'Bo nhẹ (12px)', value: 12 },
                        { label: 'Bo tròn (18px)', value: 18 },
                        { label: 'Viên thuốc (35px)', value: 35 }
                      ]}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* 5. COMPONENT: QUIZ TITLE & HEADER                           */}
            {/* ------------------------------------------------------------- */}
            {activeComp === 'quizTitle' && (
              <div className="space-y-4">
                {/* 1. Tiêu đề tùy chỉnh */}
                <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 space-y-2">
                  <span className="font-bold text-slate-100 text-xs block">Nội dung Tiêu Đề (Header)</span>
                  <Input
                    value={comps.quizTitle?.text || ''}
                    placeholder="Để trống sẽ lấy tên Quiz mặc định..."
                    onChange={(e) => updateComponent('quizTitle', { text: e.target.value })}
                    className="h-8 text-xs bg-slate-950 border-slate-700/80 text-slate-100"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    * Tiêu đề hiển thị cố định ở đầu mỗi video để thu hút người xem
                  </span>
                </div>

                {/* 2. Typography & Chữ */}
                <TypographyControlSection
                  title="Typography & Chữ Tiêu Đề"
                  style={comps.quizTitle || {}}
                  onChange={(patch) => updateComponent('quizTitle', patch)}
                  defaultFontSize={28}
                  allowShadowDefaultOff={false}
                  showDimensions={true}
                  showAlignment={true}
                  showColors={true}
                  xPresets={[
                    { label: 'Trái (6%)', value: 6 },
                    { label: 'Giữa (50%)', value: 50 },
                    { label: 'Phải (70%)', value: 70 }
                  ]}
                  yPresets={[
                    { label: 'Đỉnh (4%)', value: 4 },
                    { label: 'Chuẩn (6%)', value: 6 },
                    { label: 'Hạ (10%)', value: 10 }
                  ]}
                  widthPresets={[
                    { label: 'Vừa (70%)', value: 70 },
                    { label: 'Chuẩn (86%)', value: 86 },
                    { label: 'Tràn viền (94%)', value: 94 }
                  ]}
                  heightPresets={[
                    { label: 'Mảnh (5%)', value: 5 },
                    { label: 'Chuẩn (6%)', value: 6 },
                    { label: 'Dày (8%)', value: 8 }
                  ]}
                />

                {/* 3. Khung Nền & Viền Huy Hiệu */}
                <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 space-y-3">
                  <span className="font-bold text-slate-100 text-xs block">Huy Hiệu Nền & Viền Tiêu Đề</span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <ColorControl
                      label="Màu nền huy hiệu"
                      value={comps.quizTitle?.backgroundColor || '#ffffff'}
                      onChange={(val) => updateComponent('quizTitle', { backgroundColor: val })}
                    />
                    <ColorControl
                      label="Màu viền huy hiệu"
                      value={comps.quizTitle?.borderColor || '#bfdbfe'}
                      onChange={(val) => updateComponent('quizTitle', { borderColor: val })}
                    />
                  </div>

                  <div className="space-y-3 pt-1">
                    <SliderControl
                      label="Độ dày viền (px)"
                      value={comps.quizTitle?.borderWidth ?? 1}
                      min={0}
                      max={6}
                      step={0.5}
                      unit="px"
                      onChange={(v) => updateComponent('quizTitle', { borderWidth: v })}
                      presets={[
                        { label: 'Không viền', value: 0 },
                        { label: 'Mảnh 1px', value: 1 },
                        { label: 'Dày 2.5px', value: 2.5 }
                      ]}
                    />

                    <SliderControl
                      label="Bo góc huy hiệu (Border Radius)"
                      value={comps.quizTitle?.borderRadius ?? 16}
                      min={0}
                      max={35}
                      step={1}
                      unit="px"
                      onChange={(v) => updateComponent('quizTitle', { borderRadius: v })}
                      presets={[
                        { label: 'Vuông (0px)', value: 0 },
                        { label: 'Bo nhẹ (10px)', value: 10 },
                        { label: 'Bo tròn (16px)', value: 16 },
                        { label: 'Viên thuốc (30px)', value: 30 }
                      ]}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* 6. COMPONENT: EXPLANATION (GIẢI THÍCH)                      */}
            {/* ------------------------------------------------------------- */}
            {activeComp === 'explanation' && (
              <div className="space-y-4">
                {/* 1. Toggles: Hiển thị & TTS */}
                <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-100 text-xs block">Hiển thị Thẻ Giải Thích</span>
                      <span className="text-[10px] text-slate-400">Xuất hiện ngay sau khi công bố đáp án đúng</span>
                    </div>
                    <Switch
                      checked={comps.explanation?.enabled !== false}
                      onCheckedChange={(val) => updateComponent('explanation', { enabled: val })}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-700/60">
                    <div>
                      <span className="font-bold text-slate-200 text-xs block">Đọc TTS phần Giải thích</span>
                      <span className="text-[10px] text-slate-400">Tự động phát giọng đọc giải thích (nếu có)</span>
                    </div>
                    <Switch
                      checked={comps.explanation?.readTts !== false}
                      onCheckedChange={(val) => updateComponent('explanation', { readTts: val })}
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-700/60">
                    <SliderControl
                      label="Thời lượng hiển thị giải thích (giây)"
                      value={comps.explanation?.displayDurationSec ?? 3.0}
                      min={1.5}
                      max={8.0}
                      step={0.5}
                      unit="s"
                      onChange={(v) => updateComponent('explanation', { displayDurationSec: v })}
                      presets={[
                        { label: 'Nhanh (2s)', value: 2 },
                        { label: 'Vừa (3s)', value: 3 },
                        { label: 'Đầy đủ (4s)', value: 4 },
                        { label: 'Dài (5s)', value: 5 }
                      ]}
                    />
                  </div>
                </div>

                {/* 2. Typography & Chữ */}
                <TypographyControlSection
                  title="Typography & Chữ Giải Thích"
                  style={comps.explanation || {}}
                  onChange={(patch) => updateComponent('explanation', patch)}
                  defaultFontSize={24}
                  allowShadowDefaultOff={false}
                  showDimensions={true}
                  showAlignment={true}
                  showColors={true}
                  xPresets={[
                    { label: 'Căn giữa (6%)', value: 6 },
                    { label: 'Sát mép (2%)', value: 2 },
                    { label: 'Thu lề (10%)', value: 10 }
                  ]}
                  yPresets={[
                    { label: 'Cao (75%)', value: 75 },
                    { label: 'Chuẩn (83%)', value: 83 },
                    { label: 'Đáy (90%)', value: 90 }
                  ]}
                  widthPresets={[
                    { label: 'Vừa (75%)', value: 75 },
                    { label: 'Chuẩn (88%)', value: 88 },
                    { label: 'Tràn viền (94%)', value: 94 }
                  ]}
                  heightPresets={[
                    { label: 'Gọn (8%)', value: 8 },
                    { label: 'Chuẩn (10%)', value: 10 },
                    { label: 'Rộng (14%)', value: 14 }
                  ]}
                />

                {/* 3. Khung Thẻ Giải Thích */}
                <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 space-y-3">
                  <span className="font-bold text-slate-100 text-xs block">Khung Nền & Viền Thẻ Giải Thích</span>

                  <div className="flex items-center justify-between pb-1 border-b border-slate-700/60">
                    <span className="text-[11px] text-slate-300 font-medium">Hiện Icon bóng đèn (💡)</span>
                    <Switch
                      checked={comps.explanation?.showIcon !== false}
                      onCheckedChange={(val) => updateComponent('explanation', { showIcon: val })}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <ColorControl
                      label="Màu nền khung"
                      value={comps.explanation?.backgroundColor || '#ffffff'}
                      onChange={(val) => updateComponent('explanation', { backgroundColor: val })}
                    />
                    <ColorControl
                      label="Màu đường viền"
                      value={comps.explanation?.borderColor || '#22c55e'}
                      onChange={(val) => updateComponent('explanation', { borderColor: val })}
                    />
                  </div>

                  <div className="space-y-3 pt-1">
                    <SliderControl
                      label="Độ dày viền (px)"
                      value={comps.explanation?.borderWidth ?? 2}
                      min={0}
                      max={8}
                      step={0.5}
                      unit="px"
                      onChange={(v) => updateComponent('explanation', { borderWidth: v })}
                      presets={[
                        { label: 'Không viền', value: 0 },
                        { label: 'Mỏng 1.5px', value: 1.5 },
                        { label: 'Chuẩn 2px', value: 2 },
                        { label: 'Đậm 3.5px', value: 3.5 }
                      ]}
                    />

                    <SliderControl
                      label="Bo góc khung (Border Radius)"
                      value={comps.explanation?.borderRadius ?? 16}
                      min={0}
                      max={35}
                      step={1}
                      unit="px"
                      onChange={(v) => updateComponent('explanation', { borderRadius: v })}
                      presets={[
                        { label: 'Vuông (0px)', value: 0 },
                        { label: 'Bo nhẹ (10px)', value: 10 },
                        { label: 'Bo tròn (16px)', value: 16 },
                        { label: 'Viên thuốc (28px)', value: 28 }
                      ]}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* 7. COMPONENT: ILLUSTRATION (ẢNH MINH HỌA)                    */}
            {/* ------------------------------------------------------------- */}
            {activeComp === 'illustration' && (
              <div className="space-y-4">
                <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
                    <div>
                      <span className="font-bold text-slate-100 text-xs block">Hiển thị ảnh minh họa</span>
                      <span className="text-[10px] text-slate-400 block">
                        {comps.illustration?.enabled !== false && (comps.illustration as any)?.show !== false
                          ? 'Đang BẬT ảnh minh họa cho template'
                          : 'Đang TẮT (Nội dung câu hỏi tự động căn giữa)'}
                      </span>
                    </div>
                    <Switch
                      checked={comps.illustration?.enabled !== false && (comps.illustration as any)?.show !== false}
                      onCheckedChange={(val) => updateComponent('illustration', { enabled: val, show: val } as any)}
                    />
                  </div>

                  {comps.illustration?.enabled !== false && (comps.illustration as any)?.show !== false ? (
                    <div className="space-y-3 pt-1">
                      <SliderControl
                        label="Vị trí X (%)"
                        value={comps.illustration?.x ?? 6}
                        min={0}
                        max={100}
                        step={1}
                        unit="%"
                        onChange={(v) => updateComponent('illustration', { x: v })}
                        presets={[
                          { label: 'Trái (6%)', value: 6 },
                          { label: 'Giữa (15%)', value: 15 },
                          { label: 'Phải (50%)', value: 50 }
                        ]}
                      />

                      <SliderControl
                        label="Vị trí Y (%)"
                        value={comps.illustration?.y ?? 16}
                        min={0}
                        max={100}
                        step={1}
                        unit="%"
                        onChange={(v) => updateComponent('illustration', { y: v })}
                        presets={[
                          { label: 'Cao (10%)', value: 10 },
                          { label: 'Chuẩn (16%)', value: 16 },
                          { label: 'Hạ thấp (25%)', value: 25 }
                        ]}
                      />

                      <SliderControl
                        label="Chiều rộng (%)"
                        value={comps.illustration?.width ?? 88}
                        min={10}
                        max={100}
                        step={1}
                        unit="%"
                        onChange={(v) => updateComponent('illustration', { width: v })}
                        presets={[
                          { label: 'Nhỏ (50%)', value: 50 },
                          { label: 'Vừa (70%)', value: 70 },
                          { label: 'Rộng (88%)', value: 88 }
                        ]}
                      />

                      <SliderControl
                        label="Chiều cao (%)"
                        value={comps.illustration?.height ?? 26}
                        min={5}
                        max={50}
                        step={1}
                        unit="%"
                        onChange={(v) => updateComponent('illustration', { height: v })}
                        presets={[
                          { label: 'Gọn (18%)', value: 18 },
                          { label: 'Chuẩn (26%)', value: 26 },
                          { label: 'Lớn (36%)', value: 36 }
                        ]}
                      />
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1">
                      <p className="font-semibold text-sky-400">💡 Chế độ không dùng ảnh minh họa:</p>
                      <p>Khung câu hỏi và các đáp án sẽ tự động dồn lên hoặc căn giữa toàn màn hình để tối ưu trải nghiệm đọc cho khán giả.</p>
                      <p className="text-[10px] text-slate-500 pt-1">
                        * Bạn cũng có thể bật/tắt ảnh minh họa cho từng câu riêng biệt trong tab "Ngân Hàng Câu Hỏi".
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* 8. COMPONENT: BRAND & AUDIO (KÊNH & ÂM THANH)               */}
            {/* ------------------------------------------------------------- */}
            {activeComp === 'brand_audio' && (
              <div className="space-y-4">
                <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 space-y-3">
                  <span className="font-bold text-slate-100 text-xs block">Kênh & Nhận diện Thương hiệu</span>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase">Tên kênh (Channel Name)</label>
                    <Input
                      value={channel.name || ''}
                      onChange={(e) => {
                        onChannelChange({ ...channel, name: e.target.value });
                        updateComponent('logo', { channelName: e.target.value });
                      }}
                      className="h-8 text-xs bg-slate-950 border-slate-800 text-slate-100"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-700/60">
                    <div>
                      <span className="text-[11px] text-slate-200 font-medium block">Hiện Logo Watermark</span>
                      <span className="text-[10px] text-slate-400 block">Watermark nhận diện bản quyền trên video</span>
                    </div>
                    <Switch
                      checked={channel.branding.identity.showLogo !== false}
                      onCheckedChange={(val) => {
                        onChannelChange({
                          ...channel,
                          branding: {
                            ...channel.branding,
                            identity: { ...channel.branding.identity, showLogo: val }
                          }
                        });
                        updateComponent('logo', { showLogo: val });
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-700/60">
                    <div>
                      <span className="text-[11px] text-slate-200 font-medium block">Hiện Tên Kênh</span>
                      <span className="text-[10px] text-slate-400 block">Hiển thị chữ tên kênh bên cạnh logo</span>
                    </div>
                    <Switch
                      checked={comps.logo?.showChannelName !== false}
                      onCheckedChange={(val) => updateComponent('logo', { showChannelName: val })}
                    />
                  </div>

                  {channel.branding.identity.showLogo !== false && (
                    <div className="pt-2 border-t border-slate-700/60 space-y-2.5">
                      <SliderControl
                        label="Kích thước Logo (px)"
                        value={comps.logo?.logoSize ?? 42}
                        min={24}
                        max={80}
                        step={2}
                        unit="px"
                        onChange={(v) => updateComponent('logo', { logoSize: v })}
                        presets={[
                          { label: 'Nhỏ 32px', value: 32 },
                          { label: 'Chuẩn 42px', value: 42 },
                          { label: 'Lớn 56px', value: 56 }
                        ]}
                      />
                    </div>
                  )}
                </div>

                {/* Typography Tên Kênh */}
                <TypographyControlSection
                  title="Typography & Chữ Tên Kênh"
                  style={comps.logo || {}}
                  onChange={(patch) => updateComponent('logo', patch)}
                  defaultFontSize={18}
                  allowShadowDefaultOff={false}
                  showDimensions={true}
                  showAlignment={true}
                  showColors={true}
                  xPresets={[
                    { label: 'Góc phải (75%)', value: 75 },
                    { label: 'Góc trái (8%)', value: 8 },
                    { label: 'Giữa (40%)', value: 40 }
                  ]}
                  yPresets={[
                    { label: 'Đỉnh (5%)', value: 5 },
                    { label: 'Chuẩn (8%)', value: 8 },
                    { label: 'Dưới (90%)', value: 90 }
                  ]}
                  widthPresets={[
                    { label: 'Gọn (25%)', value: 25 },
                    { label: 'Chuẩn (35%)', value: 35 },
                    { label: 'Rộng (50%)', value: 50 }
                  ]}
                  heightPresets={[
                    { label: 'Mảnh (4%)', value: 4 },
                    { label: 'Chuẩn (6%)', value: 6 },
                    { label: 'Dày (8%)', value: 8 }
                  ]}
                />
              </div>
            )}

            {/* ============================================================= */}
            {/* ACCORDION: ADVANCED SETTINGS (SHADOW, BLUR, MOTION, TIMING)  */}
            {/* ============================================================= */}
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
              <button
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                className="w-full p-3 flex items-center justify-between text-slate-300 hover:text-white font-bold text-xs transition bg-slate-800/30"
              >
                <div className="flex items-center gap-2">
                  <Layers size={13} className="text-sky-400" />
                  <span>Tùy chọn nâng cao (Shadow, Blur, Spacing, Timing)</span>
                </div>
                {isAdvancedOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {isAdvancedOpen && (
                <div className="p-3 space-y-3 border-t border-slate-800/80 bg-slate-900/30">
                  {/* Animation Type */}
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Hiệu ứng xuất hiện (Animation)</label>
                    <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[10px]">
                      {['pop', 'slide-up', 'fade', 'zoom'].map((anim) => (
                        <button
                          key={anim}
                          onClick={() => {
                            if (activeComp in comps) {
                              updateComponent(activeComp as any, { animation: anim });
                            }
                          }}
                          className={`py-1 rounded text-center font-semibold transition ${
                            ((comps as any)[activeComp]?.animation || 'pop') === anim
                              ? 'bg-sky-600 text-white'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {anim}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Timing: Countdown seconds */}
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                      <span>Thời gian đếm ngược (giây)</span>
                      <span className="font-bold text-sky-400">
                        {template.timing?.countdownSeconds ?? 5}s
                      </span>
                    </div>
                    <Slider
                      min={3}
                      max={15}
                      step={1}
                      value={[template.timing?.countdownSeconds ?? 5]}
                      onValueChange={([v]) => updateTiming({ countdownSeconds: v })}
                    />
                  </div>

                  {/* Timing: Reveal seconds */}
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                      <span>Thời gian hiện kết quả (giây)</span>
                      <span className="font-bold text-sky-400">
                        {template.timing?.revealSeconds ?? 3}s
                      </span>
                    </div>
                    <Slider
                      min={1}
                      max={8}
                      step={1}
                      value={[template.timing?.revealSeconds ?? 3]}
                      onValueChange={([v]) => updateTiming({ revealSeconds: v })}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
