import { Quiz, Channel, VideoTemplate, TimelineQuestionCue, AudioCue } from '../../../remotion/types/index.js';

export interface QuestionTTSData {
  questionUrl?: string;
  questionDuration?: number;
  optionsUrl?: string;
  optionsDuration?: number;
  revealUrl?: string;
  revealDuration?: number;
  explanationUrl?: string;
  explanationDuration?: number;
}

export class TimelineEngine {
  private fps: number;

  constructor(fps: number = 30) {
    this.fps = fps;
  }

  public computeTimeline(
    quiz: Quiz,
    channel: Channel,
    template: VideoTemplate,
    ttsMap: Record<string, QuestionTTSData> = {}
  ): { totalDurationFrames: number; cues: TimelineQuestionCue[] } {
    const cues: TimelineQuestionCue[] = [];
    let currentFrame = 0;

    const transitionFrames = template.timing?.transitionFrames || 15;
    const countdownSec = template.timing?.countdownSeconds || 5;
    const revealSec = template.timing?.revealSeconds || 2.5;

    // Question 0 starts at frame 0 so video preview is immediately visible
    currentFrame = 0;

    for (let i = 0; i < quiz.questions.length; i++) {
      const q = quiz.questions[i];
      const qStartFrame = currentFrame;
      const ttsData = ttsMap[q.id] || {};

      // 1. Question Speech Phase
      // Default to 2.5s if not yet generated
      const qDurationSec = ttsData.questionDuration || q.durations?.questionTts || 3.0;
      const qFrames = Math.ceil(qDurationSec * this.fps);
      const questionTtsStart = currentFrame;
      const questionTtsEnd = questionTtsStart + qFrames;

      currentFrame += qFrames;

      // 2. Options Speech Phase (if enabled)
      let optionsTtsStart: number | undefined;
      let optionsTtsEnd: number | undefined;
      if (channel.languages[quiz.language]?.readOptions && ttsData.optionsDuration) {
        const optFrames = Math.ceil(ttsData.optionsDuration * this.fps);
        optionsTtsStart = currentFrame;
        optionsTtsEnd = optionsTtsStart + optFrames;
        currentFrame += optFrames;
      }

      // 3. Countdown / Thinking Phase
      const countdownFrames = Math.ceil(countdownSec * this.fps);
      const countdownStart = currentFrame;
      const countdownEnd = countdownStart + countdownFrames;
      currentFrame += countdownFrames;

      // 4. Reveal & Explanation Phase
      const revealStart = currentFrame;
      const hasExplanationAudio = Boolean(ttsData.explanationUrl);
      const expDelayFrames = hasExplanationAudio ? 10 : 0; // 0.33s dramatic pause before voiceover begins
      const expDurationSec = hasExplanationAudio
        ? (ttsData.explanationDuration || q.durations?.explanationTts || 2.0)
        : 0;
      const expFrames = Math.ceil(expDurationSec * this.fps);
      const explanationTtsStart = revealStart + expDelayFrames;
      const explanationTtsEnd = explanationTtsStart + expFrames;

      // Ensure reveal window holds for the full explanation TTS plus a comfortable post-explanation cushion
      const minRevealFrames = Math.ceil(revealSec * this.fps);
      const postExpCushion = hasExplanationAudio ? Math.ceil(0.5 * this.fps) : 0; // 0.5s cushion
      const neededRevealFrames = expDelayFrames + expFrames + postExpCushion;
      const revealFrames = Math.max(minRevealFrames, neededRevealFrames);
      currentFrame += revealFrames;

      const isLastQuestion = i === quiz.questions.length - 1;
      const endBufferSec = template.timing?.endBufferSeconds ?? 2.5;
      const endBufferFrames = Math.ceil(endBufferSec * this.fps);

      // 5. Inter-question Transition or Final Hold Buffer
      if (!isLastQuestion) {
        currentFrame += transitionFrames;
      } else {
        // Last question: include endBufferFrames in its cue so the sequence stays active until the video finishes!
        currentFrame += endBufferFrames;
      }

      const qEndFrame = currentFrame;

      // Build Audio Cues for this question
      const audioCues: AudioCue[] = [];

      // 0. Transition SFX between questions
      // Triggers precisely when the new question begins appearing (qStartFrame) for questions after the first (i > 0)
      if (i > 0) {
        const transitionSoundUrl = channel.audio.sfx.transition || '/assets/audio/sfx/transition.wav';
        const transitionVol = channel.audio.volumes.transition ?? 0.6;
        audioCues.push({
          type: 'sfx',
          url: transitionSoundUrl,
          startFrame: qStartFrame,
          durationFrames: 25,
          volume: transitionVol
        });
      }

      // A. Question Voiceover Cue
      if (ttsData.questionUrl) {
        audioCues.push({
          type: 'tts',
          url: ttsData.questionUrl,
          startFrame: questionTtsStart,
          durationFrames: qFrames,
          volume: 1.0
        });
      }

      // B. Options Voiceover Cue (if any)
      if (optionsTtsStart && ttsData.optionsUrl) {
        audioCues.push({
          type: 'tts',
          url: ttsData.optionsUrl,
          startFrame: optionsTtsStart,
          durationFrames: optionsTtsEnd! - optionsTtsStart,
          volume: 1.0
        });
      }

      // C. Countdown Tick SFX (every 1 second = 30 frames)
      const tickSoundUrl = channel.audio.sfx.tick || '/assets/audio/sfx/tick.wav';
      const tickVol = channel.audio.volumes.tick ?? 0.6;
      for (let s = 0; s < countdownSec; s++) {
        const tickFrame = countdownStart + s * this.fps;
        audioCues.push({
          type: 'sfx',
          url: tickSoundUrl,
          startFrame: tickFrame,
          durationFrames: 6,
          volume: tickVol
        });
      }

      // D. Countdown Finish Bell SFX
      const finishSoundUrl = channel.audio.sfx.finish || '/assets/audio/sfx/finish.wav';
      audioCues.push({
        type: 'sfx',
        url: finishSoundUrl,
        startFrame: countdownEnd - 5,
        durationFrames: 25,
        volume: channel.audio.volumes.finish ?? 0.8
      });

      // E. Reveal & Correct SFX
      const revealSoundUrl = channel.audio.sfx.reveal || '/assets/audio/sfx/reveal.wav';
      audioCues.push({
        type: 'sfx',
        url: revealSoundUrl,
        startFrame: revealStart,
        durationFrames: 30,
        volume: channel.audio.volumes.reveal ?? 0.9
      });

      const correctSoundUrl = channel.audio.sfx.correct || '/assets/audio/sfx/correct.wav';
      audioCues.push({
        type: 'sfx',
        url: correctSoundUrl,
        startFrame: revealStart + 6,
        durationFrames: 45,
        volume: channel.audio.volumes.correct ?? 1.0
      });

      // F. Explanation TTS
      if (ttsData.explanationUrl) {
        audioCues.push({
          type: 'tts',
          url: ttsData.explanationUrl,
          startFrame: explanationTtsStart,
          durationFrames: expFrames,
          volume: 1.0
        });
      }

      // G. Transition SFX between questions is handled at qStartFrame for i > 0 (synchronous with new question appearance)

      cues.push({
        questionIndex: i,
        startFrame: qStartFrame,
        endFrame: qEndFrame,
        durationFrames: qEndFrame - qStartFrame,
        phases: {
          introStart: qStartFrame,
          questionTtsStart,
          questionTtsEnd,
          optionsTtsStart,
          optionsTtsEnd,
          countdownStart,
          countdownEnd,
          revealStart,
          explanationTtsStart,
          explanationTtsEnd
        },
        audioCues
      });
    }

    return {
      totalDurationFrames: currentFrame,
      cues
    };
  }

  /**
   * Automated Validation Engine
   * Strictly verifies all 9 timeline integrity assertions before export.
   * Throws TimelineValidationError if any invariant fails.
   */
  public validateTimeline(
    quiz: Quiz,
    cues: TimelineQuestionCue[],
    totalDurationFrames: number,
    endBufferSec: number = 2.5
  ): void {
    if (!cues || cues.length === 0) {
      throw new TimelineValidationError('Timeline cues array is empty!');
    }

    const assert = (condition: boolean, msg: string) => {
      if (!condition) throw new TimelineValidationError(msg);
    };

    let calculatedSumFrames = 0;

    for (let i = 0; i < cues.length; i++) {
      const cue = cues[i];
      const p = cue.phases;
      const isLast = i === cues.length - 1;

      calculatedSumFrames += cue.durationFrames;

      // 1. ASSERT: question_tts_end <= countdown_start
      assert(
        p.questionTtsEnd <= p.countdownStart,
        `[Q${i + 1}] ASSERT FAILED: question_tts_end (${p.questionTtsEnd}) must be <= countdown_start (${p.countdownStart})`
      );

      // 2. ASSERT: countdown_start == countdown_sfx_start
      const tickCues = cue.audioCues.filter(a => a.type === 'sfx' && a.url.includes('tick'));
      if (tickCues.length > 0) {
        assert(
          tickCues[0].startFrame === p.countdownStart,
          `[Q${i + 1}] ASSERT FAILED: first tick SFX frame (${tickCues[0].startFrame}) must equal countdown_start (${p.countdownStart})`
        );
      }

      // 3. ASSERT: countdown_end <= reveal_start
      assert(
        p.countdownEnd <= p.revealStart,
        `[Q${i + 1}] ASSERT FAILED: countdown_end (${p.countdownEnd}) must be <= reveal_start (${p.revealStart})`
      );

      // 4. ASSERT: reveal_start <= answer_tts_start
      assert(
        p.revealStart <= p.explanationTtsStart,
        `[Q${i + 1}] ASSERT FAILED: reveal_start (${p.revealStart}) must be <= explanation_tts_start (${p.explanationTtsStart})`
      );

      // 5. ASSERT: answer_tts_end <= question_end
      assert(
        p.explanationTtsEnd <= cue.endFrame,
        `[Q${i + 1}] ASSERT FAILED: explanation_tts_end (${p.explanationTtsEnd}) must be <= question_end (${cue.endFrame})`
      );

      // 6. ASSERT: question_end <= next_question_start
      if (!isLast) {
        const nextCue = cues[i + 1];
        assert(
          cue.endFrame <= nextCue.startFrame,
          `[Q${i + 1}] ASSERT FAILED: question_end (${cue.endFrame}) must be <= next_question_start (${nextCue.startFrame})`
        );
      }

      // 7. ASSERT: video_end >= last_question_answer_tts_end + final_hold
      if (isLast) {
        const finalHoldFrames = Math.ceil(endBufferSec * this.fps);
        assert(
          totalDurationFrames >= p.explanationTtsEnd + finalHoldFrames,
          `[LAST QUESTION] ASSERT FAILED: total_video_frames (${totalDurationFrames}) must be >= explanation_tts_end (${p.explanationTtsEnd}) + final_hold (${finalHoldFrames}) = ${p.explanationTtsEnd + finalHoldFrames}`
        );
        assert(
          cue.endFrame === totalDurationFrames,
          `[LAST QUESTION] ASSERT FAILED: last cue endFrame (${cue.endFrame}) must equal totalDurationFrames (${totalDurationFrames})`
        );
      }

      // 8. Audio cues within bounds
      for (const a of cue.audioCues) {
        assert(
          a.startFrame >= 0 && a.startFrame + a.durationFrames <= totalDurationFrames,
          `[Q${i + 1}] ASSERT FAILED: Audio cue out of bounds: type=${a.type}, start=${a.startFrame}, dur=${a.durationFrames}, total=${totalDurationFrames}`
        );
      }
    }

    // 9. ASSERT: total_video_frames == sum(all_question_frames)
    assert(
      totalDurationFrames === calculatedSumFrames,
      `ASSERT FAILED: total_video_frames (${totalDurationFrames}) must equal sum(all_question_frames) (${calculatedSumFrames})`
    );
  }

  /**
   * Structured Timeline Event Logger
   * Logs exact timestamps and frame numbers for every phase of each question.
   */
  public logTimeline(cues: TimelineQuestionCue[], totalDurationFrames: number): string[] {
    const lines: string[] = [];
    const toTime = (f: number) => {
      const s = f / this.fps;
      const mins = Math.floor(s / 60);
      const secs = (s % 60).toFixed(2).padStart(5, '0');
      return `${String(mins).padStart(2, '0')}:${secs} (frame ${f})`;
    };

    lines.push('================================================================================');
    lines.push('                       QUIZ TIMELINE EVENT BREAKDOWN                            ');
    lines.push('================================================================================');

    for (let i = 0; i < cues.length; i++) {
      const c = cues[i];
      const p = c.phases;
      const isLast = i === cues.length - 1;

      lines.push(`--- [QUESTION ${i + 1}/${cues.length}] Duration: ${c.durationFrames} frames (${(c.durationFrames / this.fps).toFixed(2)}s) ---`);
      lines.push(`  * QUESTION_START      : ${toTime(c.startFrame)}`);
      lines.push(`  * QUESTION_TTS_START  : ${toTime(p.questionTtsStart)}`);
      lines.push(`  * QUESTION_TTS_END    : ${toTime(p.questionTtsEnd)}`);
      if (p.optionsTtsStart && p.optionsTtsEnd) {
        lines.push(`  * OPTIONS_TTS_START   : ${toTime(p.optionsTtsStart)}`);
        lines.push(`  * OPTIONS_TTS_END     : ${toTime(p.optionsTtsEnd)}`);
      }
      lines.push(`  * COUNTDOWN_START     : ${toTime(p.countdownStart)}`);
      lines.push(`  * COUNTDOWN_END       : ${toTime(p.countdownEnd)}`);
      lines.push(`  * REVEAL_START        : ${toTime(p.revealStart)}`);
      lines.push(`  * ANSWER_TTS_START    : ${toTime(p.explanationTtsStart)}`);
      lines.push(`  * ANSWER_TTS_END      : ${toTime(p.explanationTtsEnd)}`);
      if (!isLast) {
        lines.push(`  * ANIMATION_END       : ${toTime(c.endFrame - 15)}`);
        lines.push(`  * NEXT_QUESTION_START : ${toTime(c.endFrame)}`);
      } else {
        lines.push(`  * FINAL_HOLD_START    : ${toTime(p.explanationTtsEnd)}`);
        lines.push(`  * VIDEO_END           : ${toTime(totalDurationFrames)}`);
      }
    }

    lines.push('================================================================================');
    lines.push(` TOTAL VIDEO DURATION: ${toTime(totalDurationFrames)} @ ${this.fps} FPS`);
    lines.push('================================================================================');

    return lines;
  }
}

export class TimelineValidationError extends Error {
  constructor(message: string) {
    super(`[TIMELINE VALIDATION ERROR] ${message}`);
    this.name = 'TimelineValidationError';
  }
}
