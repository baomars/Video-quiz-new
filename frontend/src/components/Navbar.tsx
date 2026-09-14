import React, { useState } from 'react';
import { Channel, VideoTemplate, LanguageCode } from '../../../remotion/types/index';
import {
  Video,
  Copy,
  RotateCcw,
  Check,
  Loader2,
  Sparkles,
  Layers,
  ChevronDown,
  AlertTriangle
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from './ui/dialog';

interface NavbarProps {
  channels: { id: string; name: string; avatarUrl: string }[];
  currentChannel: Channel | null;
  onSelectChannel: (channelId: string) => void;
  onDuplicateChannel: () => void;
  onResetChannel: () => void;
  currentTemplate: VideoTemplate | null;
  onSelectTemplate: (templateId: string) => void;
  currentLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  isSaving: boolean;
  onManualSave: () => void;
  onOpenRenderTab: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  channels,
  currentChannel,
  onSelectChannel,
  onDuplicateChannel,
  onResetChannel,
  currentTemplate,
  onSelectTemplate,
  currentLanguage,
  onSelectLanguage,
  isSaving,
  onManualSave,
  onOpenRenderTab
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-3 sm:px-5 flex items-center justify-between select-none z-30 shrink-0 shadow-2xs">
      {/* Brand & Studio Title */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center shadow-xs text-white font-black text-base shrink-0">
          Q
        </div>
        <div className="hidden sm:block">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm tracking-wide text-slate-900">
              QUIZ STUDIO
            </span>
            <Badge variant="warning" className="text-[9px] px-1.5 py-0 font-bold">
              PRO
            </Badge>
          </div>
          <p className="text-[10px] text-slate-500 font-medium">CapCut / Canva Style Video Engine</p>
        </div>

        {/* Channel Selector */}
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 shadow-2xs ml-1 sm:ml-3">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider hidden md:inline">
            Kênh:
          </span>
          <select
            value={currentChannel?.id || ''}
            onChange={(e) => onSelectChannel(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer pr-1 max-w-[130px] sm:max-w-[200px] truncate"
          >
            {channels.map((ch) => (
              <option key={ch.id} value={ch.id}>
                {ch.name}
              </option>
            ))}
          </select>
          <button
            onClick={onDuplicateChannel}
            title="Nhân bản kênh này"
            className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-800 rounded-md transition"
          >
            <Copy size={12} />
          </button>
        </div>
      </div>

      {/* Center: Language Switcher */}
      <div className="hidden md:flex items-center gap-2">
        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
          <button
            onClick={() => onSelectLanguage('vi')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              currentLanguage === 'vi'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>🇻🇳</span>
            <span>Tiếng Việt</span>
          </button>
          <button
            onClick={() => onSelectLanguage('en')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              currentLanguage === 'en'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>🇺🇸</span>
            <span>English</span>
          </button>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Reset to Default Button */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowResetConfirm(true)}
          className="h-8 text-xs text-rose-700 hover:bg-rose-50 border-rose-200 gap-1 font-semibold hidden sm:inline-flex"
        >
          <RotateCcw size={12} />
          <span>Reset Default</span>
        </Button>

        {/* Auto-save Indicator */}
        <div className="hidden lg:flex items-center gap-1 text-[11px] text-slate-500 font-medium px-2">
          {isSaving ? (
            <>
              <Loader2 size={12} className="animate-spin text-amber-500" />
              <span>Đang lưu...</span>
            </>
          ) : (
            <>
              <Check size={12} className="text-emerald-600" />
              <span>Đã lưu</span>
            </>
          )}
        </div>

        {/* Render Button */}
        <Button
          onClick={onOpenRenderTab}
          className="h-8 sm:h-9 px-3 sm:px-4 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 hover:opacity-95 text-white font-extrabold text-xs rounded-xl shadow-xs gap-1.5 transition active:scale-[0.98]"
        >
          <Video size={14} />
          <span>XUẤT VIDEO</span>
        </Button>
      </div>

      {/* Confirmation Dialog for Reset to Default */}
      <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                <AlertTriangle size={18} />
              </div>
              <div>
                <DialogTitle>Khôi Phục Cấu Hình Mặc Định?</DialogTitle>
                <DialogDescription>
                  Hành động này sẽ đặt lại toàn bộ bố cục, màu sắc và âm thanh của kênh "
                  {currentChannel?.name}" về cài đặt ban đầu.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetConfirm(false)}>
              Hủy bỏ
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onResetChannel();
                setShowResetConfirm(false);
              }}
            >
              Xác nhận Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
};
