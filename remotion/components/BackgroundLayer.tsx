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

export const BackgroundLayer: React.FC<BackgroundLayerProps> = ({
  style,
  primaryColor = '#38bdf8',
  cues = [],
  totalDurationFrames = 600
}) => {
  const frame = useCurrentFrame();
  const bgType = style.type || 'gradient';
  const mainColor = style.backgroundColor || '#ffffff';
  const secColor = style.secondaryColor || '#eff6ff';
  const angle = style.gradientAngle ?? 180;

  // Determine active cue so Ken Burns & directional motion cycle seamlessly per question
  const activeCue = (cues && cues.length > 0)
    ? cues.find(c => frame >= c.startFrame && frame < c.endFrame) || cues[cues.length - 1]
    : null;

  // =========================================================================
  // 1. FAST BYPASS FOR STATIC BACKGROUNDS (ZERO PER-FRAME MOTION CHURN)
  // =========================================================================
  const motion = style.motion || {};
  const motionEnabled = motion.enabled === true;
  const activeEffects: MotionEffect[] = (motion.effects && motion.effects.length > 0)
    ? motion.effects
    : (motion.direction && motion.direction !== 'none' ? [motion.direction as MotionEffect] : []);
  const isMotionActive = motionEnabled && activeEffects.length > 0;

  let totalScale = 1.0;
  let clampedX = 0;
  let clampedY = 0;

  if (isMotionActive) {
    const cueStart = activeCue ? activeCue.startFrame : 0;
    const cueDuration = activeCue ? Math.max(1, activeCue.durationFrames) : (totalDurationFrames || 300);
    const relFrame = Math.max(0, Math.min(cueDuration, frame - cueStart));
    const progress = relFrame / cueDuration; // 0 to 1 for the active question

    const baseScale = motion.aiWatermarkZoom !== false ? 1.20 : 1.0;
    const intensity = motion.intensity ?? 20; // default 20px translation amplitude
    const zoomMultiplier = motion.zoomScale ?? (motion.zoomEnd ? motion.zoomEnd / (motion.zoomStart || 1) : 1.15);
    const speed = motion.speed ?? 1.0;

    let extraZoom = 1.0;
    let panX = 0;
    let panY = 0;

    // 2. ZOOM EFFECTS (Applied after base zoom)
    if (activeEffects.includes('zoom-in')) {
      const zProgress = interpolate(progress, [0, 1], [1.0, zoomMultiplier]);
      extraZoom *= zProgress;
    }
    if (activeEffects.includes('zoom-out')) {
      const zProgress = interpolate(progress, [0, 1], [zoomMultiplier, 1.0]);
      extraZoom *= zProgress;
    }

    // 3. PAN / DIRECTIONAL EFFECTS
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

    // 4. RANDOM / INFINITE MOTION
    if (activeEffects.includes('random-motion')) {
      const harmonicPhase = frame * speed * 0.04;
      const randX = Math.sin(harmonicPhase) * (intensity * 0.7) + Math.cos(harmonicPhase * 0.53) * (intensity * 0.3);
      const randY = Math.cos(harmonicPhase * 0.85) * (intensity * 0.7) + Math.sin(harmonicPhase * 0.41) * (intensity * 0.3);
      panX += randX;
      panY += randY;
    }

    totalScale = baseScale * extraZoom;
    const safeMarginX = (720 * (totalScale - 1)) / 2;
    const safeMarginY = (1280 * (totalScale - 1)) / 2;
    const maxAllowedPanX = Math.max(8, safeMarginX * 0.5);
    const maxAllowedPanY = Math.max(8, safeMarginY * 0.5);

    clampedX = Math.max(-maxAllowedPanX, Math.min(maxAllowedPanX, panX));
    clampedY = Math.max(-maxAllowedPanY, Math.min(maxAllowedPanY, panY));
  }

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
    // Image fallback
    bgStyle.backgroundColor = mainColor;
  }

  return (
    <div style={bgStyle}>
      {/* Procedural Real-Motion Neon Background (Deterministic 100% per frame) */}
      {bgType === 'neon' && (
        <NeonBackground
          presetId={style.neonPresetId || 'neon-gradient'}
          speed={style.neonSpeed ?? 1.0}
          intensity={style.neonIntensity ?? 1.0}
          color1={style.neonColor1}
          color2={style.neonColor2}
          color3={style.neonColor3}
        />
      )}

      {/* Background Image Container: Motion vs Pure Static */}
      {bgType === 'image' && style.imageUrl && (
        isMotionActive ? (
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
              decoding="sync"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block'
              }}
            />
          </div>
        ) : (
          <img
            src={resolveMedia(style.imageUrl)}
            alt="Video Background"
            loading="eager"
            decoding="sync"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
          />
        )
      )}

      {/* Legibility Tint / Contrast Overlay for image or neon */}
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
