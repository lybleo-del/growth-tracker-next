'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import type { AppData, TaskRecord, Mood, PomodoroSession } from './types';
import { DEFAULT_TASK_TYPES, DEFAULT_ACHIEVEMENTS, STORAGE_KEY } from './constants';
import { generateId, formatDate, getTodayString, calculateStreak } from './utils';
import { migrateLegacyData } from './migration';

// 创建默认数据
function createDefaultData(): AppData {
  return {
    user: {
      id: generateId(),
      name: '用户名',
      createdAt: formatDate(new Date()),
    },
    taskTypes: DEFAULT_TASK_TYPES,
    dailyRecords: [],
    achievements: DEFAULT_ACHIEVEMENTS,
  };
}

// 从存储加载数据
function loadData(): AppData {
  if (typeof window === 'undefined') return createDefaultData();

  try {
    // 首先尝试迁移旧数据
    const migrated = migrateLegacyData();
    if (migrated) {
      saveData(migrated);
      return migrated;
    }

    const dataStr = localStorage.getItem(STORAGE_KEY);
    if (dataStr) {
      return JSON.parse(dataStr);
    }
  } catch (error) {
    console.error('Failed to load data:', error);
  }

  return createDefaultData();
}

// 保存数据
function saveData(data: AppData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// 检查成就解锁
function checkAchievements(data: AppData): AppData {
  const newData = { ...data };
  let updated = false;

  // 新手上路 - 首次打卡
  const totalTasks = newData.dailyRecords.reduce((sum, r) => sum + r.tasks.length, 0);
  if (totalTasks > 0 && !newData.achievements[0].unlocked) {
    newData.achievements[0] = {
      ...newData.achievements[0],
      unlocked: true,
      unlockedAt: formatDate(new Date()),
    };
    updated = true;
  }

  // 坚持一周 - 连续打卡7天
  const streak = calculateStreak(newData.dailyRecords);
  if (streak >= 7 && !newData.achievements[1].unlocked) {
    newData.achievements[1] = {
      ...newData.achievements[1],
      unlocked: true,
      unlockedAt: formatDate(new Date()),
    };
    updated = true;
  }

  // 月度达人 - 30天打卡
  if (newData.dailyRecords.length >= 30 && !newData.achievements[2].unlocked) {
    newData.achievements[2] = {
      ...newData.achievements[2],
      unlocked: true,
      unlockedAt: formatDate(new Date()),
    };
    updated = true;
  }

  // 知识渊博 - 读书50次
  const bookTasks = newData.dailyRecords.reduce((sum, r) => 
    sum + r.tasks.filter(t => t.type === 1).length, 0
  );
  if (bookTasks >= 50 && !newData.achievements[3].unlocked) {
    newData.achievements[3] = {
      ...newData.achievements[3],
      unlocked: true,
      unlockedAt: formatDate(new Date()),
    };
    updated = true;
  }

  // 代码大师 - 编程100小时
  const codingMinutes = newData.dailyRecords.reduce((sum, r) => 
    sum + r.tasks.filter(t => t.type === 2).reduce((s, t) => s + t.duration, 0), 0
  );
  if (codingMinutes >= 6000 && !newData.achievements[4].unlocked) { // 100小时 * 60分钟
    newData.achievements[4] = {
      ...newData.achievements[4],
      unlocked: true,
      unlockedAt: formatDate(new Date()),
    };
    updated = true;
  }

  // 专注达人 - 100个番茄钟
  const totalPomodoros = newData.dailyRecords.reduce((sum, r) => 
    sum + r.pomodoroSessions.length, 0
  );
  if (totalPomodoros >= 100 && !newData.achievements[5].unlocked) {
    newData.achievements[5] = {
      ...newData.achievements[5],
      unlocked: true,
      unlockedAt: formatDate(new Date()),
    };
    updated = true;
  }

  return updated ? newData : data;
}

// Context 类型
interface AppContextType {
  data: AppData;
  addTaskRecord: (date: string, task: Omit<TaskRecord, 'id' | 'completedAt'>) => void;
  saveMood: (date: string, mood: Mood, note?: string) => void;
  addPomodoroSession: (session: Omit<PomodoroSession, 'id' | 'completedAt'>) => void;
  saveDailyNotes: (date: string, notes: string) => void;
  exportData: () => void;
  importData: (data: AppData) => void;
  resetData: () => void;
}

// 创建 Context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider 组件
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData());

  // 保存数据到 localStorage
  useEffect(() => {
    saveData(data);
  }, [data]);

  // 添加任务记录
  const addTaskRecord = useCallback((date: string, task: Omit<TaskRecord, 'id' | 'completedAt'>) => {
    setData(prevData => {
      const newRecord: TaskRecord = {
        ...task,
        id: generateId(),
        completedAt: new Date().toISOString(),
      };

      const newDailyRecords = [...prevData.dailyRecords];
      const existingIndex = newDailyRecords.findIndex(r => r.date === date);

      if (existingIndex !== -1) {
        newDailyRecords[existingIndex] = {
          ...newDailyRecords[existingIndex],
          tasks: [...newDailyRecords[existingIndex].tasks, newRecord],
        };
      } else {
        newDailyRecords.push({
          date,
          tasks: [newRecord],
          pomodoroSessions: [],
        });
      }

      const newData = {
        ...prevData,
        dailyRecords: newDailyRecords,
      };

      return checkAchievements(newData);
    });
  }, []);

  // 保存心情
  const saveMood = useCallback((date: string, mood: Mood, note?: string) => {
    setData(prevData => {
      const newDailyRecords = [...prevData.dailyRecords];
      const existingIndex = newDailyRecords.findIndex(r => r.date === date);

      if (existingIndex !== -1) {
        newDailyRecords[existingIndex] = {
          ...newDailyRecords[existingIndex],
          mood: { date, mood, note },
        };
      } else {
        newDailyRecords.push({
          date,
          tasks: [],
          mood: { date, mood, note },
          pomodoroSessions: [],
        });
      }

      return {
        ...prevData,
        dailyRecords: newDailyRecords,
      };
    });
  }, []);

  // 添加番茄钟记录
  const addPomodoroSession = useCallback((session: Omit<PomodoroSession, 'id' | 'completedAt'>) => {
    setData(prevData => {
      const today = getTodayString();
      const newSession: PomodoroSession = {
        ...session,
        id: generateId(),
        completedAt: new Date().toISOString(),
      };

      const newDailyRecords = [...prevData.dailyRecords];
      const existingIndex = newDailyRecords.findIndex(r => r.date === today);

      if (existingIndex !== -1) {
        newDailyRecords[existingIndex] = {
          ...newDailyRecords[existingIndex],
          pomodoroSessions: [...newDailyRecords[existingIndex].pomodoroSessions, newSession],
        };
      } else {
        newDailyRecords.push({
          date: today,
          tasks: [],
          pomodoroSessions: [newSession],
        });
      }

      const newData = {
        ...prevData,
        dailyRecords: newDailyRecords,
      };

      return checkAchievements(newData);
    });
  }, []);

  // 保存每日感悟
  const saveDailyNotes = useCallback((date: string, notes: string) => {
    setData(prevData => {
      const newDailyRecords = [...prevData.dailyRecords];
      const existingIndex = newDailyRecords.findIndex(r => r.date === date);

      if (existingIndex !== -1) {
        newDailyRecords[existingIndex] = {
          ...newDailyRecords[existingIndex],
          dailyNotes: notes,
        };
      } else {
        newDailyRecords.push({
          date,
          tasks: [],
          pomodoroSessions: [],
          dailyNotes: notes,
        });
      }

      return {
        ...prevData,
        dailyRecords: newDailyRecords,
      };
    });
  }, []);

  // 导出数据
  const exportData = useCallback(() => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileName = `growth-tracker-data-${formatDate(new Date())}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
  }, [data]);

  // 导入数据
  const importData = useCallback((newData: AppData) => {
    setData(newData);
  }, []);

  // 重置数据
  const resetData = useCallback(() => {
    if (confirm('确定要重置所有数据吗？此操作不可恢复！')) {
      setData(createDefaultData());
    }
  }, []);

  return (
    <AppContext.Provider value={{
      data,
      addTaskRecord,
      saveMood,
      addPomodoroSession,
      saveDailyNotes,
      exportData,
      importData,
      resetData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
