import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { ComponentStyle } from '../types/index';
import { getEntranceTransform } from '../animations/index';

interface QuizTitleLayerProps {
  style?: ComponentStyle & {
    enabled?: boolean;
    text?: string;
    badgeStyle?: boolean;
  };
  quizTitle?: string;
  defaultFont?: string;
  defaultColor?: string;
}

export const QuizTitleLayer: React.FC<QuizTitleLayerProps> = ({
  style = { x: 7, y: 7, width: 86, height: 6 },
  quizTitle = '',
  defaultFont = 'Montserrat, sans-serif',
  defaultColor = '#1e3a8a'
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Show/Hide check
  if (style.enabled === false) {
    return null;
  }

  const effectiveText = (style.text !== undefined && style.text !== '') ? style.text : quizTitle;
  if (!effectiveText || !effectiveText.trim()) {
    return null;
  }

  const transform = getEntranceTransform(style.animation || 'slide-up', frame, fps, 0);

  // Horizontal Alignment
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
        top: `${style.y ?? 7}%`,
        width: `${width}%`,
        minHeight: `${style.height ?? 6}%`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: justify,
        backgroundColor: style.backgroundColor || '#ffffff',
        borderRadius: `${style.borderRadius ?? 16}px`,
        border: style.borderWidth ? `${style.borderWidth}px solid ${style.borderColor || '#bfdbfe'}` : '1px solid rgba(226, 232, 240, 0.9)',
        boxShadow: style.boxShadow || '0 4px 16px rgba(0, 0, 0, 0.06)',
        padding: `${style.padding ?? 10}px 18px`,
        zIndex: 11,
        boxSizing: 'border-box',
        ...transform
      }}
    >
      <span
        style={{
          fontFamily: style.fontFamily || defaultFont,
          fontSize: `${style.fontSize || 24}px`,
          fontWeight: style.fontWeight || '800',
          color: style.color || defaultColor,
          textAlign: textAlign,
          lineHeight: style.lineHeight || 1.3,
          letterSpacing: style.letterSpacing ? `${style.letterSpacing}em` : '0.02em',
          textTransform: 'uppercase',
          width: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}
      >
        {effectiveText}
      </span>
    </div>
  );
};
