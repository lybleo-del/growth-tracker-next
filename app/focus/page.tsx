'use client';

import { useState } from 'react';
import { usePomodoro } from '@/hooks/usePomodoro';
import { useWhiteNoise } from '@/hooks/useWhiteNoise';
import { PageContainer } from '@/components/layout/PageContainer';
import { formatTime } from '@/lib/utils';
import { useApp } from '@/lib/storage';
import { WHITE_NOISES } from '@/lib/constants';
import { Play, Pause, RotateCcw, Coffee, Focus, Volume2, VolumeX, Settings, Clock } from 'lucide-react';

export default function FocusPage() {
  const { addPomodoroSession } = useApp();
  const { isPlaying, currentNoise, volume, play, stop, setVolume } = useWhiteNoise();

  const handleSessionComplete = () => {
    addPomodoroSession({ duration: 25 });
  };

  const { 
    mode, 
    timeLeft, 
    isRunning, 
    customDurations, 
    switchMode, 
    toggleTimer, 
    resetTimer, 
    setCustomDuration 
  } = usePomodoro(handleSessionComplete);

  const totalTime = customDurations[mode];
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  const [showSettings, setShowSettings] = useState(true);

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">专注模式</h1>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 rounded-lg transition-colors ${
            showSettings ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
          }`}
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {showSettings && (
        <div className="bg-card border border-border rounded-2xl p-4 mb-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            时长设置（分钟）
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="text-sm w-20">专注</label>
              <button
                onClick={() => setCustomDuration('focus', customDurations.focus - 60)}
                disabled={isRunning}
                className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center disabled:opacity-50 text-lg font-bold"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max="120"
                value={Math.floor(customDurations.focus / 60)}
                onChange={(e) => setCustomDuration('focus', parseInt(e.target.value) * 60)}
                disabled={isRunning}
                className="flex-1 px-3 py-2 bg-muted rounded-lg border border-border text-center font-medium disabled:opacity-50"
              />
              <button
                onClick={() => setCustomDuration('focus', customDurations.focus + 60)}
                disabled={isRunning}
                className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center disabled:opacity-50 text-lg font-bold"
              >
                +
              </button>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm w-20">短休息</label>
              <button
                onClick={() => setCustomDuration('shortBreak', customDurations.shortBreak - 60)}
                disabled={isRunning}
                className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center disabled:opacity-50 text-lg font-bold"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max="30"
                value={Math.floor(customDurations.shortBreak / 60)}
                onChange={(e) => setCustomDuration('shortBreak', parseInt(e.target.value) * 60)}
                disabled={isRunning}
                className="flex-1 px-3 py-2 bg-muted rounded-lg border border-border text-center font-medium disabled:opacity-50"
              />
              <button
                onClick={() => setCustomDuration('shortBreak', customDurations.shortBreak + 60)}
                disabled={isRunning}
                className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center disabled:opacity-50 text-lg font-bold"
              >
                +
              </button>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm w-20">长休息</label>
              <button
                onClick={() => setCustomDuration('longBreak', customDurations.longBreak - 60)}
                disabled={isRunning}
                className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center disabled:opacity-50 text-lg font-bold"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max="60"
                value={Math.floor(customDurations.longBreak / 60)}
                onChange={(e) => setCustomDuration('longBreak', parseInt(e.target.value) * 60)}
                disabled={isRunning}
                className="flex-1 px-3 py-2 bg-muted rounded-lg border border-border text-center font-medium disabled:opacity-50"
              />
              <button
                onClick={() => setCustomDuration('longBreak', customDurations.longBreak + 60)}
                disabled={isRunning}
                className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center disabled:opacity-50 text-lg font-bold"
              >
                +
              </button>
            </div>
            {isRunning && (
              <p className="text-sm text-primary text-center font-medium">
                ⏸️ 计时进行中，暂停后可修改时长
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-8 justify-center">
        <button
          onClick={() => switchMode('focus')}
          disabled={isRunning}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50 ${
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
          disabled={isRunning}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50 ${
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
          disabled={isRunning}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50 ${
            mode === 'longBreak'
              ? 'bg-blue-500 text-white'
              : 'bg-muted hover:bg-muted/80'
          }`}
        >
          长休息
        </button>
      </div>

      <div className="flex flex-col items-center mb-8">
        <div className="relative w-64 h-64">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="var(--color-muted)"
              strokeWidth="8"
            />
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

      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">白噪音</h2>
          {isPlaying && (
            <button
              onClick={stop}
              className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
            >
              <VolumeX className="w-4 h-4" />
              停止
            </button>
          )}
        </div>
        
        {isPlaying && (
          <div className="mb-4 flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-muted-foreground" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="flex-1 h-3 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <span className="text-sm text-muted-foreground w-12 text-right font-medium">
              {Math.round(volume * 100)}%
            </span>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2">
          {WHITE_NOISES.map((noise) => (
            <button
              key={noise.id}
              onClick={() => play(noise.id as any)}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                currentNoise === noise.id && isPlaying
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              <span>{noise.emoji}</span>
              <span className="text-sm">{noise.name}</span>
              {currentNoise === noise.id && isPlaying && (
                <span className="ml-1 animate-pulse">
                  <Volume2 className="w-4 h-4" />
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
