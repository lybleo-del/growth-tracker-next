'use client';

import { useState } from 'react';
import type { TaskType } from '../../lib/types';
import { X, Plus, Trash2 } from 'lucide-react';

interface TaskConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskTypes: TaskType[];
  onUpdateTask: (id: number, updates: Partial<TaskType>) => void;
  onAddTask: (task: Omit<TaskType, 'id'>) => void;
  onDeleteTask: (id: number) => void;
}

const COLORS = [
  '#667eea', '#764ba2', '#f093fb', '#4facfe', '#fa709a',
  '#43e97b', '#38f9d7', '#ff6b6b', '#4ecdc4', '#45b7d1',
];

export function TaskConfigModal({
  isOpen,
  onClose,
  taskTypes,
  onUpdateTask,
  onAddTask,
  onDeleteTask,
}: TaskConfigModalProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: '📚',
    color: COLORS[0],
    defaultDuration: 30,
  });

  if (!isOpen) return null;

  const handleEdit = (task: TaskType) => {
    setEditingId(task.id);
    setFormData({
      name: task.name,
      icon: task.icon,
      color: task.color,
      defaultDuration: task.defaultDuration,
    });
  };

  const handleSave = () => {
    if (editingId) {
      onUpdateTask(editingId, formData);
      setEditingId(null);
    } else {
      onAddTask(formData);
    }
    setFormData({
      name: '',
      icon: '📚',
      color: COLORS[0],
      defaultDuration: 30,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('确定要删除这个任务类型吗？')) {
      onDeleteTask(id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">任务配置</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 任务列表 */}
        <div className="p-4 max-h-[50vh] overflow-y-auto space-y-3">
          {taskTypes.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-3 bg-muted rounded-xl"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-2xl"
                style={{ backgroundColor: task.color + '20' }}
              >
                {task.icon}
              </div>
              <div className="flex-1">
                <div className="font-medium">{task.name}</div>
                <div className="text-xs text-muted-foreground">
                  {task.defaultDuration}分钟
                </div>
              </div>
              <button
                onClick={() => handleEdit(task)}
                className="px-3 py-1 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
              >
                编辑
              </button>
              <button
                onClick={() => handleDelete(task.id)}
                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* 添加/编辑表单 */}
        <div className="p-4 border-t border-border">
          <h3 className="font-medium mb-3">
            {editingId ? '编辑任务' : '添加新任务'}
          </h3>
          
          <div className="space-y-3">
            {/* 任务名称 */}
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="任务名称"
              className="w-full px-4 py-2 bg-muted rounded-xl border border-border focus:border-primary focus:outline-none"
            />

            {/* 图标选择 */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">选择图标</label>
              <div className="flex gap-2 flex-wrap">
                {['📚', '💻', '🏋️', '📱', '⭐', '🎨', '✍️', '🎵', '💡', '🎯'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setFormData({ ...formData, icon: emoji })}
                    className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                      formData.icon === emoji
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* 颜色选择 */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">选择颜色</label>
              <div className="flex gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-8 h-8 rounded-full transition-all ${
                      formData.color === color ? 'ring-2 ring-offset-2 ring-primary' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* 默认时长 */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                默认时长 (分钟): {formData.defaultDuration}
              </label>
              <input
                type="range"
                min="5"
                max="180"
                step="5"
                value={formData.defaultDuration}
                onChange={(e) => setFormData({ ...formData, defaultDuration: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* 保存按钮 */}
            <button
              onClick={handleSave}
              disabled={!formData.name.trim()}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {editingId ? '保存修改' : '添加任务'}
            </button>

            {editingId && (
              <button
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    name: '',
                    icon: '📚',
                    color: COLORS[0],
                    defaultDuration: 30,
                  });
                }}
                className="w-full py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                取消编辑
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
