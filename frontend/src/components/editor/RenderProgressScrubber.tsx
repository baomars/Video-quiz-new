import React from 'react';
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  Clock,
  Film,
  Mic,
  Layers,
  Sparkles,
  Music,
  FileCheck2,
  Zap,
  Activity
} from 'lucide-react';

export interface StageInfo {
  id: string;
  name: string;
  order: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress?: number;
  durationMs?: number;
  message?: string;
  error?: string;
}

export interface RenderProgressScrubberProps {
  progress: number; // 0 - 100
  status: 'pending' | 'queued' | 'processing' | 'completed' | 'failed';
  currentStageName?: string;
  currentFps?: number;
  renderSpeed?: number;
  currentFrame?: number;
  totalFrames?: number;
  elapsedSec?: number;
  etaSec?: number;
  stages?: StageInfo[];
  renderPreset?: string;
}

export interface ChapterConfig {
  id: string;
  name: string;
  shortName: string;
  startPct: number;
  endPct: number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export const PIPELINE_CHAPTERS: ChapterConfig[] = [
  { id: 'stage_1_prepare', name: '1. Chuẩn bị tài nguyên', shortName: '1. Chuẩn bị', startPct: 0, endPct: 10, icon: Layers },
  { id: 'stage_2_tts', name: '2. Giọng đọc Edge-TTS', shortName: '2. Edge-TTS', startPct: 10, endPct: 25, icon: Mic },
  { id: 'stage_3_timeline', name: '3. Tính toán Timeline', shortName: '3. Timeline', startPct: 25, endPct: 35, icon: Clock },
  { id: 'stage_4_render_frames', name: '4. Render khung hình (Chromium)', shortName: '4. Frames', startPct: 35, endPct: 75, icon: Film },
  { id: 'stage_5_process_audio', name: '5. Hòa âm Audio (BGM & SFX)', shortName: '5. Hòa âm', startPct: 75, endPct: 88, icon: Music },
  { id: 'stage_6_ffmpeg_mux', name: '6. Ghép Video & Audio (FFmpeg)', shortName: '6. Muxing', startPct: 88, endPct: 98, icon: Sparkles },
  { id: 'stage_7_export', name: '7. Xuất bản & Hoàn tất MP4', shortName: '7. Xuất MP4', startPct: 98, endPct: 100, icon: FileCheck2 },
];

function formatTime(seconds?: number): string {
  if (seconds === undefined || seconds === null || isNaN(seconds) || seconds < 0) return '00:00';
  const s = Math.round(seconds);
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const RenderProgressScrubber: React.FC<RenderProgressScrubberProps> = ({
  progress,
  status,
  currentStageName,
  currentFps = 0,
  renderSpeed = 0,
  currentFrame = 0,
  totalFrames = 0,
  elapsedSec = 0,
  etaSec = 0,
  stages = [],
  renderPreset
}) => {
  const clampedProgress = Math.max(0, Math.min(100, Math.round(progress)));
  const isFinished = status === 'completed' || clampedProgress >= 100;
  const isRunning = status === 'processing';
  const isQueued = status === 'queued';
  const isFailed = status === 'failed';

  // Find active chapter
  const activeChapter = PIPELINE_CHAPTERS.find(
    (c) => clampedProgress >= c.startPct && clampedProgress < c.endPct
  ) || (isFinished ? PIPELINE_CHAPTERS[PIPELINE_CHAPTERS.length - 1] : PIPELINE_CHAPTERS[0]);

  // Stage status helper
  const getStageStatus = (chapter: ChapterConfig) => {
    if (isFailed) {
      const match = stages.find((s) => s.id === chapter.id);
      if (match?.status === 'failed') return 'failed';
    }
    if (clampedProgress >= chapter.endPct || isFinished) return 'completed';
    if (clampedProgress >= chapter.startPct && clampedProgress < chapter.endPct && isRunning) return 'running';
    return 'pending';
  };

  const totalTimeEstimated = (elapsedSec || 0) + (etaSec || 0);

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl space-y-4">
      {/* 1. Header & Live Telemetry Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-3">
          {/* Status Indicator Pill */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-xs ${
              isFinished
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : isFailed
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : isQueued
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isFinished
                  ? 'bg-emerald-400'
                  : isFailed
                  ? 'bg-rose-400'
                  : isQueued
                  ? 'bg-amber-400'
                  : 'bg-amber-400 animate-ping'
              }`}
            />
            <span>
              {isFinished
                ? 'HOÀN TẤT'
                : isFailed
                ? 'THẤT BẠI'
                : isQueued
                ? 'TRONG HÀNG ĐỢI'
                : 'LIVE PIPELINE'}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-200">
                {currentStageName || activeChapter.name}
              </span>
              {renderPreset && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700 font-bold uppercase">
                  {renderPreset}
                </span>
              )}
            </div>
            {totalFrames > 0 && currentFrame > 0 && (
              <span className="text-[11px] font-mono text-slate-400 block">
                Khung hình: <b className="text-slate-200">{currentFrame}</b> / {totalFrames} frames ({Math.round((currentFrame / totalFrames) * 100)}%)
              </span>
            )}
          </div>
        </div>

        {/* Realtime Speed / FPS stats */}
        <div className="flex items-center gap-2 shrink-0">
          {isRunning && currentFps > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-xs font-mono">
              <Activity size={13} className="text-amber-400" />
              <span className="text-amber-300 font-bold">{currentFps.toFixed(1)} FPS</span>
              {renderSpeed > 0 && (
                <span className="text-slate-400 text-[11px]">({renderSpeed.toFixed(2)}x)</span>
              )}
            </div>
          )}

          {/* Master Percentage Display */}
          <div className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500/10 to-rose-500/10 border border-amber-500/30 text-amber-400 font-mono font-black text-sm sm:text-base">
            {clampedProgress}%
          </div>
        </div>
      </div>

      {/* 2. VIDEO PLAYER TIMELINE SCRUBBER TRACK */}
      <div className="space-y-2 select-none">
        {/* Scrubber Container */}
        <div className="relative w-full h-7 bg-slate-950 rounded-xl p-1 border border-slate-800 shadow-inner flex items-center">
          {/* Chapter Background Track Segments */}
          <div className="absolute inset-x-1 inset-y-1 rounded-lg overflow-hidden flex">
            {PIPELINE_CHAPTERS.map((chapter) => {
              const spanPct = chapter.endPct - chapter.startPct;
              const chStatus = getStageStatus(chapter);
              return (
                <div
                  key={chapter.id}
                  style={{ width: `${spanPct}%` }}
                  className={`relative h-full transition-colors border-r border-slate-900/80 ${
                    chStatus === 'completed'
                      ? 'bg-emerald-950/40'
                      : chStatus === 'running'
                      ? 'bg-amber-950/40'
                      : 'bg-slate-900/60'
                  }`}
                  title={`${chapter.name} (${chapter.startPct}% - ${chapter.endPct}%)`}
                >
                  {/* Subtle Chapter Marker Label if space permits */}
                  {spanPct >= 12 && (
                    <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-500 truncate pointer-events-none">
                      {chapter.shortName}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Elapsed Progress Bar (Active Buffer) */}
          <div
            className="absolute left-1 top-1 bottom-1 rounded-lg bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-400 transition-all duration-200 pointer-events-none shadow-md"
            style={{ width: `calc(${clampedProgress}% - 8px)` }}
          />

          {/* Playhead Scrubber Thumb (Live Position Indicator) */}
          <div
            className="absolute top-1/2 -translate-y-1/2 transition-all duration-200 pointer-events-none z-10"
            style={{ left: `calc(${Math.min(99, Math.max(1, clampedProgress))}% - 8px)` }}
          >
            <div className="relative flex items-center justify-center">
              {/* Outer pulsing halo when running */}
              {isRunning && (
                <span className="absolute w-6 h-6 rounded-full bg-amber-400/40 animate-ping" />
              )}
              {/* Playhead Pin */}
              <div className="w-4 h-4 rounded-full bg-white shadow-xl ring-2 ring-amber-400 border border-slate-900 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Video Player Time Readout Bar */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1 pt-0.5">
          {/* Left: Elapsed Time */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-300 font-bold">{formatTime(elapsedSec)}</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400">
              {totalTimeEstimated > 0 ? formatTime(totalTimeEstimated) : '--:--'}
            </span>
            <span className="text-[10px] text-slate-500 font-sans hidden sm:inline">(Đã chạy)</span>
          </div>

          {/* Center: Current Stage Tag */}
          <div className="text-[11px] text-amber-300 font-sans font-medium truncate max-w-[200px] sm:max-w-none text-center">
            {activeChapter.name} <span className="text-slate-500">({activeChapter.startPct}%→{activeChapter.endPct}%)</span>
          </div>

          {/* Right: ETA Remaining */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-500 font-sans hidden sm:inline">Còn lại:</span>
            <span className="text-amber-400 font-bold">
              ~{etaSec !== undefined && etaSec > 0 ? formatTime(etaSec) : '00:00'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. 7-STAGE PIPELINE STATUS CHIPS */}
      <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          <span>Chi Tiết 7 Giai Đoạn Pipeline</span>
          <span className="text-[10px] text-slate-500 font-normal">Tự động chuyển tiếp tuần tự</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-1.5">
          {PIPELINE_CHAPTERS.map((chapter) => {
            const chStatus = getStageStatus(chapter);
            const Icon = chapter.icon;
            const stageLog = stages.find((s) => s.id === chapter.id);

            return (
              <div
                key={chapter.id}
                className={`p-2 rounded-xl border transition flex flex-col justify-between gap-1 text-[11px] ${
                  chStatus === 'completed'
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                    : chStatus === 'running'
                    ? 'bg-amber-950/30 border-amber-500/50 text-amber-200 ring-1 ring-amber-500/40'
                    : chStatus === 'failed'
                    ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                    : 'bg-slate-800/40 border-slate-800 text-slate-500'
                }`}
              >
                {/* Top Row: Icon & Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 truncate">
                    <Icon size={13} className={
                      chStatus === 'completed'
                        ? 'text-emerald-400'
                        : chStatus === 'running'
                        ? 'text-amber-400'
                        : chStatus === 'failed'
                        ? 'text-rose-400'
                        : 'text-slate-500'
                    } />
                    <span className="font-bold truncate text-[10px] sm:text-[11px]">{chapter.shortName}</span>
                  </div>

                  {chStatus === 'completed' && (
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  )}
                  {chStatus === 'running' && (
                    <Loader2 size={13} className="text-amber-400 animate-spin shrink-0" />
                  )}
                  {chStatus === 'failed' && (
                    <AlertCircle size={13} className="text-rose-400 shrink-0" />
                  )}
                </div>

                {/* Bottom Row: Weight % and duration if available */}
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                  <span>{chapter.startPct}-{chapter.endPct}%</span>
                  {stageLog?.durationMs ? (
                    <span className="text-slate-300">{(stageLog.durationMs / 1000).toFixed(1)}s</span>
                  ) : (
                    <span>
                      {chStatus === 'completed' ? 'Xong' : chStatus === 'running' ? 'Đang chạy' : 'Chờ'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
