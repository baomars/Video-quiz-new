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

export interface VoiceInfo {
  id: string;
  name: string;
  gender: 'Female' | 'Male';
  locale: string;
  region?: string;
  style?: string;
  suggestedRole?: string;
  isCloned?: boolean;
  sampleUrl?: string;
}

export interface ClonedVoice {
  id: string;
  name: string;
  gender: 'Female' | 'Male';
  locale: string;
  region?: string;
  style?: string;
  suggestedRole?: string;
  sampleUrl: string;
  durationSec: number;
  createdAt: string;
}

export interface DriveVoiceStatus {
  connected: boolean;
  folderName: string;
  folderPath: string | null;
  driveVoiceCount: number;
  localVoiceCount: number;
}

export async function fetchVoices(lang?: string): Promise<VoiceInfo[]> {
  try {
    const url = lang ? `${API_BASE}/tts/voices?lang=${lang}` : `${API_BASE}/tts/voices`;
    const res = await fetchWithTimeout(url, {}, 3000);
    const data = await res.json();
    if (data.success && Array.isArray(data.voices)) {
      return data.voices;
    }
  } catch (err) {
    console.warn('[API] Failed to fetch voices, using default VieNeu voice list:', err);
  }
  return [
    { id: 'Trúc Ly', name: 'Trúc Ly (Nữ - Miền Nam) ⭐', gender: 'Female', locale: 'vi-VN', region: 'Nam', style: 'Dịu dàng, truyền cảm, siêu tự nhiên', suggestedRole: 'Host chính đố vui, đọc giải thích' },
    { id: 'Thiện Minh', name: 'Thiện Minh (Nam - Miền Bắc) ⭐', gender: 'Male', locale: 'vi-VN', region: 'Bắc', style: 'Đĩnh đạc, chuẩn phát thanh viên', suggestedRole: 'Host đố vui kiến thức chuẩn' },
    { id: 'Hải Đăng', name: 'Hải Đăng (Nam - Miền Bắc)', gender: 'Male', locale: 'vi-VN', region: 'Bắc', style: 'Chững chạc, truyền cảm', suggestedRole: 'Host đố vui kiến thức' },
    { id: 'Xuân Vĩnh', name: 'Xuân Vĩnh (Nam - Miền Nam)', gender: 'Male', locale: 'vi-VN', region: 'Nam', style: 'Trầm ấm, gần gũi', suggestedRole: 'Game show, TikTok Shorts' },
    { id: 'Mai Chi', name: 'Mai Chi (Nữ - Miền Bắc)', gender: 'Female', locale: 'vi-VN', region: 'Bắc', style: 'Dịu dàng, trong trẻo', suggestedRole: 'Kể chuyện, quiz tổng hợp' },
    { id: 'Thảo Nhi', name: 'Thảo Nhi (Nữ - Miền Nam)', gender: 'Female', locale: 'vi-VN', region: 'Nam', style: 'Tươi vui, năng động', suggestedRole: 'Gen Z quiz, giải trí' },
    { id: 'Bảo Ngọc', name: 'Bảo Ngọc (Nữ - Miền Trung)', gender: 'Female', locale: 'vi-VN', region: 'Trung', style: 'Mộc mạc, rõ ràng', suggestedRole: 'Văn hóa, lịch sử' },
    { id: 'Minh Quân', name: 'Minh Quân (Nam - Miền Trung)', gender: 'Male', locale: 'vi-VN', region: 'Trung', style: 'Hào sảng, đĩnh đạc', suggestedRole: 'Phim tài liệu, khoa học' },
    { id: 'Quỳnh Như', name: 'Quỳnh Như (Nữ - Miền Nam)', gender: 'Female', locale: 'vi-VN', region: 'Nam', style: 'Ngọt ngào, MC truyền hình', suggestedRole: 'Đố vui giải trí, showbiz' },
    { id: 'Tuấn Kiệt', name: 'Tuấn Kiệt (Nam - Miền Nam)', gender: 'Male', locale: 'vi-VN', region: 'Nam', style: 'Trầm ấm, review phim', suggestedRole: 'Đố vui trinh thám, bí ẩn' },
    { id: 'Hoàng Nam', name: 'Hoàng Nam (Nam - Miền Bắc)', gender: 'Male', locale: 'vi-VN', region: 'Bắc', style: 'Trầm hùng, trang trọng', suggestedRole: 'Bản tin thời sự, lịch sử' },
    { id: 'Phương Linh', name: 'Phương Linh (Nữ - Miền Bắc)', gender: 'Female', locale: 'vi-VN', region: 'Bắc', style: 'Êm dịu, nhẹ nhàng podcast', suggestedRole: 'Tâm lý học, thư giãn' },
    { id: 'Ánh Dương', name: 'Ánh Dương (Nữ - Miền Bắc)', gender: 'Female', locale: 'vi-VN', region: 'Bắc', style: 'Trẻ trung, hiện đại', suggestedRole: 'Đố vui công nghệ, mẹo vặt' },
    { id: 'Duy Khang', name: 'Duy Khang (Nam - Miền Nam)', gender: 'Male', locale: 'vi-VN', region: 'Nam', style: 'Kịch tính, mạnh mẽ', suggestedRole: 'Đố vui tốc độ, thể thao' },
    { id: 'Hương Giang', name: 'Hương Giang (Nữ - Miền Trung)', gender: 'Female', locale: 'vi-VN', region: 'Trung', style: 'Đằm thắm, ngọt ngào giọng Huế', suggestedRole: 'Thơ ca, ca dao, ẩm thực' },
    { id: 'Hùng Dũng', name: 'Hùng Dũng (Nam - Miền Bắc)', gender: 'Male', locale: 'vi-VN', region: 'Bắc', style: 'Trầm dày, nam tính phim rạp', suggestedRole: 'Trailer câu hỏi kịch tính' },
    { id: 'Thanh Thảo', name: 'Thanh Thảo (Nữ - Miền Nam)', gender: 'Female', locale: 'vi-VN', region: 'Nam', style: 'Năng động, tươi sáng', suggestedRole: 'Đố vui thương hiệu, ẩm thực' },
    { id: 'Gia Huy', name: 'Gia Huy (Nam - Miền Bắc)', gender: 'Male', locale: 'vi-VN', region: 'Bắc', style: 'Vui tươi, hóm hỉnh', suggestedRole: 'Đố vui hài hước, đố mẹo' },
    { id: 'Ngọc Bích', name: 'Ngọc Bích (Nữ - Miền Bắc)', gender: 'Female', locale: 'vi-VN', region: 'Bắc', style: 'Chuẩn mực, giọng đọc sách', suggestedRole: 'Đố từ vựng, sách tinh hoa' },
    { id: 'Khánh An', name: 'Khánh An (Nữ - Miền Nam)', gender: 'Female', locale: 'vi-VN', region: 'Nam', style: 'Mộc mạc, gần gũi', suggestedRole: 'Đố phong tục, chuyện gia đình' },
    { id: 'Việt Anh', name: 'Việt Anh (Nam - Miền Bắc)', gender: 'Male', locale: 'vi-VN', region: 'Bắc', style: 'Tưng bừng, phong thái MC', suggestedRole: 'Gameshow đố vui có thưởng' },
    { id: 'Thu Hà', name: 'Thu Hà (Nữ - Miền Bắc)', gender: 'Female', locale: 'vi-VN', region: 'Bắc', style: 'Rành mạch, khoa học', suggestedRole: 'Động vật, khoa học tự nhiên' },
    { id: 'Adam bựa', name: 'Adam bựa (Nam - Meme/Hài)', gender: 'Male', locale: 'vi-VN', region: 'Bắc', style: 'Hài hước, châm biếm, meme', suggestedRole: 'Đố troll, viral video' },
    { id: 'en-US-Jenny', name: 'Jenny (Female - English)', gender: 'Female', locale: 'en-US', region: 'US', style: 'Clear, friendly', suggestedRole: 'English trivia host' },
    { id: 'en-US-Guy', name: 'Guy (Male - English)', gender: 'Male', locale: 'en-US', region: 'US', style: 'Confident, engaging', suggestedRole: 'English game show host' }
  ];
}

export async function fetchVoiceStudioData(lang?: string): Promise<{
  voices: VoiceInfo[];
  cloned: ClonedVoice[];
  vieneuReady: boolean;
}> {
  try {
    const url = lang ? `${API_BASE}/voices?lang=${lang}` : `${API_BASE}/voices`;
    const res = await fetchWithTimeout(url, {}, 3500);
    const data = await res.json();
    if (data.success) {
      return {
        voices: data.voices || [],
        cloned: data.cloned || [],
        vieneuReady: !!data.vieneuReady
      };
    }
  } catch (err) {
    console.warn('[API] Failed to fetch voice studio data:', err);
  }
  const fallbackVoices = await fetchVoices(lang);
  return { voices: fallbackVoices, cloned: [], vieneuReady: false };
}

export async function cloneVoice(formData: FormData): Promise<ClonedVoice> {
  const res = await fetch(`${API_BASE}/voices/clone`, {
    method: 'POST',
    body: formData
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to clone voice');
  return data.voice;
}

export async function deleteClonedVoice(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/voices/clone/${id}`, {
    method: 'DELETE'
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to delete cloned voice');
}

export async function fetchDriveVoiceStatus(): Promise<DriveVoiceStatus> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/voices/drive/status`, {}, 3000);
    const data = await res.json();
    if (data.success) {
      return {
        connected: !!data.connected,
        folderName: data.folderName || '',
        folderPath: data.folderPath || null,
        driveVoiceCount: data.driveVoiceCount || 0,
        localVoiceCount: data.localVoiceCount || 0
      };
    }
  } catch (err) {
    console.warn('[API] Failed to fetch drive voice status:', err);
  }
  return {
    connected: false,
    folderName: '',
    folderPath: null,
    driveVoiceCount: 0,
    localVoiceCount: 0
  };
}

export async function importVoicesFromDrive(): Promise<{ success: boolean; count: number; folder: string; message: string }> {
  const res = await fetch(`${API_BASE}/voices/drive/import`, { method: 'POST' });
  const data = await res.json();
  if (!data.success && data.message) throw new Error(data.message);
  return data;
}

export async function backupVoicesToDrive(): Promise<{ success: boolean; count: number; folder: string; message: string }> {
  const res = await fetch(`${API_BASE}/voices/drive/backup`, { method: 'POST' });
  const data = await res.json();
  if (!data.success && data.message) throw new Error(data.message);
  return data;
}

export async function previewTTS(params: { text: string; voice: string; rate?: string; pitch?: string; volume?: string; speed?: number }) {
  const res = await fetch(`${API_BASE}/tts/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to preview TTS');
  return data.result;
}

export interface TTSPregenerateStatus {
  jobId: string;
  status: 'pending' | 'generating' | 'ready' | 'failed';
  totalItems: number;
  completedItems: number;
  failedItems: number;
  percent: number;
  currentText?: string;
  items?: Array<{
    id: string;
    type: 'question' | 'answer' | 'explanation';
    text: string;
    status: string;
    url?: string;
    durationSec?: number;
    fromCache?: boolean;
  }>;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export async function startTTSPregenerate(params: {
  quiz: Quiz;
  channel: Channel;
  template: VideoTemplate;
  language?: LanguageCode;
}): Promise<string> {
  const res = await fetch(`${API_BASE}/tts/pregenerate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to start TTS pre-generation');
  return data.pregenerateId;
}

export async function getTTSPregenerateStatus(jobId: string): Promise<TTSPregenerateStatus> {
  const res = await fetch(`${API_BASE}/tts/pregenerate/status/${jobId}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to get TTS pre-generation status');
  return data.job;
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

