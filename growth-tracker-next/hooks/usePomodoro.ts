'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { POMODORO_DURATION, SHORT_BREAK_DURATION, LONG_BREAK_DURATION } from '../lib/constants';

type PomodoroMode = 'focus' | 'shortBreak' | 'longBreak';

export function usePomodoro(onComplete?: () => void) {
  const [mode, setMode] = useState<PomodoroMode>('focus');
  const [timeLeft, setTimeLeft] = useState(POMODORO_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [customDurations, setCustomDurations] = useState({
    focus: POMODORO_DURATION,
    shortBreak: SHORT_BREAK_DURATION,
    longBreak: LONG_BREAK_DURATION,
  });
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 切换模式
  const switchMode = useCallback((newMode: PomodoroMode) => {
    if (!isRunning) {
      setMode(newMode);
      setTimeLeft(customDurations[newMode]);
    }
  }, [customDurations, isRunning]);

  // 设置自定义时长
  const setCustomDuration = useCallback((m: PomodoroMode, duration: number) => {
    if (!isRunning) {
      setCustomDurations(prev => ({
        ...prev,
        [m]: Math.max(1, duration),
      }));
      if (m === mode) {
        setTimeLeft(Math.max(1, duration));
      }
    }
  }, [mode, isRunning]);

  // 开始/暂停
  const toggleTimer = useCallback(() => {
    setIsRunning(prev => !prev);
  }, []);

  // 重置
  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(customDurations[mode]);
  }, [mode, customDurations]);

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
        setMode('longBreak');
        setTimeLeft(customDurations.longBreak);
      } else {
        setMode('shortBreak');
        setTimeLeft(customDurations.shortBreak);
      }
    } else {
      setMode('focus');
      setTimeLeft(customDurations.focus);
    }
  }, [mode, sessionsCompleted, customDurations, onComplete]);

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
    customDurations,
    switchMode,
    toggleTimer,
    resetTimer,
    setCustomDuration,
  };
}
