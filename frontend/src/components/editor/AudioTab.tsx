import React, { useState, useRef } from 'react';
import { Channel } from '../../../../remotion/types/index';
import { uploadAudio } from '../../services/api';
import {
  Music,
  Volume2,
  Play,
  Pause,
  Upload,
  RotateCcw,
  CheckCircle2,
  FileAudio,
  Sparkles,
  Loader2
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface AudioTabProps {
  channel: Channel;
  onChange: (updated: Channel) => void;
}

const DEFAULT_SFX: Record<string, string> = {
  tick: '/assets/audio/sfx/tick.wav',
  finish: '/assets/audio/sfx/finish.wav',
  reveal: '/assets/audio/sfx/reveal.wav',
  correct: '/assets/audio/sfx/correct.wav',
  transition: '/assets/audio/sfx/transition.wav'
};

export const AudioTab: React.FC<AudioTabProps> = ({ channel, onChange }) => {
  const audio = channel.audio;
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const [audioObj, setAudioObj] = useState<HTMLAudioElement | null>(null);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const updateAudio = (prop: string, value: any) => {
    onChange({
      ...channel,
      audio: {
        ...audio,
        [prop]: value
      }
    });
  };

  const updateSfxUrl = (key: string, url: string) => {
    onChange({
      ...channel,
      audio: {
        ...audio,
        sfx: {
          ...audio.sfx,
          [key]: url
        }
      }
    });
  };

  const updateSfxVolume = (key: string, value: number) => {
    onChange({
      ...channel,
      audio: {
        ...audio,
        volumes: {
          ...audio.volumes,
          [key]: value
        }
      }
    });
  };

  const togglePlayAudio = (url: string) => {
    if (!url) return;
    if (playingTrack === url) {
      audioObj?.pause();
      setPlayingTrack(null);
    } else {
      audioObj?.pause();
      const a = new Audio(url);
      a.play().catch((e) => {
        console.warn('Playback error:', e);
        setPlayingTrack(null);
      });
      a.onended = () => setPlayingTrack(null);
      a.onerror = () => setPlayingTrack(null);
      setAudioObj(a);
      setPlayingTrack(url);
    }
  };

  const handleUploadSfxFile = async (key: string, file: File) => {
    setUploadingKey(key);
    try {
      const res = await uploadAudio(file);
      updateSfxUrl(key, res.url);
    } catch (err: any) {
      alert(`Lỗi tải lên âm thanh (${key}): ${err.message}`);
    } finally {
      setUploadingKey(null);
    }
  };

  const handleResetSfx = (key: string) => {
    const defaultUrl = DEFAULT_SFX[key] || '';
    updateSfxUrl(key, defaultUrl);
  };

  const sfxList = [
    {
      key: 'tick',
      label: 'Tiếng tích tắc đếm ngược (Countdown Tick)',
      desc: 'Phát đều đặn mỗi giây trong lúc đếm ngược',
      url: audio.sfx.tick || DEFAULT_SFX.tick,
      vol: audio.volumes.tick ?? 0.6
    },
    {
      key: 'finish',
      label: 'Hết giờ đếm ngược (Countdown Finish Bell)',
      desc: 'Chuông báo hiệu ngay khi đồng hồ về 0',
      url: audio.sfx.finish || DEFAULT_SFX.finish,
      vol: audio.volumes.finish ?? 0.8
    },
    {
      key: 'reveal',
      label: 'Mở đáp án (Reveal Swoosh)',
      desc: 'Hiệu ứng mở hộp đáp án và hiển thị lời giải',
      url: audio.sfx.reveal || DEFAULT_SFX.reveal,
      vol: audio.volumes.reveal ?? 0.9
    },
    {
      key: 'correct',
      label: 'Đáp án chính xác (Correct Answer Chime)',
      desc: 'Chuông chúc mừng đáp án đúng nổi bật',
      url: audio.sfx.correct || DEFAULT_SFX.correct,
      vol: audio.volumes.correct ?? 1.0
    },
    {
      key: 'transition',
      label: 'Âm thanh chuyển câu (Transition Whoosh)',
      desc: 'Phát đúng khoảnh khắc câu hỏi tiếp theo bắt đầu xuất hiện',
      url: audio.sfx.transition || DEFAULT_SFX.transition,
      vol: audio.volumes.transition ?? 0.6
    }
  ];

  const getCleanFileName = (pathStr: string) => {
    if (!pathStr) return '';
    const parts = pathStr.split('/');
    return parts[parts.length - 1];
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Sound Effects SFX */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Volume2 size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                1. Bộ Hiệu Ứng Âm Thanh Kênh (Sound Effects SFX Set)
              </h3>
              <p className="text-xs text-slate-500">
                Đồng bộ tín hiệu thời gian, công bố đáp án và hiệu ứng chuyển câu
              </p>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1.5">
            <Sparkles size={12} className="text-amber-500" />
            <span>Hỗ trợ tải lên file MP3, WAV, AAC, M4A riêng</span>
          </div>
        </div>

        <div className="space-y-3">
          {sfxList.map((s) => {
            const isCustom = s.url !== DEFAULT_SFX[s.key] && !s.url.startsWith('/assets/');
            const isUploading = uploadingKey === s.key;
            const isPlaying = playingTrack === s.url;

            return (
              <div
                key={s.key}
                className={`p-3.5 rounded-xl border transition-all ${
                  isCustom
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-slate-50 border-slate-200'
                } flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
              >
                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={(el) => (fileInputRefs.current[s.key] = el)}
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUploadSfxFile(s.key, f);
                    e.target.value = '';
                  }}
                />

                {/* Left: Info & status badge */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-xs font-bold text-slate-900">{s.label}</span>
                    {isCustom ? (
                      <Badge variant="outline" className="bg-emerald-100/70 text-emerald-800 border-emerald-300 text-[10px] gap-1 px-2 py-0">
                        <CheckCircle2 size={10} />
                        <span>Tùy chỉnh ({getCleanFileName(s.url)})</span>
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] text-slate-500 bg-slate-200/60 px-1.5 py-0">
                        Mặc định hệ thống
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">{s.desc}</p>
                </div>

                {/* Right: Controls (Volume + Play + Upload + Reset) */}
                <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                  {/* Volume Slider */}
                  <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                    <Volume2 size={12} className="text-slate-400" />
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={s.vol}
                      onChange={(e) => updateSfxVolume(s.key, Number(e.target.value))}
                      className="w-16 sm:w-20 accent-emerald-500 cursor-pointer h-1.5"
                    />
                    <span className="text-[10px] font-mono font-bold text-slate-700 w-7 text-right">
                      {Math.round(s.vol * 100)}%
                    </span>
                  </div>

                  {/* Play / Pause Preview Button */}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => togglePlayAudio(s.url)}
                    className="h-8 px-2.5 text-xs font-semibold gap-1 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border-slate-200"
                  >
                    {isPlaying ? <Pause size={13} className="text-emerald-600" /> : <Play size={13} />}
                    <span>{isPlaying ? 'Dừng' : 'Thử âm'}</span>
                  </Button>

                  {/* Upload Custom Audio Button */}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => fileInputRefs.current[s.key]?.click()}
                    disabled={isUploading}
                    title="Tải lên file âm thanh mới"
                    className="h-8 px-2.5 text-xs font-semibold gap-1 bg-white hover:bg-sky-50 text-sky-700 border-sky-200"
                  >
                    {isUploading ? (
                      <Loader2 size={13} className="animate-spin text-sky-600" />
                    ) : (
                      <Upload size={13} />
                    )}
                    <span>{isUploading ? 'Đang tải...' : 'Upload'}</span>
                  </Button>

                  {/* Reset to Default Button */}
                  {isCustom && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleResetSfx(s.key)}
                      title="Khôi phục âm thanh mặc định"
                      className="h-8 px-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <RotateCcw size={13} />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
