import React, { useMemo, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Play, Plus } from 'lucide-react';
import { Task, TimeBlock } from '../types';
import { formatMinutesReadable, getWeekDays } from '../utils/dates';

interface ScheduleViewProps {
  todayIso: string;
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  onAssignTask: (taskId: string, dateIso: string, block: TimeBlock) => void;
  onQuickCreateInSlot: (title: string, dateIso: string, block: TimeBlock) => void;
  onLaunchFocus: (taskId: string) => void;
}

const DAY_BLOCKS: TimeBlock[] = ['Morning', 'Afternoon', 'Evening'];

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  todayIso,
  tasks,
  onToggleTask,
  onAssignTask,
  onQuickCreateInSlot,
  onLaunchFocus,
}) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDayIso, setSelectedDayIso] = useState(todayIso);
  const [slotDraft, setSlotDraft] = useState<{ dateIso: string; block: TimeBlock } | null>(
    null
  );
  const [draftTitle, setDraftTitle] = useState('');

  const weekDays = useMemo(
    () => getWeekDays(todayIso, weekOffset),
    [todayIso, weekOffset]
  );

  const backlogTasks = useMemo(
    () => tasks.filter((t) => !t.completed && (!t.scheduledDate || t.timeBlock === 'Unscheduled')),
    [tasks]
  );

  const weekMinutesTotal = useMemo(() => {
    const daySet = new Set(weekDays.map((d) => d.iso));
    return tasks
      .filter((t) => daySet.has(t.scheduledDate))
      .reduce((acc, t) => acc + t.durationMinutes, 0);
  }, [tasks, weekDays]);

  const handleSlotCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotDraft) return;
    const trimmed = draftTitle.trim();
    if (!trimmed) return;
    onQuickCreateInSlot(trimmed, slotDraft.dateIso, slotDraft.block);
    setDraftTitle('');
    setSlotDraft(null);
  };

  return (
    <main className="max-w-[1360px] mx-auto px-4 md:px-8 py-8 md:py-10">
      {/* Header */}
      <header className="pb-6 border-b border-[#D8D3C8] flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-editorial text-[36px] md:text-[48px] leading-[1.12] tracking-[-0.02em] font-normal text-[#20211F]">
            Weekly Architecture
          </h1>
          <p className="mt-2 text-[14px] text-[#55433B] tabular-nums">
            {weekDays[0].monthShort} {weekDays[0].dayNumber} – {weekDays[6].monthShort}{' '}
            {weekDays[6].dayNumber} · {formatMinutesReadable(weekMinutesTotal)} allocated across 7 days
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setWeekOffset((w) => w - 1)}
            aria-label="Previous week"
            className="w-10 h-10 inline-flex items-center justify-center border border-[#D8D3C8] rounded-[4px] text-[#20211F] hover:bg-[#E8E4DA]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setWeekOffset(0);
              setSelectedDayIso(todayIso);
            }}
            className="px-3.5 py-2 min-h-[40px] border border-[#D8D3C8] rounded-[4px] text-[13px] font-medium text-[#20211F] hover:bg-[#E8E4DA] whitespace-nowrap"
          >
            This Week
          </button>
          <button
            type="button"
            onClick={() => setWeekOffset((w) => w + 1)}
            aria-label="Next week"
            className="w-10 h-10 inline-flex items-center justify-center border border-[#D8D3C8] rounded-[4px] text-[#20211F] hover:bg-[#E8E4DA]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 9-Column Architectural Week Matrix */}
        <section aria-label="Weekly calendar blocks" className="lg:col-span-9">
          {/* Mobile Day Selector */}
          <div className="flex lg:hidden items-center gap-1 overflow-x-auto pb-3 mb-4 border-b border-[#D8D3C8]">
            {weekDays.map((day) => {
              const active = selectedDayIso === day.iso;
              return (
                <button
                  key={day.iso}
                  type="button"
                  onClick={() => setSelectedDayIso(day.iso)}
                  className={`px-3 py-2 rounded-[4px] text-[12px] whitespace-nowrap shrink-0 border ${
                    active
                      ? 'bg-[#20211F] text-[#F4F1EA] border-[#20211F]'
                      : 'bg-[#FCF9F2] text-[#20211F] border-[#D8D3C8]'
                  }`}
                >
                  {day.weekdayShort} {day.dayNumber}
                </button>
              );
            })}
          </div>

          {/* Desktop 7-Day Grid / Mobile Single Day */}
          <div className="border border-[#D8D3C8] bg-[#FCF9F2]">
            {/* Day Column Headers */}
            <div className="hidden lg:grid lg:grid-cols-7 border-b border-[#D8D3C8] bg-[#E8E4DA]">
              {weekDays.map((day) => {
                const dayMins = tasks
                  .filter((t) => t.scheduledDate === day.iso)
                  .reduce((acc, t) => acc + t.durationMinutes, 0);

                return (
                  <div
                    key={day.iso}
                    className={`p-3 border-r border-[#D8D3C8] last:border-r-0 ${
                      day.isAnchorToday ? 'bg-[#FFDBCC]/45' : ''
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-1">
                      <span className="text-[12px] font-medium text-[#55433B]">
                        {day.weekdayShort}
                      </span>
                      <span
                        className={`font-editorial text-[20px] tabular-nums ${
                          day.isAnchorToday ? 'text-[#994618] font-medium' : 'text-[#20211F]'
                        }`}
                      >
                        {day.dayNumber}
                      </span>
                    </div>
                    <div className="mt-1 font-mono text-[11px] tabular-nums text-[#55433B]">
                      {dayMins > 0 ? formatMinutesReadable(dayMins) : 'Open'}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Time Block Rows */}
            {DAY_BLOCKS.map((block) => (
              <div
                key={block}
                className="border-b border-[#D8D3C8] last:border-b-0"
              >
                <div className="px-3 py-2 bg-[#F4F1EA] border-b border-[#D8D3C8] flex items-center justify-between">
                  <span className="text-[12px] font-medium tracking-[0.03em] text-[#55433B]">
                    {block} Block
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-7 divide-y lg:divide-y-0 lg:divide-x divide-[#D8D3C8]">
                  {weekDays.map((day) => {
                    const isHiddenOnMobile = day.iso !== selectedDayIso;
                    const slotTasks = tasks.filter(
                      (t) => t.scheduledDate === day.iso && t.timeBlock === block
                    );
                    const isAddingHere =
                      slotDraft?.dateIso === day.iso && slotDraft?.block === block;

                    return (
                      <div
                        key={`${day.iso}-${block}`}
                        className={`${
                          isHiddenOnMobile ? 'hidden lg:flex' : 'flex'
                        } flex-col justify-between min-h-[124px] p-2.5 gap-2 ${
                          day.isAnchorToday ? 'bg-[#FCF9F2]' : 'bg-[#F4F1EA]/50'
                        }`}
                      >
                        <div className="space-y-1.5">
                          {slotTasks.map((t) => (
                            <div
                              key={t.id}
                              className={`p-2 rounded-[3px] border text-[12px] ${
                                t.completed
                                  ? 'bg-[#E8E4DA]/70 border-[#D8D3C8] text-[#786A62]'
                                  : t.priority === 'high'
                                  ? 'bg-[#FFDBCC]/40 border-[#D97745] text-[#20211F]'
                                  : 'bg-[#FCF9F2] border-[#D8D3C8] text-[#20211F]'
                              }`}
                            >
                              <div className="flex items-start gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => onToggleTask(t.id)}
                                  aria-label={`Toggle ${t.title}`}
                                  className={`mt-0.5 w-3.5 h-3.5 rounded-[2px] border flex items-center justify-center shrink-0 ${
                                    t.completed
                                      ? 'bg-[#59614C] border-[#59614C] text-[#F4F1EA]'
                                      : 'border-[#887269] bg-[#FCF9F2]'
                                  }`}
                                >
                                  {t.completed && (
                                    <Check className="w-2.5 h-2.5" strokeWidth={2.5} />
                                  )}
                                </button>
                                <span
                                  className={`leading-[16px] flex-1 ${
                                    t.completed ? 'line-through' : ''
                                  }`}
                                >
                                  {t.title}
                                </span>
                              </div>
                              <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#55433B] tabular-nums">
                                <span>{t.durationMinutes}m</span>
                                {!t.completed && (
                                  <button
                                    type="button"
                                    onClick={() => onLaunchFocus(t.id)}
                                    title="Focus on this task"
                                    className="inline-flex items-center gap-0.5 text-[#994618] hover:underline"
                                  >
                                    <Play className="w-2.5 h-2.5" />
                                    <span>Focus</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {isAddingHere ? (
                          <form onSubmit={handleSlotCreate} className="space-y-1.5">
                            <input
                              type="text"
                              autoFocus
                              value={draftTitle}
                              onChange={(e) => setDraftTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Escape') setSlotDraft(null);
                              }}
                              placeholder="Task title..."
                              className="w-full bg-[#FCF9F2] border border-[#994618] rounded-[3px] px-2 py-1 text-[12px] text-[#20211F]"
                            />
                            <div className="flex items-center gap-1.5">
                              <button
                                type="submit"
                                className="px-2 py-1 bg-[#994618] text-[#F4F1EA] text-[11px] rounded-[3px]"
                              >
                                Add
                              </button>
                              <button
                                type="button"
                                onClick={() => setSlotDraft(null)}
                                className="px-2 py-1 text-[11px] text-[#55433B]"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setSlotDraft({ dateIso: day.iso, block });
                              setDraftTitle('');
                            }}
                            className="inline-flex items-center gap-1 text-[11px] text-[#786A62] hover:text-[#994618] py-1 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add block</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3-Column Unscheduled Backlog */}
        <aside
          aria-label="Unscheduled backlog"
          className="lg:col-span-3 flex flex-col gap-4"
        >
          <div className="pb-3 border-b border-[#D8D3C8]">
            <h2 className="font-editorial text-[22px] font-medium text-[#20211F]">
              Studio Backlog
            </h2>
            <p className="text-[12px] text-[#55433B] mt-1">
              Assign unscheduled commitments to {selectedDayIso === todayIso ? 'today' : selectedDayIso}.
            </p>
          </div>

          {backlogTasks.length === 0 ? (
            <div className="p-4 bg-[#E8E4DA] border border-[#D8D3C8] rounded-[4px]">
              <p className="text-[13px] text-[#55433B]">
                All open tasks are currently placed on the calendar.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-[#D8D3C8] border-b border-[#D8D3C8]">
              {backlogTasks.map((task) => (
                <li key={task.id} className="py-3.5 space-y-2">
                  <div className="text-[13px] font-medium text-[#20211F]">
                    {task.title}
                  </div>
                  <div className="text-[12px] text-[#55433B] tabular-nums">
                    {task.category} · {task.durationMinutes}m
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {DAY_BLOCKS.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => onAssignTask(task.id, selectedDayIso, b)}
                        className="px-2 py-1 text-[11px] border border-[#D8D3C8] rounded-[3px] text-[#20211F] hover:bg-[#E8E4DA]"
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </main>
  );
};
