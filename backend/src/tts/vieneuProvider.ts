import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn, ChildProcess } from 'child_process';
import { ITTSProvider, TTSRequest, TTSResult, TTSVoice } from './ttsProvider.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ClonedVoiceRecord {
  id: string;
  name: string;
  gender: 'Female' | 'Male';
  locale: string;
  region?: string;
  style?: string;
  suggestedRole?: string;
  samplePath: string;
  sampleUrl: string;
  durationSec: number;
  createdAt: string;
}

export class VieNeuProvider implements ITTSProvider {
  private cacheDir: string;
  private pythonProcess: ChildProcess | null = null;
  private isReady: boolean = false;
  private isVieNeuNative: boolean = false;
  private pendingRequests: Array<{
    resolve: (val: any) => void;
    reject: (err: any) => void;
    cmd: string;
  }> = [];
  private lineBuffer: string = '';
  private clonedVoices: Map<string, ClonedVoiceRecord> = new Map();
  private clonedVoicesPath: string;

  constructor(cacheDir: string, dataVoicesDir?: string) {
    this.cacheDir = cacheDir;
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }

    const voicesDir = dataVoicesDir || path.resolve(process.cwd(), 'data', 'voices');
    if (!fs.existsSync(voicesDir)) {
      fs.mkdirSync(voicesDir, { recursive: true });
    }
    this.clonedVoicesPath = path.join(voicesDir, 'cloned_voices.json');
    this.loadClonedVoices();

    this.startPythonService();
  }

  private loadClonedVoices() {
    try {
      if (fs.existsSync(this.clonedVoicesPath)) {
        const raw = fs.readFileSync(this.clonedVoicesPath, 'utf-8');
        const list: ClonedVoiceRecord[] = JSON.parse(raw);
        if (Array.isArray(list)) {
          list.forEach(v => this.clonedVoices.set(v.id, v));
        }
      }
    } catch (err) {
      console.warn('[VieNeuProvider] Không thể đọc danh sách cloned voices:', err);
    }
  }

  private saveClonedVoices() {
    try {
      const list = Array.from(this.clonedVoices.values());
      fs.writeFileSync(this.clonedVoicesPath, JSON.stringify(list, null, 2), 'utf-8');
    } catch (err) {
      console.error('[VieNeuProvider] Không thể lưu danh sách cloned voices:', err);
    }
  }

  private startPythonService() {
    let serviceScript = path.resolve(__dirname, 'vieneu_service.py');
    if (!fs.existsSync(serviceScript)) {
      const fallbackScript = path.resolve(process.cwd(), 'backend', 'src', 'tts', 'vieneu_service.py');
      if (fs.existsSync(fallbackScript)) {
        serviceScript = fallbackScript;
      }
    }
    console.log(`[VieNeuProvider] Khởi chạy tiến trình Python bridge: ${serviceScript}`);

    // Try python or python3
    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    this.pythonProcess = spawn(pythonCmd, ['-u', serviceScript], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    this.pythonProcess.stdout?.on('data', (data: Buffer) => {
      this.handleStdout(data.toString('utf-8'));
    });

    this.pythonProcess.stderr?.on('data', (data: Buffer) => {
      const msg = data.toString('utf-8').trim();
      if (msg) {
        console.log(`[VieNeu Bridge PyStderr] ${msg}`);
      }
    });

    this.pythonProcess.on('exit', (code, signal) => {
      console.warn(`[VieNeuProvider] Tiến trình Python bridge đã thoát (code: ${code}, signal: ${signal})`);
      this.isReady = false;
      this.pythonProcess = null;
      // Reject any pending requests
      while (this.pendingRequests.length > 0) {
        const req = this.pendingRequests.shift();
        req?.reject(new Error(`Python bridge process exited unexpectedly (code: ${code})`));
      }
      // Auto-restart after 2 seconds
      setTimeout(() => {
        if (!this.pythonProcess) {
          console.log('[VieNeuProvider] Đang khởi động lại Python bridge...');
          this.startPythonService();
        }
      }, 2000);
    });

    this.pythonProcess.on('error', (err) => {
      console.error('[VieNeuProvider] Lỗi khởi động Python bridge:', err.message);
    });
  }

  private handleStdout(chunk: string) {
    this.lineBuffer += chunk;
    const lines = this.lineBuffer.split('\n');
    this.lineBuffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const msg = JSON.parse(trimmed);
        if (msg.event === 'ready') {
          this.isReady = true;
          this.isVieNeuNative = !!msg.vieneu_ready;
          console.log(`[VieNeuProvider] Bridge đã sẵn sàng! Chế độ: ${this.isVieNeuNative ? 'VieNeu Native (Colab)' : 'Local Fallback'}`);
          continue;
        }

        // Process response for next waiting request in FIFO
        if (this.pendingRequests.length > 0) {
          const req = this.pendingRequests.shift()!;
          if (msg.success) {
            req.resolve(msg);
          } else {
            req.reject(new Error(msg.error || 'Python bridge returned error'));
          }
        }
      } catch (err) {
        console.error('[VieNeuProvider] Không thể parse stdout JSON:', trimmed, err);
      }
    }
  }

  private sendCommand(cmd: Record<string, any>, timeoutMs: number = 60000): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.pythonProcess || !this.pythonProcess.stdin?.writable) {
        return reject(new Error('Python bridge process is not running or stdin not writable'));
      }

      const timer = setTimeout(() => {
        const idx = this.pendingRequests.findIndex(r => r.resolve === resolve);
        if (idx !== -1) {
          this.pendingRequests.splice(idx, 1);
          reject(new Error(`Timeout (${timeoutMs}ms) chờ phản hồi từ VieNeu Python bridge`));
        }
      }, timeoutMs);

      this.pendingRequests.push({
        resolve: (val) => {
          clearTimeout(timer);
          resolve(val);
        },
        reject: (err) => {
          clearTimeout(timer);
          reject(err);
        },
        cmd: cmd.cmd
      });

      const payload = JSON.stringify(cmd) + '\n';
      this.pythonProcess.stdin.write(payload);
    });
  }

  public computeHash(req: TTSRequest): string {
    const text = req.text.trim();
    const voice = req.voice || 'Hải Đăng';
    const rate = req.rate || '+0%';
    const speed = req.speed || 1.0;
    const ref = req.ref_audio || '';
    const raw = `vieneu|${voice}|${rate}|${speed}|${ref}|${text}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  public getCached(req: TTSRequest): TTSResult | null {
    const text = req.text?.trim();
    if (!text) return null;
    const hash = this.computeHash(req);
    const audioExt = '.wav'; // VieNeu generates high-fidelity wav
    const audioPath = path.join(this.cacheDir, `${hash}${audioExt}`);
    const mp3Path = path.join(this.cacheDir, `${hash}.mp3`);
    const jsonPath = path.join(this.cacheDir, `${hash}.json`);

    const targetAudio = fs.existsSync(audioPath) ? audioPath : (fs.existsSync(mp3Path) ? mp3Path : null);

    if (targetAudio && fs.existsSync(jsonPath)) {
      try {
        const stats = fs.statSync(targetAudio);
        if (stats.size > 200) {
          const meta = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
          if (meta && typeof meta.durationSec === 'number' && meta.durationSec > 0) {
            const ext = path.extname(targetAudio);
            return {
              cacheKey: hash,
              filePath: targetAudio,
              url: `/cache/tts/${hash}${ext}`,
              durationSec: meta.durationSec,
              fromCache: true,
              engine: meta.engine || 'vieneu'
            };
          }
        }
      } catch (e) {
        // ignore invalid cache
      }
    }
    return null;
  }

  public async generate(req: TTSRequest): Promise<TTSResult> {
    const text = req.text?.trim();
    if (!text) {
      throw new Error('TTS text cannot be empty');
    }

    // 1. Check instant cache first
    const cached = this.getCached(req);
    if (cached) {
      return cached;
    }

    const hash = this.computeHash(req);
    const outAudioPath = path.join(this.cacheDir, `${hash}.wav`);
    const jsonPath = path.join(this.cacheDir, `${hash}.json`);

    let voice = req.voice || 'Hải Đăng';
    let refAudio = req.ref_audio;

    // Check if requested voice is a cloned voice
    if (this.clonedVoices.has(voice)) {
      const cloned = this.clonedVoices.get(voice)!;
      refAudio = cloned.samplePath;
    }

    // Parse speed from rate string (e.g. "+10%" -> 1.1)
    let speed = req.speed || 1.0;
    if (req.rate && req.rate.includes('%')) {
      const pct = parseInt(req.rate.replace('%', ''), 10);
      if (!isNaN(pct)) {
        speed = Math.max(0.6, Math.min(1.8, 1.0 + pct / 100));
      }
    }

    // Call Python bridge
    const resp = await this.sendCommand({
      cmd: 'generate',
      text,
      voice,
      ref_audio: refAudio,
      output_path: outAudioPath,
      speed
    }, 45000);

    const durationSec = resp.duration_sec || Math.max(1.5, text.length * 0.08);

    // Save cache metadata
    fs.writeFileSync(jsonPath, JSON.stringify({
      hash,
      voice,
      speed,
      rate: req.rate || '+0%',
      text,
      durationSec,
      engine: resp.engine || 'vieneu',
      createdAt: new Date().toISOString()
    }, null, 2), 'utf-8');

    return {
      cacheKey: hash,
      filePath: outAudioPath,
      url: `/cache/tts/${hash}.wav`,
      durationSec,
      fromCache: false,
      engine: resp.engine || 'vieneu'
    };
  }

  public async listVoices(lang?: string): Promise<TTSVoice[]> {
    let baseVoices: TTSVoice[] = [];
    try {
      const resp = await this.sendCommand({ cmd: 'list_voices' }, 5000);
      if (resp.success && Array.isArray(resp.voices)) {
        baseVoices = resp.voices;
      }
    } catch {
      // Fallback preset voices if bridge is busy
      baseVoices = [
        { id: 'Hải Đăng', name: 'Hải Đăng (Nam - Miền Bắc)', gender: 'Male', locale: 'vi-VN', region: 'Bắc', style: 'Chững chạc, truyền cảm, tin cậy', suggestedRole: 'Host đố vui kiến thức, phóng sự' },
        { id: 'Xuân Vĩnh', name: 'Xuân Vĩnh (Nam - Miền Nam)', gender: 'Male', locale: 'vi-VN', region: 'Nam', style: 'Trầm ấm, gần gũi, sôi nổi', suggestedRole: 'Game show, TikTok Shorts, hài hước' },
        { id: 'Mai Chi', name: 'Mai Chi (Nữ - Miền Bắc)', gender: 'Female', locale: 'vi-VN', region: 'Bắc', style: 'Dịu dàng, trong trẻo, tự nhiên', suggestedRole: 'Kể chuyện, quiz tổng hợp, đời sống' },
        { id: 'Thảo Nhi', name: 'Thảo Nhi (Nữ - Miền Nam)', gender: 'Female', locale: 'vi-VN', region: 'Nam', style: 'Tươi vui, năng động, thanh thoát', suggestedRole: 'Gen Z quiz, tin nhanh, giải trí' },
        { id: 'Bảo Ngọc', name: 'Bảo Ngọc (Nữ - Miền Trung)', gender: 'Female', locale: 'vi-VN', region: 'Trung', style: 'Mộc mạc, rõ ràng, sâu lắng', suggestedRole: 'Văn hóa, lịch sử, văn học' },
        { id: 'Minh Quân', name: 'Minh Quân (Nam - Miền Trung)', gender: 'Male', locale: 'vi-VN', region: 'Trung', style: 'Hào sảng, đĩnh đạc, rõ chữ', suggestedRole: 'Phim tài liệu, khoa học viễn tưởng' },
        { id: 'en-US-Jenny', name: 'Jenny (Female - English)', gender: 'Female', locale: 'en-US', region: 'US', style: 'Clear, friendly, natural', suggestedRole: 'English trivia host' },
        { id: 'en-US-Guy', name: 'Guy (Male - English)', gender: 'Male', locale: 'en-US', region: 'US', style: 'Confident, engaging', suggestedRole: 'English game show host' }
      ];
    }

    // Merge cloned voices
    const clonedList: TTSVoice[] = Array.from(this.clonedVoices.values()).map(cv => ({
      id: cv.id,
      name: `${cv.name} [Cloned Voice]`,
      gender: cv.gender,
      locale: cv.locale,
      region: cv.region || 'Custom',
      style: cv.style || 'Giọng nhân bản từ file mẫu',
      suggestedRole: cv.suggestedRole || 'Giọng AI độc quyền',
      isCloned: true,
      sampleUrl: cv.sampleUrl
    }));

    const allVoices = [...clonedList, ...baseVoices];

    if (!lang) return allVoices;
    if (lang === 'vi') return allVoices.filter(v => v.locale.startsWith('vi') || (v as any).isCloned);
    if (lang === 'en') return allVoices.filter(v => v.locale.startsWith('en'));
    return allVoices;
  }

  public registerClonedVoice(record: ClonedVoiceRecord) {
    this.clonedVoices.set(record.id, record);
    this.saveClonedVoices();
    // Notify python bridge
    this.sendCommand({
      cmd: 'clone',
      voice_name: record.id,
      ref_audio_path: record.samplePath
    }, 15000).catch(err => console.warn('[VieNeuProvider] Register clone notice:', err.message));
  }

  public deleteClonedVoice(id: string): boolean {
    if (this.clonedVoices.has(id)) {
      const record = this.clonedVoices.get(id);
      this.clonedVoices.delete(id);
      this.saveClonedVoices();
      if (record && fs.existsSync(record.samplePath)) {
        try { fs.unlinkSync(record.samplePath); } catch {}
      }
      return true;
    }
    return false;
  }

  public getClonedVoices(): ClonedVoiceRecord[] {
    return Array.from(this.clonedVoices.values());
  }

  public isVieNeuModelLoaded(): boolean {
    return this.isVieNeuNative;
  }
}
