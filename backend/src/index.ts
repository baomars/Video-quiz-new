import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { ChannelManager } from './channels/channelManager.js';
import { QuizManager } from './quiz/quizManager.js';
import { EdgeTTSProvider } from './tts/ttsProvider.js';
import { ImageProcessor } from './images/imageProcessor.js';
import { TimelineEngine } from './timeline/timelineEngine.js';
import { RenderManager } from './render/renderManager.js';
import { estimateBatch } from './quiz/quizBatchEngine.js';

const app = express();
const PORT = process.env.PORT || process.env.BACKEND_PORT || 5410;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Directories
const rootDir = process.cwd();
const dataDir = path.join(rootDir, 'data');
const channelsDir = path.join(dataDir, 'channels');
const publicDir = path.join(rootDir, 'public');
const cacheDir = path.join(publicDir, 'cache');
const ttsCacheDir = path.join(cacheDir, 'tts');
const imageCacheDir = path.join(cacheDir, 'images');
const uploadDir = path.join(publicDir, 'uploads');
const illustrationsUploadDir = path.join(uploadDir, 'illustrations');
const audioUploadDir = path.join(uploadDir, 'audio');
if (!fs.existsSync(audioUploadDir)) {
  fs.mkdirSync(audioUploadDir, { recursive: true });
}
const backgroundsUploadDir = path.join(uploadDir, 'backgrounds');
if (!fs.existsSync(backgroundsUploadDir)) {
  fs.mkdirSync(backgroundsUploadDir, { recursive: true });
}
const rendersDir = path.join(dataDir, 'renders');

// Initialize Services
const channelManager = new ChannelManager(channelsDir);
const quizManager = new QuizManager(channelsDir);
const ttsProvider = new EdgeTTSProvider(ttsCacheDir);
const imageProcessor = new ImageProcessor(imageCacheDir, illustrationsUploadDir);
const timelineEngine = new TimelineEngine(30);
const renderManager = new RenderManager(rendersDir, ttsProvider, imageProcessor);

// Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 } // 30MB
});

// Static routes
app.use('/assets', express.static(path.join(publicDir, 'assets')));
app.use('/assets', express.static(path.join(rootDir, 'assets')));
app.use('/cache', express.static(cacheDir));
app.use('/uploads', express.static(uploadDir));
app.use('/renders', express.static(rendersDir));

// --- Channel Endpoints ---
app.get('/api/channels', (req, res) => {
  try {
    const list = channelManager.listChannels();
    res.json({ success: true, channels: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/channels/:id', (req, res) => {
  try {
    const channel = channelManager.getChannel(req.params.id);
    res.json({ success: true, channel });
  } catch (err: any) {
    res.status(404).json({ success: false, error: err.message });
  }
});

app.post('/api/channels', (req, res) => {
  try {
    const channel = req.body;
    if (!channel || !channel.id) {
      return res.status(400).json({ success: false, error: 'Invalid channel payload' });
    }
    channelManager.saveChannel(channel);
    res.json({ success: true, channel });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/channels/:id/duplicate', (req, res) => {
  try {
    const { newId, newName } = req.body;
    const duplicated = channelManager.duplicateChannel(
      req.params.id,
      newId || `${req.params.id}_copy_${Date.now()}`,
      newName || 'Copy Channel'
    );
    res.json({ success: true, channel: duplicated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/channels/:id/reset', (req, res) => {
  try {
    const reset = channelManager.resetChannel(req.params.id);
    res.json({ success: true, channel: reset });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/channels/:id', (req, res) => {
  try {
    channelManager.deleteChannel(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Quiz Endpoints ---
app.get('/api/quizzes/:channelId', (req, res) => {
  try {
    const quizzes = quizManager.listQuizzes(req.params.channelId);
    res.json({ success: true, quizzes });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/quizzes/:channelId/:quizId', (req, res) => {
  try {
    const quiz = quizManager.getQuiz(req.params.channelId, req.params.quizId);
    res.json({ success: true, quiz });
  } catch (err: any) {
    res.status(404).json({ success: false, error: err.message });
  }
});

app.post('/api/quizzes', (req, res) => {
  try {
    const quiz = req.body;
    if (!quiz || !quiz.id || !quiz.channelId) {
      return res.status(400).json({ success: false, error: 'Invalid quiz payload' });
    }
    quizManager.saveQuiz(quiz);
    res.json({ success: true, quiz });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- TTS Endpoints ---
app.get('/api/tts/voices', async (req, res) => {
  try {
    const lang = req.query.lang as string | undefined;
    const voices = await ttsProvider.listVoices(lang);
    res.json({ success: true, voices });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/tts/preview', async (req, res) => {
  try {
    const { text, voice, rate, pitch, volume } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, error: 'Text required' });
    }
    const result = await ttsProvider.generate({
      text,
      voice: voice || 'vi-VN-HoaiMyNeural',
      rate: rate || '+0%',
      pitch: pitch || '+0Hz',
      volume: volume || '+0%'
    });
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Image & Upload Endpoints ---
app.post('/api/upload/image', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    const originalName = req.file.originalname;
    const savedUrl = await imageProcessor.saveUploadedFile(req.file.buffer, originalName);
    
    // Process optimized version
    const processed = await imageProcessor.processImage(savedUrl, {
      width: 720,
      height: 540,
      fit: 'cover'
    });

    res.json({
      success: true,
      originalUrl: savedUrl,
      optimizedUrl: processed.url,
      width: processed.width,
      height: processed.height
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/upload/remove-bg', async (req, res) => {
  try {
    const { imageUrl, tolerance } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ success: false, error: 'Chưa cung cấp đường dẫn ảnh để tách nền.' });
    }
    const result = await imageProcessor.removeBackground(imageUrl, Number(tolerance) || 38);
    res.json({
      success: true,
      url: result.url,
      message: result.message
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/upload/audio', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Chưa chọn file âm thanh tải lên.' });
    }
    const ext = path.extname(req.file.originalname).toLowerCase();
    const allowedExts = ['.mp3', '.wav', '.aac', '.ogg', '.m4a', '.flac', '.webm'];
    if (!allowedExts.includes(ext)) {
      return res.status(400).json({
        success: false,
        error: `Định dạng file không hỗ trợ (${ext}). Vui lòng chọn .mp3, .wav, .aac, .ogg, .m4a, .flac.`
      });
    }

    const safeBaseName = path.basename(req.file.originalname, ext).replace(/[^a-zA-Z0-9_\-]/g, '_');
    const filename = `sfx_${Date.now()}_${safeBaseName}${ext}`;
    const targetPath = path.join(audioUploadDir, filename);

    fs.writeFileSync(targetPath, req.file.buffer);

    res.json({
      success: true,
      url: `/uploads/audio/${filename}`,
      originalName: req.file.originalname,
      fileSizeBytes: req.file.size
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Background Endpoints ---
app.get('/api/backgrounds', (req, res) => {
  try {
    const results: Array<{ name: string; url: string; filename: string }> = [];
    const dirs = [
      { dir: path.join(publicDir, 'assets', 'backgrounds'), prefix: '/assets/backgrounds' },
      { dir: backgroundsUploadDir, prefix: '/uploads/backgrounds' }
    ];

    for (const { dir, prefix } of dirs) {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const ext = path.extname(file).toLowerCase();
          if (['.png', '.jpg', '.jpeg', '.webp', '.svg'].includes(ext)) {
            results.push({
              name: file.replace(/^[0-9]+_/, '').replace(/\.[^.]+$/, ''),
              filename: file,
              url: `${prefix}/${file}`
            });
          }
        }
      }
    }
    res.json({ success: true, backgrounds: results });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/upload/background-batch', upload.array('files', 50), (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, error: 'Chưa có file ảnh nền nào được tải lên' });
    }

    const uploaded: Array<{ name: string; url: string; filename: string }> = [];
    for (const file of files) {
      const ext = path.extname(file.originalname).toLowerCase() || '.png';
      const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_\-]/g, '_');
      const filename = `${Date.now()}_${cleanName}${ext}`;
      const targetPath = path.join(backgroundsUploadDir, filename);
      fs.writeFileSync(targetPath, file.buffer);
      uploaded.push({
        name: cleanName,
        filename,
        url: `/uploads/backgrounds/${filename}`
      });
    }

    res.json({ success: true, backgrounds: uploaded });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Timeline Compute Endpoint ---
app.post('/api/timeline/compute', (req, res) => {
  try {
    const { quiz, channel, template, ttsMap: inputTtsMap } = req.body;
    const ttsMap = { ...(inputTtsMap || {}) };

    // Auto-populate from cache if available so timeline accurately reflects actual TTS duration
    if (quiz && Array.isArray(quiz.questions) && channel) {
      const language = quiz.language || 'vi';
      const langConfig = channel.languages?.[language] || { voice: 'vi-VN-HoaiMyNeural' };
      const revealPrefix = langConfig.revealScript || (language === 'vi' ? 'Đáp án chính xác là' : 'The correct answer is');

      for (const q of quiz.questions) {
        if (!ttsMap[q.id]) {
          const qCached = ttsProvider.getCached({
            text: q.question,
            voice: langConfig.voice,
            rate: langConfig.rate,
            pitch: langConfig.pitch,
            volume: langConfig.volume
          });
          const correctText = `${revealPrefix} ${q.correctAnswer}. ${q.explanation || ''}`.trim();
          const expCached = ttsProvider.getCached({
            text: correctText,
            voice: langConfig.voice,
            rate: langConfig.rate,
            pitch: langConfig.pitch,
            volume: langConfig.volume
          });
          if (qCached || expCached) {
            ttsMap[q.id] = {
              questionUrl: qCached?.url,
              questionDuration: qCached?.durationSec,
              explanationUrl: expCached?.url,
              explanationDuration: expCached?.durationSec
            };
          }
        }
      }
    }

    const result = timelineEngine.computeTimeline(quiz, channel, template, ttsMap);
    res.json({ success: true, ...result, ttsMap });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Render Endpoints ---
app.post('/api/render/start', async (req, res) => {
  try {
    const { channel, template, quiz, language, customFileName, renderPreset, customConcurrency } = req.body;
    if (!channel || !template || !quiz) {
      return res.status(400).json({ success: false, error: 'Missing render payload parameters' });
    }
    const jobId = await renderManager.startRender({
      channel,
      template,
      quiz,
      language: language || 'vi',
      customFileName,
      renderPreset,
      customConcurrency
    });
    res.json({ success: true, jobId });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/render/status/:jobId', (req, res) => {
  const job = renderManager.getJob(req.params.jobId);
  if (!job) {
    return res.status(404).json({ success: false, error: 'Render job not found' });
  }
  res.json({ success: true, job });
});

app.get('/api/render/jobs', (req, res) => {
  const jobs = renderManager.listJobs();
  res.json({ success: true, jobs });
});

app.get('/api/render/download/:jobId', (req, res) => {
  const job = renderManager.getJob(req.params.jobId);
  if (!job || !job.outputPath || !fs.existsSync(job.outputPath)) {
    return res.status(404).json({ success: false, error: 'Render file not found' });
  }
  const downloadFileName = job.fileName || path.basename(job.outputPath) || `${job.jobId}.mp4`;
  res.download(job.outputPath, downloadFileName);
});

// --- Batch Render Endpoints ---
app.post('/api/render/batch', async (req, res) => {
  try {
    const { channel, template, quiz, language, config, customFileNames, renderPreset, customConcurrency } = req.body;
    if (!channel || !template || !quiz || !config) {
      return res.status(400).json({ success: false, error: 'Missing batch render parameters' });
    }
    const batchId = await renderManager.startBatchRender({
      channel,
      template,
      quiz,
      language: language || 'vi',
      config,
      customFileNames,
      renderPreset,
      customConcurrency
    });
    res.json({ success: true, batchId });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/render/batch/:batchId', (req, res) => {
  const batchJob = renderManager.getBatchJob(req.params.batchId);
  if (!batchJob) {
    return res.status(404).json({ success: false, error: 'Batch render job not found' });
  }
  res.json({ success: true, batchJob });
});

app.get('/api/render/batch-jobs', (req, res) => {
  const batchJobs = renderManager.listBatchJobs();
  res.json({ success: true, batchJobs });
});

app.post('/api/quiz/estimate-batch', (req, res) => {
  try {
    const { totalQuestions, questionsPerVideo, requestedVideos } = req.body;
    const est = estimateBatch(Number(totalQuestions) || 0, Number(questionsPerVideo) || 1, Number(requestedVideos) || 1);
    res.json({ success: true, estimation: est });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`Quiz Video Generator API Server running on port ${PORT}`);
});
