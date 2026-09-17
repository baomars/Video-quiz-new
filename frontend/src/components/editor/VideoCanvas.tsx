import React, { useRef, useState, useEffect } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { QuizVideoComposition } from '../../../../remotion/QuizVideoComposition';
import { VideoCompositionProps, TimelineQuestionCue } from '../../../../remotion/types/index';
import {
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  SkipBack,
  SkipForward,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Layers,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';

interface VideoCanvasProps {
  compositionProps: VideoCompositionProps;
  cues: TimelineQuestionCue[];
  totalFrames: number;
  currentFrame: number;
  isPlaying: boolean;
  playerRef: React.RefObject<PlayerRef>;
  onSeekTo: (frame: number) => void;
  onTogglePlay: () => void;
  onRestart: () => void;
  onSelectComponentKey?: (key: string) => void;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  resetKey?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class CanvasErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[VideoCanvas] Render error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-900 text-slate-200">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
            <span className="text-xl">⚠️</span>
          </div>
          <h4 className="font-bold text-sm text-slate-100 mb-1">Không thể tải Preview</h4>
          <p className="text-xs text-slate-400 mb-4 max-w-xs break-words">
            {this.state.error?.message || 'Đã xảy ra lỗi khi hiển thị preview.'}
          </p>
          <Button
            size="sm"
            variant="outline"
            className="border-slate-700 hover:bg-slate-800 text-xs"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              this.props.onReset?.();
            }}
          >
            Thử tải lại Preview
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const VideoCanvas: React.FC<VideoCanvasProps> = ({
  compositionProps,
  cues,
  totalFrames,
  currentFrame,
  isPlaying,
  playerRef,
  onSeekTo,
  onTogglePlay,
  onRestart,
  onSelectComponentKey
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState<'fit' | 0.5 | 0.75 | 1.0>('fit');
  const [showSafeZone, setShowSafeZone] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const formatSeconds = (f: number) => {
    const totalSec = f / 30;
    const m = Math.floor(totalSec / 60);
    const s = Math.floor(totalSec % 60);
    const ms = Math.floor((totalSec % 1) * 100);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
      setIsFullscreen(false);
    }
  };

  // Find active question index based on currentFrame
  const currentCueIndex = cues.findIndex(
    (c) => currentFrame >= c.startFrame && currentFrame < c.endFrame
  );
  const activeCue = currentCueIndex >= 0 ? cues[currentCueIndex] : cues[0];

  const handleNextQuestion = () => {
    if (currentCueIndex < cues.length - 1) {
      onSeekTo(cues[currentCueIndex + 1].startFrame);
    }
  };

  const handlePrevQuestion = () => {
    if (currentCueIndex > 0) {
      onSeekTo(cues[currentCueIndex - 1].startFrame);
    } else {
      onSeekTo(0);
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full w-full bg-slate-950 select-none relative overflow-hidden"
    >
      {/* 1. Top Sub-Bar: Canvas Info & Zoom/Safe-Zone Controls */}
      <div className="h-10 bg-slate-900/90 border-b border-slate-800/80 px-2.5 sm:px-4 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Badge className="bg-slate-800 border-slate-700 text-slate-300 gap-1.5 font-bold text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">Remotion Canvas (9:16 Portrait)</span>
            <span className="sm:hidden">9:16 Video</span>
          </Badge>
          {activeCue && (
            <span className="text-[11px] text-slate-400 font-semibold hidden md:inline">
              Đang xem: <strong className="text-amber-400">Câu #{currentCueIndex + 1}</strong>
            </span>
          )}
        </div>

        {/* Zoom & Safe Zone Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Safe Zone Toggle */}
          <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 bg-slate-800/80 rounded-lg border border-slate-700/70">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-300">
              <span className="hidden sm:inline">Safe Zone</span>
              <span className="sm:hidden">Safe</span>
            </span>
            <Switch
              checked={showSafeZone}
              onCheckedChange={setShowSafeZone}
              className="scale-75"
            />
          </div>

          {/* Zoom Buttons */}
          <div className="hidden sm:flex items-center gap-0.5 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/70 text-xs">
            <button
              onClick={() => setZoomLevel('fit')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                zoomLevel === 'fit'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              Fit
            </button>
            <button
              onClick={() => setZoomLevel(0.5)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                zoomLevel === 0.5
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              50%
            </button>
            <button
              onClick={() => setZoomLevel(0.75)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                zoomLevel === 0.75
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              75%
            </button>
          </div>

          {/* Fullscreen Button */}
          <Button
            size="iconSm"
            variant="ghost"
            onClick={handleToggleFullscreen}
            className="h-7 w-7 text-slate-400 hover:text-white"
            title="Toàn màn hình"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </Button>
        </div>
      </div>

      {/* 2. Center Viewport with Dot Grid & Phone Canvas */}
      <div className="flex-1 overflow-hidden relative flex items-center justify-center p-2 sm:p-4 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
        <div
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800 bg-black transition-all"
          style={{
            width: zoomLevel === 'fit' ? 'auto' : `${720 * (zoomLevel as number)}px`,
            height: zoomLevel === 'fit' ? '100%' : `${1280 * (zoomLevel as number)}px`,
            maxHeight: '100%',
            aspectRatio: '720 / 1280'
          }}
        >
          <CanvasErrorBoundary resetKey={compositionProps.template?.id || 'default'}>
            <Player
              ref={playerRef}
              component={QuizVideoComposition}
              inputProps={compositionProps}
              durationInFrames={totalFrames || 600}
              compositionWidth={720}
              compositionHeight={1280}
              fps={30}
              style={{
                width: '100%',
                height: '100%'
              }}
              controls={false}
              autoPlay={false}
              loop
            />
          </CanvasErrorBoundary>

          {/* Safe Zone Overlay */}
          {showSafeZone && (
            <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between">
              {/* Top Unsafe Zone (8%) */}
              <div className="w-full h-[8%] bg-rose-500/15 border-b border-dashed border-rose-500/50 flex items-center justify-center">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-950/80 text-rose-300">
                  ⚠️ Top UI TikTok / Reels
                </span>
              </div>

              {/* Center Safe Area Guidelines */}
              <div className="flex-1 relative mx-[5%] my-1 border-2 border-dashed border-emerald-400/50 rounded-2xl flex items-center justify-between">
                {/* Right Unsafe Zone (12%) */}
                <div className="absolute right-0 top-0 bottom-0 w-[12%] bg-amber-500/15 border-l border-dashed border-amber-500/50 flex items-center justify-center">
                  <span className="text-[9px] uppercase font-bold tracking-tight text-amber-300 rotate-90 whitespace-nowrap bg-slate-950/80 px-1.5 py-0.5 rounded-full">
                    ❤️ Like / Share
                  </span>
                </div>

                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-slate-950/80 text-emerald-400 text-[9px] font-bold">
                  SAFE ZONE 9:16
                </div>
              </div>

              {/* Bottom Unsafe Zone (16%) */}
              <div className="w-full h-[16%] bg-rose-500/15 border-t border-dashed border-rose-500/50 flex items-center justify-center">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-950/80 text-rose-300">
                  ⚠️ Bottom UI: Caption & Sound
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Bottom Transport Bar */}
      <div className="bg-slate-900 border-t border-slate-800 px-4 py-2 flex items-center justify-between shrink-0 z-20 shadow-md">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <Button
            size="iconSm"
            variant="ghost"
            onClick={handlePrevQuestion}
            className="h-8 w-8 text-slate-400 hover:text-white"
            title="Câu trước"
          >
            <SkipBack size={15} />
          </Button>

          <button
            onClick={onTogglePlay}
            className="w-9 h-9 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center transition shadow-md active:scale-95 shrink-0 font-bold cursor-pointer"
            title={isPlaying ? 'Tạm dừng' : 'Phát'}
          >
            {isPlaying ? <Pause size={17} /> : <Play size={17} className="ml-0.5" />}
          </button>

          <Button
            size="iconSm"
            variant="ghost"
            onClick={handleNextQuestion}
            className="h-8 w-8 text-slate-400 hover:text-white"
            title="Câu tiếp"
          >
            <SkipForward size={15} />
          </Button>

          <Button
            size="iconSm"
            variant="ghost"
            onClick={onRestart}
            className="h-8 w-8 text-slate-400 hover:text-white"
            title="Xem lại từ đầu"
          >
            <RotateCcw size={15} />
          </Button>

          {/* Quick jump to question phase */}
          {activeCue && (
            <div className="hidden md:flex items-center gap-1.5 ml-2 border-l border-slate-800 pl-2">
              <button
                onClick={() => onSeekTo(activeCue.phases.countdownStart)}
                className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-[11px] font-bold"
              >
                ⏱️ Countdown
              </button>
              <button
                onClick={() => onSeekTo(activeCue.phases.revealStart)}
                className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 text-[11px] font-bold"
              >
                ✅ Reveal
              </button>
            </div>
          )}
        </div>

        {/* Timecode Readout */}
        <div className="font-mono text-xs bg-slate-950 border border-slate-800 px-3 py-1 rounded-lg">
          <span className="text-amber-400 font-bold">{formatSeconds(currentFrame)}</span>
          <span className="text-slate-500 mx-1">/</span>
          <span className="text-slate-400">{formatSeconds(totalFrames)}</span>
        </div>
      </div>
    </div>
  );
};
