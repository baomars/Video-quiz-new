import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { ComponentStyle } from '../types/index';
import { getEntranceTransform } from '../animations/index';

interface QuestionBoxProps {
  style: ComponentStyle & { glassmorphism?: boolean };
  questionText: string;
  questionIndex: number;
  totalQuestions: number;
  primaryColor?: string;
  hasIllustration?: boolean;
  delayFrame?: number;
  contentOpacity?: number;
}

const bgColorCache = new Map<string, string>();

function parseBgColor(colorStr?: string, opacityVal?: number): string {
  const key = `${colorStr || ''}_${opacityVal}`;
  const cached = bgColorCache.get(key);
  if (cached) return cached;

  let result = colorStr || '#ffffff';
  if (!colorStr) {
    result = opacityVal !== undefined ? `rgba(15, 23, 42, ${opacityVal})` : '#ffffff';
  } else if (opacityVal !== undefined) {
    if (colorStr.startsWith('#')) {
      let hex = colorStr.slice(1);
      if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
      if (hex.length === 6) {
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        result = `rgba(${r}, ${g}, ${b}, ${opacityVal})`;
      }
    } else if (colorStr.startsWith('rgba(')) {
      result = colorStr.replace(/[\d\.]+\)$/, `${opacityVal})`);
    } else if (colorStr.startsWith('rgb(')) {
      result = colorStr.replace('rgb(', 'rgba(').replace(')', `, ${opacityVal})`);
    }
  }

  bgColorCache.set(key, result);
  return result;
}

export const QuestionBox: React.FC<QuestionBoxProps> = ({
  style,
  questionText,
  questionIndex,
  totalQuestions,
  primaryColor = '#2563eb',
  hasIllustration = true,
  delayFrame = 0,
  contentOpacity = 1.0
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entrance = delayFrame >= 0
    ? getEntranceTransform(style.animation || 'pop', frame, fps, delayFrame)
    : { opacity: 1, transform: 'none' };

  // If no illustration, slightly expand question box vertically for better balance
  const effectiveY = !hasIllustration ? Math.max(22, style.y - 12) : style.y;
  const effectiveHeight = !hasIllustration ? Math.min(30, style.height + 10) : style.height;

  // Horizontal Alignment of the Box
  const width = style.width ?? 88;
  const leftPos = style.x !== undefined
    ? `${style.x}%`
    : style.horizontalAlign === 'center'
    ? `${(100 - width) / 2}%`
    : style.horizontalAlign === 'right'
    ? `${100 - width - 6}%`
    : '6%';

  // Vertical text alignment
  const vAlign = style.verticalAlign || 'center';
  const justifyContent = vAlign === 'top' ? 'flex-start' : vAlign === 'bottom' ? 'flex-end' : 'center';

  // Text alignment
  const textAlign = style.textAlign || 'center';

  const opacityVal = style.bgOpacity !== undefined ? style.bgOpacity : (style.glassmorphism ? 0.85 : 0.95);
  // Background color with opacity support
  const effectiveBg = parseBgColor(style.backgroundColor || '#ffffff', opacityVal);

  // Border styling
  const borderWidth = style.borderWidth !== undefined ? style.borderWidth : 2;
  const borderColor = style.borderColor || primaryColor || '#38bdf8';

  // Glow and Shadow
  let boxShadow = style.boxShadow || '0 8px 32px rgba(0, 0, 0, 0.2)';
  if (style.glowRadius && style.glowRadius > 0) {
    const glow = `0 0 ${style.glowRadius}px ${style.glowColor || 'rgba(56, 189, 248, 0.5)'}`;
    boxShadow = `${glow}, ${boxShadow}`;
  }

  // Backdrop Blur (frosted glass) - Only apply if transparent enough to be visible!
  const blurPx = style.backdropBlur !== undefined ? style.backdropBlur : 0;
  const shouldApplyBlur = blurPx > 0 && opacityVal < 0.92;

  // Text Stroke
  const strokeWidth = style.textStrokeWidth ?? 0;
  const strokeColor = style.textStrokeColor || 'rgba(0,0,0,0.85)';
  const textColor = style.textColor || style.color || '#0f172a';

  return (
    <div
      style={{
        position: 'absolute',
        left: leftPos,
        top: `${effectiveY}%`,
        width: `${style.width}%`,
        height: `${effectiveHeight}%`,
        backgroundColor: effectiveBg,
        borderRadius: `${style.borderRadius ?? 20}px`,
        border: `${borderWidth}px solid ${borderColor}`,
        boxShadow,
        backdropFilter: shouldApplyBlur ? `blur(${blurPx}px)` : undefined,
        WebkitBackdropFilter: shouldApplyBlur ? `blur(${blurPx}px)` : undefined,
        padding: `${style.padding || 18}px`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent,
        alignItems: textAlign === 'left' ? 'flex-start' : textAlign === 'right' ? 'flex-end' : 'center',
        zIndex: 10,
        boxSizing: 'border-box',
        ...entrance
      }}
    >
      <div
        style={{
          fontFamily: style.fontFamily || 'Be Vietnam Pro, sans-serif',
          fontSize: `${style.fontSize || 28}px`,
          fontWeight: style.fontWeight || '800',
          color: textColor,
          WebkitTextStroke: strokeWidth > 0 ? `${strokeWidth}px ${strokeColor}` : undefined,
          textShadow: style.textShadow || (strokeWidth > 0 ? undefined : '0 2px 10px rgba(0,0,0,0.1)'),
          textAlign,
          lineHeight: style.lineHeight || 1.35,
          letterSpacing: `${style.letterSpacing || 0}px`,
          width: '100%',
          opacity: contentOpacity
        }}
      >
        {questionText}
      </div>
    </div>
  );
};
