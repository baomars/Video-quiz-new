import React, { useState } from 'react';
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Download,
  Film,
  X,
  Boxes,
  ChevronUp,
  ChevronDown,
  Terminal,
  Clock,
  Gauge,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Button } from '../ui/button';

import type { RenderJob, BatchRenderJob } from './RenderTab';
export type { RenderJob, BatchRenderJob };

interface BackgroundRenderWidgetProps {
  jobState: RenderJob | null;
  batchState: BatchRenderJob | null;
  videoTitle?: string;
  onOpenDetails?: () => void;
  onDismiss: () => void;
}

function formatTime(seconds?: number): string {
  if (!seconds || isNaN(seconds)) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export const BackgroundRenderWidget: React.FC<BackgroundRenderWidgetProps> = ({
  jobState,
  batchState,
  videoTitle = 'Quiz Video 9:16',
  onOpenDetails,
  onDismiss
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // If no active or recent jobs, render nothing
  if (!jobState && !batchState) return null;

  const isBatch = Boolean(batchState && (!jobState || batchState.status === 'processing'));

  // Active status data
  const currentStatus = isBatch ? batchState?.status : jobState?.status;
  const isProcessing = currentStatus === 'processing' || currentStatus === 'pending';
  const isCompleted = currentStatus === 'completed';
  const isFailed = currentStatus === 'failed';

  const progress = isBatch ? (batchState?.progress || 0) : (jobState?.progress || 0);
  const currentFps = (isBatch ? batchState?.currentFps : jobState?.currentFps) || 0;
  const currentFrame = (isBatch ? batchState?.currentFrame : jobState?.currentFrame) || 0;
  const totalFrames = (isBatch ? batchState?.totalFrames : jobState?.totalFrames) || 0;
  const elapsedSec = (isBatch ? batchState?.elapsedSec : jobState?.elapsedSec) || 0;
  const etaSec = isBatch ? batchState?.etaSec : jobState?.etaSec;

  const framesText = totalFrames ? `${currentFrame}/${totalFrames}` : `${currentFrame}`;
  const fpsText = currentFps.toFixed(1);
  const timeText = formatTime(elapsedSec);
  const etaText = etaSec ? `ETA ${formatTime(etaSec)}` : null;

  const statusLabel = isProcessing ? 'Rendering' : isCompleted ? 'Completed' : 'Failed';
  const displayTitle = isBatch
    ? `Batch: Video ${batchState!.completedVideosCount + (isProcessing ? 1 : 0)} / ${batchState!.totalVideos}`
    : videoTitle;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-50 flex flex-col items-end gap-2">
      {/* 1. COMPACT ACTIVE RENDER POPOVER (Opened when user clicks widget) */}
      {isExpanded && (
        <div className="w-[360px] sm:w-[400px] max-w-[calc(100vw-24px)] bg-slate-950/98 backdrop-blur-xl border border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.85)] rounded-2xl p-4 text-slate-100 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                  isProcessing
                    ? 'bg-amber-500/20 text-amber-400'
                    : isCompleted
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {isProcessing ? <Loader2 size={13} className="animate-spin" /> : isCompleted ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
              </div>
              <span className="font-extrabold text-xs text-white">Tiến Trình Active Render</span>
            </div>
            <div className="flex items-center gap-1">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isProcessing
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : isCompleted
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {statusLabel}
              </span>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition ml-1"
                title="Thu gọn"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Active Job Information */}
          <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-200 truncate pr-2" title={displayTitle}>
                {displayTitle}
              </span>
              <span className="font-black text-xs text-amber-400 font-mono shrink-0">
                {progress}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  isCompleted ? 'bg-emerald-500' : isFailed ? 'bg-rose-500' : 'bg-gradient-to-r from-amber-500 to-amber-400'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] font-mono text-slate-400">
              <div className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/50 flex flex-col">
                <span className="text-[9px] text-slate-400 uppercase font-semibold">FPS</span>
                <span className="font-bold text-slate-200">{fpsText}</span>
              </div>
              <div className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/50 flex flex-col">
                <span className="text-[9px] text-slate-400 uppercase font-semibold">Frames</span>
                <span className="font-bold text-slate-200 truncate">{framesText}</span>
              </div>
              <div className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/50 flex flex-col">
                <span className="text-[9px] text-slate-400 uppercase font-semibold">Thời gian</span>
                <span className="font-bold text-slate-200">{timeText}</span>
              </div>
            </div>

            {etaText && isProcessing && (
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                <span className="flex items-center gap-1 text-slate-400">
                  <Clock size={11} /> Ước tính còn lại:
                </span>
                <span className="font-bold text-amber-300 font-mono">{etaText}</span>
              </div>
            )}
          </div>

          {/* Batch Videos Queue / Completed List */}
          {isBatch && batchState && batchState.completedVideos && batchState.completedVideos.length > 0 && (
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Video đã hoàn tất ({batchState.completedVideos.length}/{batchState.totalVideos})
              </span>
              <div className="space-y-1">
                {batchState.completedVideos.map((vid) => (
                  <div
                    key={vid.index}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/60 text-xs"
                  >
                    <div className="flex items-center gap-1.5 truncate pr-2">
                      <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                      <span className="text-slate-300 truncate">Video #{vid.index + 1}</span>
                    </div>
                    {vid.outputUrl && (
                      <a
                        href={vid.outputUrl}
                        download
                        className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-semibold text-[10px] flex items-center gap-1 transition shrink-0"
                      >
                        <Download size={10} /> Tải MP4
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Single Video Quick Download when Completed */}
          {!isBatch && isCompleted && jobState?.outputUrl && (
            <a
              href={jobState.outputUrl}
              download
              className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-950/40"
            >
              <Download size={14} />
              <span>Tải Video MP4 Về Máy</span>
            </a>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-xs">
            {onOpenDetails ? (
              <button
                onClick={() => {
                  setIsExpanded(false);
                  onOpenDetails();
                }}
                className="text-slate-400 hover:text-slate-200 text-[11px] font-medium flex items-center gap-1 transition"
              >
                <Terminal size={12} />
                <span>Xem Logs Chi Tiết</span>
              </button>
            ) : <span />}
            <button
              onClick={() => setIsExpanded(false)}
              className="text-slate-400 hover:text-slate-200 text-[11px] font-semibold transition"
            >
              Thu nhỏ widget
            </button>
          </div>
        </div>
      )}

      {/* 2. COMPACT FLOATING STATUS PILL (Always visible when render is running or recently finished) */}
      <div
        className="flex items-center gap-2.5 bg-slate-950/95 hover:bg-slate-900/95 backdrop-blur-md border border-slate-700/80 hover:border-amber-500/50 shadow-[0_8px_30px_rgb(0,0,0,0.7)] rounded-full px-3.5 py-2 text-slate-100 transition-all cursor-pointer group animate-in fade-in slide-in-from-bottom-3 select-none"
        onClick={() => setIsExpanded(!isExpanded)}
        title="Bấm để xem popover tiến trình render compact"
      >
        {/* Status Indicator Icon */}
        <div className="flex items-center justify-center shrink-0">
          {isProcessing ? (
            <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Loader2 size={12} className="animate-spin" />
            </div>
          ) : isCompleted ? (
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 size={13} />
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertCircle size={13} />
            </div>
          )}
        </div>

        {/* Compact Metrics Row */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-200 font-bold max-w-[130px] truncate" title={displayTitle}>
            {displayTitle}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300">
            <strong className="text-slate-400 font-medium">Frames:</strong> {framesText}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300">
            <strong className="text-slate-400 font-medium">FPS:</strong> {fpsText}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300">
            <strong className="text-slate-400 font-medium">Time:</strong> {timeText}
          </span>
          <span className="text-slate-600">|</span>
          <span
            className={`font-black ${
              isProcessing
                ? 'text-amber-400'
                : isCompleted
                ? 'text-emerald-400'
                : 'text-rose-400'
            }`}
          >
            {statusLabel}
            {isProcessing && ` (${progress}%)`}
          </span>
        </div>

        {/* Expand/Collapse Chevron */}
        <div className="text-slate-400 group-hover:text-slate-200 transition ml-0.5">
          {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </div>

        {/* Quick Download if Completed */}
        {!isBatch && isCompleted && jobState?.outputUrl && (
          <a
            href={jobState.outputUrl}
            download
            onClick={(e) => e.stopPropagation()}
            className="p-1 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 rounded-full transition ml-0.5"
            title="Tải video MP4"
          >
            <Download size={13} />
          </a>
        )}

        {/* Dismiss Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="p-1 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-full transition ml-0.5"
          title="Đóng widget"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
};
