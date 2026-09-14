import React, { useState, useRef } from 'react';
import { Channel, VideoTemplate } from '../../../../remotion/types/index';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '../ui/dialog';
import {
  FolderOpen,
  Music,
  Volume2,
  Image as ImageIcon,
  Upload,
  Play,
  Check,
  Sparkles,
  Layers
} from 'lucide-react';
import { Button } from '../ui/button';
import { uploadAudio, uploadImage } from '../../services/api';

interface AssetManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  channel: Channel;
  template: VideoTemplate;
  onChannelChange: (updated: Channel) => void;
  onTemplateChange: (updated: VideoTemplate) => void;
}

export const AssetManagerModal: React.FC<AssetManagerModalProps> = ({
  isOpen,
  onClose,
  channel,
  template,
  onChannelChange,
  onTemplateChange
}) => {
  const [activeTab, setActiveTab] = useState<'sfx' | 'bgm' | 'backgrounds' | 'brand'>('sfx');
  const bgFileInputRef = useRef<HTMLInputElement | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const playPreview = (url?: string) => {
    if (!url) return;
    const audio = new Audio(url);
    audio.play().catch((err) => console.error('Audio play error:', err));
  };

  const handleUploadSfx = async (key: string, file: File) => {
    try {
      setIsUploading(true);
      const res = await uploadAudio(file);
      onChannelChange({
        ...channel,
        audio: {
          ...channel.audio,
          sfx: {
            ...channel.audio?.sfx,
            [key]: res.url
          }
        }
      });
    } catch (err: any) {
      alert(`Lỗi upload SFX: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

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

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const res = await uploadImage(file);
      onChannelChange({
        ...channel,
        brand: {
          ...channel.brand,
          logoUrl: res.optimizedUrl || res.originalUrl
        }
      });
    } catch (err: any) {
      alert(`Lỗi upload logo: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl bg-slate-950 border-slate-800 text-slate-100 max-h-[88vh] overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-slate-800">
        <DialogHeader className="border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <FolderOpen size={18} />
            </div>
            <div>
              <DialogTitle className="text-base font-extrabold text-white">
                Quản Lý Tài Nguyên & Âm Thanh (Assets Library)
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Tùy chỉnh SFX, nhạc nền BGM, ảnh nền và logo watermark cho kênh.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          {[
            { id: 'sfx', label: 'SFX Âm Thanh', icon: <Volume2 size={13} /> },
            { id: 'backgrounds', label: 'Ảnh Nền', icon: <ImageIcon size={13} /> },
            { id: 'brand', label: 'Logo & Nhận Diện', icon: <Sparkles size={13} /> }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === t.id
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white bg-slate-900'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tab 1: SFX */}
        {activeTab === 'sfx' && (
          <div className="space-y-2.5 py-2">
            {[
              { id: 'countdown', label: 'Tích tắc đếm ngược (Tick)', desc: 'Phát từng giây trong giai đoạn đếm ngược' },
              { id: 'countdownFinish', label: 'Chuông hết giờ (Bell)', desc: 'Phát khi countdown về 0' },
              { id: 'correctAnswer', label: 'Keng đáp án đúng (Chime)', desc: 'Phát khi đáp án đúng xuất hiện' },
              { id: 'transition', label: 'Whoosh chuyển câu (Transition)', desc: 'Phát đồng bộ khi chuyển sang câu mới' },
              { id: 'reveal', label: 'Swoosh mở giải thích (Reveal)', desc: 'Phát khi mở thẻ giải thích' }
            ].map((sfx) => {
              const customUrl = channel.audio?.sfx?.[sfx.id];
              return (
                <div
                  key={sfx.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{sfx.label}</h4>
                    <p className="text-[11px] text-slate-500">{sfx.desc}</p>
                    <span className="text-[10px] font-mono text-amber-400">
                      {customUrl ? `Tệp riêng: ${customUrl.split('/').pop()}` : 'Mặc định Studio'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => playPreview(customUrl || `/assets/sfx/${sfx.id}.mp3`)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold flex items-center gap-1"
                    >
                      <Play size={13} />
                      <span>Nghe thử</span>
                    </button>

                    <label className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1 cursor-pointer">
                      <Upload size={13} />
                      <span>Upload mới</span>
                      <input
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleUploadSfx(sfx.id, f);
                        }}
                      />
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 3: Backgrounds */}
        {activeTab === 'backgrounds' && (
          <div className="space-y-3 py-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Ảnh nền hiện tại:</span>
              <label className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1 cursor-pointer">
                <Upload size={13} />
                <span>Upload Ảnh Nền Mới</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUploadBgImage}
                />
              </label>
            </div>

            {template.components.background?.imageUrl ? (
              <div className="relative h-48 rounded-xl overflow-hidden border border-slate-800">
                <img
                  src={template.components.background.imageUrl}
                  alt="Background"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-900 rounded-xl border border-slate-800">
                Đang dùng nền Gradient / Màu trơn
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Brand */}
        {activeTab === 'brand' && (
          <div className="space-y-3 py-2">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-slate-200">Logo / Watermark Kênh:</h4>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl border border-slate-700 bg-slate-950 overflow-hidden flex items-center justify-center">
                  {channel.brand?.logoUrl ? (
                    <img
                      src={channel.brand.logoUrl}
                      alt="Logo"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-xs font-bold text-slate-600">No Logo</span>
                  )}
                </div>

                <label className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1 cursor-pointer">
                  <Upload size={13} />
                  <span>Upload Logo Kênh</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUploadLogo}
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
