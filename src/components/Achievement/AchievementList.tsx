import type { Achievement } from '@/types';
import { ACHIEVEMENTS } from '@/constants';
import { AchievementBadge } from './AchievementBadge';

interface AchievementListProps {
  achievements: Achievement[];
  showLocked?: boolean;
}

export function AchievementList({ achievements, showLocked = true }: AchievementListProps) {
  const unlockedAchievements = achievements.filter((a) => a.unlockedAt);
  const lockedAchievements = achievements.filter((a) => !a.unlockedAt);

  return (
    <div className="space-y-6">
      {/* 已解鎖 */}
      {unlockedAchievements.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            已解鎖 ({unlockedAchievements.length})
          </h3>
          <div className="grid grid-cols-4 gap-4">
            {unlockedAchievements.map((achievement) => (
              <AchievementBadge
                key={achievement.type}
                achievement={achievement}
                size="md"
              />
            ))}
          </div>
        </div>
      )}

      {/* 未解鎖 */}
      {showLocked && lockedAchievements.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-500 mb-4">
            未解鎖 ({lockedAchievements.length})
          </h3>
          <div className="grid grid-cols-4 gap-4">
            {lockedAchievements.map((achievement) => (
              <div key={achievement.type} className="relative group">
                <AchievementBadge
                  achievement={achievement}
                  size="md"
                  showProgress
                />
                {/* Hover 提示 */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {ACHIEVEMENTS[achievement.type].condition}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 空狀態 */}
      {achievements.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">🎖️</div>
          <p>還沒有任何成就</p>
          <p className="text-sm">完成任務來解鎖成就吧！</p>
        </div>
      )}
    </div>
  );
}
