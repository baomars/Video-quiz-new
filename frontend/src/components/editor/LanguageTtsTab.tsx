import React, { useState, useEffect, useRef } from 'react';
import { Channel, LanguageCode } from '../../../../remotion/types/index';
import {
  fetchVoiceStudioData,
  cloneVoice,
  deleteClonedVoice,
  previewTTS,
  fetchDriveVoiceStatus,
  importVoicesFromDrive,
  backupVoicesToDrive,
  VoiceInfo,
  ClonedVoice,
  DriveVoiceStatus
} from '../../services/api';
import {
  Mic,
  Volume2,
  Play,
  Pause,
  Loader2,
  Sparkles,
  Upload,
  Trash2,
  Check,
  CheckCircle2,
  Sliders,
  AudioWaveform,
  Globe,
  Radio,
  FileAudio,
  AlertCircle,
  HelpCircle,
  Layers,
  ChevronDown,
  ChevronUp,
  Cloud,
  CloudDownload,
  CloudUpload,
  RefreshCw,
  FolderSync,
  Search
} from 'lucide-react';

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
  const [voices, setVoices] = useState<VoiceInfo[]>([]);
  const [clonedVoices, setClonedVoices] = useState<ClonedVoice[]>([]);
  const [vieneuReady, setVieneuReady] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Active playing audio state
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Voice Cloning Form State
  const [cloneName, setCloneName] = useState<string>('');
  const [cloneGender, setCloneGender] = useState<'Female' | 'Male'>('Male');
  const [cloneDesc, setCloneDesc] = useState<string>('');
  const [cloneFile, setCloneFile] = useState<File | null>(null);
  const [isCloning, setIsCloning] = useState<boolean>(false);
  const [cloneError, setCloneError] = useState<string | null>(null);
  const [cloneSuccess, setCloneSuccess] = useState<string | null>(null);

  // Custom preview sentence
  const [customTestSentence, setCustomTestSentence] = useState<string>('');

  // Active sub-tab in Voice Studio
  const [subTab, setSubTab] = useState<'preset' | 'clone' | 'tuning' | 'scripts'>('preset');

  // Voice library filter & search
  const [voiceFilter, setVoiceFilter] = useState<'all' | 'bac' | 'trung' | 'nam' | 'en' | 'cloned'>('all');
  const [voiceSearchQuery, setVoiceSearchQuery] = useState<string>('');

  // Google Drive Cloud Persistence state
  const [driveStatus, setDriveStatus] = useState<DriveVoiceStatus | null>(null);
  const [isSyncingDrive, setIsSyncingDrive] = useState<boolean>(false);
  const [driveMsg, setDriveMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Accordion open states
  const [isTuningOpen, setIsTuningOpen] = useState<boolean>(true);
  const [isScriptsOpen, setIsScriptsOpen] = useState<boolean>(true);

  const langConfig = channel.languages[activeLanguage] || channel.languages.vi || {
    voice: 'Trúc Ly',
    rate: '+0%',
    pitch: '+0Hz',
    volume: '+0%',
    revealScript: 'Đáp án chính xác là',
    introScript: 'Chào mừng các bạn đến với thử thách đố vui!',
    outroScript: 'Nhớ follow kênh để đón xem câu đố tiếp theo!'
  };

  const loadDriveStatus = async () => {
    try {
      const status = await fetchDriveVoiceStatus();
      setDriveStatus(status);
    } catch (err) {
      console.warn('[VoiceStudio] Could not fetch Drive status:', err);
    }
  };

  const loadData = () => {
    setIsLoading(true);
    fetchVoiceStudioData(activeLanguage)
      .then((data) => {
        setVoices(data.voices);
        setClonedVoices(data.cloned);
        setVieneuReady(data.vieneuReady);
      })
      .catch((err) => console.error('[VoiceStudio] Error loading voice data:', err))
      .finally(() => setIsLoading(false));
    loadDriveStatus();
  };

  useEffect(() => {
    loadData();
  }, [activeLanguage]);

  const handleImportFromDrive = async () => {
    setIsSyncingDrive(true);
    setDriveMsg(null);
    try {
      const res = await importVoicesFromDrive();
      setDriveMsg({ type: 'success', text: res.message });
      loadData();
    } catch (err: any) {
      setDriveMsg({ type: 'error', text: err.message || 'Lỗi khi nhập giọng từ Google Drive.' });
    } finally {
      setIsSyncingDrive(false);
    }
  };

  const handleBackupToDrive = async () => {
    setIsSyncingDrive(true);
    setDriveMsg(null);
    try {
      const res = await backupVoicesToDrive();
      setDriveMsg({ type: 'success', text: res.message });
      loadDriveStatus();
    } catch (err: any) {
      setDriveMsg({ type: 'error', text: err.message || 'Lỗi khi lưu giọng vào Google Drive.' });
    } finally {
      setIsSyncingDrive(false);
    }
  };

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

  const stopCurrentAudio = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    setPlayingVoiceId(null);
  };

  const handlePlayVoiceSample = async (voiceId: string, sampleText?: string) => {
    if (playingVoiceId === voiceId) {
      stopCurrentAudio();
      return;
    }

    stopCurrentAudio();
    setPlayingVoiceId(voiceId);

    try {
      const text = sampleText || customTestSentence.trim() || (
        activeLanguage === 'vi'
          ? `Xin chào bạn, đây là mẫu giọng đọc VieNeu AI cho kênh ${channel.branding.identity.channelName || channel.name}.`
          : `Hello, this is a natural voice preview powered by VieNeu AI.`
      );

      const res = await previewTTS({
        text,
        voice: voiceId,
        rate: langConfig.rate,
        pitch: langConfig.pitch,
        volume: langConfig.volume
      });

      if (res && res.url) {
        const audio = new Audio(res.url);
        audioPlayerRef.current = audio;
        audio.play().catch(() => setPlayingVoiceId(null));
        audio.onended = () => setPlayingVoiceId(null);
        audio.onerror = () => setPlayingVoiceId(null);
      } else {
        setPlayingVoiceId(null);
      }
    } catch (err: any) {
      alert(`Không thể phát thử giọng: ${err.message}`);
      setPlayingVoiceId(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCloneFile(file);
      setCloneError(null);
      setCloneSuccess(null);
      if (!cloneName) {
        const base = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_\-\s]/g, '');
        setCloneName(base);
      }
    }
  };

  const handleCreateClone = async () => {
    if (!cloneFile) {
      setCloneError('Vui lòng chọn file âm thanh mẫu (3 đến 15 giây).');
      return;
    }
    if (!cloneName.trim()) {
      setCloneError('Vui lòng nhập tên nhận diện cho giọng nhân bản.');
      return;
    }

    setIsCloning(true);
    setCloneError(null);
    setCloneSuccess(null);

    try {
      const formData = new FormData();
      formData.append('sample', cloneFile);
      formData.append('name', cloneName.trim());
      formData.append('gender', cloneGender);
      formData.append('locale', activeLanguage === 'vi' ? 'vi-VN' : 'en-US');
      formData.append('description', cloneDesc.trim() || 'Giọng nhân bản zero-shot AI');

      const newVoice = await cloneVoice(formData);
      setCloneSuccess(`Đã nhân bản thành công giọng "${newVoice.name}"!`);
      setCloneFile(null);
      setCloneName('');
      setCloneDesc('');
      loadData();
      // Select this voice automatically
      updateConfig('voice', newVoice.id);
    } catch (err: any) {
      setCloneError(err.message || 'Lỗi khi nhân bản giọng nói.');
    } finally {
      setIsCloning(false);
    }
  };

  const handleDeleteClonedVoice = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Bạn có chắc chắn muốn xóa giọng nhân bản này?')) return;
    try {
      await deleteClonedVoice(id);
      if (langConfig.voice === id) {
        updateConfig('voice', activeLanguage === 'vi' ? 'Hải Đăng' : 'en-US-Jenny');
      }
      loadData();
    } catch (err: any) {
      alert(`Lỗi xóa giọng: ${err.message}`);
    }
  };

  const filterVoicesByLang = voices.filter(v => {
    if (v.isCloned) return true;
    if (activeLanguage === 'vi') return v.locale?.startsWith('vi');
    if (activeLanguage === 'en') return v.locale?.startsWith('en');
    return true;
  });

  const displayedVoices = filterVoicesByLang.filter(v => {
    // 1. Tag filter
    if (voiceFilter === 'cloned') {
      if (!v.isCloned) return false;
    } else if (voiceFilter === 'bac') {
      if (v.isCloned || v.region !== 'Bắc') return false;
    } else if (voiceFilter === 'trung') {
      if (v.isCloned || v.region !== 'Trung') return false;
    } else if (voiceFilter === 'nam') {
      if (v.isCloned || v.region !== 'Nam') return false;
    } else if (voiceFilter === 'en') {
      if (v.isCloned || (!v.locale?.startsWith('en') && v.region !== 'US')) return false;
    }

    // 2. Search query
    if (voiceSearchQuery.trim()) {
      const q = voiceSearchQuery.toLowerCase();
      const matchName = v.name.toLowerCase().includes(q);
      const matchStyle = v.style?.toLowerCase().includes(q) || false;
      const matchRole = v.suggestedRole?.toLowerCase().includes(q) || false;
      if (!matchName && !matchStyle && !matchRole) return false;
    }

    return true;
  });

  return (
    <div className="space-y-5 pb-16 text-slate-100 select-none">
      {/* 1. TOP HEADER & ENGINE STATUS */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg backdrop-blur-md space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20 shrink-0">
              <AudioWaveform size={22} className="text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  Phòng Thu Giọng Đọc VieNeu AI
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  v3 Turbo
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Tổng hợp giọng nói thần kinh tiếng Việt siêu tự nhiên & nhân bản Zero-Shot
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {vieneuReady ? 'VieNeu Native (Colab)' : 'Colab GPU Pipeline Ready'}
            </span>
          </div>
        </div>

        {/* Language Selection Pills */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800/80">
          <button
            onClick={() => onLanguageChange('vi')}
            className={`py-2 rounded-lg font-bold text-xs transition flex items-center justify-center gap-2 ${
              activeLanguage === 'vi'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <span>🇻🇳</span>
            <span>Tiếng Việt (Vietnamese)</span>
          </button>
          <button
            onClick={() => onLanguageChange('en')}
            className={`py-2 rounded-lg font-bold text-xs transition flex items-center justify-center gap-2 ${
              activeLanguage === 'en'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <span>🇺🇸</span>
            <span>English (Tiếng Anh)</span>
          </button>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-1.5 border-t border-slate-800/80 pt-3 overflow-x-auto scrollbar-none">
          {[
            { id: 'preset', label: 'Thư viện giọng đọc', icon: Radio },
            { id: 'clone', label: 'Nhân bản giọng (Clone)', icon: Mic },
            { id: 'tuning', label: 'Tốc độ & Âm điệu', icon: Sliders },
            { id: 'scripts', label: 'Mẫu lời thoại tự động', icon: Volume2 }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = subTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-slate-800 text-amber-400 border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. TAB 1: PRESET & CLONED VOICES LIBRARY */}
      {subTab === 'preset' && (
        <section className="space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
              Chọn giọng đọc chính ({displayedVoices.length}/{filterVoicesByLang.length} giọng)
            </span>
            <span className="text-[11px] text-amber-400 font-medium">
              Đang chọn: <strong className="font-bold text-white">{langConfig.voice}</strong>
            </span>
          </div>

          {/* Search & Region Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between bg-slate-900/70 p-2.5 rounded-xl border border-slate-800">
            {/* Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'bac', label: 'Miền Bắc' },
                { id: 'nam', label: 'Miền Nam' },
                { id: 'trung', label: 'Miền Trung' },
                { id: 'en', label: 'Tiếng Anh' },
                { id: 'cloned', label: `Giọng Clone (${clonedVoices.length})` }
              ].map((f) => {
                const isActive = voiceFilter === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setVoiceFilter(f.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>

            {/* Quick Search Box */}
            <div className="relative min-w-[160px] sm:w-48">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={voiceSearchQuery}
                onChange={(e) => setVoiceSearchQuery(e.target.value)}
                placeholder="Tìm tên / phong cách..."
                className="w-full pl-7 pr-3 py-1 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-2 bg-slate-900/60 rounded-2xl border border-slate-800">
              <Loader2 size={24} className="animate-spin text-amber-500" />
              <span className="text-xs">Đang tải danh sách giọng đọc VieNeu AI...</span>
            </div>
          ) : displayedVoices.length === 0 ? (
            <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-2 bg-slate-900/60 rounded-2xl border border-slate-800">
              <span className="text-sm font-semibold text-slate-300">Không tìm thấy giọng đọc phù hợp</span>
              <p className="text-xs text-slate-500">Hãy thử đổi bộ lọc vùng miền hoặc từ khóa tìm kiếm</p>
              <button
                onClick={() => { setVoiceFilter('all'); setVoiceSearchQuery(''); }}
                className="mt-2 px-3 py-1 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-400"
              >
                Hiển thị tất cả {filterVoicesByLang.length} giọng
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {displayedVoices.map((v) => {
                const isSelected = langConfig.voice === v.id;
                const isPlaying = playingVoiceId === v.id;

                return (
                  <div
                    key={v.id}
                    onClick={() => updateConfig('voice', v.id)}
                    className={`relative p-3.5 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-2.5 ${
                      isSelected
                        ? 'bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-900 border-amber-500/60 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/40'
                        : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-sm text-white">{v.name}</span>
                          {v.isCloned && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              CLONED
                            </span>
                          )}
                          {v.region && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                              {v.region}
                            </span>
                          )}
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-800 text-slate-400">
                            {v.gender === 'Female' ? 'Nữ' : 'Nam'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{v.style}</p>
                        {v.suggestedRole && (
                          <p className="text-[10px] text-amber-400/90 font-medium">
                            Phù hợp: {v.suggestedRole}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {v.isCloned && (
                          <button
                            onClick={(e) => handleDeleteClonedVoice(v.id, e)}
                            title="Xóa giọng nhân bản này"
                            className="p-1.5 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded-lg transition"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayVoiceSample(v.id);
                          }}
                          className={`p-2 rounded-xl text-xs font-bold transition flex items-center justify-center ${
                            isPlaying
                              ? 'bg-amber-500 text-slate-950 shadow-md animate-pulse'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                          }`}
                          title="Nghe thử giọng này"
                        >
                          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/60">
                      <span className="text-slate-500 font-mono text-[10px]">{v.locale}</span>
                      {isSelected ? (
                        <span className="flex items-center gap-1 text-amber-400 font-bold text-[11px]">
                          <Check size={13} className="stroke-[3]" />
                          Đang kích hoạt
                        </span>
                      ) : (
                        <span className="text-slate-500 hover:text-slate-300">Nhấn để chọn</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* 3. TAB 2: ZERO-SHOT VOICE CLONING (PHÒNG NHÂN BẢN GIỌNG) */}
      {subTab === 'clone' && (
        <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-black shrink-0">
              <Mic size={18} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                Nhân Bản Giọng Nói Zero-Shot (Voice Cloning)
              </h3>
              <p className="text-xs text-slate-400">
                Tải lên 1 đoạn âm thanh mẫu (từ 3 đến 15 giây) để tạo giọng AI độc quyền cho bạn
              </p>
            </div>
          </div>

          {/* GOOGLE DRIVE CLOUD PERSISTENCE PANEL */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 p-4 rounded-xl border border-indigo-500/30 space-y-3 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold shrink-0">
                  <Cloud size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">
                      Lưu Trữ Đám Mây Google Drive
                    </h4>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        driveStatus?.connected
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {driveStatus?.connected ? 'Đã kết nối Drive' : 'Chưa gắn kết Drive'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Thư mục riêng biệt chống trùng: <strong className="text-amber-400 font-mono font-bold">"{driveStatus?.folderName || 'Tên-dự-án voice clone'}"</strong>
                  </p>
                </div>
              </div>

              {/* Sync Actions */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  onClick={handleImportFromDrive}
                  disabled={isSyncingDrive}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm disabled:opacity-50"
                  title="Tải lại toàn bộ giọng clone và file âm thanh mẫu từ Google Drive"
                >
                  {isSyncingDrive ? <Loader2 size={13} className="animate-spin" /> : <CloudDownload size={13} />}
                  <span>Nhập lại từ Drive</span>
                </button>

                <button
                  onClick={handleBackupToDrive}
                  disabled={isSyncingDrive}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-50"
                  title="Lưu tất cả giọng clone và file âm thanh mẫu hiện tại vào Google Drive"
                >
                  {isSyncingDrive ? <Loader2 size={13} className="animate-spin" /> : <CloudUpload size={13} />}
                  <span>Lưu vào Drive</span>
                </button>

                <button
                  onClick={loadDriveStatus}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                  title="Làm mới trạng thái kết nối Google Drive"
                >
                  <RefreshCw size={13} />
                </button>
              </div>
            </div>

            {/* Status counts & Explanatory note */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-2 border-t border-slate-800/80 text-slate-400">
              <div className="flex items-center gap-3">
                <span>
                  📁 Trên Google Drive: <strong className="text-white font-bold">{driveStatus?.driveVoiceCount || 0}</strong> giọng
                </span>
                <span>•</span>
                <span>
                  💻 Trong phiên hiện tại: <strong className="text-white font-bold">{clonedVoices.length}</strong> giọng
                </span>
              </div>
              <span className="text-[10px] text-slate-500 italic">
                * Tự động lưu file .wav và metadata để dùng lại vĩnh viễn ở các phiên Colab sau.
              </span>
            </div>

            {/* Notification message */}
            {driveMsg && (
              <div
                className={`p-2.5 rounded-xl text-xs flex items-center justify-between gap-2 ${
                  driveMsg.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  {driveMsg.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                  <span>{driveMsg.text}</span>
                </div>
                <button
                  onClick={() => setDriveMsg(null)}
                  className="text-slate-400 hover:text-white font-bold px-1"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3.5">
            {/* Audio Upload Box */}
            <div>
              <label className="text-xs font-bold text-slate-300 mb-1.5 block">
                1. Tải lên file âm thanh mẫu (.mp3, .wav, .m4a, .flac):
              </label>
              <div className="border-2 border-dashed border-slate-800 hover:border-amber-500/50 rounded-xl p-4 text-center cursor-pointer transition bg-slate-900/40 relative">
                <input
                  type="file"
                  accept="audio/*,.mp3,.wav,.m4a,.flac,.ogg"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                  <div className="w-8 h-8 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center">
                    <FileAudio size={16} />
                  </div>
                  {cloneFile ? (
                    <div>
                      <span className="text-xs font-bold text-white block">{cloneFile.name}</span>
                      <span className="text-[11px] text-amber-400 font-medium">
                        {(cloneFile.size / 1024).toFixed(1)} KB • Nhấn để đổi file khác
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-xs font-bold text-slate-300 block">
                        Chọn file mẫu giọng từ máy tính
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        Khuyến nghị: 3s – 15s giọng nói rõ chữ, không nhạc nền ồn
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Voice Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">
                  2. Đặt tên nhận diện giọng:
                </label>
                <input
                  type="text"
                  value={cloneName}
                  onChange={(e) => setCloneName(e.target.value)}
                  placeholder="Ví dụ: Giọng MC Nam Cá Tính"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">
                  3. Giới tính giọng đọc:
                </label>
                <select
                  value={cloneGender}
                  onChange={(e) => setCloneGender(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="Male">Nam (Male)</option>
                  <option value="Female">Nữ (Female)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 mb-1 block">
                Mô tả phong cách (tùy chọn):
              </label>
              <input
                type="text"
                value={cloneDesc}
                onChange={(e) => setCloneDesc(e.target.value)}
                placeholder="Ví dụ: Trầm ấm, phong cách podcast kể chuyện"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {cloneError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{cloneError}</span>
              </div>
            )}

            {cloneSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 size={15} className="shrink-0" />
                <span>{cloneSuccess}</span>
              </div>
            )}

            <button
              onClick={handleCreateClone}
              disabled={isCloning || !cloneFile}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-purple-600/20"
            >
              {isCloning ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Đang xử lý mẫu âm thanh và đăng ký giọng...</span>
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  <span>Tạo giọng nhân bản ngay</span>
                </>
              )}
            </button>
          </div>

          {/* List of existing cloned voices */}
          {clonedVoices.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Giọng nhân bản đã tạo ({clonedVoices.length}):
              </span>
              <div className="space-y-2">
                {clonedVoices.map((cv) => (
                  <div
                    key={cv.id}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">{cv.name}</span>
                        <span className="text-[10px] text-purple-300 font-mono">
                          {cv.durationSec?.toFixed(1)}s sample
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{cv.style}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePlayVoiceSample(cv.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1"
                      >
                        <Play size={12} />
                        <span>Nghe</span>
                      </button>
                      <button
                        onClick={() => updateConfig('voice', cv.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                          langConfig.voice === cv.id
                            ? 'bg-amber-500 text-slate-950 font-black'
                            : 'bg-slate-800 text-slate-300 hover:text-white'
                        }`}
                      >
                        {langConfig.voice === cv.id ? 'Đang chọn' : 'Chọn giọng này'}
                      </button>
                      <button
                        onClick={(e) => handleDeleteClonedVoice(cv.id, e)}
                        className="p-1.5 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded-lg transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* 4. TAB 3: AUDIO TUNING & SPEED */}
      {subTab === 'tuning' && (
        <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black shrink-0">
              <Sliders size={18} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                Tinh Chỉnh Tốc Độ & Âm Điệu (Voice Parameters)
              </h3>
              <p className="text-xs text-slate-400">
                Điều chỉnh nhịp điệu phát âm phù hợp với định dạng video ngắn Shorts / TikTok
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
            {/* Speed / Rate */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span className="font-bold">Tốc độ đọc (Speed / Rate):</span>
                <span className="text-amber-400 font-mono font-bold">{langConfig.rate || '+0%'}</span>
              </div>
              <input
                type="range"
                min={-30}
                max={30}
                step={5}
                value={parseInt(langConfig.rate || '0', 10)}
                onChange={(e) => updateConfig('rate', `${Number(e.target.value) >= 0 ? '+' : ''}${e.target.value}%`)}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <span className="text-[10px] text-slate-500 block">
                Khuyến nghị: +5% đến +15% cho video đố vui nhanh
              </span>
            </div>

            {/* Pitch */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span className="font-bold">Cao độ (Pitch):</span>
                <span className="text-amber-400 font-mono font-bold">{langConfig.pitch || '+0Hz'}</span>
              </div>
              <input
                type="range"
                min={-20}
                max={20}
                step={2}
                value={parseInt(langConfig.pitch || '0', 10)}
                onChange={(e) => updateConfig('pitch', `${Number(e.target.value) >= 0 ? '+' : ''}${e.target.value}Hz`)}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <span className="text-[10px] text-slate-500 block">
                Điều chỉnh độ trầm hoặc bổng của giọng
              </span>
            </div>

            {/* Volume */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span className="font-bold">Âm lượng (Volume):</span>
                <span className="text-amber-400 font-mono font-bold">{langConfig.volume || '+0%'}</span>
              </div>
              <input
                type="range"
                min={-20}
                max={20}
                step={5}
                value={parseInt(langConfig.volume || '0', 10)}
                onChange={(e) => updateConfig('volume', `${Number(e.target.value) >= 0 ? '+' : ''}${e.target.value}%`)}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <span className="text-[10px] text-slate-500 block">
                Cân bằng âm lượng so với nhạc nền (BGM)
              </span>
            </div>
          </div>

          {/* Test Custom Sentence */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2.5">
            <span className="text-xs font-bold text-slate-300 block">
              Thử nghiệm giọng đọc với câu tùy ý:
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={customTestSentence}
                onChange={(e) => setCustomTestSentence(e.target.value)}
                placeholder="Nhập câu bất kỳ để nghe thử giọng đang chọn..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={() => handlePlayVoiceSample(langConfig.voice, customTestSentence)}
                disabled={playingVoiceId !== null}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center gap-1.5 shrink-0 shadow-sm disabled:opacity-50"
              >
                {playingVoiceId ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Đang đọc...</span>
                  </>
                ) : (
                  <>
                    <Play size={13} />
                    <span>Phát thử câu này</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 5. TAB 4: SPEECH SCRIPTS & AUTOMATION */}
      {subTab === 'scripts' && (
        <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black shrink-0">
              <Volume2 size={18} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                Mẫu Lời Thoại Tự Động (Speech Automation Scripts)
              </h3>
              <p className="text-xs text-slate-400">
                Tự động lồng tiếng thông báo đáp án, lời chào đầu và kết thúc video
              </p>
            </div>
          </div>

          <div className="space-y-3.5 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
            {/* Reveal Script */}
            <div>
              <label className="text-xs text-slate-300 font-bold mb-1 block">
                Mẫu câu công bố đáp án (Reveal Announcement):
              </label>
              <input
                type="text"
                value={langConfig.revealScript || ''}
                onChange={(e) => updateConfig('revealScript', e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                placeholder="Đáp án chính xác là..."
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Hệ thống sẽ tự động ghép chữ cái và nội dung đáp án: ví dụ "{langConfig.revealScript || 'Đáp án chính xác là'} A. Hà Nội".
              </span>
            </div>

            {/* Answer TTS Toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800/80">
              <div>
                <span className="text-xs font-bold text-white block">Đọc đáp án đúng bằng AI (Answer TTS)</span>
                <span className="text-[11px] text-slate-400 block">
                  Bật công tắc này để hệ thống đọc to đáp án đúng sau khi đồng hồ đếm ngược kết thúc
                </span>
              </div>
              <input
                type="checkbox"
                checked={langConfig.readAnswer !== false}
                onChange={(e) => updateConfig('readAnswer', e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>

            {/* Intro Script */}
            <div>
              <label className="text-xs text-slate-300 font-bold mb-1 block">
                Lời dẫn mở đầu video (Intro Script):
              </label>
              <textarea
                rows={2}
                value={langConfig.introScript || ''}
                onChange={(e) => updateConfig('introScript', e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Outro Script */}
            <div>
              <label className="text-xs text-slate-300 font-bold mb-1 block">
                Lời chào kết thúc video (Outro Script):
              </label>
              <textarea
                rows={2}
                value={langConfig.outroScript || ''}
                onChange={(e) => updateConfig('outroScript', e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
