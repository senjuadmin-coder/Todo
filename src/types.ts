export type ScreenId = 'today' | 'focus' | 'schedule' | 'notebook';

export type TaskPriority = 'high' | 'normal' | 'low';

export type TimeBlock = 'Morning' | 'Afternoon' | 'Evening' | 'Unscheduled';

export type ProjectCategory =
  | 'Editorial'
  | 'Architecture'
  | 'Research'
  | 'Studio Admin'
  | 'Reading';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: TaskPriority;
  category: ProjectCategory;
  durationMinutes: number;
  scheduledDate: string; // YYYY-MM-DD or '' if backlog
  timeBlock: TimeBlock;
  notes: string;
  subtasks: Subtask[];
  createdAt: string;
  completedAt?: string;
}

export interface StudioNote {
  id: string;
  title: string;
  category: ProjectCategory;
  content: string;
  updatedAt: string;
  pinned?: boolean;
}

export interface FocusSession {
  id: string;
  taskId?: string;
  taskTitle: string;
  category: ProjectCategory;
  durationMinutes: number;
  intention: string;
  reflection: string;
  completedAt: string;
}

export type SoundscapeMode = 'silence' | 'brown-noise' | 'rain' | 'metronome';
