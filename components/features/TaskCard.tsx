'use client';

import { motion } from 'framer-motion';
import { TaskType } from '@/lib/types';
import { Check } from 'lucide-react';

interface TaskCardProps {
  taskType: TaskType;
  completedToday: boolean;
  onComplete: () => void;
}

export function TaskCard({ taskType, completedToday, onComplete }: TaskCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onComplete}
      className={`relative p-6 rounded-2xl border-2 transition-all ${
        completedToday
          ? 'border-green-500/50 bg-green-500/10'
          : 'border-border bg-card hover:border-primary/50'
      }`}
    >
      {completedToday && (
        <div className="absolute top-3 right-3">
          <Check className="w-6 h-6 text-green-500" />
        </div>
      )}
      <div className="flex flex-col items-center gap-3">
        <span className="text-4xl">{taskType.icon}</span>
        <span className="font-semibold">{taskType.name}</span>
        <span className="text-xs text-muted-foreground">
          {taskType.defaultDuration}分钟
        </span>
      </div>
    </motion.button>
  );
}
