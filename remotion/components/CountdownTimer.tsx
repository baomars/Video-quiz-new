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
    progressColor?: string;
    showProgressBar?: boolean;
    showBackground?: boolean;
    showBorder?: boolean;
    thickness?: number;
    segmentCount?: number;
    dotCount?: number;
  };
  countdownStyle: CountdownStyle;
  countdownStartFrame: number;
  countdownEndFrame: number;
  primaryColor?: string;
  warningColor?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  style,
  countdownStyle = 'circular-progress',
  countdownStartFrame,
  countdownEndFrame,
  primaryColor = '#2563eb',
  warningColor = '#ef4444'
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

  // Remaining seconds (5, 4, 3, 2, 1)
  const remainingFrames = Math.max(0, countdownEndFrame - frame);
  const remainingSec = Math.max(1, Math.ceil(remainingFrames / 30));
  const isUrgent = remainingSec <= 2;
  const activeColor = isUrgent ? warningColor : (style.color || primaryColor);
  const progressColor = style.progressColor || activeColor;

  const hAlign = style.horizontalAlign || (style.x === undefined ? 'center' : (style.x > 60 ? 'right' : (style.x < 30 ? 'left' : 'center')));
  const vAlign = style.verticalAlign || (style.y === undefined ? 'center' : (style.y > 60 ? 'bottom' : (style.y < 30 ? 'top' : 'center')));

  const width = style.width ?? 32;
  const height = style.height ?? 8;

  // Symmetric Alignment
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

  const justifyAlign = hAlign === 'left' ? 'flex-start' : hAlign === 'right' ? 'flex-end' : 'center';

  const showSeconds = style.showSeconds !== false;
  const showProgressBar = style.showProgressBar !== false;
  const showBackground = style.showBackground !== false;
  const showBorder = style.showBorder !== false;
  const fontSize = style.fontSize || 38;
  const fontFamily = style.fontFamily || 'Montserrat, sans-serif';
  const fontWeight = style.fontWeight || '900';
  const opacity = style.opacity ?? 1.0;
  const strokeW = style.strokeWidth || style.thickness || 6;

  // Normalize style identifier
  const normStyle: CountdownStyle = (
    countdownStyle === 'circle-radial' || (countdownStyle as any) === 'circle' ? 'circular-progress' :
    countdownStyle === 'bar-horizontal' || countdownStyle === 'bar-bottom' || (countdownStyle as any) === 'bar' ? 'horizontal-progress' :
    countdownStyle === 'clean-text' ? 'minimal-number' :
    countdownStyle === 'badge' ? 'pill-timer' :
    countdownStyle
  );

  const containerBase: React.CSSProperties = {
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
    zIndex: 15,
    pointerEvents: 'none',
    boxSizing: 'border-box'
  };

  // 1. CIRCULAR PROGRESS
  if (normStyle === 'circular-progress') {
    const size = Math.max(72, Math.min(width * 8, 120));
    const radius = size / 2 - strokeW - 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - remainingFraction);

    return (
      <div style={containerBase}>
        <div style={{ position: 'relative', width: `${size}px`, height: `${size}px` }}>
          <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            {showBackground && (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill={style.backgroundColor || 'rgba(15, 23, 42, 0.85)'}
                stroke={showBorder ? (style.borderColor || 'rgba(255, 255, 255, 0.15)') : 'none'}
                strokeWidth={1.5}
              />
            )}
            {/* Background track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth={strokeW}
            />
            {/* Animated progress circle */}
            {showProgressBar && (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={progressColor}
                strokeWidth={strokeW}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            )}
          </svg>
          {showSeconds && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily,
                fontSize: `${fontSize}px`,
                fontWeight,
                color: activeColor,
                textShadow: '0 2px 8px rgba(0,0,0,0.5)'
              }}
            >
              {remainingSec}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. RADIAL RING (Arc sweep)
  if (normStyle === 'radial-ring') {
    const size = Math.max(72, Math.min(width * 8, 120));
    const radius = size / 2 - strokeW - 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - remainingFraction);

    return (
      <div style={containerBase}>
        <div style={{ position: 'relative', width: `${size}px`, height: `${size}px` }}>
          <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill={showBackground ? (style.backgroundColor || 'rgba(0, 0, 0, 0.75)') : 'none'}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth={strokeW}
            />
            {showProgressBar && (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={progressColor}
                strokeWidth={strokeW + 2}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="butt"
              />
            )}
          </svg>
          {showSeconds && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily,
                fontSize: `${fontSize}px`,
                fontWeight,
                color: activeColor
              }}
            >
              <span>{remainingSec}</span>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.7, letterSpacing: '1px' }}>sec</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. HORIZONTAL PROGRESS BAR
  if (normStyle === 'horizontal-progress') {
    const barH = style.height ? `${style.height * 8}px` : '14px';
    return (
      <div style={containerBase}>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
          {showSeconds && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily, fontSize: `${fontSize - 6}px`, fontWeight, color: activeColor }}>
              <span>⏱️</span>
              <span>{remainingSec}s</span>
            </div>
          )}
          {showProgressBar && (
            <div
              style={{
                width: '100%',
                height: barH,
                backgroundColor: showBackground ? (style.backgroundColor || 'rgba(15, 23, 42, 0.7)') : 'transparent',
                borderRadius: `${style.borderRadius ?? 9999}px`,
                border: showBorder ? `${style.borderWidth ?? 2}px solid ${style.borderColor || 'rgba(255, 255, 255, 0.2)'}` : 'none',
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${remainingFraction * 100}%`,
                  backgroundColor: progressColor,
                  borderRadius: `${style.borderRadius ?? 9999}px`,
                  transition: 'width 0.1s linear',
                  boxShadow: `0 0 12px ${progressColor}88`
                }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // 4. VERTICAL PROGRESS BAR
  if (normStyle === 'vertical-progress') {
    return (
      <div style={containerBase}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%' }}>
          {showSeconds && (
            <div style={{ fontFamily, fontSize: `${fontSize - 8}px`, fontWeight, color: activeColor }}>
              {remainingSec}s
            </div>
          )}
          {showProgressBar && (
            <div
              style={{
                width: `${strokeW * 3}px`,
                flex: 1,
                minHeight: '80px',
                backgroundColor: showBackground ? (style.backgroundColor || 'rgba(15, 23, 42, 0.7)') : 'transparent',
                borderRadius: `${style.borderRadius ?? 12}px`,
                border: showBorder ? `${style.borderWidth ?? 2}px solid ${style.borderColor || 'rgba(255, 255, 255, 0.2)'}` : 'none',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'flex-end',
                position: 'relative'
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: `${remainingFraction * 100}%`,
                  backgroundColor: progressColor,
                  borderRadius: `${style.borderRadius ?? 12}px`,
                  transition: 'height 0.1s linear',
                  boxShadow: `0 0 12px ${progressColor}88`
                }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // 5. SEGMENTED BAR
  if (normStyle === 'segmented-bar') {
    const totalSegments = style.segmentCount || 8;
    const activeSegments = Math.ceil(remainingFraction * totalSegments);
    return (
      <div style={containerBase}>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          {showSeconds && (
            <div style={{ fontFamily, fontSize: `${fontSize - 6}px`, fontWeight, color: activeColor }}>
              {remainingSec}s
            </div>
          )}
          {showProgressBar && (
            <div style={{ display: 'flex', gap: '4px', width: '100%', height: '14px' }}>
              {Array.from({ length: totalSegments }).map((_, i) => {
                const isActive = i < activeSegments;
                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: '100%',
                      borderRadius: '3px',
                      backgroundColor: isActive ? progressColor : 'rgba(255, 255, 255, 0.12)',
                      boxShadow: isActive ? `0 0 8px ${progressColor}99` : 'none',
                      transition: 'background-color 0.15s ease'
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 6. NEON COUNTDOWN (Glow aura)
  if (normStyle === 'neon-countdown') {
    const size = Math.max(76, Math.min(width * 8, 120));
    const radius = size / 2 - strokeW - 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - remainingFraction);

    return (
      <div style={containerBase}>
        <div
          style={{
            position: 'relative',
            width: `${size}px`,
            height: `${size}px`,
            filter: `drop-shadow(0 0 14px ${progressColor}) drop-shadow(0 0 28px ${progressColor}66)`
          }}
        >
          <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="rgba(5, 5, 20, 0.85)"
              stroke={progressColor}
              strokeWidth={1}
              strokeOpacity={0.4}
            />
            {showProgressBar && (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={progressColor}
                strokeWidth={strokeW}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            )}
          </svg>
          {showSeconds && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily,
                fontSize: `${fontSize}px`,
                fontWeight,
                color: '#ffffff',
                textShadow: `0 0 10px ${progressColor}, 0 0 20px ${progressColor}`
              }}
            >
              {remainingSec}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 7. DIGITAL COUNTDOWN (Electronic LCD display)
  if (normStyle === 'digital-countdown') {
    const formatted = `00:0${remainingSec}`;
    return (
      <div style={containerBase}>
        <div
          style={{
            backgroundColor: showBackground ? (style.backgroundColor || '#0a0a14') : 'transparent',
            border: showBorder ? `${style.borderWidth ?? 2}px solid ${style.borderColor || '#38bdf8'}` : 'none',
            borderRadius: `${style.borderRadius ?? 8}px`,
            padding: '8px 20px',
            boxShadow: '0 0 20px rgba(56, 189, 248, 0.3), inset 0 0 12px rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span style={{ color: '#ef4444', fontSize: '10px', animation: 'pulse 1s infinite' }}>● REC</span>
          <span
            style={{
              fontFamily: 'monospace, "Courier New", sans-serif',
              fontSize: `${fontSize}px`,
              fontWeight: '900',
              color: activeColor,
              letterSpacing: '2px',
              textShadow: `0 0 10px ${activeColor}`
            }}
          >
            {formatted}
          </span>
        </div>
      </div>
    );
  }

  // 8. FLIP TIMER (Split-flap display card)
  if (normStyle === 'flip-timer') {
    return (
      <div style={containerBase}>
        <div
          style={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            backgroundColor: '#1e293b',
            borderRadius: `${style.borderRadius ?? 12}px`,
            border: showBorder ? `${style.borderWidth ?? 2}px solid #334155` : 'none',
            padding: '8px 22px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.1)',
            overflow: 'hidden'
          }}
        >
          {/* Split horizontal dividing seam */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: '50%',
              height: '2px',
              backgroundColor: '#0f172a',
              boxShadow: '0 1px 0 rgba(255, 255, 255, 0.15)'
            }}
          />
          <span
            style={{
              fontFamily,
              fontSize: `${fontSize + 6}px`,
              fontWeight,
              color: activeColor,
              lineHeight: 1.1,
              letterSpacing: '-1px'
            }}
          >
            {remainingSec}
          </span>
        </div>
      </div>
    );
  }

  // 9. MINIMAL NUMBER (Punchy giant typography, no box)
  if (normStyle === 'minimal-number') {
    return (
      <div style={containerBase}>
        <span
          style={{
            fontFamily,
            fontSize: `${fontSize + 16}px`,
            fontWeight,
            color: activeColor,
            lineHeight: 1,
            letterSpacing: '-2px',
            WebkitTextStroke: style.textStrokeEnabled ? `${style.textStrokeWidth || 2}px ${style.textStrokeColor || '#000000'}` : undefined,
            textShadow: style.textShadowEnabled ? `${style.textShadowOffsetX || 0}px ${style.textShadowOffsetY || 3}px ${style.textShadowBlur || 12}px ${style.textShadowColor || 'rgba(0,0,0,0.5)'}` : '0 4px 16px rgba(0,0,0,0.3)',
            transform: isUrgent ? 'scale(1.08)' : 'scale(1.0)',
            transition: 'transform 0.15s ease'
          }}
        >
          {remainingSec}
        </span>
      </div>
    );
  }

  // 10. PILL TIMER (Capsule with badge and progress bar)
  if (normStyle === 'pill-timer') {
    return (
      <div style={containerBase}>
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: showBackground ? (style.backgroundColor || 'rgba(15, 23, 42, 0.92)') : 'transparent',
            borderRadius: `${style.borderRadius ?? 9999}px`,
            border: showBorder ? `${style.borderWidth ?? 2}px solid ${style.borderColor || 'rgba(255, 255, 255, 0.2)'}` : 'none',
            padding: '6px 16px',
            boxShadow: style.boxShadow || '0 6px 20px rgba(0,0,0,0.3)'
          }}
        >
          {showSeconds && (
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: activeColor,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily,
                fontSize: `${fontSize - 12}px`,
                fontWeight,
                flexShrink: 0,
                boxShadow: `0 0 10px ${activeColor}88`
              }}
            >
              {remainingSec}
            </div>
          )}
          {showProgressBar && (
            <div
              style={{
                flex: 1,
                height: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '9999px',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${remainingFraction * 100}%`,
                  backgroundColor: progressColor,
                  borderRadius: '9999px',
                  transition: 'width 0.1s linear'
                }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // 11. DOT COUNTDOWN (Vanishing glowing dots)
  if (normStyle === 'dot-countdown') {
    const totalDots = style.dotCount || 5;
    const activeDots = Math.ceil(remainingFraction * totalDots);
    return (
      <div style={containerBase}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          {showSeconds && (
            <div style={{ fontFamily, fontSize: `${fontSize - 8}px`, fontWeight, color: activeColor }}>
              {remainingSec}s
            </div>
          )}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {Array.from({ length: totalDots }).map((_, i) => {
              const isActive = i < activeDots;
              return (
                <div
                  key={i}
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: isActive ? progressColor : 'rgba(255, 255, 255, 0.15)',
                    boxShadow: isActive ? `0 0 10px ${progressColor}` : 'none',
                    transform: isActive ? 'scale(1)' : 'scale(0.7)',
                    transition: 'all 0.2s ease'
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 12. CORNER HUD (Sci-fi game interface)
  if (normStyle === 'corner-hud') {
    return (
      <div style={containerBase}>
        <div
          style={{
            position: 'relative',
            padding: '8px 20px',
            backgroundColor: showBackground ? (style.backgroundColor || 'rgba(6, 11, 25, 0.85)') : 'transparent',
            clipPath: 'polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)',
            border: showBorder ? `${style.borderWidth ?? 2}px solid ${style.borderColor || '#38bdf8'}` : 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            minWidth: '140px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: '#38bdf8', letterSpacing: '1px' }}>
            <span>HUD TIMER</span>
            <span style={{ fontWeight: 'bold' }}>{remainingSec}S</span>
          </div>
          {showProgressBar && (
            <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(56, 189, 248, 0.2)', position: 'relative' }}>
              <div
                style={{
                  height: '100%',
                  width: `${remainingFraction * 100}%`,
                  backgroundColor: progressColor,
                  boxShadow: `0 0 8px ${progressColor}`
                }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Fallback
  return null;
};
