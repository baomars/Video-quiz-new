import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { ComponentStyle, AnswerLayout, OptionKey } from '../types/index';
import { getEntranceTransform } from '../animations/index';

interface AnswerCardsProps {
  style: ComponentStyle & {
    gap?: number;
    optionBadgeShape?: 'circle' | 'square' | 'pill';
  };
  layoutMode: AnswerLayout;
  options: { A: string; B: string; C: string };
  correctAnswer: OptionKey;
  isRevealed: boolean;
  revealProgress: number;
  revealStartFrame?: number;
  primaryColor?: string;
  correctColor?: string;
  wrongColor?: string;
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

export const AnswerCards: React.FC<AnswerCardsProps> = ({
  style,
  layoutMode,
  options,
  correctAnswer,
  isRevealed,
  revealProgress,
  primaryColor = '#2563eb',
  correctColor = '#16a34a',
  wrongColor = '#dc2626',
  delayFrame = 0,
  revealStartFrame,
  contentOpacity = 1.0
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const keys: OptionKey[] = ['A', 'B', 'C'];
  const gap = style.gap ?? 12;

  // Pulse animation for correct answer strictly once revealed
  const revealFrame = isRevealed && revealStartFrame !== undefined ? Math.max(0, frame - revealStartFrame) : 0;
  const correctPulse = spring({
    frame: revealFrame,
    fps,
    config: { damping: 12, stiffness: 140 }
  });

  const textAlign = style.textAlign || 'left';
  const horizontalAlign = style.horizontalAlign || 'center';

  const width = style.width ?? 88;
  const height = style.height ?? 20;
  const leftPos = style.x !== undefined
    ? `${style.x}%`
    : horizontalAlign === 'center'
    ? `${(100 - width) / 2}%`
    : horizontalAlign === 'right'
    ? `${100 - width - 6}%`
    : '6%';
  const topPos = style.y !== undefined ? `${style.y}%` : '63%';

  // Styling presets
  const blurPx = style.backdropBlur !== undefined ? style.backdropBlur : 12;
  const borderWidth = style.borderWidth !== undefined ? style.borderWidth : 2;
  const defaultBorderColor = style.borderColor || `${primaryColor}66` || '#38bdf8';
  const strokeWidth = style.textStrokeWidth ?? 0;
  const strokeColor = style.textStrokeColor || 'rgba(0,0,0,0.85)';

  return (
    <div
      style={{
        position: 'absolute',
        left: leftPos,
        top: topPos,
        width: `${width}%`,
        height: `${height}%`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: `${gap}px`,
        zIndex: 10,
        boxSizing: 'border-box'
      }}
    >
      {keys.map((key, index) => {
        const isCorrect = key === correctAnswer;
        const staggerDelay = delayFrame >= 0 ? delayFrame + index * 4 : 0;
        const entrance = delayFrame >= 0
          ? getEntranceTransform(style.animation || 'slide-up', frame, fps, staggerDelay)
          : { opacity: 1, transform: 'none' };

        // Default styling
        let bgColor = parseBgColor(
          style.backgroundColor || '#ffffff',
          style.bgOpacity !== undefined ? style.bgOpacity : 0.88
        );
        let borderColor = defaultBorderColor;
        let textColor = style.textColor || style.color || '#0f172a';
        let cardOpacity = 1.0;
        let cardScale = 1.0;
        let boxShadow = style.boxShadow || '0 4px 20px rgba(0, 0, 0, 0.15)';

        if (style.glowRadius && style.glowRadius > 0) {
          boxShadow = `0 0 ${style.glowRadius}px ${style.glowColor || 'rgba(56, 189, 248, 0.4)'}, ${boxShadow}`;
        }

        if (isRevealed) {
          if (isCorrect) {
            bgColor = 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)';
            borderColor = '#4ade80';
            textColor = '#ffffff';
            boxShadow = `0 0 30px rgba(34, 197, 94, 0.85), 0 0 60px rgba(34, 197, 94, 0.35), 0 8px 24px rgba(0,0,0,0.3)`;
            cardScale = interpolate(correctPulse, [0, 1], [1.0, 1.04]);
          } else {
            cardOpacity = 0.35;
          }
        }

        const opacityVal = style.bgOpacity !== undefined ? style.bgOpacity : 0.88;
        const shouldCardBlur = blurPx > 0 && opacityVal < 0.92 && !(isRevealed && isCorrect);
        const badgeShape = style.optionBadgeShape || 'circle';
        const badgeRadius = badgeShape === 'circle' ? '50%' : badgeShape === 'pill' ? '12px' : '8px';

        return (
          <div
            key={key}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              padding: `${style.padding || 12}px 18px`,
              background: bgColor,
              border: `${borderWidth}px solid ${borderColor}`,
              borderRadius: `${style.borderRadius ?? 16}px`,
              boxShadow,
              backdropFilter: shouldCardBlur ? `blur(${blurPx}px)` : undefined,
              WebkitBackdropFilter: shouldCardBlur ? `blur(${blurPx}px)` : undefined,
              opacity: cardOpacity * (entrance.opacity !== undefined ? Number(entrance.opacity) : 1.0),
              transform: `${entrance.transform !== 'none' ? entrance.transform : ''} scale(${cardScale})`.trim(),
              boxSizing: 'border-box',
              overflow: 'hidden'
            }}
          >
            {/* Option Letter Badge */}
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: badgeRadius,
                backgroundColor: isRevealed && isCorrect ? '#ffffff' : `${primaryColor}22`,
                color: isRevealed && isCorrect ? '#15803d' : (primaryColor || '#38bdf8'),
                border: isRevealed && isCorrect ? '2px solid #ffffff' : `1.5px solid ${primaryColor || '#38bdf8'}66`,
                boxShadow: isRevealed && isCorrect ? '0 0 15px rgba(255,255,255,0.8)' : undefined,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: style.fontFamily || 'Be Vietnam Pro, sans-serif',
                fontSize: `${(style.fontSize || 22) - 2}px`,
                fontWeight: '900',
                marginRight: '14px',
                flexShrink: 0,
                opacity: contentOpacity
              }}
            >
              {isRevealed && isCorrect ? '✓' : key}
            </div>

            {/* Option Text */}
            <div
              style={{
                fontFamily: style.fontFamily || 'Be Vietnam Pro, sans-serif',
                fontSize: `${style.fontSize || 22}px`,
                fontWeight: style.fontWeight || '700',
                color: textColor,
                WebkitTextStroke: strokeWidth > 0 ? `${strokeWidth}px ${strokeColor}` : undefined,
                textShadow: style.textShadow || (strokeWidth > 0 ? undefined : (isRevealed && isCorrect ? '0 2px 8px rgba(0,0,0,0.4)' : '0 1px 4px rgba(0,0,0,0.1)')),
                textAlign: textAlign,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: 1.3,
                width: '100%',
                opacity: contentOpacity
              }}
            >
              {options[key] || ''}
            </div>
          </div>
        );
      })}
    </div>
  );
};
