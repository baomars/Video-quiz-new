import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { VieNeuProvider, ClonedVoiceRecord } from './vieneuProvider.js';

const execFileAsync = promisify(execFile);

export interface VoiceCloneRequest {
  name: string;
  gender?: 'Female' | 'Male';
  locale?: string;
  description?: string;
  buffer: Buffer;
  originalFileName: string;
}

export class VoiceStudioService {
  private provider: VieNeuProvider;
  private samplesDir: string;

  constructor(provider: VieNeuProvider, dataVoicesDir?: string) {
    this.provider = provider;
    const baseDir = dataVoicesDir || path.resolve(process.cwd(), 'data', 'voices');
    this.samplesDir = path.join(baseDir, 'samples');
    if (!fs.existsSync(this.samplesDir)) {
      fs.mkdirSync(this.samplesDir, { recursive: true });
    }
  }

  public async measureAudioDuration(filePath: string): Promise<number> {
    try {
      const { stdout } = await execFileAsync('ffprobe', [
        '-v', 'error',
        '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1',
        filePath
      ], { timeout: 10000 });
      const dur = parseFloat(stdout.trim());
      if (!isNaN(dur) && dur > 0) return dur;
    } catch (err) {
      console.warn(`[VoiceStudio] ffprobe error on ${filePath}:`, err);
    }
    return 5.0; // fallback default
  }

  public async cloneVoice(req: VoiceCloneRequest): Promise<ClonedVoiceRecord> {
    const rawName = req.name?.trim() || 'Custom Cloned Voice';
    const voiceId = `cloned_${Date.now()}_${rawName.toLowerCase().replace(/[^a-z0-9_]/g, '_').substring(0, 20)}`;
    const ext = path.extname(req.originalFileName).toLowerCase() || '.wav';

    // Temp save
    const tempPath = path.join(this.samplesDir, `temp_${voiceId}${ext}`);
    fs.writeFileSync(tempPath, req.buffer);

    // Validate duration: 3s - 15s recommended for zero-shot cloning
    const duration = await this.measureAudioDuration(tempPath);
    if (duration < 2.5) {
      try { fs.unlinkSync(tempPath); } catch {}
      throw new Error(`Đoạn âm thanh mẫu quá ngắn (${duration.toFixed(1)}s). Yêu cầu tối thiểu từ 3 đến 15 giây giọng nói rõ ràng.`);
    }

    if (duration > 35) {
      try { fs.unlinkSync(tempPath); } catch {}
      throw new Error(`Đoạn âm thanh mẫu quá dài (${duration.toFixed(1)}s). VieNeu TTS tối ưu nhất cho mẫu giọng từ 3 đến 15 giây.`);
    }

    // Convert or finalize as clean wav file
    const targetWavPath = path.join(this.samplesDir, `${voiceId}.wav`);
    try {
      // Use ffmpeg to normalize audio to 16-bit 24kHz/48kHz mono for pristine zero-shot reference
      await execFileAsync('ffmpeg', [
        '-y',
        '-i', tempPath,
        '-ac', '1',
        '-ar', '24000',
        targetWavPath
      ], { timeout: 15000 });
      try { fs.unlinkSync(tempPath); } catch {}
    } catch {
      // If ffmpeg fails, rename temp file
      if (fs.existsSync(tempPath)) {
        fs.renameSync(tempPath, targetWavPath);
      }
    }

    const record: ClonedVoiceRecord = {
      id: voiceId,
      name: rawName,
      gender: req.gender || 'Male',
      locale: req.locale || 'vi-VN',
      region: 'Custom Voice Clone',
      style: req.description || 'Giọng nhân bản AI',
      suggestedRole: 'Giọng độc quyền người dùng',
      samplePath: targetWavPath,
      sampleUrl: `/uploads/voices/${voiceId}.wav`,
      durationSec: duration,
      createdAt: new Date().toISOString()
    };

    // Auto-persist sample to Google Drive if connected
    const driveDir = this.provider.getDriveVoicesDir();
    if (driveDir && fs.existsSync(driveDir)) {
      try {
        const driveSamples = path.join(driveDir, 'samples');
        fs.mkdirSync(driveSamples, { recursive: true });
        fs.copyFileSync(targetWavPath, path.join(driveSamples, `${voiceId}.wav`));
        console.log(`[VoiceStudio] Đã sao lưu mẫu âm thanh giọng "${rawName}" lên Google Drive ("${path.basename(driveDir)}")!`);
      } catch (e) {
        console.warn('[VoiceStudio] Không thể sao lưu file mẫu lên Google Drive:', e);
      }
    }

    this.provider.registerClonedVoice(record);
    console.log(`[VoiceStudio] Đã đăng ký nhân bản giọng thành công: ${record.name} (${record.id})`);
    return record;
  }

  public deleteVoice(id: string): boolean {
    const ok = this.provider.deleteClonedVoice(id);
    if (ok) {
      const samplePath = path.join(this.samplesDir, `${id}.wav`);
      if (fs.existsSync(samplePath)) {
        try { fs.unlinkSync(samplePath); } catch {}
      }
      const driveDir = this.provider.getDriveVoicesDir();
      if (driveDir && fs.existsSync(driveDir)) {
        const driveSample = path.join(driveDir, 'samples', `${id}.wav`);
        if (fs.existsSync(driveSample)) {
          try { fs.unlinkSync(driveSample); } catch {}
        }
      }
    }
    return ok;
  }

  public listClonedVoices(): ClonedVoiceRecord[] {
    return this.provider.getClonedVoices();
  }

  public reload(): void {
    this.provider.reloadClonedVoices();
  }

  public syncFromDrive() {
    return this.provider.syncFromDrive();
  }

  public syncToDrive() {
    return this.provider.syncToDrive();
  }

  public getDriveStatus() {
    return this.provider.getDriveStatus();
  }
}
