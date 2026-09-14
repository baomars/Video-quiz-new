import React, { useRef, useState } from 'react';
import {
  VideoTemplate,
  ComponentStyle,
  HorizontalAlign,
  VerticalAlign,
  AnimationType,
  CountdownStyle,
  MotionDirection
} from '../../../../remotion/types/index';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sliders,
  Layers,
  Type,
  Move,
  Clock,
  Sparkles,
  Maximize2,
  Image as ImageIcon,
  Upload,
  Eye,
  EyeOff,
  Video
} from 'lucide-react';
import { Slider } from '../ui/slider';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { uploadImage } from '../../services/api';

type TextAlign = HorizontalAlign;

type ComponentKey =
  | 'questionBox'
  | 'answerButtons'
  | 'illustration'
  | 'countdown'
  | 'questionNumber'
  | 'header'
  | 'logo'
  | 'background';

interface PropertiesInspectorProps {
  template: VideoTemplate;
  onChange: (updated: VideoTemplate) => void;
  selectedKey?: ComponentKey;
  onSelectKey?: (key: ComponentKey) => void;
}

export const PropertiesInspector: React.FC<PropertiesInspectorProps> = ({
  template,
  onChange,
  selectedKey = 'questionBox',
  onSelectKey
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const compLabels: Record<ComponentKey, string> = {
    questionBox: 'Khung câu hỏi',
    answerButtons: '3 Đáp án (A, B, C)',
    illustration: 'Khung ảnh minh họa',
    countdown: 'Đồng hồ đếm ngược',
    questionNumber: 'Số thứ tự câu',
    header: 'Tiêu đề Kênh',
    logo: 'Logo / Watermark',
    background: 'Nền Video'
  };

  const activeComp = template.components[selectedKey] || {};

  const handleUploadBgImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
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
      setIsUploading(false);
    }
  };

  const updateComp = (prop: string, value: any) => {
    onChange({
      ...template,
      components: {
        ...template.components,
        [selectedKey]: {
          ...activeComp,
          [prop]: value
        }
      }
    });
  };

  const updateCountdownStyle = (style: CountdownStyle) => {
    onChange({
      ...template,
      countdownStyle: style
    });
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

  // Center-preserving width update: shrinks/expands equally from both sides when horizontalAlign is center
  const updateWidth = (newWidth: number) => {
    const oldWidth = activeComp.width ?? 88;
    const oldX = activeComp.x ?? ((100 - oldWidth) / 2);
    const hAlign = activeComp.horizontalAlign ?? 'center';

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
        [selectedKey]: {
          ...activeComp,
          horizontalAlign: hAlign,
          width: newWidth,
          x: Math.max(0, Math.min(100 - newWidth, newX))
        }
      }
    });
  };

  // Center-preserving height update: shrinks/expands equally from top and bottom when verticalAlign is center
  const updateHeight = (newHeight: number) => {
    const oldHeight = activeComp.height ?? 20;
    const oldY = activeComp.y ?? ((100 - oldHeight) / 2);
    const vAlign = activeComp.verticalAlign ?? 'center';

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
        [selectedKey]: {
          ...activeComp,
          verticalAlign: vAlign,
          height: newHeight,
          y: Math.max(0, Math.min(100 - newHeight, newY))
        }
      }
    });
  };

  const setHorizontalAlign = (align: HorizontalAlign) => {
    const width = activeComp.width ?? 88;
    let newX = activeComp.x ?? 6;

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
        [selectedKey]: {
          ...activeComp,
          horizontalAlign: align,
          x: newX
        }
      }
    });
  };

  const setVerticalAlign = (align: VerticalAlign) => {
    const height = activeComp.height ?? 20;
    let newY = activeComp.y ?? 20;

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
        [selectedKey]: {
          ...activeComp,
          verticalAlign: align,
          y: newY
        }
      }
    });
  };

  const updateTiming = (prop: string, value: any) => {
    onChange({
      ...template,
      timing: {
        ...template.timing,
        [prop]: value
      }
    });
  };

  return (
    <div className="h-full flex flex-col bg-white border-l border-slate-200 select-none overflow-y-auto">
      {/* Inspector Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Sliders size={15} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Properties Inspector
            </h3>
            <p className="text-[11px] text-slate-500">Tùy biến phần tử trực quan</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-5 flex-1">
        {/* Component Selector Dropdown / Pills */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
            Chọn phần tử chỉnh sửa:
          </label>
          <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            {(Object.keys(compLabels) as ComponentKey[]).map((k) => (
              <button
                key={k}
                onClick={() => onSelectKey?.(k)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold text-left truncate transition ${
                  selectedKey === k
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                {compLabels[k]}
              </button>
            ))}
          </div>
        </div>

        {/* SPECIAL PANEL: Countdown Customization */}
        {selectedKey === 'countdown' && (
          <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Clock size={15} className="text-amber-600" />
                <span>Kiểu & Kích thước Đồng hồ</span>
              </span>
              <Badge className="bg-amber-500 text-slate-950 text-[10px] font-bold">
                {template.countdownStyle || 'clean-text'}
              </Badge>
            </div>

            {/* Countdown Style Selector */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 mb-1 block">
                Phong cách đếm ngược:
              </label>
              <select
                value={template.countdownStyle || 'clean-text'}
                onChange={(e) => updateCountdownStyle(e.target.value as CountdownStyle)}
                className="w-full h-8 bg-white border border-amber-200 rounded-xl px-2.5 text-xs text-slate-800 font-semibold focus:border-amber-500 focus:outline-none"
              >
                <option value="circle-radial">Vòng tròn SVG (Radial Circle)</option>
                <option value="pill-timer">Viên con nhộng (Pill Badge)</option>
                <option value="clean-text">⏱️ Chữ & Số trực tiếp (Gọn gàng)</option>
              </select>
            </div>

            {/* Toggle Show/Hide Icon */}
            <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-amber-200">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <span>Hiển thị Icon đồng hồ (⏱️):</span>
              </span>
              <button
                type="button"
                onClick={() => updateComp('showIcon', activeComp.showIcon === false ? true : false)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeComp.showIcon !== false
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {activeComp.showIcon !== false ? <Eye size={12} /> : <EyeOff size={12} />}
                <span>{activeComp.showIcon !== false ? 'Đang hiện' : 'Đang ẩn'}</span>
              </button>
            </div>

            {/* Font Size & Icon Size Sliders */}
            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-semibold">
                  <span>Cỡ chữ số đếm:</span>
                  <span className="font-mono text-amber-700 font-bold">{activeComp.fontSize || 32}px</span>
                </div>
                <Slider
                  value={[activeComp.fontSize || 32]}
                  min={18}
                  max={64}
                  step={2}
                  onValueChange={([val]) => updateComp('fontSize', val)}
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-semibold">
                  <span>Kích thước Icon đồng hồ:</span>
                  <span className="font-mono text-amber-700 font-bold">{activeComp.iconSize || 30}px</span>
                </div>
                <Slider
                  value={[activeComp.iconSize || 30]}
                  min={16}
                  max={56}
                  step={2}
                  onValueChange={([val]) => updateComp('iconSize', val)}
                />
              </div>
            </div>
          </div>
        )}

        {/* SPECIAL PANEL: Background & Ken Burns Motion */}
        {selectedKey === 'background' && (
          <div className="p-3.5 bg-sky-50/70 rounded-2xl border border-sky-200 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                <ImageIcon size={15} className="text-sky-600" />
                <span>Nền Video & Chuyển động (Ken Burns)</span>
              </span>
              <Badge className="bg-sky-500 text-white text-[10px] font-bold">
                {activeComp.type || 'gradient'}
              </Badge>
            </div>

            {/* Background Type */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 mb-1 block">
                Loại hình nền:
              </label>
              <select
                value={activeComp.type || 'gradient'}
                onChange={(e) => updateComp('type', e.target.value)}
                className="w-full h-8 bg-white border border-sky-200 rounded-xl px-2.5 text-xs text-slate-800 font-semibold focus:border-sky-500 focus:outline-none"
              >
                <option value="image">🖼️ Ảnh nền (Background Image 9:16)</option>
                <option value="gradient">Chuyển sắc (Linear Gradient)</option>
                <option value="solid">Đơn sắc (Solid Color)</option>
                <option value="mesh">Lưới màu (Mesh Radial)</option>
                <option value="pattern">Họa tiết chấm (Pattern Dot)</option>
              </select>
            </div>

            {/* Background Image controls */}
            {activeComp.type === 'image' && (
              <div className="space-y-3 bg-white p-3 rounded-xl border border-sky-200">
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUploadBgImage}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition"
                  >
                    <Upload size={14} />
                    <span>{isUploading ? 'Đang tải ảnh lên...' : 'Tải ảnh nền 9:16 mới'}</span>
                  </button>
                  {activeComp.imageUrl && (
                    <p className="text-[10px] text-slate-500 truncate mt-1 text-center font-mono">
                      {activeComp.imageUrl}
                    </p>
                  )}
                </div>

                {/* Overlay Opacity Slider */}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-semibold">
                    <span>Lớp phủ chống chói chữ (Overlay):</span>
                    <span className="font-mono text-sky-700 font-bold">
                      {Math.round((activeComp.overlayOpacity ?? 0.2) * 100)}%
                    </span>
                  </div>
                  <Slider
                    value={[Math.round((activeComp.overlayOpacity ?? 0.2) * 100)]}
                    min={0}
                    max={80}
                    step={5}
                    onValueChange={([val]) => updateComp('overlayOpacity', val / 100)}
                  />
                  <p className="text-[9px] text-slate-400 mt-0.5">Tăng độ mờ để chữ câu hỏi luôn sắc nét dễ đọc</p>
                </div>

                {/* Ken Burns Pan & Zoom Motion Settings */}
                <div className="pt-2 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles size={13} className="text-amber-500" />
                      <span>Chuyển động nền (Ken Burns):</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => updateBgMotion('enabled', activeComp.motion?.enabled === false ? true : false)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        activeComp.motion?.enabled !== false
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {activeComp.motion?.enabled !== false ? 'BẬT' : 'TẮT'}
                    </button>
                  </div>

                  {activeComp.motion?.enabled !== false && (
                    <div className="space-y-2 pt-1">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 mb-1 block">
                          Hướng chuyển động:
                        </span>
                        <select
                          value={activeComp.motion?.direction || 'zoom-in'}
                          onChange={(e) => updateBgMotion('direction', e.target.value as MotionDirection)}
                          className="w-full h-7 bg-slate-50 border border-slate-200 rounded-lg px-2 text-xs text-slate-800 font-medium"
                        >
                          <option value="zoom-in">Phóng to nhẹ (Zoom In 1.05x → 1.18x)</option>
                          <option value="zoom-out">Thu nhỏ nhẹ (Zoom Out 1.18x → 1.05x)</option>
                          <option value="pan-left">Lướt sang trái (Pan Left)</option>
                          <option value="pan-right">Lướt sang phải (Pan Right)</option>
                          <option value="pan-up">Lướt lên trên (Pan Up)</option>
                          <option value="pan-down">Lướt xuống dưới (Pan Down)</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="flex justify-between text-[10px] text-slate-600 mb-0.5 font-semibold">
                            <span>Zoom Bắt đầu:</span>
                            <span className="font-mono text-sky-600 font-bold">
                              {(activeComp.motion?.zoomStart ?? 1.05).toFixed(2)}x
                            </span>
                          </div>
                          <Slider
                            value={[Math.round((activeComp.motion?.zoomStart ?? 1.05) * 100)]}
                            min={100}
                            max={130}
                            step={1}
                            onValueChange={([val]) => updateBgMotion('zoomStart', val / 100)}
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-[10px] text-slate-600 mb-0.5 font-semibold">
                            <span>Zoom Kết thúc:</span>
                            <span className="font-mono text-sky-600 font-bold">
                              {(activeComp.motion?.zoomEnd ?? 1.18).toFixed(2)}x
                            </span>
                          </div>
                          <Slider
                            value={[Math.round((activeComp.motion?.zoomEnd ?? 1.18) * 100)]}
                            min={100}
                            max={140}
                            step={1}
                            onValueChange={([val]) => updateBgMotion('zoomEnd', val / 100)}
                          />
                        </div>
                      </div>

                      <p className="text-[9px] text-emerald-600 font-medium flex items-center gap-1 mt-1 bg-emerald-50 p-1.5 rounded-lg border border-emerald-100">
                        <span>✓ Tự động reset chu kỳ chuyển động khi sang câu hỏi mới</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 1. Alignment Section */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <AlignLeft size={14} className="text-amber-500" />
              <span>Căn lề (Alignment)</span>
            </span>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
              {activeComp.textAlign || 'center'}
            </Badge>
          </div>

          {/* Text Alignment */}
          <div>
            <span className="text-[11px] font-semibold text-slate-500 mb-1.5 block">
              Căn lề chữ (Text):
            </span>
            <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-xl border border-slate-200">
              {(['left', 'center', 'right'] as TextAlign[]).map((align) => (
                <button
                  key={align}
                  onClick={() => updateComp('textAlign', align)}
                  className={`py-1.5 flex items-center justify-center rounded-lg text-xs font-bold transition ${
                    (activeComp.textAlign || 'center') === align
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
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

          {/* Horizontal Frame Alignment */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 mb-1 block">
                Căn ngang khung:
              </span>
              <div className="flex bg-white p-0.5 rounded-lg border border-slate-200 text-xs">
                {(['left', 'center', 'right'] as HorizontalAlign[]).map((a) => (
                  <button
                    key={a}
                    onClick={() => setHorizontalAlign(a)}
                    className={`flex-1 py-1 text-[11px] rounded transition font-semibold capitalize ${
                      (activeComp.horizontalAlign || 'center') === a
                        ? 'bg-sky-500 text-white font-bold shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {a === 'left' ? 'Trái' : a === 'center' ? 'Giữa' : 'Phải'}
                  </button>
                ))}
              </div>
            </div>

            {/* Vertical Frame Alignment */}
            <div>
              <span className="text-[11px] font-semibold text-slate-500 mb-1 block">
                Căn dọc khung:
              </span>
              <div className="flex bg-white p-0.5 rounded-lg border border-slate-200 text-xs">
                {(['top', 'center', 'bottom'] as VerticalAlign[]).map((a) => (
                  <button
                    key={a}
                    onClick={() => setVerticalAlign(a)}
                    className={`flex-1 py-1 text-[11px] rounded transition font-semibold capitalize ${
                      (activeComp.verticalAlign || 'center') === a
                        ? 'bg-purple-600 text-white font-bold shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {a === 'top' ? 'Trên' : a === 'center' ? 'Giữa' : 'Dưới'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Position & Geometry */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Move size={14} className="text-sky-500" />
            <span>Tọa độ & Kích thước (Position & Size)</span>
          </span>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-semibold">
                <span>Vị trí X:</span>
                <span className="font-mono text-amber-600 font-bold">{activeComp.x ?? 0}%</span>
              </div>
              <Slider
                value={[activeComp.x ?? 0]}
                min={0}
                max={100}
                step={1}
                onValueChange={([val]) => updateComp('x', val)}
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-semibold">
                <span>Vị trí Y:</span>
                <span className="font-mono text-amber-600 font-bold">{activeComp.y ?? 0}%</span>
              </div>
              <Slider
                value={[activeComp.y ?? 0]}
                min={0}
                max={100}
                step={1}
                onValueChange={([val]) => updateComp('y', val)}
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-semibold">
                <span>Chiều rộng (W):</span>
                <span className="font-mono text-sky-600 font-bold">{activeComp.width ?? 80}%</span>
              </div>
              <Slider
                value={[activeComp.width ?? 80]}
                min={10}
                max={100}
                step={1}
                onValueChange={([val]) => updateWidth(val)}
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-semibold">
                <span>Chiều cao (H):</span>
                <span className="font-mono text-sky-600 font-bold">{activeComp.height ?? 20}%</span>
              </div>
              <Slider
                value={[activeComp.height ?? 20]}
                min={2}
                max={100}
                step={1}
                onValueChange={([val]) => updateHeight(val)}
              />
            </div>
          </div>
        </div>

        {/* 3. Typography & Styling */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Type size={14} className="text-emerald-500" />
            <span>Phông chữ & Bo góc</span>
          </span>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 mb-1 block">Cỡ chữ (px):</span>
              <Input
                type="number"
                value={activeComp.fontSize || 22}
                onChange={(e) => updateComp('fontSize', Number(e.target.value))}
                className="h-8 text-xs font-mono"
              />
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-500 mb-1 block">Bo góc (px):</span>
              <Input
                type="number"
                value={activeComp.borderRadius ?? 16}
                onChange={(e) => updateComp('borderRadius', Number(e.target.value))}
                className="h-8 text-xs font-mono"
              />
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-500 mb-1 block">Viền (px):</span>
              <Input
                type="number"
                value={activeComp.borderWidth ?? 0}
                onChange={(e) => updateComp('borderWidth', Number(e.target.value))}
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-500 mb-1 block">Hiệu ứng vào (Animation):</span>
            <select
              value={activeComp.animation || 'slide-up'}
              onChange={(e) => updateComp('animation', e.target.value as AnimationType)}
              className="w-full h-8 bg-white border border-slate-200 rounded-xl px-2.5 text-xs text-slate-800 font-medium focus:border-amber-500 focus:outline-none"
            >
              <option value="slide-up">Trượt lên (Slide Up)</option>
              <option value="pop">Bật nảy (Pop / Spring)</option>
              <option value="scale-in">Phóng to (Scale In)</option>
              <option value="bounce">Đàn hồi (Bounce)</option>
              <option value="fade">Mờ dần (Fade)</option>
            </select>
          </div>
        </div>

        {/* 4. Timeline & Buffer Control */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Clock size={14} className="text-purple-500" />
            <span>Thời lượng & Nhịp độ (Timings)</span>
          </span>

          <div className="space-y-2.5">
            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-semibold">
                <span>Thời gian đếm ngược:</span>
                <span className="font-mono text-amber-600 font-bold">{template.timing?.countdownSeconds || 5}s</span>
              </div>
              <Slider
                value={[template.timing?.countdownSeconds || 5]}
                min={3}
                max={10}
                step={1}
                onValueChange={([val]) => updateTiming('countdownSeconds', val)}
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-semibold">
                <span>Thời gian mở đáp án:</span>
                <span className="font-mono text-emerald-600 font-bold">{template.timing?.revealSeconds || 2.5}s</span>
              </div>
              <Slider
                value={[template.timing?.revealSeconds || 2.5]}
                min={1.5}
                max={6}
                step={0.5}
                onValueChange={([val]) => updateTiming('revealSeconds', val)}
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-semibold">
                <span>Giữ hình đuôi video (End Buffer):</span>
                <span className="font-mono text-purple-600 font-bold">{template.timing?.endBufferSeconds ?? 2.5}s</span>
              </div>
              <Slider
                value={[template.timing?.endBufferSeconds ?? 2.5]}
                min={1.0}
                max={6.0}
                step={0.5}
                onValueChange={([val]) => updateTiming('endBufferSeconds', val)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
