import path from 'path';
import fs from 'fs';
import os from 'os';
import { execSync } from 'child_process';
import { NativeQuizRenderer } from './native/nativeQuizRenderer.js';
import { NativeAudioMixer } from './native/audioMixer.js';
import { Channel, VideoTemplate, Quiz, LanguageCode, VideoCompositionProps } from '../../../remotion/types/index.js';
import { generateDefaultFileName, sanitizeCustomFileName } from '../../../remotion/utils/fileNameHelper.js';
import { EdgeTTSProvider } from '../tts/ttsProvider.js';
import { ImageProcessor } from '../images/imageProcessor.js';
import { TimelineEngine, QuestionTTSData } from '../timeline/timelineEngine.js';
import { BatchConfig, generateBatchQuestionSets, allocateBatchBackgrounds } from '../quiz/quizBatchEngine.js';

// Ensure Linux NVIDIA driver and CUDA libraries are accessible in LD_LIBRARY_PATH (e.g. for Google Colab GPU / NVENC)
if (process.platform === 'linux') {
  const nvidiaLibs = '/usr/lib64-nvidia:/usr/local/cuda/lib64';
  const currentLd = process.env.LD_LIBRARY_PATH || '';
  if (!currentLd.includes('/usr/lib64-nvidia')) {
    process.env.LD_LIBRARY_PATH = currentLd ? `${nvidiaLibs}:${currentLd}` : nvidiaLibs;
  }
}

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

export type RenderPresetType = 'fast' | 'standard' | 'high_quality';

export interface RenderPresetConfig {
  name: string;
  width: number;
  height: number;
  fps: number;
  jpegQuality: number;
  x264Preset: 'ultrafast' | 'superfast' | 'veryfast' | 'faster' | 'fast' | 'medium';
  videoBitrate: string;
  crf: number;
}

export const RENDER_PRESETS: Record<RenderPresetType, RenderPresetConfig> = {
  fast: {
    name: 'Nháp nhanh (720p)',
    width: 720,
    height: 1280,
    fps: 30,
    jpegQuality: 62,
    x264Preset: 'ultrafast',
    videoBitrate: '2600k',
    crf: 30
  },
  standard: {
    name: 'Cân bằng (720p)',
    width: 720,
    height: 1280,
    fps: 30,
    jpegQuality: 80,
    x264Preset: 'veryfast',
    videoBitrate: '4500k',
    crf: 23
  },
  high_quality: {
    name: 'Chất lượng cao (1080p)',
    width: 1080,
    height: 1920,
    fps: 30,
    jpegQuality: 92,
    x264Preset: 'fast',
    videoBitrate: '8000k',
    crf: 18
  }
};

export interface RenderJob {
  jobId: string;
  fileName?: string;
  status: 'pending' | 'queued' | 'processing' | 'completed' | 'failed';
  queuePosition?: number;
  renderPreset?: RenderPresetType;
  progress: number;
  stage: string;
  currentStageId: string;
  stages: StageLog[];
  logs: RenderLogEntry[];
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

export interface RenderRequestParams {
  channel: Channel;
  template: VideoTemplate;
  quiz: Quiz;
  language: LanguageCode;
  customFileName?: string;
  renderPreset?: RenderPresetType;
  customConcurrency?: number;
}

export interface BatchRenderRequestParams {
  channel: Channel;
  template: VideoTemplate;
  quiz: Quiz;
  language: LanguageCode;
  config: BatchConfig;
  customFileNames?: string[];
  renderPreset?: RenderPresetType;
  customConcurrency?: number;
}

const PIPELINE_STAGES_CONFIG: Array<{ id: string; name: string; minProgress: number; maxProgress: number }> = [
  { id: 'stage_1_prepare', name: '1. Chuẩn bị tài nguyên & Kiểm tra', minProgress: 0, maxProgress: 10 },
  { id: 'stage_2_tts', name: '2. Tạo giọng đọc TTS (Edge-TTS)', minProgress: 10, maxProgress: 25 },
  { id: 'stage_3_timeline', name: '3. Tính toán Timeline & Đóng gói', minProgress: 25, maxProgress: 35 },
  { id: 'stage_4_render_frames', name: '4. Render khung hình Video (Chromium)', minProgress: 35, maxProgress: 75 },
  { id: 'stage_5_process_audio', name: '5. Xử lý & Hòa âm Audio (TTS, SFX, BGM)', minProgress: 75, maxProgress: 88 },
  { id: 'stage_6_ffmpeg_mux', name: '6. Ghép Video & Audio (FFmpeg Muxing)', minProgress: 88, maxProgress: 98 },
  { id: 'stage_7_export', name: '7. Xuất bản & Kiểm tra MP4', minProgress: 98, maxProgress: 100 }
];

export class RenderManager {
  private jobs: Map<string, RenderJob> = new Map();
  private batchJobs: Map<string, BatchRenderJob> = new Map();
  private rendersDir: string;
  private ttsProvider: EdgeTTSProvider;
  private imageProcessor: ImageProcessor;
  private timelineEngine: TimelineEngine;
  private cachedNvencSupport?: boolean;
  private renderQueue: Array<{ jobId: string; params: RenderRequestParams }> = [];
  private activeJobId: string | null = null;

  constructor(
    rendersDir: string,
    ttsProvider: EdgeTTSProvider,
    imageProcessor: ImageProcessor
  ) {
    this.rendersDir = rendersDir;
    this.ttsProvider = ttsProvider;
    this.imageProcessor = imageProcessor;
    this.timelineEngine = new TimelineEngine(30);

    if (!fs.existsSync(this.rendersDir)) {
      fs.mkdirSync(this.rendersDir, { recursive: true });
    }

    console.log('[RENDER_INIT] Native Skia 2D Video Renderer sẵn sàng (Zero Browser / 100% Native).');
  }

  private hasNvidiaGpu(): boolean {
    try {
      if (process.platform === 'linux' && (fs.existsSync('/proc/driver/nvidia/version') || fs.existsSync('/dev/nvidia0'))) {
        return true;
      }
      execSync('nvidia-smi', { stdio: 'ignore', timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  private isNvencAvailable(): boolean {
    if (this.cachedNvencSupport !== undefined) {
      return this.cachedNvencSupport;
    }
    if (!this.hasNvidiaGpu()) {
      this.cachedNvencSupport = false;
      return false;
    }
    try {
      let ffmpegPath = '';
      if (process.platform === 'win32') {
        ffmpegPath = path.resolve(process.cwd(), 'node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe');
      } else {
        ffmpegPath = path.resolve(process.cwd(), 'node_modules/@remotion/compositor-linux-x64-gnu/ffmpeg');
        if (!fs.existsSync(ffmpegPath)) {
          ffmpegPath = 'ffmpeg';
        } else {
          try {
            fs.chmodSync(ffmpegPath, 0o755);
          } catch {}
        }
      }

      if (!fs.existsSync(ffmpegPath) && process.platform === 'win32') {
        this.cachedNvencSupport = false;
        return false;
      }

      const png1x1 = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
      const probeFile = path.join(os.tmpdir(), 'nvenc_probe_1x1.png');
      fs.writeFileSync(probeFile, png1x1);

      const env = {
        ...process.env,
        LD_LIBRARY_PATH: process.env.LD_LIBRARY_PATH || '/usr/lib64-nvidia:/usr/local/cuda/lib64'
      };
      execSync(`"${ffmpegPath}" -loop 1 -i "${probeFile}" -c:v h264_nvenc -frames:v 1 -f null -`, {
        stdio: 'pipe',
        timeout: 4000,
        env
      });
      console.log('[RENDER_INIT] Tăng tốc phần cứng GPU NVIDIA NVENC sẵn sàng (Hardware Encoding)!');
      this.cachedNvencSupport = true;
      return true;
    } catch (nvencErr: any) {
      console.log(`[RENDER_INIT] GPU không kích hoạt được NVENC (${nvencErr.message?.slice(0, 80) || 'no hardware chip'}). Sử dụng CPU libx264 tối ưu.`);
      this.cachedNvencSupport = false;
      return false;
    }
  }

  public getJob(jobId: string): RenderJob | undefined {
    return this.jobs.get(jobId);
  }

  public listJobs(): RenderJob[] {
    return Array.from(this.jobs.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  public getBatchJob(batchId: string): BatchRenderJob | undefined {
    return this.batchJobs.get(batchId);
  }

  public listBatchJobs(): BatchRenderJob[] {
    return Array.from(this.batchJobs.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  private addLog(job: RenderJob, level: 'info' | 'warn' | 'error', stage: string, message: string) {
    const entry: RenderLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      stage,
      message
    };
    job.logs.push(entry);
    job.updatedAt = entry.timestamp;
    console.log(`[RENDER:${job.jobId}][${level.toUpperCase()}][${stage}] ${message}`);
  }

  private startStage(job: RenderJob, stageId: string, message: string) {
    const now = new Date().toISOString();
    const config = PIPELINE_STAGES_CONFIG.find(s => s.id === stageId);
    job.currentStageId = stageId;
    job.stage = message;
    job.progress = config ? config.minProgress : job.progress;
    job.updatedAt = now;

    const currentStageObj = job.stages.find(s => s.id === stageId);
    if (currentStageObj) {
      currentStageObj.status = 'running';
      currentStageObj.startedAt = now;
      currentStageObj.message = message;
      currentStageObj.progress = 0;
    }

    this.addLog(job, 'info', config?.name || stageId, message);
  }

  private updateStageProgress(job: RenderJob, stageId: string, percentWithinStage: number, message?: string) {
    const config = PIPELINE_STAGES_CONFIG.find(s => s.id === stageId);
    if (!config) return;

    const clampedPercent = Math.max(0, Math.min(100, percentWithinStage));
    const overallProgress = Math.round(config.minProgress + ((config.maxProgress - config.minProgress) * clampedPercent) / 100);

    job.progress = Math.min(99, Math.max(job.progress, overallProgress));
    if (message) {
      job.stage = message;
    }
    job.updatedAt = new Date().toISOString();

    const currentStageObj = job.stages.find(s => s.id === stageId);
    if (currentStageObj) {
      currentStageObj.progress = clampedPercent;
      if (message) currentStageObj.message = message;
    }
  }

  private completeStage(job: RenderJob, stageId: string, message?: string) {
    const now = new Date().toISOString();
    const config = PIPELINE_STAGES_CONFIG.find(s => s.id === stageId);
    if (config) {
      job.progress = Math.max(job.progress, config.maxProgress);
    }
    if (message) {
      job.stage = message;
    }
    job.updatedAt = now;

    const stageObj = job.stages.find(s => s.id === stageId);
    if (stageObj) {
      stageObj.status = 'completed';
      stageObj.completedAt = now;
      stageObj.progress = 100;
      if (stageObj.startedAt) {
        stageObj.durationMs = new Date(now).getTime() - new Date(stageObj.startedAt).getTime();
      }
      if (message) stageObj.message = message;
    }

    const durationText = stageObj?.durationMs ? ` (trong ${(stageObj.durationMs / 1000).toFixed(1)}s)` : '';
    this.addLog(job, 'info', config?.name || stageId, `Hoàn thành ${config?.name || stageId}${durationText}`);
  }

  private failJob(job: RenderJob, stageId: string, error: any) {
    const now = new Date().toISOString();
    const errorMessage = error?.message || String(error);
    const config = PIPELINE_STAGES_CONFIG.find(s => s.id === stageId);

    job.status = 'failed';
    job.error = errorMessage;
    job.errorStage = config?.name || stageId;
    job.stage = `Lỗi tại ${config?.name || stageId}: ${errorMessage}`;
    job.updatedAt = now;

    const stageObj = job.stages.find(s => s.id === stageId);
    if (stageObj) {
      stageObj.status = 'failed';
      stageObj.completedAt = now;
      stageObj.error = errorMessage;
      if (stageObj.startedAt) {
        stageObj.durationMs = new Date(now).getTime() - new Date(stageObj.startedAt).getTime();
      }
    }

    this.addLog(job, 'error', config?.name || stageId, `LỖI: ${errorMessage}`);
  }

  public async startRender(params: RenderRequestParams): Promise<string> {
    const jobId = `render_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const initialStages: StageLog[] = PIPELINE_STAGES_CONFIG.map((s, idx) => ({
      id: s.id,
      name: s.name,
      order: idx + 1,
      status: 'pending',
      progress: 0
    }));

    const job: RenderJob = {
      jobId,
      status: 'processing',
      renderPreset: params.renderPreset || 'standard',
      progress: 0,
      stage: 'Đang khởi tạo tác vụ render...',
      currentStageId: 'stage_1_prepare',
      stages: initialStages,
      logs: [],
      createdAt: now,
      updatedAt: now
    };

    // FIFO Queue: If another render job is already running, enqueue this job
    if (this.activeJobId !== null) {
      job.status = 'queued';
      this.renderQueue.push({ jobId, params });
      job.queuePosition = this.renderQueue.length;
      job.stage = `Đang trong hàng đợi render (vị trí #${job.queuePosition})...`;
      this.jobs.set(jobId, job);
      this.addLog(
        job,
        'info',
        'QUEUE',
        `Hệ thống đang render tác vụ ${this.activeJobId}. Đã xếp tác vụ ${jobId} vào hàng đợi tại vị trí #${job.queuePosition}`
      );
      console.log(`[RENDER_QUEUE] Job ${jobId} xếp hàng (vị trí #${job.queuePosition}). Đang chạy: ${this.activeJobId}`);
      return jobId;
    }

    this.activeJobId = jobId;
    job.status = 'processing';
    this.jobs.set(jobId, job);
    this.addLog(job, 'info', 'INIT', `Bắt đầu phiên render video cho kênh: "${params.channel.name}" | Template: "${params.template.name}" | Preset: ${params.renderPreset || 'standard'}`);

    this.executeJobWithTimeout(jobId, params);

    return jobId;
  }

  private executeJobWithTimeout(jobId: string, params: RenderRequestParams) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    // Dynamic timeout safeguard based on question count (at least 20 minutes, ~2.5 mins per question for large videos)
    const qCount = params.quiz?.questions?.length || 3;
    const maxAllowedMinutes = Math.max(20, Math.ceil(qCount * 2.5));
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Render pipeline timeout sau ${maxAllowedMinutes} phút. Tiến trình đã bị hủy an toàn.`));
      }, maxAllowedMinutes * 60 * 1000);
    });

    Promise.race([
      this.processRenderJob(jobId, params),
      timeoutPromise
    ])
      .catch(err => {
        console.error(`Render job ${jobId} failed with unhandled error:`, err);
        this.failJob(job, job.currentStageId || 'stage_4_render_frames', err);
      })
      .finally(() => {
        this.onJobFinished(jobId);
      });
  }

  private onJobFinished(finishedJobId: string) {
    if (this.activeJobId === finishedJobId) {
      this.activeJobId = null;
    }
    this.processNextInQueue();
  }

  private processNextInQueue() {
    if (this.activeJobId !== null || this.renderQueue.length === 0) {
      return;
    }

    const next = this.renderQueue.shift()!;
    this.activeJobId = next.jobId;

    // Update queue position for remaining jobs
    this.renderQueue.forEach((item, index) => {
      const queuedJob = this.jobs.get(item.jobId);
      if (queuedJob && queuedJob.status === 'queued') {
        queuedJob.queuePosition = index + 1;
        queuedJob.stage = `Đang trong hàng đợi render (vị trí #${index + 1})...`;
        queuedJob.updatedAt = new Date().toISOString();
      }
    });

    const nextJob = this.jobs.get(next.jobId);
    if (!nextJob) {
      this.activeJobId = null;
      this.processNextInQueue();
      return;
    }

    nextJob.status = 'processing';
    nextJob.queuePosition = undefined;
    nextJob.stage = 'Đang khởi tạo tác vụ render từ hàng đợi...';
    nextJob.updatedAt = new Date().toISOString();
    this.addLog(nextJob, 'info', 'QUEUE', `Bắt đầu xử lý tác vụ từ hàng đợi (Job ID: ${next.jobId})`);
    console.log(`[RENDER_QUEUE] Bắt đầu render tác vụ hàng đợi tiếp theo: ${next.jobId}`);

    this.executeJobWithTimeout(next.jobId, next.params);
  }

  public async startBatchRender(params: BatchRenderRequestParams): Promise<string> {
    const { channel, template, quiz, language, config } = params;
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const videoSets = generateBatchQuestionSets(quiz.questions, config);
    const totalVideos = videoSets.length;

    const batchJob: BatchRenderJob = {
      batchId,
      status: 'processing',
      totalVideos,
      completedVideosCount: 0,
      currentVideoIndex: 1,
      progress: 0,
      stage: `Đang chuẩn bị render ${totalVideos} video (Batch)...`,
      config,
      completedVideos: [],
      createdAt: now,
      updatedAt: now
    };

    this.batchJobs.set(batchId, batchJob);
    console.log(`[BATCH:${batchId}] Khởi động render batch ${totalVideos} video. Mode: ${config.selectionMode}, Shuffle: ${config.shuffleAnswers}`);

    // Pre-allocate backgrounds for all videos if a background pool is provided
    const assignedBackgrounds = config.backgrounds && config.backgrounds.length > 0
      ? allocateBatchBackgrounds(config.backgrounds, totalVideos)
      : [];

    // Run batch sequentially in background
    (async () => {
      try {
        for (let i = 0; i < totalVideos; i++) {
          batchJob.currentVideoIndex = i + 1;
          const questions = videoSets[i];
          const subQuiz: Quiz = {
            ...quiz,
            id: `${quiz.id}_v${i + 1}`,
            title: quiz.title, // Giữ nguyên 100% Video Title người dùng nhập, tuyệt đối không chèn "Tập"
            questions
          };

          // Each video gets its designated background if batch backgrounds are active
          let videoTemplate = template;
          if (assignedBackgrounds[i]) {
            videoTemplate = {
              ...template,
              components: {
                ...template.components,
                background: {
                  ...template.components.background,
                  type: 'image',
                  imageUrl: assignedBackgrounds[i]
                }
              }
            };
          }

          batchJob.stage = `Đang render Video ${i + 1}/${totalVideos}...`;
          batchJob.updatedAt = new Date().toISOString();

          // Resolve filename for this video in the batch
          const designatedFileName = (params.customFileNames && params.customFileNames[i])
            ? params.customFileNames[i]
            : generateDefaultFileName(quiz.title, i + 1);

          const subJobId = await this.startRender({
            channel,
            template: videoTemplate,
            quiz: subQuiz,
            language,
            customFileName: designatedFileName,
            renderPreset: params.renderPreset,
            customConcurrency: params.customConcurrency
          });

          batchJob.currentJobId = subJobId;

          // Poll subJob until complete
          let subJobDone = false;
          while (!subJobDone) {
            await new Promise(r => setTimeout(r, 600));
            const currentSub = this.getJob(subJobId);
            if (!currentSub) break;

            // Sync telemetry to batch
            batchJob.currentFps = currentSub.currentFps;
            batchJob.renderSpeed = currentSub.renderSpeed;
            batchJob.currentFrame = currentSub.currentFrame;
            batchJob.totalFrames = currentSub.totalFrames;
            batchJob.elapsedSec = currentSub.elapsedSec;
            batchJob.etaSec = currentSub.etaSec;
            batchJob.stage = `[Video ${i + 1}/${totalVideos}] ${currentSub.stage}`;

            const baseProgress = (i / totalVideos) * 100;
            const subProgressPortion = (currentSub.progress / totalVideos);
            batchJob.progress = Math.min(99, Math.round(baseProgress + subProgressPortion));
            batchJob.updatedAt = new Date().toISOString();

            if (currentSub.status === 'completed') {
              subJobDone = true;
              batchJob.completedVideosCount += 1;
              batchJob.completedVideos.push({
                index: i + 1,
                jobId: currentSub.jobId,
                fileName: currentSub.fileName,
                outputUrl: currentSub.outputUrl,
                fileSizeBytes: currentSub.fileSizeBytes,
                durationSec: currentSub.durationSec,
                questionCount: questions.length,
                status: 'completed'
              });
            } else if (currentSub.status === 'failed') {
              subJobDone = true;
              batchJob.completedVideos.push({
                index: i + 1,
                jobId: currentSub.jobId,
                fileName: currentSub.fileName,
                questionCount: questions.length,
                status: 'failed',
                error: currentSub.error
              });
            }
          }
        }

        batchJob.status = 'completed';
        batchJob.progress = 100;
        batchJob.stage = `Đã render hoàn tất toàn bộ ${totalVideos} video!`;
        batchJob.completedAt = new Date().toISOString();
        batchJob.updatedAt = new Date().toISOString();
      } catch (err: any) {
        batchJob.status = 'failed';
        batchJob.error = err.message || String(err);
        batchJob.stage = `Lỗi trong quá trình render batch: ${err.message}`;
        batchJob.updatedAt = new Date().toISOString();
      }
    })();

    return batchId;
  }

  private async processRenderJob(jobId: string, params: RenderRequestParams): Promise<void> {
    const job = this.jobs.get(jobId)!;
    const { channel, template, quiz, language } = params;
    const langConfig = channel.languages[language] || channel.languages.vi;
    const renderJobStartTime = Date.now();

    // =========================================================================
    // STAGE 1: Chuẩn bị tài nguyên & Kiểm tra môi trường (0% -> 10%)
    // =========================================================================
    this.startStage(job, 'stage_1_prepare', 'Đang kiểm tra môi trường và tối ưu hình ảnh minh họa...');

    if (!quiz.questions || quiz.questions.length === 0) {
      throw new Error('Danh sách câu hỏi trống, không thể render video!');
    }

    this.addLog(job, 'info', 'stage_1_prepare', `Số lượng câu hỏi: ${quiz.questions.length}. Kiểm tra công cụ đồ họa Sharp...`);

    // Parallel illustration processing with Sharp
    await Promise.all(quiz.questions.map(async (q) => {
      if (q.illustrations && q.illustrations.length > 0) {
        const processedList = await Promise.all(q.illustrations.map(async (imgUrl) => {
          try {
            const pRes = await this.imageProcessor.processImage(imgUrl, {
              width: 720,
              height: 540,
              fit: template.components.illustration?.objectFit || 'cover'
            });
            return pRes.url;
          } catch (imgErr: any) {
            this.addLog(job, 'warn', 'stage_1_prepare', `Không thể tối ưu ảnh ${imgUrl}: ${imgErr.message}. Sử dụng ảnh gốc.`);
            return imgUrl;
          }
        }));
        q.illustrations = processedList;
      }
    }));

    // Pre-optimize background image to exact 720x1280 resolution to eliminate per-frame resizing overhead
    if (template.components.background?.type === 'image' && template.components.background?.imageUrl) {
      try {
        const bgRes = await this.imageProcessor.processImage(template.components.background.imageUrl, {
          width: 720,
          height: 1280,
          fit: 'cover'
        });
        if (bgRes && bgRes.url) {
          template.components.background.imageUrl = bgRes.url;
        }
      } catch (bgErr: any) {
        this.addLog(job, 'warn', 'stage_1_prepare', `Không thể tối ưu ảnh nền: ${bgErr.message}. Giữ ảnh gốc.`);
      }
    }

    this.updateStageProgress(job, 'stage_1_prepare', 100);

    this.completeStage(job, 'stage_1_prepare', 'Tài nguyên hình ảnh đã sẵn sàng.');

    // =========================================================================
    // STAGE 2: Tạo giọng đọc & Đồng bộ TTS (10% -> 25%)
    // =========================================================================
    this.startStage(job, 'stage_2_tts', `Đang tạo giọng đọc Edge-TTS cho ${quiz.questions.length} câu hỏi (${langConfig.voice})...`);

    const ttsMap: Record<string, QuestionTTSData> = {};
    let ttsCompletedCount = 0;

    // Process questions in parallel chunks of 3 (Question TTS + Explanation TTS concurrently)
    const chunkSize = 3;
    for (let chunkIdx = 0; chunkIdx < quiz.questions.length; chunkIdx += chunkSize) {
      const chunk = quiz.questions.slice(chunkIdx, chunkIdx + chunkSize);
      await Promise.all(
        chunk.map(async (q, subIdx) => {
          const i = chunkIdx + subIdx;
          const qData: QuestionTTSData = {};
          const revealPrefix = langConfig.revealScript || (language === 'vi' ? 'Đáp án chính xác là' : 'The correct answer is');
          const correctText = `${revealPrefix} ${q.correctAnswer}. ${q.explanation || ''}`.trim();

          try {
            // Concurrently generate Question & Explanation TTS for this question
            const [qRes, expRes] = await Promise.all([
              this.ttsProvider.generate({
                text: q.question,
                voice: langConfig.voice,
                rate: langConfig.rate,
                pitch: langConfig.pitch,
                volume: langConfig.volume,
                channelId: channel.id,
                lang: language
              }),
              this.ttsProvider.generate({
                text: correctText,
                voice: langConfig.voice,
                rate: langConfig.rate,
                pitch: langConfig.pitch,
                volume: langConfig.volume,
                channelId: channel.id,
                lang: language
              })
            ]);

            if (!qRes || !qRes.url || !expRes || !expRes.url) {
              throw new Error(`File TTS rỗng cho câu ${i + 1}`);
            }

            qData.questionUrl = qRes.url;
            qData.questionDuration = qRes.durationSec;
            qData.explanationUrl = expRes.url;
            qData.explanationDuration = expRes.durationSec;

            ttsMap[q.id] = qData;
            ttsCompletedCount++;
          } catch (ttsErr: any) {
            throw new Error(`Không thể tạo giọng đọc TTS cho câu hỏi #${i + 1} ("${q.question}"): ${ttsErr.message}`);
          }
        })
      );

      this.updateStageProgress(
        job,
        'stage_2_tts',
        Math.round((ttsCompletedCount / quiz.questions.length) * 100),
        `TTS: ${ttsCompletedCount}/${quiz.questions.length} câu hoàn tất`
      );
    }

    // MANDATORY ASSERTION: Every single question must have both Question TTS and Explanation TTS
    for (let i = 0; i < quiz.questions.length; i++) {
      const q = quiz.questions[i];
      const data = ttsMap[q.id];
      if (!data || !data.questionUrl || !data.explanationUrl) {
        throw new Error(`[LỖI KIỂM ĐỊNH TTS] Câu hỏi #${i + 1} (${q.id}) bị thiếu TTS. Không được phép render video thiếu âm thanh!`);
      }
    }

    this.completeStage(job, 'stage_2_tts', `Đã tạo đầy đủ giọng đọc TTS cho toàn bộ ${quiz.questions.length} câu hỏi.`);

    // =========================================================================
    // STAGE 3: Tính toán Timeline & Đóng gói Composition (25% -> 35%)
    // =========================================================================
    this.startStage(job, 'stage_3_timeline', 'Đang tính toán nhịp độ timeline và đóng gói Remotion...');

    const { totalDurationFrames, cues } = this.timelineEngine.computeTimeline(
      quiz,
      channel,
      template,
      ttsMap
    );

    // Validate Timeline
    const endBufferSec = template.timing?.endBufferSeconds ?? 2.5;
    this.timelineEngine.validateTimeline(quiz, cues, totalDurationFrames, endBufferSec);

    const durationSec = Math.round((totalDurationFrames / 30) * 10) / 10;
    job.durationSec = durationSec;

    const selectedPresetKey = params.renderPreset || 'standard';
    const presetConfig = RENDER_PRESETS[selectedPresetKey] || RENDER_PRESETS.standard;
    job.renderPreset = selectedPresetKey;

    const compositionProps: VideoCompositionProps = {
      channel,
      template,
      quiz,
      language,
      totalDurationFrames,
      cues,
      fps: presetConfig.fps || 30,
      width: presetConfig.width,
      height: presetConfig.height
    };

    this.completeStage(job, 'stage_3_timeline', 'Tính toán timeline hoàn tất.');

    // Filename resolution according to Rule: [Video Title]_[YYYY-MM-DD]_[Video Number].mp4
    let finalFileName = '';
    if (params.customFileName && params.customFileName.trim()) {
      finalFileName = sanitizeCustomFileName(params.customFileName.trim(), quiz.title);
    } else {
      finalFileName = generateDefaultFileName(quiz.title, 1);
    }

    if (!fs.existsSync(this.rendersDir)) {
      fs.mkdirSync(this.rendersDir, { recursive: true });
    }

    let outputFileName = finalFileName;
    let outputPath = path.join(this.rendersDir, outputFileName);
    if (fs.existsSync(outputPath)) {
      const ext = path.extname(finalFileName);
      const base = path.basename(finalFileName, ext);
      outputFileName = `${base}_${Date.now()}${ext}`;
      outputPath = path.join(this.rendersDir, outputFileName);
    }

    job.fileName = outputFileName;

    const tempVideoPath = path.join(this.rendersDir, `temp_video_${job.jobId}.mp4`);
    const tempAudioPath = path.join(this.rendersDir, `temp_audio_${job.jobId}.aac`);

    // =========================================================================
    // STAGE 4: Render Frames with Native Skia Engine (Zero-Browser) (35% -> 75%)
    // =========================================================================
    this.startStage(job, 'stage_4_render_frames', `Bắt đầu render ${totalDurationFrames} khung hình video (720×1280 bằng Native Skia Engine)...`);

    const hasGpu = this.hasNvidiaGpu();
    const nvencEnabled = this.isNvencAvailable();

    this.addLog(
      job,
      'info',
      'stage_4_render_frames',
      `Khởi chạy Native Skia 2D Engine (Zero-Browser): Preset=${presetConfig.name} (${presetConfig.width}x${presetConfig.height}), NVENC=${nvencEnabled ? 'BẬT (GPU)' : 'TẮT (libx264 ' + presetConfig.x264Preset + ')'}`
    );

    try {
      await NativeQuizRenderer.renderVideo({
        channel,
        template,
        quiz,
        cues,
        totalDurationFrames,
        fps: presetConfig.fps || 30,
        width: presetConfig.width,
        height: presetConfig.height,
        outputPath: tempVideoPath,
        presetConfig,
        nvencEnabled,
        onProgress: ({ renderedFrames, fps, speed, percent }) => {
          const now = Date.now();
          const elapsedSec = Math.round((now - renderJobStartTime) / 1000);
          const remainingFrames = Math.max(0, totalDurationFrames - renderedFrames);
          const etaSec = fps > 0 ? Math.ceil(remainingFrames / fps) + 3 : 0;

          job.currentFps = fps;
          job.renderSpeed = speed;
          job.currentFrame = renderedFrames;
          job.totalFrames = totalDurationFrames;
          job.elapsedSec = elapsedSec;
          job.etaSec = etaSec;

          this.updateStageProgress(
            job,
            'stage_4_render_frames',
            percent,
            `Đang render khung hình (Native Skia): ${renderedFrames}/${totalDurationFrames} (${percent}%) • ${fps} FPS (${speed}x)`
          );
        }
      });

      this.completeStage(job, 'stage_4_render_frames', `Render xong toàn bộ ${totalDurationFrames} khung hình bằng Native Skia Engine.`);

      // =======================================================================
      // STAGE 5: Process & Mix Audio (TTS, SFX) bằng FFmpeg (75% -> 88%)
      // =======================================================================
      this.startStage(job, 'stage_5_process_audio', 'Đang hòa âm các kênh Audio (TTS, SFX) bằng FFmpeg...');
      await NativeAudioMixer.mixAudio(cues, durationSec, tempAudioPath);
      this.completeStage(job, 'stage_5_process_audio', 'Hòa âm audio hoàn tất.');

      // =======================================================================
      // STAGE 6: FFmpeg Stream Copy Muxing (FastStart) (88% -> 98%)
      // =======================================================================
      this.startStage(job, 'stage_6_ffmpeg_mux', 'Đang ghép luồng Video & Audio (FFmpeg Stream Copy FastStart)...');
      await NativeAudioMixer.muxVideoAudio(tempVideoPath, tempAudioPath, outputPath);
      this.completeStage(job, 'stage_6_ffmpeg_mux', 'Ghép muxing video & audio hoàn tất.');
    } finally {
      // Dọn dẹp các file video và audio tạm
      try {
        if (fs.existsSync(tempVideoPath)) fs.unlinkSync(tempVideoPath);
        if (fs.existsSync(tempAudioPath)) fs.unlinkSync(tempAudioPath);
      } catch {}
    }

    // =========================================================================
    // STAGE 7: Xuất bản & Kiểm tra MP4 (98% -> 100%)
    // =========================================================================
    this.startStage(job, 'stage_7_export', 'Đang kiểm tra tính toàn vẹn của file MP4 xuất bản...');

    if (!fs.existsSync(outputPath)) {
      throw new Error(`File video đầu ra không tồn tại tại: ${outputPath}`);
    }

    const stat = fs.statSync(outputPath);
    if (stat.size === 0) {
      throw new Error('File video MP4 tạo ra có dung lượng 0 bytes (render rỗng)!');
    }

    job.fileSizeBytes = stat.size;
    const sizeMb = (stat.size / (1024 * 1024)).toFixed(2);
    this.addLog(job, 'info', 'stage_7_export', `File MP4 hợp lệ: ${outputFileName} (Dung lượng: ${sizeMb} MB, Thời lượng dự kiến: ~${durationSec}s)`);

    // Automated ffprobe Stream & Duration Integrity Verification
    try {
      const probeOutput = execSync(
        `ffprobe -v error -show_entries format=duration:stream=codec_type,duration,width,height -of json "${outputPath}"`,
        { encoding: 'utf-8' }
      );
      const probeData = JSON.parse(probeOutput);
      const vStream = probeData.streams?.find((s: any) => s.codec_type === 'video');
      const aStream = probeData.streams?.find((s: any) => s.codec_type === 'audio');
      const vDur = parseFloat(vStream?.duration || probeData.format?.duration || '0');
      const aDur = parseFloat(aStream?.duration || probeData.format?.duration || '0');
      const delta = Math.abs(vDur - aDur);

      this.addLog(
        job,
        'info',
        'stage_7_export',
        `[FFPROBE KIỂM TRA] Video: ${vDur.toFixed(2)}s (${vStream?.width || 720}x${vStream?.height || 1280}), Audio: ${aDur.toFixed(2)}s, Lệch: ${delta.toFixed(3)}s`
      );

      if (delta > 0.2) {
        this.addLog(job, 'warn', 'stage_7_export', `CẢNH BÁO: Âm thanh và hình ảnh chênh lệch ${delta.toFixed(3)}s (> 0.2s)!`);
      } else {
        this.addLog(job, 'info', 'stage_7_export', `XÁC NHẬN: Video và Audio khớp hoàn hảo (chênh lệch ${delta.toFixed(3)}s <= 0.1s)!`);
      }
    } catch (probeErr: any) {
      this.addLog(job, 'warn', 'stage_7_export', `Không thể chạy ffprobe kiểm tra: ${probeErr.message}`);
    }

    this.completeStage(job, 'stage_7_export', 'Kiểm tra file MP4 hoàn tất.');

    // Complete Job
    const completedNow = new Date().toISOString();
    job.status = 'completed';
    job.progress = 100;
    job.stage = 'Xuất video hoàn tất 100%! Bạn có thể xem và tải file MP4.';
    job.outputPath = outputPath;
    job.fileName = outputFileName;
    job.outputUrl = `/renders/${encodeURIComponent(outputFileName)}`;
    job.completedAt = completedNow;
    job.updatedAt = completedNow;

    this.addLog(job, 'info', 'DONE', `TOÀN BỘ TIẾN TRÌNH RENDER ĐÃ HOÀN TẤT THÀNH CÔNG (100%)! Video URL: /renders/${outputFileName}`);
  }
}
