import fs from 'fs';
import path from 'path';
import { Quiz } from '../../../remotion/types/index.js';
import { defaultQuizzes } from './defaultQuizzes.js';

export class QuizManager {
  private baseDir: string;

  constructor(baseDir: string) {
    this.baseDir = baseDir;
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  public getQuiz(channelId: string, quizId: string): Quiz {
    const qFile = path.join(this.baseDir, channelId, 'quizzes', `${quizId}.json`);
    if (fs.existsSync(qFile)) {
      return JSON.parse(fs.readFileSync(qFile, 'utf-8'));
    }

    // Check defaults
    if (defaultQuizzes[quizId]) {
      const q = { ...defaultQuizzes[quizId], channelId };
      this.saveQuiz(q);
      return q;
    }

    // Return sample if nothing exists
    const sample = { ...defaultQuizzes['quiz_vi_sample'], channelId };
    this.saveQuiz(sample);
    return sample;
  }

  public saveQuiz(quiz: Quiz): void {
    const quizDir = path.join(this.baseDir, quiz.channelId, 'quizzes');
    if (!fs.existsSync(quizDir)) {
      fs.mkdirSync(quizDir, { recursive: true });
    }
    quiz.updatedAt = new Date().toISOString();
    fs.writeFileSync(path.join(quizDir, `${quiz.id}.json`), JSON.stringify(quiz, null, 2), 'utf-8');
  }

  public listQuizzes(channelId: string): { id: string; title: string; questionCount: number; language: string }[] {
    const quizDir = path.join(this.baseDir, channelId, 'quizzes');
    if (!fs.existsSync(quizDir)) {
      // Seed with defaults
      for (const qKey of Object.keys(defaultQuizzes)) {
        const q = { ...defaultQuizzes[qKey], channelId };
        this.saveQuiz(q);
      }
    }

    const files = fs.readdirSync(quizDir).filter(f => f.endsWith('.json'));
    const list: { id: string; title: string; questionCount: number; language: string }[] = [];

    for (const f of files) {
      try {
        const q: Quiz = JSON.parse(fs.readFileSync(path.join(quizDir, f), 'utf-8'));
        list.push({
          id: q.id,
          title: q.title,
          questionCount: q.questions?.length || 0,
          language: q.language
        });
      } catch (e) {
        console.error(`Error reading quiz ${f}:`, e);
      }
    }

    return list;
  }
}
