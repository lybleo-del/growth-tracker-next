'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { PageContainer } from '@/components/layout/PageContainer';
import { useApp } from '@/lib/storage';
import { getTodayString } from '@/lib/utils';
import { Calendar as CalendarIcon, BarChart3, CheckCircle2, Timer } from 'lucide-react';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#fa709a'];

type TimeRange = 'week' | 'month' | 'year';
type ViewMode = 'overview' | 'daily';

export default function StatsPage() {
  const { data } = useApp();
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  // 图表依赖真实 DOM 尺寸，构建时静态预渲染阶段容器宽高为 -1 会触发 recharts 警告，
  // 因此仅在客户端挂载后渲染图表。
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const selectedRecord = data.dailyRecords.find(r => r.date === selectedDate);

  // 趋势图数据
  const getTrendData = () => {
    const sortedRecords = [...data.dailyRecords].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let limit = 7;
    if (timeRange === 'month') limit = 30;
    if (timeRange === 'year') limit = 365;

    return sortedRecords.slice(-limit).map((record) => ({
      date: record.date.slice(5), // MM-DD
      tasks: record.tasks.length,
    }));
  };

  // 任务分布数据
  const getDistributionData = () => {
    const counts: Record<number, number> = {};
    data.taskTypes.forEach((type) => (counts[type.id] = 0));

    data.dailyRecords.forEach((record) => {
      record.tasks.forEach((task) => {
        counts[task.type] = (counts[task.type] || 0) + 1;
      });
    });

    return data.taskTypes.map((type) => ({
      name: type.name,
      value: counts[type.id] || 0,
      color: type.color,
    }));
  };

  const trendData = getTrendData();
  const distributionData = getDistributionData();

  return (
    <PageContainer>
      <h1 className="text-2xl font-bold mb-6">统计分析</h1>

      {/* 视图切换 */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setViewMode('overview')}
          className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            viewMode === 'overview'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          总览
        </button>
        <button
          onClick={() => setViewMode('daily')}
          className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            viewMode === 'daily'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          日详情
        </button>
      </div>

      {/* 日详情视图 */}
      {viewMode === 'daily' && (
        <div className="mb-6">
          {/* 日期选择 */}
          <div className="bg-card border border-border rounded-2xl p-4 mb-4">
            <label className="text-sm text-muted-foreground mb-2 block">选择日期</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 bg-muted rounded-xl border border-border focus:border-primary focus:outline-none"
            />
          </div>

          {/* 当日详情 */}
          {selectedRecord ? (
            <div className="bg-card border border-border rounded-2xl p-4">
              <h3 className="font-semibold mb-4">
                {new Date(selectedDate).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </h3>

              {/* 心情 */}
              {selectedRecord.mood && (
                <div className="mb-4 p-3 bg-muted rounded-xl">
                  <div className="text-sm text-muted-foreground mb-2">心情</div>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{selectedRecord.mood.mood}</span>
                    {selectedRecord.mood.note && (
                      <span className="text-sm">{selectedRecord.mood.note}</span>
                    )}
                  </div>
                </div>
              )}

              {/* 打卡任务 */}
              <div className="mb-4">
                <div className="text-sm text-muted-foreground mb-2">
                  打卡任务 ({selectedRecord.tasks.length})
                </div>
                <div className="space-y-2">
                  {selectedRecord.tasks.map((task) => {
                    const taskType = data.taskTypes.find(t => t.id === task.type);
                    return (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 p-3 bg-muted rounded-xl"
                      >
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-xl"
                          style={{ backgroundColor: taskType?.color + '20' }}
                        >
                          {taskType?.icon}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{taskType?.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {task.duration}分钟
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 番茄钟 */}
              {selectedRecord.pomodoroSessions.length > 0 && (
                <div>
                  <div className="text-sm text-muted-foreground mb-2">
                    专注 ({selectedRecord.pomodoroSessions.length}个番茄钟)
                  </div>
                  <div className="space-y-2">
                    {selectedRecord.pomodoroSessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center gap-3 p-3 bg-muted rounded-xl"
                      >
                        <Timer className="w-5 h-5 text-primary" />
                        <div className="flex-1">
                          <div className="font-medium">专注 {session.duration}分钟</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(session.completedAt).toLocaleTimeString('zh-CN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 每日感悟 */}
              {selectedRecord.dailyNotes && (
                <div className="mt-4 p-3 bg-muted rounded-xl">
                  <div className="text-sm text-muted-foreground mb-2">每日感悟</div>
                  <div className="text-sm">{selectedRecord.dailyNotes}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <div className="text-4xl mb-3">📅</div>
              <div className="text-muted-foreground">
                {selectedDate === getTodayString()
                  ? '今天还没有记录'
                  : '该日期暂无记录'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 总览视图 */}
      {viewMode === 'overview' && (
        <>
      {/* 时间范围切换 */}
      <div className="flex gap-2 mb-6">
        {(['week', 'month', 'year'] as TimeRange[]).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              timeRange === range
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            {range === 'week' ? '本周' : range === 'month' ? '本月' : '今年'}
          </button>
        ))}
      </div>

      {/* 趋势图 */}
      <div className="bg-card border border-border rounded-2xl p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">任务完成趋势</h2>
        <div className="h-64">
          {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '0.5rem',
                }}
              />
              <Line
                type="monotone"
                dataKey="tasks"
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={{ fill: 'var(--color-primary)' }}
              />
            </LineChart>
          </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 分布图 */}
      <div className="bg-card border border-border rounded-2xl p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">任务分布</h2>
        <div className="h-64">
          {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 成就展示 */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <h2 className="text-lg font-semibold mb-4">成就</h2>
        <div className="grid grid-cols-2 gap-3">
          {data.achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-xl border-2 ${
                achievement.unlocked
                  ? 'border-yellow-400/50 bg-yellow-400/10'
                  : 'border-border opacity-50'
              }`}
            >
              <div className="text-3xl mb-2">{achievement.icon}</div>
              <div className="font-semibold">{achievement.name}</div>
              <div className="text-xs text-muted-foreground">
                {achievement.description}
              </div>
            </div>
          ))}
        </div>
      </div>
        </>
      )}
    </PageContainer>
  );
}
