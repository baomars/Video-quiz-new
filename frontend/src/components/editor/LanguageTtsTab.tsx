import React, { useState, useEffect } from 'react';
import { Channel, LanguageCode } from '../../../../remotion/types/index';
import { fetchVoices, previewTTS } from '../../services/api';
import { Mic, Volume2, Play, Loader2 } from 'lucide-react';

interface LanguageTtsTabProps {
  channel: Channel;
  activeLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onChannelChange: (updated: Channel) => void;
}

export const LanguageTtsTab: React.FC<LanguageTtsTabProps> = ({
  channel,
  activeLanguage,
  onLanguageChange,
  onChannelChange
}) => {
  const [voices, setVoices] = useState<any[]>([]);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const langConfig = channel.languages[activeLanguage] || channel.languages.vi;

  useEffect(() => {
    fetchVoices(activeLanguage)
      .then(setVoices)
      .catch((err) => console.error('Failed to load voices:', err));
  }, [activeLanguage]);

  const updateConfig = (key: string, value: any) => {
    onChannelChange({
      ...channel,
      languages: {
        ...channel.languages,
        [activeLanguage]: {
          ...langConfig,
          [key]: value
        }
      }
    });
  };

  const handleTestPreview = async () => {
    setIsPlayingPreview(true);
    try {
      const sampleText = activeLanguage === 'vi'
        ? `Xin chào các bạn, đây là thử nghiệm giọng đọc tự động của kênh ${channel.branding.identity.channelName}`
        : `Hello everyone, this is a voice preview for ${channel.branding.identity.channelName}`;

      const res = await previewTTS({
        text: sampleText,
        voice: langConfig.voice,
        rate: langConfig.rate,
        pitch: langConfig.pitch,
        volume: langConfig.volume
      });

      if (res && res.url) {
        const audio = new Audio(res.url);
        audio.play();
        audio.onended = () => setIsPlayingPreview(false);
        audio.onerror = () => setIsPlayingPreview(false);
      } else {
        setIsPlayingPreview(false);
      }
    } catch (err: any) {
      alert(`Lỗi phát thử giọng: ${err.message}`);
      setIsPlayingPreview(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Language Toggle */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Mic size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                1. Cấu hình Ngôn ngữ & Giọng đọc (TTS Profile)
              </h3>
              <p className="text-xs text-slate-500">Tách riêng độc lập cho Tiếng Việt và Tiếng Anh</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => onLanguageChange('vi')}
            className={`py-2 rounded-lg font-bold text-sm transition flex items-center justify-center gap-2 ${
              activeLanguage === 'vi'
                ? 'bg-white text-amber-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🇻🇳 Tiếng Việt (Vietnamese)</span>
          </button>
          <button
            onClick={() => onLanguageChange('en')}
            className={`py-2 rounded-lg font-bold text-sm transition flex items-center justify-center gap-2 ${
              activeLanguage === 'en'
                ? 'bg-white text-sky-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🇺🇸 English (Tiếng Anh)</span>
          </button>
        </div>

        {/* Voice Selector */}
        <div className="space-y-3 pt-2">
          <div>
            <label className="text-xs text-slate-600 font-bold mb-1.5 block">
              Chọn giọng đọc (Voice Model - Edge-TTS):
            </label>
            <div className="flex items-center gap-3">
              <select
                value={langConfig.voice}
                onChange={(e) => updateConfig('voice', e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 font-medium focus:bg-white focus:border-amber-500 focus:outline-none shadow-sm"
              >
                {voices.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.gender})
                  </option>
                ))}
              </select>

              <button
                onClick={handleTestPreview}
                disabled={isPlayingPreview}
                className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-xs font-bold transition flex items-center gap-2 disabled:opacity-50 shadow-xs"
              >
                {isPlayingPreview ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-amber-600" />
                    <span>Đang đọc...</span>
                  </>
                ) : (
                  <>
                    <Play size={14} />
                    <span>Nghe thử giọng</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Rate, Pitch, Volume sliders */}
          <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-100">
            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span className="font-semibold">Tốc độ đọc (Rate):</span>
                <span className="text-amber-600 font-mono font-bold">{langConfig.rate || '+0%'}</span>
              </div>
              <input
                type="range"
                min={-30}
                max={30}
                step={5}
                value={parseInt(langConfig.rate || '0')}
                onChange={(e) => updateConfig('rate', `${Number(e.target.value) >= 0 ? '+' : ''}${e.target.value}%`)}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span className="font-semibold">Cao độ (Pitch):</span>
                <span className="text-amber-600 font-mono font-bold">{langConfig.pitch || '+0Hz'}</span>
              </div>
              <input
                type="range"
                min={-20}
                max={20}
                step={2}
                value={parseInt(langConfig.pitch || '0')}
                onChange={(e) => updateConfig('pitch', `${Number(e.target.value) >= 0 ? '+' : ''}${e.target.value}Hz`)}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span className="font-semibold">Âm lượng (Volume):</span>
                <span className="text-amber-600 font-mono font-bold">{langConfig.volume || '+0%'}</span>
              </div>
              <input
                type="range"
                min={-20}
                max={20}
                step={5}
                value={parseInt(langConfig.volume || '0')}
                onChange={(e) => updateConfig('volume', `${Number(e.target.value) >= 0 ? '+' : ''}${e.target.value}%`)}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Script Templates */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Volume2 size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              2. Mẫu Lời Thoại Tự Động (Speech Script Templates)
            </h3>
            <p className="text-xs text-slate-500">
              Tự động lồng tiếng câu hỏi, phương án và thông báo đáp án đúng
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-600 font-bold mb-1 block">
              Mẫu câu mở đáp án (Reveal Announcement):
            </label>
            <input
              type="text"
              value={langConfig.revealScript}
              onChange={(e) => updateConfig('revealScript', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 font-medium focus:bg-white focus:border-amber-500 focus:outline-none shadow-sm"
              placeholder="Đáp án chính xác là..."
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Hệ thống sẽ tự động đọc chữ cái và nội dung đáp án đúng theo mẫu câu trên.
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <span className="text-xs font-bold text-slate-700 block">Đọc đáp án đúng bằng AI (Answer TTS)</span>
              <span className="text-[11px] text-slate-400 block">Tạo giọng đọc công bố đáp án đúng độc lập với phần giải thích</span>
            </div>
            <input
              type="checkbox"
              checked={langConfig.readAnswer !== false}
              onChange={(e) => updateConfig('readAnswer', e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
            />
          </div>

          <div>
            <label className="text-xs text-slate-600 font-bold mb-1 block">
              Lời dẫn mở đầu video (Intro Script):
            </label>
            <textarea
              rows={2}
              value={langConfig.introScript}
              onChange={(e) => updateConfig('introScript', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 font-medium focus:bg-white focus:border-amber-500 focus:outline-none shadow-sm"
            />
          </div>

          <div>
            <label className="text-xs text-slate-600 font-bold mb-1 block">
              Lời chào kết thúc (Outro Script):
            </label>
            <textarea
              rows={2}
              value={langConfig.outroScript}
              onChange={(e) => updateConfig('outroScript', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 font-medium focus:bg-white focus:border-amber-500 focus:outline-none shadow-sm"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
