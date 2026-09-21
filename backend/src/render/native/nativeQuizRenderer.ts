import { spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { once } from 'events';
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

// Pre-scale large images once before render loop (learned from Quiz vẽ giấy asset-resolver.ts)
async function loadAndPrepareImage(
  localPath: string,
  targetWidth?: number,
  targetHeight?: number
): Promise<Image | null> {
  try {
    if (!fs.existsSync(localPath)) return null;
    const rawImage = await loadImage(localPath);
    if (!targetWidth || !targetHeight) return rawImage;

    const origW = rawImage.width;
    const origH = rawImage.height;

    // Pre-scale if image is larger than 1.5x target display dimensions
    if (origW > targetWidth * 1.5 || origH > targetHeight * 1.5) {
      const maxTargetW = Math.round(targetWidth * 2); // 2x max for crisp high-DPI
      const maxTargetH = Math.round(targetHeight * 2);
      const scale = Math.max(0.01, Math.min(maxTargetW / origW, maxTargetH / origH, 1.0));
      const scaledW = Math.max(1, Math.round(origW * scale));
      const scaledH = Math.max(1, Math.round(origH * scale));

      const offscreen = createCanvas(scaledW, scaledH);
      const offCtx = offscreen.getContext('2d');
      offCtx.drawImage(rawImage, 0, 0, scaledW, scaledH);
      const buffer = offscreen.toBuffer('image/png');
      return await loadImage(buffer);
    }
    return rawImage;
  } catch (err: any) {
    console.warn(`[NATIVE_RENDER] Không thể nạp/tối ưu ảnh: ${localPath} (${err.message})`);
    return null;
  }
}

    // 1. Preload all necessary media into memory with smart pre-scaling (Zero disk I/O in frame loop)
    const loadedImages = new Map<string, Image>();

    // Preload background image
    if (template.components.background.imageUrl) {
      const rawSrc = template.components.background.imageUrl;
      const localPath = resolveLocalMediaPath(rawSrc);
      const img = await loadAndPrepareImage(localPath, width, height);
      if (img) loadedImages.set(rawSrc, img);
    }
    // Preload brand logo & avatar
    if (channel.branding.identity.logoUrl) {
      const rawSrc = channel.branding.identity.logoUrl;
      const localPath = resolveLocalMediaPath(rawSrc);
      const img = await loadAndPrepareImage(localPath, 200, 200);
      if (img) loadedImages.set(rawSrc, img);
    }
    if (channel.branding.identity.avatarUrl) {
      const rawSrc = channel.branding.identity.avatarUrl;
      const localPath = resolveLocalMediaPath(rawSrc);
      const img = await loadAndPrepareImage(localPath, 200, 200);
      if (img) loadedImages.set(rawSrc, img);
    }
    // Preload question illustrations
    const illuW = Math.round(((template.components.illustration?.width ?? 88) / 100) * width);
    const illuH = Math.round(((template.components.illustration?.height ?? 26) / 100) * height);
    for (const q of quiz.questions) {
      if (q.illustrations && q.illustrations.length > 0) {
        for (const imgPath of q.illustrations) {
          if (imgPath && !loadedImages.has(imgPath)) {
            const localPath = resolveLocalMediaPath(imgPath);
            const img = await loadAndPrepareImage(localPath, illuW, illuH);
            if (img) loadedImages.set(imgPath, img);
          }
        }
      }
    }

    // 2. Setup FFmpeg Encoder Arguments (Prefer system ffmpeg with rawvideo support)
    let ffmpegBin = 'ffmpeg';
    let hasRawvideo = true;
    try {
      execSync('ffmpeg -version', { stdio: 'ignore' });
    } catch {
      // Fallback to bundled compositor ffmpeg
      if (process.platform === 'win32') {
        const compositorWin = path.resolve(process.cwd(), 'node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe');
        if (fs.existsSync(compositorWin)) {
          ffmpegBin = compositorWin;
          hasRawvideo = false;
        }
      } else {
        const compositorLinux = path.resolve(process.cwd(), 'node_modules/@remotion/compositor-linux-x64-gnu/ffmpeg');
        if (fs.existsSync(compositorLinux)) {
          ffmpegBin = compositorLinux;
          hasRawvideo = false;
        }
      }
    }

    const ffmpegArgs = hasRawvideo ? [
      '-f', 'rawvideo',
      '-pix_fmt', 'rgba',
      '-s', `${width}x${height}`,
      '-r', `${fps}`,
      '-i', '-'
    ] : [
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
        '-preset', presetConfig.x264Preset || 'superfast',
        '-tune', 'fastdecode',
        '-threads', '0',
        '-crf', String(presetConfig.crf || 22),
        '-pix_fmt', 'yuv420p',
        '-y',
        outputPath
      );
    }

    console.log(`[NATIVE_RENDER] Bắt đầu render Native Skia: ${width}x${height} @ ${fps}fps, Encoder=${nvencEnabled ? 'h264_nvenc' : 'libx264 (' + (presetConfig.x264Preset || 'superfast') + ')'}`);

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
      if ((e as any).code !== 'EPIPE' && (e as any).code !== 'EOF') {
        console.error('[NATIVE_RENDER] FFmpeg STDIN Error:', e.message, 'Code:', (e as any).code);
        console.error('[NATIVE_RENDER] FFmpeg Stderr so far:\n', ffmpegStderr.slice(-1000));
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

      const buf = hasRawvideo ? canvas.data() : await canvas.encode('jpeg', 80);
      const canWrite = ffmpegProc.stdin.write(buf);
      if (!canWrite) {
        await once(ffmpegProc.stdin, 'drain');
      }

      // Periodically calculate and emit FPS & progress (and yield to event loop like Quiz vẽ giấy)
      const now = Date.now();
      const dt = (now - lastReportTime) / 1000;
      if (dt >= 0.25 || f === totalDurationFrames - 1) {
        await new Promise(r => setImmediate(r));
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
