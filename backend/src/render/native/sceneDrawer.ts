import type { SKRSContext2D, Image } from '@napi-rs/canvas';
import { interpolate, spring } from 'remotion';
import { Channel, VideoTemplate, Quiz, TimelineQuestionCue, OptionKey } from '../../../../remotion/types/index.js';
import { parseColor, drawRoundedRect, wrapText, getEntranceTransform, drawShapePath, drawHexagonPath } from './canvasHelper.js';
import { resolveOptionLayout } from '../../../../remotion/utils/answerLayoutHelper.js';

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
    drawProceduralDynamicBackground(ctx, frame, width, height, bgStyle, channel);
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

function drawProceduralDynamicBackground(
  ctx: SKRSContext2D,
  frame: number,
  width: number,
  height: number,
  bgStyle: any,
  channel: Channel
): void {
  let presetId = bgStyle.neonPresetId || 'neon-gradient';
  if (presetId === 'particles') presetId = 'light-particles';
  if (presetId === 'light-streaks') presetId = 'energy-lines';

  const speed = bgStyle.neonSpeed ?? bgStyle.motion?.speed ?? 1.0;
  const intensity = bgStyle.neonIntensity ?? bgStyle.motion?.intensity ?? 1.0;
  const c1 = bgStyle.neonColor1 || bgStyle.motion?.color1 || channel.branding.colors.primary || '#00f0ff';
  const c2 = bgStyle.neonColor2 || bgStyle.motion?.color2 || '#ff007f';
  const c3 = bgStyle.neonColor3 || bgStyle.motion?.color3 || '#7928ca';
  const opacity = bgStyle.opacity ?? bgStyle.motion?.opacity ?? 1.0;
  const zoomScale = bgStyle.motion?.zoomScale ?? 1.0;
  const direction = bgStyle.motion?.direction || 'down';
  const movement = (bgStyle.motion?.movement ?? 25) / 25;

  const t = (frame / 30) * Math.max(0.2, speed);

  ctx.save();
  if (opacity < 1.0) {
    ctx.globalAlpha = Math.max(0.1, opacity);
  }
  if (zoomScale > 1.0) {
    ctx.translate(width / 2, height / 2);
    ctx.scale(zoomScale, zoomScale);
    ctx.translate(-width / 2, -height / 2);
  }

  // 1. NEON GRADIENT
  if (presetId === 'neon-gradient') {
    ctx.fillStyle = '#050512';
    ctx.fillRect(0, 0, width, height);

    const fx1 = width * (0.5 + Math.sin(t * 1.05) * 0.3);
    const fy1 = height * (0.35 + Math.cos(t * 0.9) * 0.25);
    const g1 = ctx.createRadialGradient(fx1, fy1, 10, fx1, fy1, width * 0.7);
    g1.addColorStop(0, parseColor(c1, 0.45 * intensity));
    g1.addColorStop(1, 'rgba(5, 5, 18, 0)');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, width, height);

    const fx2 = width * (0.5 - Math.sin(t * 0.75) * 0.3);
    const fy2 = height * (0.7 - Math.cos(t * 1.05) * 0.2);
    const g2 = ctx.createRadialGradient(fx2, fy2, 10, fx2, fy2, width * 0.65);
    g2.addColorStop(0, parseColor(c2, 0.4 * intensity));
    g2.addColorStop(1, 'rgba(5, 5, 18, 0)');
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, width, height);

    const angle = (135 + Math.sin(t * 0.75) * 45) * (Math.PI / 180);
    const g3 = ctx.createLinearGradient(0, 0, Math.cos(angle) * width, Math.sin(angle) * height);
    g3.addColorStop(0, parseColor(c3, 0.3 * intensity));
    g3.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g3;
    ctx.fillRect(0, 0, width, height);
  }
  // 2. CYBER GLOW
  else if (presetId === 'cyber-glow') {
    ctx.fillStyle = '#04040d';
    ctx.fillRect(0, 0, width, height);

    const orb1X = width * (0.35 + Math.sin(t * 0.84) * 0.22);
    const orb1Y = height * (0.30 + Math.cos(t * 0.96) * 0.20);
    const r1 = width * (0.35 + Math.sin(t * 1.2) * 0.06);
    const g1 = ctx.createRadialGradient(orb1X, orb1Y, 5, orb1X, orb1Y, r1);
    g1.addColorStop(0, parseColor(c1, 0.5 * intensity));
    g1.addColorStop(1, 'rgba(4, 4, 13, 0)');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, width, height);

    const orb2X = width * (0.65 + Math.cos(t * 0.72) * 0.22);
    const orb2Y = height * (0.65 + Math.sin(t * 1.05) * 0.18);
    const r2 = width * (0.4 + Math.cos(t * 1.35) * 0.05);
    const g2 = ctx.createRadialGradient(orb2X, orb2Y, 5, orb2X, orb2Y, r2);
    g2.addColorStop(0, parseColor(c2, 0.45 * intensity));
    g2.addColorStop(1, 'rgba(4, 4, 13, 0)');
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, width, height);
  }
  // 3. LIGHT WAVES
  else if (presetId === 'light-waves') {
    ctx.fillStyle = '#05030f';
    ctx.fillRect(0, 0, width, height);

    const g0 = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, width);
    g0.addColorStop(0, parseColor(c3, 0.25 * intensity));
    g0.addColorStop(1, 'rgba(5, 3, 15, 0)');
    ctx.fillStyle = g0;
    ctx.fillRect(0, 0, width, height);

    const waveConfigs = [
      { baseY: height * 0.35, amp: 45 * movement, color: c1, speedMult: 1.2, freq: 0.008 },
      { baseY: height * 0.55, amp: 60 * movement, color: c2, speedMult: 0.9, freq: 0.007 },
      { baseY: height * 0.75, amp: 50 * movement, color: c3, speedMult: 1.5, freq: 0.009 }
    ];

    for (const w of waveConfigs) {
      ctx.beginPath();
      ctx.strokeStyle = parseColor(w.color, 0.7 * intensity);
      ctx.lineWidth = 3;
      for (let x = 0; x <= width; x += 15) {
        const y = w.baseY + Math.sin(x * w.freq + t * w.speedMult) * w.amp + Math.cos(x * 0.004 + t * 0.5) * (w.amp * 0.4);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }
  // 4. NEON GRID
  else if (presetId === 'neon-grid') {
    ctx.fillStyle = '#060012';
    ctx.fillRect(0, 0, width, height);

    const horizonY = height * 0.42;
    const horizonGrad = ctx.createRadialGradient(width / 2, horizonY, 5, width / 2, horizonY, width * 0.6);
    horizonGrad.addColorStop(0, parseColor(c2, 0.6 * intensity));
    horizonGrad.addColorStop(1, 'rgba(6, 0, 18, 0)');
    ctx.fillStyle = horizonGrad;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = parseColor(c1, 0.25 * intensity);
    ctx.lineWidth = 1.5;
    for (let i = -10; i <= 10; i++) {
      ctx.beginPath();
      ctx.moveTo(width / 2 + i * 25, horizonY);
      ctx.lineTo(width / 2 + i * 160, height);
      ctx.stroke();
    }

    const offset = (t * 50) % 35;
    for (let y = horizonY + 10; y < height; y += 35) {
      const lineY = y + offset;
      if (lineY >= height) continue;
      const progress = (lineY - horizonY) / (height - horizonY);
      ctx.strokeStyle = parseColor(c1, 0.4 * progress * intensity);
      ctx.lineWidth = 1 + progress * 2;
      ctx.beginPath();
      ctx.moveTo(0, lineY);
      ctx.lineTo(width, lineY);
      ctx.stroke();
    }
  }
  // 5. ENERGY LINES / LIGHT STREAKS
  else if (presetId === 'energy-lines') {
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, width, height);

    const streaks = [
      { x: 0.12, speed: 450, len: 160, col: c1 },
      { x: 0.25, speed: 600, len: 220, col: c2 },
      { x: 0.40, speed: 520, len: 180, col: c3 },
      { x: 0.58, speed: 680, len: 240, col: '#ffffff' },
      { x: 0.72, speed: 490, len: 170, col: c1 },
      { x: 0.88, speed: 580, len: 200, col: c2 },
      { x: 0.32, speed: 420, len: 140, col: c3 },
      { x: 0.80, speed: 650, len: 210, col: '#ffffff' }
    ];

    for (const s of streaks) {
      const rawPos = ((t * s.speed) % (height + s.len * 2)) - s.len;
      const y = direction === 'up' ? height - rawPos - s.len : rawPos;
      const streakGrad = ctx.createLinearGradient(0, y, 0, y + s.len);
      streakGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      streakGrad.addColorStop(0.7, parseColor(s.col, 0.8 * intensity));
      streakGrad.addColorStop(1, '#ffffff');

      ctx.fillStyle = streakGrad;
      ctx.fillRect(s.x * width, y, 3, s.len);
    }
  }
  // 6. LIGHT PARTICLES / PARTICLES
  else if (presetId === 'light-particles') {
    ctx.fillStyle = '#050515';
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < 24; i++) {
      const baseX = ((i * 13.5 + 4) % 94) / 100 * width;
      const baseY = ((i * 47) % 1280);
      const sway = Math.sin(t * 1.5 + i * 1.3) * 25 * movement;
      const rawY = ((baseY - t * 45 * (0.8 + (i % 3) * 0.3)) % (height + 60));
      const curY = rawY < -30 ? height + rawY : rawY;
      const y = direction === 'down' ? height - curY : curY;
      const r = 10 + (i % 5) * 6;
      const clr = (i % 3 === 0) ? c1 : (i % 3 === 1) ? c2 : c3;

      const pGrad = ctx.createRadialGradient(baseX + sway, y, 2, baseX + sway, y, r);
      pGrad.addColorStop(0, parseColor(clr, 0.6 * intensity));
      pGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = pGrad;
      ctx.beginPath();
      ctx.arc(baseX + sway, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // 7. GEOMETRIC NEON
  else if (presetId === 'geometric-neon') {
    ctx.fillStyle = '#030014';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(width / 2, height / 2);

    ctx.save();
    ctx.rotate(t * 0.6);
    ctx.strokeStyle = parseColor(c1, 0.45 * intensity);
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-120, -120, 240, 240);
    ctx.restore();

    ctx.save();
    ctx.rotate(-t * 0.4);
    ctx.strokeStyle = parseColor(c2, 0.4 * intensity);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, width * 0.42, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }
  // 8. AURORA NEON
  else if (presetId === 'aurora-neon') {
    ctx.fillStyle = '#020510';
    ctx.fillRect(0, 0, width, height);

    const wave1 = Math.sin(t * 0.8) * 40;
    const wave2 = Math.cos(t * 0.7) * 35;

    const aGrad1 = ctx.createRadialGradient(width * 0.4 + wave1, height * 0.35, 10, width * 0.4 + wave1, height * 0.35, width * 0.7);
    aGrad1.addColorStop(0, parseColor(c1, 0.45 * intensity));
    aGrad1.addColorStop(1, 'rgba(2, 5, 16, 0)');
    ctx.fillStyle = aGrad1;
    ctx.fillRect(0, 0, width, height);

    const aGrad2 = ctx.createRadialGradient(width * 0.6 - wave2, height * 0.55, 10, width * 0.6 - wave2, height * 0.55, width * 0.65);
    aGrad2.addColorStop(0, parseColor(c2, 0.4 * intensity));
    aGrad2.addColorStop(1, 'rgba(2, 5, 16, 0)');
    ctx.fillStyle = aGrad2;
    ctx.fillRect(0, 0, width, height);
  }
  // 9. GRADIENT MOTION
  else {
    const angle = (t * 45) % 360;
    const rad = angle * (Math.PI / 180);
    const grad = ctx.createLinearGradient(
      width / 2 - Math.cos(rad) * (width / 2),
      height / 2 - Math.sin(rad) * (height / 2),
      width / 2 + Math.cos(rad) * (width / 2),
      height / 2 + Math.sin(rad) * (height / 2)
    );
    grad.addColorStop(0, parseColor(c1, intensity));
    grad.addColorStop(0.5, parseColor(c2, intensity));
    grad.addColorStop(1, parseColor(c3, intensity));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  // Overlay if configured
  if (bgStyle.overlayOpacity && bgStyle.overlayOpacity > 0) {
    ctx.fillStyle = bgStyle.overlayColor || '#000000';
    ctx.globalAlpha = bgStyle.overlayOpacity;
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1.0;
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
  if (!style || style.enabled === false) return;

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
  const identity = channel.branding?.identity;
  const showLogo = style?.showLogo ?? identity?.showLogo ?? false;
  const showName = style?.showChannelName ?? identity?.showChannelName ?? false;
  const logoUrl = (style as any)?.logoUrl || identity?.logoUrl || identity?.avatarUrl;
  const channelName = style?.channelName || identity?.channelName;

  if (!showLogo && !showName) return;
  if (!logoUrl && !channelName) return;

  const left = ((style?.x ?? 75) / 100) * width;
  const top = ((style?.y ?? 8) / 100) * height;
  const logoSize = style?.logoSize || 42;
  const opacity = style?.opacity ?? identity?.watermarkOpacity ?? 0.9;

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
    ctx.fillStyle = style?.color || channel.branding?.colors?.primary || '#ffffff';
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
  if (isRevealed && question.explanation && (comps.explanation?.enabled !== false)) {
    drawExplanationCard(ctx, relFrame, width, height, fps, relRevealStart, question.explanation, correctColor, comps.explanation);
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
  const s = style || {};
  const badgeW = ((s.width ?? 80) / 100) * width;
  const badgeH = ((s.height ?? 5) / 100) * height;
  const left = s.x !== undefined ? (s.x / 100) * width : (width - badgeW) / 2;
  const top = ((s.y ?? 14) / 100) * height;

  const qNumFormat = s.format || 'câu-n';
  const qNumText = qNumFormat === 'q-n'
    ? `QUESTION ${qIndex + 1}/${totalQ}`
    : qNumFormat === 'badge'
    ? `Q${qIndex + 1}`
    : `CÂU ${qIndex + 1} / ${totalQ}`;

  let opacity = 1.0;
  if (qIndex === 0 && relFrame < 25) {
    opacity = getEntranceTransform(s.animation || 'fade', relFrame, fps, 2).opacity;
  }

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = s.color || primaryColor;
  ctx.font = `700 ${s.fontSize || 20}px "Be Vietnam Pro", sans-serif`;
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
  const s = style || {};
  const isBelowIllustration = (s.y ?? 46) >= 35;
  const effectiveY = (!hasIllustration && isBelowIllustration) ? Math.max(20, (s.y ?? 46) - 12) : (s.y ?? 20);
  const effectiveH = (!hasIllustration && isBelowIllustration) ? Math.min(26, (s.height ?? 16) + 6) : (s.height ?? 20);

  const cardW = ((s.width ?? 88) / 100) * width;
  const cardH = (effectiveH / 100) * height;
  const left = s.x !== undefined ? (s.x / 100) * width : (width - cardW) / 2;
  const top = (effectiveY / 100) * height;
  const radius = s.borderRadius ?? 20;

  // Entrance
  let opacity = 1.0;
  let scale = 1.0;
  if (relFrame < 25 && s.animation !== 'none') {
    const ent = getEntranceTransform(s.animation || 'pop', relFrame, fps, 0);
    opacity = ent.opacity;
    scale = ent.scale;
  }

  ctx.save();
  ctx.globalAlpha = opacity;

  ctx.translate(left + cardW / 2, top + cardH / 2);
  ctx.scale(scale, scale);
  ctx.translate(-(left + cardW / 2), -(top + cardH / 2));

  // Pop Art drop shadow
  if (s.popShadow) {
    const pOff = s.popShadowOffset || 6;
    ctx.fillStyle = s.popShadowColor || '#111827';
    drawShapePath(ctx, left + pOff, top + pOff, cardW, cardH, s);
    ctx.fill();
  }

  // Glow / Shadow
  if (s.glowRadius && s.glowRadius > 0) {
    ctx.shadowColor = s.glowColor || 'rgba(56, 189, 248, 0.45)';
    ctx.shadowBlur = s.glowRadius;
  } else if (!s.popShadow && s.shape !== 'minimal') {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 6;
  }

  // Card background
  const opacityVal = s.bgOpacity !== undefined ? s.bgOpacity : 0.95;
  if (s.shape !== 'minimal') {
    ctx.fillStyle = parseColor(s.backgroundColor || '#ffffff', opacityVal);
    drawShapePath(ctx, left, top, cardW, cardH, s);
    ctx.fill();
  }

  // Border
  ctx.shadowColor = 'transparent';
  if ((s.borderWidth || 0) > 0 && s.shape !== 'minimal') {
    ctx.strokeStyle = s.borderColor || primaryColor || '#38bdf8';
    ctx.lineWidth = s.borderWidth !== undefined ? s.borderWidth : 2;
    if (s.borderStyle === 'dashed') {
      ctx.setLineDash([8, 6]);
    } else {
      ctx.setLineDash([]);
    }
    drawShapePath(ctx, left, top, cardW, cardH, s);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Minimal underline
  if (s.shape === 'minimal') {
    ctx.fillStyle = s.borderColor || primaryColor || 'rgba(255,255,255,0.4)';
    const barW = 60;
    ctx.fillRect(left + (cardW - barW) / 2, top + cardH - 6, barW, 2);
  }

  // Question Text (Multiline wrapped)
  const fontSize = s.fontSize || 24;
  ctx.fillStyle = s.textColor || s.color || '#0f172a';
  ctx.font = `${s.fontWeight || '700'} ${fontSize}px "Be Vietnam Pro", sans-serif`;
  ctx.textAlign = s.textAlign || 'center';
  ctx.textBaseline = 'middle';

  const maxTextW = cardW - 48;
  const lines = wrapText(ctx, questionText, maxTextW, 4);
  const lineSpacing = fontSize * 1.35;
  const startY = top + cardH / 2 - ((lines.length - 1) * lineSpacing) / 2;
  const textX = (s.textAlign === 'left') ? (left + 24) : (left + cardW / 2);

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
  options: any,
  correctAnswer: OptionKey,
  isRevealed: boolean,
  revealStartFrame: number,
  primaryColor: string,
  correctColor: string,
  wrongColor: string
): void {
  const availableKeys = (Object.keys(options || {}) as OptionKey[])
    .filter(k => options[k] !== undefined && options[k] !== '')
    .sort();
  const keys: OptionKey[] = availableKeys.length > 0 ? availableKeys : ['A', 'B', 'C'];

  const normalizedCorrect = (correctAnswer || 'A').toString().trim().toUpperCase().slice(0, 1) as OptionKey;

  const revealFrame = isRevealed ? Math.max(0, relFrame - revealStartFrame) : 0;
  const correctPulse = spring({
    frame: revealFrame,
    fps,
    config: { damping: 12, stiffness: 140 }
  });
  const pulseScale = interpolate(correctPulse, [0, 1], [1.0, 1.04], { extrapolateRight: 'clamp' });

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const isCorrect = key === normalizedCorrect;
    const layout = resolveOptionLayout(key, i, keys.length, style, primaryColor);

    const cardW = (layout.width / 100) * width;
    const cardH = (layout.height / 100) * height;
    const left = (layout.x / 100) * width;
    const cardTop = (layout.y / 100) * height;

    // Staggered entrance
    let opacity = 1.0;
    let translateY = 0;
    if (relFrame < 35 && style?.animation !== 'none') {
      const ent = getEntranceTransform(style?.animation || 'slide-up', relFrame, fps, i * 4);
      opacity = ent.opacity;
      translateY = ent.translateY;
    }

    ctx.save();
    ctx.translate(0, translateY);

    // Rotation support (e.g. for doodle stickers)
    if (layout.rotation) {
      ctx.translate(left + cardW / 2, cardTop + cardH / 2);
      ctx.rotate((layout.rotation * Math.PI) / 180);
      ctx.translate(-(left + cardW / 2), -(cardTop + cardH / 2));
    }

    let cardOpacity = opacity;
    let cardScale = 1.0;
    let borderColor = layout.borderColor;
    let textColor = layout.textColor;

    if (isRevealed) {
      if (isCorrect) {
        borderColor = '#4ade80';
        textColor = '#ffffff';
        cardScale = pulseScale;
      } else {
        cardOpacity *= style?.dimWrongAnswers !== false ? (style?.wrongAnswerOpacity ?? 0.35) : 1.0;
      }
    }

    ctx.globalAlpha = cardOpacity;

    // Scale pulse
    if (cardScale !== 1.0) {
      ctx.translate(left + cardW / 2, cardTop + cardH / 2);
      ctx.scale(cardScale, cardScale);
      ctx.translate(-(left + cardW / 2), -(cardTop + cardH / 2));
    }

    // Pop Art drop shadow
    if (layout.popShadow) {
      const pOff = layout.popShadowOffset || 4;
      ctx.fillStyle = layout.popShadowColor || '#111827';
      drawShapePath(ctx, left + pOff, cardTop + pOff, cardW, cardH, layout);
      ctx.fill();
    }

    // Shadow & glow
    if (isRevealed && isCorrect) {
      if (layout.shape === 'doodle' && layout.markerHighlight) {
        ctx.shadowColor = 'rgba(250, 204, 21, 0.6)';
        ctx.shadowBlur = 20;
      } else {
        ctx.shadowColor = 'rgba(34, 197, 94, 0.75)';
        ctx.shadowBlur = 30;
      }
    } else if (layout.glowRadius && layout.glowRadius > 0) {
      ctx.shadowColor = layout.glowColor || 'rgba(56, 189, 248, 0.4)';
      ctx.shadowBlur = layout.glowRadius;
    } else if (!layout.popShadow && layout.shape !== 'minimal') {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 4;
    }

    // Fill Card Background
    if (isRevealed && isCorrect) {
      if (layout.shape === 'doodle' && layout.markerHighlight) {
        const grad = ctx.createLinearGradient(left, cardTop, left + cardW, cardTop);
        grad.addColorStop(0, '#fef08a');
        grad.addColorStop(1, '#fde047');
        ctx.fillStyle = grad;
        borderColor = '#ca8a04';
        textColor = '#78350f';
      } else {
        const grad = ctx.createLinearGradient(left, cardTop, left + cardW, cardTop + cardH);
        grad.addColorStop(0, '#15803d');
        grad.addColorStop(1, '#22c55e');
        ctx.fillStyle = grad;
      }
    } else {
      ctx.fillStyle = parseColor(layout.backgroundColor, layout.bgOpacity);
    }
    drawShapePath(ctx, left, cardTop, cardW, cardH, layout);
    ctx.fill();

    // Border
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = layout.borderWidth;
    if (layout.borderStyle === 'dashed') {
      ctx.setLineDash([6, 4]);
    } else {
      ctx.setLineDash([]);
    }
    drawShapePath(ctx, left, cardTop, cardW, cardH, layout);
    ctx.stroke();
    ctx.setLineDash([]);

    // Option Badge (A, B, C or checkmark)
    const badgeSize = layout.labelSize || Math.min(42, cardH * 0.75);
    const badgeX = left + 14;
    const badgeY = cardTop + (cardH - badgeSize) / 2;

    const bShape = layout.labelShape || 'circle';
    if (bShape === 'square') {
      drawRoundedRect(ctx, badgeX, badgeY, badgeSize, badgeSize, 8);
    } else if (bShape === 'pill') {
      drawRoundedRect(ctx, badgeX, badgeY, badgeSize, badgeSize, 12);
    } else if (bShape === 'hexagon') {
      drawHexagonPath(ctx, badgeX, badgeY, badgeSize, badgeSize);
    } else {
      ctx.beginPath();
      ctx.arc(badgeX + badgeSize / 2, badgeY + badgeSize / 2, badgeSize / 2, 0, Math.PI * 2);
    }

    if (isRevealed && isCorrect) {
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.save();
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      const cx = badgeX + badgeSize / 2;
      const cy = badgeY + badgeSize / 2;
      ctx.moveTo(cx - 8, cy);
      ctx.lineTo(cx - 2, cy + 6);
      ctx.lineTo(cx + 8, cy - 6);
      ctx.stroke();
      ctx.restore();
    } else {
      const bBg = layout.labelBgColor || `${primaryColor}22`;
      const bCol = layout.labelColor || primaryColor;
      ctx.fillStyle = bBg;
      ctx.fill();
      ctx.strokeStyle = `${bCol}66`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = bCol;
      ctx.font = `900 ${Math.round(badgeSize * 0.48)}px "Be Vietnam Pro", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(key, badgeX + badgeSize / 2, badgeY + badgeSize / 2);
    }

    // Option Text
    const textX = badgeX + badgeSize + 14;
    const textY = cardTop + cardH / 2;
    ctx.fillStyle = textColor;
    ctx.font = `${layout.fontWeight} ${layout.fontSize}px "${layout.fontFamily.split(',')[0].replace(/"/g, '') || 'Be Vietnam Pro'}", sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    if (layout.textShadow && layout.textShadow !== 'none') {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 2;
    } else {
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }

    const maxOptionW = cardW - (badgeSize + 36);
    const optionText = options[key] || '';
    ctx.fillText(optionText, textX, textY, maxOptionW);
    ctx.shadowColor = 'transparent';

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
  correctColor: string,
  expStyle?: any
): void {
  const style = expStyle || {};
  if (style.enabled === false) return;

  const left = ((style.x ?? 6) / 100) * width;
  const top = ((style.y ?? 84) / 100) * height;
  const cardW = ((style.width ?? 88) / 100) * width;
  const cardH = ((style.height ?? 9) / 100) * height;
  const radius = style.borderRadius ?? 16;
  const borderWidth = style.borderWidth ?? 2;
  const borderColor = style.borderColor || correctColor;
  const bgOpacity = style.bgOpacity ?? 0.98;
  const bgColor = parseColor(style.backgroundColor || '#ffffff', bgOpacity);
  const padding = style.padding ?? 12;
  const showIcon = style.showIcon !== false;
  const fontSize = style.fontSize ?? 15;
  const fontWeight = style.fontWeight || '600';
  const textColor = style.textColor || style.color || '#1e293b';
  const textAlign = style.textAlign || 'left';
  const titleText = style.titleText || 'GIẢI THÍCH / EXPLANATION';

  // Entrance animation
  const expEntrance = interpolate(relFrame - relRevealStart, [0, 8], [0, 1], { extrapolateRight: 'clamp' });
  const translateY = interpolate(expEntrance, [0, 1], [15, 0], { extrapolateRight: 'clamp' });

  ctx.save();
  ctx.globalAlpha = expEntrance * (style.opacity ?? 1.0);
  ctx.translate(0, translateY);

  // Pop Art drop shadow
  if (style.popShadow) {
    const pOff = style.popShadowOffset || 4;
    ctx.fillStyle = style.popShadowColor || '#111827';
    drawShapePath(ctx, left + pOff, top + pOff, cardW, cardH, style);
    ctx.fill();
  }

  // Shadow
  if (style.boxShadow && style.boxShadow !== 'none' && !style.popShadow) {
    ctx.shadowColor = 'rgba(22, 163, 74, 0.2)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 6;
  } else {
    ctx.shadowColor = 'transparent';
  }

  // Background
  ctx.fillStyle = bgColor;
  drawShapePath(ctx, left, top, cardW, cardH, style);
  ctx.fill();

  // Border
  ctx.shadowColor = 'transparent';
  if (borderWidth > 0) {
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth;
    if (style.borderStyle === 'dashed') {
      ctx.setLineDash([6, 4]);
    } else {
      ctx.setLineDash([]);
    }
    drawShapePath(ctx, left, top, cardW, cardH, style);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Icon
  const iconOffset = showIcon ? 46 : 16;
  if (showIcon) {
    ctx.font = '24px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('💡', left + 24, top + cardH / 2);
  }

  // Explanation Title
  ctx.fillStyle = borderColor;
  ctx.font = '800 12px "Be Vietnam Pro", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(titleText.toUpperCase(), left + iconOffset, top + padding);

  // Explanation Body
  ctx.fillStyle = textColor;
  ctx.font = `${fontWeight} ${fontSize}px "Be Vietnam Pro", sans-serif`;
  ctx.textBaseline = 'top';
  const maxTextW = cardW - iconOffset - 16;
  const lines = wrapText(ctx, explanation, maxTextW, 2);
  const bodyStartY = top + padding + 18;
  const lineSpacing = fontSize * 1.35;
  for (let i = 0; i < lines.length; i++) {
    const lineX = (textAlign === 'center')
      ? left + iconOffset + (maxTextW - ctx.measureText(lines[i]).width) / 2
      : (textAlign === 'right')
      ? left + cardW - 16 - ctx.measureText(lines[i]).width
      : left + iconOffset;
    ctx.fillText(lines[i], lineX, bodyStartY + i * lineSpacing);
  }

  ctx.restore();
}
