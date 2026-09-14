import React from 'react';
import {
  HelpCircle,
  Sliders,
  FolderOpen,
  Film
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';

export type MobileNavTab = 'quiz' | 'settings' | null;

interface MobileBottomNavProps {
  activeSheet: MobileNavTab;
  onSelectTab: (tab: MobileNavTab) => void;
  onOpenAssets: () => void;
  onOpenExport: () => void;
  questionCount?: number;
  children?: React.ReactNode;
  sheetTitle?: string;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeSheet,
  onSelectTab,
  onOpenAssets,
  onOpenExport,
  questionCount = 0,
  children,
  sheetTitle = 'Chỉnh sửa'
}) => {
  return (
    <>
      {/* Fixed Bottom Navigation Bar on Mobile (< 1024px) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 z-40 px-3 flex items-center justify-around shadow-2xl">
        {/* 1. Quiz Questions Tab */}
        <button
          onClick={() => onSelectTab(activeSheet === 'quiz' ? null : 'quiz')}
          className={`flex flex-col items-center justify-center min-w-[64px] py-1 px-2 rounded-xl transition-all relative ${
            activeSheet === 'quiz'
              ? 'text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 shadow-xs'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <HelpCircle size={19} className={activeSheet === 'quiz' ? 'text-amber-400 scale-105' : ''} />
            {questionCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 px-1 min-w-3.5 h-3.5 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] flex items-center justify-center">
                {questionCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 font-medium tracking-tight">
            Câu hỏi
          </span>
        </button>

        {/* 2. Settings / Inspector Tab */}
        <button
          onClick={() => onSelectTab(activeSheet === 'settings' ? null : 'settings')}
          className={`flex flex-col items-center justify-center min-w-[64px] py-1 px-2 rounded-xl transition-all ${
            activeSheet === 'settings'
              ? 'text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 shadow-xs'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders size={19} className={activeSheet === 'settings' ? 'text-amber-400 scale-105' : ''} />
          <span className="text-[10px] mt-0.5 font-medium tracking-tight">
            Cài đặt
          </span>
        </button>

        {/* 3. Assets Manager Modal Button */}
        <button
          onClick={() => {
            onSelectTab(null);
            onOpenAssets();
          }}
          className="flex flex-col items-center justify-center min-w-[64px] py-1 px-2 rounded-xl text-slate-400 hover:text-slate-200 transition-all"
        >
          <FolderOpen size={19} />
          <span className="text-[10px] mt-0.5 font-medium tracking-tight">
            Tài nguyên
          </span>
        </button>

        {/* 4. Export Video Modal Button (Highlighted CTA) */}
        <button
          onClick={() => {
            onSelectTab(null);
            onOpenExport();
          }}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all"
        >
          <Film size={15} />
          <span>Xuất Video</span>
        </button>
      </nav>

      {/* Slide-up Bottom Sheet for Mobile Editing */}
      <Sheet open={Boolean(activeSheet)} onOpenChange={(open) => !open && onSelectTab(null)}>
        <SheetContent side="bottom" className="max-h-[85vh] p-4 sm:p-6 overflow-y-auto bg-slate-900 border-slate-800 text-slate-100">
          <SheetHeader className="mb-3 border-b border-slate-800 pb-2">
            <SheetTitle className="text-sm uppercase tracking-wider font-extrabold text-amber-400">
              {sheetTitle}
            </SheetTitle>
          </SheetHeader>
          <div className="pb-16">{children}</div>
        </SheetContent>
      </Sheet>
    </>
  );
};
