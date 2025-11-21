import { useState, useEffect, useCallback } from 'react';
import type { Achievement, AchievementType } from '@/types';
import {
  getAllAchievements,
  checkAchievements,
  getUnlockedCount,
} from '@/services/achievementChecker';
import { db } from '@/services/database';

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [newlyUnlocked, setNewlyUnlocked] = useState<AchievementType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 載入成就
  const loadAchievements = useCallback(async () => {
    setIsLoading(true);
    try {
      const all = await getAllAchievements();
      const count = await getUnlockedCount();
      setAchievements(all);
      setUnlockedCount(count);
    } catch (error) {
      console.error('Failed to load achievements:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 檢查並解鎖成就
  const checkAndUnlock = useCallback(async (context: {
    linesCompleted: number;
    isFullHouse: boolean;
    comboCount: number;
  }) => {
    try {
      const stats = await db.stats.get('global');
      const currentHour = new Date().getHours();

      const fullContext = {
        ...context,
        currentHour,
        categoryStats: stats?.categoryStats || {},
        currentStreak: stats?.currentStreak || 0,
        totalFullHouses: stats?.totalFullHouses || 0,
        totalDays: stats?.totalBoards || 0,
      };

      const unlocked = await checkAchievements(fullContext);

      if (unlocked.length > 0) {
        setNewlyUnlocked(unlocked);
        await loadAchievements();
      }

      return unlocked;
    } catch (error) {
      console.error('Failed to check achievements:', error);
      return [];
    }
  }, [loadAchievements]);

  // 清除新解鎖提示
  const clearNewlyUnlocked = useCallback(() => {
    setNewlyUnlocked([]);
  }, []);

  useEffect(() => {
    loadAchievements();
  }, [loadAchievements]);

  return {
    achievements,
    unlockedCount,
    totalCount: achievements.length,
    newlyUnlocked,
    isLoading,
    checkAndUnlock,
    clearNewlyUnlocked,
    reload: loadAchievements,
  };
}
