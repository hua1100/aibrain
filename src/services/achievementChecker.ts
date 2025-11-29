/**
 * 成就檢查器
 * 
 * 注意:此功能暫時停用,因為 achievements 表尚未在 Supabase Schema 中定義
 * 如需啟用,請先在 Supabase 建立 achievements 表
 */

import type { AchievementType } from '@/types';

interface CheckContext {
  linesCompleted: number;
  isFullHouse: boolean;
  comboCount: number;
  currentHour: number;
  categoryStats: Record<string, number>;
  currentStreak: number;
  totalFullHouses: number;
  totalDays: number;
}

/**
 * 檢查所有成就條件 (暫時停用)
 */
export async function checkAchievements(context: CheckContext): Promise<AchievementType[]> {
  console.warn('成就系統暫時停用,等待 Supabase achievements 表建立');
  return [];
}

/**
 * 更新成就進度 (暫時停用)
 */
export async function updateAchievementProgress(
  type: AchievementType,
  progress: number
): Promise<void> {
  console.warn('成就系統暫時停用,等待 Supabase achievements 表建立');
}

/**
 * 取得所有成就狀態 (暫時停用)
 */
export async function getAllAchievements(): Promise<any[]> {
  console.warn('成就系統暫時停用,等待 Supabase achievements 表建立');
  return [];
}

/**
 * 取得已解鎖成就數量 (暫時停用)
 */
export async function getUnlockedCount(): Promise<number> {
  console.warn('成就系統暫時停用,等待 Supabase achievements 表建立');
  return 0;
}
