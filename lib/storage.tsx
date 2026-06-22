'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import type { AppData, TaskRecord, Mood, PomodoroSession, TaskType } from './types';
import { DEFAULT_TASK_TYPES, DEFAULT_ACHIEVEMENTS, STORAGE_KEY } from './constants';
import { generateId, formatDate, getTodayString, calculateStreak } from './utils';
import { migrateLegacyData } from './migration';
import {
  supabaseCreateUserIfNotExists,
  supabaseGetUserData,
  supabaseSaveDailyRecord,
  supabaseAddTaskRecord,
  supabaseSaveMood,
  supabaseAddPomodoroSession,
  supabaseUpdateAchievement,
  supabaseUpdateTaskType,
  supabaseAddTaskType,
  supabaseDeleteTaskType,
} from './supabase';

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

function loadDataFromLocal(): AppData {
  if (typeof window === 'undefined') return createDefaultData();

  try {
    const migrated = migrateLegacyData();
    if (migrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
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

function saveDataToLocal(data: AppData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function checkAchievements(data: AppData): AppData {
  const newData = { ...data };
  let updated = false;

  const totalTasks = newData.dailyRecords.reduce((sum, r) => sum + r.tasks.length, 0);
  if (totalTasks > 0 && !newData.achievements[0].unlocked) {
    newData.achievements[0] = {
      ...newData.achievements[0],
      unlocked: true,
      unlockedAt: formatDate(new Date()),
    };
    updated = true;
  }

  const streak = calculateStreak(newData.dailyRecords);
  if (streak >= 7 && !newData.achievements[1].unlocked) {
    newData.achievements[1] = {
      ...newData.achievements[1],
      unlocked: true,
      unlockedAt: formatDate(new Date()),
    };
    updated = true;
  }

  if (newData.dailyRecords.length >= 30 && !newData.achievements[2].unlocked) {
    newData.achievements[2] = {
      ...newData.achievements[2],
      unlocked: true,
      unlockedAt: formatDate(new Date()),
    };
    updated = true;
  }

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

  const codingMinutes = newData.dailyRecords.reduce((sum, r) => 
    sum + r.tasks.filter(t => t.type === 2).reduce((s, t) => s + t.duration, 0), 0
  );
  if (codingMinutes >= 6000 && !newData.achievements[4].unlocked) {
    newData.achievements[4] = {
      ...newData.achievements[4],
      unlocked: true,
      unlockedAt: formatDate(new Date()),
    };
    updated = true;
  }

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

interface AppContextType {
  data: AppData;
  isLoading: boolean;
  isCloudSyncEnabled: boolean;
  toggleCloudSync: () => void;
  addTaskRecord: (date: string, task: Omit<TaskRecord, 'id' | 'completedAt'>) => void;
  removeTaskRecord: (date: string, recordId: string) => void;
  updateTaskRecord: (date: string, recordId: string, updates: Partial<Pick<TaskRecord, 'duration' | 'notes' | 'tags'>>) => void;
  saveMood: (date: string, mood: Mood, note?: string) => void;
  clearMood: (date: string) => void;
  addPomodoroSession: (session: Omit<PomodoroSession, 'id' | 'completedAt'>) => void;
  saveDailyNotes: (date: string, notes: string) => void;
  exportData: () => void;
  importData: (data: AppData) => void;
  resetData: () => void;
  updateTaskType: (id: number, updates: Partial<TaskType>) => void;
  addTaskType: (taskType: Omit<TaskType, 'id'>) => void;
  deleteTaskType: (id: number) => void;
  syncFromCloud: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadDataFromLocal());
  const [isLoading, setIsLoading] = useState(false);
  const [isCloudSyncEnabled, setIsCloudSyncEnabled] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('cloudSyncEnabled') === 'true';
  });

  useEffect(() => {
    saveDataToLocal(data);
    localStorage.setItem('cloudSyncEnabled', String(isCloudSyncEnabled));
  }, [data, isCloudSyncEnabled]);

  useEffect(() => {
    if (isCloudSyncEnabled && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      syncFromCloud();
    }
  }, [isCloudSyncEnabled]);

  const syncFromCloud = useCallback(async () => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    
    setIsLoading(true);
    try {
      const userId = data.user.id;
      await supabaseCreateUserIfNotExists(userId, data.user.name);
      
      const cloudData = await supabaseGetUserData(userId);
      
      if (cloudData.taskTypes.length > 0 || cloudData.dailyRecords.length > 0) {
        setData(prev => ({
          ...prev,
          taskTypes: cloudData.taskTypes.length > 0 ? cloudData.taskTypes : prev.taskTypes,
          achievements: cloudData.achievements.length > 0 ? cloudData.achievements : prev.achievements,
          dailyRecords: cloudData.dailyRecords.length > 0 ? cloudData.dailyRecords : prev.dailyRecords,
        }));
      }
    } catch (error) {
      console.error('Failed to sync from cloud:', error);
    } finally {
      setIsLoading(false);
    }
  }, [data.user.id, data.user.name]);

  const toggleCloudSync = useCallback(() => {
    setIsCloudSyncEnabled(prev => !prev);
  }, []);

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

      if (isCloudSyncEnabled && process.env.NEXT_PUBLIC_SUPABASE_URL) {
        supabaseAddTaskRecord(prevData.user.id, date, {
          type: task.type,
          duration: task.duration,
          notes: task.notes,
          tags: task.tags,
        }).catch(console.error);
      }

      return checkAchievements(newData);
    });
  }, [isCloudSyncEnabled]);

  // 删除某条打卡记录（取消打卡）。云同步关闭时仅作用于本地数据。
  const removeTaskRecord = useCallback((date: string, recordId: string) => {
    setData(prevData => ({
      ...prevData,
      dailyRecords: prevData.dailyRecords.map(r =>
        r.date === date ? { ...r, tasks: r.tasks.filter(t => t.id !== recordId) } : r
      ),
    }));
  }, []);

  // 调整某条打卡记录（如修改实际时长）。云同步关闭时仅作用于本地数据。
  const updateTaskRecord = useCallback((date: string, recordId: string, updates: Partial<Pick<TaskRecord, 'duration' | 'notes' | 'tags'>>) => {
    setData(prevData => ({
      ...prevData,
      dailyRecords: prevData.dailyRecords.map(r =>
        r.date === date
          ? { ...r, tasks: r.tasks.map(t => (t.id === recordId ? { ...t, ...updates } : t)) }
          : r
      ),
    }));
  }, []);

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

      if (isCloudSyncEnabled && process.env.NEXT_PUBLIC_SUPABASE_URL) {
        supabaseSaveMood(prevData.user.id, date, mood, note).catch(console.error);
      }

      return {
        ...prevData,
        dailyRecords: newDailyRecords,
      };
    });
  }, [isCloudSyncEnabled]);

  // 清除某天的心情（取消选择）。云同步关闭时仅作用于本地数据。
  const clearMood = useCallback((date: string) => {
    setData(prevData => ({
      ...prevData,
      dailyRecords: prevData.dailyRecords.map(r =>
        r.date === date ? { ...r, mood: undefined } : r
      ),
    }));
  }, []);

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

      if (isCloudSyncEnabled && process.env.NEXT_PUBLIC_SUPABASE_URL) {
        supabaseAddPomodoroSession(prevData.user.id, today, session.duration, session.taskType).catch(console.error);
      }

      const newData = {
        ...prevData,
        dailyRecords: newDailyRecords,
      };

      return checkAchievements(newData);
    });
  }, [isCloudSyncEnabled]);

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

      if (isCloudSyncEnabled && process.env.NEXT_PUBLIC_SUPABASE_URL) {
        supabaseSaveDailyRecord(prevData.user.id, date, notes).catch(console.error);
      }

      return {
        ...prevData,
        dailyRecords: newDailyRecords,
      };
    });
  }, [isCloudSyncEnabled]);

  const exportData = useCallback(() => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileName = `growth-tracker-data-${formatDate(new Date())}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
  }, [data]);

  const importData = useCallback((newData: AppData) => {
    setData(newData);
  }, []);

  const resetData = useCallback(() => {
    if (confirm('确定要重置所有数据吗？此操作不可恢复！')) {
      setData(createDefaultData());
    }
  }, []);

  const updateTaskType = useCallback((id: number, updates: Partial<TaskType>) => {
    setData(prevData => {
      const newData = {
        ...prevData,
        taskTypes: prevData.taskTypes.map(type =>
          type.id === id ? { ...type, ...updates } : type
        ),
      };

      if (isCloudSyncEnabled && process.env.NEXT_PUBLIC_SUPABASE_URL) {
        const supabaseUpdates: { name?: string; icon?: string; color?: string; default_duration?: number } = {};
        if (updates.name) supabaseUpdates.name = updates.name;
        if (updates.icon) supabaseUpdates.icon = updates.icon;
        if (updates.color) supabaseUpdates.color = updates.color;
        if (updates.defaultDuration !== undefined) supabaseUpdates.default_duration = updates.defaultDuration;
        supabaseUpdateTaskType(prevData.user.id, id, supabaseUpdates).catch(console.error);
      }

      return newData;
    });
  }, [isCloudSyncEnabled]);

  const addTaskType = useCallback((taskType: Omit<TaskType, 'id'>) => {
    setData(prevData => {
      const maxId = Math.max(...prevData.taskTypes.map(t => t.id));
      const newTaskType = { ...taskType, id: maxId + 1 };

      if (isCloudSyncEnabled && process.env.NEXT_PUBLIC_SUPABASE_URL) {
        supabaseAddTaskType(prevData.user.id, {
          name: taskType.name,
          icon: taskType.icon,
          color: taskType.color,
          default_duration: taskType.defaultDuration,
        }).catch(console.error);
      }

      return {
        ...prevData,
        taskTypes: [...prevData.taskTypes, newTaskType],
      };
    });
  }, [isCloudSyncEnabled]);

  const deleteTaskType = useCallback((id: number) => {
    setData(prevData => {
      if (isCloudSyncEnabled && process.env.NEXT_PUBLIC_SUPABASE_URL) {
        supabaseDeleteTaskType(prevData.user.id, id).catch(console.error);
      }

      return {
        ...prevData,
        taskTypes: prevData.taskTypes.filter(type => type.id !== id),
      };
    });
  }, [isCloudSyncEnabled]);

  return (
    <AppContext.Provider value={{
      data,
      isLoading,
      isCloudSyncEnabled,
      toggleCloudSync,
      addTaskRecord,
      removeTaskRecord,
      updateTaskRecord,
      saveMood,
      clearMood,
      addPomodoroSession,
      saveDailyNotes,
      exportData,
      importData,
      resetData,
      updateTaskType,
      addTaskType,
      deleteTaskType,
      syncFromCloud,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}