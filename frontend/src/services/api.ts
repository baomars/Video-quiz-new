import { Channel, Quiz, VideoTemplate, LanguageCode, TimelineQuestionCue } from '../../../remotion/types/index';
import {
  DEFAULT_FALLBACK_CHANNEL,
  DEFAULT_FALLBACK_QUIZ,
  computeLocalTimeline
} from '../utils/defaultStudioState';

const API_BASE = '/api';

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs: number = 3500): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

export async function fetchChannels(): Promise<{ id: string; name: string; description: string; avatarUrl: string }[]> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/channels`, {}, 3000);
    const data = await res.json();
    if (data.success && Array.isArray(data.channels) && data.channels.length > 0) {
      return data.channels;
    }
  } catch (err) {
    console.warn('[API] Failed to fetch channels, using fallback channel list:', err);
  }
  return [{
    id: DEFAULT_FALLBACK_CHANNEL.id,
    name: DEFAULT_FALLBACK_CHANNEL.name,
    description: DEFAULT_FALLBACK_CHANNEL.description,
    avatarUrl: DEFAULT_FALLBACK_CHANNEL.branding.identity.avatarUrl || ''
  }];
}

export async function fetchChannel(id: string): Promise<Channel> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/channels/${id}`, {}, 3000);
    const data = await res.json();
    if (data.success && data.channel) {
      return data.channel;
    }
  } catch (err) {
    console.warn(`[API] Failed to fetch channel ${id}, using DEFAULT_FALLBACK_CHANNEL:`, err);
  }
  return DEFAULT_FALLBACK_CHANNEL;
}

export async function saveChannel(channel: Channel): Promise<Channel> {
  const res = await fetch(`${API_BASE}/channels`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(channel)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to save channel');
  return data.channel;
}

export async function duplicateChannel(id: string, newId?: string, newName?: string): Promise<Channel> {
  const res = await fetch(`${API_BASE}/channels/${id}/duplicate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newId, newName })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to duplicate channel');
  return data.channel;
}

export async function resetChannel(id: string): Promise<Channel> {
  const res = await fetch(`${API_BASE}/channels/${id}/reset`, { method: 'POST' });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to reset channel');
  return data.channel;
}

export async function fetchQuizzes(channelId: string): Promise<{ id: string; title: string; questionCount: number; language: string }[]> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/quizzes/${channelId}`, {}, 3000);
    const data = await res.json();
    if (data.success && Array.isArray(data.quizzes)) {
      return data.quizzes;
    }
  } catch (err) {
    console.warn(`[API] Failed to fetch quizzes for ${channelId}:`, err);
  }
  return [{
    id: DEFAULT_FALLBACK_QUIZ.id,
    title: DEFAULT_FALLBACK_QUIZ.title,
    questionCount: DEFAULT_FALLBACK_QUIZ.questions.length,
    language: DEFAULT_FALLBACK_QUIZ.language
  }];
}

export async function fetchQuiz(channelId: string, quizId: string): Promise<Quiz> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/quizzes/${channelId}/${quizId}`, {}, 3000);
    const data = await res.json();
    if (data.success && data.quiz) {
      return data.quiz;
    }
  } catch (err) {
    console.warn(`[API] Failed to fetch quiz ${quizId}, using DEFAULT_FALLBACK_QUIZ:`, err);
  }
  return { ...DEFAULT_FALLBACK_QUIZ, channelId };
}

export async function saveQuiz(quiz: Quiz): Promise<Quiz> {
  const res = await fetch(`${API_BASE}/quizzes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(quiz)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to save quiz');
  return data.quiz;
}

export async function fetchVoices(lang?: string): Promise<any[]> {
  try {
    const url = lang ? `${API_BASE}/tts/voices?lang=${lang}` : `${API_BASE}/tts/voices`;
    const res = await fetchWithTimeout(url, {}, 3000);
    const data = await res.json();
    if (data.success && Array.isArray(data.voices)) {
      return data.voices;
    }
  } catch (err) {
    console.warn('[API] Failed to fetch voices, using default voice list:', err);
  }
  return [
    { ShortName: 'vi-VN-HoaiMyNeural', DisplayName: 'Hoài My (Nữ)', Locale: 'vi-VN' },
    { ShortName: 'vi-VN-NamMinhNeural', DisplayName: 'Nam Minh (Nam)', Locale: 'vi-VN' },
    { ShortName: 'en-US-JennyNeural', DisplayName: 'Jenny (US Female)', Locale: 'en-US' },
    { ShortName: 'en-US-GuyNeural', DisplayName: 'Guy (US Male)', Locale: 'en-US' }
  ];
}

export async function previewTTS(params: { text: string; voice: string; rate?: string; pitch?: string; volume?: string }) {
  const res = await fetch(`${API_BASE}/tts/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to preview TTS');
  return data.result;
}

export async function uploadImage(file: File): Promise<{ originalUrl: string; optimizedUrl: string; width: number; height: number }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/upload/image`, {
    method: 'POST',
    body: formData
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to upload image');
  return data;
}

export async function removeImageBackground(imageUrl: string, tolerance?: number): Promise<{ url: string; message: string }> {
  const res = await fetch(`${API_BASE}/upload/remove-bg`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl, tolerance })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Lỗi khi tách nền logo');
  return data;
}

export async function uploadAudio(file: File): Promise<{ url: string; originalName: string; fileSizeBytes?: number }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/upload/audio`, {
    method: 'POST',
    body: formData
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to upload audio');
  return data;
}

export async function computeTimeline(params: {
  quiz: Quiz;
  channel: Channel;
  template: VideoTemplate;
  ttsMap?: Record<string, any>;
}): Promise<{ totalDurationFrames: number; cues: TimelineQuestionCue[] }> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/timeline/compute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    }, 3000);
    const data = await res.json();
    if (data.success && data.cues && Array.isArray(data.cues)) {
      return {
        totalDurationFrames: data.totalDurationFrames || 600,
        cues: data.cues
      };
    }
  } catch (err) {
    console.warn('[API] Timeline compute request failed or timed out, using instant local timeline computation:', err);
  }
  return computeLocalTimeline(params.quiz, params.channel, params.template);
}

export async function startRender(params: {
  channel: Channel;
  template: VideoTemplate;
  quiz: Quiz;
  language: LanguageCode;
  customFileName?: string;
  renderPreset?: 'fast' | 'standard' | 'high_quality';
  customConcurrency?: number;
}): Promise<string> {
  const res = await fetch(`${API_BASE}/render/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to start render');
  return data.jobId;
}

export async function getRenderStatus(jobId: string) {
  const res = await fetch(`${API_BASE}/render/status/${jobId}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to get render status');
  return data.job;
}

export async function listRenderJobs() {
  const res = await fetch(`${API_BASE}/render/jobs`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to list render jobs');
  return data.jobs;
}

export async function startBatchRender(params: {
  channel: Channel;
  template: VideoTemplate;
  quiz: Quiz;
  language: LanguageCode;
  config: any;
  customFileNames?: string[];
  renderPreset?: 'fast' | 'standard' | 'high_quality';
  customConcurrency?: number;
}): Promise<string> {
  const res = await fetch(`${API_BASE}/render/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to start batch render');
  return data.batchId;
}

export async function getBatchRenderStatus(batchId: string) {
  const res = await fetch(`${API_BASE}/render/batch/${batchId}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to get batch render status');
  return data.batchJob;
}

export async function listBatchRenderJobs() {
  const res = await fetch(`${API_BASE}/render/batch-jobs`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to list batch jobs');
  return data.batchJobs;
}

export async function fetchBackgrounds(): Promise<Array<{ name: string; url: string; filename: string }>> {
  const res = await fetch(`${API_BASE}/backgrounds`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch backgrounds');
  return data.backgrounds || [];
}

export async function uploadBackgroundBatch(files: File[]): Promise<Array<{ name: string; url: string; filename: string }>> {
  const formData = new FormData();
  for (const file of files) {
    formData.append('files', file);
  }
  const res = await fetch(`${API_BASE}/upload/background-batch`, {
    method: 'POST',
    body: formData
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to upload backgrounds');
  return data.backgrounds || [];
}

