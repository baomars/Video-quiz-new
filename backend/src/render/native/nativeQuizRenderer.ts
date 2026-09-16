import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { createCanvas, loadImage, Image } from '@napi-rs/canvas';
import { Channel, VideoTemplate, Quiz, TimelineQuestionCue } from '../../../../remotion/types/index.js';
import { RenderPresetConfig } from '../renderManager.js';
import { initNativeFonts } from './fontManager.js';
import { drawScene, SceneDrawContext } from './sceneDrawer.js';
import { resolveLocalMediaPath } from './canvasHelper.js';

export interface NativeRenderOptions {
  channel: Channel;
  template: VideoTemplate;
  quiz: Quiz;
  cues: TimelineQuestionCue[];
  totalDurationFrames: number;
  fps: number;
  width: number;
  height: number;
  outputPath: string;
  presetConfig: RenderPresetConfig;
  nvencEnabled: boolean;
  onProgress?: (progressData: {
    renderedFrames: number;
    totalFrames: number;
    fps: number;
    speed: number;
    percent: number;
  }) => void;
  cancelSignal?: { cancelled: boolean };
}

export class NativeQuizRenderer {
  private static fontsReady = false;

  public static async renderVideo(options: NativeRenderOptions): Promise<void> {
    const {
      channel,
      template,
      quiz,
      cues,
      totalDurationFrames,
      fps = 30,
      width = 720,
      height = 1280,
      outputPath,
      presetConfig,
      nvencEnabled,
      onProgress,
      cancelSignal
    } = options;

    if (!NativeQuizRenderer.fontsReady) {
      initNativeFonts();
      NativeQuizRenderer.fontsReady = true;
    }

    // 1. Preload all necessary media into memory (Zero disk I/O in frame loop)
    const loadedImages = new Map<string, Image>();

    const preloadList: string[] = [];
    if (template.components.background.imageUrl) {
      preloadList.push(template.components.background.imageUrl);
    }
    if (channel.branding.identity.logoUrl) {
      preloadList.push(channel.branding.identity.logoUrl);
    }
    if (channel.branding.identity.avatarUrl) {
      preloadList.push(channel.branding.identity.avatarUrl);
    }
    for (const q of quiz.questions) {
      if (q.illustrations && q.illustrations.length > 0) {
        for (const img of q.illustrations) {
          if (img) preloadList.push(img);
        }
      }
    }

    for (const rawSrc of preloadList) {
      if (!loadedImages.has(rawSrc)) {
        const localPath = resolveLocalMediaPath(rawSrc);
        try {
          if (fs.existsSync(localPath)) {
            const img = await loadImage(localPath);
            loadedImages.set(rawSrc, img);
          }
        } catch (imgErr: any) {
          console.warn(`[NATIVE_RENDER] Bỏ qua ảnh lỗi: ${rawSrc} (${imgErr.message})`);
        }
      }
    }

    // 2. Setup FFmpeg Encoder Arguments
    let ffmpegBin = 'ffmpeg';
    if (process.platform === 'win32') {
      const compositorWin = path.resolve(process.cwd(), 'node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe');
      if (fs.existsSync(compositorWin)) ffmpegBin = compositorWin;
    } else {
      const compositorLinux = path.resolve(process.cwd(), 'node_modules/@remotion/compositor-linux-x64-gnu/ffmpeg');
      if (fs.existsSync(compositorLinux)) ffmpegBin = compositorLinux;
    }

    const ffmpegArgs = [
      '-f', 'image2pipe',
      '-vcodec', 'mjpeg',
      '-s', `${width}x${height}`,
      '-r', `${fps}`,
      '-i', '-'
    ];

    if (nvencEnabled) {
      ffmpegArgs.push(
        '-c:v', 'h264_nvenc',
        '-b:v', presetConfig.videoBitrate || '4500k',
        '-preset', 'p4',
        '-pix_fmt', 'yuv420p',
        '-y',
        outputPath
      );
    } else {
      ffmpegArgs.push(
        '-c:v', 'libx264',
        '-preset', presetConfig.x264Preset || 'veryfast',
        '-crf', String(presetConfig.crf || 23),
        '-pix_fmt', 'yuv420p',
        '-y',
        outputPath
      );
    }

    console.log(`[NATIVE_RENDER] Bắt đầu render Native Skia: ${width}x${height} @ ${fps}fps, Encoder=${nvencEnabled ? 'h264_nvenc' : 'libx264 (' + presetConfig.x264Preset + ')'}`);

    const ffmpegEnv = {
      ...process.env,
      LD_LIBRARY_PATH: process.env.LD_LIBRARY_PATH || '/usr/lib64-nvidia:/usr/local/cuda/lib64'
    };

    const ffmpegProc = spawn(ffmpegBin, ffmpegArgs, {
      stdio: ['pipe', 'ignore', 'pipe'],
      env: ffmpegEnv
    });

    let ffmpegStderr = '';
    ffmpegProc.stderr.on('data', (chunk) => {
      ffmpegStderr += chunk.toString();
    });
    ffmpegProc.stdin.on('error', (e) => {
      if ((e as any).code !== 'EPIPE') {
        console.error('[NATIVE_RENDER] FFmpeg STDIN Error:', e.message);
      }
    });

    // 3. Initialize High-Performance Skia Canvas
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const drawContext: SceneDrawContext = {
      ctx,
      frame: 0,
      width,
      height,
      fps,
      channel,
      template,
      quiz,
      cues,
      totalDurationFrames,
      loadedImages
    };

    let startTime = Date.now();
    let lastReportTime = startTime;
    let lastReportFrame = 0;
    let smoothFps = 0;

    for (let f = 0; f < totalDurationFrames; f++) {
      if (cancelSignal?.cancelled) {
        ffmpegProc.stdin.destroy();
        ffmpegProc.kill('SIGKILL');
        throw new Error('Render bị hủy bởi người dùng.');
      }

      drawContext.frame = f;
      drawScene(drawContext);

      const buf = await canvas.encode('jpeg', 80);
      const canWrite = ffmpegProc.stdin.write(buf);
      if (!canWrite) {
        await new Promise(r => ffmpegProc.stdin.once('drain', r));
      }

      // Periodically calculate and emit FPS & progress
      const now = Date.now();
      const dt = (now - lastReportTime) / 1000;
      if (dt >= 0.4 || f === totalDurationFrames - 1) {
        const df = f - lastReportFrame;
        const instantFps = dt > 0 ? (df / dt) : 0;
        smoothFps = smoothFps === 0 ? instantFps : (smoothFps * 0.7 + instantFps * 0.3);
        const overallFps = ((f + 1) / ((now - startTime) / 1000));
        const currentFps = Math.round((smoothFps > 0 ? smoothFps : overallFps) * 10) / 10;
        const speed = Math.round((currentFps / fps) * 100) / 100;
        const percent = Math.round(((f + 1) / totalDurationFrames) * 100);

        if (onProgress) {
          onProgress({
            renderedFrames: f + 1,
            totalFrames: totalDurationFrames,
            fps: currentFps,
            speed,
            percent
          });
        }

        lastReportTime = now;
        lastReportFrame = f;
      }
    }

    ffmpegProc.stdin.end();

    await new Promise<void>((resolve, reject) => {
      ffmpegProc.on('close', (code) => {
        if (code === 0) {
          const totalElapsed = (Date.now() - startTime) / 1000;
          const avgFps = (totalDurationFrames / totalElapsed).toFixed(1);
          console.log(`[NATIVE_RENDER] Hoàn thành render khung hình bằng Skia Engine: ${totalDurationFrames} frames trong ${totalElapsed.toFixed(2)}s (Trung bình ${avgFps} FPS)!`);
          resolve();
        } else {
          reject(new Error(`FFmpeg Native Render lỗi (mã thoát ${code}): ${ffmpegStderr.slice(-500)}`));
        }
      });
      ffmpegProc.on('error', (err) => {
        reject(new Error(`Không thể khởi chạy FFmpeg: ${err.message}`));
      });
    });
  }
}
