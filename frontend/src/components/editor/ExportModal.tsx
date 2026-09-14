import React, { useState } from 'react';
import { Channel, VideoTemplate, Quiz, LanguageCode } from '../../../../remotion/types/index';
import { RenderTab } from './RenderTab';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '../ui/dialog';
import { Film, Sparkles, X, Minimize2 } from 'lucide-react';
import { RenderJob, BatchRenderJob } from './BackgroundRenderWidget';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  channel: Channel;
  template: VideoTemplate;
  quiz: Quiz;
  language: LanguageCode;
  activeJobId?: string | null;
  setActiveJobId?: (id: string | null) => void;
  jobState?: RenderJob | null;
  setJobState?: React.Dispatch<React.SetStateAction<RenderJob | null>> | ((job: RenderJob | null) => void);
  activeBatchId?: string | null;
  setActiveBatchId?: (id: string | null) => void;
  batchState?: BatchRenderJob | null;
  setBatchState?: React.Dispatch<React.SetStateAction<BatchRenderJob | null>> | ((batch: BatchRenderJob | null) => void);
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  channel,
  template,
  quiz,
  language,
  activeJobId,
  setActiveJobId,
  jobState,
  setJobState,
  activeBatchId,
  setActiveBatchId,
  batchState,
  setBatchState
}) => {
  const isRendering = jobState?.status === 'processing' || batchState?.status === 'processing';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl bg-slate-950 border-slate-800 text-slate-100 max-h-[92vh] overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-slate-800">
        <DialogHeader className="border-b border-slate-800 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 font-black">
                <Film size={17} />
              </div>
              <div>
                <DialogTitle className="text-base font-extrabold text-white flex items-center gap-2">
                  <span>Xuất Bản Video MP4 & Render Hàng Loạt</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    High Speed 30 FPS
                  </span>
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400">
                  Render 1 video đơn hoặc sản xuất hàng loạt video từ kho câu hỏi với tiến trình 7 giai đoạn.
                </DialogDescription>
              </div>
            </div>

            {isRendering && (
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition"
                title="Thu nhỏ để render tiếp tục chạy ngầm trong khi bạn thao tác"
              >
                <Minimize2 size={13} />
                <span>Chạy ngầm & Đóng</span>
              </button>
            )}
          </div>
        </DialogHeader>

        {/* Render Tab Content inside Modal */}
        <div className="py-2">
          <RenderTab
            channel={channel}
            template={template}
            quiz={quiz}
            language={language}
            activeJobId={activeJobId}
            setActiveJobId={setActiveJobId}
            jobState={jobState}
            setJobState={setJobState}
            activeBatchId={activeBatchId}
            setActiveBatchId={setActiveBatchId}
            batchState={batchState}
            setBatchState={setBatchState}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
