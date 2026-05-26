import type { AppData } from './types';
import { DEFAULT_TASK_TYPES, DEFAULT_ACHIEVEMENTS, LEGACY_STORAGE_KEY } from './constants';
import { generateId, formatDate } from './utils';

// 迁移旧数据
export function migrateLegacyData(): AppData | null {
  if (typeof window === 'undefined') return null;

  try {
    const legacyDataStr = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacyDataStr) return null;

    const legacyData = JSON.parse(legacyDataStr);
    
    // 转换为新格式
    const migratedData: AppData = {
      user: legacyData.user || {
        id: generateId(),
        name: '用户名',
        createdAt: formatDate(new Date()),
      },
      taskTypes: legacyData.taskTypes || DEFAULT_TASK_TYPES,
      dailyRecords: (legacyData.dailyRecords || []).map((record: any) => ({
        ...record,
        pomodoroSessions: record.pomodoroSessions || [],
      })),
      achievements: legacyData.achievements || DEFAULT_ACHIEVEMENTS,
    };

    return migratedData;
  } catch (error) {
    console.error('Failed to migrate legacy data:', error);
    return null;
  }
}
