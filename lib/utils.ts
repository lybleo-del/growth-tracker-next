import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Tailwind class merger
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 生成唯一ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 格式化日期为 YYYY-MM-DD
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 格式化时间显示 MM:SS
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// 获取今日日期字符串
export function getTodayString(): string {
  return formatDate(new Date());
}

// 打卡天数：只统计有打卡记录的天数（只选心情不计入）
export function countCheckInDays(dailyRecords: { tasks: any[] }[]): number {
  return dailyRecords.filter(r => r.tasks.length > 0).length;
}

// 计算连续打卡天数
export function calculateStreak(dailyRecords: { date: string; tasks: any[] }[]): number {
  if (dailyRecords.length === 0) return 0;

  const sortedRecords = [...dailyRecords]
    .filter(r => r.tasks.length > 0)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const record of sortedRecords) {
    const recordDate = new Date(record.date);
    recordDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor(
      (currentDate.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === streak) {
      streak++;
    } else if (diffDays > streak) {
      break;
    }
  }

  return streak;
}
