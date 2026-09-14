import React from 'react';
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Download,
  Film,
  Maximize2,
  X,
  Boxes,
  Zap
} from 'lucide-react';
import { Button } from '../ui/button';

export interface StageLog {
  id: string;
  name: string;
  order: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  progress: number;
  message?: string;
  error?: string;
}

export interface RenderLogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  stage: string;
  message: string;
}

export interface RenderJob {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  stage: string;
  currentStageId?: string;
  stages?: StageLog[];
  logs?: RenderLogEntry[];
  error?: string;
  errorStage?: string;
  outputUrl?: string;
  outputPath?: string;
  fileSizeBytes?: number;
  durationSec?: number;
  currentFps?: number;
  renderSpeed?: number;
  currentFrame?: number;
  totalFrames?: number;
  elapsedSec?: number;
  etaSec?: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface BatchRenderJob {
  batchId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalVideos: number;
  completedVideosCount: number;
  currentVideoIndex: number;
  currentJobId?: string;
  progress: number;
  stage: string;
  currentFps?: number;
  renderSpeed?: number;
  currentFrame?: number;
  totalFrames?: number;
  elapsedSec?: number;
  etaSec?: number;
  completedVideos: Array<{
    index: number;
    jobId: string;
    outputUrl?: string;
    fileSizeBytes?: number;
    durationSec?: number;
    questionCount: number;
    status: 'completed' | 'failed';
    error?: string;
  }>;
  error?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

interface BackgroundRenderWidgetProps {
  jobState: RenderJob | null;
  batchState: BatchRenderJob | null;
  onOpenDetails: () => void;
  onDismiss: () => void;
}

export const BackgroundRenderWidget: React.FC<BackgroundRenderWidgetProps> = ({
  jobState,
  batchState,
  onOpenDetails,
  onDismiss
}) => {
  // If no active or recent jobs, render nothing
  if (!jobState && !batchState) return null;

  const isBatch = Boolean(batchState && (!jobState || batchState.status === 'processing'));

  // Single render data
  if (!isBatch && jobState) {
    const isProcessing = jobState.status === 'processing' || jobState.status === 'pending';
    const isCompleted = jobState.status === 'completed';
    const isFailed = jobState.status === 'failed';

    return (
      <div className="fixed bottom-24 right-5 z-50 w-84 bg-slate-950/95 backdrop-blur-md border border-slate-700/80 shadow-[0_8px_30px_rgb(0,0,0,0.6)] rounded-xl p-3.5 text-slate-100 transition-all animate-in fade-in slide-in-from-bottom-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {isProcessing && (
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Loader2 size={13} className="animate-spin" />
              </div>
            )}
            {isCompleted && (
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 size={14} />
              </div>
            )}
            {isFailed && (
              <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <AlertCircle size={14} />
              </div>
            )}

            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{isProcessing ? 'Render chạy nền' : isCompleted ? 'Render hoàn tất' : 'Render thất bại'}</span>
                {isProcessing && (
                  <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded font-mono">
                    {jobState.progress}%
                  </span>
                )}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onOpenDetails}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
              title="Mở bảng chi tiết"
            >
              <Maximize2 size={13} />
            </button>
            <button
              onClick={onDismiss}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
              title="Ẩn thông báo"
            >
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full transition-all duration-300 ${
              isCompleted
                ? 'bg-emerald-500'
                : isFailed
                ? 'bg-rose-500'
                : 'bg-gradient-to-r from-amber-500 to-amber-400'
            }`}
            style={{ width: `${isCompleted ? 100 : jobState.progress}%` }}
          />
        </div>

        {/* Status Line */}
        <div className="text-[11px] text-slate-300 line-clamp-1 mb-2.5">
          {isProcessing ? (
            <span className="text-slate-300">
              {jobState.stage || 'Đang xử lý pipeline render...'}
            </span>
          ) : isCompleted ? (
            <span className="text-emerald-300">
              Video đã sẵn sàng ({((jobState.fileSizeBytes || 0) / (1024 * 1024)).toFixed(1)} MB)
            </span>
          ) : (
            <span className="text-rose-400 line-clamp-1">
              {jobState.error || 'Có lỗi xảy ra'}
            </span>
          )}
        </div>

        {/* Bottom Metrics / Action Row */}
        <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-800/80">
          {isProcessing ? (
            <>
              <div className="flex items-center gap-2 text-slate-400 font-mono">
                {jobState.currentFps ? <span>{jobState.currentFps} FPS</span> : null}
                {jobState.etaSec ? <span>ETA ~{jobState.etaSec}s</span> : null}
              </div>
              <button
                onClick={onOpenDetails}
                className="text-amber-400 hover:text-amber-300 font-semibold transition underline underline-offset-2"
              >
                Xem chi tiết
              </button>
            </>
          ) : isCompleted ? (
            <>
              <a
                href={jobState.outputUrl}
                download
                className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/30 transition"
              >
                <Download size={11} />
                <span>Tải Video MP4</span>
              </a>
              <button
                onClick={onOpenDetails}
                className="text-slate-400 hover:text-slate-200 transition"
              >
                Xem lịch sử
              </button>
            </>
          ) : (
            <button
              onClick={onOpenDetails}
              className="text-rose-400 hover:text-rose-300 font-semibold"
            >
              Xem chi tiết lỗi
            </button>
          )}
        </div>
      </div>
    );
  }

  // Batch render data
  if (batchState) {
    const isProcessing = batchState.status === 'processing' || batchState.status === 'pending';
    const isCompleted = batchState.status === 'completed';
    const isFailed = batchState.status === 'failed';

    return (
      <div className="fixed bottom-24 right-5 z-50 w-88 bg-slate-950/95 backdrop-blur-md border border-slate-700/80 shadow-[0_8px_30px_rgb(0,0,0,0.6)] rounded-xl p-3.5 text-slate-100 transition-all animate-in fade-in slide-in-from-bottom-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {isProcessing ? (
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Boxes size={13} className="animate-pulse" />
              </div>
            ) : isCompleted ? (
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 size={14} />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <AlertCircle size={14} />
              </div>
            )}

            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Render hàng loạt</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded font-mono">
                  {batchState.completedVideosCount}/{batchState.totalVideos} videos
                </span>
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onOpenDetails}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
              title="Mở bảng chi tiết"
            >
              <Maximize2 size={13} />
            </button>
            <button
              onClick={onDismiss}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
              title="Ẩn thông báo"
            >
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full transition-all duration-300 ${
              isCompleted
                ? 'bg-emerald-500'
                : isFailed
                ? 'bg-rose-500'
                : 'bg-gradient-to-r from-amber-500 to-amber-400'
            }`}
            style={{ width: `${isCompleted ? 100 : batchState.progress}%` }}
          />
        </div>

        {/* Status Line */}
        <div className="text-[11px] text-slate-300 line-clamp-1 mb-2.5">
          {batchState.stage || 'Đang render theo lô...'}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-800/80">
          <span className="text-slate-400 font-mono">
            Đã xong {batchState.completedVideosCount}/{batchState.totalVideos} video
          </span>
          <button
            onClick={onOpenDetails}
            className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2"
          >
            Mở chi tiết
          </button>
        </div>
      </div>
    );
  }

  return null;
};
