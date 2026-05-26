'use client';

import Link from 'next/link';
import { PageContainer } from '../components/layout/PageContainer';
import { MoodTracker } from '../components/features/MoodTracker';
import { TaskCard } from '../components/features/TaskCard';
import { StatCard } from '../components/features/StatCard';
import { useApp } from '../lib/storage';
import { getTodayString, calculateStreak } from '../lib/utils';
import { Calendar, Trophy, Timer } from 'lucide-react';

export default function Home() {
  const { data, addTaskRecord, saveMood } = useApp();
  const today = getTodayString();
  const todayRecord = data.dailyRecords.find(r => r.date === today);

  // 问候语
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '早上好';
    if (hour < 18) return '下午好';
    return '晚上好';
  };

  // 今日任务完成情况
  const todayTasks = todayRecord?.tasks || [];
  const completedTaskTypes = new Set(todayTasks.map(t => t.type));

  // 统计信息
  const totalRecords = data.dailyRecords.length;
  const streak = calculateStreak(data.dailyRecords);
  const totalPomodoros = data.dailyRecords.reduce((sum, r) => sum + r.pomodoroSessions.length, 0);

  return (
    <PageContainer>
      {/* 标题和问候 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{getGreeting()}</h1>
        <p className="text-muted-foreground mt-1">
          {new Date().toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
          })}
        </p>
      </div>

      {/* 心情选择 */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">今天心情如何？</h2>
        <MoodTracker
          currentMood={todayRecord?.mood?.mood}
          onSelect={(mood) => saveMood(today, mood)}
        />
      </div>

      {/* 任务打卡 */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">今日打卡</h2>
        <div className="grid grid-cols-2 gap-4">
          {data.taskTypes.map((taskType) => (
            <TaskCard
              key={taskType.id}
              taskType={taskType}
              completedToday={completedTaskTypes.has(taskType.id)}
              onComplete={() =>
                addTaskRecord(today, {
                  type: taskType.id,
                  completed: true,
                  duration: taskType.defaultDuration,
                  tags: [],
                })
              }
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
    </PageContainer>
  );
}
