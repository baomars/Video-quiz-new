import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export interface TTSVoice {
  id: string;
  name: string;
  gender: 'Female' | 'Male';
  locale: string;
  suggestedRole?: string;
  region?: string;
  style?: string;
  isCloned?: boolean;
  sampleUrl?: string;
  engine?: 'edge' | 'vieneu';
}

export interface TTSRequest {
  text: string;
  voice: string;
  rate?: string;
  pitch?: string;
  volume?: string;
  speed?: number;
  ref_audio?: string;
  channelId?: string;
  lang?: string;
  engine?: 'edge' | 'vieneu';
}

export const EDGE_TTS_VOICES: TTSVoice[] = [
  {
    id: 'vi-VN-HoaiMyNeural',
    name: 'Hoài My (Nữ - Miền Nam) ⭐',
    gender: 'Female',
    locale: 'vi-VN',
    region: 'Nam',
    style: 'Truyền cảm, tự nhiên, siêu mượt (Microsoft Edge-TTS)',
    suggestedRole: 'Host đố vui thân thiện, câu hỏi tổng hợp',
    engine: 'edge'
  },
  {
    id: 'vi-VN-NamMinhNeural',
    name: 'Nam Minh (Nam - Miền Bắc) ⭐',
    gender: 'Male',
    locale: 'vi-VN',
    region: 'Bắc',
    style: 'Trầm ấm, rõ ràng, dứt khoát (Microsoft Edge-TTS)',
    suggestedRole: 'Host đố vui công nghệ, thời sự, khoa học',
    engine: 'edge'
  },
  {
    id: 'en-US-JennyNeural',
    name: 'Jenny (Female - English US) ⭐',
    gender: 'Female',
    locale: 'en-US',
    region: 'US',
    style: 'Friendly, natural, conversational (Microsoft Edge-TTS)',
    suggestedRole: 'English trivia host, quiz',
    engine: 'edge'
  },
  {
    id: 'en-US-GuyNeural',
    name: 'Guy (Male - English US) ⭐',
    gender: 'Male',
    locale: 'en-US',
    region: 'US',
    style: 'Confident, casual, engaging (Microsoft Edge-TTS)',
    suggestedRole: 'Game show host, tech quiz',
    engine: 'edge'
  },
  {
    id: 'en-US-AriaNeural',
    name: 'Aria (Female - English US)',
    gender: 'Female',
    locale: 'en-US',
    region: 'US',
    style: 'Expressive, clear, versatile (Microsoft Edge-TTS)',
    suggestedRole: 'Documentary, dramatic quiz',
    engine: 'edge'
  },
  {
    id: 'en-US-ChristopherNeural',
    name: 'Christopher (Male - English US)',
    gender: 'Male',
    locale: 'en-US',
    region: 'US',
    style: 'Authoritative, deep, steady (Microsoft Edge-TTS)',
    suggestedRole: 'Deep documentary, mystery quiz',
    engine: 'edge'
  },
  {
    id: 'en-US-EricNeural',
    name: 'Eric (Male - English US)',
    gender: 'Male',
    locale: 'en-US',
    region: 'US',
    style: 'Youthful, energetic, upbeat (Microsoft Edge-TTS)',
    suggestedRole: 'Shorts viral, pop culture',
    engine: 'edge'
  },
  {
    id: 'en-US-AnaNeural',
    name: 'Ana (Female - English US Teen)',
    gender: 'Female',
    locale: 'en-US',
    region: 'US',
    style: 'Cute, cheerful, lively (Microsoft Edge-TTS)',
    suggestedRole: 'Kids quiz, playful trivia',
    engine: 'edge'
  },
  {
    id: 'en-GB-SoniaNeural',
    name: 'Sonia (Female - British English)',
    gender: 'Female',
    locale: 'en-GB',
    region: 'UK',
    style: 'British accent, elegant, warm (Microsoft Edge-TTS)',
    suggestedRole: 'Classic British trivia, literature',
    engine: 'edge'
  },
  {
    id: 'en-GB-RyanNeural',
    name: 'Ryan (Male - British English)',
    gender: 'Male',
    locale: 'en-GB',
    region: 'UK',
    style: 'British accent, crisp, sophisticated (Microsoft Edge-TTS)',
    suggestedRole: 'British game show, intellectual quiz',
    engine: 'edge'
  }
];

export function isEdgeVoiceIdentifier(voice?: string): boolean {
  if (!voice) return false;
  return (
    voice.endsWith('Neural') ||
    voice.startsWith('vi-VN-') ||
    (voice.startsWith('en-US-') && voice.endsWith('Neural')) ||
    (voice.startsWith('en-GB-') && voice.endsWith('Neural')) ||
    EDGE_TTS_VOICES.some((v) => v.id === voice)
  );
}

export interface TTSResult {
  cacheKey: string;
  filePath: string;
  url: string;
  durationSec: number;
  fromCache: boolean;
  engine?: string;
}

export interface ITTSProvider {
  generate(req: TTSRequest): Promise<TTSResult>;
  listVoices(lang?: string): Promise<TTSVoice[]>;
}

export class EdgeTTSProvider implements ITTSProvider {
  private cacheDir: string;
  private maxConcurrent: number;
  private activeCount: number = 0;
  private waitingQueue: Array<() => void> = [];

  constructor(cacheDir: string) {
    this.cacheDir = cacheDir;
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
    const cpus = os.cpus()?.length || 2;
    // Concurrency pool 2–6 depending on CPU count
    this.maxConcurrent = Math.max(2, Math.min(6, cpus * 2));
    console.log(`[TTS_INIT] Khởi tạo Edge-TTS Concurrency Pool: tối đa ${this.maxConcurrent} tiến trình song song (${cpus} CPUs)`);
  }

  private async acquireSlot(): Promise<() => void> {
    if (this.activeCount < this.maxConcurrent) {
      this.activeCount++;
      let released = false;
      return () => {
        if (!released) {
          released = true;
          this.activeCount--;
          if (this.waitingQueue.length > 0) {
            const next = this.waitingQueue.shift();
            if (next) {
              this.activeCount++;
              next();
            }
          }
        }
      };
    }

    return new Promise<() => void>((resolve) => {
      this.waitingQueue.push(() => {
        let released = false;
        resolve(() => {
          if (!released) {
            released = true;
            this.activeCount--;
            if (this.waitingQueue.length > 0) {
              const next = this.waitingQueue.shift();
              if (next) {
                this.activeCount++;
                next();
              }
            }
          }
        });
      });
    });
  }

  private computeHash(req: TTSRequest): string {
    const raw = `${req.voice}|${req.rate || '+0%'}|${req.pitch || '+0Hz'}|${req.volume || '+0%'}|${req.text.trim()}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  public getCached(req: TTSRequest): TTSResult | null {
    const text = req.text.trim();
    if (!text) return null;
    const hash = this.computeHash(req);
    const mp3Path = path.join(this.cacheDir, `${hash}.mp3`);
    const jsonPath = path.join(this.cacheDir, `${hash}.json`);

    if (fs.existsSync(mp3Path) && fs.existsSync(jsonPath)) {
      try {
        const stats = fs.statSync(mp3Path);
        if (stats.size > 200) {
          const meta = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
          if (meta && typeof meta.durationSec === 'number' && meta.durationSec > 0) {
            return {
              cacheKey: hash,
              filePath: mp3Path,
              url: `/cache/tts/${hash}.mp3`,
              durationSec: meta.durationSec,
              fromCache: true
            };
          }
        }
      } catch (e) {
        // ignore
      }
    }
    return null;
  }

  public async generate(req: TTSRequest): Promise<TTSResult> {
    const text = req.text.trim();
    if (!text) {
      throw new Error('TTS text cannot be empty');
    }

    const hash = this.computeHash(req);
    const mp3Path = path.join(this.cacheDir, `${hash}.mp3`);
    const jsonPath = path.join(this.cacheDir, `${hash}.json`);

    // 1. Check cache first (instant, bypasses pool)
    const cached = this.getCached(req);
    if (cached) {
      return cached;
    }

    // 2. Acquire slot in concurrency pool (parallel 2-6 workers)
    const release = await this.acquireSlot();
    try {
      // Re-check cache in case previous queued request created it
      const recheck = this.getCached(req);
      if (recheck) {
        return recheck;
      }

      const voice = req.voice || 'vi-VN-HoaiMyNeural';
      const rate = req.rate || '+0%';
      const pitch = req.pitch || '+0Hz';
      const volume = req.volume || '+0%';

      const args = [
        '--voice', voice,
        '--rate', rate,
        '--pitch', pitch,
        '--volume', volume,
        '--text', text,
        '--write-media', mp3Path
      ];

      let success = false;
      let lastError: any = null;

      // Try up to 3 attempts with backoff
      for (let attempt = 1; attempt <= 3; attempt++) {
        // Clean up partial/corrupted files before generating
        try {
          if (fs.existsSync(mp3Path)) fs.unlinkSync(mp3Path);
          if (fs.existsSync(jsonPath)) fs.unlinkSync(jsonPath);
        } catch {}

        try {
          try {
            await execFileAsync('edge-tts', args, { timeout: 25000 });
          } catch (err: any) {
            // Try python3 (standard on Linux/Colab)
            try {
              await execFileAsync('python3', ['-m', 'edge_tts', ...args], { timeout: 25000 });
            } catch (err2: any) {
              // Try python (standard on Windows)
              await execFileAsync('python', ['-m', 'edge_tts', ...args], { timeout: 25000 });
            }
          }

          // Verify file was written and is not empty
          if (fs.existsSync(mp3Path)) {
            const stat = fs.statSync(mp3Path);
            if (stat.size > 200) {
              success = true;
              break;
            }
          }
          throw new Error(`File audio được tạo rỗng hoặc quá nhỏ (${fs.existsSync(mp3Path) ? fs.statSync(mp3Path).size : 0} bytes)`);
        } catch (err: any) {
          lastError = err;
          if (attempt < 3) {
            // Wait before retrying (400ms, 800ms)
            await new Promise((r) => setTimeout(r, attempt * 400));
          }
        }
      }

      if (!success) {
        throw new Error(`Edge-TTS thất bại sau 3 lần thử: ${lastError?.message || 'Không nhận được dữ liệu âm thanh'}`);
      }

      // Measure duration with ffprobe
      let durationSec = 1.0;
      try {
        const probeRes = await execFileAsync('ffprobe', [
          '-v', 'error',
          '-show_entries', 'format=duration',
          '-of', 'default=noprint_wrappers=1:nokey=1',
          mp3Path
        ], { timeout: 10000 });
        const parsed = parseFloat(probeRes.stdout.trim());
        if (!isNaN(parsed) && parsed > 0) {
          durationSec = parsed;
        }
      } catch (probeErr) {
        console.warn(`Could not probe audio duration for ${mp3Path}, defaulting to fallback:`, probeErr);
        durationSec = Math.max(1.5, text.length * 0.08);
      }

      // Save cache metadata
      fs.writeFileSync(jsonPath, JSON.stringify({
        hash,
        voice,
        rate,
        pitch,
        volume,
        text,
        durationSec,
        createdAt: new Date().toISOString()
      }, null, 2), 'utf-8');

      // Pause slightly between requests to be gentle to Edge-TTS server
      await new Promise((r) => setTimeout(r, 100));

      return {
        cacheKey: hash,
        filePath: mp3Path,
        url: `/cache/tts/${hash}.mp3`,
        durationSec,
        fromCache: false
      };
    } finally {
      release();
    }
  }

  public async listVoices(lang?: string): Promise<TTSVoice[]> {
    if (!lang) return EDGE_TTS_VOICES;

    if (lang === 'vi') {
      return EDGE_TTS_VOICES.filter(v => v.locale.startsWith('vi'));
    }
    if (lang === 'en') {
      return EDGE_TTS_VOICES.filter(v => v.locale.startsWith('en'));
    }

    return EDGE_TTS_VOICES;
  }
}
