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
  private commandQueue: Array<{
    cmd: Record<string, any>;
    timeoutMs: number;
    resolve: (val: any) => void;
    reject: (err: any) => void;
  }> = [];
  private activeCommand: {
    resolve: (val: any) => void;
    reject: (err: any) => void;
    cmd: string;
    timer: NodeJS.Timeout;
  } | null = null;
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

  public getProjectVoiceCloneFolderName(): string {
    const rawName = process.env.PROJECT_NAME || path.basename(process.cwd());
    const cleanName = rawName.trim().replace(/[\\/:*?"<>|]/g, '-');
    return `${cleanName} voice clone`;
  }

  public getDriveVoicesDir(): string | null {
    if (process.env.DRIVE_VOICES_DIR && fs.existsSync(process.env.DRIVE_VOICES_DIR)) {
      return process.env.DRIVE_VOICES_DIR;
    }

    const folderName = this.getProjectVoiceCloneFolderName();

    // 1. Standard Google Colab mount location: /content/drive/MyDrive/<projectName> voice clone
    const colabMyDrive = '/content/drive/MyDrive';
    if (fs.existsSync(colabMyDrive)) {
      const targetDir = path.join(colabMyDrive, folderName);
      if (!fs.existsSync(targetDir)) {
        try {
          fs.mkdirSync(targetDir, { recursive: true });
        } catch (e) {
          console.warn('[VieNeuProvider] Không thể tự động tạo thư mục trên Google Drive:', e);
        }
      }
      return targetDir;
    }

    // 2. Check variant locations if Drive is mounted in different format
    const candidatePaths = [
      `/content/drive/MyDrive/${folderName}`,
      `/content/drive/MyDrive/${folderName.replace(/\s+/g, '_')}`,
      `/content/drive/MyDrive/Video-quiz-new voice clone`,
      `/content/drive/MyDrive/Video quiz new voice clone`
    ];
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) return p;
    }

    return null;
  }

  private loadClonedVoices() {
    try {
      const driveDir = this.getDriveVoicesDir();
      const localSamples = path.join(path.dirname(this.clonedVoicesPath), 'samples');
      if (!fs.existsSync(localSamples)) {
        fs.mkdirSync(localSamples, { recursive: true });
      }

      // If local cloned_voices.json doesn't exist but Drive has it, auto-restore from Drive
      if (driveDir && fs.existsSync(path.join(driveDir, 'cloned_voices.json'))) {
        const driveMetaPath = path.join(driveDir, 'cloned_voices.json');
        const shouldRestore = !fs.existsSync(this.clonedVoicesPath) || fs.statSync(this.clonedVoicesPath).size < 10;
        if (shouldRestore) {
          fs.copyFileSync(driveMetaPath, this.clonedVoicesPath);
          const driveSamples = path.join(driveDir, 'samples');
          if (fs.existsSync(driveSamples)) {
            let sampleCount = 0;
            for (const f of fs.readdirSync(driveSamples)) {
              const src = path.join(driveSamples, f);
              const dst = path.join(localSamples, f);
              if (!fs.existsSync(dst)) {
                fs.copyFileSync(src, dst);
                sampleCount++;
              }
            }
            console.log(`[VieNeuProvider] Đã tự động phục hồi ${sampleCount} file âm thanh giọng clone từ Google Drive: "${path.basename(driveDir)}"!`);
          }
        }
      }

      if (fs.existsSync(this.clonedVoicesPath)) {
        const raw = fs.readFileSync(this.clonedVoicesPath, 'utf-8');
        const list: ClonedVoiceRecord[] = JSON.parse(raw);
        if (Array.isArray(list)) {
          list.forEach(v => {
            const expectedSample = path.join(localSamples, `${v.id}.wav`);
            const finalRecord: ClonedVoiceRecord = {
              ...v,
              samplePath: fs.existsSync(expectedSample) ? expectedSample : v.samplePath,
              sampleUrl: `/uploads/voices/${v.id}.wav`
            };
            this.clonedVoices.set(v.id, finalRecord);
          });
        }
      }
    } catch (err) {
      console.warn('[VieNeuProvider] Không thể đọc danh sách cloned voices:', err);
    }
  }

  private saveClonedVoices() {
    try {
      const list = Array.from(this.clonedVoices.values());
      const content = JSON.stringify(list, null, 2);
      fs.writeFileSync(this.clonedVoicesPath, content, 'utf-8');

      // Auto-persist to Google Drive if connected
      const driveDir = this.getDriveVoicesDir();
      if (driveDir) {
        fs.writeFileSync(path.join(driveDir, 'cloned_voices.json'), content, 'utf-8');
        console.log(`[VieNeuProvider] Đã tự động lưu danh sách giọng clone lên Google Drive: "${path.basename(driveDir)}"`);
      }
    } catch (err) {
      console.error('[VieNeuProvider] Không thể lưu danh sách cloned voices:', err);
    }
  }

  public syncFromDrive(): { success: boolean; count: number; folder: string; message: string } {
    const driveDir = this.getDriveVoicesDir();
    if (!driveDir) {
      return {
        success: false,
        count: 0,
        folder: '',
        message: 'Google Drive chưa được kết nối (chỉ hoạt động khi chạy trên Google Colab đã mount Drive).'
      };
    }

    const driveMeta = path.join(driveDir, 'cloned_voices.json');
    const driveSamples = path.join(driveDir, 'samples');
    const localSamples = path.join(path.dirname(this.clonedVoicesPath), 'samples');
    fs.mkdirSync(localSamples, { recursive: true });

    let restoredCount = 0;

    if (fs.existsSync(driveMeta)) {
      try {
        const raw = fs.readFileSync(driveMeta, 'utf-8');
        const list: ClonedVoiceRecord[] = JSON.parse(raw);
        if (Array.isArray(list)) {
          // Copy all samples from Drive to local
          if (fs.existsSync(driveSamples)) {
            for (const f of fs.readdirSync(driveSamples)) {
              const src = path.join(driveSamples, f);
              const dst = path.join(localSamples, f);
              if (fs.existsSync(src) && (!fs.existsSync(dst) || fs.statSync(dst).size === 0)) {
                fs.copyFileSync(src, dst);
              }
            }
          }

          // Register in memory & Python bridge
          for (const item of list) {
            const expectedLocalPath = path.join(localSamples, `${item.id}.wav`);
            const finalRecord: ClonedVoiceRecord = {
              ...item,
              samplePath: fs.existsSync(expectedLocalPath) ? expectedLocalPath : item.samplePath,
              sampleUrl: `/uploads/voices/${item.id}.wav`
            };
            this.clonedVoices.set(item.id, finalRecord);
            restoredCount++;

            this.sendCommand({
              cmd: 'clone',
              voice_name: item.id,
              ref_audio_path: finalRecord.samplePath
            }, 10000).catch(() => {});
          }

          fs.writeFileSync(this.clonedVoicesPath, JSON.stringify(Array.from(this.clonedVoices.values()), null, 2), 'utf-8');
        }
      } catch (e: any) {
        return {
          success: false,
          count: restoredCount,
          folder: driveDir,
          message: `Lỗi đọc dữ liệu Google Drive: ${e.message}`
        };
      }
    }

    return {
      success: true,
      count: restoredCount,
      folder: driveDir,
      message: `Đã khôi phục thành công ${restoredCount} giọng clone từ Google Drive: "${path.basename(driveDir)}"!`
    };
  }

  public syncToDrive(): { success: boolean; count: number; folder: string; message: string } {
    const driveDir = this.getDriveVoicesDir();
    if (!driveDir) {
      return {
        success: false,
        count: 0,
        folder: '',
        message: 'Google Drive chưa được kết nối (chỉ hoạt động khi chạy trên Google Colab đã mount Drive).'
      };
    }

    try {
      const driveSamples = path.join(driveDir, 'samples');
      fs.mkdirSync(driveSamples, { recursive: true });

      const list = Array.from(this.clonedVoices.values());
      const driveMeta = path.join(driveDir, 'cloned_voices.json');
      fs.writeFileSync(driveMeta, JSON.stringify(list, null, 2), 'utf-8');

      let copiedSamples = 0;
      for (const voice of list) {
        if (voice.samplePath && fs.existsSync(voice.samplePath)) {
          const dst = path.join(driveSamples, `${voice.id}.wav`);
          fs.copyFileSync(voice.samplePath, dst);
          copiedSamples++;
        }
      }

      return {
        success: true,
        count: list.length,
        folder: driveDir,
        message: `Đã sao lưu an toàn ${list.length} giọng clone và ${copiedSamples} file mẫu vào Google Drive: "${path.basename(driveDir)}"!`
      };
    } catch (e: any) {
      return {
        success: false,
        count: 0,
        folder: driveDir,
        message: `Lỗi sao lưu lên Drive: ${e.message}`
      };
    }
  }

  public getDriveStatus(): {
    connected: boolean;
    folderName: string;
    folderPath: string | null;
    driveVoiceCount: number;
    localVoiceCount: number;
  } {
    const driveDir = this.getDriveVoicesDir();
    const folderName = this.getProjectVoiceCloneFolderName();
    if (!driveDir) {
      return {
        connected: false,
        folderName,
        folderPath: null,
        driveVoiceCount: 0,
        localVoiceCount: this.clonedVoices.size
      };
    }

    let driveCount = 0;
    const driveMeta = path.join(driveDir, 'cloned_voices.json');
    if (fs.existsSync(driveMeta)) {
      try {
        const list = JSON.parse(fs.readFileSync(driveMeta, 'utf-8'));
        if (Array.isArray(list)) driveCount = list.length;
      } catch {}
    }

    return {
      connected: true,
      folderName: path.basename(driveDir),
      folderPath: driveDir,
      driveVoiceCount: driveCount,
      localVoiceCount: this.clonedVoices.size
    };
  }

  public reloadClonedVoices() {
    this.clonedVoices.clear();
    this.loadClonedVoices();
    console.log(`[VieNeuProvider] Đã nạp lại ${this.clonedVoices.size} giọng clone từ đĩa.`);
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

      if (this.activeCommand) {
        clearTimeout(this.activeCommand.timer);
        this.activeCommand.reject(new Error(`Python bridge process exited unexpectedly (code: ${code})`));
        this.activeCommand = null;
      }
      while (this.commandQueue.length > 0) {
        const item = this.commandQueue.shift();
        item?.reject(new Error(`Python bridge process exited unexpectedly (code: ${code})`));
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
          this.processNextCommand();
          continue;
        }

        // Response belongs to currently active serialized command
        if (this.activeCommand) {
          const req = this.activeCommand;
          clearTimeout(req.timer);
          this.activeCommand = null;

          if (msg.success) {
            req.resolve(msg);
          } else {
            req.reject(new Error(msg.error || 'Python bridge returned error'));
          }

          // Trigger next command in queue
          this.processNextCommand();
        }
      } catch (err) {
        console.error('[VieNeuProvider] Không thể parse stdout JSON:', trimmed, err);
      }
    }
  }

  private sendCommand(cmd: Record<string, any>, timeoutMs: number = 90000): Promise<any> {
    return new Promise((resolve, reject) => {
      this.commandQueue.push({ cmd, timeoutMs, resolve, reject });
      this.processNextCommand();
    });
  }

  private processNextCommand() {
    if (this.activeCommand !== null) {
      return; // Another command is currently executing in Python, wait for completion
    }
    if (this.commandQueue.length === 0) {
      return; // Nothing pending
    }
    if (!this.pythonProcess || !this.pythonProcess.stdin?.writable) {
      if (!this.isReady) {
        // Bridge might still be initializing, retry in 300ms
        setTimeout(() => this.processNextCommand(), 300);
        return;
      }
      const item = this.commandQueue.shift();
      item?.reject(new Error('Python bridge process is not running or stdin not writable'));
      return;
    }

    const next = this.commandQueue.shift()!;
    const timer = setTimeout(() => {
      if (this.activeCommand) {
        const timedOut = this.activeCommand;
        this.activeCommand = null;
        timedOut.reject(new Error(`Timeout (${next.timeoutMs}ms) chờ phản hồi từ VieNeu Python bridge [${next.cmd.cmd}]`));
        this.processNextCommand();
      }
    }, next.timeoutMs);

    this.activeCommand = {
      resolve: next.resolve,
      reject: next.reject,
      cmd: next.cmd.cmd,
      timer
    };

    const payload = JSON.stringify(next.cmd) + '\n';
    this.pythonProcess.stdin.write(payload);
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
        { id: 'Trúc Ly', name: 'Trúc Ly (Nữ - Miền Nam) ⭐', gender: 'Female', locale: 'vi-VN', region: 'Nam', style: 'Dịu dàng, truyền cảm, siêu tự nhiên (Khuyên dùng VieNeu v3)', suggestedRole: 'Host chính đố vui, giải thích' },
        { id: 'Thiện Minh', name: 'Thiện Minh (Nam - Miền Bắc) ⭐', gender: 'Male', locale: 'vi-VN', region: 'Bắc', style: 'Đĩnh đạc, chuẩn phát thanh viên, sắc nét (Khuyên dùng VieNeu v3)', suggestedRole: 'Host đố vui kiến thức chuẩn, tài liệu' },
        { id: 'Hải Đăng', name: 'Hải Đăng (Nam - Miền Bắc)', gender: 'Male', locale: 'vi-VN', region: 'Bắc', style: 'Chững chạc, truyền cảm, tin cậy', suggestedRole: 'Host đố vui kiến thức, phóng sự' },
        { id: 'Xuân Vĩnh', name: 'Xuân Vĩnh (Nam - Miền Nam)', gender: 'Male', locale: 'vi-VN', region: 'Nam', style: 'Trầm ấm, gần gũi, sôi nổi', suggestedRole: 'Game show, TikTok Shorts, hài hước' },
        { id: 'Mai Chi', name: 'Mai Chi (Nữ - Miền Bắc)', gender: 'Female', locale: 'vi-VN', region: 'Bắc', style: 'Dịu dàng, trong trẻo, tự nhiên', suggestedRole: 'Kể chuyện, quiz tổng hợp, đời sống' },
        { id: 'Thảo Nhi', name: 'Thảo Nhi (Nữ - Miền Nam)', gender: 'Female', locale: 'vi-VN', region: 'Nam', style: 'Tươi vui, năng động, thanh thoát', suggestedRole: 'Gen Z quiz, tin nhanh, giải trí' },
        { id: 'Bảo Ngọc', name: 'Bảo Ngọc (Nữ - Miền Trung)', gender: 'Female', locale: 'vi-VN', region: 'Trung', style: 'Mộc mạc, rõ ràng, sâu lắng', suggestedRole: 'Văn hóa, lịch sử, văn học' },
        { id: 'Minh Quân', name: 'Minh Quân (Nam - Miền Trung)', gender: 'Male', locale: 'vi-VN', region: 'Trung', style: 'Hào sảng, đĩnh đạc, rõ chữ', suggestedRole: 'Phim tài liệu, khoa học viễn tưởng' },
        { id: 'Quỳnh Như', name: 'Quỳnh Như (Nữ - Miền Nam)', gender: 'Female', locale: 'vi-VN', region: 'Nam', style: 'Ngọt ngào, MC truyền hình, cuốn hút', suggestedRole: 'Chương trình đố vui giải trí, điện ảnh' },
        { id: 'Tuấn Kiệt', name: 'Tuấn Kiệt (Nam - Miền Nam)', gender: 'Male', locale: 'vi-VN', region: 'Nam', style: 'Trầm ấm, kể chuyện lôi cuốn, review phim', suggestedRole: 'Đố vui trinh thám, review phim' },
        { id: 'Hoàng Nam', name: 'Hoàng Nam (Nam - Miền Bắc)', gender: 'Male', locale: 'vi-VN', region: 'Bắc', style: 'Trầm hùng, trang trọng, thời sự', suggestedRole: 'Bản tin thời sự, lịch sử' },
        { id: 'Phương Linh', name: 'Phương Linh (Nữ - Miền Bắc)', gender: 'Female', locale: 'vi-VN', region: 'Bắc', style: 'Êm dịu, nhẹ nhàng, phong cách podcast', suggestedRole: 'Đố vui thư giãn, chữa lành' },
        { id: 'Ánh Dương', name: 'Ánh Dương (Nữ - Miền Bắc)', gender: 'Female', locale: 'vi-VN', region: 'Bắc', style: 'Trẻ trung, hiện đại, bắt tai', suggestedRole: 'Đố vui công nghệ, mẹo vặt' },
        { id: 'Duy Khang', name: 'Duy Khang (Nam - Miền Nam)', gender: 'Male', locale: 'vi-VN', region: 'Nam', style: 'Kịch tính, mạnh mẽ, dồn dập', suggestedRole: 'Đố vui tốc độ, thể thao' },
        { id: 'Hương Giang', name: 'Hương Giang (Nữ - Miền Trung)', gender: 'Female', locale: 'vi-VN', region: 'Trung', style: 'Đằm thắm, ngọt ngào, chất giọng Huế', suggestedRole: 'Thơ ca, ẩm thực miền Trung' },
        { id: 'Hùng Dũng', name: 'Hùng Dũng (Nam - Miền Bắc)', gender: 'Male', locale: 'vi-VN', region: 'Bắc', style: 'Trầm dày, nam tính, giọng phim rạp', suggestedRole: 'Trailer câu hỏi kịch tính' },
        { id: 'Thanh Thảo', name: 'Thanh Thảo (Nữ - Miền Nam)', gender: 'Female', locale: 'vi-VN', region: 'Nam', style: 'Năng động, tươi sáng, quảng cáo', suggestedRole: 'Đố vui thương hiệu, mẹo mua sắm' },
        { id: 'Gia Huy', name: 'Gia Huy (Nam - Miền Bắc)', gender: 'Male', locale: 'vi-VN', region: 'Bắc', style: 'Vui tươi, hóm hỉnh, Gen Z', suggestedRole: 'Đố vui hài hước, đố mẹo' },
        { id: 'Ngọc Bích', name: 'Ngọc Bích (Nữ - Miền Bắc)', gender: 'Female', locale: 'vi-VN', region: 'Bắc', style: 'Chuẩn mực, giọng đọc sách, tinh tế', suggestedRole: 'Đố vui từ vựng, sách tinh hoa' },
        { id: 'Khánh An', name: 'Khánh An (Nữ - Miền Nam)', gender: 'Female', locale: 'vi-VN', region: 'Nam', style: 'Mộc mạc, gần gũi, đời thường', suggestedRole: 'Đố vui phong tục, chuyện làng quê' },
        { id: 'Việt Anh', name: 'Việt Anh (Nam - Miền Bắc)', gender: 'Male', locale: 'vi-VN', region: 'Bắc', style: 'Tưng bừng, phong thái MC gameshow', suggestedRole: 'Gameshow đố vui có thưởng' },
        { id: 'Thu Hà', name: 'Thu Hà (Nữ - Miền Bắc)', gender: 'Female', locale: 'vi-VN', region: 'Bắc', style: 'Rành mạch, khoa học, thuyết minh', suggestedRole: 'Thế giới động vật, khoa học tự nhiên' },
        { id: 'Adam bựa', name: 'Adam bựa (Nam - Hài hước / Meme)', gender: 'Male', locale: 'vi-VN', region: 'Bắc', style: 'Hài hước, châm biếm, viral Shorts', suggestedRole: 'Đố troll, câu đố khó đỡ' },
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
