import React, { useState } from 'react';
import {
  Check,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  FocusSession,
  ProjectCategory,
  SoundscapeMode,
  Task,
} from '../types';
import { formatMinutesReadable, formatTimerSeconds } from '../utils/dates';

interface FocusStudioViewProps {
  tasks: Task[];
  activeTaskId: string | null;
  onSelectActiveTask: (taskId: string | null) => void;
  durationSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  sessionIntention: string;
  onChangeIntention: (value: string) => void;
  onSetPresetMinutes: (minutes: number) => void;
  onToggleRun: () => void;
  onResetTimer: () => void;
  onLogSession: (reflection: string, markTaskDone: boolean) => void;
  soundscape: SoundscapeMode;
  soundVolume: number;
  onChangeSoundscape: (mode: SoundscapeMode) => void;
  onChangeVolume: (vol: number) => void;
  recentSessions: FocusSession[];
  sessionFinishedPrompt: boolean;
  onDismissFinishedPrompt: () => void;
}

const PRESETS = [
  { label: '25m Studio', minutes: 25 },
  { label: '50m Deep Work', minutes: 50 },
  { label: '90m Monograph', minutes: 90 },
  { label: '15m Quiet Rest', minutes: 15 },
];

const SOUNDSCAPES: { id: SoundscapeMode; label: string; detail: string }[] = [
  { id: 'silence', label: 'Silence', detail: 'Natural room acoustics' },
  { id: 'brown-noise', label: 'Warm Brown Noise', detail: 'Low-pass studio masking' },
  { id: 'rain', label: 'Soft Courtyard Rain', detail: 'Filtered steady texture' },
  { id: 'metronome', label: 'Steady Cadence', detail: '60 BPM quiet pulse' },
];

export const FocusStudioView: React.FC<FocusStudioViewProps> = ({
  tasks,
  activeTaskId,
  onSelectActiveTask,
  durationSeconds,
  remainingSeconds,
  isRunning,
  sessionIntention,
  onChangeIntention,
  onSetPresetMinutes,
  onToggleRun,
  onResetTimer,
  onLogSession,
  soundscape,
  soundVolume,
  onChangeSoundscape,
  onChangeVolume,
  recentSessions,
  sessionFinishedPrompt,
  onDismissFinishedPrompt,
}) => {
  const [reflection, setReflection] = useState('');
  const [markTaskDone, setMarkTaskDone] = useState(false);

  const openTasks = tasks.filter((t) => !t.completed);
  const activeTask = tasks.find((t) => t.id === activeTaskId) ?? null;

  const elapsedSeconds = Math.max(0, durationSeconds - remainingSeconds);
  const progressPercent =
    durationSeconds > 0
      ? Math.min(100, Math.round((elapsedSeconds / durationSeconds) * 100))
      : 0;

  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogSession(reflection.trim(), markTaskDone);
    setReflection('');
    setMarkTaskDone(false);
  };

  const todayMinutesLogged = recentSessions
    .filter((s) => s.completedAt.startsWith('2026-11-24'))
    .reduce((acc, s) => acc + s.durationMinutes, 0);

  return (
    <main className="max-w-[1360px] mx-auto px-4 md:px-8 py-8 md:py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-10 lg:gap-x-0">
        {/* Primary 8-Column Focus Canvas */}
        <section
          aria-label="Focus session timer"
          className="lg:col-span-8 lg:pr-8 lg:border-r lg:border-[#D8D3C8]"
        >
          <header className="pb-6 border-b border-[#D8D3C8] flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <h1 className="font-editorial text-[36px] md:text-[52px] leading-[1.12] tracking-[-0.02em] font-normal text-[#20211F]">
                Focus Studio
              </h1>
              <p className="mt-2 text-[14px] text-[#55433B]">
                Single-task attention block with ambient acoustic restraint.
              </p>
            </div>
            <div className="text-[13px] text-[#55433B] tabular-nums">
              <span>{formatMinutesReadable(todayMinutesLogged)} logged today</span>
            </div>
          </header>

          {/* Duration Presets */}
          <div className="py-5 border-b border-[#D8D3C8] flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-1 p-1 bg-[#E8E4DA] rounded-[4px]">
              {PRESETS.map((preset) => {
                const isSelected = durationSeconds === preset.minutes * 60;
                return (
                  <button
                    key={preset.minutes}
                    type="button"
                    disabled={isRunning}
                    onClick={() => onSetPresetMinutes(preset.minutes)}
                    className={`px-3 py-1.5 text-[12px] font-medium rounded-[3px] whitespace-nowrap transition-colors duration-150 ${
                      isSelected
                        ? 'bg-[#F4F1EA] text-[#20211F]'
                        : 'text-[#55433B] hover:text-[#20211F]'
                    } disabled:opacity-60`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            <span className="font-mono text-[12px] tabular-nums text-[#55433B]">
              {progressPercent}% elapsed
            </span>
          </div>

          {/* Typographic Countdown Display */}
          <div className="py-10 md:py-14 border-b border-[#D8D3C8]">
            <div className="flex flex-col items-start">
              <div
                aria-live="polite"
                className="font-mono text-[68px] sm:text-[96px] md:text-[116px] leading-none tracking-[-0.03em] font-normal text-[#20211F] tabular-nums"
              >
                {formatTimerSeconds(remainingSeconds)}
              </div>

              {/* Architectural Hairline Progress Rule */}
              <div className="w-full h-[3px] bg-[#E8E4DA] mt-8 mb-8">
                <div
                  className="h-full bg-[#D97745] transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Primary Timer Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onToggleRun}
                  className="inline-flex items-center gap-2 px-6 py-2.5 min-h-[44px] bg-[#994618] hover:bg-[#7A3000] text-[#F4F1EA] text-[14px] font-medium rounded-[4px] whitespace-nowrap transition-colors duration-150"
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>Pause Block</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>
                        {remainingSeconds < durationSeconds ? 'Resume Block' : 'Begin Session'}
                      </span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onResetTimer}
                  className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] border border-[#D8D3C8] hover:bg-[#E8E4DA] text-[#20211F] text-[13px] font-medium rounded-[4px] whitespace-nowrap transition-colors duration-150"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </button>

                {elapsedSeconds >= 60 && !sessionFinishedPrompt && (
                  <button
                    type="button"
                    onClick={() => onLogSession('', false)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] border border-[#59614C] bg-[#DEE6CB]/50 hover:bg-[#DEE6CB] text-[#171E0E] text-[13px] font-medium rounded-[4px] whitespace-nowrap transition-colors duration-150"
                  >
                    <Check className="w-4 h-4" />
                    <span>Log Elapsed ({Math.max(1, Math.round(elapsedSeconds / 60))}m)</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Session Closing Reflection Prompt */}
          {sessionFinishedPrompt && (
            <form
              onSubmit={handleCompleteSubmit}
              className="mt-6 bg-[#E8E4DA] border border-[#D8D3C8] rounded-[4px] p-5 space-y-4"
            >
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-editorial text-[22px] text-[#20211F]">
                  Block Complete — Closing Note
                </h2>
                <button
                  type="button"
                  onClick={onDismissFinishedPrompt}
                  className="text-[12px] text-[#55433B] hover:text-[#20211F]"
                >
                  Dismiss
                </button>
              </div>
              <textarea
                rows={3}
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="Record what moved forward during this session..."
                className="w-full bg-[#FCF9F2] border border-[#D8D3C8] focus:border-[#994618] rounded-[4px] p-3 text-[14px] text-[#20211F]"
              />
              {activeTask && !activeTask.completed && (
                <label className="flex items-center gap-2.5 text-[13px] text-[#20211F] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={markTaskDone}
                    onChange={(e) => setMarkTaskDone(e.target.checked)}
                    className="w-4 h-4 accent-[#59614C]"
                  />
                  <span>Mark “{activeTask.title}” as completed</span>
                </label>
              )}
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="px-4 py-2 min-h-[40px] bg-[#994618] hover:bg-[#7A3000] text-[#F4F1EA] text-[13px] font-medium rounded-[4px]"
                >
                  Record to Ledger
                </button>
              </div>
            </form>
          )}

          {/* Active Commitment & Session Intention */}
          <div className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="focus-task-select"
                className="block text-[12px] font-medium text-[#55433B] mb-2"
              >
                Anchored Commitment
              </label>
              <select
                id="focus-task-select"
                value={activeTaskId ?? ''}
                onChange={(e) =>
                  onSelectActiveTask(e.target.value ? e.target.value : null)
                }
                className="w-full bg-[#FCF9F2] border border-[#D8D3C8] focus:border-[#20211F] rounded-[4px] px-3 py-2.5 text-[14px] text-[#20211F]"
              >
                <option value="">Open Studio Block (Unlinked)</option>
                {openTasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.durationMinutes}m)
                  </option>
                ))}
              </select>
              {activeTask && activeTask.notes && (
                <p className="mt-3 text-[13px] leading-[20px] text-[#55433B]">
                  {activeTask.notes}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="focus-intention-input"
                className="block text-[12px] font-medium text-[#55433B] mb-2"
              >
                Block Intention
              </label>
              <textarea
                id="focus-intention-input"
                rows={3}
                value={sessionIntention}
                onChange={(e) => onChangeIntention(e.target.value)}
                placeholder="Define one clear outcome for this block..."
                className="w-full bg-[#FCF9F2] border border-[#D8D3C8] focus:border-[#994618] rounded-[4px] p-3 text-[14px] leading-[20px] text-[#20211F]"
              />
            </div>
          </div>
        </section>

        {/* Contextual 4-Column Sidebar: Soundscapes & Recent Ledger */}
        <aside
          aria-label="Acoustic environment and session log"
          className="lg:col-span-4 lg:pl-8 flex flex-col gap-8"
        >
          {/* Soundscape Engine */}
          <div className="pb-6 border-b border-[#D8D3C8]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-editorial text-[22px] font-medium text-[#20211F]">
                Acoustic Space
              </h2>
              {soundscape === 'silence' ? (
                <VolumeX className="w-4 h-4 text-[#786A62]" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#994618]" />
              )}
            </div>

            <div className="space-y-2">
              {SOUNDSCAPES.map((item) => {
                const active = soundscape === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onChangeSoundscape(item.id)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-[4px] border transition-colors duration-150 ${
                      active
                        ? 'bg-[#E8E4DA] border-[#20211F] text-[#20211F]'
                        : 'bg-transparent border-[#D8D3C8] text-[#55433B] hover:bg-[#EFECE4]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium text-[#20211F]">
                        {item.label}
                      </span>
                      {active && (
                        <span className="text-[11px] font-medium text-[#994618]">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-[#55433B] mt-0.5">{item.detail}</p>
                  </button>
                );
              })}
            </div>

            {soundscape !== 'silence' && (
              <div className="mt-4 pt-4 border-t border-[#E8E4DA]">
                <div className="flex items-center justify-between text-[12px] text-[#55433B] mb-1.5">
                  <label htmlFor="sound-volume">Studio Volume</label>
                  <span className="font-mono tabular-nums">
                    {Math.round(soundVolume * 100)}%
                  </span>
                </div>
                <input
                  id="sound-volume"
                  type="range"
                  min={0.05}
                  max={0.6}
                  step={0.05}
                  value={soundVolume}
                  onChange={(e) => onChangeVolume(Number(e.target.value))}
                  className="w-full accent-[#994618]"
                />
              </div>
            )}
          </div>

          {/* Recent Completed Sessions */}
          <div>
            <h2 className="font-editorial text-[22px] font-medium text-[#20211F] mb-4">
              Recent Blocks
            </h2>
            {recentSessions.length === 0 ? (
              <p className="text-[13px] text-[#55433B]">
                Completed focus sessions will appear here.
              </p>
            ) : (
              <ul className="divide-y divide-[#D8D3C8] border-t border-b border-[#D8D3C8]">
                {recentSessions.slice(0, 5).map((sess) => (
                  <li key={sess.id} className="py-3.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[13px] font-medium text-[#20211F] truncate">
                        {sess.taskTitle}
                      </span>
                      <span className="font-mono text-[12px] tabular-nums text-[#55433B] shrink-0">
                        {sess.durationMinutes}m
                      </span>
                    </div>
                    <div className="mt-1 text-[12px] text-[#55433B]">
                      <span>{sess.category as ProjectCategory}</span>
                      {sess.reflection && (
                        <>
                          <span aria-hidden="true"> · </span>
                          <span className="italic">{sess.reflection}</span>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
};
