import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { TimelineQuestionCue } from '../../../../remotion/types/index.js';
import { resolveLocalMediaPath } from './canvasHelper.js';

export interface AudioMixTrack {
  filePath: string;
  startFrame: number;
  durationFrames: number;
  volume: number;
  type: string;
}

export class NativeAudioMixer {
  public static async mixAudio(
    cues: TimelineQuestionCue[],
    durationSec: number,
    outputPath: string
  ): Promise<void> {
    // 1. Gather all audio cue tracks from timeline cues
    const tracks: AudioMixTrack[] = [];
    for (const cue of cues) {
      if (!cue.audioCues) continue;
      for (const a of cue.audioCues) {
        if ((a.type === 'tts' || a.type === 'sfx') && a.url) {
          const resolved = resolveLocalMediaPath(a.url);
          if (fs.existsSync(resolved)) {
            tracks.push({
              filePath: resolved,
              startFrame: a.startFrame,
              durationFrames: a.durationFrames,
              volume: a.volume ?? 1.0,
              type: a.type
            });
          }
        }
      }
    }

    let ffmpegBin = 'ffmpeg';
    if (process.platform === 'win32') {
      const compWin = path.resolve(process.cwd(), 'node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe');
      if (fs.existsSync(compWin)) ffmpegBin = compWin;
    } else {
      const compLinux = path.resolve(process.cwd(), 'node_modules/@remotion/compositor-linux-x64-gnu/ffmpeg');
      if (fs.existsSync(compLinux)) ffmpegBin = compLinux;
    }

    if (tracks.length === 0) {
      // Generate silence
      const args = [
        '-y',
        '-f', 'lavfi',
        '-t', String(durationSec),
        '-i', 'anullsrc=r=44100:cl=stereo',
        '-c:a', 'aac',
        '-b:a', '160k',
        outputPath
      ];
      await NativeAudioMixer.runFfmpeg(ffmpegBin, args);
      return;
    }

    // Build amix filter graph
    const inputs: string[] = [
      '-y',
      '-f', 'lavfi',
      '-t', String(durationSec),
      '-i', 'anullsrc=r=44100:cl=stereo'
    ];

    const filterParts: string[] = [];
    const mixInputs: string[] = ['[0:a]'];

    for (let i = 0; i < tracks.length; i++) {
      const trk = tracks[i];
      inputs.push('-i', trk.filePath);
      const inputIdx = i + 1;
      const delayMs = Math.max(0, Math.round((trk.startFrame / 30) * 1000));
      const vol = Math.max(0, Math.min(2.0, trk.volume ?? 1.0));
      filterParts.push(`[${inputIdx}:a]adelay=${delayMs}|${delayMs},volume=${vol.toFixed(2)}[a${inputIdx}]`);
      mixInputs.push(`[a${inputIdx}]`);
    }

    filterParts.push(`${mixInputs.join('')}amix=inputs=${mixInputs.length}:duration=first:dropout_transition=0:normalize=0[aout]`);

    const args = [
      ...inputs,
      '-filter_complex', filterParts.join(';'),
      '-map', '[aout]',
      '-t', String(durationSec),
      '-c:a', 'aac',
      '-b:a', '160k',
      outputPath
    ];

    console.log(`[AUDIO_MIX] Hòa âm ${tracks.length} kênh Audio (TTS + SFX) bằng FFmpeg (thời lượng: ${durationSec}s)...`);
    await NativeAudioMixer.runFfmpeg(ffmpegBin, args);
  }

  public static async muxVideoAudio(
    videoPath: string,
    audioPath: string,
    outputPath: string
  ): Promise<void> {
    let ffmpegBin = 'ffmpeg';
    if (process.platform === 'win32') {
      const compWin = path.resolve(process.cwd(), 'node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe');
      if (fs.existsSync(compWin)) ffmpegBin = compWin;
    } else {
      const compLinux = path.resolve(process.cwd(), 'node_modules/@remotion/compositor-linux-x64-gnu/ffmpeg');
      if (fs.existsSync(compLinux)) ffmpegBin = compLinux;
    }

    const args = [
      '-y',
      '-i', videoPath,
      '-i', audioPath,
      '-c:v', 'copy',
      '-c:a', 'copy',
      '-movflags', '+faststart',
      outputPath
    ];

    console.log('[FFMPEG_MUX] Ghép luồng Video và Audio (Stream Copy FastStart)...');
    await NativeAudioMixer.runFfmpeg(ffmpegBin, args);
  }

  private static runFfmpeg(bin: string, args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const proc = spawn(bin, args, { stdio: ['ignore', 'ignore', 'pipe'] });
      let stderr = '';
      proc.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
      });
      proc.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`FFmpeg error (code ${code}): ${stderr.slice(-400)}`));
      });
      proc.on('error', (err) => {
        reject(new Error(`Không thể chạy FFmpeg: ${err.message}`));
      });
    });
  }
}
