import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { ComponentStyle, AnswerLayout, OptionKey, AnswerButtonsConfig } from '../types/index.js';
import { getEntranceTransform } from '../animations/index.js';
import { resolveOptionLayout } from '../utils/answerLayoutHelper.js';

interface AnswerCardsProps {
  style: AnswerButtonsConfig;
  layoutMode: AnswerLayout;
  options: { A: string; B: string; C: string; D?: string };
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

export const AnswerCards: React.FC<AnswerCardsProps> = React.memo(({
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

  const availableKeys = (Object.keys(options || {}) as OptionKey[])
    .filter(k => options[k] !== undefined && options[k] !== '')
    .sort();
  const keys: OptionKey[] = availableKeys.length > 0 ? availableKeys : ['A', 'B', 'C'];

  // Pulse animation for correct answer strictly once revealed
  const revealFrame = isRevealed && revealStartFrame !== undefined ? Math.max(0, frame - revealStartFrame) : 0;
  const correctPulse = spring({
    frame: revealFrame,
    fps,
    config: { damping: 12, stiffness: 140 }
  });

  const normalizedCorrect = (correctAnswer || 'A').toString().trim().toUpperCase().slice(0, 1) as OptionKey;
  const blurPx = style.backdropBlur !== undefined ? style.backdropBlur : (style.glassmorphism ? 12 : 0);
  const strokeWidth = style.textStrokeWidth ?? 0;
  const strokeColor = style.textStrokeColor || 'rgba(0,0,0,0.85)';

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
        boxSizing: 'border-box'
      }}
    >
      {keys.map((key, index) => {
        const layout = resolveOptionLayout(key, index, keys.length, style, primaryColor);
        const isCorrect = key === normalizedCorrect;
        const staggerDelay = delayFrame >= 0 ? delayFrame + index * 4 : 0;
        const entrance = delayFrame >= 0
          ? getEntranceTransform(style.animation || 'slide-up', frame, fps, staggerDelay)
          : { opacity: 1, transform: 'none' };

        // Default styling from resolved layout
        let bgColor = parseBgColor(layout.backgroundColor, layout.bgOpacity);
        let borderColor = layout.borderColor || `${primaryColor}66`;
        let textColor = layout.textColor;
        let cardOpacity = 1.0;
        let cardScale = 1.0;
        let boxShadow = layout.boxShadow || '0 4px 20px rgba(0, 0, 0, 0.15)';

        if (layout.glowRadius && layout.glowRadius > 0) {
          boxShadow = `0 0 ${layout.glowRadius}px ${layout.glowColor || 'rgba(56, 189, 248, 0.4)'}, ${boxShadow}`;
        }

        let computedBorderRadius = `${layout.borderRadius}px`;
        let computedClipPath: string | undefined = undefined;
        let effectiveBoxShadow = boxShadow;

        switch (layout.shape) {
          case 'rectangle':
            computedBorderRadius = '0px';
            break;
          case 'circle':
          case 'ellipse':
            computedBorderRadius = '50%';
            break;
          case 'hexagon':
            computedClipPath = 'polygon(15% 0%, 85% 0%, 100% 50%, 85% 100%, 15% 100%, 0% 50%)';
            computedBorderRadius = '2px';
            break;
          case 'diamond':
            computedClipPath = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
            computedBorderRadius = '0px';
            break;
          case 'hud': {
            const chamfer = layout.chamferSize || 12;
            computedClipPath = `polygon(${chamfer}px 0%, calc(100% - ${chamfer}px) 0%, 100% ${chamfer}px, 100% calc(100% - ${chamfer}px), calc(100% - ${chamfer}px) 100%, ${chamfer}px 100%, 0% calc(100% - ${chamfer}px), 0% ${chamfer}px)`;
            computedBorderRadius = '4px';
            break;
          }
          case 'blob':
            computedBorderRadius = '42% 58% 70% 30% / 45% 45% 55% 55%';
            break;
          case 'ticket':
            computedClipPath = 'polygon(0% 0%, 100% 0%, 100% calc(50% - 12px), calc(100% - 12px) 50%, 100% calc(50% + 12px), 100% 100%, 0% 100%, 0% calc(50% + 12px), 12px 50%, 0% calc(50% - 12px))';
            break;
          case 'badge':
            computedClipPath = 'polygon(12% 0%, 88% 0%, 100% 12%, 100% 88%, 88% 100%, 12% 100%, 0% 88%, 0% 12%)';
            break;
          case 'bubble':
            computedBorderRadius = '30px 12px 30px 12px';
            break;
          case 'speech-bubble':
            computedBorderRadius = '24px 24px 24px 6px';
            break;
          case 'capsule':
          case 'pill':
            computedBorderRadius = '9999px';
            break;
          case 'minimal':
            effectiveBoxShadow = 'none';
            break;
          case 'color-block':
          case 'rounded':
          default:
            computedBorderRadius = `${layout.borderRadius}px`;
            break;
        }

        if (layout.popShadow) {
          effectiveBoxShadow = `${layout.popShadowOffset}px ${layout.popShadowOffset}px 0px ${layout.popShadowColor}`;
        }

        // Reveal State
        if (isRevealed) {
          if (isCorrect) {
            if (layout.shape === 'doodle' && layout.markerHighlight) {
              bgColor = 'linear-gradient(90deg, #fef08a 0%, #fde047 100%)';
              borderColor = '#ca8a04';
              textColor = '#78350f';
              effectiveBoxShadow = '0 0 20px rgba(250, 204, 21, 0.6)';
            } else {
              bgColor = 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)';
              borderColor = '#4ade80';
              textColor = '#ffffff';
              effectiveBoxShadow = `0 0 30px rgba(34, 197, 94, 0.85), 0 0 60px rgba(34, 197, 94, 0.35), 0 8px 24px rgba(0,0,0,0.3)`;
            }
            cardScale = interpolate(correctPulse, [0, 1], [1.0, 1.04]);
          } else {
            cardOpacity = style.dimWrongAnswers !== false ? (style.wrongAnswerOpacity ?? 0.35) : 1.0;
          }
        }

        // Option badge shape styling
        const badgeShape = layout.labelShape || 'circle';
        let badgeRadius = '50%';
        let badgeClipPath: string | undefined = undefined;
        if (badgeShape === 'square') {
          badgeRadius = '8px';
        } else if (badgeShape === 'pill') {
          badgeRadius = '12px';
        } else if (badgeShape === 'hexagon') {
          badgeClipPath = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';
          badgeRadius = '0px';
        } else if (badgeShape === 'diamond') {
          badgeClipPath = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
          badgeRadius = '0px';
        } else if (badgeShape === 'badge') {
          badgeClipPath = 'polygon(15% 0%, 85% 0%, 100% 15%, 100% 85%, 85% 100%, 15% 100%, 0% 85%, 0% 15%)';
          badgeRadius = '0px';
        }

        const badgeBg = isRevealed && isCorrect
          ? '#ffffff'
          : (layout.labelBgColor || `${primaryColor}22`);
        const badgeColor = isRevealed && isCorrect
          ? '#15803d'
          : (layout.labelColor || primaryColor || '#38bdf8');
        const badgeSize = layout.labelSize || 42;

        const rotationStr = layout.rotation ? `rotate(${layout.rotation}deg)` : '';
        const transformStr = `${entrance.transform !== 'none' ? entrance.transform : ''} ${rotationStr} scale(${cardScale})`.trim();

        return (
          <div
            key={key}
            style={{
              position: 'absolute',
              left: `${layout.x}%`,
              top: `${layout.y}%`,
              width: `${layout.width}%`,
              height: `${layout.height}%`,
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              padding: `${style.padding || 12}px 18px`,
              background: bgColor,
              border: `${layout.borderWidth}px ${layout.borderStyle || 'solid'} ${borderColor}`,
              borderRadius: computedBorderRadius,
              clipPath: computedClipPath,
              boxShadow: effectiveBoxShadow,
              backdropFilter: blurPx > 0 ? `blur(${blurPx}px)` : undefined,
              opacity: cardOpacity * (entrance.opacity !== undefined ? Number(entrance.opacity) : 1.0),
              transform: transformStr || 'none',
              boxSizing: 'border-box',
              overflow: 'hidden'
            }}
          >
            {/* Option Letter Badge */}
            <div
              style={{
                width: `${badgeSize}px`,
                height: `${badgeSize}px`,
                borderRadius: badgeRadius,
                clipPath: badgeClipPath,
                backgroundColor: badgeBg,
                color: badgeColor,
                border: isRevealed && isCorrect ? '2px solid #ffffff' : `1.5px solid ${badgeColor}66`,
                boxShadow: isRevealed && isCorrect ? '0 0 15px rgba(255,255,255,0.8)' : undefined,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: layout.fontFamily,
                fontSize: `${layout.fontSize - 2}px`,
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
                fontFamily: layout.fontFamily,
                fontSize: `${layout.fontSize}px`,
                fontWeight: layout.fontWeight,
                color: textColor,
                WebkitTextStroke: strokeWidth > 0 ? `${strokeWidth}px ${strokeColor}` : undefined,
                textShadow: (layout.textShadow && layout.textShadow !== 'none') ? layout.textShadow : undefined,
                textAlign: style.textAlign || 'left',
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
});
