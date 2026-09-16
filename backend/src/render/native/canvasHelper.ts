import path from 'path';
import fs from 'fs';
import { spring, interpolate } from 'remotion';
import type { SKRSContext2D } from '@napi-rs/canvas';

const colorCache = new Map<string, string>();

export function parseColor(colorStr?: string, opacity?: number): string {
  if (!colorStr) {
    return opacity !== undefined ? `rgba(255, 255, 255, ${opacity})` : '#ffffff';
  }
  const key = `${colorStr}_${opacity ?? 1}`;
  const cached = colorCache.get(key);
  if (cached) return cached;

  let result = colorStr;
  if (opacity !== undefined) {
    if (colorStr.startsWith('#')) {
      let hex = colorStr.slice(1);
      if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
      if (hex.length === 6) {
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        result = `rgba(${r}, ${g}, ${b}, ${opacity})`;
      } else if (hex.length === 8) {
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        result = `rgba(${r}, ${g}, ${b}, ${opacity})`;
      }
    } else if (colorStr.startsWith('rgba(')) {
      result = colorStr.replace(/[\d\.]+\)$/, `${opacity})`);
    } else if (colorStr.startsWith('rgb(')) {
      result = colorStr.replace('rgb(', 'rgba(').replace(')', `, ${opacity})`);
    }
  }

  colorCache.set(key, result);
  return result;
}

export function drawRoundedRect(
  ctx: SKRSContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number | number[]
): void {
  ctx.beginPath();
  if (typeof (ctx as any).roundRect === 'function') {
    (ctx as any).roundRect(x, y, width, height, radius);
  } else {
    let r = typeof radius === 'number' ? radius : radius[0] || 0;
    r = Math.min(r, width / 2, height / 2);
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}

export function wrapText(
  ctx: SKRSContext2D,
  text: string,
  maxWidth: number,
  maxLines: number = 4
): string[] {
  if (!text) return [];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
      if (lines.length >= maxLines - 1) {
        break;
      }
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }

  return lines;
}

export function resolveLocalMediaPath(src?: string): string {
  if (!src) return '';
  if (path.isAbsolute(src) && fs.existsSync(src)) return src;
  const clean = src.replace(/^\/+/, '');
  const inPublic = path.resolve(process.cwd(), 'public', clean);
  if (fs.existsSync(inPublic)) return inPublic;
  const inRoot = path.resolve(process.cwd(), clean);
  if (fs.existsSync(inRoot)) return inRoot;
  return src;
}

export function getEntranceTransform(
  type: string = 'slide-up',
  frame: number,
  fps: number = 30,
  delay: number = 0
): { opacity: number; translateY: number; scale: number } {
  const delayedFrame = Math.max(0, frame - delay);
  const spr = spring({
    frame: delayedFrame,
    fps,
    config: {
      damping: 14,
      stiffness: 120,
      mass: 0.8
    }
  });

  const opacity = interpolate(spr, [0, 1], [0, 1], { extrapolateRight: 'clamp' });

  switch (type) {
    case 'slide-up':
      return {
        opacity,
        translateY: interpolate(spr, [0, 1], [40, 0], { extrapolateRight: 'clamp' }),
        scale: 1.0
      };
    case 'pop':
    case 'scale-in':
      return {
        opacity,
        translateY: 0,
        scale: interpolate(spr, [0, 1], [0.8, 1], { extrapolateRight: 'clamp' })
      };
    case 'bounce':
      return {
        opacity,
        translateY: 0,
        scale: interpolate(spr, [0, 0.7, 1], [0.5, 1.08, 1], { extrapolateRight: 'clamp' })
      };
    case 'fade':
    default:
      return {
        opacity,
        translateY: 0,
        scale: 1.0
      };
  }
}
