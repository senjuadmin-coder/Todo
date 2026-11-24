import React, { useMemo, useState } from 'react';
import {
  Check,
  Clock,
  Play,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import {
  ProjectCategory,
  Task,
  TaskPriority,
  TimeBlock,
} from '../types';
import {
  formatEditorialDate,
  formatMinutesReadable,
  formatShortDate,
  getISOWeekNumber,
} from '../utils/dates';

interface TodayViewProps {
  todayIso: string;
  dailyIntention: string;
  onUpdateDailyIntention: (value: string) => void;
  tasks: Task[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  onToggleTask: (taskId: string) => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onUpdateTask: (taskId: string, patch: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onLaunchFocus: (taskId: string) => void;
}

type FilterTab = 'all' | 'active' | 'completed' | 'high';

const CATEGORIES: ProjectCategory[] = [
  'Editorial',
  'Architecture',
  'Research',
  'Studio Admin',
  'Reading',
];

const TIME_BLOCKS: TimeBlock[] = ['Morning', 'Afternoon', 'Evening', 'Unscheduled'];

export const TodayView: React.FC<TodayViewProps> = ({
  todayIso,
  dailyIntention,
  onUpdateDailyIntention,
  tasks,
  selectedTaskId,
  onSelectTask,
  onToggleTask,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onLaunchFocus,
}) => {
  const [filter, setFilter] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditingIntention, setIsEditingIntention] = useState(false);
  const [intentionDraft, setIntentionDraft] = useState(dailyIntention);

  // Quick capture state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ProjectCategory>('Editorial');
  const [newDuration, setNewDuration] = useState<number>(45);
  const [newBlock, setNewBlock] = useState<TimeBlock>('Morning');
  const [newPriority, setNewPriority] = useState<TaskPriority>('normal');

  // Subtask capture
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const todayTasks = useMemo(
    () => tasks.filter((t) => t.scheduledDate === todayIso),
    [tasks, todayIso]
  );

  const filteredTasks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return todayTasks
      .filter((t) => {
        if (filter === 'active') return !t.completed;
        if (filter === 'completed') return t.completed;
        if (filter === 'high') return t.priority === 'high' && !t.completed;
        return true;
      })
      .filter((t) => {
        if (!q) return true;
        return (
          t.title.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.notes.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        const prioRank = { high: 0, normal: 1, low: 2 };
        return prioRank[a.priority] - prioRank[b.priority];
      });
  }, [todayTasks, filter, searchQuery]);

  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId) ?? todayTasks[0] ?? null,
    [tasks, selectedTaskId, todayTasks]
  );

  const stats = useMemo(() => {
    const totalPlanned = todayTasks.reduce((acc, t) => acc + t.durationMinutes, 0);
    const completedMins = todayTasks
      .filter((t) => t.completed)
      .reduce((acc, t) => acc + t.durationMinutes, 0);
    const remainingCount = todayTasks.filter((t) => !t.completed).length;
    const completedCount = todayTasks.filter((t) => t.completed).length;

    const byBlock = (['Morning', 'Afternoon', 'Evening'] as TimeBlock[]).map((block) => {
      const items = todayTasks.filter((t) => t.timeBlock === block);
      const mins = items.reduce((acc, t) => acc + t.durationMinutes, 0);
      const done = items.filter((t) => t.completed).reduce((acc, t) => acc + t.durationMinutes, 0);
      return { block, count: items.length, mins, done };
    });

    return { totalPlanned, completedMins, remainingCount, completedCount, byBlock };
  }, [todayTasks]);

  const weekNum = useMemo(() => {
    const [y, m, d] = todayIso.split('-').map(Number);
    return getISOWeekNumber(new Date(y, m - 1, d));
  }, [todayIso]);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTitle.trim();
    if (!trimmed) return;

    onAddTask({
      title: trimmed,
      completed: false,
      priority: newPriority,
      category: newCategory,
      durationMinutes: newDuration,
      scheduledDate: todayIso,
      timeBlock: newBlock,
      notes: '',
      subtasks: [],
    });

    setNewTitle('');
    setNewPriority('normal');
  };

  const handleSaveIntention = () => {
    const trimmed = intentionDraft.trim();
    onUpdateDailyIntention(trimmed || dailyIntention);
    setIsEditingIntention(false);
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    const trimmed = newSubtaskTitle.trim();
    if (!trimmed) return;
    onUpdateTask(selectedTask.id, {
      subtasks: [
        ...selectedTask.subtasks,
        { id: `sub-${Date.now()}`, title: trimmed, completed: false },
      ],
    });
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (subId: string) => {
    if (!selectedTask) return;
    onUpdateTask(selectedTask.id, {
      subtasks: selectedTask.subtasks.map((s) =>
        s.id === subId ? { ...s, completed: !s.completed } : s
      ),
    });
  };

  const handleDeleteSubtask = (subId: string) => {
    if (!selectedTask) return;
    onUpdateTask(selectedTask.id, {
      subtasks: selectedTask.subtasks.filter((s) => s.id !== subId),
    });
  };

  const completionRatio =
    stats.totalPlanned > 0 ? Math.round((stats.completedMins / stats.totalPlanned) * 100) : 0;

  return (
    <main className="max-w-[1360px] mx-auto px-4 md:px-8 py-8 md:py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-10 lg:gap-x-0">
        {/* Primary 8-Column Workspace */}
        <section
          aria-label="Daily agenda"
          className="lg:col-span-8 lg:pr-8 lg:border-r lg:border-[#D8D3C8]"
        >
          {/* Editorial Date Header */}
          <header className="pb-6 border-b border-[#D8D3C8]">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <h1 className="font-editorial text-[36px] md:text-[52px] leading-[1.12] tracking-[-0.02em] font-normal text-[#20211F]">
                {formatEditorialDate(todayIso)}
              </h1>
              <span className="text-[13px] text-[#55433B] tabular-nums">
                Week {weekNum} · {formatShortDate(todayIso)}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[#55433B] tabular-nums">
              <span>{stats.remainingCount} remaining</span>
              <span aria-hidden="true">·</span>
              <span>{stats.completedCount} completed</span>
              <span aria-hidden="true">·</span>
              <span>{formatMinutesReadable(stats.totalPlanned)} scheduled</span>
            </div>

            {/* Daily Studio Intention (tonal secondary surface) */}
            <div className="mt-6 bg-[#E8E4DA] border border-[#D8D3C8] rounded-[4px] p-4">
              <div className="flex items-center justify-between gap-4 mb-1.5">
                <span className="text-[12px] font-medium tracking-[0.03em] text-[#55433B]">
                  Daily Intention
                </span>
                {!isEditingIntention ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIntentionDraft(dailyIntention);
                      setIsEditingIntention(true);
                    }}
                    className="text-[12px] font-medium text-[#994618] hover:underline whitespace-nowrap"
                  >
                    Edit Intention
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsEditingIntention(false)}
                      className="text-[12px] text-[#55433B] hover:text-[#20211F]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveIntention}
                      className="text-[12px] font-medium text-[#994618] hover:underline"
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>

              {isEditingIntention ? (
                <input
                  type="text"
                  value={intentionDraft}
                  onChange={(e) => setIntentionDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveIntention();
                    if (e.key === 'Escape') setIsEditingIntention(false);
                  }}
                  autoFocus
                  className="w-full bg-[#F4F1EA] border border-[#D8D3C8] focus:border-[#994618] rounded-[4px] px-3 py-2 text-[15px] text-[#20211F]"
                />
              ) : (
                <p className="font-editorial italic text-[18px] leading-[26px] text-[#20211F]">
                  “{dailyIntention}”
                </p>
              )}
            </div>
          </header>

          {/* Architectural Quick Capture Form */}
          <form onSubmit={handleQuickAdd} className="py-6 border-b border-[#D8D3C8]">
            <div className="flex flex-col gap-3">
              <label htmlFor="quick-task-input" className="sr-only">
                Add a task to today
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <input
                  id="quick-task-input"
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Capture a focus commitment for today..."
                  className="flex-1 bg-transparent border-b border-[#D8D3C8] focus:border-[#994618] py-2.5 text-[15px] text-[#20211F] placeholder:text-[#786A62] rounded-none"
                />
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 min-h-[40px] bg-[#994618] disabled:bg-[#D8D3C8] disabled:text-[#55433B] hover:bg-[#7A3000] text-[#F4F1EA] text-[13px] font-medium rounded-[4px] whitespace-nowrap shrink-0 transition-colors duration-150"
                >
                  <Plus className="w-4 h-4" strokeWidth={1.75} />
                  <span>Add Task</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <select
                  aria-label="Project category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as ProjectCategory)}
                  className="bg-[#F4F1EA] border border-[#D8D3C8] focus:border-[#20211F] rounded-[4px] px-2.5 py-1.5 text-[12px] text-[#20211F]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                <select
                  aria-label="Time block"
                  value={newBlock}
                  onChange={(e) => setNewBlock(e.target.value as TimeBlock)}
                  className="bg-[#F4F1EA] border border-[#D8D3C8] focus:border-[#20211F] rounded-[4px] px-2.5 py-1.5 text-[12px] text-[#20211F]"
                >
                  {TIME_BLOCKS.filter((b) => b !== 'Unscheduled').map((block) => (
                    <option key={block} value={block}>
                      {block} Block
                    </option>
                  ))}
                </select>

                <select
                  aria-label="Estimated duration"
                  value={newDuration}
                  onChange={(e) => setNewDuration(Number(e.target.value))}
                  className="bg-[#F4F1EA] border border-[#D8D3C8] focus:border-[#20211F] rounded-[4px] px-2.5 py-1.5 text-[12px] text-[#20211F] tabular-nums"
                >
                  <option value={25}>25 min</option>
                  <option value={30}>30 min</option>
                  <option value={45}>45 min</option>
                  <option value={60}>60 min</option>
                  <option value={90}>90 min</option>
                </select>

                <button
                  type="button"
                  onClick={() =>
                    setNewPriority((prev) => (prev === 'high' ? 'normal' : 'high'))
                  }
                  aria-pressed={newPriority === 'high'}
                  className={`px-2.5 py-1.5 text-[12px] font-medium rounded-[4px] border transition-colors duration-150 ${
                    newPriority === 'high'
                      ? 'bg-[#FFDBCC] border-[#D97745] text-[#4D1B00]'
                      : 'bg-transparent border-[#D8D3C8] text-[#55433B] hover:bg-[#E8E4DA]'
                  }`}
                >
                  {newPriority === 'high' ? 'High Priority' : 'Mark High Priority'}
                </button>
              </div>
            </div>
          </form>

          {/* Filter Tabs & Search */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D8D3C8]">
            <div
              role="tablist"
              aria-label="Filter daily tasks"
              className="flex flex-wrap items-center gap-1 p-1 bg-[#E8E4DA] rounded-[4px]"
            >
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'active', label: 'Active' },
                  { id: 'high', label: 'High Priority' },
                  { id: 'completed', label: 'Completed' },
                ] as { id: FilterTab; label: string }[]
              ).map((tab) => {
                const active = filter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setFilter(tab.id)}
                    className={`px-3 py-1.5 text-[12px] font-medium rounded-[3px] whitespace-nowrap transition-colors duration-150 ${
                      active
                        ? 'bg-[#F4F1EA] text-[#20211F]'
                        : 'text-[#55433B] hover:text-[#20211F]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="relative flex items-center min-w-[200px]">
              <Search className="w-4 h-4 text-[#786A62] absolute left-0 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter agenda..."
                aria-label="Filter agenda tasks"
                className="w-full pl-6 pr-2 py-1.5 bg-transparent border-b border-[#D8D3C8] focus:border-[#20211F] text-[13px] text-[#20211F] placeholder:text-[#786A62]"
              />
            </div>
          </div>

          {/* Task Rows — separated by 1px hairline dividers */}
          {filteredTasks.length === 0 ? (
            <div className="py-12 text-center border-b border-[#D8D3C8]">
              <p className="font-editorial text-[22px] text-[#20211F]">
                No tasks match this view
              </p>
              <p className="mt-1 text-[14px] text-[#55433B]">
                Adjust your filter above or capture a new commitment to begin the day.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-[#D8D3C8] border-b border-[#D8D3C8]">
              {filteredTasks.map((task) => {
                const isSelected = selectedTask?.id === task.id;
                const completedSub = task.subtasks.filter((s) => s.completed).length;

                return (
                  <li
                    key={task.id}
                    className={`group flex items-start gap-2 py-4 px-3 -mx-3 transition-colors duration-150 ${
                      isSelected ? 'bg-[#E8E4DA]' : 'hover:bg-[#EFECE4]'
                    }`}
                  >
                    {/* Crisp 16x16 square checkbox inside a 40x40 touch target */}
                    <button
                      type="button"
                      onClick={() => onToggleTask(task.id)}
                      aria-label={
                        task.completed
                          ? `Mark "${task.title}" incomplete`
                          : `Complete "${task.title}"`
                      }
                      className="w-10 h-10 -my-2 -ml-1 flex items-center justify-center shrink-0"
                    >
                      <span
                        className={`w-4 h-4 rounded-[2px] border flex items-center justify-center transition-colors duration-150 ${
                          task.completed
                            ? 'bg-[#59614C] border-[#59614C] text-[#F4F1EA]'
                            : 'bg-[#FCF9F2] border-[#887269] group-hover:border-[#20211F]'
                        }`}
                      >
                        {task.completed && <Check className="w-3 h-3" strokeWidth={2.5} />}
                      </span>
                    </button>

                    {/* Task Body */}
                    <button
                      type="button"
                      onClick={() => onSelectTask(task.id)}
                      className="flex-1 text-left min-w-0"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[15px] leading-[22px] ${
                            task.completed
                              ? 'line-through text-[#786A62]'
                              : 'text-[#20211F] font-medium'
                          }`}
                        >
                          {task.title}
                        </span>
                        {task.priority === 'high' && !task.completed && (
                          <span className="inline-block px-1.5 py-0.5 bg-[#FFDBCC] border border-[#D97745] text-[#4D1B00] text-[11px] font-medium rounded-[3px] whitespace-nowrap">
                            Priority
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] text-[#55433B] tabular-nums">
                        <span>{task.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{task.timeBlock}</span>
                        <span aria-hidden="true">·</span>
                        <span>{task.durationMinutes}m</span>
                        {task.subtasks.length > 0 && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>
                              {completedSub}/{task.subtasks.length} steps
                            </span>
                          </>
                        )}
                      </div>
                    </button>

                    {/* Row Focus Action */}
                    {!task.completed && (
                      <button
                        type="button"
                        onClick={() => onLaunchFocus(task.id)}
                        title="Open in Focus Studio"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] border border-[#D8D3C8] bg-[#F4F1EA] hover:bg-[#994618] hover:border-[#994618] hover:text-[#F4F1EA] text-[#20211F] text-[12px] font-medium rounded-[4px] whitespace-nowrap shrink-0 transition-colors duration-150"
                      >
                        <Play className="w-3 h-3" strokeWidth={2} />
                        <span>Focus</span>
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Contextual 4-Column Sidebar */}
        <aside
          aria-label="Task inspector and daily allocation"
          className="lg:col-span-4 lg:pl-8 flex flex-col gap-8"
        >
          {/* Daily Allocation Summary */}
          <div className="pb-6 border-b border-[#D8D3C8]">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="font-editorial text-[22px] font-medium text-[#20211F]">
                Daily Allocation
              </h2>
              <span className="font-mono text-[12px] tabular-nums text-[#55433B]">
                {completionRatio}% complete
              </span>
            </div>

            <div className="w-full h-[3px] bg-[#E8E4DA] mb-5 overflow-hidden">
              <div
                className="h-full bg-[#59614C] transition-all duration-200"
                style={{ width: `${completionRatio}%` }}
              />
            </div>

            <dl className="space-y-3">
              {stats.byBlock.map((row) => (
                <div
                  key={row.block}
                  className="flex items-center justify-between text-[13px] py-1.5 border-b border-[#E8E4DA] last:border-b-0"
                >
                  <dt className="text-[#55433B]">{row.block}</dt>
                  <dd className="font-mono text-[12px] tabular-nums text-[#20211F]">
                    {row.count} {row.count === 1 ? 'task' : 'tasks'} ·{' '}
                    {formatMinutesReadable(row.mins)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Active Task Inspector */}
          {selectedTask ? (
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[12px] font-medium tracking-[0.03em] text-[#55433B]">
                  Task Inspector
                </span>
                <button
                  type="button"
                  onClick={() => onDeleteTask(selectedTask.id)}
                  aria-label="Delete selected task"
                  className="inline-flex items-center gap-1 text-[12px] text-[#55433B] hover:text-[#BA1A1A] transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>

              <div>
                <label htmlFor="inspector-title" className="sr-only">
                  Task title
                </label>
                <input
                  id="inspector-title"
                  type="text"
                  value={selectedTask.title}
                  onChange={(e) =>
                    onUpdateTask(selectedTask.id, { title: e.target.value })
                  }
                  className="w-full font-editorial text-[22px] leading-[28px] text-[#20211F] bg-transparent border-b border-[#D8D3C8] focus:border-[#994618] pb-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="inspector-category"
                    className="block text-[11px] font-medium text-[#55433B] mb-1"
                  >
                    Area
                  </label>
                  <select
                    id="inspector-category"
                    value={selectedTask.category}
                    onChange={(e) =>
                      onUpdateTask(selectedTask.id, {
                        category: e.target.value as ProjectCategory,
                      })
                    }
                    className="w-full bg-[#FCF9F2] border border-[#D8D3C8] focus:border-[#20211F] rounded-[4px] px-2.5 py-2 text-[13px] text-[#20211F]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="inspector-block"
                    className="block text-[11px] font-medium text-[#55433B] mb-1"
                  >
                    Time Block
                  </label>
                  <select
                    id="inspector-block"
                    value={selectedTask.timeBlock}
                    onChange={(e) =>
                      onUpdateTask(selectedTask.id, {
                        timeBlock: e.target.value as TimeBlock,
                      })
                    }
                    className="w-full bg-[#FCF9F2] border border-[#D8D3C8] focus:border-[#20211F] rounded-[4px] px-2.5 py-2 text-[13px] text-[#20211F]"
                  >
                    {TIME_BLOCKS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="inspector-duration"
                    className="block text-[11px] font-medium text-[#55433B] mb-1"
                  >
                    Duration
                  </label>
                  <select
                    id="inspector-duration"
                    value={selectedTask.durationMinutes}
                    onChange={(e) =>
                      onUpdateTask(selectedTask.id, {
                        durationMinutes: Number(e.target.value),
                      })
                    }
                    className="w-full bg-[#FCF9F2] border border-[#D8D3C8] focus:border-[#20211F] rounded-[4px] px-2.5 py-2 text-[13px] text-[#20211F] tabular-nums"
                  >
                    {[15, 25, 30, 45, 60, 75, 90, 120].map((m) => (
                      <option key={m} value={m}>
                        {m} minutes
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="inspector-priority"
                    className="block text-[11px] font-medium text-[#55433B] mb-1"
                  >
                    Priority
                  </label>
                  <select
                    id="inspector-priority"
                    value={selectedTask.priority}
                    onChange={(e) =>
                      onUpdateTask(selectedTask.id, {
                        priority: e.target.value as TaskPriority,
                      })
                    }
                    className="w-full bg-[#FCF9F2] border border-[#D8D3C8] focus:border-[#20211F] rounded-[4px] px-2.5 py-2 text-[13px] text-[#20211F]"
                  >
                    <option value="high">High</option>
                    <option value="normal">Normal</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              {/* Subtasks */}
              <div className="pt-2 border-t border-[#D8D3C8]">
                <span className="block text-[12px] font-medium text-[#55433B] mb-2">
                  Checklist Steps
                </span>
                {selectedTask.subtasks.length > 0 && (
                  <ul className="space-y-1.5 mb-3">
                    {selectedTask.subtasks.map((sub) => (
                      <li
                        key={sub.id}
                        className="flex items-center justify-between gap-2 py-1"
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleSubtask(sub.id)}
                          className="flex items-center gap-2.5 text-left min-w-0 flex-1"
                        >
                          <span
                            className={`w-3.5 h-3.5 rounded-[2px] border flex items-center justify-center shrink-0 ${
                              sub.completed
                                ? 'bg-[#59614C] border-[#59614C] text-[#F4F1EA]'
                                : 'bg-[#FCF9F2] border-[#887269]'
                            }`}
                          >
                            {sub.completed && <Check className="w-2.5 h-2.5" strokeWidth={2.5} />}
                          </span>
                          <span
                            className={`text-[13px] truncate ${
                              sub.completed ? 'line-through text-[#786A62]' : 'text-[#20211F]'
                            }`}
                          >
                            {sub.title}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSubtask(sub.id)}
                          aria-label={`Remove step ${sub.title}`}
                          className="text-[#786A62] hover:text-[#BA1A1A] p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <form onSubmit={handleAddSubtask} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder="Add a concrete step..."
                    aria-label="Add checklist step"
                    className="flex-1 bg-transparent border-b border-[#D8D3C8] focus:border-[#20211F] py-1.5 text-[13px] text-[#20211F] placeholder:text-[#786A62]"
                  />
                  <button
                    type="submit"
                    disabled={!newSubtaskTitle.trim()}
                    className="px-2.5 py-1 text-[12px] font-medium border border-[#D8D3C8] rounded-[4px] text-[#20211F] hover:bg-[#E8E4DA] disabled:opacity-40"
                  >
                    Add
                  </button>
                </form>
              </div>

              {/* Scratchpad Notes */}
              <div className="pt-2 border-t border-[#D8D3C8]">
                <label
                  htmlFor="inspector-notes"
                  className="block text-[12px] font-medium text-[#55433B] mb-2"
                >
                  Studio Notes
                </label>
                <textarea
                  id="inspector-notes"
                  rows={5}
                  value={selectedTask.notes}
                  onChange={(e) =>
                    onUpdateTask(selectedTask.id, { notes: e.target.value })
                  }
                  placeholder="Write architectural context, references, or constraints..."
                  className="w-full bg-[#FCF9F2] border border-[#D8D3C8] focus:border-[#994618] rounded-[4px] p-3 text-[13px] leading-[20px] text-[#20211F] placeholder:text-[#786A62] resize-y"
                />
              </div>

              {!selectedTask.completed && (
                <button
                  type="button"
                  onClick={() => onLaunchFocus(selectedTask.id)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[42px] bg-[#994618] hover:bg-[#7A3000] text-[#F4F1EA] text-[13px] font-medium rounded-[4px] transition-colors duration-150"
                >
                  <Clock className="w-4 h-4" strokeWidth={1.75} />
                  <span>Enter Focus Studio ({selectedTask.durationMinutes}m)</span>
                </button>
              )}
            </div>
          ) : (
            <div className="bg-[#E8E4DA] border border-[#D8D3C8] rounded-[4px] p-5">
              <p className="font-editorial text-[20px] text-[#20211F]">
                Select a task to inspect
              </p>
              <p className="mt-1 text-[13px] text-[#55433B]">
                Click any item in your agenda to edit its duration, breakdown steps, or studio notes.
              </p>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
};
