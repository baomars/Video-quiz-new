import React from 'react';
import { Channel } from '../../../../remotion/types/index';
import { uploadImage } from '../../services/api';
import { Palette, Type, Sparkles, Upload } from 'lucide-react';

interface ChannelBrandTabProps {
  channel: Channel;
  onChange: (updated: Channel) => void;
}

export const ChannelBrandTab: React.FC<ChannelBrandTabProps> = ({ channel, onChange }) => {
  const branding = channel.branding;

  const updateIdentity = (key: string, value: any) => {
    onChange({
      ...channel,
      branding: {
        ...branding,
        identity: {
          ...branding.identity,
          [key]: value
        }
      }
    });
  };

  const updateColor = (key: string, value: string) => {
    onChange({
      ...channel,
      branding: {
        ...branding,
        colors: {
          ...branding.colors,
          [key]: value
        }
      }
    });
  };

  const updateFont = (key: string, value: string) => {
    onChange({
      ...channel,
      branding: {
        ...branding,
        fonts: {
          ...branding.fonts,
          [key]: value
        }
      }
    });
  };

  const updateEffect = (key: string, value: any) => {
    onChange({
      ...channel,
      branding: {
        ...branding,
        effects: {
          ...branding.effects,
          [key]: value
        }
      }
    });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadImage(file);
      updateIdentity('avatarUrl', res.optimizedUrl || res.originalUrl);
    } catch (err: any) {
      alert(`Lỗi tải ảnh avatar: ${err.message}`);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadImage(file);
      updateIdentity('logoUrl', res.optimizedUrl || res.originalUrl);
    } catch (err: any) {
      alert(`Lỗi tải ảnh logo: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Channel Identity */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <span>1. Nhận diện Kênh (Channel Identity)</span>
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-600 font-bold mb-1 block">Tên Kênh hiển thị:</label>
            <input
              type="text"
              value={branding.identity.channelName}
              onChange={(e) => updateIdentity('channelName', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 font-medium focus:bg-white focus:border-amber-500 focus:outline-none transition shadow-sm"
            />
          </div>
          <div>
            <label className="text-xs text-slate-600 font-bold mb-1 block">Mô tả khẩu hiệu:</label>
            <input
              type="text"
              value={branding.identity.description}
              onChange={(e) => updateIdentity('description', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 font-medium focus:bg-white focus:border-amber-500 focus:outline-none transition shadow-sm"
            />
          </div>
        </div>

        {/* Avatar & Logo Upload */}
        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
          <div>
            <label className="text-xs text-slate-600 font-semibold mb-1 block">Avatar Kênh:</label>
            <div className="flex items-center gap-3">
              {branding.identity.avatarUrl ? (
                <img
                  src={branding.identity.avatarUrl}
                  alt="avatar preview"
                  className="w-12 h-12 rounded-full object-cover border-2 border-amber-400 bg-slate-100 shadow-sm"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-xs">
                  Trống
                </div>
              )}
              <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-semibold rounded-xl cursor-pointer border border-slate-200 flex items-center gap-1.5 text-slate-700 transition shadow-xs">
                <Upload size={13} />
                <span>Chọn ảnh</span>
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-600 font-semibold mb-1 block">Logo / Watermark:</label>
            <div className="flex items-center gap-3">
              {branding.identity.logoUrl ? (
                <img
                  src={branding.identity.logoUrl}
                  alt="logo preview"
                  className="h-12 w-24 object-contain rounded-lg border border-slate-200 bg-white p-1 shadow-sm"
                />
              ) : (
                <div className="h-12 w-24 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-xs">
                  Trống
                </div>
              )}
              <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-semibold rounded-xl cursor-pointer border border-slate-200 flex items-center gap-1.5 text-slate-700 transition shadow-xs">
                <Upload size={13} />
                <span>Chọn ảnh</span>
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Visual Palette Colors */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Palette size={16} className="text-amber-500" />
          <span>2. Bảng Màu Thương Hiệu (Color Palette - Light Theme)</span>
        </h3>

        <div className="grid grid-cols-3 gap-3">
          {[
            { key: 'primary', label: 'Primary (Màu chính)', val: branding.colors.primary },
            { key: 'secondary', label: 'Secondary (Màu phụ)', val: branding.colors.secondary },
            { key: 'accent', label: 'Accent (Nhấn mạnh)', val: branding.colors.accent },
            { key: 'background', label: 'Background (Nền video)', val: branding.colors.background },
            { key: 'cardBg', label: 'Card (Nền thẻ)', val: branding.colors.cardBg },
            { key: 'text', label: 'Text (Chữ chính)', val: branding.colors.text },
            { key: 'textMuted', label: 'Muted Text (Chữ phụ)', val: branding.colors.textMuted },
            { key: 'correct', label: 'Đúng (Correct Answer)', val: branding.colors.correct },
            { key: 'wrong', label: 'Sai (Wrong Answer)', val: branding.colors.wrong }
          ].map((c) => (
            <div key={c.key} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <label className="text-[11px] text-slate-600 font-semibold mb-1 block truncate">
                {c.label}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={c.val.startsWith('#') && c.val.length === 7 ? c.val : '#3b82f6'}
                  onChange={(e) => updateColor(c.key, e.target.value)}
                  className="w-8 h-8 rounded-lg border-0 bg-transparent cursor-pointer shadow-xs"
                />
                <input
                  type="text"
                  value={c.val}
                  onChange={(e) => updateColor(c.key, e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-mono focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Typography */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Type size={16} className="text-sky-500" />
          <span>3. Typography & Phông Chữ (Mặc định: Be Vietnam Pro)</span>
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-600 font-semibold mb-1 block">Phông chữ Chính:</label>
            <select
              value={branding.fonts.primary}
              onChange={(e) => updateFont('primary', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 font-medium focus:bg-white focus:border-amber-500 focus:outline-none shadow-sm"
            >
              <option value="Be Vietnam Pro, sans-serif">Be Vietnam Pro (Chuẩn tiếng Việt đẹp nhất)</option>
              <option value="Noto Sans, sans-serif">Noto Sans (Đầy đủ ký tự, tương thích cao)</option>
              <option value="Montserrat, sans-serif">Montserrat (Hiện đại, ấn tượng)</option>
              <option value="Inter, sans-serif">Inter (Gọn gàng, trung tính)</option>
              <option value="Poppins, sans-serif">Poppins (Tròn trịa, trẻ trung)</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-600 font-semibold mb-1 block">Độ đậm tiêu đề (Heading Weight):</label>
            <select
              value={branding.fonts.headingWeight}
              onChange={(e) => updateFont('headingWeight', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 font-medium focus:bg-white focus:border-amber-500 focus:outline-none shadow-sm"
            >
              <option value="600">SemiBold (600)</option>
              <option value="700">Bold (700)</option>
              <option value="800">ExtraBold (800)</option>
              <option value="900">Black (900)</option>
            </select>
          </div>
        </div>
      </section>

      {/* 4. Effects & Visual Style */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Sparkles size={16} className="text-rose-500" />
          <span>4. Hiệu Ứng Hình Ảnh (Visual Effects)</span>
        </h3>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-slate-600 font-semibold mb-1 block">Kiểu Đổ Bóng (Shadow):</label>
            <select
              value={branding.effects.shadowStyle}
              onChange={(e) => updateEffect('shadowStyle', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:bg-white focus:border-amber-500 focus:outline-none shadow-sm"
            >
              <option value="none">Không đổ bóng</option>
              <option value="subtle">Nhẹ nhàng (Subtle)</option>
              <option value="elevated">Nổi khối (Elevated 3D)</option>
              <option value="glow">Phát sáng (Glow)</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-600 font-semibold mb-1 block">Bo góc thẻ (Border Radius):</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={32}
                value={branding.effects.borderRadius}
                onChange={(e) => updateEffect('borderRadius', Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <span className="text-xs font-mono font-bold text-slate-700 w-8">{branding.effects.borderRadius}px</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-600 font-semibold mb-1 block">Hiệu ứng Kính (Glassmorphism):</label>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="glassToggle"
                checked={branding.effects.glassmorphism}
                onChange={(e) => updateEffect('glassmorphism', e.target.checked)}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
              <label htmlFor="glassToggle" className="text-xs text-slate-700 cursor-pointer font-medium">
                Bật nền mờ trong suốt (Blur glass)
              </label>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
