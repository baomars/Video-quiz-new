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
  uploadBackgroundBatch
} from '../../services/api';
import {
  estimateBatch,
  generateBatchQuestionSets,
  shuffleQuestionAnswers,
  allocateBatchBackgrounds,
  SelectionMode,
  BatchConfig
} from '../../utils/quizBatchEngine';
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
  Trash2
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
  { id: 'stage_2_tts', name: '2. Tạo giọng đọc TTS (Edge-TTS)' },
  { id: 'stage_3_timeline', name: '3. Tính toán Timeline & Đóng gói' },
  { id: 'stage_4_render_frames', name: '4. Render khung hình Video (Chromium)' },
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
  setBatchState: propsSetBatchState
}) => {
  // Mode selection
  const [renderMode, setRenderMode] = useState<'single' | 'batch'>('single');

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
  const [singleFileName, setSingleFileName] = useState<string>(() => generateDefaultFileName(quiz?.title || 'Video_Quiz', 1));
  const [isCustomSingleFileName, setIsCustomSingleFileName] = useState<boolean>(false);

  // Sync single file name when quiz.title changes (if user hasn't typed custom name)
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

  // Sync batch file names when videoCount or quiz.title changes
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

  // Active rendering jobs (use props if passed from App, else local)
  const [localActiveJobId, setLocalActiveJobId] = useState<string | null>(null);
  const [localJobState, setLocalJobState] = useState<RenderJob | null>(null);
  const [localActiveBatchId, setLocalActiveBatchId] = useState<string | null>(null);
  const [localBatchState, setLocalBatchState] = useState<BatchRenderJob | null>(null);

  // Batch Backgrounds Selection & Allocation
  const [availableBackgrounds, setAvailableBackgrounds] = useState<Array<{ name: string; url: string; filename: string }>>([]);
  const [selectedBatchBackgrounds, setSelectedBatchBackgrounds] = useState<string[]>([]);
  const [isUploadingBgs, setIsUploadingBgs] = useState(false);
  const bgFilesInputRef = useRef<HTMLInputElement>(null);
  const bgFolderInputRef = useRef<HTMLInputElement>(null);

  // Load available backgrounds on mount
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

  // Pre-allocated background assignments for each video in the batch
  const allocatedBackgrounds = useMemo(() => {
    if (selectedBatchBackgrounds.length === 0) return [];
    return allocateBatchBackgrounds(selectedBatchBackgrounds, videoCount);
  }, [selectedBatchBackgrounds, videoCount]);

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
  const [batchHistory, setBatchHistory] = useState<BatchRenderJob[]>([]);
  const consecutiveErrorsRef = useRef<number>(0);

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

  const loadJobs = () => {
    listRenderJobs()
      .then(setJobsHistory)
      .catch((err) => console.error('Failed to load jobs:', err));
    listBatchRenderJobs()
      .then(setBatchHistory)
      .catch((err) => console.error('Failed to load batch jobs:', err));
  };

  // Helper to format seconds to mm:ss
  const formatTime = (seconds?: number) => {
    if (seconds === undefined || seconds === null || isNaN(seconds)) return '--:--';
    const s = Math.max(0, Math.round(seconds));
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Helper to format file size
  const formatBytes = (bytes?: number) => {
    if (!bytes) return '';
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Polling for Single Render Job
  useEffect(() => {
    if (!activeJobId) return;

    consecutiveErrorsRef.current = 0;
    const interval = setInterval(async () => {
      try {
        const status: RenderJob = await getRenderStatus(activeJobId);
        consecutiveErrorsRef.current = 0;
        setJobState(status);

        if (status.status === 'completed' || status.status === 'failed') {
          clearInterval(interval);
          loadJobs();
        }
      } catch (err) {
        consecutiveErrorsRef.current += 1;
        if (consecutiveErrorsRef.current >= 10) {
          clearInterval(interval);
          setJobState((prev) =>
            prev
              ? {
                  ...prev,
                  status: 'failed',
                  error: 'Mất kết nối với máy chủ render sau 10 lần thử lại.',
                  errorStage: 'Network Polling'
                }
              : null
          );
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
        const batch: BatchRenderJob = await getBatchRenderStatus(activeBatchId);
        setBatchState(batch);

        // Also fetch active sub-job state for detailed telemetry if present
        if (batch.currentJobId) {
          getRenderStatus(batch.currentJobId)
            .then(setJobState)
            .catch(() => {});
        }

        if (batch.status === 'completed' || batch.status === 'failed') {
          clearInterval(interval);
          loadJobs();
        }
      } catch (err) {
        console.warn('Batch polling error:', err);
      }
    }, 700);

    return () => clearInterval(interval);
  }, [activeBatchId]);

  // 1. Trigger Single Video Render
  const handleStartSingleRender = async () => {
    setIsStarting(true);
    setJobState(null);
    setBatchState(null);
    setActiveBatchId(null);

    try {
      // Prepare question set for single video
      let questionsToRender: QuizQuestion[] = quiz.questions.slice(0, Math.min(singleQuestionCount, quiz.questions.length));
      if (singleShuffleAnswers) {
        questionsToRender = questionsToRender.map(q => shuffleQuestionAnswers(q));
      }

      const singleQuizPayload: Quiz = {
        ...quiz,
        questions: questionsToRender
      };

      const jobId = await startRender({
        channel,
        template,
        quiz: singleQuizPayload,
        language,
        customFileName: singleFileName
      });

      setActiveJobId(jobId);
      setJobState({
        jobId,
        fileName: singleFileName,
        status: 'processing',
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
            message: `Khởi động render video: ${channel.name} • ${quiz.title} (${questionsToRender.length} câu hỏi, File: ${singleFileName})`
          }
        ]
      });
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
      const batchId = await startBatchRender({
        channel,
        template,
        quiz,
        language,
        config,
        customFileNames: batchFileNames
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

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* 1. Header & Mode Switcher */}
      <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 text-white flex items-center justify-center font-bold shadow-xs">
              <Film size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Trung Tâm Xuất Video Chuyên Nghiệp (High-Performance Studio)
              </h3>
              <p className="text-[11px] text-slate-500">
                Độ phân giải 9:16 (720×1280) @ 30 FPS • H.264 High Profile • Hỗ trợ Render Đơn Lẻ & Hàng Loạt
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setRenderMode('single')}
              disabled={isRendering}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                renderMode === 'single'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
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
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Boxes size={14} />
              <span>Render Nhiều Video (Batch)</span>
            </button>
          </div>
        </div>

        {/* MODE A: Single Video Configuration */}
        {renderMode === 'single' && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
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
                    className="w-24 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[11px] text-slate-500">/ {poolCount} câu trong ngân hàng</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Đảo vị trí đáp án (Shuffle Answers):
                </label>
                <button
                  type="button"
                  onClick={() => setSingleShuffleAnswers(!singleShuffleAnswers)}
                  disabled={isRendering}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                    singleShuffleAnswers
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <Shuffle size={14} />
                  <span>{singleShuffleAnswers ? 'Đang BẬT (A/B/C tự đảo)' : 'Đang TẮT (Giữ nguyên)'}</span>
                </button>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Bố cục & Kênh xuất bản:
                </label>
                <span className="font-semibold text-slate-800 block truncate">
                  {channel.name} • {template.name}
                </span>
              </div>
            </div>

            {/* File Name Configuration */}
            <div className="space-y-1.5 pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText size={14} className="text-amber-600" />
                  <span>Tên File Video (File Name)</span>
                </label>
                {isCustomSingleFileName && (
                  <button
                    type="button"
                    onClick={handleResetSingleFileName}
                    className="text-[11px] text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 cursor-pointer"
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
                placeholder="Kien_thuc_tong_hop_vui_2026-09-12_01.mp4"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-2xs"
              />
              <p className="text-[11px] text-slate-500">
                Quy tắc mặc định: <code className="font-mono text-amber-700 bg-amber-50 px-1 py-0.5 rounded">[Video Title]_[YYYY-MM-DD]_01.mp4</code>. Bạn có thể sửa trực tiếp tên file theo ý muốn.
              </p>
            </div>

            <button
              onClick={handleStartSingleRender}
              disabled={isRendering || poolCount === 0}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 hover:opacity-95 text-white font-black text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99] cursor-pointer"
            >
              {isRendering ? (
                <>
                  <Loader2 size={18} className="animate-spin text-white" />
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

        {/* MODE B: Batch Multiple Videos Configuration */}
        {renderMode === 'batch' && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
            {/* Input Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Số lượng video cần tạo:
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={videoCount}
                  onChange={(e) => setVideoCount(Math.max(1, Number(e.target.value) || 1))}
                  disabled={isRendering}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Số câu hỏi mỗi video:
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={questionsPerVideo}
                  onChange={(e) => setQuestionsPerVideo(Math.max(1, Number(e.target.value) || 1))}
                  disabled={isRendering}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Thuật toán chọn câu hỏi:
                </label>
                <select
                  value={selectionMode}
                  onChange={(e) => setSelectionMode(e.target.value as SelectionMode)}
                  disabled={isRendering}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                >
                  <option value="balanced_random">Hạn chế trùng câu (Balanced Random)</option>
                  <option value="sequential">Tuần tự theo danh sách (Sequential)</option>
                  <option value="random">Ngẫu nhiên hoàn toàn (Pure Random)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Shuffle vị trí đáp án (A/B/C):
                </label>
                <button
                  type="button"
                  onClick={() => setBatchShuffleAnswers(!batchShuffleAnswers)}
                  disabled={isRendering}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    batchShuffleAnswers
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <Shuffle size={14} />
                  <span>{batchShuffleAnswers ? 'ON (Đảo đáp án)' : 'OFF (Giữ nguyên)'}</span>
                </button>
              </div>
            </div>

            {/* PRE-RENDER ESTIMATION BOX (Requirement 1 & 2) */}
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Split size={14} className="text-amber-600" />
                  <span>Ước Lượng & Phân Bổ Câu Hỏi Trước Khi Render</span>
                </span>

                {estimation.hasDeficit ? (
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-300 rounded text-[10px] font-bold">
                    Tự động tái sử dụng Pool (Auto Reuse ON)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded text-[10px] font-bold">
                    Đủ 100% câu hỏi không trùng
                  </span>
                )}
              </div>

              {/* Exact Metrics Grid as required */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase block font-sans font-semibold">Question Pool:</span>
                  <span className="text-sm font-black text-slate-900">{estimation.totalQuestions} câu</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase block font-sans font-semibold">Questions / Video:</span>
                  <span className="text-sm font-black text-slate-900">{estimation.questionsPerVideo} câu</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase block font-sans font-semibold">Videos Yêu Cầu:</span>
                  <span className="text-sm font-black text-amber-700">{estimation.requestedVideos} video</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase block font-sans font-semibold">Required Questions:</span>
                  <span className="text-sm font-black text-rose-700">{estimation.requiredQuestions} câu</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                <div>
                  <span>Có thể tạo tối đa </span>
                  <span className="font-bold text-slate-900 font-mono">{estimation.fullVideosPossible}</span>
                  <span> video đầy đủ không trùng câu. </span>
                  {estimation.hasDeficit ? (
                    <span className="text-amber-700 font-bold">
                      (Thiếu {estimation.deficitCount} câu — Hệ thống sẽ tự động random và xoay vòng Question Pool để tất cả video luôn đủ {estimation.questionsPerVideo} câu).
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-bold">
                      (Thừa {estimation.surplusCount} câu trong Pool).
                    </span>
                  )}
                </div>

                <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={autoReusePool}
                    onChange={(e) => setAutoReusePool(e.target.checked)}
                    disabled={isRendering}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Auto Random & Reuse Pool</span>
                </label>
              </div>
            </div>

            {/* BACKGROUND CHO BATCH RENDER (Requirement 3) */}
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div>
                  <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon size={14} className="text-amber-600" />
                    <span>Bộ Sưu Tập Background Cho Batch Render</span>
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Mỗi video sẽ nhận 1 background riêng biệt. Nếu ít hơn số video, hệ thống tự động xoay vòng ưu tiên không trùng liên tiếp.
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                    ref={bgFilesInputRef}
                    onChange={handleUploadBatchFiles}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => bgFilesInputRef.current?.click()}
                    disabled={isUploadingBgs || isRendering}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                  >
                    {isUploadingBgs ? <Loader2 size={13} className="animate-spin" /> : <FolderUp size={13} />}
                    <span>{isUploadingBgs ? 'Đang tải ảnh...' : 'Upload Folder / Nhiều Ảnh Nền'}</span>
                  </button>

                  {availableBackgrounds.length > 0 && (
                    <button
                      type="button"
                      onClick={selectedBatchBackgrounds.length === availableBackgrounds.length ? clearAllBackgrounds : selectAllBackgrounds}
                      disabled={isRendering}
                      className="px-2 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-[11px] font-semibold transition cursor-pointer"
                    >
                      {selectedBatchBackgrounds.length === availableBackgrounds.length ? 'Bỏ chọn hết' : 'Chọn tất cả'}
                    </button>
                  )}
                </div>
              </div>

              {/* Status Badge & Summary */}
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-600 font-semibold">Kho ảnh đã chọn:</span>
                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    {selectedBatchBackgrounds.length} ảnh
                  </span>
                  <span className="text-slate-400">cho</span>
                  <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                    {videoCount} video
                  </span>
                </div>

                {selectedBatchBackgrounds.length >= videoCount ? (
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded text-[10px] font-bold">
                    ✓ Đủ 100% mỗi video 1 ảnh riêng biệt
                  </span>
                ) : selectedBatchBackgrounds.length > 0 ? (
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-300 rounded text-[10px] font-bold">
                    ⚡ Tự động xoay vòng ảnh (Không trùng liên tiếp)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px]">
                    Sử dụng ảnh nền mặc định của template
                  </span>
                )}
              </div>

              {/* Selected Backgrounds Thumbnail Grid */}
              {availableBackgrounds.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
                  {availableBackgrounds.map((bg) => {
                    const isSelected = selectedBatchBackgrounds.includes(bg.url);
                    return (
                      <div
                        key={bg.url}
                        onClick={() => !isRendering && toggleSelectBackground(bg.url)}
                        className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer transition group ${
                          isSelected
                            ? 'border-amber-500 shadow-xs ring-1 ring-amber-400'
                            : 'border-slate-200 opacity-50 hover:opacity-80'
                        }`}
                      >
                        <img src={bg.url} alt={bg.name} className="w-full h-full object-cover" />
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-[9px]">
                            ✓
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-black/60 text-[9px] text-white truncate px-1 py-0.5 text-center">
                          {bg.name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pre-Render Allocation Preview Table */}
              {allocatedBackgrounds.length > 0 && (
                <div className="space-y-1.5 pt-1 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Bảng Phân Bổ Background Đã Xác Định Trước:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-36 overflow-y-auto p-1 bg-slate-50 rounded-lg border border-slate-200 text-[11px]">
                    {allocatedBackgrounds.map((bgUrl, vIdx) => {
                      const bgObj = availableBackgrounds.find(b => b.url === bgUrl);
                      const bgName = bgObj ? bgObj.name : bgUrl.split('/').pop();
                      return (
                        <div key={vIdx} className="flex items-center gap-2 bg-white p-1.5 rounded border border-slate-200">
                          <img src={bgUrl} alt={bgName} className="w-7 h-7 rounded object-cover shrink-0 border border-slate-200" />
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-amber-700 block">Video #{vIdx + 1}</span>
                            <span className="text-[10px] text-slate-600 block truncate" title={bgName}>{bgName}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Batch File Names Configuration (Requirement 3) */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText size={14} className="text-amber-600" />
                  <span>Danh Sách Tên File Render (File Names) ({batchFileNames.length} video)</span>
                </label>
                {isCustomBatchFileNames && (
                  <button
                    type="button"
                    onClick={handleResetBatchFileNames}
                    className="text-[11px] text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw size={11} />
                    <span>Khôi phục tên mặc định</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Mỗi video trong batch sẽ lưu với tên file tương ứng theo quy tắc <code className="font-mono text-amber-700 bg-amber-50 px-1 py-0.5 rounded">[Video Title]_[YYYY-MM-DD]_[01, 02...].mp4</code>. Bạn có thể sửa tên từng file:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-white rounded-xl border border-slate-200 text-xs">
                {batchFileNames.map((name, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <span className="w-16 shrink-0 font-bold text-amber-800 font-mono text-[11px]">
                      Video {String(idx + 1).padStart(2, '0')}:
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => handleBatchFileNameChange(idx, e.target.value)}
                      disabled={isRendering}
                      className="flex-1 px-2.5 py-1 bg-white border border-slate-300 rounded text-xs font-mono font-medium text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Batch Start Button */}
            <button
              onClick={handleStartBatchRender}
              disabled={isRendering || poolCount === 0}
              className="w-full py-3.5 bg-gradient-to-r from-amber-600 via-rose-600 to-amber-600 hover:opacity-95 text-white font-black text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99] cursor-pointer"
            >
              {isRendering ? (
                <>
                  <Loader2 size={18} className="animate-spin text-white" />
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

      {/* 2. REALTIME TELEMETRY & ETA DASHBOARD (Requirement 5) */}
      {(jobState || batchState) && (
        <section className="bg-white border-2 border-amber-400/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
          {/* Top Status Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              {isRendering && <Loader2 size={20} className="animate-spin text-amber-600" />}
              {((batchState && batchState.status === 'completed') || (!batchState && jobState?.status === 'completed')) && (
                <CheckCircle2 size={20} className="text-emerald-600" />
              )}
              {((batchState && batchState.status === 'failed') || (!batchState && jobState?.status === 'failed')) && (
                <AlertCircle size={20} className="text-rose-600" />
              )}

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900 uppercase">
                    {batchState
                      ? `Rendering Video ${batchState.currentVideoIndex} / ${batchState.totalVideos}`
                      : `Rendering Video: ${jobState?.jobId}`}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                    {batchState ? batchState.batchId : jobState?.jobId}
                  </span>
                </div>
                <span className="text-xs text-slate-600 block mt-0.5">
                  {batchState ? batchState.stage : jobState?.stage}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className={`text-base font-mono font-black px-3.5 py-1 rounded-xl border ${
                (batchState?.status === 'completed' || (!batchState && jobState?.status === 'completed'))
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-amber-50 text-amber-700 border-amber-300'
              }`}>
                {batchState ? batchState.progress : jobState?.progress}%
              </span>
            </div>
          </div>

          {/* Master Progress Bar */}
          <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-500 transition-all duration-300"
              style={{ width: `${batchState ? batchState.progress : jobState?.progress}%` }}
            />
          </div>

          {/* REALTIME METRICS GRID (Exact format as required in prompt) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 font-mono text-xs">
            {/* 1. Progress */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold flex items-center gap-1">
                <Activity size={12} className="text-amber-600" />
                <span>Tiến Độ</span>
              </span>
              <span className="text-sm font-black text-slate-900 mt-1 block">
                {batchState ? batchState.progress : jobState?.progress}%
              </span>
            </div>

            {/* 2. Elapsed Time */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold flex items-center gap-1">
                <Clock size={12} className="text-sky-600" />
                <span>Elapsed</span>
              </span>
              <span className="text-sm font-black text-slate-900 mt-1 block">
                {formatTime(currentDisplayElapsed)}
              </span>
            </div>

            {/* 3. Real ETA */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold flex items-center gap-1">
                <Timer size={12} className="text-rose-600" />
                <span>Remaining (ETA)</span>
              </span>
              <span className="text-sm font-black text-rose-700 mt-1 block">
                {formatTime(currentDisplayEta)}
              </span>
            </div>

            {/* 4. Current FPS */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold flex items-center gap-1">
                <Gauge size={12} className="text-emerald-600" />
                <span>Current FPS</span>
              </span>
              <span className="text-sm font-black text-emerald-700 mt-1 block">
                {currentDisplayFps > 0 ? `${currentDisplayFps} FPS` : '-- FPS'}
              </span>
            </div>

            {/* 5. Render Speed */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold flex items-center gap-1">
                <Zap size={12} className="text-purple-600" />
                <span>Render Speed</span>
              </span>
              <span className="text-sm font-black text-purple-700 mt-1 block">
                {currentDisplaySpeed > 0 ? `${currentDisplaySpeed}x` : '--x'}
              </span>
            </div>

            {/* 6. Current Frames */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold flex items-center gap-1">
                <Layers size={12} className="text-amber-600" />
                <span>Khung Hình</span>
              </span>
              <span className="text-sm font-black text-slate-900 mt-1 block truncate">
                {currentDisplayFrame} / {currentDisplayTotalFrames || '--'}
              </span>
            </div>
          </div>

          {/* Detailed 7-Stage Stepper View for current active video */}
          <div className="pt-2">
            <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers size={13} className="text-amber-600" />
              <span>Các Giai Đoạn Đang Xử Lý (7 Stages Pipeline)</span>
            </h4>

            <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
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
                        ? 'bg-amber-50/80 border-amber-300 shadow-2xs'
                        : isCompleted
                        ? 'bg-white border-slate-200 text-slate-800'
                        : isFailed
                        ? 'bg-rose-50 border-rose-300 text-rose-800'
                        : 'bg-transparent border-transparent text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {isCompleted && <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />}
                      {isRunning && <Loader2 size={16} className="animate-spin text-amber-600 shrink-0" />}
                      {isFailed && <AlertCircle size={16} className="text-rose-600 shrink-0" />}
                      {isPending && <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[9px] font-bold text-slate-400 shrink-0">{stg.order}</div>}

                      <div className="min-w-0">
                        <span className={`font-bold block truncate ${isRunning ? 'text-amber-900' : isCompleted ? 'text-slate-800' : isFailed ? 'text-rose-800' : 'text-slate-500'}`}>
                          {stg.name}
                        </span>
                        {stg.message && (
                          <span className="text-[10px] text-slate-500 block truncate font-normal">
                            {stg.message}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {stg.durationMs && (
                        <span className="text-[10px] font-mono text-slate-400">
                          {(stg.durationMs / 1000).toFixed(1)}s
                        </span>
                      )}
                      {isRunning && (
                        <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                          {stg.progress}%
                        </span>
                      )}
                      {isCompleted && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          Xong
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Batch Completed Videos List (if batch mode) */}
          {batchState && batchState.completedVideos && batchState.completedVideos.length > 0 && (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>Các Video Đã Render Xong Trong Batch ({batchState.completedVideosCount}/{batchState.totalVideos})</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {batchState.completedVideos.map((v) => (
                  <div
                    key={v.jobId}
                    className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 flex-1 mr-2">
                      <span className="font-bold text-slate-800 block truncate" title={v.fileName || `Video ${v.index}`}>
                        Video {v.index}: {v.fileName || `${v.jobId}.mp4`}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono block">
                        {v.questionCount} câu • {v.durationSec ? `${v.durationSec}s` : ''} — {formatBytes(v.fileSizeBytes)}
                      </span>
                    </div>

                    {v.outputUrl && (
                      <a
                        href={`/api/render/download/${v.jobId}`}
                        download={v.fileName || `${v.jobId}.mp4`}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center gap-1 transition shadow-2xs shrink-0"
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
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-800 font-bold">
                  <CheckCircle size={16} />
                  <span>Video đã sẵn sàng! Dung lượng: {formatBytes(jobState.fileSizeBytes)} (~{jobState.durationSec || 0}s)</span>
                </div>
                <a
                  href={`/api/render/download/${jobState.jobId}`}
                  download={jobState.fileName || `${jobState.jobId}.mp4`}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-xs transition flex items-center gap-1.5 text-xs cursor-pointer"
                >
                  <Download size={14} />
                  <span>Tải MP4 ({jobState.fileName || `${jobState.jobId}.mp4`})</span>
                </a>
              </div>

              <div className="aspect-[9/16] max-w-xs mx-auto rounded-2xl overflow-hidden border-4 border-emerald-500 shadow-2xl bg-black">
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

      {/* 3. Render Jobs History */}
      <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <span>Lịch Sử Render Gần Đây</span>
          </h3>
          <button
            onClick={loadJobs}
            className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition cursor-pointer"
            title="Làm mới lịch sử"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {jobsHistory.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            Chưa có video nào được render. Hãy chọn số câu hỏi và nhấn nút Render ở trên để bắt đầu!
          </div>
        ) : (
          <div className="space-y-2">
            {jobsHistory.slice(0, 10).map((j) => (
              <div
                key={j.jobId}
                className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-800 block font-mono">
                    {j.fileName || j.jobId}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {new Date(j.createdAt).toLocaleTimeString()} — {j.stage}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {j.status === 'completed' && (
                    <a
                      href={`/api/render/download/${j.jobId}`}
                      download={j.fileName || `${j.jobId}.mp4`}
                      className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-lg font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Download size={12} />
                      <span>Tải MP4</span>
                    </a>
                  )}
                  {j.status === 'processing' && (
                    <span className="text-amber-600 flex items-center gap-1 font-semibold">
                      <Loader2 size={12} className="animate-spin" />
                      <span>{j.progress}%</span>
                    </span>
                  )}
                  {j.status === 'failed' && <span className="text-rose-600 font-semibold">Thất bại</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
