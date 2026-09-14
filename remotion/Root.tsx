import React from 'react';
import { Composition } from 'remotion';
import { QuizVideoComposition } from './QuizVideoComposition';
import { defaultChannels, defaultTemplates } from '../backend/src/channels/defaultChannels';
import { defaultQuizzes } from '../backend/src/quiz/defaultQuizzes';

const fallbackChannel = defaultChannels[0];
const fallbackTemplate = defaultTemplates['classic-stacked'];
const fallbackQuiz = defaultQuizzes['quiz_vi_sample'];

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="QuizVideoComposition"
        component={QuizVideoComposition as any}
        durationInFrames={600}
        fps={30}
        width={720}
        height={1280}
        calculateMetadata={({ props }) => {
          const input = props as any;
          return {
            durationInFrames: input?.totalDurationFrames || 600,
            fps: input?.fps || 30,
            width: input?.width || 720,
            height: input?.height || 1280
          };
        }}
        defaultProps={{
          channel: fallbackChannel,
          template: fallbackTemplate,
          quiz: fallbackQuiz,
          language: 'vi' as const,
          totalDurationFrames: 600,
          cues: [],
          fps: 30,
          width: 720,
          height: 1280
        }}
      />
    </>
  );
};
