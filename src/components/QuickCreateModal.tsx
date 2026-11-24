import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import {
  ProjectCategory,
  StudioNote,
  Task,
  TaskPriority,
  TimeBlock,
} from '../types';

interface QuickCreateModalProps {
  isOpen: boolean;
  todayIso: string;
  onClose: () => void;
  onCreateTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onCreateNote: (note: Omit<StudioNote, 'id' | 'updatedAt'>) => void;
}

const CATEGORIES: ProjectCategory[] = [
  'Editorial',
  'Architecture',
  'Research',
  'Studio Admin',
  'Reading',
];

export const QuickCreateModal: React.FC<QuickCreateModalProps> = ({
  isOpen,
  todayIso,
  onClose,
  onCreateTask,
  onCreateNote,
}) => {
  const [mode, setMode] = useState<'task' | 'note'>('task');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('Editorial');
  const [priority, setPriority] = useState<TaskPriority>('normal');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [scheduledDate, setScheduledDate] = useState<string>(todayIso);
  const [timeBlock, setTimeBlock] = useState<TimeBlock>('Morning');
  const [body, setBody] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    if (mode === 'task') {
      onCreateTask({
        title: trimmedTitle,
        completed: false,
        priority,
        category,
        durationMinutes,
        scheduledDate,
        timeBlock: scheduledDate ? timeBlock : 'Unscheduled',
        notes: body.trim(),
        subtasks: [],
      });
    } else {
      onCreateNote({
        title: trimmedTitle,
        category,
        content: body.trim(),
        pinned: false,
      });
    }

    setTitle('');
    setBody('');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-create-heading"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#20211F]/40 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[560px] bg-[#F4F1EA] border border-[#20211F] rounded-[4px] p-6 md:p-8">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#D8D3C8]">
          <h2
            id="quick-create-heading"
            className="font-editorial text-[26px] font-normal text-[#20211F]"
          >
            New Studio Entry
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-9 h-9 inline-flex items-center justify-center border border-[#D8D3C8] rounded-[4px] text-[#20211F] hover:bg-[#E8E4DA]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="mt-5 flex items-center gap-1 p-1 bg-[#E8E4DA] rounded-[4px] w-fit">
          <button
            type="button"
            onClick={() => setMode('task')}
            className={`px-3.5 py-1.5 text-[13px] font-medium rounded-[3px] transition-colors ${
              mode === 'task'
                ? 'bg-[#F4F1EA] text-[#20211F]'
                : 'text-[#55433B] hover:text-[#20211F]'
            }`}
          >
            Commitment / Task
          </button>
          <button
            type="button"
            onClick={() => setMode('note')}
            className={`px-3.5 py-1.5 text-[13px] font-medium rounded-[3px] transition-colors ${
              mode === 'note'
                ? 'bg-[#F4F1EA] text-[#20211F]'
                : 'text-[#55433B] hover:text-[#20211F]'
            }`}
          >
            Notebook Page
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="modal-entry-title"
              className="block text-[12px] font-medium text-[#55433B] mb-1.5"
            >
              {mode === 'task' ? 'Task Title' : 'Page Title'}
            </label>
            <input
              id="modal-entry-title"
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                mode === 'task'
                  ? 'e.g., Draft courtyard material palette brief'
                  : 'e.g., Notes on acoustic plaster finishes'
              }
              className="w-full bg-[#FCF9F2] border border-[#D8D3C8] focus:border-[#994618] rounded-[4px] px-3 py-2.5 text-[15px] text-[#20211F]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="modal-category"
                className="block text-[12px] font-medium text-[#55433B] mb-1.5"
              >
                Area
              </label>
              <select
                id="modal-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                className="w-full bg-[#FCF9F2] border border-[#D8D3C8] focus:border-[#20211F] rounded-[4px] px-3 py-2 text-[13px] text-[#20211F]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {mode === 'task' && (
              <div>
                <label
                  htmlFor="modal-duration"
                  className="block text-[12px] font-medium text-[#55433B] mb-1.5"
                >
                  Duration
                </label>
                <select
                  id="modal-duration"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full bg-[#FCF9F2] border border-[#D8D3C8] focus:border-[#20211F] rounded-[4px] px-3 py-2 text-[13px] text-[#20211F] tabular-nums"
                >
                  {[25, 30, 45, 60, 90, 120].map((m) => (
                    <option key={m} value={m}>
                      {m} minutes
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {mode === 'task' && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label
                  htmlFor="modal-date"
                  className="block text-[12px] font-medium text-[#55433B] mb-1.5"
                >
                  Date
                </label>
                <input
                  id="modal-date"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full bg-[#FCF9F2] border border-[#D8D3C8] focus:border-[#20211F] rounded-[4px] px-2.5 py-2 text-[13px] text-[#20211F]"
                />
              </div>

              <div>
                <label
                  htmlFor="modal-block"
                  className="block text-[12px] font-medium text-[#55433B] mb-1.5"
                >
                  Block
                </label>
                <select
                  id="modal-block"
                  value={timeBlock}
                  onChange={(e) => setTimeBlock(e.target.value as TimeBlock)}
                  className="w-full bg-[#FCF9F2] border border-[#D8D3C8] focus:border-[#20211F] rounded-[4px] px-2.5 py-2 text-[13px] text-[#20211F]"
                >
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                  <option value="Unscheduled">Backlog</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="modal-priority"
                  className="block text-[12px] font-medium text-[#55433B] mb-1.5"
                >
                  Priority
                </label>
                <select
                  id="modal-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full bg-[#FCF9F2] border border-[#D8D3C8] focus:border-[#20211F] rounded-[4px] px-2.5 py-2 text-[13px] text-[#20211F]"
                >
                  <option value="high">High</option>
                  <option value="normal">Normal</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="modal-body"
              className="block text-[12px] font-medium text-[#55433B] mb-1.5"
            >
              {mode === 'task' ? 'Context & Notes' : 'Prose'}
            </label>
            <textarea
              id="modal-body"
              rows={mode === 'note' ? 6 : 3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={
                mode === 'task'
                  ? 'Optional specifications or reading links...'
                  : 'Begin writing...'
              }
              className="w-full bg-[#FCF9F2] border border-[#D8D3C8] focus:border-[#994618] rounded-[4px] p-3 text-[14px] leading-[22px] text-[#20211F]"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#D8D3C8]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 min-h-[40px] border border-[#D8D3C8] rounded-[4px] text-[13px] font-medium text-[#20211F] hover:bg-[#E8E4DA]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 min-h-[40px] bg-[#994618] hover:bg-[#7A3000] text-[#F4F1EA] rounded-[4px] text-[13px] font-medium"
            >
              {mode === 'task' ? 'Save Task' : 'Create Page'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
