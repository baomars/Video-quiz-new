import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PlayerRef } from '@remotion/player';
import {
  Channel,
  VideoTemplate,
  Quiz,
  LanguageCode,
  VideoCompositionProps,
  TimelineQuestionCue
} from '../../remotion/types/index';
import { applyTemplateLayout } from '../../remotion/types/templates';
import {
  fetchChannels,
  fetchChannel,
  saveChannel,
  duplicateChannel,
  resetChannel,
  fetchQuiz,
  saveQuiz,
  computeTimeline,
  getRenderStatus,
  getBatchRenderStatus
} from './services/api';
import { TopBar } from './components/editor/TopBar';
import { VideoCanvas } from './components/editor/VideoCanvas';
import { QuizEditorPanel } from './components/editor/QuizEditorPanel';
import { InspectorPanel } from './components/editor/InspectorPanel';
import { MultiTrackTimeline } from './components/editor/MultiTrackTimeline';
import { ExportModal } from './components/editor/ExportModal';
import { AssetManagerModal } from './components/editor/AssetManagerModal';
import {
  BackgroundRenderWidget,
  RenderJob,
  BatchRenderJob
} from './components/editor/BackgroundRenderWidget';
import { MobileBottomNav, MobileNavTab } from './components/MobileBottomNav';
import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  HelpCircle,
  Sliders,
  Film
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DEFAULT_FALLBACK_CHANNEL,
  DEFAULT_FALLBACK_TEMPLATE,
  DEFAULT_FALLBACK_QUIZ,
  computeLocalTimeline
} from './utils/defaultStudioState';

export const App: React.FC = () => {
  // Pre-computed local timeline for frame 0 instant render
  const initialLocalTimeline = useMemo(() => {
    return computeLocalTimeline(
      DEFAULT_FALLBACK_QUIZ,
      DEFAULT_FALLBACK_CHANNEL,
      DEFAULT_FALLBACK_TEMPLATE
    );
  }, []);

  const [channels, setChannels] = useState<{ id: string; name: string; avatarUrl: string }[]>([
    {
      id: DEFAULT_FALLBACK_CHANNEL.id,
      name: DEFAULT_FALLBACK_CHANNEL.name,
      avatarUrl: DEFAULT_FALLBACK_CHANNEL.branding.identity.avatarUrl || ''
    }
  ]);
  const [currentChannel, setCurrentChannel] = useState<Channel>(DEFAULT_FALLBACK_CHANNEL);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz>(DEFAULT_FALLBACK_QUIZ);
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('vi');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Panel View States
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState<boolean>(true);
  const [isRightInspectorOpen, setIsRightInspectorOpen] = useState<boolean>(true);
  const [isTimelineCollapsed, setIsTimelineCollapsed] = useState<boolean>(false);

  // Modals
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isAssetsModalOpen, setIsAssetsModalOpen] = useState<boolean>(false);
  const [mobileSheetTab, setMobileSheetTab] = useState<MobileNavTab>(null);

  // Background Render States
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobState, setJobState] = useState<RenderJob | null>(null);
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);
  const [batchState, setBatchState] = useState<BatchRenderJob | null>(null);

  // Background Polling for Single Render
  useEffect(() => {
    if (!activeJobId) return;
    const interval = setInterval(async () => {
      try {
        const status = await getRenderStatus(activeJobId);
        setJobState(status);
        if (status.status === 'completed' || status.status === 'failed') {
          clearInterval(interval);
        }
      } catch (err) {
        console.warn('Background poll single render error:', err);
      }
    }, 800);
    return () => clearInterval(interval);
  }, [activeJobId]);

  // Background Polling for Batch Render
  useEffect(() => {
    if (!activeBatchId) return;
    const interval = setInterval(async () => {
      try {
        const status = await getBatchRenderStatus(activeBatchId);
        setBatchState(status);
        if (status.status === 'completed' || status.status === 'failed') {
          clearInterval(interval);
        }
      } catch (err) {
        console.warn('Background poll batch render error:', err);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [activeBatchId]);

  // Inspector element selection
  const [selectedComponentKey, setSelectedComponentKey] = useState<any>('questionBox');
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);

  // Remotion Playhead state
  const playerRef = useRef<PlayerRef>(null);
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Computed timeline
  const [timelineData, setTimelineData] = useState<{
    totalDurationFrames: number;
    cues: TimelineQuestionCue[];
  }>(initialLocalTimeline);

  const saveTimerRef = useRef<any>(null);

  // 1. Initial load channels (background hydration)
  useEffect(() => {
    fetchChannels()
      .then((chs) => {
        if (chs && chs.length > 0) {
          setChannels(chs);
          loadChannelDetails(chs[0].id);
        }
      })
      .catch((err) => console.warn('[App] Background fetchChannels notice:', err));
  }, []);

  // 2. Load Channel Details & Quiz (background hydration)
  const loadChannelDetails = async (channelId: string) => {
    try {
      const ch = await fetchChannel(channelId);
      if (ch && ch.id) {
        setCurrentChannel(ch);
      }

      const quizId = currentLanguage === 'vi' ? 'quiz_vi_sample' : 'quiz_en_sample';
      const q = await fetchQuiz(channelId, quizId);
      if (q && q.questions && q.questions.length > 0) {
        setCurrentQuiz(q);
      }
    } catch (err) {
      console.warn('[App] Notice loading channel details:', err);
    }
  };

  // 3. Current active template (always valid)
  const currentTemplate: VideoTemplate = useMemo(() => {
    const ch = currentChannel || DEFAULT_FALLBACK_CHANNEL;
    if (!ch.templates || ch.templates.length === 0) return DEFAULT_FALLBACK_TEMPLATE;
    const found = ch.templates.find((t) => t.id === ch.activeTemplateId);
    return found || ch.templates[0] || DEFAULT_FALLBACK_TEMPLATE;
  }, [currentChannel]);

  // 4. Compute timeline whenever quiz, channel, or template changes
  useEffect(() => {
    const ch = currentChannel || DEFAULT_FALLBACK_CHANNEL;
    const tmpl = currentTemplate || DEFAULT_FALLBACK_TEMPLATE;
    const q = currentQuiz || DEFAULT_FALLBACK_QUIZ;

    computeTimeline({
      quiz: q,
      channel: ch,
      template: tmpl
    })
      .then((res) => {
        if (res && res.cues) {
          setTimelineData({
            totalDurationFrames: res.totalDurationFrames || 600,
            cues: res.cues
          });
        }
      })
      .catch((err) => {
        console.warn('[App] Timeline computation fallback:', err);
        const local = computeLocalTimeline(q, ch, tmpl);
        setTimelineData(local);
      });
  }, [currentChannel, currentTemplate, currentQuiz, currentLanguage]);

  // 5. Connect Player events with Timeline playhead
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const onTimeUpdate = () => {
      setCurrentFrame(player.getCurrentFrame());
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    player.addEventListener('timeupdate', onTimeUpdate);
    player.addEventListener('play', onPlay);
    player.addEventListener('pause', onPause);

    return () => {
      player.removeEventListener('timeupdate', onTimeUpdate);
      player.removeEventListener('play', onPlay);
      player.removeEventListener('pause', onPause);
    };
  }, [currentChannel, currentTemplate, currentQuiz, timelineData]);

  // 6. Playhead Controls
  const handleSeekToFrame = (frame: number) => {
    setCurrentFrame(frame);
    if (playerRef.current) {
      playerRef.current.seekTo(frame);
    }
  };

  const handleTogglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pause();
    } else {
      playerRef.current.play();
    }
  };

  const handleRestart = () => {
    handleSeekToFrame(0);
  };

  // 7. Spacebar shortcut to Play/Pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === 'Space' &&
        !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        handleTogglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  // 8. Auto-Save with Debounce
  const triggerAutoSave = (updatedChannel?: Channel, updatedQuiz?: Quiz) => {
    setIsSaving(true);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(async () => {
      try {
        if (updatedChannel) {
          await saveChannel(updatedChannel);
        } else if (currentChannel) {
          await saveChannel(currentChannel);
        }

        if (updatedQuiz) {
          await saveQuiz(updatedQuiz);
        } else if (currentQuiz) {
          await saveQuiz(currentQuiz);
        }
      } catch (e) {
        console.error('Auto-save error:', e);
      } finally {
        setIsSaving(false);
      }
    }, 800);
  };

  // Handlers for updates
  const handleChannelChange = (updated: Channel) => {
    setCurrentChannel(updated);
    triggerAutoSave(updated, undefined);
  };

  const handleQuizChange = (updated: Quiz) => {
    setCurrentQuiz(updated);
    triggerAutoSave(undefined, updated);
  };

  const handleTemplateChange = (updatedTemplate: VideoTemplate) => {
    if (!currentChannel) return;
    const exists = currentChannel.templates.some((t) => t.id === updatedTemplate.id);
    const updatedTemplates = exists
      ? currentChannel.templates.map((t) => (t.id === updatedTemplate.id ? updatedTemplate : t))
      : [...currentChannel.templates, updatedTemplate];
    const updatedChannel: Channel = {
      ...currentChannel,
      activeTemplateId: updatedTemplate.id,
      templates: updatedTemplates
    };
    setCurrentChannel(updatedChannel);
    triggerAutoSave(updatedChannel, undefined);
  };

  const handleApplyTemplate = (templateId: string) => {
    if (!currentChannel) return;
    try {
      const baseTemplate = currentTemplate || currentChannel.templates[0] || DEFAULT_FALLBACK_TEMPLATE;
      const { template: newTmpl, channel: updatedChannel } = applyTemplateLayout(templateId, baseTemplate, currentChannel);
      if (!newTmpl || !newTmpl.components || !updatedChannel) {
        console.error('[App] Failed to apply template:', templateId);
        return;
      }
      setCurrentChannel(updatedChannel);
      triggerAutoSave(updatedChannel, undefined);
    } catch (err) {
      console.error('[App] Error in handleApplyTemplate:', err);
    }
  };

  const handleDuplicateChannel = async () => {
    if (!currentChannel) return;
    const newName = prompt('Nhập tên cho kênh nhân bản:', `${currentChannel.name} (Copy)`);
    if (!newName) return;
    try {
      const duplicated = await duplicateChannel(currentChannel.id, undefined, newName);
      const chs = await fetchChannels();
      setChannels(chs);
      setCurrentChannel(duplicated);
      alert(`Đã nhân bản kênh thành công: ${duplicated.name}`);
    } catch (e: any) {
      alert(`Lỗi nhân bản: ${e.message}`);
    }
  };

  const handleResetChannel = async () => {
    if (!currentChannel) return;
    try {
      const reset = await resetChannel(currentChannel.id);
      setCurrentChannel(reset);
      alert('Đã khôi phục cài đặt mặc định thành công!');
    } catch (e: any) {
      alert(`Lỗi khôi phục: ${e.message}`);
    }
  };

  const handleSelectLanguage = (lang: LanguageCode) => {
    setCurrentLanguage(lang);
    if (currentChannel) {
      const quizId = lang === 'vi' ? 'quiz_vi_sample' : 'quiz_en_sample';
      fetchQuiz(currentChannel.id, quizId)
        .then((q) => {
          q.language = lang;
          setCurrentQuiz(q);
        })
        .catch((e) => console.error(e));
    }
  };

  // Active question cue synchronization
  const currentCueIndex = timelineData.cues.findIndex(
    (c) => currentFrame >= c.startFrame && currentFrame < c.endFrame
  );

  const handleSelectQuestion = (idx: number) => {
    setActiveQuestionIndex(idx);
    if (timelineData.cues[idx]) {
      handleSeekToFrame(timelineData.cues[idx].startFrame);
    }
  };

  // Remotion Composition Props (Always defined, immediately playable)
  const compositionProps: VideoCompositionProps = useMemo(() => {
    const ch = currentChannel || DEFAULT_FALLBACK_CHANNEL;
    const tmpl = currentTemplate || DEFAULT_FALLBACK_TEMPLATE;
    const q = currentQuiz || DEFAULT_FALLBACK_QUIZ;

    return {
      channel: ch,
      template: tmpl,
      quiz: q,
      language: currentLanguage,
      totalDurationFrames: timelineData.totalDurationFrames || 600,
      cues: timelineData.cues || [],
      fps: 30,
      width: 720,
      height: 1280
    };
  }, [currentChannel, currentTemplate, currentQuiz, currentLanguage, timelineData]);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* 1. TOP BAR: Studio Brand, Specs, System Status & Export CTA */}
      <TopBar
        channels={channels}
        currentChannel={currentChannel}
        onSelectChannel={loadChannelDetails}
        onDuplicateChannel={handleDuplicateChannel}
        onResetChannel={handleResetChannel}
        currentLanguage={currentLanguage}
        onSelectLanguage={handleSelectLanguage}
        totalDurationFrames={timelineData.totalDurationFrames}
        totalQuestions={currentQuiz?.questions.length || 0}
        fps={30}
        isSaving={isSaving}
        onManualSave={() => triggerAutoSave()}
        onOpenAssetsModal={() => setIsAssetsModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        isRendering={jobState?.status === 'processing' || batchState?.status === 'processing'}
        renderProgress={jobState?.progress || batchState?.progress || 0}
      />

      {/* 2. MAIN 3-PANEL STUDIO WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ================================================================= */}
        {/* LEFT PANEL: Quiz Editor (Cards + dnd-kit Reordering)              */}
        {/* ================================================================= */}
        <div className="hidden lg:flex h-full shrink-0 relative z-20">
          <AnimatePresence initial={false}>
            {isLeftPanelOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 360, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-full overflow-hidden shrink-0 shadow-xl border-r border-slate-800 flex flex-col"
              >
                <QuizEditorPanel
                  quiz={currentQuiz || DEFAULT_FALLBACK_QUIZ}
                  onChange={handleQuizChange}
                  onSelectQuestion={handleSelectQuestion}
                  activeQuestionIndex={currentCueIndex >= 0 ? currentCueIndex : activeQuestionIndex}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Left Panel Toggle Button */}
          <button
            onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
            className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-30 w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 flex items-center justify-center shadow-lg transition"
            title={isLeftPanelOpen ? 'Thu gọn danh sách câu hỏi' : 'Mở rộng câu hỏi'}
          >
            {isLeftPanelOpen ? <PanelLeftClose size={13} /> : <PanelLeftOpen size={13} />}
          </button>
        </div>

        {/* ================================================================= */}
        {/* CENTER VIEWPORT: Video Preview Canvas                             */}
        {/* ================================================================= */}
        <main className="flex-1 h-full flex flex-col min-w-0 overflow-hidden pb-16 lg:pb-0 relative">
          <VideoCanvas
            compositionProps={compositionProps}
            cues={timelineData.cues}
            totalFrames={timelineData.totalDurationFrames}
            currentFrame={currentFrame}
            isPlaying={isPlaying}
            playerRef={playerRef}
            onSeekTo={handleSeekToFrame}
            onTogglePlay={handleTogglePlay}
            onRestart={handleRestart}
            onSelectComponentKey={(k) => {
              setSelectedComponentKey(k);
              setIsRightInspectorOpen(true);
            }}
          />
        </main>

        {/* ================================================================= */}
        {/* RIGHT PANEL: CapCut / Canva Style Properties Inspector           */}
        {/* ================================================================= */}
        <div className="hidden xl:flex h-full shrink-0 relative z-20">
          {/* Right Panel Toggle Button */}
          <button
            onClick={() => setIsRightInspectorOpen(!isRightInspectorOpen)}
            className="absolute -left-3.5 top-1/2 -translate-y-1/2 z-30 w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 flex items-center justify-center shadow-lg transition"
            title={isRightInspectorOpen ? 'Thu gọn Inspector' : 'Mở rộng Inspector'}
          >
            {isRightInspectorOpen ? <PanelRightClose size={13} /> : <PanelRightOpen size={13} />}
          </button>

          <AnimatePresence initial={false}>
            {isRightInspectorOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 340, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-full overflow-hidden shrink-0 shadow-xl border-l border-slate-800 flex flex-col"
              >
                <InspectorPanel
                  template={currentTemplate || DEFAULT_FALLBACK_TEMPLATE}
                  channel={currentChannel || DEFAULT_FALLBACK_CHANNEL}
                  language={currentLanguage}
                  quiz={currentQuiz || DEFAULT_FALLBACK_QUIZ}
                  onQuizChange={handleQuizChange}
                  onTemplateChange={handleTemplateChange}
                  onChannelChange={handleChannelChange}
                  onLanguageChange={handleSelectLanguage}
                  onApplyTemplate={handleApplyTemplate}
                  selectedKey={selectedComponentKey}
                  onSelectKey={setSelectedComponentKey}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 3. BOTTOM PANEL: Multi-Track Timeline (Desktop only, hidden on mobile to avoid overlapping video transport) */}
      <div className="hidden lg:block">
        <MultiTrackTimeline
          cues={timelineData.cues}
          totalFrames={timelineData.totalDurationFrames}
          currentFrame={currentFrame}
          isPlaying={isPlaying}
          fps={30}
          onSeekTo={handleSeekToFrame}
          onTogglePlay={handleTogglePlay}
          onRestart={handleRestart}
          isCollapsed={isTimelineCollapsed}
          onToggleCollapse={() => setIsTimelineCollapsed(!isTimelineCollapsed)}
        />
      </div>

      {/* 4. MODALS */}
      {/* Export & Batch Render Modal */}
      {currentChannel && currentTemplate && currentQuiz && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          channel={currentChannel}
          template={currentTemplate}
          quiz={currentQuiz}
          language={currentLanguage}
          activeJobId={activeJobId}
          setActiveJobId={setActiveJobId}
          jobState={jobState}
          setJobState={setJobState}
          activeBatchId={activeBatchId}
          setActiveBatchId={setActiveBatchId}
          batchState={batchState}
          setBatchState={setBatchState}
        />
      )}

      {/* Assets & Resources Manager Modal */}
      {currentChannel && currentTemplate && (
        <AssetManagerModal
          isOpen={isAssetsModalOpen}
          onClose={() => setIsAssetsModalOpen(false)}
          channel={currentChannel}
          template={currentTemplate}
          onChannelChange={handleChannelChange}
          onTemplateChange={handleTemplateChange}
        />
      )}

      {/* 5. Floating Background Render Status Widget (Non-blocking) */}
      <BackgroundRenderWidget
        jobState={jobState}
        batchState={batchState}
        onOpenDetails={() => setIsExportModalOpen(true)}
        onDismiss={() => {
          setJobState(null);
          setBatchState(null);
          setActiveJobId(null);
          setActiveBatchId(null);
        }}
      />

      {/* 6. Mobile Drawer & Bottom Navigation */}
      <MobileBottomNav
        activeSheet={mobileSheetTab}
        onSelectTab={setMobileSheetTab}
        onOpenAssets={() => setIsAssetsModalOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
        questionCount={currentQuiz?.questions.length || 0}
        sheetTitle={mobileSheetTab === 'quiz' ? 'Danh sách câu hỏi' : 'Cài đặt Studio'}
      >
        {mobileSheetTab === 'quiz' && currentQuiz && (
          <QuizEditorPanel
            quiz={currentQuiz}
            onChange={handleQuizChange}
            onSelectQuestion={handleSelectQuestion}
            activeQuestionIndex={currentCueIndex >= 0 ? currentCueIndex : activeQuestionIndex}
          />
        )}
        {mobileSheetTab === 'settings' && currentTemplate && currentChannel && (
          <InspectorPanel
            template={currentTemplate}
            channel={currentChannel}
            language={currentLanguage}
            quiz={currentQuiz || undefined}
            onQuizChange={handleQuizChange}
            onTemplateChange={handleTemplateChange}
            onChannelChange={handleChannelChange}
            onApplyTemplate={handleApplyTemplate}
            selectedKey={selectedComponentKey}
            onSelectKey={setSelectedComponentKey}
          />
        )}
      </MobileBottomNav>
    </div>
  );
};
