import React, { useRef, useState, useEffect } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { QuizVideoComposition } from '../../../remotion/QuizVideoComposition';
import { VideoCompositionProps, TimelineQuestionCue } from '../../../remotion/types/index';
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  CheckCircle,
  ShieldCheck,
  ShieldAlert,
  Maximize2,
  Minimize2,
  SkipBack,
  SkipForward,
  Sparkles
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';

interface VideoPreviewProps {
  compositionProps: VideoCompositionProps;
  cues: TimelineQuestionCue[];
  totalFrames: number;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({
  compositionProps,
  cues,
  totalFrames
}) => {
  const playerRef = useRef<PlayerRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [zoomLevel, setZoomLevel] = useState<'fit' | 0.5 | 0.75 | 1.0>('fit');
  const [showSafeZone, setShowSafeZone] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const onTimeUpdate = () => {
      setCurrentFrame(player.getCurrentFrame());
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    player.addEventListener('timeupdate', onTimeUpdate);
    player.addEventListener('play', onPlay);
    player.addEventListener('pause', onPause);

    return () => {
      player.removeEventListener('timeupdate', onTimeUpdate);
      player.removeEventListener('play', onPlay);
      player.removeEventListener('pause', onPause);
    };
  }, []);

  const handleTogglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pause();
    } else {
      playerRef.current.play();
    }
  };

  const handleRestart = () => {
    if (!playerRef.current) return;
    playerRef.current.seekTo(0);
  };

  const handleSeekToFrame = (frame: number) => {
    if (!playerRef.current) return;
    playerRef.current.seekTo(frame);
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

  const formatSeconds = (f: number) => {
    const totalSec = f / 30;
    const m = Math.floor(totalSec / 60);
    const s = Math.floor(totalSec % 60);
    const ms = Math.floor((totalSec % 1) * 100);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const handleNextQuestion = () => {
    if (currentCueIndex < cues.length - 1) {
      handleSeekToFrame(cues[currentCueIndex + 1].startFrame);
    }
  };

  const handlePrevQuestion = () => {
    if (currentCueIndex > 0) {
      handleSeekToFrame(cues[currentCueIndex - 1].startFrame);
    } else {
      handleSeekToFrame(0);
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full w-full bg-slate-100/70 select-none relative overflow-hidden"
    >
      {/* Studio Canvas Floating Header */}
      <div className="h-12 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 flex items-center justify-between z-20 shrink-0 shadow-2xs">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 font-bold text-slate-700 bg-white shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Remotion Canvas (720×1280 @ 30fps)</span>
          </Badge>
        </div>

        {/* Zoom & Safe Zone Controls */}
        <div className="flex items-center gap-2">
          {/* Safe Zone Toggle Switch */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-600">Safe Zone</span>
            <Switch
              checked={showSafeZone}
              onCheckedChange={setShowSafeZone}
              className="scale-90"
            />
          </div>

          {/* Zoom Buttons */}
          <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setZoomLevel('fit')}
              className={`px-2 py-0.5 rounded-lg text-xs font-bold transition ${
                zoomLevel === 'fit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Fit
            </button>
            <button
              onClick={() => setZoomLevel(0.5)}
              className={`px-2 py-0.5 rounded-lg text-xs font-bold transition ${
                zoomLevel === 0.5 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              50%
            </button>
            <button
              onClick={() => setZoomLevel(0.75)}
              className={`px-2 py-0.5 rounded-lg text-xs font-bold transition ${
                zoomLevel === 0.75 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
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
            className="text-slate-500 hover:text-slate-900"
            title="Toàn màn hình"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </Button>
        </div>
      </div>

      {/* Center Studio Viewport with Dot Grid */}
      <div className="flex-1 overflow-hidden relative flex items-center justify-center p-3 sm:p-6 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]">
        <div
          className="relative rounded-3xl overflow-hidden shadow-2xl border-[6px] border-slate-850 bg-black transition-all"
          style={{
            width: zoomLevel === 'fit' ? 'auto' : `${720 * (zoomLevel as number)}px`,
            height: zoomLevel === 'fit' ? '100%' : `${1280 * (zoomLevel as number)}px`,
            maxHeight: '100%',
            aspectRatio: '720 / 1280'
          }}
        >
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

          {/* Safe Zone Overlay */}
          {showSafeZone && (
            <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between">
              {/* Top Unsafe Zone (8%) */}
              <div className="w-full h-[8%] bg-rose-500/20 border-b border-dashed border-rose-500/60 flex items-center justify-center">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-900/90 text-rose-300">
                  ⚠️ Top UI TikTok / Facebook
                </span>
              </div>

              {/* Center Safe Area Guidelines */}
              <div className="flex-1 relative mx-[5%] my-1 border-2 border-dashed border-emerald-400/60 rounded-2xl flex items-center justify-between">
                {/* Right Unsafe Zone (12%) */}
                <div className="absolute right-0 top-0 bottom-0 w-[12%] bg-amber-500/15 border-l border-dashed border-amber-500/60 flex items-center justify-center">
                  <span className="text-[9px] uppercase font-bold tracking-tight text-amber-300 rotate-90 whitespace-nowrap bg-slate-900/90 px-1.5 py-0.5 rounded-full">
                    ❤️ Like / Share
                  </span>
                </div>

                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-slate-900/90 text-emerald-400 text-[9px] font-bold">
                  SAFE ZONE 9:16
                </div>
              </div>

              {/* Bottom Unsafe Zone (16%) */}
              <div className="w-full h-[16%] bg-rose-500/20 border-t border-dashed border-rose-500/60 flex items-center justify-center">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-900/90 text-rose-300">
                  ⚠️ Bottom UI: Caption & Sound
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Modern Transport Bar */}
      <div className="bg-white border-t border-slate-200 px-4 py-2.5 flex flex-col gap-2 shrink-0 shadow-xs z-20">
        {/* Timeline Quick Jump Markers */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 flex-1 mr-2">
            <span className="text-[11px] font-bold text-slate-500 mr-1 shrink-0">Nhảy câu:</span>
            {cues.map((c, idx) => (
              <button
                key={idx}
                onClick={() => handleSeekToFrame(c.startFrame)}
                className={`px-2.5 py-0.5 rounded-lg border font-bold text-xs transition shrink-0 ${
                  currentCueIndex === idx
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Câu {idx + 1}
              </button>
            ))}

            {activeCue && (
              <>
                <div className="h-4 w-px bg-slate-200 mx-1 shrink-0" />
                <button
                  onClick={() => handleSeekToFrame(activeCue.phases.countdownStart)}
                  className="px-2 py-0.5 bg-amber-50 border border-amber-300 text-amber-800 rounded-lg hover:bg-amber-100 transition flex items-center gap-1 text-[11px] font-bold shrink-0"
                >
                  <Clock size={11} />
                  <span>Đếm ngược</span>
                </button>
                <button
                  onClick={() => handleSeekToFrame(activeCue.phases.revealStart)}
                  className="px-2 py-0.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg hover:bg-emerald-100 transition flex items-center gap-1 text-[11px] font-bold shrink-0"
                >
                  <CheckCircle size={11} />
                  <span>Mở đáp án</span>
                </button>
              </>
            )}
          </div>

          {/* Timecode */}
          <div className="font-mono text-slate-800 font-bold shrink-0 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200 text-xs">
            <span className="text-amber-700">{formatSeconds(currentFrame)}</span>
            <span className="text-slate-400 text-[11px] ml-1">
              / {formatSeconds(totalFrames)}
            </span>
          </div>
        </div>

        {/* Main Controls & Scrubber */}
        <div className="flex items-center gap-3">
          {/* Prev Question */}
          <Button
            size="iconSm"
            variant="ghost"
            onClick={handlePrevQuestion}
            className="text-slate-600 hover:text-slate-900"
            title="Câu trước"
          >
            <SkipBack size={15} />
          </Button>

          {/* Play/Pause Main Button */}
          <button
            onClick={handleTogglePlay}
            className="w-9 h-9 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center transition shadow-xs active:scale-95 shrink-0 font-bold"
          >
            {isPlaying ? <Pause size={17} /> : <Play size={17} className="ml-0.5" />}
          </button>

          {/* Next Question */}
          <Button
            size="iconSm"
            variant="ghost"
            onClick={handleNextQuestion}
            className="text-slate-600 hover:text-slate-900"
            title="Câu kế tiếp"
          >
            <SkipForward size={15} />
          </Button>

          {/* Restart */}
          <Button
            size="iconSm"
            variant="ghost"
            onClick={handleRestart}
            className="text-slate-600 hover:text-slate-900"
            title="Xem lại từ đầu"
          >
            <RotateCcw size={15} />
          </Button>

          {/* Timeline Scrubber */}
          <div className="flex-1 flex items-center">
            <input
              type="range"
              min={0}
              max={Math.max(1, totalFrames - 1)}
              value={currentFrame}
              onChange={(e) => handleSeekToFrame(Number(e.target.value))}
              className="w-full accent-amber-500 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
