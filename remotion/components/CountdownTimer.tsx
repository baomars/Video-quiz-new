import React from 'react';
import { useCurrentFrame } from 'remotion';
import { ComponentStyle, CountdownStyle } from '../types/index';

interface CountdownTimerProps {
  style: ComponentStyle & {
    strokeWidth?: number;
    showSeconds?: boolean;
    showIcon?: boolean;
    iconSize?: number;
    hideBox?: boolean;
    show?: boolean;
    enabled?: boolean;
    horizontalAlign?: 'left' | 'center' | 'right';
    verticalAlign?: 'top' | 'center' | 'bottom';
  };
  countdownStyle: CountdownStyle;
  countdownStartFrame: number;
  countdownEndFrame: number;
  primaryColor?: string;
  warningColor?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  style,
  countdownStyle = 'clean-text',
  countdownStartFrame,
  countdownEndFrame,
  primaryColor = '#2563eb',
  warningColor = '#dc2626'
}) => {
  const frame = useCurrentFrame();

  // STRICT AUTO-HIDE: Countdown must NEVER be rendered before start or after finish
  if (frame < countdownStartFrame || frame >= countdownEndFrame) {
    return null;
  }

  // Explicit show/hide or enabled toggle
  if (style.show === false || style.enabled === false) {
    return null;
  }

  const totalFrames = Math.max(1, countdownEndFrame - countdownStartFrame);
  const elapsed = Math.max(0, Math.min(totalFrames, frame - countdownStartFrame));
  const remainingFraction = Math.max(0, Math.min(1, 1 - elapsed / totalFrames));

  // Remaining seconds: counts down accurately (e.g. 5, 4, 3, 2, 1)
  const remainingFrames = Math.max(0, countdownEndFrame - frame);
  const remainingSec = Math.max(1, Math.ceil(remainingFrames / 30));
  const isUrgent = remainingSec <= 2;
  const activeColor = isUrgent ? warningColor : (style.color || primaryColor);

  const hAlign = style.horizontalAlign || (style.x === undefined ? 'center' : (style.x > 60 ? 'right' : (style.x < 30 ? 'left' : 'center')));
  const vAlign = style.verticalAlign || (style.y === undefined ? 'center' : (style.y > 60 ? 'bottom' : (style.y < 30 ? 'top' : 'center')));

  const width = style.width ?? 30;
  const height = style.height ?? 6;

  // Symmetric Horizontal Alignment
  let leftPos: string;
  let transformX = '';
  if (hAlign === 'center') {
    leftPos = style.x !== undefined ? `${style.x}%` : '50%';
    transformX = 'translateX(-50%)';
  } else if (hAlign === 'right') {
    leftPos = style.x !== undefined ? `${style.x}%` : `${100 - width - 6}%`;
  } else {
    leftPos = style.x !== undefined ? `${style.x}%` : '6%';
  }

  // Symmetric Vertical Alignment
  let topPos: string;
  let transformY = '';
  if (vAlign === 'center') {
    topPos = style.y !== undefined ? `${style.y}%` : '50%';
    transformY = 'translateY(-50%)';
  } else if (vAlign === 'bottom') {
    topPos = style.y !== undefined ? `${style.y}%` : `${100 - height - 10}%`;
  } else {
    topPos = style.y !== undefined ? `${style.y}%` : '10%';
  }

  const transform = [transformX, transformY].filter(Boolean).join(' ') || undefined;

  const justifyAlign = hAlign === 'left'
    ? 'flex-start'
    : hAlign === 'right'
    ? 'flex-end'
    : 'center';

  const showIcon = style.showIcon !== false;
  const fontSize = style.fontSize || 32;
  const iconSize = style.iconSize || Math.round(fontSize * 0.95);
  const opacity = style.opacity ?? 1.0;

  // 1. Circle Radial Style
  if (
    countdownStyle === 'circle-radial' ||
    countdownStyle === 'bar-horizontal' ||
    (countdownStyle as any) === 'circle' ||
    (countdownStyle as any) === 'bar'
  ) {
    const isLegacyWide = (style.width || 0) > 40;
    const size = isLegacyWide ? 84 : Math.max(64, Math.min(width * 7.2, 110));
    const strokeW = style.strokeWidth || 6;
    const radius = size / 2 - strokeW;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - remainingFraction);

    return (
      <div
        style={{
          position: 'absolute',
          left: leftPos,
          top: topPos,
          transform,
          width: isLegacyWide ? `${size}px` : `${width}%`,
          height: isLegacyWide ? `${size}px` : `${height}%`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: justifyAlign,
          opacity,
          zIndex: 15
        }}
      >
        <div style={{ position: 'relative', width: `${size}px`, height: `${size}px` }}>
          <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            {/* Background track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="rgba(255, 255, 255, 0.95)"
              stroke="#e2e8f0"
              strokeWidth={strokeW}
            />
            {/* Animated progress circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={activeColor}
              strokeWidth={strokeW}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: style.fontFamily || 'Be Vietnam Pro, sans-serif',
              fontSize: `${fontSize}px`,
              fontWeight: style.fontWeight || '900',
              color: activeColor
            }}
          >
            {remainingSec}
          </div>
        </div>
      </div>
    );
  }

  // 2. Pill Timer / Badge (Capsule with icon + remaining seconds)
  if (countdownStyle === 'pill-timer' || countdownStyle === 'badge') {
    return (
      <div
        style={{
          position: 'absolute',
          left: leftPos,
          top: topPos,
          transform,
          width: `${width}%`,
          height: `${height}%`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: justifyAlign,
          opacity,
          zIndex: 15
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 18px',
            backgroundColor: style.backgroundColor || 'rgba(255, 255, 255, 0.95)',
            borderRadius: `${style.borderRadius ?? 24}px`,
            border: `${style.borderWidth ?? 2}px solid ${style.borderColor || activeColor}`,
            boxShadow: style.boxShadow || '0 4px 16px rgba(0, 0, 0, 0.08)'
          }}
        >
          {showIcon && (
            <span style={{ fontSize: `${iconSize}px`, lineHeight: 1, display: 'inline-flex', alignItems: 'center' }}>
              ⏱️
            </span>
          )}
          <span
            style={{
              fontFamily: style.fontFamily || 'Be Vietnam Pro, sans-serif',
              fontSize: `${fontSize}px`,
              fontWeight: style.fontWeight || '800',
              color: activeColor,
              lineHeight: 1
            }}
          >
            {remainingSec}s
          </span>
        </div>
      </div>
    );
  }

  // 3. Clean Text / Direct Icon + Number
  return (
    <div
      style={{
        position: 'absolute',
        left: leftPos,
        top: topPos,
        transform,
        width: `${width}%`,
        height: `${height}%`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: justifyAlign,
        gap: '8px',
        opacity,
        zIndex: 15,
        pointerEvents: 'none'
      }}
    >
      {showIcon && (
        <span
          style={{
            fontSize: `${iconSize}px`,
            lineHeight: 1,
            display: 'inline-flex',
            alignItems: 'center'
          }}
        >
          ⏱️
        </span>
      )}
      <span
        style={{
          fontFamily: style.fontFamily || 'Be Vietnam Pro, sans-serif',
          fontSize: `${fontSize}px`,
          fontWeight: style.fontWeight || '800',
          color: activeColor,
          lineHeight: 1,
          letterSpacing: '-0.02em',
          textShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}
      >
        {remainingSec}s
      </span>
    </div>
  );
};
