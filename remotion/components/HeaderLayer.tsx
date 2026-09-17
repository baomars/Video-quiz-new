import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { ComponentStyle, ChannelBranding } from '../types/index';
import { getEntranceTransform } from '../animations/index';
import { resolveMedia } from '../utils/media';

interface HeaderLayerProps {
  style: ComponentStyle & { showTitle?: boolean; badgeStyle?: boolean };
  branding: ChannelBranding;
  quizTitle: string;
}

export const HeaderLayer: React.FC<HeaderLayerProps> = ({ style, branding, quizTitle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const transform = getEntranceTransform(style.animation || 'slide-up', frame, fps, 0);

  // Horizontal Alignment of Header Frame
  const width = style.width ?? 86;
  const leftPos = style.x !== undefined
    ? `${style.x}%`
    : style.horizontalAlign === 'center'
    ? `${(100 - width) / 2}%`
    : style.horizontalAlign === 'right'
    ? `${100 - width - 6}%`
    : '7%';

  const textAlign = style.textAlign || 'center';
  const justify = textAlign === 'left' ? 'flex-start' : textAlign === 'right' ? 'flex-end' : 'center';

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
        justifyContent: justify,
        gap: '12px',
        backgroundColor: style.backgroundColor || '#ffffff',
        borderRadius: `${style.borderRadius || 16}px`,
        border: `${style.borderWidth || 1}px solid ${style.borderColor || '#e2e8f0'}`,
        boxShadow: style.boxShadow || '0 4px 14px rgba(0, 0, 0, 0.05)',
        padding: `${style.padding || 8}px 16px`,
        zIndex: 10,
        ...transform
      }}
    >
      {branding?.identity?.avatarUrl && (
        <img
          src={resolveMedia(branding.identity.avatarUrl)}
          alt="avatar"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: `2px solid ${branding?.colors?.primary || '#2563eb'}`
          }}
        />
      )}
      <div style={{ display: 'flex', flexDirection: 'column', textAlign }}>
        <span
          style={{
            fontFamily: branding?.fonts?.primary || branding?.typography?.headingFont || 'Be Vietnam Pro, sans-serif',
            fontSize: `${style.fontSize || 24}px`,
            fontWeight: style.fontWeight || branding?.fonts?.headingWeight || '800',
            color: style.color || branding?.colors?.primary || '#2563eb',
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}
        >
          {branding?.identity?.channelName || ''}
        </span>
        {style.showTitle !== false && quizTitle && (
          <span
            style={{
              fontFamily: branding?.fonts?.secondary || branding?.typography?.bodyFont || 'Noto Sans, sans-serif',
              fontSize: '13px',
              fontWeight: '600',
              color: branding?.colors?.textMuted || '#64748b'
            }}
          >
            {quizTitle}
          </span>
        )}
      </div>
    </div>
  );
};
