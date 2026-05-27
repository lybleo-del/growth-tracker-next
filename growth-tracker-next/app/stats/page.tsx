'use client';

import { useState } from 'react';
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
import { PageContainer } from '../../components/layout/PageContainer';
import { useApp } from '../../lib/storage';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#fa709a'];

type TimeRange = 'week' | 'month' | 'year';

export default function StatsPage() {
  const { data } = useApp();
  const [timeRange, setTimeRange] = useState<TimeRange>('week');

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
        </div>
      </div>

      {/* 分布图 */}
      <div className="bg-card border border-border rounded-2xl p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">任务分布</h2>
        <div className="h-64">
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
    </PageContainer>
  );
}
