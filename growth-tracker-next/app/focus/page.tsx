'use client';

import { usePomodoro } from '../../hooks/usePomodoro';
import { PageContainer } from '../../components/layout/PageContainer';
import { formatTime } from '../../lib/utils';
import { useApp } from '../../lib/storage';
import { WHITE_NOISES } from '../../lib/constants';
import { Play, Pause, RotateCcw, Coffee, Focus } from 'lucide-react';

export default function FocusPage() {
  const { addPomodoroSession } = useApp();

  const handleSessionComplete = () => {
    addPomodoroSession({ duration: 25 });
  };

  const { mode, timeLeft, isRunning, switchMode, toggleTimer, resetTimer } = usePomodoro(handleSessionComplete);

  // 计算进度百分比
  const totalTime = mode === 'focus' ? 25 * 60 : mode === 'shortBreak' ? 5 * 60 : 15 * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <PageContainer>
      <h1 className="text-2xl font-bold mb-6">专注模式</h1>

      {/* 模式切换 */}
      <div className="flex gap-2 mb-8 justify-center">
        <button
          onClick={() => switchMode('focus')}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
            mode === 'focus'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80'
          }`}
        >
          <Focus className="w-4 h-4" />
          专注
        </button>
        <button
          onClick={() => switchMode('shortBreak')}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
            mode === 'shortBreak'
              ? 'bg-green-500 text-white'
              : 'bg-muted hover:bg-muted/80'
          }`}
        >
          <Coffee className="w-4 h-4" />
          短休息
        </button>
        <button
          onClick={() => switchMode('longBreak')}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
            mode === 'longBreak'
              ? 'bg-blue-500 text-white'
              : 'bg-muted hover:bg-muted/80'
          }`}
        >
          长休息
        </button>
      </div>

      {/* 计时器 */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative w-64 h-64">
          {/* 背景圆环 */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="var(--color-muted)"
              strokeWidth="8"
            />
            {/* 进度圆环 */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={mode === 'focus' ? 'var(--color-primary)' : mode === 'shortBreak' ? '#22c55e' : '#3b82f6'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="283"
              strokeDashoffset={283 - (283 * progress) / 100}
              style={{ transition: 'stroke-dashoffset 0.3s ease' }}
            />
          </svg>
          {/* 时间显示 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold">
              {formatTime(timeLeft)}
            </span>
            <span className="text-muted-foreground mt-2">
              {mode === 'focus' ? '专注时间' : mode === 'shortBreak' ? '短休息' : '长休息'}
            </span>
          </div>
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="flex gap-4 justify-center mb-8">
        <button
          onClick={toggleTimer}
          className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 transition-all"
        >
          {isRunning ? (
            <Pause className="w-8 h-8" />
          ) : (
            <Play className="w-8 h-8 ml-1" />
          )}
        </button>
        <button
          onClick={resetTimer}
          className="w-16 h-16 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-all"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
      </div>

      {/* 白噪音（UI占位） */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <h2 className="text-lg font-semibold mb-4">白噪音</h2>
        <div className="flex flex-wrap gap-2">
          {WHITE_NOISES.map((noise) => (
            <button
              key={noise.id}
              className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-all flex items-center gap-2"
            >
              <span>{noise.emoji}</span>
              <span className="text-sm">{noise.name}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          提示：白噪音功能需要音频支持
        </p>
      </div>
    </PageContainer>
  );
}
