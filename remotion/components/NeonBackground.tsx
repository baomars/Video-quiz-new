import React from 'react';
import { useCurrentFrame } from 'remotion';
import { NeonPresetId } from '../types/index';

interface NeonBackgroundProps {
  presetId?: NeonPresetId;
  speed?: number;
  intensity?: number;
  color1?: string;
  color2?: string;
  color3?: string;
}

// Precomputed static parameters to avoid runtime allocations or hook ordering
const STATIC_STREAKS = Array.from({ length: 16 }).map((_, i) => ({
  x: (i * 6.2 + 2.5) % 96,
  speedMult: 1.5 + (i % 4) * 0.6,
  length: 120 + (i % 5) * 45,
  width: 2 + (i % 3),
  colorIndex: i % 5,
  offsetY: (i * 137) % 1280
}));

const STATIC_PARTICLES = Array.from({ length: 28 }).map((_, i) => ({
  baseX: (i * 13.5 + 4) % 94,
  baseY: (i * 47) % 1280,
  radius: 12 + (i % 5) * 8,
  driftSpeed: 0.6 + (i % 4) * 0.35,
  phase: i * 1.3,
  colorIndex: i % 4
}));

function generateSmoothWave(t: number, baseY: number, amp1: number, amp2: number, speedMult: number): string {
  const points: Array<{ x: number; y: number }> = [];
  for (let i = 0; i <= 8; i++) {
    const x = (i / 8) * 720;
    const y = baseY + Math.sin(t * speedMult + i * 0.8) * amp1 + Math.cos(t * 0.6 + i * 0.5) * amp2;
    points.push({ x, y });
  }

  let d = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    d += ` Q ${p1.x.toFixed(1)},${p1.y.toFixed(1)} ${midX.toFixed(1)},${midY.toFixed(1)}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last.x.toFixed(1)},${last.y.toFixed(1)}`;
  return d;
}

export const NeonBackground: React.FC<NeonBackgroundProps> = ({
  presetId = 'neon-gradient',
  speed = 1.0,
  intensity = 1.0,
  color1,
  color2,
  color3
}) => {
  const frame = useCurrentFrame();

  const effectiveSpeed = Math.max(0.2, speed);
  const effectiveIntensity = Math.max(0.2, intensity);

  // 1. NEON GRADIENT (Dynamic multi-stop angle & focal point shifting)
  if (presetId === 'neon-gradient') {
    const c1 = color1 || '#00f0ff'; // cyan
    const c2 = color2 || '#ff007f'; // magenta
    const c3 = color3 || '#7928ca'; // purple
    const angle = (135 + Math.sin(frame * 0.025 * effectiveSpeed) * 45) % 360;
    const shift1 = 20 + Math.sin(frame * 0.03 * effectiveSpeed) * 15;
    const shift2 = 75 + Math.cos(frame * 0.025 * effectiveSpeed) * 15;

    // Moving radial focal spotlights
    const fx1 = 50 + Math.sin(frame * 0.035 * effectiveSpeed) * 30;
    const fy1 = 35 + Math.cos(frame * 0.03 * effectiveSpeed) * 25;
    const fx2 = 50 - Math.sin(frame * 0.025 * effectiveSpeed) * 30;
    const fy2 = 70 - Math.cos(frame * 0.035 * effectiveSpeed) * 20;

    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#050512',
          backgroundImage: `
            radial-gradient(circle at ${fx1}% ${fy1}%, ${c1}cc 0%, transparent 55%),
            radial-gradient(circle at ${fx2}% ${fy2}%, ${c2}b3 0%, transparent 60%),
            linear-gradient(${angle}deg, ${c3} 0%, #050515 ${shift1}%, #0a001a ${shift2}%, ${c2}88 100%)
          `,
          filter: `brightness(${effectiveIntensity})`,
          overflow: 'hidden'
        }}
      >
        {/* Soft pulsing glow veil */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse at 50% 50%, ${c1}33 0%, transparent 70%)`,
            opacity: 0.5 + 0.3 * Math.sin(frame * 0.05 * effectiveSpeed),
            mixBlendMode: 'screen'
          }}
        />
      </div>
    );
  }

  // 2. CYBER GLOW (Pulsing plasma light orbs with chromatic aberration)
  if (presetId === 'cyber-glow') {
    const c1 = color1 || '#00f2fe';
    const c2 = color2 || '#f72585';
    const c3 = color3 || '#7209b7';

    const orb1X = 35 + Math.sin(frame * 0.028 * effectiveSpeed) * 22;
    const orb1Y = 30 + Math.cos(frame * 0.032 * effectiveSpeed) * 20;
    const orb1Scale = 1 + 0.18 * Math.sin(frame * 0.04 * effectiveSpeed);

    const orb2X = 65 + Math.cos(frame * 0.024 * effectiveSpeed) * 22;
    const orb2Y = 65 + Math.sin(frame * 0.035 * effectiveSpeed) * 18;
    const orb2Scale = 1 + 0.15 * Math.cos(frame * 0.045 * effectiveSpeed);

    const orb3X = 50 + Math.sin(frame * 0.02 * effectiveSpeed + 1) * 25;
    const orb3Y = 85 + Math.cos(frame * 0.025 * effectiveSpeed + 2) * 15;

    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#04040d',
          overflow: 'hidden',
          filter: `brightness(${effectiveIntensity})`
        }}
      >
        {/* Orb 1 */}
        <div
          style={{
            position: 'absolute',
            left: `${orb1X}%`,
            top: `${orb1Y}%`,
            width: '380px',
            height: '380px',
            transform: `translate(-50%, -50%) scale(${orb1Scale})`,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${c1}ee 0%, ${c1}44 45%, transparent 70%)`,
            filter: 'blur(50px)',
            mixBlendMode: 'screen'
          }}
        />
        {/* Orb 2 */}
        <div
          style={{
            position: 'absolute',
            left: `${orb2X}%`,
            top: `${orb2Y}%`,
            width: '420px',
            height: '420px',
            transform: `translate(-50%, -50%) scale(${orb2Scale})`,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${c2}dd 0%, ${c2}44 50%, transparent 75%)`,
            filter: 'blur(55px)',
            mixBlendMode: 'screen'
          }}
        />
        {/* Orb 3 */}
        <div
          style={{
            position: 'absolute',
            left: `${orb3X}%`,
            top: `${orb3Y}%`,
            width: '340px',
            height: '340px',
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${c3}ee 0%, ${c3}44 50%, transparent 75%)`,
            filter: 'blur(45px)',
            mixBlendMode: 'screen'
          }}
        />
        {/* Outer Dark Vignette for contrast */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 50% 50%, transparent 40%, rgba(4, 4, 13, 0.8) 100%)',
            pointerEvents: 'none'
          }}
        />
      </div>
    );
  }

  // 3. ABSTRACT LIGHT WAVES (Multi-layered sinusoidal glowing curves)
  if (presetId === 'light-waves') {
    const c1 = color1 || '#00f0ff';
    const c2 = color2 || '#ff007f';
    const c3 = color3 || '#8b5cf6';

    const t = frame * 0.04 * effectiveSpeed;
    const pathD1 = generateSmoothWave(t, 600, 90, 45, 1.0);
    const pathD2 = generateSmoothWave(t, 720, 110, 50, 1.2);
    const pathD3 = generateSmoothWave(t, 440, 80, 40, 0.8);

    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#020617',
          overflow: 'hidden',
          filter: `brightness(${effectiveIntensity})`
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at 50% 55%, ${c3}33 0%, transparent 60%)`
          }}
        />

        <svg
          viewBox="0 0 720 1280"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%'
          }}
        >
          <defs>
            <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={c1} stopOpacity="0.8" />
              <stop offset="50%" stopColor={c3} stopOpacity="1" />
              <stop offset="100%" stopColor={c2} stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={c2} stopOpacity="0.7" />
              <stop offset="60%" stopColor={c1} stopOpacity="1" />
              <stop offset="100%" stopColor={c3} stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="waveGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={c3} stopOpacity="0.6" />
              <stop offset="50%" stopColor={c1} stopOpacity="0.9" />
              <stop offset="100%" stopColor={c2} stopOpacity="0.6" />
            </linearGradient>
            <filter id="neonWaveGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur1" />
              <feGaussianBlur stdDeviation="18" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Wave 3 (Back) */}
          <path
            d={pathD3}
            fill="none"
            stroke="url(#waveGrad3)"
            strokeWidth="8"
            filter="url(#neonWaveGlow)"
            opacity="0.65"
          />

          {/* Wave 1 (Mid) */}
          <path
            d={pathD1}
            fill="none"
            stroke="url(#waveGrad1)"
            strokeWidth="12"
            filter="url(#neonWaveGlow)"
            opacity="0.9"
          />

          {/* Wave 2 (Front) */}
          <path
            d={pathD2}
            fill="none"
            stroke="url(#waveGrad2)"
            strokeWidth="10"
            filter="url(#neonWaveGlow)"
            opacity="0.8"
          />
        </svg>
      </div>
    );
  }

  // 4. NEON GRID (Synthwave / Cyber 3D Perspective Plane)
  if (presetId === 'neon-grid') {
    const c1 = color1 || '#00f0ff';
    const c2 = color2 || '#ff007f';
    const horizon = 42;

    const gridY = (frame * 1.8 * effectiveSpeed) % 50;

    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#030014',
          overflow: 'hidden',
          filter: `brightness(${effectiveIntensity})`
        }}
      >
        {/* Sky Section with Glowing Horizon Sun */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: `${horizon}%`,
            background: `radial-gradient(ellipse at 50% 100%, ${c2}99 0%, ${c2}33 35%, #030014 85%)`
          }}
        >
          {/* Cyber Sun */}
          <div
            style={{
              position: 'absolute',
              bottom: '-80px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '240px',
              height: '240px',
              borderRadius: '50%',
              background: `linear-gradient(to top, #ffe600 0%, ${c2} 70%)`,
              boxShadow: `0 0 50px ${c2}cc, 0 0 100px ${c2}66`,
              filter: 'blur(2px)'
            }}
          />
        </div>

        {/* Horizon Laser Line */}
        <div
          style={{
            position: 'absolute',
            top: `${horizon}%`,
            left: 0,
            width: '100%',
            height: '3px',
            backgroundColor: '#ffffff',
            boxShadow: `0 0 15px #ffffff, 0 0 30px ${c1}`,
            zIndex: 2
          }}
        />

        {/* 3D Perspective Ground Grid */}
        <div
          style={{
            position: 'absolute',
            top: `${horizon}%`,
            left: '-50%',
            width: '200%',
            height: `${100 - horizon + 20}%`,
            perspective: '350px',
            transformOrigin: 'top center',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              transform: 'rotateX(72deg)',
              transformOrigin: 'top center',
              backgroundImage: `
                linear-gradient(to right, ${c1}66 1.5px, transparent 1.5px),
                linear-gradient(to bottom, ${c1}66 1.5px, transparent 1.5px)
              `,
              backgroundSize: '50px 50px',
              backgroundPosition: `0px ${gridY}px`,
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.1) 95%)',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.1) 95%)'
            }}
          />
        </div>

        {/* Dark Vignette Bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '30%',
            background: 'linear-gradient(to top, #030014 0%, transparent 100%)',
            pointerEvents: 'none'
          }}
        />
      </div>
    );
  }

  // 5. ENERGY LINES (High-speed vertical laser streaks)
  if (presetId === 'energy-lines') {
    const c1 = color1 || '#00f5d4';
    const c2 = color2 || '#7b2cbf';
    const c3 = color3 || '#4cc9f0';
    const colors = [c1, c2, c3, '#ffffff', '#ffe600'];

    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#020617',
          overflow: 'hidden',
          filter: `brightness(${effectiveIntensity})`
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at 50% 50%, ${c2}25 0%, transparent 70%)`
          }}
        />

        {STATIC_STREAKS.map((s, idx) => {
          const y = (frame * 14 * s.speedMult * effectiveSpeed + s.offsetY) % (1280 + s.length) - s.length;
          const clr = colors[s.colorIndex];
          return (
            <div
              key={idx}
              style={{
                position: 'absolute',
                left: `${s.x}%`,
                top: `${y}px`,
                width: `${s.width}px`,
                height: `${s.length}px`,
                background: `linear-gradient(to bottom, transparent 0%, ${clr} 60%, #ffffff 100%)`,
                borderRadius: '999px',
                boxShadow: `0 0 10px ${clr}, 0 0 20px ${clr}`,
                opacity: 0.75 + 0.25 * Math.sin(frame * 0.1 + idx)
              }}
            />
          );
        })}
      </div>
    );
  }

  // 6. LIGHT PARTICLES / FLUID BOKEH
  if (presetId === 'light-particles') {
    const c1 = color1 || '#38bdf8';
    const c2 = color2 || '#ec4899';
    const c3 = color3 || '#a855f7';
    const colors = [c1, c2, c3, '#67e8f9'];

    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#050515',
          overflow: 'hidden',
          filter: `brightness(${effectiveIntensity})`
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at 50% 60%, ${c3}22 0%, transparent 65%)`
          }}
        />

        {STATIC_PARTICLES.map((p, idx) => {
          const swayX = Math.sin(frame * 0.03 * effectiveSpeed + p.phase) * 35;
          const currentY = (p.baseY - frame * 1.5 * p.driftSpeed * effectiveSpeed) % (1280 + p.radius * 2);
          const y = currentY < -p.radius * 2 ? 1280 + currentY : currentY;
          const opacity = 0.35 + 0.45 * Math.sin(frame * 0.04 * effectiveSpeed + p.phase);
          const clr = colors[p.colorIndex];

          return (
            <div
              key={idx}
              style={{
                position: 'absolute',
                left: `calc(${p.baseX}% + ${swayX}px)`,
                top: `${y}px`,
                width: `${p.radius * 2}px`,
                height: `${p.radius * 2}px`,
                borderRadius: '50%',
                background: `radial-gradient(circle, #ffffff 15%, ${clr} 55%, transparent 75%)`,
                boxShadow: `0 0 ${p.radius}px ${clr}`,
                opacity,
                transform: 'translate(-50%, -50%)',
                filter: 'blur(1.5px)'
              }}
            />
          );
        })}
      </div>
    );
  }

  // 7. GEOMETRIC NEON (Rotating concentric tech wireframes)
  if (presetId === 'geometric-neon') {
    const c1 = color1 || '#00f0ff';
    const c2 = color2 || '#a855f7';

    const rot1 = (frame * 0.4 * effectiveSpeed) % 360;
    const rot2 = (-frame * 0.6 * effectiveSpeed) % 360;
    const rot3 = (frame * 0.8 * effectiveSpeed) % 360;
    const pulse = 1 + 0.05 * Math.sin(frame * 0.06 * effectiveSpeed);

    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#050714',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          filter: `brightness(${effectiveIntensity})`
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `radial-gradient(rgba(0, 240, 255, 0.12) 1.5px, transparent 1.5px)`,
            backgroundSize: '36px 36px'
          }}
        />

        <div
          style={{
            position: 'absolute',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${c1}33 0%, ${c2}22 45%, transparent 70%)`,
            filter: 'blur(40px)'
          }}
        />

        <svg
          viewBox="0 0 600 600"
          style={{
            width: '580px',
            height: '580px',
            transform: `scale(${pulse})`
          }}
        >
          <defs>
            <filter id="geoGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Outer Rotating Hexagon */}
          <g transform={`rotate(${rot1} 300 300)`} filter="url(#geoGlow)">
            <polygon
              points="300,50 516,175 516,425 300,550 84,425 84,175"
              fill="none"
              stroke={c1}
              strokeWidth="2.5"
              strokeDasharray="20, 10"
              opacity="0.85"
            />
          </g>

          {/* Middle Rotating Diamond */}
          <g transform={`rotate(${rot2} 300 300)`} filter="url(#geoGlow)">
            <rect
              x="135"
              y="135"
              width="330"
              height="330"
              fill="none"
              stroke={c2}
              strokeWidth="2.5"
              opacity="0.75"
            />
          </g>

          {/* Inner Dashed Radar Circle */}
          <g transform={`rotate(${rot3} 300 300)`} filter="url(#geoGlow)">
            <circle
              cx="300"
              cy="300"
              r="110"
              fill="none"
              stroke={c1}
              strokeWidth="2"
              strokeDasharray="8, 6"
              opacity="0.9"
            />
          </g>

          {/* Center Target Core */}
          <circle cx="300" cy="300" r="15" fill={c1} filter="url(#geoGlow)" opacity="0.95" />
          <line x1="260" y1="300" x2="340" y2="300" stroke="#ffffff" strokeWidth="2" />
          <line x1="300" y1="260" x2="300" y2="340" stroke="#ffffff" strokeWidth="2" />
        </svg>
      </div>
    );
  }

  // 8. AURORA NEON (Ethereal drifting polar curtains)
  if (presetId === 'aurora-neon') {
    const c1 = color1 || '#10b981';
    const c2 = color2 || '#06b6d4';
    const c3 = color3 || '#d946ef';

    const t = frame * 0.02 * effectiveSpeed;
    const wave1 = Math.sin(t) * 45;
    const wave2 = Math.cos(t * 1.3) * 55;
    const wave3 = Math.sin(t * 0.8 + 1) * 60;

    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#020510',
          overflow: 'hidden',
          filter: `brightness(${effectiveIntensity})`
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.25) 1px, transparent 1px)',
            backgroundSize: '48px 48px'
          }}
        />

        {/* Aurora Curtain 1 (Emerald) */}
        <div
          style={{
            position: 'absolute',
            top: '-15%',
            left: `${15 + wave1 * 0.2}%`,
            width: '80%',
            height: '110%',
            background: `radial-gradient(ellipse at 40% 45%, ${c1}99 0%, ${c1}33 50%, transparent 75%)`,
            transform: `rotate(${15 + wave1 * 0.1}deg) scaleX(${1 + wave1 * 0.005})`,
            filter: 'blur(45px)',
            mixBlendMode: 'screen',
            opacity: 0.85
          }}
        />

        {/* Aurora Curtain 2 (Cyan) */}
        <div
          style={{
            position: 'absolute',
            top: '5%',
            left: `${35 + wave2 * 0.2}%`,
            width: '75%',
            height: '100%',
            background: `radial-gradient(ellipse at 50% 50%, ${c2}88 0%, ${c2}22 55%, transparent 75%)`,
            transform: `rotate(${-18 + wave2 * 0.08}deg)`,
            filter: 'blur(50px)',
            mixBlendMode: 'screen',
            opacity: 0.8
          }}
        />

        {/* Aurora Curtain 3 (Magenta / Violet) */}
        <div
          style={{
            position: 'absolute',
            top: '25%',
            left: `${20 + wave3 * 0.15}%`,
            width: '70%',
            height: '85%',
            background: `radial-gradient(ellipse at 50% 50%, ${c3}77 0%, ${c3}22 50%, transparent 70%)`,
            transform: `rotate(${8 + wave3 * 0.06}deg)`,
            filter: 'blur(55px)',
            mixBlendMode: 'screen',
            opacity: 0.75
          }}
        />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(2, 5, 16, 0.7) 0%, transparent 30%, transparent 70%, rgba(2, 5, 16, 0.85) 100%)',
            pointerEvents: 'none'
          }}
        />
      </div>
    );
  }

  // Fallback
  return <div style={{ position: 'absolute', inset: 0, backgroundColor: '#050515' }} />;
};
