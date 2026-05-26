'use client';

import { useState } from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { useApp } from '../../lib/storage';
import { User, Download, Upload, Trash2, Settings } from 'lucide-react';

export default function ProfilePage() {
  const { data, exportData, importData, resetData } = useApp();
  const [showImport, setShowImport] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedData = JSON.parse(event.target?.result as string);
          importData(importedData);
          alert('数据导入成功！');
        } catch (error) {
          alert('导入失败，请检查文件格式');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleReset = () => {
    if (confirm('确定要重置所有数据吗？此操作不可恢复！')) {
      resetData();
    }
  };

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
          {/* 导出数据 */}
          <button
            onClick={exportData}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-muted hover:bg-muted/80 transition-all"
          >
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5" />
              <span>导出数据</span>
            </div>
          </button>

          {/* 导入数据 */}
          <div className="relative">
            <button
              onClick={() => setShowImport(!showImport)}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-muted hover:bg-muted/80 transition-all"
            >
              <div className="flex items-center gap-3">
                <Upload className="w-5 h-5" />
                <span>导入数据</span>
              </div>
            </button>
            {showImport && (
              <div className="mt-3 p-4 border border-border rounded-xl">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="w-full text-sm"
                />
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
