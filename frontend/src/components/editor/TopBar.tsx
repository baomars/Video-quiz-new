import React, { useState } from 'react';
import { Channel, LanguageCode } from '../../../../remotion/types/index';
import {
  Film,
  FolderOpen,
  Sparkles,
  Check,
  Loader2,
  Copy,
  RotateCcw,
  Activity,
  Layers,
  Globe,
  Sliders,
  AlertTriangle,
  MonitorPlay
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../ui/dialog';

interface TopBarProps {
  channels: { id: string; name: string; avatarUrl: string }[];
  currentChannel: Channel | null;
  onSelectChannel: (channelId: string) => void;
  onDuplicateChannel: () => void;
  onResetChannel: () => void;
  currentLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  totalDurationFrames: number;
  totalQuestions: number;
  fps?: number;
  isSaving: boolean;
  onManualSave?: () => void;
  onOpenAssetsModal: () => void;
  onOpenExportModal: () => void;
  isRendering?: boolean;
  renderProgress?: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  channels,
  currentChannel,
  onSelectChannel,
  onDuplicateChannel,
  onResetChannel,
  currentLanguage,
  onSelectLanguage,
  totalDurationFrames,
  totalQuestions,
  fps = 30,
  isSaving,
  onManualSave,
  onOpenAssetsModal,
  onOpenExportModal,
  isRendering,
  renderProgress = 0
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const durationSec = Math.round((totalDurationFrames / fps) * 10) / 10;
  const m = Math.floor(durationSec / 60);
  const s = Math.floor(durationSec % 60);
  const durationFormatted = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 text-slate-100 px-3 sm:px-5 flex items-center justify-between select-none z-30 shrink-0 shadow-lg">
      {/* 1. Brand Logo + Studio Name */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center shadow-md shadow-amber-500/20 text-slate-950 font-black text-sm shrink-0">
          <Film size={18} className="text-slate-950" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm tracking-wide text-white uppercase">
              Quiz Video Studio
            </span>
            <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] px-1.5 py-0 font-bold">
              PRO
            </Badge>
          </div>
          <p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5 hidden sm:block">
            Visual Video Editor 9:16
          </p>
        </div>

        {/* Separator */}
        <div className="h-5 w-px bg-slate-800 mx-1 hidden md:block" />

        {/* Channel Selector */}
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/80 rounded-xl px-2.5 py-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden lg:inline">
            Kênh:
          </span>
          <select
            value={currentChannel?.id || ''}
            onChange={(e) => onSelectChannel(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none cursor-pointer pr-1 max-w-[130px] sm:max-w-[180px] truncate"
          >
            {channels.map((ch) => (
              <option key={ch.id} value={ch.id} className="bg-slate-900 text-slate-100">
                {ch.name}
              </option>
            ))}
          </select>
          <button
            onClick={onDuplicateChannel}
            title="Nhân bản kênh này"
            className="p-1 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-md transition"
          >
            <Copy size={12} />
          </button>
          <button
            onClick={() => setShowResetConfirm(true)}
            title="Khôi phục mặc định"
            className="p-1 hover:bg-slate-700 text-slate-400 hover:text-rose-400 rounded-md transition"
          >
            <RotateCcw size={12} />
          </button>
        </div>

        {/* Language Switcher */}
        <div className="hidden lg:flex items-center bg-slate-800/80 border border-slate-700/80 rounded-xl p-0.5 text-xs">
          <button
            onClick={() => onSelectLanguage('vi')}
            className={`px-2 py-0.5 rounded-lg font-bold transition flex items-center gap-1 ${
              currentLanguage === 'vi'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🇻🇳</span>
            <span>VI</span>
          </button>
          <button
            onClick={() => onSelectLanguage('en')}
            className={`px-2 py-0.5 rounded-lg font-bold transition flex items-center gap-1 ${
              currentLanguage === 'en'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🇺🇸</span>
            <span>EN</span>
          </button>
        </div>
      </div>

      {/* 2. Center: Video Resolution & Specs Badges + Engine Status */}
      <div className="hidden xl:flex items-center gap-3">
        {/* Specs Pill */}
        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-1 text-xs">
          <span className="font-mono font-bold text-amber-400">720×1280 (9:16)</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300 font-medium">{fps} FPS</span>
          <span className="text-slate-500">•</span>
          <span className="text-emerald-400 font-mono font-bold">{durationFormatted}</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300 font-semibold">{totalQuestions} câu</span>
        </div>

        {/* Engine Status */}
        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 bg-slate-800/40 border border-slate-700/50 rounded-xl px-2.5 py-1">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            FFmpeg 7.1
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1 text-sky-400">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            Edge-TTS
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-amber-400">Chrome Headless</span>
        </div>
      </div>

      {/* 3. Right: Save Indicator, Assets Modal & Export CTA */}
      <div className="flex items-center gap-2">
        {/* Auto-save status */}
        <div className="hidden sm:flex items-center gap-1 text-xs font-medium text-slate-400 mr-1">
          {isSaving ? (
            <>
              <Loader2 size={13} className="animate-spin text-amber-400" />
              <span className="text-[11px] text-amber-300">Đang lưu...</span>
            </>
          ) : (
            <>
              <Check size={13} className="text-emerald-400" />
              <span className="text-[11px] text-slate-400">Đã lưu</span>
            </>
          )}
        </div>

        {/* Asset Manager Button */}
        <Button
          size="sm"
          variant="outline"
          onClick={onOpenAssetsModal}
          className="hidden sm:inline-flex bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200 hover:text-white text-xs font-bold gap-1.5 h-8 px-3 rounded-xl transition"
        >
          <FolderOpen size={14} className="text-amber-400" />
          <span>Tài nguyên</span>
        </Button>

        {/* Primary Export Button */}
        <Button
          size="sm"
          onClick={onOpenExportModal}
          className={`${
            isRendering
              ? 'bg-amber-500 text-slate-950 font-black ring-2 ring-amber-400/80 animate-pulse'
              : 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black shadow-md shadow-amber-500/25 active:scale-95'
          } text-xs gap-1.5 h-8 px-3.5 rounded-xl transition cursor-pointer`}
        >
          {isRendering ? (
            <>
              <Loader2 size={14} className="animate-spin text-slate-950" />
              <span>Đang Render {renderProgress}%</span>
            </>
          ) : (
            <>
              <Film size={14} />
              <span>Xuất Video</span>
            </>
          )}
        </Button>
      </div>

      {/* Reset Channel Confirmation Dialog */}
      <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-400">
              <AlertTriangle size={20} />
              Khôi phục cài đặt gốc của kênh?
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Thao tác này sẽ đặt lại toàn bộ template, màu sắc, font chữ và âm thanh về mặc định ban đầu. Bạn có chắc chắn muốn tiếp tục?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowResetConfirm(false)}
              className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
            >
              Hủy
            </Button>
            <Button
              onClick={() => {
                setShowResetConfirm(false);
                onResetChannel();
              }}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold"
            >
              Xác nhận khôi phục
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
};
