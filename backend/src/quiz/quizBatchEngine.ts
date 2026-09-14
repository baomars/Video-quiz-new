import { QuizQuestion, OptionKey } from '../../../remotion/types/index.js';

export type SelectionMode = 'sequential' | 'random' | 'balanced_random';

export interface BatchEstimation {
  totalQuestions: number;
  questionsPerVideo: number;
  requestedVideos: number;
  requiredQuestions: number;
  fullVideosPossible: number;
  hasDeficit: boolean;
  deficitCount: number;
  surplusCount: number;
  needsPoolReuse: boolean;
}

export interface BatchConfig {
  videoCount: number;
  questionsPerVideo: number;
  selectionMode: SelectionMode;
  autoReusePool: boolean;
  shuffleAnswers: boolean;
  backgrounds?: string[];
}

/**
 * Calculates statistical metrics for batch rendering based on question pool size.
 */
export function estimateBatch(
  totalQuestions: number,
  questionsPerVideo: number,
  requestedVideos: number
): BatchEstimation {
  const safeQPerVideo = Math.max(1, questionsPerVideo);
  const safeReqVideos = Math.max(1, requestedVideos);
  const requiredQuestions = safeQPerVideo * safeReqVideos;
  const fullVideosPossible = Math.floor(totalQuestions / safeQPerVideo);
  const deficitCount = Math.max(0, requiredQuestions - totalQuestions);
  const surplusCount = Math.max(0, totalQuestions - requiredQuestions);

  return {
    totalQuestions,
    questionsPerVideo: safeQPerVideo,
    requestedVideos: safeReqVideos,
    requiredQuestions,
    fullVideosPossible,
    hasDeficit: deficitCount > 0,
    deficitCount,
    surplusCount,
    needsPoolReuse: deficitCount > 0
  };
}

/**
 * Shuffles options (A, B, C) of a question, updating correctAnswer to the new position.
 * Returns a cloned question object without mutating the original question.
 */
export function shuffleQuestionAnswers(question: QuizQuestion): QuizQuestion {
  const cloned: QuizQuestion = JSON.parse(JSON.stringify(question));
  const keys: OptionKey[] = ['A', 'B', 'C'];

  // Identify original correct text
  const originalCorrectKey = (question.correctAnswer || 'A').toUpperCase() as OptionKey;
  const originalCorrectText = question.options[originalCorrectKey] || '';

  // Collect option texts
  const optionEntries = keys.map(k => ({
    text: question.options[k] || ''
  }));

  // Fisher-Yates shuffle
  for (let i = optionEntries.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = optionEntries[i];
    optionEntries[i] = optionEntries[j];
    optionEntries[j] = temp;
  }

  // Assign shuffled texts to A, B, C
  const newOptions: { A: string; B: string; C: string } = {
    A: optionEntries[0].text,
    B: optionEntries[1].text,
    C: optionEntries[2].text
  };

  // Find which key now holds the original correct text
  let newCorrectKey: OptionKey = 'A';
  for (const k of keys) {
    if (newOptions[k] === originalCorrectText) {
      newCorrectKey = k;
      break;
    }
  }

  cloned.options = newOptions;
  cloned.correctAnswer = newCorrectKey;

  return cloned;
}

/**
 * Fisher-Yates array shuffle helper
 */
function shuffleArray<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

/**
 * Pre-generates exact Question Sets for each video prior to rendering.
 * Guarantees every video has exactly questionsPerVideo items.
 */
export function generateBatchQuestionSets(
  pool: QuizQuestion[],
  config: BatchConfig
): QuizQuestion[][] {
  if (!pool || pool.length === 0) {
    throw new Error('Question Pool không có câu hỏi nào để phân bổ!');
  }

  const { videoCount, questionsPerVideo, selectionMode, autoReusePool, shuffleAnswers } = config;
  const safeVideoCount = Math.max(1, videoCount);
  const safeQPerVideo = Math.max(1, questionsPerVideo);

  const videoSets: QuizQuestion[][] = [];

  if (selectionMode === 'sequential') {
    // Sequential: pick linearly from pool
    let currentIndex = 0;
    for (let v = 0; v < safeVideoCount; v++) {
      const set: QuizQuestion[] = [];
      for (let q = 0; q < safeQPerVideo; q++) {
        const item = pool[currentIndex % pool.length];
        set.push(JSON.parse(JSON.stringify(item)));
        currentIndex++;
      }
      videoSets.push(set);
    }
  } else if (selectionMode === 'balanced_random') {
    // Balanced Random: Pick without replacement across videos as long as pool allows.
    // When pool exhausted and autoReusePool is true, reshuffle and continue.
    let availableDeck = shuffleArray(pool);

    for (let v = 0; v < safeVideoCount; v++) {
      const set: QuizQuestion[] = [];
      for (let q = 0; q < safeQPerVideo; q++) {
        if (availableDeck.length === 0) {
          availableDeck = shuffleArray(pool);
        }
        const picked = availableDeck.pop()!;
        set.push(JSON.parse(JSON.stringify(picked)));
      }
      videoSets.push(set);
    }
  } else {
    // Pure Random: Randomly sample for each video
    for (let v = 0; v < safeVideoCount; v++) {
      const sampled = shuffleArray(pool).slice(0, safeQPerVideo);
      while (sampled.length < safeQPerVideo) {
        const extra = shuffleArray(pool);
        for (const item of extra) {
          if (sampled.length >= safeQPerVideo) break;
          sampled.push(item);
        }
      }
      videoSets.push(sampled.map(i => JSON.parse(JSON.stringify(i))));
    }
  }

  // Apply Answer Shuffling if ON
  if (shuffleAnswers) {
    for (let v = 0; v < videoSets.length; v++) {
      videoSets[v] = videoSets[v].map(q => shuffleQuestionAnswers(q));
    }
  }

  return videoSets;
}

/**
 * Allocates background images for a batch of videos.
 * - If pool has at least videoCount images: each video gets a unique background.
 * - If pool has fewer images than videoCount: reuses images, strictly ensuring
 *   no two consecutive videos receive the exact same background.
 * - Background assignment is strictly determined prior to rendering.
 */
export function allocateBatchBackgrounds(pool: string[], videoCount: number): string[] {
  const safeCount = Math.max(1, videoCount);
  if (!pool || pool.length === 0) {
    return [];
  }

  if (pool.length === 1) {
    return Array(safeCount).fill(pool[0]);
  }

  const result: string[] = [];
  let lastAssigned = '';

  for (let i = 0; i < safeCount; i++) {
    if (i < pool.length) {
      let candidate = pool[i];
      if (candidate === lastAssigned) {
        const otherIndex = (i + 1) % pool.length;
        candidate = pool[otherIndex];
      }
      result.push(candidate);
      lastAssigned = candidate;
    } else {
      const candidates = pool.filter(bg => bg !== lastAssigned);
      const chosenPool = candidates.length > 0 ? candidates : pool;
      const pickIndex = (i % chosenPool.length);
      const chosen = chosenPool[pickIndex];
      result.push(chosen);
      lastAssigned = chosen;
    }
  }

  return result;
}
