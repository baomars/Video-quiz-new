import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { ComponentStyle, BackgroundMotionConfig, TimelineQuestionCue, MotionEffect, NeonPresetId } from '../types/index';
import { resolveMedia } from '../utils/media';
import { NeonBackground } from './NeonBackground';

interface BackgroundLayerProps {
  style: ComponentStyle & {
    type?: 'solid' | 'gradient' | 'mesh' | 'pattern' | 'image' | 'neon';
    gradientAngle?: number;
    secondaryColor?: string;
    imageUrl?: string;
    overlayColor?: string;
    overlayOpacity?: number;
    motion?: BackgroundMotionConfig;
    neonPresetId?: NeonPresetId;
    neonSpeed?: number;
    neonIntensity?: number;
    neonColor1?: string;
    neonColor2?: string;
    neonColor3?: string;
    gradient?: string;
  };
  primaryColor?: string;
  cues?: TimelineQuestionCue[];
  totalDurationFrames?: number;
}

// 1. HIGH-PERFORMANCE ZERO-CHURN STATIC BACKGROUND (NO useCurrentFrame)
const StaticBackground = React.memo(({
  imageUrl,
  overlayColor,
  overlayOpacity
}: {
  imageUrl?: string;
  overlayColor?: string;
  overlayOpacity?: number;
}) => {
  if (!imageUrl) return null;
  return (
    <>
      <img
        src={resolveMedia(imageUrl)}
        alt="Video Background"
        loading="eager"
        decoding="async"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block'
        }}
      />
      {overlayOpacity && overlayOpacity > 0 ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: overlayColor || '#000000',
            opacity: overlayOpacity,
            pointerEvents: 'none'
          }}
        />
      ) : null}
    </>
  );
});

export const BackgroundLayer: React.FC<BackgroundLayerProps> = React.memo(({
  style,
  primaryColor = '#38bdf8',
  cues = [],
  totalDurationFrames = 600
}) => {
  const bgType = style.type || 'gradient';
  const mainColor = style.backgroundColor || '#ffffff';
  const secColor = style.secondaryColor || '#eff6ff';
  const angle = style.gradientAngle ?? 180;

  const motion = style.motion || {};
  const motionEnabled = motion.enabled === true;
  const activeEffects: MotionEffect[] = (motion.effects && motion.effects.length > 0)
    ? motion.effects
    : (motion.direction && motion.direction !== 'none' ? [motion.direction as MotionEffect] : []);
  const isMotionActive = motionEnabled && activeEffects.length > 0;

  let bgStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
    overflow: 'hidden'
  };

  if (bgType === 'solid') {
    bgStyle.backgroundColor = mainColor;
  } else if (bgType === 'gradient') {
    bgStyle.background = style.gradient || `linear-gradient(${angle}deg, ${mainColor} 0%, ${secColor} 100%)`;
  } else if (bgType === 'mesh') {
    bgStyle.backgroundColor = mainColor;
    bgStyle.backgroundImage = `
      radial-gradient(at 0% 0%, ${secColor} 0px, transparent 50%),
      radial-gradient(at 100% 100%, ${primaryColor}33 0px, transparent 50%),
      radial-gradient(at 50% 50%, ${mainColor} 0px, transparent 80%)
    `;
  } else if (bgType === 'pattern') {
    bgStyle.backgroundColor = mainColor;
    bgStyle.backgroundImage = `radial-gradient(rgba(0, 0, 0, 0.05) 1.5px, transparent 1.5px)`;
    bgStyle.backgroundSize = '24px 24px';
  } else if (bgType === 'neon') {
    bgStyle.backgroundColor = '#030014';
  } else {
    bgStyle.backgroundColor = mainColor;
  }

  // FAST PATH: Static image background bypasses useCurrentFrame entirely
  if (bgType === 'image' && !isMotionActive) {
    return (
      <div style={bgStyle}>
        <StaticBackground
          imageUrl={style.imageUrl}
          overlayColor={style.overlayColor}
          overlayOpacity={style.overlayOpacity ?? 0.15}
        />
      </div>
    );
  }

  // MOTION / NEON PATH (Requires current frame calculations)
  return (
    <ActiveMotionBackground
      bgStyle={bgStyle}
      style={style}
      cues={cues}
      totalDurationFrames={totalDurationFrames}
      activeEffects={activeEffects}
      motion={motion}
    />
  );
});

// Component for dynamic/animated backgrounds
const ActiveMotionBackground: React.FC<{
  bgStyle: React.CSSProperties;
  style: any;
  cues: TimelineQuestionCue[];
  totalDurationFrames: number;
  activeEffects: MotionEffect[];
  motion: BackgroundMotionConfig;
}> = ({ bgStyle, style, cues, totalDurationFrames, activeEffects, motion }) => {
  const frame = useCurrentFrame();
  const bgType = style.type || 'gradient';

  const activeCue = (cues && cues.length > 0)
    ? cues.find(c => frame >= c.startFrame && frame < c.endFrame) || cues[cues.length - 1]
    : null;

  const cueStart = activeCue ? activeCue.startFrame : 0;
  const cueDuration = activeCue ? Math.max(1, activeCue.durationFrames) : (totalDurationFrames || 300);
  const relFrame = Math.max(0, Math.min(cueDuration, frame - cueStart));
  const progress = relFrame / cueDuration;

  const baseScale = motion.aiWatermarkZoom !== false ? 1.20 : 1.0;
  const intensity = motion.intensity ?? 20;
  const zoomMultiplier = motion.zoomScale ?? (motion.zoomEnd ? motion.zoomEnd / (motion.zoomStart || 1) : 1.15);
  const speed = motion.speed ?? 1.0;

  let extraZoom = 1.0;
  let panX = 0;
  let panY = 0;

  if (activeEffects.includes('zoom-in')) {
    extraZoom *= interpolate(progress, [0, 1], [1.0, zoomMultiplier]);
  }
  if (activeEffects.includes('zoom-out')) {
    extraZoom *= interpolate(progress, [0, 1], [zoomMultiplier, 1.0]);
  }
  if (activeEffects.includes('pan-left')) {
    panX += interpolate(progress, [0, 1], [intensity, -intensity]);
  }
  if (activeEffects.includes('pan-right')) {
    panX += interpolate(progress, [0, 1], [-intensity, intensity]);
  }
  if (activeEffects.includes('pan-up')) {
    panY += interpolate(progress, [0, 1], [intensity, -intensity]);
  }
  if (activeEffects.includes('pan-down')) {
    panY += interpolate(progress, [0, 1], [-intensity, intensity]);
  }
  if (activeEffects.includes('random-motion')) {
    const harmonicPhase = frame * speed * 0.04;
    panX += Math.sin(harmonicPhase) * (intensity * 0.7) + Math.cos(harmonicPhase * 0.53) * (intensity * 0.3);
    panY += Math.cos(harmonicPhase * 0.85) * (intensity * 0.7) + Math.sin(harmonicPhase * 0.41) * (intensity * 0.3);
  }

  const totalScale = baseScale * extraZoom;
  const safeMarginX = (720 * (totalScale - 1)) / 2;
  const safeMarginY = (1280 * (totalScale - 1)) / 2;
  const maxAllowedPanX = Math.max(8, safeMarginX * 0.5);
  const maxAllowedPanY = Math.max(8, safeMarginY * 0.5);

  const clampedX = Math.max(-maxAllowedPanX, Math.min(maxAllowedPanX, panX));
  const clampedY = Math.max(-maxAllowedPanY, Math.min(maxAllowedPanY, panY));

  return (
    <div style={bgStyle}>
      {bgType === 'neon' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: style.opacity ?? style.motion?.opacity ?? 1,
            filter: (style.blur || style.motion?.blur) ? `blur(${style.blur || style.motion?.blur}px)` : undefined,
            transform: (style.motion?.zoomScale && style.motion.zoomScale > 1) ? `scale(${style.motion.zoomScale})` : undefined,
            transformOrigin: 'center center'
          }}
        >
          <NeonBackground
            presetId={style.neonPresetId || 'neon-gradient'}
            speed={style.neonSpeed ?? style.motion?.speed ?? 1.0}
            intensity={style.neonIntensity ?? 1.0}
            color1={style.neonColor1 ?? style.motion?.color1}
            color2={style.neonColor2 ?? style.motion?.color2}
            color3={style.neonColor3 ?? style.motion?.color3}
            direction={style.motion?.direction}
            movement={style.motion?.movement}
          />
        </div>
      )}

      {bgType === 'image' && style.imageUrl && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            transform: `translate3d(${clampedX.toFixed(2)}px, ${clampedY.toFixed(2)}px, 0px) scale(${totalScale.toFixed(4)})`,
            transformOrigin: 'center center',
            willChange: 'transform'
          }}
        >
          <img
            src={resolveMedia(style.imageUrl)}
            alt="Video Background"
            loading="eager"
            decoding="async"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
          />
        </div>
      )}

      {(bgType === 'image' || (bgType === 'neon' && style.overlayOpacity && style.overlayOpacity > 0)) && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: style.overlayColor || '#000000',
            opacity: style.overlayOpacity ?? 0.15,
            pointerEvents: 'none'
          }}
        />
      )}
    </div>
  );
};
