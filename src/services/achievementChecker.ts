import { db } from './database';
import type { Achievement, AchievementType } from '@/types';
import { ACHIEVEMENTS } from '@/constants';

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
 * 檢查所有成就條件
 */
export async function checkAchievements(context: CheckContext): Promise<AchievementType[]> {
  const unlockedTypes: AchievementType[] = [];

  const checks: Array<{ type: AchievementType; condition: () => boolean }> = [
    // 連線相關
    { type: 'first_line', condition: () => context.linesCompleted >= 1 },
    { type: 'three_lines', condition: () => context.linesCompleted >= 3 },
    { type: 'five_lines', condition: () => context.linesCompleted >= 5 },

    // 全清相關
    { type: 'first_fullhouse', condition: () => context.isFullHouse },
    { type: 'perfectionist', condition: () => context.totalFullHouses >= 10 },
  ];

  for (const check of checks) {
    if (check.condition()) {
      const isNewlyUnlocked = await tryUnlockAchievement(check.type);
      if (isNewlyUnlocked) {
        unlockedTypes.push(check.type);
      }
    }
  }

  return unlockedTypes;
}

/**
 * 嘗試解鎖成就
 */
async function tryUnlockAchievement(type: AchievementType): Promise<boolean> {
  const existing = await db.achievements.where('type').equals(type).first();

  if (existing?.unlockedAt) {
    return false; // 已經解鎖
  }

  if (existing) {
    await db.achievements.update(existing.id, {
      unlockedAt: new Date(),
      progress: 100,
    });
  } else {
    await db.achievements.add({
      id: `achievement-${type}`,
      type,
      unlockedAt: new Date(),
      progress: 100,
    });
  }

  return true;
}

/**
 * 更新成就進度
 */
export async function updateAchievementProgress(
  type: AchievementType,
  progress: number
): Promise<void> {
  const existing = await db.achievements.where('type').equals(type).first();
  const config = ACHIEVEMENTS[type];

  if (existing) {
    if (!existing.unlockedAt) {
      await db.achievements.update(existing.id, {
        progress: Math.min(progress, config.maxProgress),
      });
    }
  } else {
    await db.achievements.add({
      id: `achievement-${type}`,
      type,
      unlockedAt: null,
      progress: Math.min(progress, config.maxProgress),
    });
  }
}

/**
 * 取得所有成就狀態
 */
export async function getAllAchievements(): Promise<Achievement[]> {
  const saved = await db.achievements.toArray();
  const allTypes = Object.keys(ACHIEVEMENTS) as AchievementType[];

  return allTypes.map((type) => {
    const existing = saved.find((a) => a.type === type);
    return existing || {
      id: `achievement-${type}`,
      type,
      unlockedAt: null,
      progress: 0,
    };
  });
}

/**
 * 取得已解鎖成就數量
 */
export async function getUnlockedCount(): Promise<number> {
  const achievements = await db.achievements.toArray();
  return achievements.filter((a) => a.unlockedAt).length;
}
