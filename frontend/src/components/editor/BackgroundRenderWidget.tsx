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

function formatTime(seconds?: number): string {
  if (!seconds || isNaN(seconds)) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
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

    const framesText = jobState.totalFrames
      ? `${jobState.currentFrame || 0}/${jobState.totalFrames}`
      : `${jobState.currentFrame || 0}`;
    const fpsText = (jobState.currentFps || 0).toFixed(1);
    const timeText = formatTime(jobState.elapsedSec);
    const statusText = isProcessing ? 'Rendering' : isCompleted ? 'Completed' : 'Failed';

    return (
      <div
        className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-50 flex items-center gap-2.5 bg-slate-950/95 hover:bg-slate-900/95 backdrop-blur-md border border-slate-700/80 hover:border-amber-500/50 shadow-[0_8px_30px_rgb(0,0,0,0.7)] rounded-full px-3.5 py-2 text-slate-100 transition-all cursor-pointer group animate-in fade-in slide-in-from-bottom-3"
        onClick={onOpenDetails}
        title="Bấm để xem chi tiết tiến trình render"
      >
        {/* Status Indicator Icon */}
        <div className="flex items-center justify-center shrink-0">
          {isProcessing && (
            <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Loader2 size={12} className="animate-spin" />
            </div>
          )}
          {isCompleted && (
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 size={13} />
            </div>
          )}
          {isFailed && (
            <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertCircle size={13} />
            </div>
          )}
        </div>

        {/* Compact Metrics Row */}
        <div className="flex items-center gap-2 text-xs font-mono select-none">
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
            className={`font-bold ${
              isProcessing
                ? 'text-amber-400'
                : isCompleted
                ? 'text-emerald-400'
                : 'text-rose-400'
            }`}
          >
            {statusText}
            {isProcessing && ` (${jobState.progress}%)`}
          </span>
        </div>

        {/* Quick Download if Completed */}
        {isCompleted && jobState.outputUrl && (
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
          title="Đóng"
        >
          <X size={12} />
        </button>
      </div>
    );
  }

  // Batch render data
  if (batchState) {
    const isProcessing = batchState.status === 'processing' || batchState.status === 'pending';
    const isCompleted = batchState.status === 'completed';
    const isFailed = batchState.status === 'failed';

    const framesText = batchState.totalFrames
      ? `${batchState.currentFrame || 0}/${batchState.totalFrames}`
      : `${batchState.currentFrame || 0}`;
    const fpsText = (batchState.currentFps || 0).toFixed(1);
    const timeText = formatTime(batchState.elapsedSec);
    const statusText = isProcessing ? 'Rendering' : isCompleted ? 'Completed' : 'Failed';

    return (
      <div
        className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-50 flex items-center gap-2.5 bg-slate-950/95 hover:bg-slate-900/95 backdrop-blur-md border border-slate-700/80 hover:border-amber-500/50 shadow-[0_8px_30px_rgb(0,0,0,0.7)] rounded-full px-3.5 py-2 text-slate-100 transition-all cursor-pointer group animate-in fade-in slide-in-from-bottom-3"
        onClick={onOpenDetails}
        title="Bấm để xem chi tiết tiến trình batch render"
      >
        <div className="flex items-center justify-center shrink-0">
          {isProcessing ? (
            <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Boxes size={12} className="animate-pulse" />
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

        <div className="flex items-center gap-2 text-xs font-mono select-none">
          <span className="text-amber-300 font-bold">
            [{batchState.completedVideosCount}/{batchState.totalVideos}]
          </span>
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
            className={`font-bold ${
              isProcessing
                ? 'text-amber-400'
                : isCompleted
                ? 'text-emerald-400'
                : 'text-rose-400'
            }`}
          >
            {statusText}
            {isProcessing && ` (${batchState.progress}%)`}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="p-1 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-full transition ml-0.5"
          title="Đóng"
        >
          <X size={12} />
        </button>
      </div>
    );
  }

  return null;
};
