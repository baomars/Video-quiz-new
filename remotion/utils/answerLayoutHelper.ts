import {
  AnswerButtonsConfig,
  AnswerLayoutComposition,
  IndividualOptionConfig,
  OptionKey,
  OptionBadgeShape,
  ComponentShape
} from '../types/index.js';

export interface ResolvedOptionLayout {
  key: OptionKey;
  x: number;          // percent (0-100)
  y: number;          // percent (0-100)
  width: number;      // percent (0-100)
  height: number;     // percent (0-100)
  rotation: number;   // degrees (-180 to 180)
  shape: ComponentShape;
  backgroundColor: string;
  bgOpacity: number;
  borderColor: string;
  borderWidth: number;
  borderStyle: 'solid' | 'dashed' | 'dotted' | 'none';
  borderRadius: number;
  textColor: string;
  fontSize: number;
  fontWeight: string;
  fontFamily: string;
  popShadow: boolean;
  popShadowOffset: number;
  popShadowColor: string;
  chamferSize: number;
  markerHighlight: boolean;
  labelShape: OptionBadgeShape;
  labelColor?: string;
  labelBgColor?: string;
  labelSize?: number;
  textShadow?: string;
  boxShadow?: string;
  glowColor?: string;
  glowRadius?: number;
}

/**
 * Resolves the computed position (in percentages 0-100) and style for a single answer option card (A, B, C, etc.).
 * Works identically for both React Remotion Preview and Native Skia 2D Canvas.
 */
export function resolveOptionLayout(
  key: OptionKey,
  index: number,
  totalOptions: number,
  config?: AnswerButtonsConfig,
  primaryColor: string = '#2563eb'
): ResolvedOptionLayout {
  const cfg = config || ({} as AnswerButtonsConfig);
  const composition: AnswerLayoutComposition = cfg.layoutComposition || 'stacked';
  const indOpt: IndividualOptionConfig | undefined = cfg.options?.[key];

  // Base coordinates in percentage
  let baseX = cfg.x ?? 6;
  let baseY = cfg.y ?? 63;
  let baseW = cfg.width ?? 88;
  let baseH = cfg.height ?? 20;
  let baseRot = 0;

  const totalH = cfg.height ?? 20;
  const gapPct = totalOptions > 1 ? (1.5) : 0; // ~1.5% gap between elements

  switch (composition) {
    case 'grid-2-top-1-bottom':
      if (key === 'A') {
        baseX = 6;
        baseY = cfg.y ?? 55;
        baseW = 42;
        baseH = totalH * 0.52;
      } else if (key === 'B') {
        baseX = 52;
        baseY = cfg.y ?? 55;
        baseW = 42;
        baseH = totalH * 0.52;
      } else if (key === 'C') {
        baseX = 16;
        baseY = (cfg.y ?? 55) + totalH * 0.58;
        baseW = 68;
        baseH = totalH * 0.48;
      } else {
        baseX = 6;
        baseY = (cfg.y ?? 55) + totalH * 1.1;
        baseW = 88;
        baseH = totalH * 0.45;
      }
      break;

    case 'one-right-two-left':
    case 'split-left-right':
      if (key === 'A') {
        baseX = 6;
        baseY = cfg.y ?? 48;
        baseW = 42;
        baseH = totalH * 0.55;
      } else if (key === 'C') {
        baseX = 6;
        baseY = (cfg.y ?? 48) + totalH * 0.62;
        baseW = 42;
        baseH = totalH * 0.55;
      } else if (key === 'B') {
        baseX = 52;
        baseY = cfg.y ?? 48;
        baseW = 42;
        baseH = totalH * 1.17; // Tall featured card
      } else {
        baseX = 6;
        baseY = (cfg.y ?? 48) + totalH * 1.25;
        baseW = 88;
        baseH = totalH * 0.45;
      }
      break;

    case 'circular-arc':
      baseW = index === 1 ? 80 : 88;
      baseX = index === 1 ? 14 : 6;
      baseH = (totalH - gapPct * (totalOptions - 1)) / Math.max(1, totalOptions);
      baseY = (cfg.y ?? 52) + index * (baseH + gapPct * 1.2);
      break;

    case 'floating':
      baseW = index === 1 ? 84 : 86;
      baseX = index === 1 ? 10 : (index === 0 ? 5 : 6);
      baseRot = index === 0 ? -1.2 : (index === 1 ? 1.5 : -0.8);
      baseH = (totalH - gapPct * (totalOptions - 1)) / Math.max(1, totalOptions);
      baseY = (cfg.y ?? 50) + index * (baseH + gapPct * 1.3);
      break;

    case 'asymmetric':
      if (index === 0) {
        baseX = 5;
        baseW = 64;
      } else if (index === 1) {
        baseX = 26;
        baseW = 68;
      } else {
        baseX = 8;
        baseW = 82;
      }
      baseH = (totalH - gapPct * (totalOptions - 1)) / Math.max(1, totalOptions);
      baseY = (cfg.y ?? 50) + index * (baseH + gapPct * 1.2);
      break;

    case 'triangle':
      if (key === 'A') {
        baseX = 16;
        baseY = cfg.y ?? 50;
        baseW = 68;
        baseH = totalH * 0.5;
      } else if (key === 'B') {
        baseX = 6;
        baseY = (cfg.y ?? 50) + totalH * 0.56;
        baseW = 42;
        baseH = totalH * 0.55;
      } else if (key === 'C') {
        baseX = 52;
        baseY = (cfg.y ?? 50) + totalH * 0.56;
        baseW = 42;
        baseH = totalH * 0.55;
      } else {
        baseX = 6;
        baseY = (cfg.y ?? 50) + totalH * 1.18;
        baseW = 88;
        baseH = totalH * 0.45;
      }
      break;

    case 'staggered':
      baseW = 82;
      baseH = (totalH - gapPct * (totalOptions - 1)) / Math.max(1, totalOptions);
      if (index % 2 === 0) {
        baseX = 6;
      } else {
        baseX = 12; // Shifted right
      }
      baseY = (cfg.y ?? 50) + index * (baseH + gapPct * 1.2);
      break;

    case 'custom':
      // Takes custom coordinates directly if set, else standard
      baseX = indOpt?.x ?? (cfg.x ?? 6);
      baseY = indOpt?.y ?? ((cfg.y ?? 63) + index * 7);
      baseW = indOpt?.width ?? (cfg.width ?? 88);
      baseH = indOpt?.height ?? 6.5;
      break;

    case 'stacked':
    default:
      baseX = cfg.x ?? 6;
      baseW = cfg.width ?? 88;
      const count = Math.max(1, totalOptions);
      const slotH = (totalH - gapPct * (count - 1)) / count;
      baseH = slotH;
      // If individualStyles is enabled and previous option has an explicit y, place this option after it
      if (!indOpt && cfg.useIndividualStyles && cfg.options) {
        const prevKey = String.fromCharCode(key.charCodeAt(0) - 1) as OptionKey;
        const prevOpt = cfg.options[prevKey];
        if (prevOpt && prevOpt.y !== undefined) {
          baseY = prevOpt.y + (prevOpt.height ?? slotH) + gapPct;
          baseW = prevOpt.width ?? baseW;
          baseH = prevOpt.height ?? slotH;
          break;
        }
      }
      baseY = (cfg.y ?? 63) + index * (slotH + gapPct);
      break;
  }

  // Override with individual option values if defined
  const finalX = indOpt?.x !== undefined ? indOpt.x : baseX;
  const finalY = indOpt?.y !== undefined ? indOpt.y : baseY;
  const finalW = indOpt?.width !== undefined ? indOpt.width : baseW;
  const finalH = indOpt?.height !== undefined ? indOpt.height : baseH;
  const finalRot = indOpt?.rotation !== undefined ? indOpt.rotation : (cfg.rotation ?? baseRot);

  const shape = indOpt?.shape || cfg.shape || 'rounded';
  const backgroundColor = indOpt?.backgroundColor || cfg.backgroundColor || '#ffffff';
  const bgOpacity = indOpt?.bgOpacity !== undefined ? indOpt.bgOpacity : (cfg.bgOpacity ?? 0.88);
  const borderColor = indOpt?.borderColor || cfg.borderColor || `${primaryColor}66`;
  const borderWidth = indOpt?.borderWidth !== undefined ? indOpt.borderWidth : (cfg.borderWidth ?? 2);
  const borderStyle = (indOpt?.borderStyle || cfg.borderStyle || 'solid') as any;
  const borderRadius = indOpt?.borderRadius !== undefined ? indOpt.borderRadius : (cfg.borderRadius ?? 16);
  const textColor = indOpt?.textColor || indOpt?.color || cfg.textColor || cfg.color || '#0f172a';
  const fontSize = indOpt?.fontSize || cfg.fontSize || 22;
  const fontWeight = indOpt?.fontWeight || cfg.fontWeight || '700';
  const fontFamily = indOpt?.fontFamily || cfg.fontFamily || 'Be Vietnam Pro, sans-serif';
  const popShadow = indOpt?.popShadow !== undefined ? indOpt.popShadow : Boolean(cfg.popShadow);
  const popShadowOffset = indOpt?.popShadowOffset ?? cfg.popShadowOffset ?? 6;
  const popShadowColor = indOpt?.popShadowColor || cfg.popShadowColor || '#111827';
  const chamferSize = indOpt?.chamferSize ?? cfg.chamferSize ?? 12;
  const markerHighlight = indOpt?.markerHighlight !== undefined ? indOpt.markerHighlight : Boolean(cfg.markerHighlight);
  const labelShape = indOpt?.labelShape || cfg.optionBadgeShape || 'circle';

  return {
    key,
    x: finalX,
    y: finalY,
    width: finalW,
    height: finalH,
    rotation: finalRot,
    shape,
    backgroundColor,
    bgOpacity,
    borderColor,
    borderWidth,
    borderStyle,
    borderRadius,
    textColor,
    fontSize,
    fontWeight,
    fontFamily,
    popShadow,
    popShadowOffset,
    popShadowColor,
    chamferSize,
    markerHighlight,
    labelShape,
    labelColor: indOpt?.labelColor,
    labelBgColor: indOpt?.labelBgColor,
    labelSize: indOpt?.labelSize,
    textShadow: indOpt?.textShadow ?? cfg.textShadow,
    boxShadow: indOpt?.boxShadow ?? cfg.boxShadow,
    glowColor: indOpt?.glowColor ?? cfg.glowColor,
    glowRadius: indOpt?.glowRadius ?? cfg.glowRadius
  };
}
