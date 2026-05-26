'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { POMODORO_DURATION, SHORT_BREAK_DURATION, LONG_BREAK_DURATION } from '../lib/constants';

type PomodoroMode = 'focus' | 'shortBreak' | 'longBreak';

export function usePomodoro(onComplete?: () => void) {
  const [mode, setMode] = useState<PomodoroMode>('focus');
  const [timeLeft, setTimeLeft] = useState(POMODORO_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 根据模式获取时长
  const getDuration = useCallback((m: PomodoroMode): number => {
    switch (m) {
      case 'focus':
        return POMODORO_DURATION;
      case 'shortBreak':
        return SHORT_BREAK_DURATION;
      case 'longBreak':
        return LONG_BREAK_DURATION;
      default:
        return POMODORO_DURATION;
    }
  }, []);

  // 切换模式
  const switchMode = useCallback((newMode: PomodoroMode) => {
    setMode(newMode);
    setTimeLeft(getDuration(newMode));
    setIsRunning(false);
  }, [getDuration]);

  // 开始/暂停
  const toggleTimer = useCallback(() => {
    setIsRunning(prev => !prev);
  }, []);

  // 重置
  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(getDuration(mode));
  }, [mode, getDuration]);

  // 完成一个番茄钟
  const completeSession = useCallback(() => {
    setIsRunning(false);
    setSessionsCompleted(prev => prev + 1);

    if (mode === 'focus' && onComplete) {
      onComplete();
    }

    // 每4个番茄钟后是长休息
    if (mode === 'focus') {
      const newSessions = sessionsCompleted + 1;
      if (newSessions % 4 === 0) {
        switchMode('longBreak');
      } else {
        switchMode('shortBreak');
      }
    } else {
      switchMode('focus');
    }
  }, [mode, sessionsCompleted, switchMode, onComplete]);

  // 计时器逻辑
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      completeSession();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, timeLeft, completeSession]);

  return {
    mode,
    timeLeft,
    isRunning,
    sessionsCompleted,
    switchMode,
    toggleTimer,
    resetTimer,
  };
}
