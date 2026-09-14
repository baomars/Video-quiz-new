import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { ComponentStyle, IllustrationLayout } from '../types/index';
import { getEntranceTransform } from '../animations/index';
import { resolveMedia } from '../utils/media';

interface IllustrationFrameProps {
  style: ComponentStyle & {
    objectFit?: 'cover' | 'contain';
    zoomEffect?: boolean;
    paddingFrame?: number;
  };
  layoutMode: IllustrationLayout;
  images: string[];
  primaryColor?: string;
  delayFrame?: number;
}

export const IllustrationFrame: React.FC<IllustrationFrameProps> = ({
  style,
  layoutMode,
  images = [],
  primaryColor = '#2563eb',
  delayFrame = 0
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const validImages = images.filter(Boolean);
  // Optional illustration: if no image, do not render placeholder box!
  if (validImages.length === 0) {
    return null;
  }

  const entrance = getEntranceTransform(style.animation || 'scale-in', frame, fps, delayFrame);

  // Subtle Ken Burns zoom effect
  const zoomScale = style.zoomEffect !== false
    ? interpolate(frame, [0, 300], [1.0, 1.06], { extrapolateRight: 'clamp' })
    : 1.0;

  // Horizontal Alignment
  const width = style.width ?? 84;
  const leftPos = style.x !== undefined
    ? `${style.x}%`
    : style.horizontalAlign === 'center'
    ? `${(100 - width) / 2}%`
    : style.horizontalAlign === 'right'
    ? `${100 - width - 6}%`
    : '8%';

  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    left: leftPos,
    top: `${style.y}%`,
    width: `${style.width}%`,
    height: `${style.height}%`,
    borderRadius: `${style.borderRadius ?? 20}px`,
    border: style.borderWidth ? `${style.borderWidth}px solid ${style.borderColor || '#bfdbfe'}` : 'none',
    boxShadow: style.boxShadow || '0 10px 25px rgba(0, 0, 0, 0.08)',
    backgroundColor: style.backgroundColor || '#ffffff',
    overflow: 'hidden',
    display: 'flex',
    padding: `${style.paddingFrame || 0}px`,
    zIndex: 5,
    ...entrance
  };

  // Single image rendering (Split 2 completely removed as per specification)
  return (
    <div style={containerStyle}>
      <img
        src={resolveMedia(validImages[0])}
        alt="quiz illustration"
        style={{
          width: '100%',
          height: '100%',
          objectFit: style.objectFit || 'cover',
          transform: `scale(${zoomScale})`
        }}
      />
    </div>
  );
};
