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
  HelpCircle
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

interface QuizEditorTabProps {
  quiz: Quiz;
  onChange: (updated: Quiz) => void;
  onSelectQuestion?: (index: number) => void;
}

// Sortable Item Component with dnd-kit
interface SortableQuestionCardProps {
  q: QuizQuestion;
  idx: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (updated: Partial<QuizQuestion>) => void;
  onDelete: (e: React.MouseEvent) => void;
  onDuplicate: (e: React.MouseEvent) => void;
  onUploadImage: (slot: number, file: File) => void;
  onRemoveImage: (slot: number, e: React.MouseEvent) => void;
}

const SortableQuestionCard: React.FC<SortableQuestionCardProps> = ({
  q,
  idx,
  isExpanded,
  onToggleExpand,
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
    opacity: isDragging ? 0.7 : 1
  };

  const hasImage = Boolean(q.illustrations && q.illustrations.length > 0 && q.illustrations[0]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-2xl border transition-all bg-white shadow-xs ${
        isDragging
          ? 'ring-2 ring-amber-500 shadow-xl border-amber-400'
          : isExpanded
          ? 'border-amber-400 ring-2 ring-amber-100/80 shadow-sm'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Collapsed / Summary Row */}
      <div
        onClick={onToggleExpand}
        className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none bg-white hover:bg-slate-50/70 transition rounded-2xl"
      >
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-grab active:cursor-grabbing shrink-0 touch-none"
          title="Kéo để sắp xếp thứ tự"
        >
          <GripVertical size={16} />
        </div>

        {/* Question Index Badge */}
        <span className="w-7 h-7 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center font-black text-xs shrink-0">
          #{idx + 1}
        </span>

        {/* Thumbnail Preview */}
        <div className="shrink-0 w-11 h-11 rounded-xl border border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center relative shadow-xs">
          {hasImage ? (
            <img
              src={q.illustrations[0]}
              alt={`Q${idx + 1}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon size={18} className="text-slate-400" />
          )}
        </div>

        {/* Question text snippet */}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-slate-800 truncate">
            {q.question || 'Câu hỏi chưa có nội dung...'}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="success" className="text-[10px] py-0 px-2 font-bold gap-1">
              <CheckCircle2 size={10} />
              ĐA: {q.correctAnswer}
            </Badge>
            {hasImage ? (
              <span className="text-[11px] text-slate-500 font-medium">
                {q.illustrations.length} ảnh minh họa
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 italic">Không ảnh</span>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          {/* Quick Add / Change Image */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="h-8 px-2.5 text-xs text-slate-600 gap-1"
            title="Thêm hoặc đổi ảnh minh họa"
          >
            <ImageIcon size={13} className="text-amber-500" />
            <span className="hidden sm:inline">{hasImage ? 'Đổi ảnh' : 'Add Image'}</span>
          </Button>

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

          <Button
            size="iconSm"
            variant="ghost"
            onClick={onDuplicate}
            className="text-slate-400 hover:text-slate-800"
            title="Nhân bản câu này"
          >
            <Copy size={13} />
          </Button>

          <Button
            size="iconSm"
            variant="ghost"
            onClick={onDelete}
            className="text-slate-400 hover:text-rose-600"
            title="Xóa câu này"
          >
            <Trash2 size={13} />
          </Button>

          <Button
            size="iconSm"
            variant="ghost"
            onClick={onToggleExpand}
            className="text-slate-400 hover:text-slate-800"
          >
            {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </Button>
        </div>
      </div>

      {/* Expanded Edit Form with Motion */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-slate-100 bg-slate-50/50 p-4 space-y-4 rounded-b-2xl"
          >
            {/* 1. Question Text */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 block">
                Nội dung câu hỏi:
              </label>
              <Textarea
                rows={2}
                value={q.question}
                onChange={(e) => onUpdate({ question: e.target.value })}
                placeholder="Nhập câu hỏi đố vui..."
                className="bg-white text-xs font-semibold"
              />
            </div>

            {/* 2. Single Illustration (Strictly 1 Image) */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-amber-500" />
                  <span>Ảnh minh họa (Tùy chọn - Tối đa 1 ảnh):</span>
                </span>
                <span className="text-[10px] text-slate-400 italic">
                  Tự động lấp đầy khung khi không có ảnh
                </span>
              </div>

              {q.illustrations?.[0] ? (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 shrink-0 shadow-xs">
                    <img
                      src={q.illustrations[0]}
                      alt="Illustration"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <span className="text-xs text-slate-700 font-semibold truncate block">
                      Ảnh minh họa câu #{idx + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-7 text-[11px] gap-1 bg-white hover:bg-slate-100"
                      >
                        <Upload size={11} />
                        <span>Đổi ảnh</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => onRemoveImage(0, e)}
                        className="h-7 text-[11px] gap-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      >
                        <Trash2 size={11} />
                        <span>Gỡ ảnh</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-slate-50 border border-dashed border-slate-200 hover:border-amber-400 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition"
                >
                  <Upload size={18} className="text-amber-500" />
                  <span className="text-xs text-slate-700 font-semibold">Tải lên 1 ảnh minh họa</span>
                  <span className="text-[10px] text-slate-400">Nếu để trống, câu hỏi sẽ hiển thị không ảnh</span>
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

            {/* 3. Exactly 3 Options A, B, C */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                3 Phương án lựa chọn & Chọn đáp án đúng:
              </label>
              {(['A', 'B', 'C'] as const).map((optKey) => {
                const isCorrect = q.correctAnswer === optKey;
                return (
                  <div
                    key={optKey}
                    className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all ${
                      isCorrect
                        ? 'bg-emerald-50 border-emerald-300 shadow-xs'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    {/* Radio button for correct answer */}
                    <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                      <input
                        type="radio"
                        name={`correct-${q.id}`}
                        checked={isCorrect}
                        onChange={() => onUpdate({ correctAnswer: optKey })}
                        className="w-4 h-4 accent-emerald-600 cursor-pointer"
                      />
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${
                          isCorrect
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {optKey}
                      </span>
                    </label>

                    {/* Option Text */}
                    <Input
                      type="text"
                      value={q.options[optKey]}
                      onChange={(e) =>
                        onUpdate({
                          options: {
                            ...q.options,
                            [optKey]: e.target.value
                          }
                        })
                      }
                      className="h-8 text-xs border-0 bg-transparent focus-visible:ring-0 shadow-none font-semibold"
                      placeholder={`Nội dung phương án ${optKey}...`}
                    />
                  </div>
                );
              })}
            </div>

            {/* 4. Explanation */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 block">
                Giải thích đáp án đúng (TTS & Phụ đề):
              </label>
              <Textarea
                rows={2}
                value={q.explanation}
                onChange={(e) => onUpdate({ explanation: e.target.value })}
                placeholder="Giải thích vì sao phương án này là chính xác..."
                className="bg-white text-xs"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const QuizEditorTab: React.FC<QuizEditorTabProps> = ({ quiz, onChange, onSelectQuestion }) => {
  const [expandedId, setExpandedId] = useState<string | null>(quiz.questions[0]?.id || null);
  const [showImportDialog, setShowImportDialog] = useState<boolean>(false);
  const [importText, setImportText] = useState<string>('');
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const [copySuccess, setCopySuccess] = useState(false);
  const [parseFeedback, setParseFeedback] = useState<ReturnType<typeof parseQuizText> | null>(null);

  // Setup dnd-kit sensors with pointer and touch support
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5
      }
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = quiz.questions.findIndex((q) => q.id === active.id);
      const newIndex = quiz.questions.findIndex((q) => q.id === over.id);
      const newQuestions = arrayMove(quiz.questions, oldIndex, newIndex);
      onChange({
        ...quiz,
        questions: newQuestions
      });
      onSelectQuestion?.(newIndex);
    }
  };

  const updateQuestion = (index: number, updated: Partial<QuizQuestion>) => {
    const newQuestions = [...quiz.questions];
    newQuestions[index] = {
      ...newQuestions[index],
      ...updated
    };
    onChange({
      ...quiz,
      questions: newQuestions
    });
  };

  const handleAddQuestion = () => {
    const newId = `q_${Date.now()}`;
    const newQ: QuizQuestion = {
      id: newId,
      question: 'Nhập nội dung câu hỏi mới vào đây...',
      options: {
        A: 'Phương án A',
        B: 'Phương án B',
        C: 'Phương án C'
      },
      correctAnswer: 'A',
      explanation: 'Giải thích lý do đáp án A là chính xác.',
      illustrations: []
    };
    const newQuestions = [...quiz.questions, newQ];
    onChange({
      ...quiz,
      questions: newQuestions
    });
    setExpandedId(newId);
    onSelectQuestion?.(newQuestions.length - 1);
  };

  const handleDeleteQuestion = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (quiz.questions.length <= 1) {
      alert('Bộ quiz cần có tối thiểu 1 câu hỏi.');
      return;
    }
    const targetQ = quiz.questions[index];
    const newQuestions = quiz.questions.filter((_, i) => i !== index);
    onChange({ ...quiz, questions: newQuestions });
    if (expandedId === targetQ.id) {
      setExpandedId(newQuestions[Math.max(0, index - 1)].id);
    }
  };

  const handleDuplicateQuestion = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = quiz.questions[index];
    const newId = `q_${Date.now()}_dup`;
    const dup: QuizQuestion = {
      ...target,
      id: newId,
      question: `${target.question} (Bản sao)`
    };
    const newQuestions = [...quiz.questions];
    newQuestions.splice(index + 1, 0, dup);
    onChange({ ...quiz, questions: newQuestions });
    setExpandedId(newId);
  };

  const handleUploadIllustration = async (qIndex: number, _slot: number, file: File) => {
    try {
      const res = await uploadImage(file);
      // Strictly single illustration per question
      updateQuestion(qIndex, { illustrations: [res.optimizedUrl || res.originalUrl] });
    } catch (err: any) {
      alert(`Lỗi upload ảnh: ${err.message}`);
    }
  };

  const handleRemoveIllustration = (qIndex: number, _slot: number, e: React.MouseEvent) => {
    e.stopPropagation();
    // Strictly clear illustration
    updateQuestion(qIndex, { illustrations: [] });
  };

  const handleImportTextChange = (text: string) => {
    setImportText(text);
    if (text.trim()) {
      const res = parseQuizText(text);
      setParseFeedback(res);
    } else {
      setParseFeedback(null);
    }
  };

  const handleApplyImport = () => {
    if (!parseFeedback || parseFeedback.questions.length === 0) return;

    let updatedList: QuizQuestion[];
    if (importMode === 'replace') {
      updatedList = parseFeedback.questions;
    } else {
      updatedList = [...quiz.questions, ...parseFeedback.questions];
    }

    onChange({
      ...quiz,
      title: parseFeedback.title || quiz.title,
      questions: updatedList
    });
    setExpandedId(updatedList[0].id);
    setShowImportDialog(false);
    setImportText('');
    setParseFeedback(null);
  };

  const sampleViFormat = `Tiêu đề: Kiến thức tổng hợp vui

Câu 1: Thủ đô của Việt Nam là gì?
A. TP. Hồ Chí Minh
B. Hà Nội
C. Đà Nẵng
Đáp án: B
Giải thích: Hà Nội là thủ đô của Việt Nam từ năm 1976.

Câu 2: Đỉnh núi nào cao nhất Việt Nam?
A. Fansipan
B. Bạch Mộc Lương Tử
C. Pu Si Lung
Đáp án: A
Giải thích: Fansipan cao 3.143m, được mệnh danh là nóc nhà Đông Dương.`;

  const sampleEnFormat = `Title: General Knowledge Quiz

Question 1: What is the capital of France?
A. London
B. Berlin
C. Paris
Answer: C
Explanation: Paris has been the capital of France since the Middle Ages.

Question 2: Which planet is closest to the Sun?
A. Venus
B. Mercury
C. Mars
Answer: B
Explanation: Mercury orbits closest to the Sun at about 58 million km.`;

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(sampleViFormat);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Quiz Top Action Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
        {/* Title Input Field (Editable directly by hand) */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
              Tiêu đề Video / Quiz:
            </label>
            <span className="text-[10px] text-slate-400 font-medium">Sửa trực tiếp bằng tay</span>
          </div>
          <input
            type="text"
            value={quiz.title || ''}
            onChange={(e) => onChange({ ...quiz, title: e.target.value })}
            placeholder="Nhập tiêu đề video (ví dụ: Kiến thức tổng hợp vui)..."
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 placeholder-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition shadow-xs"
          />
        </div>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <HelpCircle size={17} />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Danh Sách Câu Hỏi (Quiz List)
              </h3>
              <p className="text-[11px] text-slate-500">
                Hỗ trợ kéo thả reorder • Chuẩn 3 đáp án (A, B, C)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowImportDialog(true)}
              className="gap-1.5 text-xs text-sky-700 hover:bg-sky-50 border-sky-200"
            >
              <FileText size={13} />
              <span>Dán / Import</span>
            </Button>

            <Button
              size="sm"
              onClick={handleAddQuestion}
              className="gap-1.5 text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
            >
              <Plus size={13} />
              <span>Thêm câu</span>
            </Button>
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-500 mb-1 block">Tên bộ Quiz:</label>
          <Input
            value={quiz.title}
            onChange={(e) => onChange({ ...quiz, title: e.target.value })}
            placeholder="Tên bộ câu hỏi..."
            className="h-8 text-xs font-semibold"
          />
        </div>
      </div>

      {/* Sortable Question List with dnd-kit */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Tổng cộng: {quiz.questions.length} câu hỏi
          </span>
          <span className="text-[10px] text-slate-400">
            Kéo icon ⠿ để sắp xếp thứ tự
          </span>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={quiz.questions.map((q) => q.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2.5">
              {quiz.questions.map((q, idx) => (
                <SortableQuestionCard
                  key={q.id}
                  q={q}
                  idx={idx}
                  isExpanded={expandedId === q.id}
                  onToggleExpand={() => {
                    setExpandedId(expandedId === q.id ? null : q.id);
                    onSelectQuestion?.(idx);
                  }}
                  onUpdate={(updated) => updateQuestion(idx, updated)}
                  onDelete={(e) => handleDeleteQuestion(idx, e)}
                  onDuplicate={(e) => handleDuplicateQuestion(idx, e)}
                  onUploadImage={(slot, file) => handleUploadIllustration(idx, slot, file)}
                  onRemoveImage={(slot, e) => handleRemoveIllustration(idx, slot, e)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Bulk Import Modal Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                <FileText size={18} />
              </div>
              <div>
                <DialogTitle>Dán / Nhập Nhanh Bộ Câu Hỏi (Bulk Import)</DialogTitle>
                <DialogDescription>
                  Tự động phân tích câu hỏi, 3 đáp án (A, B, C) và lời giải thích
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {/* Standard Format Instructions Card */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2 text-slate-700">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-500" />
                  Định dạng chuẩn Parser nhận diện:
                </span>
                <Button
                  size="sm"
                  type="button"
                  variant="default"
                  onClick={handleCopyTemplate}
                  className="h-7 text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold gap-1.5 shadow-xs"
                >
                  {copySuccess ? <CheckCircle2 size={13} className="text-emerald-950" /> : <Copy size={13} />}
                  <span>{copySuccess ? 'Đã sao chép vào clipboard!' : 'Copy Template'}</span>
                </Button>
              </div>

              {/* Exact visual template requested by user */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800 leading-relaxed space-y-2">
                <div className="font-bold text-amber-700">
                  Tiêu đề: <span className="text-slate-900 font-semibold">Kiến thức tổng hợp vui</span>
                </div>

                <div className="space-y-0.5 text-slate-700">
                  <p><span className="text-amber-600 font-bold">Câu 1:</span> Thủ đô của Việt Nam là gì?</p>
                  <p><span className="text-sky-600 font-bold">A.</span> TP. Hồ Chí Minh</p>
                  <p><span className="text-sky-600 font-bold">B.</span> Hà Nội</p>
                  <p><span className="text-sky-600 font-bold">C.</span> Đà Nẵng</p>
                  <p><span className="text-emerald-600 font-bold">Đáp án:</span> B</p>
                  <p><span className="text-purple-600 font-bold">Giải thích:</span> Hà Nội là thủ đô của Việt Nam từ năm 1976.</p>
                </div>

                <div className="space-y-0.5 text-slate-700 pt-1.5 border-t border-slate-200">
                  <p><span className="text-amber-600 font-bold">Câu 2:</span> Đỉnh núi nào cao nhất Việt Nam?</p>
                  <p><span className="text-sky-600 font-bold">A.</span> Fansipan</p>
                  <p><span className="text-sky-600 font-bold">B.</span> Bạch Mộc Lương Tử</p>
                  <p><span className="text-sky-600 font-bold">C.</span> Pu Si Lung</p>
                  <p><span className="text-emerald-600 font-bold">Đáp án:</span> A</p>
                  <p><span className="text-purple-600 font-bold">Giải thích:</span> Fansipan cao 3.143m, được mệnh danh là nóc nhà Đông Dương.</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-0.5">
                <span className="text-[11px] text-slate-500 font-semibold">Điền mẫu nhanh vào ô dưới:</span>
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() => handleImportTextChange(sampleViFormat)}
                  className="h-6 text-[11px] px-2 bg-amber-50/80 text-amber-800 border-amber-200 hover:bg-amber-100"
                >
                  🇻🇳 Điền Mẫu Chuẩn
                </Button>
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() => handleImportTextChange(sampleEnFormat)}
                  className="h-6 text-[11px] px-2 bg-sky-50/80 text-sky-800 border-sky-200 hover:bg-sky-100"
                >
                  🇺🇸 Mẫu Tiếng Anh
                </Button>
              </div>
            </div>

            <Textarea
              rows={8}
              value={importText}
              onChange={(e) => handleImportTextChange(e.target.value)}
              placeholder={`Tiêu đề: Kiến thức tổng hợp vui\n\nCâu 1: Thủ đô của Việt Nam là gì?\nA. TP. Hồ Chí Minh\nB. Hà Nội\nC. Đà Nẵng\nĐáp án: B\nGiải thích: Hà Nội là thủ đô của Việt Nam từ năm 1976.\n\nCâu 2: Đỉnh núi nào cao nhất Việt Nam?\nA. Fansipan\nB. Bạch Mộc Lương Tử\nC. Pu Si Lung\nĐáp án: A\nGiải thích: Fansipan cao 3.143m...`}
              className="font-mono text-xs"
            />

            {/* Live Feedback */}
            {parseFeedback && (
              <div
                className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                  parseFeedback.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {parseFeedback.success ? (
                    <CheckCircle2 size={15} className="text-emerald-600" />
                  ) : (
                    <AlertCircle size={15} className="text-rose-600" />
                  )}
                  <span>
                    {parseFeedback.success
                      ? `Nhận diện thành công ${parseFeedback.totalParsed} câu hỏi!`
                      : 'Không thể phân tích dữ liệu'}
                  </span>
                </div>

                {parseFeedback.title && (
                  <div className="text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                    <span>📌 Tiêu đề:</span>
                    <span className="text-amber-950 font-black">"{parseFeedback.title}"</span>
                  </div>
                )}

                {parseFeedback.errors.length > 0 && (
                  <div className="text-[11px] text-rose-700 space-y-0.5">
                    {parseFeedback.errors.map((err, i) => (
                      <p key={i}>• {err}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Mode selection */}
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 pt-1">
              <span>Chế độ:</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  value="replace"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="accent-amber-600"
                />
                <span>Thay thế toàn bộ ({quiz.questions.length} câu cũ)</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  value="append"
                  checked={importMode === 'append'}
                  onChange={() => setImportMode('append')}
                  className="accent-amber-600"
                />
                <span>Nối tiếp vào sau</span>
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Hủy bỏ
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
