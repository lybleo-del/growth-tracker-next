'use client';

import { useState } from 'react';
import type { TaskType, TaskRecord } from '@/lib/types';
import { X, Check, Trash2 } from 'lucide-react';

interface TaskCheckInModalProps {
  taskType: TaskType;
  existingRecord?: TaskRecord;
  onClose: () => void;
  onCheckIn: (duration: number) => void;
  onUpdate: (recordId: string, duration: number) => void;
  onCancel: (recordId: string) => void;
}

const clampDuration = (v: number) => Math.max(5, Math.min(600, v));

export function TaskCheckInModal({
  taskType,
  existingRecord,
  onClose,
  onCheckIn,
  onUpdate,
  onCancel,
}: TaskCheckInModalProps) {
  const [duration, setDuration] = useState(existingRecord?.duration ?? taskType.defaultDuration);
  const isCompleted = !!existingRecord;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{taskType.icon}</span>
            <h2 className="text-lg font-semibold">{taskType.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              本次时长 (分钟)
              <span className="ml-2 text-xs">预设 {taskType.defaultDuration} 分钟</span>
            </label>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setDuration((d) => clampDuration(d - 5))}
                className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                -
              </button>
              <input
                type="number"
                min={5}
                max={600}
                value={duration}
                onChange={(e) => setDuration(clampDuration(parseInt(e.target.value) || taskType.defaultDuration))}
                className="flex-1 px-4 py-2 bg-muted rounded-xl border border-border focus:border-primary focus:outline-none text-center"
              />
              <button
                onClick={() => setDuration((d) => clampDuration(d + 5))}
                className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {isCompleted ? (
            <div className="space-y-2">
              <button
                onClick={() => {
                  onUpdate(existingRecord!.id, duration);
                  onClose();
                }}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                保存时长
              </button>
              <button
                onClick={() => {
                  onCancel(existingRecord!.id);
                  onClose();
                }}
                className="w-full py-3 text-red-500 hover:bg-red-500/10 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                取消打卡
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                onCheckIn(duration);
                onClose();
              }}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              打卡
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
