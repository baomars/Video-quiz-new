import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface ProcessImageOptions {
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'inside';
  quality?: number;
}

export class ImageProcessor {
  private cacheDir: string;
  private uploadDir: string;

  constructor(cacheDir: string, uploadDir: string) {
    this.cacheDir = cacheDir;
    this.uploadDir = uploadDir;
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Resolves any local or relative path into an absolute disk path that exists.
   * Handles Windows drive letters, leading slashes, localhost URLs, and upload dirs.
   */
  public resolveLocalPath(inputPath: string): string | null {
    if (!inputPath || typeof inputPath !== 'string') return null;

    let targetPath = inputPath.trim();

    // 1. If it's a localhost or 127.0.0.1 URL, extract the pathname
    if (targetPath.startsWith('http://') || targetPath.startsWith('https://')) {
      try {
        const u = new URL(targetPath);
        if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') {
          targetPath = decodeURIComponent(u.pathname);
        } else {
          return null; // External URL
        }
      } catch {
        return null;
      }
    }

    // 2. Direct absolute path on Windows (e.g. D:\...) or Unix (/home/...)
    if (/^[a-zA-Z]:[\\/]/.test(targetPath) || (process.platform !== 'win32' && targetPath.startsWith('/'))) {
      if (fs.existsSync(targetPath) && fs.statSync(targetPath).isFile()) {
        return targetPath;
      }
    }

    const clean = targetPath.replace(/^[/\\]+/, '');
    const filename = path.basename(targetPath);
    const parentDir = path.dirname(this.uploadDir);

    const candidates = [
      // Direct path
      targetPath,
      // In illustrations upload dir
      path.join(this.uploadDir, filename),
      // In public/uploads/...
      path.join(parentDir, filename),
      path.join(parentDir, 'illustrations', filename),
      // In public/
      path.join(process.cwd(), 'public', clean),
      path.join(process.cwd(), 'public', 'uploads', 'illustrations', filename),
      path.join(process.cwd(), 'public', 'uploads', filename),
      // In root/
      path.join(process.cwd(), clean),
      path.join(this.cacheDir, filename)
    ];

    for (const cand of candidates) {
      try {
        if (fs.existsSync(cand) && fs.statSync(cand).isFile()) {
          return cand;
        }
      } catch {}
    }

    return null;
  }

  public async processImage(
    inputPath: string,
    options: ProcessImageOptions = {}
  ): Promise<{ url: string; filePath: string; width: number; height: number }> {
    const width = options.width || 720;
    const height = options.height || 540;
    const fit = options.fit || 'cover';
    const quality = options.quality || 85;

    let fileBuffer: Buffer;
    let isSvg = false;
    let resolvedPath = this.resolveLocalPath(inputPath);

    if (resolvedPath) {
      if (resolvedPath.toLowerCase().endsWith('.svg')) {
        isSvg = true;
      }
      fileBuffer = fs.readFileSync(resolvedPath);
    } else if (inputPath.startsWith('http://') || inputPath.startsWith('https://')) {
      // Remote image (e.g. Unsplash) - fetch buffer
      try {
        const res = await fetch(inputPath);
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const arrayBuf = await res.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuf);
        if (inputPath.toLowerCase().includes('.svg')) isSvg = true;
      } catch (err: any) {
        throw new Error(`Failed to fetch remote image ${inputPath}: ${err.message}`);
      }
    } else {
      throw new Error(`Source image not found at: ${inputPath}`);
    }

    // If SVG, return as is (scalable vector)
    if (isSvg) {
      const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex').substring(0, 16);
      const svgFileName = `vector_${hash}.svg`;
      const svgPath = path.join(this.cacheDir, svgFileName);
      if (!fs.existsSync(svgPath)) {
        fs.writeFileSync(svgPath, fileBuffer);
      }
      return { url: `/cache/images/${svgFileName}`, filePath: svgPath, width, height };
    }

    const hash = crypto
      .createHash('sha256')
      .update(fileBuffer)
      .update(`${width}x${height}_${fit}_q${quality}`)
      .digest('hex');

    const outputFileName = `${hash}.webp`;
    const outputPath = path.join(this.cacheDir, outputFileName);
    const outputUrl = `/cache/images/${outputFileName}`;

    if (fs.existsSync(outputPath)) {
      const meta = await sharp(outputPath).metadata();
      return {
        url: outputUrl,
        filePath: outputPath,
        width: meta.width || width,
        height: meta.height || height
      };
    }

    const transformer = sharp(fileBuffer)
      .rotate() // auto-orient based on EXIF
      .resize(width, height, {
        fit: fit as keyof sharp.FitEnum,
        background: { r: 15, g: 23, b: 42, alpha: 0 }
      })
      .webp({ quality });

    const info = await transformer.toFile(outputPath);

    return {
      url: outputUrl,
      filePath: outputPath,
      width: info.width,
      height: info.height
    };
  }

  /**
   * Automatic background removal for logos with solid backgrounds (white, black, or uniform edge color).
   * Uses Sharp raw pixel manipulation with corner color sampling and tolerance thresholding.
   */
  public async removeBackground(
    inputPath: string,
    tolerance: number = 38
  ): Promise<{ url: string; filePath: string; message: string }> {
    let resolvedPath = this.resolveLocalPath(inputPath);
    let fileBuffer: Buffer;

    if (resolvedPath) {
      fileBuffer = fs.readFileSync(resolvedPath);
    } else if (inputPath.startsWith('http://') || inputPath.startsWith('https://')) {
      const res = await fetch(inputPath);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const arrayBuf = await res.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuf);
    } else {
      throw new Error(`File logo không tồn tại: ${inputPath}`);
    }

    // Convert to RGBA raw buffer
    const image = sharp(fileBuffer).ensureAlpha();
    const meta = await image.metadata();
    const width = meta.width || 100;
    const height = meta.height || 100;

    const { data } = await image.raw().toBuffer({ resolveWithObject: true });

    // Sample corner pixels to detect solid background color
    const corners = [
      0, // top-left (0,0)
      (width - 1) * 4, // top-right
      (height - 1) * width * 4, // bottom-left
      ((height - 1) * width + (width - 1)) * 4 // bottom-right
    ];

    // Average the corner colors
    let sumR = 0, sumG = 0, sumB = 0;
    for (const c of corners) {
      sumR += data[c];
      sumG += data[c + 1];
      sumB += data[c + 2];
    }
    const bgR = Math.round(sumR / 4);
    const bgG = Math.round(sumG / 4);
    const bgB = Math.round(sumB / 4);

    const maxDiffThreshold = tolerance * 3;
    let modifiedPixels = 0;

    for (let i = 0; i < data.length; i += 4) {
      const diff =
        Math.abs(data[i] - bgR) +
        Math.abs(data[i + 1] - bgG) +
        Math.abs(data[i + 2] - bgB);

      if (diff <= maxDiffThreshold) {
        // Transparent
        data[i + 3] = 0;
        modifiedPixels++;
      } else if (diff <= maxDiffThreshold + 20) {
        // Soft edge feathering
        const factor = (diff - maxDiffThreshold) / 20;
        data[i + 3] = Math.round(data[i + 3] * factor);
      }
    }

    const hash = crypto.createHash('md5').update(data).digest('hex').substring(0, 8);
    const filename = `nobg_${Date.now()}_${hash}.png`;
    const outputPath = path.join(this.uploadDir, filename);

    await sharp(data, {
      raw: {
        width,
        height,
        channels: 4
      }
    })
      .png()
      .toFile(outputPath);

    const isWhite = bgR > 220 && bgG > 220 && bgB > 220;
    const isBlack = bgR < 35 && bgG < 35 && bgB < 35;
    const bgDescription = isWhite ? 'nền trắng' : isBlack ? 'nền đen' : `màu rgb(${bgR},${bgG},${bgB})`;

    return {
      url: `/uploads/illustrations/${filename}`,
      filePath: outputPath,
      message: `Đã tách thành công ${bgDescription} (${Math.round((modifiedPixels / (width * height)) * 100)}% diện tích ảnh).`
    };
  }

  public async saveUploadedFile(buffer: Buffer, originalName: string): Promise<string> {
    const ext = path.extname(originalName).toLowerCase() || '.png';
    const hash = crypto.createHash('md5').update(buffer).digest('hex');
    const filename = `${Date.now()}_${hash.substring(0, 8)}${ext}`;
    const targetPath = path.join(this.uploadDir, filename);

    fs.writeFileSync(targetPath, buffer);
    return `/uploads/illustrations/${filename}`;
  }
}
