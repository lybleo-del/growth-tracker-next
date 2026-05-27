import type { TaskType, Achievement } from './types';

export const STORAGE_KEY = 'growthTrackerNextData';
export const LEGACY_STORAGE_KEY = 'growthTrackerData';

export const DEFAULT_TASK_TYPES: TaskType[] = [
  { id: 1, name: '读书', icon: '📚', color: '#667eea', defaultDuration: 60 },
  { id: 2, name: 'Vibe Coding', icon: '💻', color: '#764ba2', defaultDuration: 90 },
  { id: 3, name: '健身', icon: '🏋️', color: '#f093fb', defaultDuration: 45 },
  { id: 4, name: '写自媒体', icon: '📱', color: '#4facfe', defaultDuration: 60 },
  { id: 5, name: '其他', icon: '⭐', color: '#fa709a', defaultDuration: 30 },
];

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 1, name: '新手上路', description: '完成首次打卡', icon: '🎯', unlocked: false },
  { id: 2, name: '坚持一周', description: '连续打卡7天', icon: '🔥', unlocked: false },
  { id: 3, name: '月度达人', description: '完成30天打卡', icon: '🏆', unlocked: false },
  { id: 4, name: '知识渊博', description: '读书任务完成50次', icon: '📖', unlocked: false },
  { id: 5, name: '代码大师', description: 'Vibe Coding完成100小时', icon: '👨‍💻', unlocked: false },
  { id: 6, name: '专注达人', description: '完成100个番茄钟', icon: '⏱️', unlocked: false },
];

export const MOODS: { mood: string; label: string }[] = [
  { mood: '😊', label: '开心' },
  { mood: '😐', label: '一般' },
  { mood: '😢', label: '难过' },
  { mood: '🤩', label: '兴奋' },
  { mood: '😴', label: '疲惫' },
];

export const WHITE_NOISES: { id: string; name: string; emoji: string }[] = [
  { id: 'rain', name: '雨声', emoji: '🌧️' },
  { id: 'cafe', name: '咖啡馆', emoji: '☕' },
  { id: 'white', name: '白噪音', emoji: '🌊' },
  { id: 'pink', name: '粉红噪音', emoji: '🎵' },
  { id: 'forest', name: '森林', emoji: '🌲' },
];

export const POMODORO_DURATION = 25 * 60; // 25分钟
export const SHORT_BREAK_DURATION = 5 * 60; // 5分钟
export const LONG_BREAK_DURATION = 15 * 60; // 15分钟
