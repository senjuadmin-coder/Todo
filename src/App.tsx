import { useEffect, useState } from 'react';
import { FocusStudioView } from './components/FocusStudioView';
import { NotebookView } from './components/NotebookView';
import { QuickCreateModal } from './components/QuickCreateModal';
import { ScheduleView } from './components/ScheduleView';
import { TodayView } from './components/TodayView';
import { TopBar } from './components/TopBar';
import {
  INITIAL_DAILY_INTENTION,
  INITIAL_NOTES,
  INITIAL_SESSIONS,
  INITIAL_TASKS,
  TODAY_ISO,
} from './data/initialData';
import {
  FocusSession,
  ScreenId,
  SoundscapeMode,
  StudioNote,
  Task,
  TimeBlock,
} from './types';
import { studioAudio } from './utils/audio';
import { formatTimerSeconds } from './utils/dates';

const STORAGE_KEYS = {
  tasks: 'momentum.tasks.v1',
  notes: 'momentum.notes.v1',
  sessions: 'momentum.sessions.v1',
  intention: 'momentum.intention.v1',
};

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenId>('today');
  const [tasks, setTasks] = useState<Task[]>(() =>
    readStorage(STORAGE_KEYS.tasks, INITIAL_TASKS)
  );
  const [notes, setNotes] = useState<StudioNote[]>(() =>
    readStorage(STORAGE_KEYS.notes, INITIAL_NOTES)
  );
  const [sessions, setSessions] = useState<FocusSession[]>(() =>
    readStorage(STORAGE_KEYS.sessions, INITIAL_SESSIONS)
  );
  const [dailyIntention, setDailyIntention] = useState<string>(() =>
    readStorage(STORAGE_KEYS.intention, INITIAL_DAILY_INTENTION)
  );

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(
    INITIAL_TASKS[0]?.id ?? null
  );
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(
    INITIAL_NOTES[0]?.id ?? null
  );
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);

  // Focus Studio Timer & Soundscape State
  const [focusTaskId, setFocusTaskId] = useState<string | null>(
    INITIAL_TASKS[0]?.id ?? null
  );
  const [durationSeconds, setDurationSeconds] = useState<number>(50 * 60);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(50 * 60);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [sessionIntention, setSessionIntention] = useState<string>(
    'Complete the structural edit cleanly without context switching.'
  );
  const [sessionFinishedPrompt, setSessionFinishedPrompt] = useState(false);

  const [soundscape, setSoundscape] = useState<SoundscapeMode>('silence');
  const [soundVolume, setSoundVolume] = useState<number>(0.25);

  // Persist to localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
    } catch {
      // Ignore storage quota errors
    }
  }, [tasks]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(notes));
    } catch {
      // Ignore
    }
  }, [notes]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.sessions, JSON.stringify(sessions));
    } catch {
      // Ignore
    }
  }, [sessions]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEYS.intention,
        JSON.stringify(dailyIntention)
      );
    } catch {
      // Ignore
    }
  }, [dailyIntention]);

  // Timer interval
  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          setSessionFinishedPrompt(true);
          studioAudio.playCompletionChime();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      studioAudio.stopAmbient();
    };
  }, []);

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? new Date().toISOString() : undefined,
            }
          : t
      )
    );
  };

  const handleAddTask = (draft: Omit<Task, 'id' | 'createdAt'>) => {
    const created: Task = {
      ...draft,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [created, ...prev]);
    setSelectedTaskId(created.id);
  };

  const handleUpdateTask = (taskId: string, patch: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...patch } : t))
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (selectedTaskId === taskId) setSelectedTaskId(null);
    if (focusTaskId === taskId) setFocusTaskId(null);
  };

  const handleAssignTask = (taskId: string, dateIso: string, block: TimeBlock) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, scheduledDate: dateIso, timeBlock: block } : t
      )
    );
  };

  const handleQuickCreateInSlot = (
    title: string,
    dateIso: string,
    block: TimeBlock
  ) => {
    handleAddTask({
      title,
      completed: false,
      priority: 'normal',
      category: 'Editorial',
      durationMinutes: 45,
      scheduledDate: dateIso,
      timeBlock: block,
      notes: '',
      subtasks: [],
    });
  };

  const handleLaunchFocus = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    setFocusTaskId(taskId);
    if (task && !timerRunning) {
      const secs = task.durationMinutes * 60;
      setDurationSeconds(secs);
      setRemainingSeconds(secs);
      setSessionFinishedPrompt(false);
    }
    setActiveScreen('focus');
  };

  const handleSetPresetMinutes = (minutes: number) => {
    if (timerRunning) return;
    const secs = minutes * 60;
    setDurationSeconds(secs);
    setRemainingSeconds(secs);
    setSessionFinishedPrompt(false);
  };

  const handleResetTimer = () => {
    setTimerRunning(false);
    setRemainingSeconds(durationSeconds);
    setSessionFinishedPrompt(false);
  };

  const handleLogSession = (reflection: string, markTaskDone: boolean) => {
    const elapsedMins = Math.max(
      1,
      Math.round((durationSeconds - remainingSeconds) / 60) ||
        Math.round(durationSeconds / 60)
    );
    const linkedTask = tasks.find((t) => t.id === focusTaskId);

    const newSession: FocusSession = {
      id: `sess-${Date.now()}`,
      taskId: linkedTask?.id,
      taskTitle: linkedTask ? linkedTask.title : 'Open Studio Block',
      category: linkedTask ? linkedTask.category : 'Editorial',
      durationMinutes: elapsedMins,
      intention: sessionIntention.trim(),
      reflection,
      completedAt: new Date().toISOString(),
    };

    setSessions((prev) => [newSession, ...prev]);

    if (markTaskDone && linkedTask && !linkedTask.completed) {
      handleToggleTask(linkedTask.id);
    }

    setTimerRunning(false);
    setRemainingSeconds(durationSeconds);
    setSessionFinishedPrompt(false);
  };

  const handleChangeSoundscape = (mode: SoundscapeMode) => {
    setSoundscape(mode);
    studioAudio.startAmbient(mode, soundVolume);
  };

  const handleChangeVolume = (vol: number) => {
    setSoundVolume(vol);
    if (soundscape !== 'silence') {
      studioAudio.startAmbient(soundscape, vol);
    }
  };

  const handleAddNote = (draft: Omit<StudioNote, 'id' | 'updatedAt'>) => {
    const created: StudioNote = {
      ...draft,
      id: `note-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => [created, ...prev]);
    setSelectedNoteId(created.id);
    setActiveScreen('notebook');
  };

  const handleUpdateNote = (noteId: string, patch: Partial<StudioNote>) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === noteId
          ? { ...n, ...patch, updatedAt: new Date().toISOString() }
          : n
      )
    );
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    if (selectedNoteId === noteId) setSelectedNoteId(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F1EA] text-[#20211F]">
      <TopBar
        activeScreen={activeScreen}
        onSelectScreen={setActiveScreen}
        onOpenQuickCreate={() => setQuickCreateOpen(true)}
        timerRunning={timerRunning}
        timerDisplay={formatTimerSeconds(remainingSeconds)}
      />

      <div className="flex-1">
        {activeScreen === 'today' && (
          <TodayView
            todayIso={TODAY_ISO}
            dailyIntention={dailyIntention}
            onUpdateDailyIntention={setDailyIntention}
            tasks={tasks}
            selectedTaskId={selectedTaskId}
            onSelectTask={setSelectedTaskId}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onLaunchFocus={handleLaunchFocus}
          />
        )}

        {activeScreen === 'focus' && (
          <FocusStudioView
            tasks={tasks}
            activeTaskId={focusTaskId}
            onSelectActiveTask={setFocusTaskId}
            durationSeconds={durationSeconds}
            remainingSeconds={remainingSeconds}
            isRunning={timerRunning}
            sessionIntention={sessionIntention}
            onChangeIntention={setSessionIntention}
            onSetPresetMinutes={handleSetPresetMinutes}
            onToggleRun={() => setTimerRunning((prev) => !prev)}
            onResetTimer={handleResetTimer}
            onLogSession={handleLogSession}
            soundscape={soundscape}
            soundVolume={soundVolume}
            onChangeSoundscape={handleChangeSoundscape}
            onChangeVolume={handleChangeVolume}
            recentSessions={sessions}
            sessionFinishedPrompt={sessionFinishedPrompt}
            onDismissFinishedPrompt={() => setSessionFinishedPrompt(false)}
          />
        )}

        {activeScreen === 'schedule' && (
          <ScheduleView
            todayIso={TODAY_ISO}
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onAssignTask={handleAssignTask}
            onQuickCreateInSlot={handleQuickCreateInSlot}
            onLaunchFocus={handleLaunchFocus}
          />
        )}

        {activeScreen === 'notebook' && (
          <NotebookView
            notes={notes}
            selectedNoteId={selectedNoteId}
            onSelectNote={setSelectedNoteId}
            onAddNote={handleAddNote}
            onUpdateNote={handleUpdateNote}
            onDeleteNote={handleDeleteNote}
            sessions={sessions}
            tasks={tasks}
          />
        )}
      </div>

      <footer className="border-t border-[#D8D3C8] py-5 mt-12">
        <div className="max-w-[1360px] mx-auto px-4 md:px-8 flex flex-wrap items-center justify-between gap-4 text-[12px] text-[#55433B]">
          <span>MOMENTUM · Editorial Productivity Studio</span>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => setActiveScreen('today')}
              className="hover:text-[#20211F]"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setActiveScreen('focus')}
              className="hover:text-[#20211F]"
            >
              Focus Studio
            </button>
            <button
              type="button"
              onClick={() => setActiveScreen('schedule')}
              className="hover:text-[#20211F]"
            >
              Schedule
            </button>
            <button
              type="button"
              onClick={() => setActiveScreen('notebook')}
              className="hover:text-[#20211F]"
            >
              Notebook
            </button>
          </div>
        </div>
      </footer>

      <QuickCreateModal
        isOpen={quickCreateOpen}
        todayIso={TODAY_ISO}
        onClose={() => setQuickCreateOpen(false)}
        onCreateTask={handleAddTask}
        onCreateNote={handleAddNote}
      />
    </div>
  );
}
