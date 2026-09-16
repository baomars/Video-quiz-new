import type { SKRSContext2D, Image } from '@napi-rs/canvas';
import { interpolate, spring } from 'remotion';
import { Channel, VideoTemplate, Quiz, TimelineQuestionCue, OptionKey } from '../../../../remotion/types/index.js';
import { parseColor, drawRoundedRect, wrapText, getEntranceTransform } from './canvasHelper.js';

export interface SceneDrawContext {
  ctx: SKRSContext2D;
  frame: number;
  width: number;
  height: number;
  fps: number;
  channel: Channel;
  template: VideoTemplate;
  quiz: Quiz;
  cues: TimelineQuestionCue[];
  totalDurationFrames: number;
  loadedImages: Map<string, Image>;
}

export function drawScene(ctxData: SceneDrawContext): void {
  const { ctx, frame, width, height, fps, channel, template, quiz, cues, totalDurationFrames, loadedImages } = ctxData;

  // 1. Reset Canvas & Base Background
  ctx.save();
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  // Active question cue
  const activeCue = cues.find(c => frame >= c.startFrame && frame < c.endFrame) || cues[0];

  // 2. Background Layer
  drawBackground(ctx, frame, width, height, template, channel, activeCue, totalDurationFrames, loadedImages);

  // 3. Quiz Title Layer (Persistent Top Layer)
  drawQuizTitle(ctx, frame, width, height, fps, template, channel, quiz.title);

  // 4. Channel Logo & Watermark Layer
  drawLogoWatermark(ctx, frame, width, height, template, channel, loadedImages);

  // 5. Question Sequence Layer
  if (activeCue) {
    const question = quiz.questions[activeCue.questionIndex];
    if (question) {
      drawQuestionSequence(ctx, frame, width, height, fps, channel, template, question, activeCue, quiz.questions.length, loadedImages);
    }
  }

  ctx.restore();
}

// -----------------------------------------------------------------------------
// 1. BACKGROUND LAYER
// -----------------------------------------------------------------------------
function drawBackground(
  ctx: SKRSContext2D,
  frame: number,
  width: number,
  height: number,
  template: VideoTemplate,
  channel: Channel,
  cue: TimelineQuestionCue | undefined,
  totalFrames: number,
  loadedImages: Map<string, Image>
): void {
  const bgStyle = template.components.background;
  const bgType = bgStyle.type || 'gradient';
  const mainColor = bgStyle.backgroundColor || '#ffffff';
  const secColor = bgStyle.secondaryColor || '#eff6ff';

  ctx.save();

  if (bgType === 'image' && bgStyle.imageUrl) {
    const img = loadedImages.get(bgStyle.imageUrl);
    if (img) {
      const relFrame = cue ? frame - cue.startFrame : frame;
      const cueDuration = cue ? cue.durationFrames : totalFrames;
      const zoomScale = interpolate(relFrame, [0, Math.max(1, cueDuration)], [1.0, 1.12], { extrapolateRight: 'clamp' });
      const panX = interpolate(relFrame, [0, Math.max(1, cueDuration)], [0, 15], { extrapolateRight: 'clamp' });

      ctx.save();
      ctx.translate(width / 2 + panX, height / 2);
      ctx.scale(zoomScale, zoomScale);

      // Cover scaling
      const imgAspect = img.width / img.height;
      const canvasAspect = width / height;
      let drawW = width;
      let drawH = height;
      if (imgAspect > canvasAspect) {
        drawH = height;
        drawW = height * imgAspect;
      } else {
        drawW = width;
        drawH = width / imgAspect;
      }

      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      // Overlay if configured
      if (bgStyle.overlayOpacity && bgStyle.overlayOpacity > 0) {
        ctx.fillStyle = bgStyle.overlayColor || '#000000';
        ctx.globalAlpha = bgStyle.overlayOpacity;
        ctx.fillRect(0, 0, width, height);
        ctx.globalAlpha = 1.0;
      }
    } else {
      // Fallback if image not ready
      ctx.fillStyle = mainColor;
      ctx.fillRect(0, 0, width, height);
    }
  } else if (bgType === 'solid') {
    ctx.fillStyle = mainColor;
    ctx.fillRect(0, 0, width, height);
  } else if (bgType === 'neon') {
    // High-performance procedural Neon Background
    ctx.fillStyle = '#060814';
    ctx.fillRect(0, 0, width, height);

    const time = frame / 30;
    const c1 = bgStyle.neonColor1 || channel.branding.colors.primary || '#00e5ff';
    const c2 = bgStyle.neonColor2 || '#d946ef';

    // Ambient radial glow
    const g1 = ctx.createRadialGradient(width * 0.5, height * 0.35, 10, width * 0.5, height * 0.35, width * 0.8);
    g1.addColorStop(0, parseColor(c1, 0.25));
    g1.addColorStop(1, 'rgba(6, 8, 20, 0)');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, width, height);

    const g2 = ctx.createRadialGradient(width * 0.5, height * 0.75, 10, width * 0.5, height * 0.75, width * 0.7);
    g2.addColorStop(0, parseColor(c2, 0.2));
    g2.addColorStop(1, 'rgba(6, 8, 20, 0)');
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, width, height);

    // Subtle animated rotating neon rings
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate(time * 0.15);
    ctx.strokeStyle = parseColor(c1, 0.18);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, width * 0.42, 0, Math.PI * 2);
    ctx.stroke();

    ctx.rotate(-time * 0.3);
    ctx.strokeStyle = parseColor(c2, 0.15);
    ctx.beginPath();
    ctx.arc(0, 0, width * 0.48, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  } else {
    // Linear gradient
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, mainColor);
    grad.addColorStop(1, secColor);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  ctx.restore();
}

// -----------------------------------------------------------------------------
// 2. QUIZ TITLE LAYER
// -----------------------------------------------------------------------------
function drawQuizTitle(
  ctx: SKRSContext2D,
  frame: number,
  width: number,
  height: number,
  fps: number,
  template: VideoTemplate,
  channel: Channel,
  quizTitle: string
): void {
  const style = template.components.quizTitle || template.components.header;
  if (style.enabled === false) return;

  const effectiveText = (style.text !== undefined && style.text !== '') ? style.text : quizTitle;
  if (!effectiveText || !effectiveText.trim()) return;

  const left = ((style.x ?? 7) / 100) * width;
  const top = ((style.y ?? 7) / 100) * height;
  const cardW = ((style.width ?? 86) / 100) * width;
  const cardH = ((style.height ?? 6) / 100) * height;
  const radius = style.borderRadius ?? 16;

  // Entrance animation (25 frames)
  let opacity = 1.0;
  let translateY = 0;
  if (frame < 25 && (style.animation as string) !== 'none') {
    const ent = getEntranceTransform(style.animation || 'slide-up', frame, fps, 0);
    opacity = ent.opacity;
    translateY = ent.translateY;
  }

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.translate(0, translateY);

  // Shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 4;

  // Card background & border
  ctx.fillStyle = style.backgroundColor || '#ffffff';
  drawRoundedRect(ctx, left, top, cardW, cardH, radius);
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = style.borderColor || '#bfdbfe';
  ctx.lineWidth = style.borderWidth || 1;
  ctx.stroke();

  // Text
  ctx.fillStyle = style.color || channel.branding.colors.primary || '#1e3a8a';
  const fontSize = style.fontSize || 24;
  ctx.font = `800 ${fontSize}px "Montserrat", "Be Vietnam Pro", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const titleText = effectiveText.toUpperCase();
  ctx.fillText(titleText, left + cardW / 2, top + cardH / 2, cardW - 36);

  ctx.restore();
}

// -----------------------------------------------------------------------------
// 3. LOGO & WATERMARK LAYER
// -----------------------------------------------------------------------------
function drawLogoWatermark(
  ctx: SKRSContext2D,
  frame: number,
  width: number,
  height: number,
  template: VideoTemplate,
  channel: Channel,
  loadedImages: Map<string, Image>
): void {
  const style = template.components.logo;
  const showLogo = style?.showLogo ?? channel.branding.identity.showLogo ?? true;
  const showName = style?.showChannelName ?? channel.branding.identity.showChannelName ?? false;
  const logoUrl = channel.branding.identity.logoUrl || channel.branding.identity.avatarUrl;
  const channelName = style?.channelName || channel.branding.identity.channelName;

  if (!showLogo && !showName) return;

  const left = ((style?.x ?? 75) / 100) * width;
  const top = ((style?.y ?? 8) / 100) * height;
  const logoSize = style?.logoSize || 42;
  const opacity = style?.opacity ?? channel.branding.identity.watermarkOpacity ?? 0.9;

  ctx.save();
  ctx.globalAlpha = opacity;

  let currentX = left;
  if (showLogo && logoUrl) {
    const img = loadedImages.get(logoUrl);
    if (img) {
      ctx.drawImage(img, currentX, top, logoSize, logoSize);
      currentX += logoSize + 8;
    }
  }

  if (showName && channelName) {
    ctx.fillStyle = style?.color || channel.branding.colors.primary || '#ffffff';
    ctx.font = `800 ${style?.fontSize || 18}px "Be Vietnam Pro", "Montserrat", sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 8;
    ctx.fillText(channelName, currentX, top + logoSize / 2);
  }

  ctx.restore();
}

// -----------------------------------------------------------------------------
// 4. QUESTION SEQUENCE LAYER
// -----------------------------------------------------------------------------
function drawQuestionSequence(
  ctx: SKRSContext2D,
  frame: number,
  width: number,
  height: number,
  fps: number,
  channel: Channel,
  template: VideoTemplate,
  question: any,
  cue: TimelineQuestionCue,
  totalQuestions: number,
  loadedImages: Map<string, Image>
): void {
  const relFrame = frame - cue.startFrame;
  const relCountdownStart = Math.max(0, cue.phases.countdownStart - cue.startFrame);
  const relCountdownEnd = Math.max(0, cue.phases.countdownEnd - cue.startFrame);
  const relRevealStart = Math.max(0, cue.phases.revealStart - cue.startFrame);

  const isRevealed = relFrame >= relRevealStart;
  const revealProgress = isRevealed ? Math.min(1, (relFrame - relRevealStart) / (fps * 1.5)) : 0;

  const comps = template.components;
  const primaryColor = channel.branding.colors.primary || '#2563eb';
  const correctColor = channel.branding.colors.correct || '#16a34a';
  const wrongColor = channel.branding.colors.wrong || '#dc2626';

  const hasIllustration = Boolean(question.illustrations && question.illustrations.filter(Boolean).length > 0);

  // Transition handling between questions
  const transitionFrames = template.timing?.transitionFrames || 15;
  const isLastQuestion = cue.questionIndex === totalQuestions - 1;
  const isTransitioningIn = cue.questionIndex > 0 && relFrame < transitionFrames;
  const isTransitioningOut = !isLastQuestion && relFrame >= cue.durationFrames - transitionFrames;

  let containerOpacity = 1.0;
  let containerTranslateX = 0;

  if (isTransitioningIn) {
    const enterProgress = Math.min(1, relFrame / transitionFrames);
    containerTranslateX = interpolate(enterProgress, [0, 1], [width, 0], { extrapolateRight: 'clamp' });
    containerOpacity = interpolate(enterProgress, [0, 1], [0.4, 1], { extrapolateRight: 'clamp' });
  } else if (isTransitioningOut) {
    const exitProgress = Math.min(1, (relFrame - (cue.durationFrames - transitionFrames)) / transitionFrames);
    containerTranslateX = interpolate(exitProgress, [0, 1], [0, -width], { extrapolateRight: 'clamp' });
    containerOpacity = interpolate(exitProgress, [0, 1], [1, 0.3], { extrapolateRight: 'clamp' });
  }

  ctx.save();
  ctx.globalAlpha = containerOpacity;
  ctx.translate(containerTranslateX, 0);

  // 1. Question Number Badge (e.g. CÂU 1 / 3)
  drawQuestionNumberBadge(ctx, relFrame, width, height, fps, comps.questionNumber, cue.questionIndex, totalQuestions, primaryColor);

  // 2. Illustration Frame
  if (hasIllustration) {
    drawIllustrationFrame(ctx, relFrame, width, height, fps, comps.illustration, question.illustrations[0], primaryColor, loadedImages);
  }

  // 3. Question Box
  drawQuestionBox(ctx, relFrame, width, height, fps, comps.questionBox, question.question, hasIllustration, primaryColor);

  // 4. 3 Answer Option Cards (A, B, C)
  drawAnswerCards(
    ctx,
    relFrame,
    width,
    height,
    fps,
    comps.answerButtons,
    question.options,
    question.correctAnswer as OptionKey,
    isRevealed,
    relRevealStart,
    primaryColor,
    correctColor,
    wrongColor
  );

  // 5. Countdown Timer
  if (relFrame >= relCountdownStart && relFrame < relCountdownEnd) {
    drawCountdownTimer(ctx, relFrame, width, height, fps, comps.countdown, template.countdownStyle, relCountdownStart, relCountdownEnd, primaryColor, wrongColor);
  }

  // 6. Explanation Card (upon reveal)
  if (isRevealed && question.explanation) {
    drawExplanationCard(ctx, relFrame, width, height, fps, relRevealStart, question.explanation, correctColor);
  }

  ctx.restore();
}

// -----------------------------------------------------------------------------
// 5. QUESTION NUMBER BADGE
// -----------------------------------------------------------------------------
function drawQuestionNumberBadge(
  ctx: SKRSContext2D,
  relFrame: number,
  width: number,
  height: number,
  fps: number,
  style: any,
  qIndex: number,
  totalQ: number,
  primaryColor: string
): void {
  const badgeW = ((style.width ?? 80) / 100) * width;
  const badgeH = ((style.height ?? 5) / 100) * height;
  const left = style.x !== undefined ? (style.x / 100) * width : (width - badgeW) / 2;
  const top = ((style.y ?? 14) / 100) * height;

  const qNumFormat = style.format || 'câu-n';
  const qNumText = qNumFormat === 'q-n'
    ? `QUESTION ${qIndex + 1}/${totalQ}`
    : qNumFormat === 'badge'
    ? `Q${qIndex + 1}`
    : `CÂU ${qIndex + 1} / ${totalQ}`;

  let opacity = 1.0;
  if (qIndex === 0 && relFrame < 25) {
    opacity = getEntranceTransform(style.animation || 'fade', relFrame, fps, 2).opacity;
  }

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = style.color || primaryColor;
  ctx.font = `700 ${style.fontSize || 20}px "Be Vietnam Pro", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(qNumText, left + badgeW / 2, top + badgeH / 2);
  ctx.restore();
}

// -----------------------------------------------------------------------------
// 6. ILLUSTRATION FRAME
// -----------------------------------------------------------------------------
function drawIllustrationFrame(
  ctx: SKRSContext2D,
  relFrame: number,
  width: number,
  height: number,
  fps: number,
  style: any,
  imageUrl: string,
  primaryColor: string,
  loadedImages: Map<string, Image>
): void {
  const cardW = ((style.width ?? 84) / 100) * width;
  const cardH = ((style.height ?? 24) / 100) * height;
  const left = style.x !== undefined ? (style.x / 100) * width : (width - cardW) / 2;
  const top = ((style.y ?? 20) / 100) * height;
  const radius = style.borderRadius ?? 20;

  const img = loadedImages.get(imageUrl);
  if (!img) return;

  const zoomScale = interpolate(relFrame, [0, 300], [1.0, 1.06], { extrapolateRight: 'clamp' });

  ctx.save();
  // Shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 8;

  // Background box
  ctx.fillStyle = '#ffffff';
  drawRoundedRect(ctx, left, top, cardW, cardH, radius);
  ctx.fill();

  ctx.shadowColor = 'transparent';
  if (style.borderWidth) {
    ctx.strokeStyle = style.borderColor || '#bfdbfe';
    ctx.lineWidth = style.borderWidth;
    ctx.stroke();
  }

  // Clip rounded rect and draw image
  ctx.save();
  drawRoundedRect(ctx, left, top, cardW, cardH, radius);
  ctx.clip();

  ctx.translate(left + cardW / 2, top + cardH / 2);
  ctx.scale(zoomScale, zoomScale);

  const imgAspect = img.width / img.height;
  const boxAspect = cardW / cardH;
  let drawW = cardW;
  let drawH = cardH;
  if (imgAspect > boxAspect) {
    drawH = cardH;
    drawW = cardH * imgAspect;
  } else {
    drawW = cardW;
    drawH = cardW / imgAspect;
  }
  ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

  ctx.restore();
  ctx.restore();
}

// -----------------------------------------------------------------------------
// 7. QUESTION BOX
// -----------------------------------------------------------------------------
function drawQuestionBox(
  ctx: SKRSContext2D,
  relFrame: number,
  width: number,
  height: number,
  fps: number,
  style: any,
  questionText: string,
  hasIllustration: boolean,
  primaryColor: string
): void {
  const effectiveY = !hasIllustration ? Math.max(22, (style.y ?? 46) - 12) : (style.y ?? 46);
  const effectiveH = !hasIllustration ? Math.min(30, (style.height ?? 16) + 10) : (style.height ?? 16);

  const cardW = ((style.width ?? 88) / 100) * width;
  const cardH = (effectiveH / 100) * height;
  const left = style.x !== undefined ? (style.x / 100) * width : (width - cardW) / 2;
  const top = (effectiveY / 100) * height;
  const radius = style.borderRadius ?? 20;

  // Entrance
  let opacity = 1.0;
  let scale = 1.0;
  if (relFrame < 25 && style.animation !== 'none') {
    const ent = getEntranceTransform(style.animation || 'pop', relFrame, fps, 0);
    opacity = ent.opacity;
    scale = ent.scale;
  }

  ctx.save();
  ctx.globalAlpha = opacity;

  ctx.translate(left + cardW / 2, top + cardH / 2);
  ctx.scale(scale, scale);
  ctx.translate(-(left + cardW / 2), -(top + cardH / 2));

  // Glow / Shadow
  if (style.glowRadius && style.glowRadius > 0) {
    ctx.shadowColor = style.glowColor || 'rgba(56, 189, 248, 0.45)';
    ctx.shadowBlur = style.glowRadius;
  } else {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 6;
  }

  // Card background
  const opacityVal = style.bgOpacity !== undefined ? style.bgOpacity : 0.95;
  ctx.fillStyle = parseColor(style.backgroundColor || '#ffffff', opacityVal);
  drawRoundedRect(ctx, left, top, cardW, cardH, radius);
  ctx.fill();

  // Border
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = style.borderColor || primaryColor || '#38bdf8';
  ctx.lineWidth = style.borderWidth !== undefined ? style.borderWidth : 2;
  ctx.stroke();

  // Question Text (Multiline wrapped)
  const fontSize = style.fontSize || 24;
  ctx.fillStyle = style.textColor || style.color || '#0f172a';
  ctx.font = `${style.fontWeight || '700'} ${fontSize}px "Be Vietnam Pro", sans-serif`;
  ctx.textAlign = style.textAlign || 'center';
  ctx.textBaseline = 'middle';

  const maxTextW = cardW - 48;
  const lines = wrapText(ctx, questionText, maxTextW, 4);
  const lineSpacing = fontSize * 1.35;
  const startY = top + cardH / 2 - ((lines.length - 1) * lineSpacing) / 2;
  const textX = (style.textAlign === 'left') ? (left + 24) : (left + cardW / 2);

  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], textX, startY + i * lineSpacing);
  }

  ctx.restore();
}

// -----------------------------------------------------------------------------
// 8. 3 ANSWER CARDS (A, B, C)
// -----------------------------------------------------------------------------
function drawAnswerCards(
  ctx: SKRSContext2D,
  relFrame: number,
  width: number,
  height: number,
  fps: number,
  style: any,
  options: { A: string; B: string; C: string },
  correctAnswer: OptionKey,
  isRevealed: boolean,
  revealStartFrame: number,
  primaryColor: string,
  correctColor: string,
  wrongColor: string
): void {
  const cardW = ((style.width ?? 88) / 100) * width;
  const cardH = ((style.height ?? 20) / 100) * height;
  const left = style.x !== undefined ? (style.x / 100) * width : (width - cardW) / 2;
  const top = ((style.y ?? 63) / 100) * height;
  const gap = style.gap ?? 12;
  const radius = style.borderRadius ?? 16;
  const borderWidth = style.borderWidth !== undefined ? style.borderWidth : 2;

  const keys: OptionKey[] = ['A', 'B', 'C'];
  const singleCardH = (cardH - gap * (keys.length - 1)) / keys.length;

  // Spring pulse for correct card
  const revealFrame = isRevealed ? Math.max(0, relFrame - revealStartFrame) : 0;
  const correctPulse = spring({
    frame: revealFrame,
    fps,
    config: { damping: 12, stiffness: 140 }
  });
  const pulseScale = interpolate(correctPulse, [0, 1], [1.0, 1.04], { extrapolateRight: 'clamp' });

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const isCorrect = key === correctAnswer;
    const cardTop = top + i * (singleCardH + gap);

    // Staggered entrance
    let opacity = 1.0;
    let translateY = 0;
    if (relFrame < 35 && style.animation !== 'none') {
      const ent = getEntranceTransform(style.animation || 'slide-up', relFrame, fps, i * 4);
      opacity = ent.opacity;
      translateY = ent.translateY;
    }

    ctx.save();
    ctx.translate(0, translateY);

    let cardOpacity = opacity;
    let cardScale = 1.0;
    let borderColor = style.borderColor || `${primaryColor}66`;
    let textColor = style.textColor || style.color || '#0f172a';

    if (isRevealed) {
      if (isCorrect) {
        borderColor = '#4ade80';
        textColor = '#ffffff';
        cardScale = pulseScale;
      } else {
        cardOpacity *= 0.35;
      }
    }

    ctx.globalAlpha = cardOpacity;

    // Scale pulse
    if (cardScale !== 1.0) {
      ctx.translate(left + cardW / 2, cardTop + singleCardH / 2);
      ctx.scale(cardScale, cardScale);
      ctx.translate(-(left + cardW / 2), -(cardTop + singleCardH / 2));
    }

    // Shadow & glow
    if (isRevealed && isCorrect) {
      ctx.shadowColor = 'rgba(34, 197, 94, 0.75)';
      ctx.shadowBlur = 30;
    } else {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 4;
    }

    // Fill Card Background
    if (isRevealed && isCorrect) {
      const grad = ctx.createLinearGradient(left, cardTop, left + cardW, cardTop + singleCardH);
      grad.addColorStop(0, '#15803d');
      grad.addColorStop(1, '#22c55e');
      ctx.fillStyle = grad;
    } else {
      const opacityVal = style.bgOpacity !== undefined ? style.bgOpacity : 0.88;
      ctx.fillStyle = parseColor(style.backgroundColor || '#ffffff', opacityVal);
    }
    drawRoundedRect(ctx, left, cardTop, cardW, singleCardH, radius);
    ctx.fill();

    // Border
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth;
    ctx.stroke();

    // Option Badge (A, B, C or checkmark)
    const badgeSize = 42;
    const badgeX = left + 18;
    const badgeY = cardTop + (singleCardH - badgeSize) / 2;

    ctx.beginPath();
    ctx.arc(badgeX + badgeSize / 2, badgeY + badgeSize / 2, badgeSize / 2, 0, Math.PI * 2);
    if (isRevealed && isCorrect) {
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.fillStyle = '#15803d';
      ctx.font = '900 24px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✓', badgeX + badgeSize / 2, badgeY + badgeSize / 2);
    } else {
      ctx.fillStyle = `${primaryColor}22`;
      ctx.fill();
      ctx.strokeStyle = `${primaryColor}66`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = primaryColor;
      ctx.font = '900 20px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(key, badgeX + badgeSize / 2, badgeY + badgeSize / 2);
    }

    // Option Text
    const textX = badgeX + badgeSize + 16;
    const textY = cardTop + singleCardH / 2;
    ctx.fillStyle = textColor;
    ctx.font = `${style.fontWeight || '700'} ${style.fontSize || 22}px "Be Vietnam Pro", sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    const maxOptionW = cardW - (badgeSize + 48);
    const optionText = options[key] || '';
    ctx.fillText(optionText, textX, textY, maxOptionW);

    ctx.restore();
  }
}

// -----------------------------------------------------------------------------
// 9. COUNTDOWN TIMER
// -----------------------------------------------------------------------------
function drawCountdownTimer(
  ctx: SKRSContext2D,
  relFrame: number,
  width: number,
  height: number,
  fps: number,
  style: any,
  countdownStyle: string,
  countdownStartFrame: number,
  countdownEndFrame: number,
  primaryColor: string,
  warningColor: string
): void {
  const totalFrames = Math.max(1, countdownEndFrame - countdownStartFrame);
  const elapsed = Math.max(0, Math.min(totalFrames, relFrame - countdownStartFrame));
  const remainingFraction = Math.max(0, Math.min(1, 1 - elapsed / totalFrames));

  const remainingFrames = Math.max(0, countdownEndFrame - relFrame);
  const remainingSec = Math.max(1, Math.ceil(remainingFrames / 30));
  const isUrgent = remainingSec <= 2;
  const activeColor = isUrgent ? warningColor : (style.color || primaryColor);

  const centerX = width / 2;
  const centerY = ((style.y ?? 42) / 100) * height;
  const size = 84;
  const strokeW = style.strokeWidth || 6;
  const radius = size / 2 - strokeW;

  ctx.save();
  ctx.translate(centerX, centerY);

  // Background track
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = strokeW;
  ctx.stroke();

  // Progress arc
  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + remainingFraction * (Math.PI * 2);
  ctx.beginPath();
  ctx.arc(0, 0, radius, startAngle, endAngle, false);
  ctx.strokeStyle = activeColor;
  ctx.lineWidth = strokeW;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Number
  ctx.fillStyle = activeColor;
  ctx.font = `900 ${style.fontSize || 32}px "Be Vietnam Pro", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(remainingSec), 0, 0);

  ctx.restore();
}

// -----------------------------------------------------------------------------
// 10. EXPLANATION CARD
// -----------------------------------------------------------------------------
function drawExplanationCard(
  ctx: SKRSContext2D,
  relFrame: number,
  width: number,
  height: number,
  fps: number,
  relRevealStart: number,
  explanation: string,
  correctColor: string
): void {
  const cardW = 0.88 * width;
  const left = 0.06 * width;
  const bottom = 0.07 * height;
  const cardH = 88;
  const top = height - bottom - cardH;
  const radius = 16;

  // Entrance animation
  const expEntrance = interpolate(relFrame - relRevealStart, [0, 8], [0, 1], { extrapolateRight: 'clamp' });
  const translateY = interpolate(expEntrance, [0, 1], [15, 0], { extrapolateRight: 'clamp' });

  ctx.save();
  ctx.globalAlpha = expEntrance;
  ctx.translate(0, translateY);

  // Shadow
  ctx.shadowColor = 'rgba(22, 163, 74, 0.2)';
  ctx.shadowBlur = 25;
  ctx.shadowOffsetY = 8;

  // Background
  ctx.fillStyle = '#ffffff';
  drawRoundedRect(ctx, left, top, cardW, cardH, radius);
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = correctColor;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Icon
  ctx.font = '26px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('💡', left + 36, top + cardH / 2);

  // Explanation Title
  ctx.fillStyle = correctColor;
  ctx.font = '800 13px "Be Vietnam Pro", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('GIẢI THÍCH / EXPLANATION', left + 68, top + 18);

  // Explanation Body
  ctx.fillStyle = '#1e293b';
  ctx.font = '600 15px "Be Vietnam Pro", sans-serif';
  const lines = wrapText(ctx, explanation, cardW - 88, 2);
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], left + 68, top + 40 + i * 20);
  }

  ctx.restore();
}
