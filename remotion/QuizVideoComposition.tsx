import React, { useMemo } from 'react';
import { Sequence, Audio, AbsoluteFill } from 'remotion';
import { VideoCompositionProps } from './types/index';
import { BackgroundLayer } from './components/BackgroundLayer';
import { QuestionSequenceView } from './templates/QuestionSequenceView';
import { resolveMedia } from './utils/media';

import { QuizTitleLayer } from './components/QuizTitleLayer';
import { LogoWatermark } from './components/LogoWatermark';

export const QuizVideoComposition: React.FC<VideoCompositionProps> = ({
  channel,
  template,
  quiz,
  language,
  totalDurationFrames,
  cues = [],
  fps = 30,
  width = 720,
  height = 1280
}) => {
  // Flatten all audio cues for TTS and SFX (BGM completely removed)
  const allAudioTracks = useMemo(() => {
    const list: Array<{ url: string; startFrame: number; durationFrames: number; volume: number; type: string }> = [];
    for (const cue of cues) {
      for (const a of cue.audioCues) {
        if ((a.type === 'tts' || a.type === 'sfx') && a.url) {
          list.push({
            url: a.url,
            startFrame: a.startFrame,
            durationFrames: a.durationFrames,
            volume: a.volume ?? 1.0,
            type: a.type
          });
        }
      }
    }
    return list;
  }, [cues]);

  return (
    <AbsoluteFill
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: '#000000',
        overflow: 'hidden',
        fontFamily: channel.branding.fonts.primary || 'Montserrat, sans-serif'
      }}
    >
      {/* 1. Universal Background with Per-Question Ken Burns Motion */}
      <BackgroundLayer
        style={template.components.background}
        primaryColor={channel.branding.colors.primary}
        cues={cues}
        totalDurationFrames={totalDurationFrames}
      />

      {/* 2. Dedicated Quiz Title Layer (Persistent Top Layer) */}
      <QuizTitleLayer
        style={template.components.quizTitle || template.components.header}
        quizTitle={quiz.title}
        defaultFont={channel.branding.fonts.primary}
        defaultColor={channel.branding.colors.primary}
      />

      {/* 3. Simplified Channel Logo & Name (Shown/Hidden Independently) */}
      <LogoWatermark
        style={template.components.logo}
        branding={channel.branding}
      />

      {/* 3. Question Sequences */}
      {(() => {
        const effectiveCues = (cues && cues.length > 0) ? cues : (quiz.questions.length > 0 ? [{
          questionIndex: 0,
          startFrame: 0,
          endFrame: totalDurationFrames || 600,
          durationFrames: totalDurationFrames || 600,
          phases: {
            introStart: 0,
            questionTtsStart: 0,
            questionTtsEnd: 90,
            countdownStart: 90,
            countdownEnd: 240,
            revealStart: 240,
            explanationTtsStart: 255,
            explanationTtsEnd: 330
          },
          audioCues: []
        }] : []);

        return effectiveCues.map((cue, idx) => {
          const question = quiz.questions[cue.questionIndex];
          if (!question) return null;

          return (
            <Sequence
              key={`question-seq-${idx}-${question.id}`}
              from={cue.startFrame}
              durationInFrames={cue.durationFrames}
            >
              <QuestionSequenceView
                question={question}
                questionIndex={cue.questionIndex}
                totalQuestions={quiz.questions.length}
                template={template}
                branding={channel.branding}
                quizTitle={quiz.title}
                cue={cue}
              />
            </Sequence>
          );
        });
      })()}

      {/* 5. Synchronized Audio Cues (TTS voiceover & SFX ticks/chimes) */}
      {allAudioTracks.map((trk, i) => {
        if (trk.startFrame >= totalDurationFrames) return null;
        const safeDuration = Math.min(trk.durationFrames, Math.max(1, totalDurationFrames - trk.startFrame));
        return (
          <Sequence
            key={`audio-${i}-${trk.startFrame}-${trk.type}`}
            from={trk.startFrame}
            durationInFrames={safeDuration}
          >
            <Audio
              src={resolveMedia(trk.url)}
              volume={trk.volume}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
