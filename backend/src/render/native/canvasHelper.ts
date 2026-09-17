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

export function drawHudPath(
  ctx: SKRSContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  chamfer: number = 14
): void {
  const c = Math.min(chamfer, width / 4, height / 4);
  ctx.beginPath();
  ctx.moveTo(x + c, y);
  ctx.lineTo(x + width - c, y);
  ctx.lineTo(x + width, y + c);
  ctx.lineTo(x + width, y + height - c);
  ctx.lineTo(x + width - c, y + height);
  ctx.lineTo(x + c, y + height);
  ctx.lineTo(x, y + height - c);
  ctx.lineTo(x, y + c);
  ctx.closePath();
}

export function drawHexagonPath(
  ctx: SKRSContext2D,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  const w2 = width / 2;
  const h2 = height / 2;
  const cx = x + w2;
  const cy = y + h2;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3 - Math.PI / 6;
    const px = cx + w2 * Math.cos(angle);
    const py = cy + h2 * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

export function drawCirclePath(
  ctx: SKRSContext2D,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  const r = Math.min(width, height) / 2;
  const cx = x + width / 2;
  const cy = y + height / 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.closePath();
}

export function drawDiamondPath(
  ctx: SKRSContext2D,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  const cx = x + width / 2;
  const cy = y + height / 2;
  ctx.beginPath();
  ctx.moveTo(cx, y);
  ctx.lineTo(x + width, cy);
  ctx.lineTo(cx, y + height);
  ctx.lineTo(x, cy);
  ctx.closePath();
}

export function drawEllipsePath(
  ctx: SKRSContext2D,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  const cx = x + width / 2;
  const cy = y + height / 2;
  ctx.beginPath();
  ctx.ellipse(cx, cy, width / 2, height / 2, 0, 0, Math.PI * 2);
  ctx.closePath();
}

export function drawBlobPath(
  ctx: SKRSContext2D,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  // Smooth organic blob using cubic beziers
  const cx = x + width / 2;
  const cy = y + height / 2;
  const rx = width / 2;
  const ry = height / 2;
  ctx.beginPath();
  ctx.moveTo(cx, y);
  ctx.bezierCurveTo(cx + rx * 0.9, y, x + width, cy - ry * 0.4, x + width, cy);
  ctx.bezierCurveTo(x + width, cy + ry * 0.8, cx + rx * 0.5, y + height, cx, y + height);
  ctx.bezierCurveTo(cx - rx * 0.8, y + height, x, cy + ry * 0.5, x, cy);
  ctx.bezierCurveTo(x, cy - ry * 0.8, cx - rx * 0.6, y, cx, y);
  ctx.closePath();
}

export function drawTicketPath(
  ctx: SKRSContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  notchRadius: number = 10
): void {
  const nr = Math.min(notchRadius, height / 4, width / 4);
  const r = 8;
  const cy = y + height / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, cy - nr);
  ctx.arc(x + width, cy, nr, -Math.PI / 2, Math.PI / 2, true); // inward notch right
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, cy + nr);
  ctx.arc(x, cy, nr, Math.PI / 2, -Math.PI / 2, true); // inward notch left
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function drawBadgePath(
  ctx: SKRSContext2D,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  // 8-point chamfered badge
  const c = Math.min(12, width / 6, height / 6);
  ctx.beginPath();
  ctx.moveTo(x + c, y);
  ctx.lineTo(x + width - c, y);
  ctx.lineTo(x + width, y + c);
  ctx.lineTo(x + width, y + height - c);
  ctx.lineTo(x + width - c, y + height);
  ctx.lineTo(x + c, y + height);
  ctx.lineTo(x, y + height - c);
  ctx.lineTo(x, y + c);
  ctx.closePath();
}

export function drawSpeechBubblePath(
  ctx: SKRSContext2D,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  // Speech bubble: rounded card with small tail pointer at bottom-left
  const r = Math.min(22, height / 3, width / 4);
  const tailW = 14;
  const tailH = 8;
  const tailX = x + 24;
  const bodyH = height - tailH;

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + bodyH - r);
  ctx.quadraticCurveTo(x + width, y + bodyH, x + width - r, y + bodyH);
  ctx.lineTo(tailX + tailW, y + bodyH);
  ctx.lineTo(tailX, y + height); // Tail tip
  ctx.lineTo(tailX + 2, y + bodyH);
  ctx.lineTo(x + r, y + bodyH);
  ctx.quadraticCurveTo(x, y + bodyH, x, y + bodyH - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function drawShapePath(
  ctx: SKRSContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  style: any
): void {
  const shape = style?.shape;
  switch (shape) {
    case 'rectangle':
      ctx.beginPath();
      ctx.rect(x, y, width, height);
      ctx.closePath();
      break;
    case 'circle':
      drawCirclePath(ctx, x, y, width, height);
      break;
    case 'ellipse':
      drawEllipsePath(ctx, x, y, width, height);
      break;
    case 'diamond':
      drawDiamondPath(ctx, x, y, width, height);
      break;
    case 'hexagon':
      drawHexagonPath(ctx, x, y, width, height);
      break;
    case 'hud':
      drawHudPath(ctx, x, y, width, height, style?.chamferSize || 14);
      break;
    case 'blob':
      drawBlobPath(ctx, x, y, width, height);
      break;
    case 'ticket':
      drawTicketPath(ctx, x, y, width, height, 10);
      break;
    case 'badge':
      drawBadgePath(ctx, x, y, width, height);
      break;
    case 'speech-bubble':
      drawSpeechBubblePath(ctx, x, y, width, height);
      break;
    case 'bubble':
      drawRoundedRect(ctx, x, y, width, height, [30, 12, 30, 12]);
      break;
    case 'capsule':
    case 'pill':
      drawRoundedRect(ctx, x, y, width, height, Math.min(width, height) / 2);
      break;
    case 'color-block':
      drawRoundedRect(ctx, x, y, width, height, style?.borderRadius ?? 16);
      break;
    case 'doodle':
      drawRoundedRect(ctx, x, y, width, height, style?.borderRadius ?? 16);
      break;
    case 'glass':
    case 'rounded':
    default:
      const radius = style?.borderRadius !== undefined ? style.borderRadius : 16;
      drawRoundedRect(ctx, x, y, width, height, radius);
      break;
  }
}

