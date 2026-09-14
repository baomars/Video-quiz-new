import { QuizQuestion, OptionKey } from '../../../remotion/types/index.js';

export interface ParseResult {
  success: boolean;
  questions: QuizQuestion[];
  errors: string[];
  totalParsed: number;
  title?: string;
}

export function parseQuizText(rawText: string): ParseResult {
  const errors: string[] = [];
  const questions: QuizQuestion[] = [];

  if (!rawText || !rawText.trim()) {
    return {
      success: false,
      questions: [],
      errors: ['Nội dung trống. Vui lòng dán nội dung bộ câu hỏi.'],
      totalParsed: 0
    };
  }

  // Normalize line breaks
  const normalized = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

  // 1. Extract optional Quiz / Video Title from top header
  // Examples: "Tiêu đề: Kiến thức tổng hợp vui", "Title: Fun Trivia Quiz", "Chủ đề: Khoa học vũ trụ"
  let title: string | undefined = undefined;
  let textToParse = normalized;
  const titleMatch = normalized.match(/^(?:[#*_\s]*)(?:tiêu\s*đề|title|chủ\s*đề)(?:[#*_\s]*)(?:[\s:]+)([^\n]+)/i);
  if (titleMatch) {
    title = titleMatch[1].replace(/^["'“‘*_\s]+|["'”’*_\s]+$/g, '').trim();
    // Strip the title line cleanly so it doesn't interfere with question blocks
    textToParse = normalized.replace(/^(?:[#*_\s]*)(?:tiêu\s*đề|title|chủ\s*đề)(?:[#*_\s]*)(?:[\s:]+)[^\n]+(?:\n+|$)/i, '').trim();
  }

  // Split into question blocks using regex matching question starts
  // Match "Câu 1:", "Question 1:", "Q1:", "1.", "1:", etc.
  const questionDelimiter = /(?:^|\n)(?=(?:(?:câu|question|q)\s*\d+[\.:]?|\d+[\.:]\s+))/i;
  const rawBlocks = textToParse.split(questionDelimiter).map(b => b.trim()).filter(Boolean);

  if (rawBlocks.length === 0) {
    return {
      success: false,
      questions: [],
      errors: ['Không tìm thấy định dạng câu hỏi hợp lệ (Ví dụ: "Câu 1: ..." hoặc "Question 1: ...").'],
      totalParsed: 0
    };
  }

  rawBlocks.forEach((block, index) => {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 4) {
      errors.push(`Khối câu hỏi ${index + 1} quá ngắn hoặc thiếu thông tin.`);
      return;
    }

    let questionText = '';
    let optA = '';
    let optB = '';
    let optC = '';
    let correctAnswer: OptionKey = 'A';
    let explanation = '';

    // Step 1: Find Question Header & text
    const headerMatch = lines[0].match(/^(?:(?:câu|question|q)\s*\d+[\.:]?|\d+[\.:])\s*(.*)/i);
    if (headerMatch) {
      questionText = headerMatch[1].trim();
    } else {
      questionText = lines[0];
    }

    // Step 2: Iterate lines to extract options, answer, explanation
    let currentField: 'question' | 'A' | 'B' | 'C' | 'other' | 'explanation' = 'question';

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];

      // Match Option A
      const aMatch = line.match(/^[A][\.\)\-:]\s*(.*)/i);
      if (aMatch) {
        optA = aMatch[1].trim();
        currentField = 'A';
        continue;
      }

      // Match Option B
      const bMatch = line.match(/^[B][\.\)\-:]\s*(.*)/i);
      if (bMatch) {
        optB = bMatch[1].trim();
        currentField = 'B';
        continue;
      }

      // Match Option C
      const cMatch = line.match(/^[C][\.\)\-:]\s*(.*)/i);
      if (cMatch) {
        optC = cMatch[1].trim();
        currentField = 'C';
        continue;
      }

      // If user pasted D, ignore
      const dMatch = line.match(/^[D][\.\)\-:]\s*(.*)/i);
      if (dMatch) {
        currentField = 'other';
        continue;
      }

      // Match Answer / Đáp án
      const ansMatch = line.match(/^(?:đáp án|đáp án là|key|answer|ans|đ\/a|da)[\s:]*([A-C])/i);
      if (ansMatch) {
        correctAnswer = ansMatch[1].toUpperCase() as OptionKey;
        currentField = 'other';
        continue;
      }

      // Match Explanation / Giải thích
      const expMatch = line.match(/^(?:giải thích|explanation|ghi chú|note)[\s:]*(.*)/i);
      if (expMatch) {
        explanation = expMatch[1].trim();
        currentField = 'explanation';
        continue;
      }

      // Multi-line continuations
      if (currentField === 'question' && !optA) {
        questionText += ' ' + line;
      } else if (currentField === 'A') {
        optA += ' ' + line;
      } else if (currentField === 'B') {
        optB += ' ' + line;
      } else if (currentField === 'C') {
        optC += ' ' + line;
      } else if (currentField === 'explanation') {
        explanation += ' ' + line;
      }
    }

    // Validation
    if (!questionText) {
      errors.push(`Câu ${index + 1}: Thiếu nội dung câu hỏi.`);
      return;
    }
    if (!optA || !optB || !optC) {
      errors.push(`Câu ${index + 1} ("${questionText.substring(0, 30)}..."): Cần đầy đủ 3 đáp án A, B, C.`);
      return;
    }

    questions.push({
      id: `q_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 7)}`,
      question: questionText,
      options: {
        A: optA,
        B: optB,
        C: optC
      },
      correctAnswer,
      explanation: explanation || `Đáp án chính xác là ${correctAnswer}.`,
      illustrations: []
    });
  });

  return {
    success: questions.length > 0,
    questions,
    errors,
    totalParsed: questions.length,
    title
  };
}
