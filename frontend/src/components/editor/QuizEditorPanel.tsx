import React, { useState, useRef } from 'react';
import { Quiz, QuizQuestion, OptionKey } from '../../../../remotion/types/index';
import { uploadImage } from '../../services/api';
import { parseQuizText } from '../../utils/quizParser';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  FileText,
  AlertCircle,
  GripVertical,
  X,
  Sparkles,
  HelpCircle,
  FolderDown,
  ArrowUpDown
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../ui/dialog';

interface QuizEditorPanelProps {
  quiz: Quiz;
  onChange: (updated: Quiz) => void;
  onSelectQuestion?: (index: number) => void;
  activeQuestionIndex?: number;
}

// Sortable Item Component with dnd-kit
interface SortableCardProps {
  q: QuizQuestion;
  idx: number;
  isSelected: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onSelect: () => void;
  onUpdate: (updated: Partial<QuizQuestion>) => void;
  onDelete: (e: React.MouseEvent) => void;
  onDuplicate: (e: React.MouseEvent) => void;
  onUploadImage: (slot: number, file: File) => void;
  onRemoveImage: (slot: number, e: React.MouseEvent) => void;
}

const SortableCard: React.FC<SortableCardProps> = ({
  q,
  idx,
  isSelected,
  isExpanded,
  onToggleExpand,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  onUploadImage,
  onRemoveImage
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: q.id });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.75 : 1
  };

  const hasImage = Boolean(q.illustrations && q.illustrations.length > 0 && q.illustrations[0]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-xl border transition-all select-none overflow-hidden ${
        isDragging
          ? 'ring-2 ring-amber-500 shadow-xl border-amber-400 bg-slate-900'
          : isSelected
          ? 'border-amber-500/80 bg-slate-900/90 shadow-md ring-1 ring-amber-500/40'
          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
      }`}
    >
      {/* Card Header Row */}
      <div
        onClick={() => {
          onSelect();
          onToggleExpand();
        }}
        className="p-2.5 flex items-center gap-2.5 cursor-pointer transition"
      >
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="p-1 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-md cursor-grab active:cursor-grabbing shrink-0 touch-none"
          title="Kéo thả đổi thứ tự"
        >
          <GripVertical size={14} />
        </div>

        {/* Index Badge */}
        <span
          className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
            isSelected
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'bg-slate-800 text-slate-400'
          }`}
        >
          #{idx + 1}
        </span>

        {/* Thumbnail Preview */}
        <div className="shrink-0 w-10 h-10 rounded-lg border border-slate-700/80 bg-slate-950 overflow-hidden flex items-center justify-center relative">
          {hasImage ? (
            <img
              src={q.illustrations[0]}
              alt={`Q${idx + 1}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon size={16} className="text-slate-600" />
          )}
        </div>

        {/* Question Text Snippet & Answer Badge */}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-slate-200 truncate">
            {q.question || 'Câu hỏi chưa có nội dung...'}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.2 rounded">
              ĐA: {q.correctAnswer}
            </span>
            <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
              {q.options[q.correctAnswer]}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-md transition"
            title="Thêm hoặc đổi ảnh"
          >
            <ImageIcon size={13} />
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUploadImage(0, file);
            }}
            className="hidden"
          />

          <button
            onClick={onDuplicate}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition"
            title="Nhân bản"
          >
            <Copy size={13} />
          </button>

          <button
            onClick={onDelete}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-md transition"
            title="Xóa"
          >
            <Trash2 size={13} />
          </button>

          <button
            onClick={onToggleExpand}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition"
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Expanded Details Form */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="border-t border-slate-800 bg-slate-950/80 p-3 space-y-3"
          >
            {/* 1. Question Textarea */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                Nội dung câu hỏi:
              </label>
              <Textarea
                rows={2}
                value={q.question}
                onChange={(e) => onUpdate({ question: e.target.value })}
                placeholder="Nhập câu hỏi đố vui..."
                className="bg-slate-900 border-slate-700 text-slate-100 text-xs font-semibold focus:border-amber-500"
              />
            </div>

            {/* 2. Options (A, B, C) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  3 Phương án & Chọn đáp án đúng:
                </span>
                <span className="text-[10px] text-amber-400 font-medium">Click radio chọn ĐA đúng</span>
              </div>

              {(['A', 'B', 'C'] as OptionKey[]).map((opt) => {
                const isCorrect = q.correctAnswer === opt;
                return (
                  <div
                    key={opt}
                    className={`flex items-center gap-2 p-1.5 rounded-lg border transition ${
                      isCorrect
                        ? 'border-emerald-500/80 bg-emerald-950/40 ring-1 ring-emerald-500/30'
                        : 'border-slate-800 bg-slate-900/60'
                    }`}
                  >
                    {/* Radio */}
                    <button
                      type="button"
                      onClick={() => onUpdate({ correctAnswer: opt })}
                      className={`w-6 h-6 rounded-md font-bold text-xs flex items-center justify-center shrink-0 cursor-pointer transition ${
                        isCorrect
                          ? 'bg-emerald-500 text-slate-950 font-black shadow-xs'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                      title={`Đặt ${opt} là đáp án đúng`}
                    >
                      {opt}
                    </button>

                    {/* Input */}
                    <Input
                      value={q.options[opt]}
                      onChange={(e) =>
                        onUpdate({
                          options: {
                            ...q.options,
                            [opt]: e.target.value
                          }
                        })
                      }
                      placeholder={`Đáp án ${opt}...`}
                      className="h-7 text-xs bg-transparent border-none text-slate-100 font-medium focus-visible:ring-0 p-1"
                    />

                    {isCorrect && (
                      <span className="text-[10px] text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-900/60 shrink-0">
                        Đúng
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 3. Explanation */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                Giải thích ngắn gọn (TTS đọc sau countdown):
              </label>
              <Textarea
                rows={2}
                value={q.explanation || ''}
                onChange={(e) => onUpdate({ explanation: e.target.value })}
                placeholder="Giải thích vì sao đáp án này đúng..."
                className="bg-slate-900 border-slate-700 text-slate-100 text-xs font-medium focus:border-amber-500"
              />
            </div>

            {/* 4. Single Illustration Manager (Strictly 1 Image) */}
            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon size={12} className="text-amber-400" />
                  Ảnh minh họa (Tùy chọn - Tối đa 1 ảnh):
                </span>
                {q.illustrations && q.illustrations[0] && (
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <Check size={11} /> Đã có ảnh
                  </span>
                )}
              </div>

              {q.illustrations && q.illustrations[0] ? (
                <div className="relative border border-slate-700 rounded-lg p-2 flex items-center gap-3 bg-slate-950/70">
                  <div className="relative w-16 h-16 rounded-md overflow-hidden shrink-0 border border-slate-700">
                    <img
                      src={q.illustrations[0]}
                      alt="Illustration"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <span className="text-xs text-slate-200 font-medium truncate block">
                      Ảnh minh họa câu #{idx + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded text-[11px] font-semibold flex items-center gap-1 transition"
                      >
                        <Upload size={12} />
                        <span>Đổi ảnh</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => onRemoveImage(0, e)}
                        className="px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 rounded text-[11px] font-semibold flex items-center gap-1 transition"
                      >
                        <Trash2 size={12} />
                        <span>Gỡ ảnh</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-dashed border-slate-700 hover:border-amber-500/60 rounded-lg p-3 flex flex-col items-center justify-center gap-1 bg-slate-950/40 hover:bg-slate-950/80 cursor-pointer transition"
                >
                  <Upload size={16} className="text-amber-400" />
                  <span className="text-xs text-slate-300 font-semibold">Tải lên 1 ảnh minh họa</span>
                  <span className="text-[10px] text-slate-500">Để trống nếu không cần ảnh (câu hỏi sẽ tự co giãn đều)</span>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onUploadImage(0, file);
                  e.target.value = '';
                }}
                className="hidden"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const QuizEditorPanel: React.FC<QuizEditorPanelProps> = ({
  quiz,
  onChange,
  onSelectQuestion,
  activeQuestionIndex = 0
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(quiz.questions[0]?.id || null);
  const [showImportDialog, setShowImportDialog] = useState<boolean>(false);
  const [importText, setImportText] = useState<string>('');
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [parseFeedback, setParseFeedback] = useState<{
    success: boolean;
    totalParsed: number;
    errors: string[];
    questions: QuizQuestion[];
    title?: string;
  } | null>(null);

  // DnD Sensors setup
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = quiz.questions.findIndex((item) => item.id === active.id);
      const newIndex = quiz.questions.findIndex((item) => item.id === over.id);
      const reordered = arrayMove(quiz.questions, oldIndex, newIndex);
      onChange({ ...quiz, questions: reordered });
    }
  };

  const handleAddQuestion = () => {
    const newQ: QuizQuestion = {
      id: `q_${Date.now()}`,
      question: 'Câu hỏi mới là gì?',
      options: {
        A: 'Phương án A',
        B: 'Phương án B',
        C: 'Phương án C'
      },
      correctAnswer: 'A',
      explanation: 'Giải thích ngắn gọn cho đáp án A...',
      illustrations: []
    };
    const updatedQuestions = [...quiz.questions, newQ];
    onChange({ ...quiz, questions: updatedQuestions });
    setExpandedId(newQ.id);
  };

  const handleDuplicateQuestion = (idx: number) => {
    const original = quiz.questions[idx];
    const cloned: QuizQuestion = {
      ...original,
      id: `q_${Date.now()}`,
      question: `${original.question} (Bản sao)`
    };
    const updated = [...quiz.questions];
    updated.splice(idx + 1, 0, cloned);
    onChange({ ...quiz, questions: updated });
    setExpandedId(cloned.id);
  };

  const handleDeleteQuestion = (idx: number) => {
    if (quiz.questions.length <= 1) {
      alert('Video cần có ít nhất 1 câu hỏi!');
      return;
    }
    const updated = quiz.questions.filter((_, i) => i !== idx);
    onChange({ ...quiz, questions: updated });
  };

  const handleUpdateQuestion = (idx: number, updated: Partial<QuizQuestion>) => {
    const updatedQuestions = quiz.questions.map((q, i) =>
      i === idx ? { ...q, ...updated } : q
    );
    onChange({ ...quiz, questions: updatedQuestions });
  };

  const handleUploadImage = async (qIdx: number, _slot: number, file: File) => {
    try {
      const res = await uploadImage(file);
      // Strictly single illustration per question
      handleUpdateQuestion(qIdx, { illustrations: [res.optimizedUrl || res.originalUrl] });
    } catch (err: any) {
      alert(`Lỗi upload ảnh: ${err.message}`);
    }
  };

  const handleRemoveImage = (qIdx: number, _slot: number, e: React.MouseEvent) => {
    e.stopPropagation();
    // Strictly clear illustration
    handleUpdateQuestion(qIdx, { illustrations: [] });
  };

  // Sample templates for Copy button
  const sampleViFormat = `Tiêu đề: Kiến thức tổng hợp vui\n\nCâu 1: Thủ đô của Việt Nam là gì?\nA. TP. Hồ Chí Minh\nB. Hà Nội\nC. Đà Nẵng\nĐáp án: B\nGiải thích: Hà Nội là thủ đô của Việt Nam từ năm 1976.\n\nCâu 2: Đỉnh núi nào cao nhất Việt Nam?\nA. Fansipan\nB. Bạch Mộc Lương Tử\nC. Pu Si Lung\nĐáp án: A\nGiải thích: Fansipan cao 3.143m, được mệnh danh là nóc nhà Đông Dương.`;

  const sampleEnFormat = `Title: General Knowledge Quiz\n\nQuestion 1: What is the capital of France?\nA. London\nB. Berlin\nC. Paris\nAnswer: C\nExplanation: Paris has been the capital of France since the Middle Ages.\n\nQuestion 2: Which planet is closest to the Sun?\nA. Venus\nB. Mercury\nC. Mars\nAnswer: B\nExplanation: Mercury orbits closest to the Sun at about 58 million km.`;

  const handleImportTextChange = (text: string) => {
    setImportText(text);
    if (!text.trim()) {
      setParseFeedback(null);
      return;
    }
    const result = parseQuizText(text);
    setParseFeedback({
      success: result.questions.length > 0,
      totalParsed: result.questions.length,
      errors: result.errors,
      questions: result.questions,
      title: result.title
    });
  };

  const handleApplyImport = () => {
    if (!parseFeedback || parseFeedback.questions.length === 0) return;

    let updatedQuestions: QuizQuestion[];
    if (importMode === 'replace') {
      updatedQuestions = parseFeedback.questions;
    } else {
      updatedQuestions = [...quiz.questions, ...parseFeedback.questions];
    }

    const updatedQuiz: Quiz = {
      ...quiz,
      title: parseFeedback.title || quiz.title,
      questions: updatedQuestions
    };

    onChange(updatedQuiz);
    setShowImportDialog(false);
    setImportText('');
    setParseFeedback(null);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 border-r border-slate-800 text-slate-200 select-none overflow-hidden">
      {/* Header Bar */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/80">
        <div className="flex items-center gap-2">
          <HelpCircle size={15} className="text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Câu hỏi ({quiz.questions.length})
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowImportDialog(true)}
            className="h-7 px-2 text-[11px] font-bold bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200 gap-1 rounded-lg"
            title="Dán nhanh câu hỏi từ văn bản"
          >
            <FolderDown size={12} className="text-amber-400" />
            <span>Nhập nhanh</span>
          </Button>

          <Button
            size="sm"
            onClick={handleAddQuestion}
            className="h-7 px-2 text-[11px] font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 gap-1 rounded-lg shadow-xs"
            title="Thêm câu hỏi mới"
          >
            <Plus size={13} />
            <span>Thêm</span>
          </Button>
        </div>
      </div>

      {/* Quiz / Video Title Field (Editable directly by hand) */}
      <div className="px-3 py-2 border-b border-slate-800 bg-slate-900/50 shrink-0 space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
            Tiêu đề Video / Quiz:
          </label>
          <span className="text-[10px] text-slate-500 font-medium">Sửa trực tiếp</span>
        </div>
        <input
          type="text"
          value={quiz.title || ''}
          onChange={(e) => onChange({ ...quiz, title: e.target.value })}
          placeholder="Nhập tiêu đề video (ví dụ: Kiến thức tổng hợp vui)..."
          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none transition shadow-inner"
        />
      </div>

      {/* Card List with DnD */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2 scrollbar-thin scrollbar-thumb-slate-800">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={quiz.questions.map((q) => q.id)}
            strategy={verticalListSortingStrategy}
          >
            {quiz.questions.map((q, idx) => (
              <SortableCard
                key={q.id}
                q={q}
                idx={idx}
                isSelected={activeQuestionIndex === idx}
                isExpanded={expandedId === q.id}
                onToggleExpand={() =>
                  setExpandedId(expandedId === q.id ? null : q.id)
                }
                onSelect={() => onSelectQuestion?.(idx)}
                onUpdate={(up) => handleUpdateQuestion(idx, up)}
                onDelete={(e) => {
                  e.stopPropagation();
                  handleDeleteQuestion(idx);
                }}
                onDuplicate={(e) => {
                  e.stopPropagation();
                  handleDuplicateQuestion(idx);
                }}
                onUploadImage={(slot, file) => handleUploadImage(idx, slot, file)}
                onRemoveImage={(slot, e) => handleRemoveImage(idx, slot, e)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {/* Bulk Import / Paste Quiz Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="sm:max-w-2xl bg-slate-900 border-slate-800 text-slate-100 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-400">
              <FileText size={18} />
              Nhập nhanh danh sách câu hỏi (Bulk Import)
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Dán nội dung câu hỏi theo định dạng chuẩn bên dưới. Hệ thống tự động phân tích và tạo câu hỏi kèm đáp án đúng.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-1">
            {/* Template Format & Copy buttons */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-400" />
                  Định dạng chuẩn Parser nhận diện:
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(sampleViFormat);
                      setCopySuccess(true);
                      setTimeout(() => setCopySuccess(false), 2500);
                    }}
                    className="h-7 text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold gap-1.5 shadow-xs"
                    title="Sao chép toàn bộ format mẫu chuẩn"
                  >
                    {copySuccess ? <Check size={13} className="text-slate-950 font-bold" /> : <Copy size={13} />}
                    <span>{copySuccess ? 'Đã sao chép!' : 'Copy Template'}</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(sampleEnFormat);
                      alert('Đã sao chép mẫu Tiếng Anh vào Clipboard!');
                    }}
                    className="h-7 px-2 text-[10px] font-bold bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
                  >
                    <Copy size={11} className="mr-1 text-sky-400" />
                    Mẫu EN
                  </Button>
                </div>
              </div>

              {/* Exact visual template requested by user */}
              <div className="font-mono text-[11px] text-slate-300 bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-2 leading-relaxed">
                <div className="text-amber-400 font-bold">
                  Tiêu đề: <span className="text-white font-semibold">Kiến thức tổng hợp vui</span>
                </div>

                <div className="space-y-0.5 text-slate-300">
                  <p><span className="text-amber-400 font-bold">Câu 1:</span> Thủ đô của Việt Nam là gì?</p>
                  <p><span className="text-sky-400 font-bold">A.</span> TP. Hồ Chí Minh</p>
                  <p><span className="text-sky-400 font-bold">B.</span> Hà Nội</p>
                  <p><span className="text-sky-400 font-bold">C.</span> Đà Nẵng</p>
                  <p><span className="text-emerald-400 font-bold">Đáp án:</span> B</p>
                  <p><span className="text-purple-400 font-bold">Giải thích:</span> Hà Nội là thủ đô của Việt Nam từ năm 1976.</p>
                </div>

                <div className="space-y-0.5 text-slate-300 pt-1.5 border-t border-slate-800/60">
                  <p><span className="text-amber-400 font-bold">Câu 2:</span> Đỉnh núi nào cao nhất Việt Nam?</p>
                  <p><span className="text-sky-400 font-bold">A.</span> Fansipan</p>
                  <p><span className="text-sky-400 font-bold">B.</span> Bạch Mộc Lương Tử</p>
                  <p><span className="text-sky-400 font-bold">C.</span> Pu Si Lung</p>
                  <p><span className="text-emerald-400 font-bold">Đáp án:</span> A</p>
                  <p><span className="text-purple-400 font-bold">Giải thích:</span> Fansipan cao 3.143m, được mệnh danh là nóc nhà Đông Dương.</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-0.5">
                <span className="text-[11px] text-slate-400 font-medium">Điền mẫu nhanh vào ô dưới:</span>
                <button
                  type="button"
                  onClick={() => handleImportTextChange(sampleViFormat)}
                  className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-[11px] font-bold transition flex items-center gap-1"
                >
                  <Sparkles size={12} />
                  <span>Điền Mẫu Chuẩn (Tiêu đề + 2 Câu)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleImportTextChange(sampleEnFormat)}
                  className="px-2 py-1 rounded-md bg-sky-500/10 border border-sky-500/30 text-sky-300 hover:bg-sky-500/20 text-[11px] font-bold transition"
                >
                  Mẫu EN
                </button>
              </div>
            </div>

            {/* Input Textarea */}
            <Textarea
              rows={8}
              value={importText}
              onChange={(e) => handleImportTextChange(e.target.value)}
              placeholder={`Tiêu đề: Kiến thức tổng hợp vui\n\nCâu 1: Thủ đô của Việt Nam là gì?\nA. TP. Hồ Chí Minh\nB. Hà Nội\nC. Đà Nẵng\nĐáp án: B\nGiải thích: Hà Nội là thủ đô của Việt Nam từ năm 1976.\n\nCâu 2: Đỉnh núi nào cao nhất Việt Nam?\nA. Fansipan\nB. Bạch Mộc Lương Tử\nC. Pu Si Lung\nĐáp án: A\nGiải thích: Fansipan cao 3.143m, được mệnh danh là nóc nhà Đông Dương.`}
              className="font-mono text-xs bg-slate-950 border-slate-800 text-slate-100 focus:border-amber-500"
            />

            {/* Parser Feedback */}
            {parseFeedback && (
              <div
                className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                  parseFeedback.success
                    ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-800/80 text-rose-300'
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {parseFeedback.success ? (
                    <CheckCircle2 size={15} className="text-emerald-400" />
                  ) : (
                    <AlertCircle size={15} className="text-rose-400" />
                  )}
                  <span>
                    {parseFeedback.success
                      ? `Nhận diện thành công ${parseFeedback.totalParsed} câu hỏi!`
                      : 'Không thể phân tích dữ liệu'}
                  </span>
                </div>

                {parseFeedback.title && (
                  <div className="text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                    <span>📌 Tiêu đề:</span>
                    <span className="text-white">"{parseFeedback.title}"</span>
                  </div>
                )}

                {parseFeedback.errors.length > 0 && (
                  <div className="text-[11px] text-rose-400 space-y-0.5">
                    {parseFeedback.errors.map((err, i) => (
                      <p key={i}>• {err}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Mode selection */}
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-300 pt-1">
              <span>Chế độ:</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  value="replace"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="accent-amber-500"
                />
                <span>Thay thế ({quiz.questions.length} câu cũ)</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  value="append"
                  checked={importMode === 'append'}
                  onChange={() => setImportMode('append')}
                  className="accent-amber-500"
                />
                <span>Nối tiếp vào sau</span>
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowImportDialog(false)}
              className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
            >
              Hủy
            </Button>
            <Button
              onClick={handleApplyImport}
              disabled={!parseFeedback?.success}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold gap-1.5"
            >
              <CheckCircle2 size={14} />
              <span>Áp dụng ({parseFeedback?.totalParsed || 0} câu)</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
