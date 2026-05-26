// 用户信息
export interface User {
  id: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

// 任务类型
export interface TaskType {
  id: number;
  name: string;
  icon: string;
  color: string;
  defaultDuration: number;
}

// 任务记录
export interface TaskRecord {
  id: string;
  type: number;
  completed: boolean;
  duration: number;
  notes?: string;
  tags: string[];
  completedAt: string;
}

// 心情类型
export type Mood = '😊' | '😐' | '😢' | '🤩' | '😴';

// 心情记录
export interface MoodRecord {
  date: string;
  mood: Mood;
  note?: string;
}

// 番茄钟记录
export interface PomodoroSession {
  id: string;
  duration: number;
  taskType?: number;
  completedAt: string;
}

// 每日记录
export interface DailyRecord {
  date: string;
  tasks: TaskRecord[];
  mood?: MoodRecord;
  pomodoroSessions: PomodoroSession[];
  dailyNotes?: string;
}

// 成就
export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

// 应用状态
export interface AppData {
  user: User;
  taskTypes: TaskType[];
  dailyRecords: DailyRecord[];
  achievements: Achievement[];
}
