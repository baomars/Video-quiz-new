import React from 'react';
import { ComponentStyle, ChannelBranding } from '../types/index';
import { resolveMedia } from '../utils/media';

interface LogoWatermarkProps {
  style?: ComponentStyle & {
    watermark?: boolean;
    showLogo?: boolean;
    showChannelName?: boolean;
    channelName?: string;
    logoSize?: number;
  };
  branding: ChannelBranding;
}

export const LogoWatermark: React.FC<LogoWatermarkProps> = React.memo(({ style = { x: 75, y: 8, width: 16, height: 6 }, branding }) => {
  const showLogo = style.showLogo ?? branding.identity.showLogo ?? true;
  const showChannelName = style.showChannelName ?? branding.identity.showChannelName ?? false;

  const logoUrl = branding.identity.logoUrl || branding.identity.avatarUrl;
  const channelName = style.channelName || branding.identity.channelName;

  const hasLogoToRender = Boolean(showLogo && logoUrl);
  const hasNameToRender = Boolean(showChannelName && channelName);

  if (!hasLogoToRender && !hasNameToRender) return null;

  const width = style.width ?? 24;
  const leftPos = style.x !== undefined
    ? `${style.x}%`
    : style.horizontalAlign === 'center'
    ? `${(100 - width) / 2}%`
    : style.horizontalAlign === 'right'
    ? `${100 - width - 6}%`
    : '75%';

  const justify = style.textAlign === 'left' ? 'flex-start' : style.textAlign === 'right' ? 'flex-end' : 'center';
  const opacity = style.opacity ?? branding.identity.watermarkOpacity ?? 0.9;
  const logoSize = style.logoSize || 42;

  return (
    <div
      style={{
        position: 'absolute',
        left: leftPos,
        top: `${style.y}%`,
        width: `${width}%`,
        minHeight: `${style.height ?? 6}%`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: justify,
        gap: '8px',
        opacity: opacity,
        zIndex: 12,
        pointerEvents: 'none',
        boxSizing: 'border-box'
      }}
    >
      {hasLogoToRender && (
        <img
          src={resolveMedia(logoUrl)}
          alt="channel logo"
          loading="eager"
          decoding="async"
          style={{
            width: `${logoSize}px`,
            height: `${logoSize}px`,
            objectFit: 'contain',
            filter: style.boxShadow ? `drop-shadow(${style.boxShadow})` : 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))'
          }}
        />
      )}

      {hasNameToRender && (
        <span
          style={{
            fontFamily: style.fontFamily || branding.fonts.primary || 'Be Vietnam Pro, sans-serif',
            fontSize: `${style.fontSize || 18}px`,
            fontWeight: style.fontWeight || '800',
            color: style.color || branding.colors.primary || '#ffffff',
            textShadow: '0 2px 8px rgba(0,0,0,0.25)',
            whiteSpace: 'nowrap',
            letterSpacing: '0.02em'
          }}
        >
          {channelName}
        </span>
      )}
    </div>
  );
});
