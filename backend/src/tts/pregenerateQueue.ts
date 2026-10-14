import { Channel, Quiz, VideoTemplate, LanguageCode } from '../../../remotion/types/index.js';
import { VieNeuProvider } from './vieneuProvider.js';

export interface TTSQueueItem {
  id: string;
  type: 'question' | 'answer' | 'explanation';
  questionId: string;
  text: string;
  voice: string;
  rate?: string;
  status: 'pending' | 'processing' | 'ready' | 'failed';
  url?: string;
  durationSec?: number;
  fromCache?: boolean;
  error?: string;
}

export interface TTSPregenerateJob {
  jobId: string;
  status: 'pending' | 'generating' | 'ready' | 'failed';
  totalItems: number;
  completedItems: number;
  failedItems: number;
  percent: number;
  currentText?: string;
  items: TTSQueueItem[];
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export class TTSPregenerateQueue {
  private provider: VieNeuProvider;
  private jobs: Map<string, TTSPregenerateJob> = new Map();

  constructor(provider: VieNeuProvider) {
    this.provider = provider;
  }

  public getJob(jobId: string): TTSPregenerateJob | undefined {
    return this.jobs.get(jobId);
  }

  public async startPregeneration(params: {
    quiz: Quiz;
    channel: Channel;
    template: VideoTemplate;
    language?: LanguageCode;
  }): Promise<string> {
    const { quiz, channel, template } = params;
    const language = params.language || quiz.language || 'vi';
    const langConfig = channel.languages?.[language] || channel.languages?.vi || { voice: 'Hải Đăng' };

    const jobId = `ttsq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const questions = quiz.questions || [];

    const answerTtsEnabled = (template.components.answerButtons as any)?.readTts !== false &&
      (langConfig?.readAnswer !== false);
    const explanationTtsEnabled = template.components.explanation?.readTts !== false;
    const revealPrefix = langConfig.revealScript || (language === 'vi' ? 'Đáp án chính xác là' : 'The correct answer is');

    const items: TTSQueueItem[] = [];

    questions.forEach((q, idx) => {
      // 1. Question voiceover
      if (q.question && q.question.trim()) {
        items.push({
          id: `${q.id}_question`,
          type: 'question',
          questionId: q.id,
          text: q.question.trim(),
          voice: langConfig.voice,
          rate: langConfig.rate,
          status: 'pending'
        });
      }

      // 2. Answer reveal voiceover
      if (answerTtsEnabled && q.correctAnswer) {
        const answerOption = (q.options && q.options[q.correctAnswer])
          ? `${q.correctAnswer}. ${q.options[q.correctAnswer]}`
          : q.correctAnswer;
        const answerText = `${revealPrefix} ${answerOption}`.trim();
        items.push({
          id: `${q.id}_answer`,
          type: 'answer',
          questionId: q.id,
          text: answerText,
          voice: langConfig.voice,
          rate: langConfig.rate,
          status: 'pending'
        });
      }

      // 3. Explanation voiceover
      if (explanationTtsEnabled && q.explanation && q.explanation.trim()) {
        items.push({
          id: `${q.id}_explanation`,
          type: 'explanation',
          questionId: q.id,
          text: q.explanation.trim(),
          voice: langConfig.voice,
          rate: langConfig.rate,
          status: 'pending'
        });
      }
    });

    const job: TTSPregenerateJob = {
      jobId,
      status: 'generating',
      totalItems: items.length,
      completedItems: 0,
      failedItems: 0,
      percent: 0,
      items,
      createdAt: new Date().toISOString()
    };

    this.jobs.set(jobId, job);

    // Run queue in background
    (async () => {
      console.log(`[TTS_QUEUE:${jobId}] Bắt đầu tiền xử lý TTS cho ${items.length} đoạn âm thanh...`);
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        item.status = 'processing';
        job.currentText = item.text.substring(0, 40) + '...';

        try {
          const res = await this.provider.generate({
            text: item.text,
            voice: item.voice,
            rate: item.rate,
            lang: language
          });

          item.status = 'ready';
          item.url = res.url;
          item.durationSec = res.durationSec;
          item.fromCache = res.fromCache;
          job.completedItems++;
        } catch (err: any) {
          console.error(`[TTS_QUEUE:${jobId}] Lỗi tạo TTS [${item.id}]:`, err.message);
          item.status = 'failed';
          item.error = err.message;
          job.failedItems++;
        }

        job.percent = Math.round(((i + 1) / items.length) * 100);
      }

      job.status = job.failedItems > 0 && job.completedItems === 0 ? 'failed' : 'ready';
      job.completedAt = new Date().toISOString();
      job.currentText = undefined;
      console.log(`[TTS_QUEUE:${jobId}] Tiền xử lý TTS hoàn tất! Thành công: ${job.completedItems}/${job.totalItems}`);
    })().catch(err => {
      console.error(`[TTS_QUEUE:${jobId}] Unhandled queue error:`, err);
      job.status = 'failed';
      job.error = err.message;
    });

    return jobId;
  }
}
