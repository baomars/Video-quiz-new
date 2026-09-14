import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { TimelineQuestionCue } from '../../../../remotion/types/index';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  ChevronDown,
  ChevronUp,
  Volume2,
  Clock,
  CheckCircle2,
  Split
} from 'lucide-react';
import { Button } from '../ui/button';

interface MultiTrackTimelineProps {
  cues: TimelineQuestionCue[];
  totalFrames: number;
  currentFrame: number;
  isPlaying: boolean;
  fps?: number;
  onSeekTo: (frame: number) => void;
  onTogglePlay: () => void;
  onRestart: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const MultiTrackTimeline: React.FC<MultiTrackTimelineProps> = ({
  cues,
  totalFrames,
  currentFrame,
  isPlaying,
  fps = 30,
  onSeekTo,
  onTogglePlay,
  onRestart,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const trackContainerRef = useRef<HTMLDivElement>(null);

  const safeTotalFrames = Math.max(1, totalFrames);
  const totalDurationSec = safeTotalFrames / fps;

  // Format time MM:SS.ms
  const formatTime = (f: number) => {
    const totalSec = Math.max(0, f) / fps;
    const m = Math.floor(totalSec / 60);
    const s = Math.floor(totalSec % 60);
    const ms = Math.floor((totalSec % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  // Convert click or drag clientX to frame
  const clientXToFrame = useCallback(
    (clientX: number) => {
      if (!trackContainerRef.current) return 0;
      const rect = trackContainerRef.current.getBoundingClientRect();
      const clickRatio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return Math.round(clickRatio * (safeTotalFrames - 1));
    },
    [safeTotalFrames]
  );

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const frame = clientXToFrame(e.clientX);
    onSeekTo(frame);
    setIsScrubbing(true);
  };

  useEffect(() => {
    if (!isScrubbing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const frame = clientXToFrame(e.clientX);
      onSeekTo(frame);
    };

    const handleMouseUp = () => {
      setIsScrubbing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isScrubbing, clientXToFrame, onSeekTo]);

  // Current active question index
  const activeCueIdx = cues.findIndex(
    (c) => currentFrame >= c.startFrame && currentFrame < c.endFrame
  );

  const handlePrevQuestion = () => {
    if (activeCueIdx > 0) {
      onSeekTo(cues[activeCueIdx - 1].startFrame);
    } else {
      onSeekTo(0);
    }
  };

  const handleNextQuestion = () => {
    if (activeCueIdx >= 0 && activeCueIdx < cues.length - 1) {
      onSeekTo(cues[activeCueIdx + 1].startFrame);
    }
  };

  // Playhead progress percentage
  const playheadPct = Math.max(0, Math.min(100, (currentFrame / safeTotalFrames) * 100));

  // Collapsed compact mini-bar (32px)
  if (isCollapsed) {
    return (
      <div className="h-8 bg-slate-950 border-t border-slate-800 px-3 flex items-center justify-between text-xs text-slate-400 select-none shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleCollapse}
            className="flex items-center gap-1.5 font-bold text-slate-300 hover:text-amber-400 transition"
          >
            <ChevronUp size={14} className="text-amber-400" />
            <span>Timeline ({cues.length} câu • {formatTime(safeTotalFrames)})</span>
          </button>
          <span className="font-mono text-amber-400 font-bold text-[11px]">{formatTime(currentFrame)}</span>
          <span className="text-[10px] text-slate-500">| F {currentFrame}</span>
        </div>

        {/* Mini progress scrubber */}
        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            onSeekTo(Math.round(pct * (safeTotalFrames - 1)));
          }}
          className="flex-1 max-w-xs mx-4 h-1.5 bg-slate-800 rounded-full cursor-pointer overflow-hidden relative"
        >
          <div
            className="h-full bg-amber-500 rounded-full"
            style={{ width: `${playheadPct}%` }}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            className="p-1 text-slate-300 hover:text-white"
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
          </button>
          <Button
            size="iconSm"
            variant="ghost"
            onClick={onToggleCollapse}
            className="h-6 w-6 text-slate-400 hover:text-white"
            title="Mở rộng timeline"
          >
            <ChevronUp size={14} />
          </Button>
        </div>
      </div>
    );
  }

  // Expanded Compact Timeline (Total height 78px, saves ~160px for Video Preview!)
  return (
    <div className="bg-slate-950 border-t border-slate-800 flex flex-col select-none shrink-0 z-20 shadow-2xl h-[78px]">
      {/* 1. Control & Jump Header (28px) */}
      <div className="h-7 bg-slate-900 border-b border-slate-800/80 px-2.5 flex items-center justify-between shrink-0">
        {/* Playback Controls & Timecode */}
        <div className="flex items-center gap-1.5">
          <Button
            size="iconSm"
            variant="ghost"
            onClick={handlePrevQuestion}
            className="h-6 w-6 text-slate-400 hover:text-white p-0"
            title="Về câu trước"
          >
            <SkipBack size={12} />
          </Button>

          <button
            onClick={onTogglePlay}
            className="w-6 h-6 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center font-bold transition shadow-xs active:scale-95"
            title={isPlaying ? 'Tạm dừng (Space)' : 'Phát (Space)'}
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
          </button>

          <Button
            size="iconSm"
            variant="ghost"
            onClick={handleNextQuestion}
            className="h-6 w-6 text-slate-400 hover:text-white p-0"
            title="Sang câu tiếp"
          >
            <SkipForward size={12} />
          </Button>

          <Button
            size="iconSm"
            variant="ghost"
            onClick={onRestart}
            className="h-6 w-6 text-slate-400 hover:text-white p-0"
            title="Về đầu video"
          >
            <RotateCcw size={11} />
          </Button>

          {/* Timecode & Frame */}
          <div className="flex items-center gap-1 font-mono text-[11px] bg-slate-950/80 border border-slate-800 px-1.5 py-0.5 rounded ml-1">
            <span className="text-amber-400 font-bold">{formatTime(currentFrame)}</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400">{formatTime(safeTotalFrames)}</span>
            <span className="text-slate-500 text-[10px]">| F {currentFrame}</span>
          </div>
        </div>

        {/* Center: Question Navigation Pills */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-sm py-0.5">
          {cues.map((c, i) => (
            <button
              key={c.questionIndex}
              onClick={() => onSeekTo(c.startFrame)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition shrink-0 ${
                activeCueIdx === i
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700/60 hover:text-slate-200'
              }`}
            >
              Q{i + 1}
            </button>
          ))}
        </div>

        {/* Right: Phase Legend & Collapse */}
        <div className="flex items-center gap-2 text-[10px]">
          <div className="hidden sm:flex items-center gap-2 text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
              <span>Hỏi (TTS)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              <span>Đếm</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>Đáp án</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
              <span>Chuyển</span>
            </span>
          </div>

          <div className="h-3 w-px bg-slate-800 mx-0.5" />

          {onToggleCollapse && (
            <Button
              size="iconSm"
              variant="ghost"
              onClick={onToggleCollapse}
              className="h-6 w-6 text-slate-400 hover:text-white p-0"
              title="Thu nhỏ timeline"
            >
              <ChevronDown size={14} />
            </Button>
          )}
        </div>
      </div>

      {/* 2. Compact Visual Track (48px) */}
      <div
        ref={trackContainerRef}
        onMouseDown={handleMouseDown}
        className="flex-1 relative bg-slate-950 overflow-hidden cursor-pointer select-none px-1 py-1 flex items-center"
      >
        {/* Questions Clips Flow */}
        <div className="w-full h-full flex items-center gap-1 relative rounded overflow-hidden bg-slate-900/50 p-0.5 border border-slate-800/70">
          {cues.map((cue, idx) => {
            const cueDuration = Math.max(1, cue.durationFrames || (cue.endFrame - cue.startFrame) || 30);
            const cuePct = (cueDuration / safeTotalFrames) * 100;
            const p = cue.phases || {
              introStart: cue.startFrame,
              questionTtsStart: cue.startFrame,
              questionTtsEnd: cue.startFrame + Math.round(cueDuration * 0.3),
              countdownStart: cue.startFrame + Math.round(cueDuration * 0.3),
              countdownEnd: cue.startFrame + Math.round(cueDuration * 0.7),
              revealStart: cue.startFrame + Math.round(cueDuration * 0.7),
              explanationTtsStart: cue.startFrame + Math.round(cueDuration * 0.7),
              explanationTtsEnd: cue.endFrame
            };

            // Compute phase percentages within this question
            const qTtsDuration = Math.max(0, (p.questionTtsEnd || (p.introStart + 90)) - p.introStart);
            const cdDuration = Math.max(0, (p.countdownEnd || p.countdownStart) - p.countdownStart);
            const expDuration = Math.max(0, (p.explanationTtsEnd || p.revealStart) - p.revealStart);
            const transDuration = Math.max(0, cueDuration - ((p.explanationTtsEnd || cue.endFrame) - cue.startFrame));

            const qTtsPct = (qTtsDuration / cueDuration) * 100;
            const cdPct = (cdDuration / cueDuration) * 100;
            const expPct = (expDuration / cueDuration) * 100;
            const transPct = Math.max(0, 100 - (qTtsPct + cdPct + expPct));

            const isActive = activeCueIdx === idx;

            return (
              <div
                key={cue.questionIndex}
                style={{ width: `${cuePct}%` }}
                className={`h-full rounded relative overflow-hidden flex flex-col justify-between border transition-all ${
                  isActive
                    ? 'border-amber-400/80 shadow-[0_0_8px_rgba(245,158,11,0.25)]'
                    : 'border-slate-700/60 opacity-90 hover:opacity-100'
                }`}
              >
                {/* Header label */}
                <div className="h-3.5 px-1.5 flex items-center justify-between text-[9px] font-mono font-bold bg-slate-950/70 text-slate-300">
                  <span className="truncate">Câu {idx + 1}</span>
                  <span className="text-slate-400 text-[8px]">{(cueDuration / fps).toFixed(1)}s</span>
                </div>

                {/* 4 Phase Blocks Bar */}
                <div className="flex-1 flex items-center overflow-hidden">
                  {/* Phase 1: Question & TTS */}
                  <div
                    style={{ width: `${qTtsPct}%` }}
                    className="h-full bg-indigo-600/70 hover:bg-indigo-500/90 border-r border-indigo-500/40 flex items-center justify-center text-[9px] font-semibold text-indigo-100 px-0.5 overflow-hidden transition"
                    title={`Câu ${idx + 1}: Hỏi & Giọng đọc TTS (${(qTtsDuration / fps).toFixed(1)}s)`}
                  >
                    <span className="truncate flex items-center gap-0.5">
                      <Volume2 size={9} className="shrink-0" />
                      <span className="hidden md:inline">Hỏi</span>
                    </span>
                  </div>

                  {/* Phase 2: Countdown */}
                  <div
                    style={{ width: `${cdPct}%` }}
                    className="h-full bg-amber-600/70 hover:bg-amber-500/90 border-r border-amber-500/40 flex items-center justify-center text-[9px] font-semibold text-amber-100 px-0.5 overflow-hidden transition"
                    title={`Câu ${idx + 1}: Đếm ngược (${(cdDuration / fps).toFixed(1)}s)`}
                  >
                    <span className="truncate flex items-center gap-0.5">
                      <Clock size={9} className="shrink-0" />
                      <span className="hidden md:inline">Đếm</span>
                    </span>
                  </div>

                  {/* Phase 3: Reveal & Explanation TTS */}
                  <div
                    style={{ width: `${expPct}%` }}
                    className="h-full bg-emerald-600/70 hover:bg-emerald-500/90 border-r border-emerald-500/40 flex items-center justify-center text-[9px] font-semibold text-emerald-100 px-0.5 overflow-hidden transition"
                    title={`Câu ${idx + 1}: Đáp án & Giọng đọc TTS (${(expDuration / fps).toFixed(1)}s)`}
                  >
                    <span className="truncate flex items-center gap-0.5">
                      <CheckCircle2 size={9} className="shrink-0" />
                      <span className="hidden md:inline">Đáp án</span>
                    </span>
                  </div>

                  {/* Phase 4: Transition */}
                  {transPct > 0 && (
                    <div
                      style={{ width: `${transPct}%` }}
                      className="h-full bg-rose-600/70 hover:bg-rose-500/90 flex items-center justify-center text-[8px] font-semibold text-rose-100 px-0.5 overflow-hidden transition"
                      title={`Chuyển câu / Đệm kết thúc (${(transDuration / fps).toFixed(1)}s)`}
                    >
                      <Split size={8} className="shrink-0" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Realtime Playhead Scrubber Needle */}
        <div
          className="absolute top-0 bottom-0 pointer-events-none z-30 transition-[left] duration-75"
          style={{ left: `${playheadPct}%` }}
        >
          {/* Top Diamond Head */}
          <div className="w-2.5 h-2.5 -ml-[5px] bg-amber-400 rotate-45 border border-amber-200 shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
          {/* Vertical Needle Line */}
          <div className="w-[1.5px] h-full bg-amber-400 shadow-[0_0_4px_rgba(245,158,11,0.9)]" />
        </div>
      </div>
    </div>
  );
};
