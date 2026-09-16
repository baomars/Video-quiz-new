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
}

export interface TTSRequest {
  text: string;
  voice: string;
  rate?: string;
  pitch?: string;
  volume?: string;
  channelId?: string;
  lang?: string;
}

export interface TTSResult {
  cacheKey: string;
  filePath: string;
  url: string;
  durationSec: number;
  fromCache: boolean;
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
            // If edge-tts isn't directly in path, try python -m edge_tts
            await execFileAsync('python', ['-m', 'edge_tts', ...args], { timeout: 25000 });
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
    const popularVoices: TTSVoice[] = [
      { id: 'vi-VN-HoaiMyNeural', name: 'Hoài My (Nữ - Truyền cảm, Tự nhiên)', gender: 'Female', locale: 'vi-VN', suggestedRole: 'Giọng đọc đố vui thân thiện' },
      { id: 'vi-VN-NamMinhNeural', name: 'Nam Minh (Nam - Trầm ấm, Rõ ràng)', gender: 'Male', locale: 'vi-VN', suggestedRole: 'Giọng đọc nam công nghệ, phóng sự' },
      { id: 'en-US-JennyNeural', name: 'Jenny (Female - Friendly, Natural)', gender: 'Female', locale: 'en-US', suggestedRole: 'Trivia host' },
      { id: 'en-US-GuyNeural', name: 'Guy (Male - Confident, Engaging)', gender: 'Male', locale: 'en-US', suggestedRole: 'Tech / Game show host' },
      { id: 'en-US-AriaNeural', name: 'Aria (Female - Clear, Expressive)', gender: 'Female', locale: 'en-US', suggestedRole: 'Documentary style' },
      { id: 'en-US-ChristopherNeural', name: 'Christopher (Male - Authoritative)', gender: 'Male', locale: 'en-US', suggestedRole: 'Deep documentary' },
      { id: 'en-GB-SoniaNeural', name: 'Sonia (Female - British, Elegant)', gender: 'Female', locale: 'en-GB', suggestedRole: 'Classic British trivia' }
    ];

    if (!lang) return popularVoices;

    if (lang === 'vi') {
      return popularVoices.filter(v => v.locale.startsWith('vi'));
    }
    if (lang === 'en') {
      return popularVoices.filter(v => v.locale.startsWith('en'));
    }

    return popularVoices;
  }
}
