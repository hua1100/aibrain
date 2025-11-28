import { db } from './database';
import type { DailyStats, UserStats } from '@/types';

/**
 * 取得全局統計
 */
export async function getGlobalStats(): Promise<UserStats | undefined> {
  return db.stats.get('global');
}

/**
 * 更新每日統計
 */
export async function updateDailyStats(
  date: string,
  updates: Partial<DailyStats>
): Promise<void> {
  const existing = await db.dailyStats.get(date);

  if (existing) {
    await db.dailyStats.update(date, updates);
  } else {
    await db.dailyStats.put({
      date,
      tasksCompleted: updates.tasksCompleted || 0,
      linesCompleted: updates.linesCompleted || 0,
      isFullHouse: updates.isFullHouse || false,
      score: updates.score || 0,
      categoryBreakdown: updates.categoryBreakdown || {
        work: 0,
        health: 0,
        personal: 0,
        learning: 0,
      },
    });
  }
}

/**
 * 取得日期範圍內的統計
 */
export async function getStatsInRange(
  startDate: string,
  endDate: string
): Promise<DailyStats[]> {
  return db.dailyStats
    .where('date')
    .between(startDate, endDate, true, true)
    .toArray();
}

/**
 * 取得最近 N 天的統計
 */
export async function getRecentStats(days: number): Promise<DailyStats[]> {
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  return getStatsInRange(startDate, endDate);
}

/**
 * 計算連續天數
 */
export async function calculateStreak(): Promise<{
  currentStreak: number;
  longestStreak: number;
}> {
  const stats = await db.dailyStats.orderBy('date').reverse().toArray();

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let lastDate: Date | null = null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const stat of stats) {
    const statDate = new Date(stat.date);
    statDate.setHours(0, 0, 0, 0);

    if (stat.tasksCompleted > 0) {
      if (lastDate === null) {
        // 檢查是否為今天或昨天
        const diffDays = Math.floor(
          (today.getTime() - statDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diffDays <= 1) {
          tempStreak = 1;
          currentStreak = 1;
        }
      } else {
        const diffDays = Math.floor(
          (lastDate.getTime() - statDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diffDays === 1) {
          tempStreak++;
          if (currentStreak > 0) currentStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      lastDate = statDate;
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak);

  return { currentStreak, longestStreak };
}

/**
 * 取得分類統計
 */
export async function getCategoryStats(): Promise<Record<string, number>> {
  const globalStats = await getGlobalStats();
  return globalStats?.categoryStats || {};
}

/**
 * 記錄今日統計
 */
export async function recordTodayCompletion(
  tasksCompleted: number,
  linesCompleted: number,
  isFullHouse: boolean,
  score: number,
  category: string
): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const existing = await db.dailyStats.get(today);

  if (existing) {
    const categoryBreakdown = { ...existing.categoryBreakdown };
    categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1;

    await db.dailyStats.update(today, {
      tasksCompleted: existing.tasksCompleted + tasksCompleted,
      linesCompleted: Math.max(existing.linesCompleted, linesCompleted),
      isFullHouse: existing.isFullHouse || isFullHouse,
      score: Math.max(existing.score, score),
      categoryBreakdown,
    });
  } else {
    await db.dailyStats.put({
      date: today,
      tasksCompleted,
      linesCompleted,
      isFullHouse,
      score,
      categoryBreakdown: {
        work: 0,
        health: 0,
        personal: 0,
        learning: 0,
        [category]: 1,
      },
    });
  }
}

/**
 * 取得指定日期的完成任務
 */
export async function getTasksByDate(date: string): Promise<any[]> {
  // 由於我們沒有直接在 Task 上存 completedDate (只有 completedAt Date 物件)
  // 我們需要查詢範圍
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return db.tasks
    .where('completedAt')
    .between(startOfDay, endOfDay, true, true)
    .toArray();
}
