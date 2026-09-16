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

  const totalFrames = Math.max(1, countdownEndFrame - countdownStartFrame);
  const elapsed = Math.max(0, Math.min(totalFrames, frame - countdownStartFrame));
  const remainingFraction = Math.max(0, Math.min(1, 1 - elapsed / totalFrames));

  // Remaining seconds: counts down accurately (e.g. 5, 4, 3, 2, 1)
  const remainingFrames = Math.max(0, countdownEndFrame - frame);
  const remainingSec = Math.max(1, Math.ceil(remainingFrames / 30));
  const isUrgent = remainingSec <= 2;
  const activeColor = isUrgent ? warningColor : (style.color || primaryColor);

  // Horizontal Alignment
  const width = style.width ?? 30;
  const leftPos = style.x !== undefined
    ? `${style.x}%`
    : style.horizontalAlign === 'center'
    ? `${(100 - width) / 2}%`
    : style.horizontalAlign === 'right'
    ? `${100 - width - 6}%`
    : '6%';

  const justifyAlign = style.horizontalAlign === 'left'
    ? 'flex-start'
    : style.horizontalAlign === 'right'
    ? 'flex-end'
    : 'center';

  const showIcon = style.showIcon !== false;
  const fontSize = style.fontSize || 32;
  const iconSize = style.iconSize || Math.round(fontSize * 0.95);

  // 1. Circle Radial Style (Default for circle, radial, and legacy bar-horizontal to prevent any progress bar)
  if (
    countdownStyle === 'circle-radial' ||
    countdownStyle === 'bar-horizontal' ||
    (countdownStyle as any) === 'circle' ||
    (countdownStyle as any) === 'bar'
  ) {
    // If old template set width: 86 for horizontal bar, ensure circular timer has proper compact dimensions
    const isLegacyWide = (style.width || 0) > 40;
    const size = isLegacyWide ? 84 : Math.max(64, Math.min(style.width * 7.2, 110));
    const strokeW = style.strokeWidth || 6;
    const radius = size / 2 - strokeW;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - remainingFraction);

    return (
      <div
        style={{
          position: 'absolute',
          left: isLegacyWide ? '50%' : leftPos,
          transform: isLegacyWide ? 'translateX(-50%)' : undefined,
          top: `${style.y}%`,
          width: isLegacyWide ? `${size}px` : `${style.width}%`,
          height: isLegacyWide ? `${size}px` : `${style.height}%`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isLegacyWide ? 'center' : justifyAlign,
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
            {/* Animated progress circle - Pure Remotion frame sync, NO CSS transition */}
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

  // 3. Pill Timer (Subtle capsule badge - NO box around icon)
  if (countdownStyle === 'pill-timer') {
    return (
      <div
        style={{
          position: 'absolute',
          left: leftPos,
          top: `${style.y}%`,
          width: `${style.width}%`,
          height: `${style.height}%`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: justifyAlign,
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
            border: `2px solid ${activeColor}`,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
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

  // 4. Clean Text / Direct Icon + Number (Default - Clean, no surrounding box)
  return (
    <div
      style={{
        position: 'absolute',
        left: leftPos,
        top: `${style.y}%`,
        width: `${style.width}%`,
        height: `${style.height}%`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: justifyAlign,
        gap: '8px',
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
