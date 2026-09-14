import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { QuizQuestion, VideoTemplate, ChannelBranding, TimelineQuestionCue } from '../types/index';
import { IllustrationFrame } from '../components/IllustrationFrame';
import { QuestionBox } from '../components/QuestionBox';
import { AnswerCards } from '../components/AnswerCards';
import { CountdownTimer } from '../components/CountdownTimer';
import { getEntranceTransform } from '../animations/index';

interface QuestionSequenceViewProps {
  question: QuizQuestion;
  questionIndex: number;
  totalQuestions: number;
  template: VideoTemplate;
  branding: ChannelBranding;
  quizTitle: string;
  cue: TimelineQuestionCue;
}

export const QuestionSequenceView: React.FC<QuestionSequenceViewProps> = ({
  question,
  questionIndex,
  totalQuestions,
  template,
  branding,
  quizTitle,
  cue
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Frame offsets relative to this question sequence start
  const relCountdownStart = Math.max(0, cue.phases.countdownStart - cue.startFrame);
  const relCountdownEnd = Math.max(0, cue.phases.countdownEnd - cue.startFrame);
  const relRevealStart = Math.max(0, cue.phases.revealStart - cue.startFrame);

  const isRevealed = frame >= relRevealStart;
  const revealProgress = isRevealed ? Math.min(1, (frame - relRevealStart) / (fps * 1.5)) : 0;

  const comps = template.components;
  const primaryColor = branding.colors.primary;
  const correctColor = branding.colors.correct;

  const hasIllustration = Boolean(question.illustrations && question.illustrations.filter(Boolean).length > 0);

  // Transition handling between questions
  const isLastQuestion = questionIndex === totalQuestions - 1;
  const transitionFrames = template.timing?.transitionFrames || 15;
  const transitionType = template.transitionType || 'slide';

  // 1. Exit transition (end of current question if not last)
  const isTransitioningOut = !isLastQuestion && frame >= cue.durationFrames - transitionFrames;
  const exitProgress = isTransitioningOut
    ? Math.min(1, Math.max(0, (frame - (cue.durationFrames - transitionFrames)) / transitionFrames))
    : 0;

  // 2. Entrance transition (beginning of question if questionIndex > 0)
  const isTransitioningIn = questionIndex > 0 && frame < transitionFrames;
  const enterProgress = isTransitioningIn
    ? Math.min(1, Math.max(0, frame / transitionFrames))
    : 1;

  // Compute container-level transform, clipPath, and opacity based on template.transitionType
  let containerTransform = 'none';
  let containerClipPath = 'none';
  let containerOpacity = 1.0;

  if (isTransitioningIn) {
    if (transitionType === 'slide') {
      const xOffset = interpolate(enterProgress, [0, 1], [100, 0], { extrapolateRight: 'clamp' });
      containerTransform = `translateX(${xOffset}%)`;
      containerOpacity = interpolate(enterProgress, [0, 0.4, 1], [0.4, 0.8, 1], { extrapolateRight: 'clamp' });
    } else if (transitionType === 'zoom') {
      const scaleVal = interpolate(enterProgress, [0, 1], [0.85, 1], { extrapolateRight: 'clamp' });
      containerTransform = `scale(${scaleVal})`;
      containerOpacity = interpolate(enterProgress, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
    } else if (transitionType === 'wipe') {
      const wipeX = interpolate(enterProgress, [0, 1], [100, 0], { extrapolateRight: 'clamp' });
      containerClipPath = `inset(0 0 0 ${wipeX}%)`;
    } else {
      // fade
      containerOpacity = interpolate(enterProgress, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
    }
  } else if (isTransitioningOut) {
    if (transitionType === 'slide') {
      const xOffset = interpolate(exitProgress, [0, 1], [0, -100], { extrapolateRight: 'clamp' });
      containerTransform = `translateX(${xOffset}%)`;
      containerOpacity = interpolate(exitProgress, [0, 0.6, 1], [1, 0.8, 0.3], { extrapolateRight: 'clamp' });
    } else if (transitionType === 'zoom') {
      const scaleVal = interpolate(exitProgress, [0, 1], [1, 1.15], { extrapolateRight: 'clamp' });
      containerTransform = `scale(${scaleVal})`;
      containerOpacity = interpolate(exitProgress, [0, 1], [1, 0], { extrapolateRight: 'clamp' });
    } else if (transitionType === 'wipe') {
      const wipeX = interpolate(exitProgress, [0, 1], [0, 100], { extrapolateRight: 'clamp' });
      containerClipPath = `inset(0 ${wipeX}% 0 0)`;
    } else {
      // fade
      containerOpacity = interpolate(exitProgress, [0, 1], [1, 0], { extrapolateRight: 'clamp' });
    }
  }

  const contentOpacity = 1.0;

  // For questionIndex > 0, cards and question box stay in place (no jump/re-fly from 40px)
  const boxDelayFrame = questionIndex === 0 ? 6 : -1;
  const cardsDelayFrame = questionIndex === 0 ? 8 : -1;

  // Question number formatting
  const qNumFormat = comps.questionNumber.format || 'câu-n';
  const qNumText = qNumFormat === 'q-n'
    ? `QUESTION ${questionIndex + 1}/${totalQuestions}`
    : qNumFormat === 'badge'
    ? `Q${questionIndex + 1}`
    : `CÂU ${questionIndex + 1} / ${totalQuestions}`;

  const numEntrance = questionIndex === 0
    ? getEntranceTransform(comps.questionNumber.animation || 'fade', frame, fps, 2)
    : { opacity: 1, transform: 'none' };

  const numWidth = comps.questionNumber.width ?? 80;
  const numLeft = comps.questionNumber.x !== undefined
    ? `${comps.questionNumber.x}%`
    : comps.questionNumber.horizontalAlign === 'center'
    ? `${(100 - numWidth) / 2}%`
    : comps.questionNumber.horizontalAlign === 'right'
    ? `${100 - numWidth - 10}%`
    : '10%';

  // Explanation Card entrance and exit (pure Remotion frame math)
  const expEntrance = isRevealed ? interpolate(frame - relRevealStart, [0, 8], [0, 1], { extrapolateRight: 'clamp' }) : 0;
  const expExit = isTransitioningOut ? interpolate(exitProgress, [0, 1], [1, 0]) : 1.0;
  const expOpacity = expEntrance * expExit;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        transform: containerTransform !== 'none' ? containerTransform : undefined,
        clipPath: containerClipPath !== 'none' ? containerClipPath : undefined,
        opacity: containerOpacity
      }}
    >
      {/* Question Number Badge */}
      <div
        style={{
          position: 'absolute',
          left: numLeft,
          top: `${comps.questionNumber.y}%`,
          width: `${comps.questionNumber.width}%`,
          height: `${comps.questionNumber.height}%`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: comps.questionNumber.textAlign === 'left' ? 'flex-start' : comps.questionNumber.textAlign === 'right' ? 'flex-end' : 'center',
          fontFamily: comps.questionNumber.fontFamily || branding.fonts.primary || 'Be Vietnam Pro, sans-serif',
          fontSize: `${comps.questionNumber.fontSize || 20}px`,
          fontWeight: comps.questionNumber.fontWeight || '700',
          color: comps.questionNumber.color || primaryColor,
          backgroundColor: comps.questionNumber.backgroundColor || 'transparent',
          borderRadius: `${comps.questionNumber.borderRadius || 12}px`,
          letterSpacing: '0.04em',
          zIndex: 10,
          opacity: contentOpacity,
          ...numEntrance
        }}
      >
        {qNumText}
      </div>

      {/* 3. Illustration Frame (Optional - only renders if images present) */}
      {hasIllustration && (
        <IllustrationFrame
          style={comps.illustration}
          layoutMode={template.illustrationLayout}
          images={question.illustrations}
          primaryColor={primaryColor}
          delayFrame={questionIndex === 0 ? 4 : -1}
        />
      )}

      {/* 4. Question Box */}
      <QuestionBox
        style={comps.questionBox}
        questionText={question.question}
        questionIndex={questionIndex}
        totalQuestions={totalQuestions}
        primaryColor={primaryColor}
        hasIllustration={hasIllustration}
        delayFrame={boxDelayFrame}
        contentOpacity={contentOpacity}
      />

      {/* 5. 3 Answer Choices (A, B, C) */}
      <AnswerCards
        style={comps.answerButtons}
        layoutMode={template.answerLayout}
        options={question.options}
        correctAnswer={question.correctAnswer}
        isRevealed={isRevealed}
        revealProgress={revealProgress}
        revealStartFrame={relRevealStart}
        primaryColor={primaryColor}
        correctColor={correctColor}
        wrongColor={branding.colors.wrong}
        delayFrame={cardsDelayFrame}
        contentOpacity={contentOpacity}
      />

      {/* 6. Countdown Timer (Strictly auto-hidden outside countdown phase) */}
      <CountdownTimer
        style={comps.countdown}
        countdownStyle={template.countdownStyle}
        countdownStartFrame={relCountdownStart}
        countdownEndFrame={relCountdownEnd}
        primaryColor={primaryColor}
        warningColor={branding.colors.wrong}
      />

      {/* 7. Explanation Card upon Reveal (Light Theme) */}
      {isRevealed && question.explanation && (
        <div
          style={{
            position: 'absolute',
            left: '6%',
            bottom: '7%', // Above bottom safe zone
            width: '88%',
            backgroundColor: '#ffffff',
            border: `2px solid ${correctColor}`,
            borderRadius: '16px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: `0 8px 25px rgba(22, 163, 74, 0.15)`,
            zIndex: 30,
            opacity: expOpacity,
            transform: `translateY(${interpolate(expEntrance, [0, 1], [15, 0])}px)`
          }}
        >
          <span style={{ fontSize: '26px' }}>💡</span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '13px', fontWeight: '800', color: correctColor, textTransform: 'uppercase' }}>
              Giải thích / Explanation
            </span>
            <span style={{ fontSize: '15px', color: '#1e293b', lineHeight: 1.35, fontWeight: '600' }}>
              {question.explanation}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
