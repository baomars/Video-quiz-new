import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Channel, VideoTemplate, Quiz, LanguageCode, QuizQuestion } from '../../../../remotion/types/index';
import { generateDefaultFileName } from '../../../../remotion/utils/fileNameHelper';
import {
  startRender,
  getRenderStatus,
  listRenderJobs,
  startBatchRender,
  getBatchRenderStatus,
  listBatchRenderJobs,
  fetchBackgrounds,
  uploadBackgroundBatch,
  uploadImage,
  startTTSPregenerate,
  getTTSPregenerateStatus,
  TTSPregenerateStatus
} from '../../services/api';
import { NEON_PRESETS } from './InspectorPanel';
import {
  estimateBatch,
  generateBatchQuestionSets,
  shuffleQuestionAnswers,
  allocateBatchBackgrounds,
  SelectionMode,
  BatchConfig
} from '../../utils/quizBatchEngine';
import { RenderProgressScrubber } from './RenderProgressScrubber';
import {
  Video,
  Download,
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Film,
  Clock,
  Volume2,
  Layers,
  Sparkles,
  Play,
  Pause,
  Shuffle,
  Boxes,
  Gauge,
  Activity,
  Zap,
  Check,
  FileCheck,
  FileText,
  Split,
  Timer,
  Image as ImageIcon,
  FolderUp,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  AudioWaveform,
  Headphones,
  Sliders
} from 'lucide-react';

interface RenderTabProps {
  channel: Channel;
  template: VideoTemplate;
  quiz: Quiz;
  language: LanguageCode;
  activeJobId?: string | null;
  setActiveJobId?: (id: string | null) => void;
  jobState?: RenderJob | null;
  setJobState?: React.Dispatch<React.SetStateAction<RenderJob | null>> | ((job: RenderJob | null) => void);
  activeBatchId?: string | null;
  setActiveBatchId?: (id: string | null) => void;
  batchState?: BatchRenderJob | null;
  setBatchState?: React.Dispatch<React.SetStateAction<BatchRenderJob | null>> | ((batch: BatchRenderJob | null) => void);
  onRenderStarted?: () => void;
}

interface StageLog {
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

interface RenderLogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  stage: string;
  message: string;
}

interface RenderJob {
  jobId: string;
  fileName?: string;
  status: 'pending' | 'queued' | 'processing' | 'completed' | 'failed';
  queuePosition?: number;
  renderPreset?: 'fast' | 'standard' | 'high_quality';
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

interface BatchRenderJob {
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
  config: BatchConfig;
  completedVideos: Array<{
    index: number;
    jobId: string;
    fileName?: string;
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

const DEFAULT_STAGES: Array<{ id: string; name: string }> = [
  { id: 'stage_1_prepare', name: '1. Chuẩn bị tài nguyên & Kiểm tra' },
  { id: 'stage_2_tts', name: '2. Tạo giọng đọc TTS (VieNeu AI v3)' },
  { id: 'stage_3_timeline', name: '3. Tính toán Timeline & Đóng gói' },
  { id: 'stage_4_render_frames', name: '4. Render khung hình Video (Native Skia)' },
  { id: 'stage_5_process_audio', name: '5. Xử lý & Hòa âm Audio (TTS, SFX, BGM)' },
  { id: 'stage_6_ffmpeg_mux', name: '6. Ghép Video & Audio (FFmpeg Muxing)' },
  { id: 'stage_7_export', name: '7. Xuất bản & Kiểm tra MP4' }
];

export const RenderTab: React.FC<RenderTabProps> = ({
  channel,
  template,
  quiz,
  language,
  activeJobId: propsActiveJobId,
  setActiveJobId: propsSetActiveJobId,
  jobState: propsJobState,
  setJobState: propsSetJobState,
  activeBatchId: propsActiveBatchId,
  setActiveBatchId: propsSetActiveBatchId,
  batchState: propsBatchState,
  setBatchState: propsSetBatchState,
  onRenderStarted
}) => {
  // Mode selection
  const [renderMode, setRenderMode] = useState<'single' | 'batch'>('single');

  // Performance & Preset configuration
  const [renderPreset, setRenderPreset] = useState<'fast' | 'standard' | 'high_quality'>('standard');
  const [customConcurrency, setCustomConcurrency] = useState<number>(0);

  // Single mode config
  const [singleQuestionCount, setSingleQuestionCount] = useState<number>(quiz.questions?.length || 5);
  const [singleShuffleAnswers, setSingleShuffleAnswers] = useState<boolean>(false);

  // Batch mode config
  const poolCount = quiz.questions?.length || 0;
  const [videoCount, setVideoCount] = useState<number>(3);
  const [questionsPerVideo, setQuestionsPerVideo] = useState<number>(Math.min(5, Math.max(1, poolCount)));
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('balanced_random');
  const [autoReusePool, setAutoReusePool] = useState<boolean>(true);
  const [batchShuffleAnswers, setBatchShuffleAnswers] = useState<boolean>(true);

  // Single file name state
  const [singleFileName, setSingleFileName] = useState<string>(() =>
    generateDefaultFileName(quiz?.title || 'Video_Quiz', 1)
  );
  const [isCustomSingleFileName, setIsCustomSingleFileName] = useState<boolean>(false);

  // Sync single file name when quiz.title changes
  useEffect(() => {
    if (!isCustomSingleFileName) {
      setSingleFileName(generateDefaultFileName(quiz?.title || 'Video_Quiz', 1));
    }
  }, [quiz?.title, isCustomSingleFileName]);

  const handleResetSingleFileName = () => {
    setSingleFileName(generateDefaultFileName(quiz?.title || 'Video_Quiz', 1));
    setIsCustomSingleFileName(false);
  };

  // Batch file names state
  const [batchFileNames, setBatchFileNames] = useState<string[]>(() => {
    const arr: string[] = [];
    for (let i = 1; i <= 3; i++) {
      arr.push(generateDefaultFileName(quiz?.title || 'Video_Quiz', i));
    }
    return arr;
  });
  const [isCustomBatchFileNames, setIsCustomBatchFileNames] = useState<boolean>(false);

  useEffect(() => {
    setBatchFileNames(prev => {
      const arr: string[] = [];
      for (let i = 1; i <= videoCount; i++) {
        if (prev[i - 1] && isCustomBatchFileNames) {
          arr.push(prev[i - 1]);
        } else {
          arr.push(generateDefaultFileName(quiz?.title || 'Video_Quiz', i));
        }
      }
      return arr;
    });
  }, [videoCount, quiz?.title, isCustomBatchFileNames]);

  const handleBatchFileNameChange = (index: number, newName: string) => {
    setIsCustomBatchFileNames(true);
    setBatchFileNames(prev => {
      const next = [...prev];
      next[index] = newName;
      return next;
    });
  };

  const handleResetBatchFileNames = () => {
    setIsCustomBatchFileNames(false);
    const arr: string[] = [];
    for (let i = 1; i <= videoCount; i++) {
      arr.push(generateDefaultFileName(quiz?.title || 'Video_Quiz', i));
    }
    setBatchFileNames(arr);
  };

  // Active rendering jobs
  const [localActiveJobId, setLocalActiveJobId] = useState<string | null>(null);
  const [localJobState, setLocalJobState] = useState<RenderJob | null>(null);
  const [localActiveBatchId, setLocalActiveBatchId] = useState<string | null>(null);
  const [localBatchState, setLocalBatchState] = useState<BatchRenderJob | null>(null);

  // Batch Backgrounds Selection & Allocation
  const [availableBackgrounds, setAvailableBackgrounds] = useState<Array<{ name: string; url: string; filename: string }>>([]);
  const [selectedBatchBackgrounds, setSelectedBatchBackgrounds] = useState<string[]>([]);
  const [isUploadingBgs, setIsUploadingBgs] = useState(false);
  const bgFilesInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBackgrounds()
      .then(bgs => {
        setAvailableBackgrounds(bgs);
        if (bgs.length > 0 && selectedBatchBackgrounds.length === 0) {
          setSelectedBatchBackgrounds(bgs.map(b => b.url));
        }
      })
      .catch(err => console.warn('Could not load backgrounds:', err));
  }, []);

  const handleUploadBatchFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    try {
      setIsUploadingBgs(true);
      const uploaded = await uploadBackgroundBatch(files);
      const newUrls = uploaded.map(u => u.url);
      setAvailableBackgrounds(prev => [...uploaded, ...prev.filter(p => !newUrls.includes(p.url))]);
      setSelectedBatchBackgrounds(prev => Array.from(new Set([...prev, ...newUrls])));
    } catch (err: any) {
      alert(`Lỗi tải lên ảnh nền: ${err.message}`);
    } finally {
      setIsUploadingBgs(false);
      if (e.target) e.target.value = '';
    }
  };

  const toggleSelectBackground = (url: string) => {
    setSelectedBatchBackgrounds(prev =>
      prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
    );
  };

  const selectAllBackgrounds = () => {
    setSelectedBatchBackgrounds(availableBackgrounds.map(b => b.url));
  };

  const clearAllBackgrounds = () => {
    setSelectedBatchBackgrounds([]);
  };

  const allocatedBackgrounds = useMemo(() => {
    if (selectedBatchBackgrounds.length === 0) return [];
    return allocateBatchBackgrounds(selectedBatchBackgrounds, videoCount);
  }, [selectedBatchBackgrounds, videoCount]);

  // Export Background Mode
  const singleBgInputRef = useRef<HTMLInputElement>(null);
  const [exportBgMode, setExportBgMode] = useState<'animated' | 'static' | 'upload'>(() => {
    if (template.components.background?.type === 'solid' || template.components.background?.type === 'gradient') {
      return 'static';
    }
    if (template.components.background?.type === 'image') {
      return 'upload';
    }
    return 'animated';
  });

  const [exportNeonPreset, setExportNeonPreset] = useState<string>(
    template.components.background?.neonPresetId || 'sunny-nature'
  );
  const [exportStaticType, setExportStaticType] = useState<'solid' | 'gradient'>('solid');
  const [exportStaticColor, setExportStaticColor] = useState<string>(
    template.components.background?.backgroundColor || '#ffffff'
  );
  const [exportSecondaryColor, setExportSecondaryColor] = useState<string>(
    template.components.background?.secondaryColor || '#f1f5f9'
  );
  const [exportUploadedBgUrl, setExportUploadedBgUrl] = useState<string>(
    template.components.background?.imageUrl || ''
  );

  const handleSingleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingBgs(true);
      const res = await uploadImage(file);
      if (res.url) {
        setExportUploadedBgUrl(res.url);
        setExportBgMode('upload');
      }
    } catch (err: any) {
      alert(`Lỗi tải lên ảnh nền: ${err.message}`);
    } finally {
      setIsUploadingBgs(false);
      if (e.target) e.target.value = '';
    }
  };

  const getTemplateWithExportBackground = (baseTemplate: VideoTemplate): VideoTemplate => {
    const currentBg = baseTemplate.components.background || { type: 'neon' };
    let updatedBg: any = { ...currentBg };

    if (exportBgMode === 'animated') {
      updatedBg = {
        ...updatedBg,
        type: 'neon',
        neonPresetId: exportNeonPreset,
        neonSpeed: updatedBg.neonSpeed ?? 1.0,
        neonIntensity: updatedBg.neonIntensity ?? 1.0
      };
    } else if (exportBgMode === 'static') {
      if (exportStaticType === 'solid') {
        updatedBg = {
          ...updatedBg,
          type: 'solid',
          backgroundColor: exportStaticColor
        };
      } else {
        updatedBg = {
          ...updatedBg,
          type: 'gradient',
          backgroundColor: exportStaticColor,
          secondaryColor: exportSecondaryColor,
          gradientAngle: 135
        };
      }
    } else if (exportBgMode === 'upload') {
      if (exportUploadedBgUrl) {
        updatedBg = {
          ...updatedBg,
          type: 'image',
          imageUrl: exportUploadedBgUrl
        };
      }
    }

    return {
      ...baseTemplate,
      components: {
        ...baseTemplate.components,
        background: updatedBg
      }
    };
  };

  const RENDER_QUICK_COLORS = [
    '#ffffff',
    '#f8fafc',
    '#fef3c7',
    '#dcfce7',
    '#e0f2fe',
    '#0f172a',
    '#1e1b4b',
    '#312e81'
  ];

  const activeJobId = propsActiveJobId !== undefined ? propsActiveJobId : localActiveJobId;
  const setActiveJobId = propsSetActiveJobId || setLocalActiveJobId;
  const jobState = propsJobState !== undefined ? propsJobState : localJobState;
  const setJobState = propsSetJobState || setLocalJobState;

  const activeBatchId = propsActiveBatchId !== undefined ? propsActiveBatchId : localActiveBatchId;
  const setActiveBatchId = propsSetActiveBatchId || setLocalActiveBatchId;
  const batchState = propsBatchState !== undefined ? propsBatchState : localBatchState;
  const setBatchState = propsSetBatchState || setLocalBatchState;

  const [isStarting, setIsStarting] = useState(false);
  const [jobsHistory, setJobsHistory] = useState<RenderJob[]>([]);
  const consecutiveErrorsRef = useRef<number>(0);

  // Accordion Section States
  const [isBgSectionOpen, setIsBgSectionOpen] = useState(false);
  const [isBatchNamesOpen, setIsBatchNamesOpen] = useState(false);
  const [isStagesOpen, setIsStagesOpen] = useState(true);

  // --- TTS PRE-GENERATION QUEUE STATE ---
  const [pregenerateId, setPregenerateId] = useState<string | null>(null);
  const [pregenerateStatus, setPregenerateStatus] = useState<TTSPregenerateStatus | null>(null);
  const [isPregenerating, setIsPregenerating] = useState(false);
  const [showPregeneratedList, setShowPregeneratedList] = useState(false);
  const [playingPreviewUrl, setPlayingPreviewUrl] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Keep single question count in sync if quiz changes
  useEffect(() => {
    if (quiz.questions && quiz.questions.length > 0) {
      if (singleQuestionCount > quiz.questions.length) {
        setSingleQuestionCount(quiz.questions.length);
      }
    }
  }, [quiz.questions?.length]);

  // Real-time batch estimation
  const estimation = useMemo(() => {
    return estimateBatch(poolCount, questionsPerVideo, videoCount);
  }, [poolCount, questionsPerVideo, videoCount]);

  // Load history on mount
  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const list = await listRenderJobs();
      if (Array.isArray(list)) {
        setJobsHistory(list);
      }
    } catch (err) {
      console.warn('Could not load render jobs:', err);
    }
  };

  // Polling for Single Render Job
  useEffect(() => {
    if (!activeJobId) return;

    const interval = setInterval(async () => {
      try {
        const job = await getRenderStatus(activeJobId);
        setJobState(job);
        consecutiveErrorsRef.current = 0;

        if (job.status === 'completed' || job.status === 'failed') {
          clearInterval(interval);
          loadJobs();
        }
      } catch (err) {
        consecutiveErrorsRef.current += 1;
        if (consecutiveErrorsRef.current >= 6) {
          clearInterval(interval);
        }
      }
    }, 700);

    return () => clearInterval(interval);
  }, [activeJobId]);

  // Polling for Batch Render Job
  useEffect(() => {
    if (!activeBatchId) return;

    const interval = setInterval(async () => {
      try {
        const batch = await getBatchRenderStatus(activeBatchId);
        setBatchState(batch);
        consecutiveErrorsRef.current = 0;

        if (batch.status === 'completed' || batch.status === 'failed') {
          clearInterval(interval);
          loadJobs();
        }
      } catch (err) {
        consecutiveErrorsRef.current += 1;
        if (consecutiveErrorsRef.current >= 6) {
          clearInterval(interval);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeBatchId]);

  // Polling for TTS Pre-generation
  useEffect(() => {
    if (!pregenerateId) return;

    const interval = setInterval(async () => {
      try {
        const status = await getTTSPregenerateStatus(pregenerateId);
        setPregenerateStatus(status);
        if (status.status === 'ready' || status.status === 'failed') {
          setIsPregenerating(false);
          clearInterval(interval);
        }
      } catch (err) {
        console.warn('TTS pregenerate poll notice:', err);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [pregenerateId]);

  const handleStartTTSPregenerate = async () => {
    try {
      setIsPregenerating(true);
      setShowPregeneratedList(true);
      const pid = await startTTSPregenerate({
        quiz,
        channel,
        template,
        language
      });
      setPregenerateId(pid);
    } catch (err: any) {
      alert(`Lỗi tiền tạo giọng đọc TTS: ${err.message}`);
      setIsPregenerating(false);
    }
  };

  const handleTogglePlayAudio = (url?: string) => {
    if (!url) return;
    if (playingPreviewUrl === url) {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current = null;
      }
      setPlayingPreviewUrl(null);
      return;
    }
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }
    const audio = new Audio(url);
    previewAudioRef.current = audio;
    setPlayingPreviewUrl(url);
    audio.play().catch(() => setPlayingPreviewUrl(null));
    audio.onended = () => setPlayingPreviewUrl(null);
    audio.onerror = () => setPlayingPreviewUrl(null);
  };

  // 1. Trigger Single Video Render
  const handleStartSingleRender = async () => {
    setIsStarting(true);
    setJobState(null);
    setBatchState(null);
    setActiveBatchId(null);

    try {
      let questionsToRender: QuizQuestion[] = quiz.questions.slice(0, Math.min(singleQuestionCount, quiz.questions.length));
      if (singleShuffleAnswers) {
        questionsToRender = questionsToRender.map(q => shuffleQuestionAnswers(q));
      }

      const singleQuizPayload: Quiz = {
        ...quiz,
        questions: questionsToRender
      };

      const templateToRender = getTemplateWithExportBackground(template);

      const jobId = await startRender({
        channel,
        template: templateToRender,
        quiz: singleQuizPayload,
        language,
        customFileName: singleFileName,
        renderPreset,
        customConcurrency: customConcurrency > 0 ? customConcurrency : undefined
      });

      setActiveJobId(jobId);
      setJobState({
        jobId,
        fileName: singleFileName,
        status: 'processing',
        renderPreset,
        progress: 0,
        stage: 'Đang khởi tạo pipeline render...',
        currentStageId: 'stage_1_prepare',
        currentFps: 0,
        renderSpeed: 0,
        currentFrame: 0,
        totalFrames: 0,
        elapsedSec: 0,
        etaSec: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        stages: DEFAULT_STAGES.map((s, idx) => ({
          id: s.id,
          name: s.name,
          order: idx + 1,
          status: idx === 0 ? 'running' : 'pending',
          progress: 0
        })),
        logs: [
          {
            timestamp: new Date().toISOString(),
            level: 'info',
            stage: 'INIT',
            message: `Khởi động render video: ${channel.name} • ${quiz.title} (${questionsToRender.length} câu hỏi, Preset: ${renderPreset}, File: ${singleFileName})`
          }
        ]
      });
      onRenderStarted?.();
    } catch (err: any) {
      alert(`Lỗi khởi động render: ${err.message}`);
    } finally {
      setIsStarting(false);
    }
  };

  // 2. Trigger Batch Video Render
  const handleStartBatchRender = async () => {
    setIsStarting(true);
    setJobState(null);
    setBatchState(null);
    setActiveJobId(null);

    const config: BatchConfig = {
      videoCount,
      questionsPerVideo,
      selectionMode,
      autoReusePool,
      shuffleAnswers: batchShuffleAnswers,
      backgrounds: selectedBatchBackgrounds.length > 0 ? selectedBatchBackgrounds : undefined
    };

    try {
      const templateToRender = getTemplateWithExportBackground(template);

      const batchId = await startBatchRender({
        channel,
        template: templateToRender,
        quiz,
        language,
        config,
        customFileNames: batchFileNames,
        renderPreset,
        customConcurrency: customConcurrency > 0 ? customConcurrency : undefined
      });

      setActiveBatchId(batchId);
      setBatchState({
        batchId,
        status: 'processing',
        totalVideos: videoCount,
        completedVideosCount: 0,
        currentVideoIndex: 1,
        progress: 0,
        stage: `Đang chuẩn bị render ${videoCount} video...`,
        config,
        completedVideos: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      onRenderStarted?.();
    } catch (err: any) {
      alert(`Lỗi khởi động batch render: ${err.message}`);
    } finally {
      setIsStarting(false);
    }
  };

  const isRendering =
    jobState?.status === 'processing' ||
    batchState?.status === 'processing' ||
    isStarting;

  const currentDisplayFps = jobState?.currentFps || batchState?.currentFps || 0;
  const currentDisplaySpeed = jobState?.renderSpeed || batchState?.renderSpeed || 0;
  const currentDisplayElapsed = jobState?.elapsedSec || batchState?.elapsedSec || 0;
  const currentDisplayEta = jobState?.etaSec || batchState?.etaSec || 0;
  const currentDisplayFrame = jobState?.currentFrame || batchState?.currentFrame || 0;
  const currentDisplayTotalFrames = jobState?.totalFrames || batchState?.totalFrames || 0;

  const stagesList = jobState?.stages && jobState.stages.length > 0
    ? jobState.stages
    : DEFAULT_STAGES.map((s, idx) => ({
        id: s.id,
        name: s.name,
        order: idx + 1,
        status: 'pending' as const,
        progress: 0
      }));

  const formatTime = (sec?: number) => {
    if (!sec || isNaN(sec) || sec <= 0) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes || bytes <= 0) return '-- MB';
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-5 pb-16 text-slate-100 select-none">
      {/* 1. TOP HEADER & MODE SWITCHER */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20 shrink-0">
              <Film size={20} className="text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  Trung Tâm Xuất Video (Render Studio)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  GPU Accelerated
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                9:16 (720×1280 / 1080×1920) @ 30 FPS • H.264 • Tối ưu hóa render đơn lẻ & hàng loạt
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setRenderMode('single')}
              disabled={isRendering}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                renderMode === 'single'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Video size={14} />
              <span>Render 1 Video</span>
            </button>
            <button
              onClick={() => setRenderMode('batch')}
              disabled={isRendering}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                renderMode === 'batch'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Boxes size={14} />
              <span>Render Hàng Loạt (Batch)</span>
            </button>
          </div>
        </div>

        {/* Render Preset & Performance Settings */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Zap size={14} className="text-amber-400" />
              <span>Chất Lượng & Tốc Độ Render (Presets)</span>
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Tự động tối ưu GPU/CPU</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* 1. Fast */}
            <button
              type="button"
              disabled={isRendering}
              onClick={() => setRenderPreset('fast')}
              className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between gap-2 ${
                renderPreset === 'fast'
                  ? 'bg-amber-500/15 border-amber-500/60 ring-1 ring-amber-500/40 shadow-sm'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-white flex items-center gap-1">
                  <span>⚡ Nháp nhanh</span>
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                  720p • Q62
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                CRF 30 • x264 ultrafast. Tốc độ cao nhất để kiểm tra bố cục nhanh.
              </p>
            </button>

            {/* 2. Standard */}
            <button
              type="button"
              disabled={isRendering}
              onClick={() => setRenderPreset('standard')}
              className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between gap-2 ${
                renderPreset === 'standard'
                  ? 'bg-amber-500/15 border-amber-500/60 ring-1 ring-amber-500/40 shadow-sm'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-white flex items-center gap-1">
                  <span>🎯 Chuẩn (Mặc định)</span>
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  720p • Q80
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                CRF 22 • x264 veryfast. Cân bằng tối ưu giữa độ sắc nét và tốc độ xuất.
              </p>
            </button>

            {/* 3. High Quality */}
            <button
              type="button"
              disabled={isRendering}
              onClick={() => setRenderPreset('high_quality')}
              className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between gap-2 ${
                renderPreset === 'high_quality'
                  ? 'bg-amber-500/15 border-amber-500/60 ring-1 ring-amber-500/40 shadow-sm'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-white flex items-center gap-1">
                  <span>✨ Chất lượng cao</span>
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                  1080p • Q92
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                1080×1920 • CRF 18 • x264 fast. Độ phân giải Full HD đăng tải chính thức.
              </p>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-bold text-slate-300">Luồng render (Concurrency):</label>
              <select
                value={customConcurrency}
                onChange={(e) => setCustomConcurrency(Number(e.target.value))}
                disabled={isRendering}
                className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value={0}>Tự động (Khuyên dùng)</option>
                <option value={1}>1 Worker (Tiết kiệm CPU/RAM nhất)</option>
                <option value={2}>2 Workers (Chuẩn Colab T4)</option>
                <option value={3}>3 Workers (Máy 4-6 cores)</option>
                <option value={4}>4 Workers (GPU mạnh)</option>
              </select>
            </div>
            <span className="text-[10px] text-slate-400">
              * Hàng đợi FIFO: tự động xếp hàng và xử lý lần lượt tránh nghẽn bộ nhớ
            </span>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* FEATURE: TTS PREVIEW & PRE-GENERATION (OPTIONAL)                  */}
        {/* ----------------------------------------------------------------- */}
        <div className="bg-slate-950/80 border border-slate-800/80 hover:border-amber-500/30 rounded-xl p-4 space-y-3 transition">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/25 flex items-center justify-center font-bold">
                <AudioWaveform size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    Giọng Đọc AI (VieNeu TTS v3 Turbo)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                    TỰ ĐỘNG KHI RENDER
                  </span>
                  {pregenerateStatus?.status === 'ready' && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      ĐÃ LƯU CACHE
                    </span>
                  )}
                  {isPregenerating && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                      ĐANG TẠO...
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  Toàn bộ giọng đọc sẽ được hệ thống <span className="text-amber-400 font-bold">tự động tạo tuần tự và đồng bộ</span> ngay khi bạn bấm nút Render bên dưới (không cần thao tác thủ công). Bạn chỉ bấm nút bên phải nếu muốn nghe thử âm thanh trước.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {pregenerateStatus?.items && pregenerateStatus.items.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowPregeneratedList(!showPregeneratedList)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold transition flex items-center gap-1"
                >
                  <Headphones size={13} />
                  <span>{showPregeneratedList ? 'Thu gọn audio' : `Nghe thử (${pregenerateStatus.items.length})`}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleStartTTSPregenerate}
                disabled={isPregenerating || isRendering || poolCount === 0}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/40 text-amber-300 font-bold text-xs transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {isPregenerating ? (
                  <>
                    <Loader2 size={13} className="animate-spin text-amber-400" />
                    <span>Đang tạo TTS ({pregenerateStatus?.percent || 0}%)...</span>
                  </>
                ) : (
                  <>
                    <Headphones size={13} />
                    <span>Nghe thử toàn bộ âm thanh (Tùy chọn)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Progress Bar when pre-generating */}
          {pregenerateStatus && (
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400 font-medium">
                  {pregenerateStatus.status === 'ready'
                    ? `Hoàn tất! Đã lưu trữ ${pregenerateStatus.completedItems}/${pregenerateStatus.totalItems} audio vào cache.`
                    : isPregenerating
                    ? `Đang tạo: ${pregenerateStatus.completedItems}/${pregenerateStatus.totalItems} audio (${pregenerateStatus.currentText || ''})`
                    : `Trạng thái: ${pregenerateStatus.status}`}
                </span>
                <span className="text-amber-400 font-mono font-bold">
                  {pregenerateStatus.percent}%
                </span>
              </div>

              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${pregenerateStatus.percent}%` }}
                />
              </div>

              {/* Expandable audio clips list */}
              {showPregeneratedList && pregenerateStatus.items && (
                <div className="max-h-48 overflow-y-auto p-2 bg-slate-900/90 rounded-xl border border-slate-800/80 space-y-1.5 scrollbar-thin mt-2">
                  {pregenerateStatus.items.map((item) => {
                    const isPlaying = playingPreviewUrl === item.url;
                    return (
                      <div
                        key={item.id}
                        className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                              item.type === 'question' ? 'bg-sky-500/20 text-sky-300' :
                              item.type === 'answer' ? 'bg-emerald-500/20 text-emerald-300' :
                              'bg-purple-500/20 text-purple-300'
                            }`}>
                              {item.type}
                            </span>
                            <span className="font-medium text-slate-300 truncate text-[11px]">
                              {item.text}
                            </span>
                          </div>
                          {item.durationSec && (
                            <span className="text-[10px] text-slate-500 font-mono block">
                              {item.durationSec.toFixed(1)}s {item.fromCache ? '• từ cache' : ''}
                            </span>
                          )}
                        </div>

                        {item.url && (
                          <button
                            type="button"
                            onClick={() => handleTogglePlayAudio(item.url)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition shrink-0"
                          >
                            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* COLLAPSIBLE ACCORDION: BACKGROUND SETTINGS                       */}
        {/* ----------------------------------------------------------------- */}
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
          <button
            type="button"
            onClick={() => setIsBgSectionOpen(!isBgSectionOpen)}
            className="w-full p-3.5 flex items-center justify-between text-slate-300 hover:text-white font-bold text-xs transition bg-slate-900/50"
          >
            <div className="flex items-center gap-2">
              <ImageIcon size={14} className="text-amber-400" />
              <span>Cấu hình Background khi xuất Video ({exportBgMode === 'animated' ? 'Nền động' : exportBgMode === 'static' ? 'Nền tĩnh' : 'Upload ảnh'})</span>
            </div>
            {isBgSectionOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>

          {isBgSectionOpen && (
            <div className="p-4 space-y-3.5 border-t border-slate-800 bg-slate-950/80">
              <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0 w-fit">
                <button
                  type="button"
                  disabled={isRendering}
                  onClick={() => setExportBgMode('animated')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    exportBgMode === 'animated' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles size={13} />
                  <span>Nền Động</span>
                </button>
                <button
                  type="button"
                  disabled={isRendering}
                  onClick={() => setExportBgMode('static')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    exportBgMode === 'static' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers size={13} />
                  <span>Nền Tĩnh</span>
                </button>
                <button
                  type="button"
                  disabled={isRendering}
                  onClick={() => setExportBgMode('upload')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    exportBgMode === 'upload' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FolderUp size={13} />
                  <span>Tải Lên Nền</span>
                </button>
              </div>

              {/* NỀN ĐỘNG */}
              {exportBgMode === 'animated' && (
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-slate-300 block">
                    Chọn Preset Nền Động (Đang chọn: <strong className="text-amber-400">{NEON_PRESETS.find(p => p.id === exportNeonPreset)?.name || exportNeonPreset}</strong>)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 max-h-56 overflow-y-auto p-1 scrollbar-thin">
                    {NEON_PRESETS.map((p) => {
                      const isCur = exportNeonPreset === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          disabled={isRendering}
                          onClick={() => setExportNeonPreset(p.id)}
                          className={`p-2 rounded-xl border text-left transition flex flex-col gap-1 cursor-pointer ${
                            isCur
                              ? 'border-amber-500 bg-amber-500/15 ring-1 ring-amber-500/40 shadow-sm'
                              : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm">{p.icon}</span>
                            <span className="text-[9px] text-amber-400 font-bold truncate max-w-[80px]">{p.tag}</span>
                          </div>
                          <div className="font-bold text-white text-[11px] truncate" title={p.name}>
                            {p.name}
                          </div>
                          <div
                            className="h-2 rounded-full w-full mt-0.5 border border-slate-700/50"
                            style={{ background: p.gradientPreview }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* NỀN TĨNH */}
              {exportBgMode === 'static' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name="exportStaticType"
                        checked={exportStaticType === 'solid'}
                        onChange={() => setExportStaticType('solid')}
                        className="accent-amber-500"
                      />
                      <span>Màu Đơn (Solid Color)</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name="exportStaticType"
                        checked={exportStaticType === 'gradient'}
                        onChange={() => setExportStaticType('gradient')}
                        className="accent-amber-500"
                      />
                      <span>Chuyển Sắc (Gradient)</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold block mb-1">
                        {exportStaticType === 'solid' ? 'Màu nền' : 'Màu chính'}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={exportStaticColor}
                          onChange={(e) => setExportStaticColor(e.target.value)}
                          className="w-8 h-8 rounded-lg border border-slate-700 bg-transparent cursor-pointer shrink-0"
                        />
                        <div className="flex items-center gap-1 flex-1 overflow-x-auto py-0.5">
                          {RENDER_QUICK_COLORS.map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setExportStaticColor(c)}
                              style={{ backgroundColor: c }}
                              className={`w-5 h-5 rounded-md border shrink-0 transition ${
                                exportStaticColor.toLowerCase() === c.toLowerCase()
                                  ? 'border-amber-500 ring-2 ring-amber-400'
                                  : 'border-slate-700 hover:scale-105'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {exportStaticType === 'gradient' && (
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold block mb-1">Màu phụ</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={exportSecondaryColor}
                            onChange={(e) => setExportSecondaryColor(e.target.value)}
                            className="w-8 h-8 rounded-lg border border-slate-700 bg-transparent cursor-pointer shrink-0"
                          />
                          <div className="flex items-center gap-1 flex-1 overflow-x-auto py-0.5">
                            {RENDER_QUICK_COLORS.map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => setExportSecondaryColor(c)}
                                style={{ backgroundColor: c }}
                                className={`w-5 h-5 rounded-md border shrink-0 transition ${
                                  exportSecondaryColor.toLowerCase() === c.toLowerCase()
                                    ? 'border-amber-500 ring-2 ring-amber-400'
                                    : 'border-slate-700 hover:scale-105'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TẢI LÊN NỀN */}
              {exportBgMode === 'upload' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Tải ảnh nền mới hoặc chọn từ kho:</span>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        ref={singleBgInputRef}
                        onChange={handleSingleBgUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => singleBgInputRef.current?.click()}
                        disabled={isUploadingBgs || isRendering}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                      >
                        {isUploadingBgs ? <Loader2 size={13} className="animate-spin" /> : <FolderUp size={13} />}
                        <span>Tải ảnh nền mới</span>
                      </button>
                    </div>
                  </div>

                  {exportUploadedBgUrl && (
                    <div className="flex items-center gap-3 p-2 bg-slate-900 rounded-xl border border-slate-800">
                      <img
                        src={exportUploadedBgUrl}
                        alt="Current Background"
                        className="w-12 h-12 rounded-lg object-cover border border-slate-700"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-white block">Nền đang chọn</span>
                        <span className="text-[10px] text-slate-400 block truncate">{exportUploadedBgUrl}</span>
                      </div>
                    </div>
                  )}

                  {availableBackgrounds.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                      {availableBackgrounds.map((bg) => (
                        <div
                          key={bg.url}
                          onClick={() => setExportUploadedBgUrl(bg.url)}
                          className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer transition ${
                            exportUploadedBgUrl === bg.url
                              ? 'border-amber-500 ring-2 ring-amber-400'
                              : 'border-slate-800 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={bg.url} alt={bg.name} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* MODE A: SINGLE VIDEO CONFIGURATION                                */}
        {/* ----------------------------------------------------------------- */}
        {renderMode === 'single' && (
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Số câu hỏi cho video này:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={poolCount || 1}
                    value={singleQuestionCount}
                    onChange={(e) => setSingleQuestionCount(Math.max(1, Math.min(poolCount, Number(e.target.value) || 1)))}
                    disabled={isRendering}
                    className="w-20 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[11px] text-slate-400">/ {poolCount} câu có sẵn</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Đảo vị trí đáp án (Shuffle):
                </label>
                <button
                  type="button"
                  onClick={() => setSingleShuffleAnswers(!singleShuffleAnswers)}
                  disabled={isRendering}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                    singleShuffleAnswers
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <Shuffle size={14} />
                  <span>{singleShuffleAnswers ? 'Đang BẬT (A/B/C tự đảo)' : 'Đang TẮT (Giữ nguyên)'}</span>
                </button>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Bố cục & Kênh:
                </label>
                <span className="font-semibold text-white block truncate">
                  {channel.name} • {template.name}
                </span>
              </div>
            </div>

            {/* File Name Configuration */}
            <div className="space-y-1.5 pt-3 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <FileText size={14} className="text-amber-400" />
                  <span>Tên File Video (File Name)</span>
                </label>
                {isCustomSingleFileName && (
                  <button
                    type="button"
                    onClick={handleResetSingleFileName}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw size={11} />
                    <span>Khôi phục tên mặc định</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                value={singleFileName}
                onChange={(e) => {
                  setSingleFileName(e.target.value);
                  setIsCustomSingleFileName(true);
                }}
                disabled={isRendering}
                placeholder="Video_Quiz_01.mp4"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              onClick={handleStartSingleRender}
              disabled={isRendering || poolCount === 0}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:opacity-95 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99] cursor-pointer"
            >
              {isRendering ? (
                <>
                  <Loader2 size={18} className="animate-spin text-slate-950" />
                  <span>ĐANG XỬ LÝ RENDER ({jobState?.progress ?? 0}%)...</span>
                </>
              ) : (
                <>
                  <Video size={18} />
                  <span>BẮT ĐẦU RENDER VIDEO ({singleQuestionCount} CÂU HỎI)</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* MODE B: BATCH MULTIPLE VIDEOS CONFIGURATION                       */}
        {/* ----------------------------------------------------------------- */}
        {renderMode === 'batch' && (
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Số lượng video cần tạo:
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={videoCount}
                  onChange={(e) => setVideoCount(Math.max(1, Number(e.target.value) || 1))}
                  disabled={isRendering}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Số câu hỏi mỗi video:
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={questionsPerVideo}
                  onChange={(e) => setQuestionsPerVideo(Math.max(1, Number(e.target.value) || 1))}
                  disabled={isRendering}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Thuật toán chọn câu hỏi:
                </label>
                <select
                  value={selectionMode}
                  onChange={(e) => setSelectionMode(e.target.value as SelectionMode)}
                  disabled={isRendering}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="balanced_random">Hạn chế trùng câu (Balanced Random)</option>
                  <option value="sequential">Tuần tự theo danh sách (Sequential)</option>
                  <option value="random">Ngẫu nhiên hoàn toàn (Pure Random)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Shuffle vị trí đáp án (A/B/C):
                </label>
                <button
                  type="button"
                  onClick={() => setBatchShuffleAnswers(!batchShuffleAnswers)}
                  disabled={isRendering}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    batchShuffleAnswers
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <Shuffle size={14} />
                  <span>{batchShuffleAnswers ? 'ON (Đảo đáp án)' : 'OFF (Giữ nguyên)'}</span>
                </button>
              </div>
            </div>

            {/* PRE-RENDER ESTIMATION BOX */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Split size={14} className="text-amber-400" />
                  <span>Ước Lượng & Phân Bổ Câu Hỏi Trước Khi Render</span>
                </span>

                {estimation.hasDeficit ? (
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[10px] font-bold">
                    Tự động xoay vòng Pool
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[10px] font-bold">
                    Đủ 100% câu hỏi không trùng
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block font-sans font-semibold">Question Pool:</span>
                  <span className="text-sm font-black text-white">{estimation.totalQuestions} câu</span>
                </div>
                <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block font-sans font-semibold">Questions / Video:</span>
                  <span className="text-sm font-black text-white">{estimation.questionsPerVideo} câu</span>
                </div>
                <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block font-sans font-semibold">Videos Yêu Cầu:</span>
                  <span className="text-sm font-black text-amber-400">{estimation.requestedVideos} video</span>
                </div>
                <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block font-sans font-semibold">Required Questions:</span>
                  <span className="text-sm font-black text-rose-400">{estimation.requiredQuestions} câu</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
                <div>
                  <span>Có thể tạo tối đa </span>
                  <strong className="text-white font-mono">{estimation.fullVideosPossible}</strong>
                  <span> video đầy đủ không trùng câu. </span>
                  {estimation.hasDeficit && (
                    <span className="text-amber-300">
                      (Thiếu {estimation.deficitCount} câu — Hệ thống tự động random xoay vòng để đủ {estimation.questionsPerVideo} câu/video).
                    </span>
                  )}
                </div>

                <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-300">
                  <input
                    type="checkbox"
                    checked={autoReusePool}
                    onChange={(e) => setAutoReusePool(e.target.checked)}
                    disabled={isRendering}
                    className="accent-amber-500 rounded"
                  />
                  <span>Auto Random & Reuse Pool</span>
                </label>
              </div>
            </div>

            {/* Batch Backgrounds Selector */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div>
                  <span className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon size={14} className="text-amber-400" />
                    <span>Bộ Sưu Tập Background Cho Batch ({selectedBatchBackgrounds.length} ảnh đã chọn)</span>
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Mỗi video sẽ nhận 1 background riêng biệt, tự động xoay vòng ưu tiên không trùng liên tiếp.
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    ref={bgFilesInputRef}
                    onChange={handleUploadBatchFiles}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => bgFilesInputRef.current?.click()}
                    disabled={isUploadingBgs || isRendering}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    {isUploadingBgs ? <Loader2 size={13} className="animate-spin" /> : <FolderUp size={13} />}
                    <span>Upload Thêm Ảnh Nền</span>
                  </button>

                  {availableBackgrounds.length > 0 && (
                    <button
                      type="button"
                      onClick={selectedBatchBackgrounds.length === availableBackgrounds.length ? clearAllBackgrounds : selectAllBackgrounds}
                      disabled={isRendering}
                      className="px-2 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-[11px] font-semibold transition"
                    >
                      {selectedBatchBackgrounds.length === availableBackgrounds.length ? 'Bỏ chọn hết' : 'Chọn tất cả'}
                    </button>
                  )}
                </div>
              </div>

              {availableBackgrounds.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  {availableBackgrounds.map((bg) => {
                    const isSelected = selectedBatchBackgrounds.includes(bg.url);
                    return (
                      <div
                        key={bg.url}
                        onClick={() => !isRendering && toggleSelectBackground(bg.url)}
                        className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer transition ${
                          isSelected
                            ? 'border-amber-500 ring-1 ring-amber-400'
                            : 'border-slate-800 opacity-50 hover:opacity-80'
                        }`}
                      >
                        <img src={bg.url} alt={bg.name} className="w-full h-full object-cover" />
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-[9px]">
                            ✓
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Batch File Names Accordion */}
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60">
              <button
                type="button"
                onClick={() => setIsBatchNamesOpen(!isBatchNamesOpen)}
                className="w-full p-3 flex items-center justify-between text-slate-300 hover:text-white font-bold text-xs transition"
              >
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-amber-400" />
                  <span>Danh sách tên file cho {batchFileNames.length} video trong batch</span>
                </div>
                {isBatchNamesOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {isBatchNamesOpen && (
                <div className="p-3 border-t border-slate-800 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 scrollbar-thin text-xs">
                    {batchFileNames.map((name, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
                        <span className="w-16 shrink-0 font-bold text-amber-400 font-mono text-[11px]">
                          #{String(idx + 1).padStart(2, '0')}:
                        </span>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => handleBatchFileNameChange(idx, e.target.value)}
                          disabled={isRendering}
                          className="flex-1 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-xs font-mono font-medium text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Batch Start Button */}
            <button
              onClick={handleStartBatchRender}
              disabled={isRendering || poolCount === 0}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:opacity-95 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99] cursor-pointer"
            >
              {isRendering ? (
                <>
                  <Loader2 size={18} className="animate-spin text-slate-950" />
                  <span>ĐANG XỬ LÝ BATCH {batchState ? `VIDEO ${batchState.currentVideoIndex}/${batchState.totalVideos}` : ''} ({batchState?.progress ?? 0}%)...</span>
                </>
              ) : (
                <>
                  <Boxes size={18} />
                  <span>BẮT ĐẦU RENDER BATCH ({videoCount} VIDEO • {questionsPerVideo} CÂU/VIDEO)</span>
                </>
              )}
            </button>
          </div>
        )}
      </section>

      {/* 2. REALTIME TELEMETRY & ETA DASHBOARD */}
      {(jobState || batchState) && (
        <section className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl backdrop-blur-md">
          {/* Queue Status Alert Banner */}
          {jobState?.status === 'queued' && (
            <div className="bg-amber-500/15 border border-amber-500/40 rounded-xl p-4 flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm shrink-0 shadow-md">
                #{jobState.queuePosition || 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-amber-300 uppercase">Hàng Đợi Render (FIFO Queue)</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                    Vị trí #{jobState.queuePosition || 1}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Máy chủ đang xử lý tác vụ trước để đảm bảo bộ nhớ. Tác vụ của bạn sẽ tự động chạy ngay khi đến lượt!
                </p>
              </div>
            </div>
          )}

          {/* Top Status Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              {isRendering && <Loader2 size={20} className="animate-spin text-amber-400" />}
              {((batchState && batchState.status === 'completed') || (!batchState && jobState?.status === 'completed')) && (
                <CheckCircle2 size={20} className="text-emerald-400" />
              )}
              {((batchState && batchState.status === 'failed') || (!batchState && jobState?.status === 'failed')) && (
                <AlertCircle size={20} className="text-rose-400" />
              )}

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-white uppercase">
                    {batchState
                      ? `Rendering Video ${batchState.currentVideoIndex} / ${batchState.totalVideos}`
                      : `Tác vụ: ${jobState?.jobId}`}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold border border-slate-700">
                    {batchState ? batchState.batchId : jobState?.jobId}
                  </span>
                </div>
                <span className="text-xs text-slate-400 block mt-0.5">
                  {batchState ? batchState.stage : jobState?.stage}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className={`text-base font-mono font-black px-3.5 py-1 rounded-xl border ${
                (batchState?.status === 'completed' || (!batchState && jobState?.status === 'completed'))
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/40'
              }`}>
                {batchState ? batchState.progress : jobState?.progress}%
              </span>
            </div>
          </div>

          {/* Video Player Timeline Scrubber */}
          <RenderProgressScrubber
            progress={batchState ? batchState.progress : (jobState?.progress || 0)}
            status={(batchState ? batchState.status : jobState?.status) || 'pending'}
            currentStageName={batchState ? batchState.stage : jobState?.stage}
            currentFps={currentDisplayFps}
            renderSpeed={currentDisplaySpeed}
            currentFrame={currentDisplayFrame}
            totalFrames={currentDisplayTotalFrames}
            elapsedSec={currentDisplayElapsed}
            etaSec={currentDisplayEta}
            stages={stagesList}
            renderPreset={jobState?.renderPreset || renderPreset}
          />

          {/* REALTIME METRICS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 font-mono text-xs">
            {/* 1. Progress */}
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block font-sans font-bold flex items-center gap-1">
                <Activity size={12} className="text-amber-400" />
                <span>Tiến Độ</span>
              </span>
              <span className="text-sm font-black text-white mt-1 block">
                {batchState ? batchState.progress : jobState?.progress}%
              </span>
            </div>

            {/* 2. Elapsed Time */}
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block font-sans font-bold flex items-center gap-1">
                <Clock size={12} className="text-sky-400" />
                <span>Thời gian chạy</span>
              </span>
              <span className="text-sm font-black text-white mt-1 block">
                {formatTime(currentDisplayElapsed)}
              </span>
            </div>

            {/* 3. Real ETA */}
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block font-sans font-bold flex items-center gap-1">
                <Timer size={12} className="text-rose-400" />
                <span>Còn lại (ETA)</span>
              </span>
              <span className="text-sm font-black text-rose-400 mt-1 block">
                {formatTime(currentDisplayEta)}
              </span>
            </div>

            {/* 4. Current FPS */}
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block font-sans font-bold flex items-center gap-1">
                <Gauge size={12} className="text-emerald-400" />
                <span>Current FPS</span>
              </span>
              <span className="text-sm font-black text-emerald-400 mt-1 block">
                {currentDisplayFps > 0 ? `${currentDisplayFps} FPS` : '-- FPS'}
              </span>
            </div>

            {/* 5. Render Speed */}
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block font-sans font-bold flex items-center gap-1">
                <Zap size={12} className="text-purple-400" />
                <span>Render Speed</span>
              </span>
              <span className="text-sm font-black text-purple-400 mt-1 block">
                {currentDisplaySpeed > 0 ? `${currentDisplaySpeed}x` : '--x'}
              </span>
            </div>

            {/* 6. Current Frames */}
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block font-sans font-bold flex items-center gap-1">
                <Layers size={12} className="text-amber-400" />
                <span>Khung Hình</span>
              </span>
              <span className="text-sm font-black text-white mt-1 block truncate">
                {currentDisplayFrame} / {currentDisplayTotalFrames || '--'}
              </span>
            </div>
          </div>

          {/* Detailed 7-Stage Stepper View */}
          <div className="pt-2">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers size={13} className="text-amber-400" />
              <span>Tiến trình 7 Giai Đoạn (Pipeline Stages)</span>
            </h4>

            <div className="space-y-1.5 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
              {stagesList.map((stg) => {
                const isCompleted = stg.status === 'completed';
                const isRunning = stg.status === 'running';
                const isFailed = stg.status === 'failed';
                const isPending = stg.status === 'pending';

                return (
                  <div
                    key={stg.id}
                    className={`px-3 py-2 rounded-lg border flex items-center justify-between text-xs transition-all ${
                      isRunning
                        ? 'bg-amber-500/15 border-amber-500/50 shadow-sm'
                        : isCompleted
                        ? 'bg-slate-900 border-slate-800/80 text-slate-200'
                        : isFailed
                        ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                        : 'bg-transparent border-transparent text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {isCompleted && <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />}
                      {isRunning && <Loader2 size={15} className="animate-spin text-amber-400 shrink-0" />}
                      {isFailed && <AlertCircle size={15} className="text-rose-400 shrink-0" />}
                      {isPending && <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-500 shrink-0">{stg.order}</div>}

                      <div className="min-w-0">
                        <span className={`font-bold block truncate ${isRunning ? 'text-amber-300' : isCompleted ? 'text-white' : isFailed ? 'text-rose-300' : 'text-slate-400'}`}>
                          {stg.name}
                        </span>
                        {stg.message && (
                          <span className="text-[10px] text-slate-400 block truncate font-normal">
                            {stg.message}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {stg.durationMs && (
                        <span className="text-[10px] font-mono text-slate-500">
                          {(stg.durationMs / 1000).toFixed(1)}s
                        </span>
                      )}
                      {isRunning && (
                        <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30">
                          {stg.progress}%
                        </span>
                      )}
                      {isCompleted && (
                        <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30">
                          Xong
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Batch Completed Videos List */}
          {batchState && batchState.completedVideos && batchState.completedVideos.length > 0 && (
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>Video Đã Render Xong Trong Batch ({batchState.completedVideosCount}/{batchState.totalVideos})</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {batchState.completedVideos.map((v) => (
                  <div
                    key={v.jobId}
                    className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 flex-1 mr-2">
                      <span className="font-bold text-white block truncate" title={v.fileName || `Video ${v.index}`}>
                        #{v.index}: {v.fileName || `${v.jobId}.mp4`}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {v.questionCount} câu • {v.durationSec ? `${v.durationSec}s` : ''} — {formatBytes(v.fileSizeBytes)}
                      </span>
                    </div>

                    {v.outputUrl && (
                      <a
                        href={`/api/render/download/${v.jobId}`}
                        download={v.fileName || `${v.jobId}.mp4`}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center gap-1 transition shadow-sm shrink-0"
                      >
                        <Download size={12} />
                        <span>Tải MP4</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Single Completed Video Preview & Download */}
          {!batchState && jobState?.status === 'completed' && jobState.outputUrl && (
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-300 font-bold">
                  <CheckCircle size={16} />
                  <span>Video đã hoàn tất! Dung lượng: {formatBytes(jobState.fileSizeBytes)} (~{jobState.durationSec || 0}s)</span>
                </div>
                <a
                  href={`/api/render/download/${jobState.jobId}`}
                  download={jobState.fileName || `${jobState.jobId}.mp4`}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-lg shadow-sm transition flex items-center gap-1.5 text-xs cursor-pointer"
                >
                  <Download size={14} />
                  <span>Tải MP4 ({jobState.fileName || `${jobState.jobId}.mp4`})</span>
                </a>
              </div>

              <div className="aspect-[9/16] max-w-xs mx-auto rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-2xl bg-black">
                <video
                  src={jobState.outputUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}
        </section>
      )}

      {/* 3. RENDER JOBS HISTORY */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>Lịch Sử Render Gần Đây</span>
          </h3>
          <button
            onClick={loadJobs}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
            title="Làm mới lịch sử"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {jobsHistory.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs">
            Chưa có video nào được render. Hãy chọn số câu hỏi và nhấn nút Bắt đầu Render ở trên!
          </div>
        ) : (
          <div className="space-y-2">
            {jobsHistory.slice(0, 10).map((j) => (
              <div
                key={j.jobId}
                className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-white block font-mono">
                    {j.fileName || j.jobId}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(j.createdAt).toLocaleTimeString()} — {j.stage}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {j.status === 'completed' && (
                    <a
                      href={`/api/render/download/${j.jobId}`}
                      download={j.fileName || `${j.jobId}.mp4`}
                      className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-lg font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Download size={12} />
                      <span>Tải MP4</span>
                    </a>
                  )}
                  {j.status === 'processing' && (
                    <span className="text-amber-400 flex items-center gap-1 font-semibold">
                      <Loader2 size={12} className="animate-spin" />
                      <span>{j.progress}%</span>
                    </span>
                  )}
                  {j.status === 'failed' && <span className="text-rose-400 font-semibold">Thất bại</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
