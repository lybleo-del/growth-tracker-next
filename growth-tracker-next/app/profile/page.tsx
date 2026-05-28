'use client';

import { useState } from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { useApp } from '../../lib/storage';
import { useTheme } from '../../hooks/useTheme';
import { User, Trash2, Settings, Sun, Moon, Cloud, CloudOff, RefreshCw, ChevronDown, ChevronUp, History } from 'lucide-react';

export default function ProfilePage() {
  const { data, resetData, isCloudSyncEnabled, toggleCloudSync, syncFromCloud, isLoading } = useApp();
  const { theme, toggleTheme } = useTheme();
  const [showChangelog, setShowChangelog] = useState(false);

  const handleReset = () => {
    if (confirm('确定要重置所有数据吗？此操作不可恢复！')) {
      resetData();
    }
  };

  const changelog = [
    {
      version: 'v2.0.0',
      date: '2026-05-27',
      changes: [
        '使用 Next.js 重写整个应用',
        '支持 PWA 离线使用',
        '新增云端同步功能',
        '优化 UI 设计和交互体验'
      ]
    },
    {
      version: 'v1.5.0',
      date: '2026-04-15',
      changes: [
        '新增成就系统',
        '优化任务管理功能',
        '添加专注模式计时器'
      ]
    },
    {
      version: 'v1.0.0',
      date: '2026-03-01',
      changes: [
        '初始版本发布',
        '支持日常打卡记录',
        '支持任务管理',
        '支持数据统计'
      ]
    }
  ];

  return (
    <PageContainer>
      <h1 className="text-2xl font-bold mb-6">个人中心</h1>

      {/* 用户信息 */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{data.user.name}</h2>
            <p className="text-muted-foreground text-sm">
              加入于 {data.user.createdAt}
            </p>
          </div>
        </div>

        {/* 统计概览 */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
          <div className="text-center">
            <div className="text-2xl font-bold">{data.dailyRecords.length}</div>
            <div className="text-xs text-muted-foreground">打卡天数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {data.dailyRecords.reduce((sum, r) => sum + r.tasks.length, 0)}
            </div>
            <div className="text-xs text-muted-foreground">任务总数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {data.achievements.filter(a => a.unlocked).length}
            </div>
            <div className="text-xs text-muted-foreground">解锁成就</div>
          </div>
        </div>
      </div>

      {/* 设置 */}
      <div className="bg-card border border-border rounded-2xl p-4 mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          设置
        </h3>

        <div className="space-y-3">
          {/* 主题切换 */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-muted hover:bg-muted/80 transition-all"
          >
            <div className="flex items-center gap-3">
              {theme === 'light' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span>主题模式</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {theme === 'light' ? '日间' : '夜间'}
            </span>
          </button>

          {/* 云端同步 */}
          <button
            onClick={toggleCloudSync}
            className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
              isCloudSyncEnabled ? 'bg-primary/10 text-primary' : 'bg-muted hover:bg-muted/80'
            }`}
          >
            <div className="flex items-center gap-3">
              {isCloudSyncEnabled ? <Cloud className="w-5 h-5" /> : <CloudOff className="w-5 h-5" />}
              <span>云端同步</span>
            </div>
            <span className="text-sm">
              {isCloudSyncEnabled ? '已开启' : '已关闭'}
            </span>
          </button>

          {/* 手动同步 */}
          {isCloudSyncEnabled && (
            <button
              onClick={syncFromCloud}
              disabled={isLoading}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-muted hover:bg-muted/80 transition-all disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>同步数据</span>
              </div>
              {isLoading && <span className="text-sm text-muted-foreground">同步中...</span>}
            </button>
          )}

          {/* 更新日志 */}
          <div className="relative">
            <button
              onClick={() => setShowChangelog(!showChangelog)}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-muted hover:bg-muted/80 transition-all"
            >
              <div className="flex items-center gap-3">
                <History className="w-5 h-5" />
                <span>更新日志</span>
              </div>
              {showChangelog ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {showChangelog && (
              <div className="mt-3 p-4 border border-border rounded-xl space-y-4">
                {changelog.map((item) => (
                  <div key={item.version}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{item.version}</span>
                      <span className="text-sm text-muted-foreground">{item.date}</span>
                    </div>
                    <ul className="space-y-1">
                      {item.changes.map((change, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          {change}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 重置数据 */}
          <button
            onClick={handleReset}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all"
          >
            <div className="flex items-center gap-3">
              <Trash2 className="w-5 h-5" />
              <span>重置数据</span>
            </div>
          </button>
        </div>
      </div>

      {/* 关于 */}
      <div className="text-center text-muted-foreground text-sm">
        <p>Growth Tracker v2.0</p>
        <p className="mt-1">用 Next.js 重制</p>
      </div>
    </PageContainer>
  );
}