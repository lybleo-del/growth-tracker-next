'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/PageContainer';
import { MoodTracker } from '@/components/features/MoodTracker';
import { TaskCard } from '@/components/features/TaskCard';
import { StatCard } from '@/components/features/StatCard';
import { TaskConfigModal } from '@/components/features/TaskConfigModal';
import { useApp } from '@/lib/storage';
import { getTodayString, calculateStreak, countCheckInDays } from '@/lib/utils';
import { Calendar, Trophy, Timer, Settings, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Home() {
  const { data, addTaskRecord, removeTaskRecord, saveMood, clearMood, updateTaskType, addTaskType, deleteTaskType } = useApp();
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [showConfig, setShowConfig] = useState(false);

  const selectedRecord = data.dailyRecords.find(r => r.date === selectedDate);

  // 问候语
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '早上好';
    if (hour < 18) return '下午好';
    return '晚上好';
  };

  // 日期导航
  const changeDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  // 判断是否是今天
  const isToday = selectedDate === getTodayString();

  // 今日任务完成情况
  const selectedTasks = selectedRecord?.tasks || [];
  const completedTaskTypes = new Set(selectedTasks.map(t => t.type));

  // 统计信息
  const totalRecords = countCheckInDays(data.dailyRecords);
  const streak = calculateStreak(data.dailyRecords);
  const totalPomodoros = data.dailyRecords.reduce((sum, r) => sum + r.pomodoroSessions.length, 0);

  return (
    <PageContainer>
      {/* 标题和问候 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{getGreeting()}</h1>
        <p className="text-muted-foreground mt-1">
          {new Date(selectedDate).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
          })}
        </p>
      </div>

      {/* 日期选择器 */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => changeDate(-1)}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          {isToday && (
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
              今天
            </span>
          )}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 bg-muted rounded-lg border border-border focus:border-primary focus:outline-none"
          />
        </div>
        <button
          onClick={() => changeDate(1)}
          disabled={isToday}
          className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-30"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* 心情选择 */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">今天心情如何？</h2>
        <MoodTracker
          currentMood={selectedRecord?.mood?.mood}
          onSelect={(mood) => saveMood(selectedDate, mood)}
          onClear={() => clearMood(selectedDate)}
        />
      </div>

      {/* 任务打卡 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">打卡记录</h2>
          <button
            onClick={() => setShowConfig(true)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="任务配置"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {data.taskTypes.map((taskType) => (
            <TaskCard
              key={taskType.id}
              taskType={taskType}
              completedToday={completedTaskTypes.has(taskType.id)}
              onClick={() => {
                const existing = selectedTasks.find(t => t.type === taskType.id);
                if (existing) {
                  if (confirm(`取消「${taskType.name}」的打卡？`)) {
                    removeTaskRecord(selectedDate, existing.id);
                  }
                } else {
                  addTaskRecord(selectedDate, {
                    type: taskType.id,
                    completed: true,
                    duration: taskType.defaultDuration,
                    tags: [],
                  });
                }
              }}
            />
          ))}
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-3 mb-20">
        <StatCard
          title="打卡天数"
          value={totalRecords}
          icon={<Calendar className="w-5 h-5" />}
        />
        <StatCard
          title="连续打卡"
          value={`${streak}天`}
          icon={<Trophy className="w-5 h-5" />}
        />
        <StatCard
          title="番茄钟"
          value={totalPomodoros}
          icon={<Timer className="w-5 h-5" />}
        />
      </div>

      {/* 浮动按钮 - 快速进入专注 */}
      <Link href="/focus" className="fixed bottom-24 right-4 bg-primary text-primary-foreground rounded-full p-4 shadow-lg hover:scale-105 transition-all">
        <Timer className="w-6 h-6" />
      </Link>

      {/* 任务配置弹窗 */}
      <TaskConfigModal
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
        taskTypes={data.taskTypes}
        onUpdateTask={updateTaskType}
        onAddTask={addTaskType}
        onDeleteTask={deleteTaskType}
      />
    </PageContainer>
  );
}
