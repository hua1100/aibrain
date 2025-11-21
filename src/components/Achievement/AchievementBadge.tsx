import { motion } from 'framer-motion';
import type { Achievement } from '@/types';
import { ACHIEVEMENTS } from '@/constants';

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
}

export function AchievementBadge({
  achievement,
  size = 'md',
  showProgress = false,
}: AchievementBadgeProps) {
  const config = ACHIEVEMENTS[achievement.type];
  const isUnlocked = !!achievement.unlockedAt;
  const progress = achievement.progress;

  const sizeClasses = {
    sm: 'w-12 h-12 text-xl',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-24 h-24 text-4xl',
  };

  const getIcon = () => {
    switch (config.icon) {
      case 'trophy': return '🏆';
      case 'star': return '⭐';
      case 'zap': return '⚡';
      case 'award': return '🥇';
      case 'calendar': return '📅';
      case 'crown': return '👑';
      case 'flame': return '🔥';
      case 'fire': return '💥';
      case 'sunrise': return '🌅';
      case 'moon': return '🌙';
      case 'briefcase': return '💼';
      case 'heart': return '❤️';
      case 'user': return '👤';
      case 'book': return '📚';
      case 'rocket': return '🚀';
      case 'check-circle': return '✅';
      case 'shield': return '🛡️';
      default: return '🎖️';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="flex flex-col items-center"
    >
      <div
        className={`
          ${sizeClasses[size]}
          rounded-full flex items-center justify-center
          ${isUnlocked
            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg'
            : 'bg-gray-200'
          }
          transition-all duration-300
        `}
      >
        <span className={isUnlocked ? '' : 'grayscale opacity-40'}>
          {getIcon()}
        </span>
      </div>

      {size !== 'sm' && (
        <div className="mt-2 text-center">
          <p className={`font-medium text-sm ${isUnlocked ? 'text-gray-900' : 'text-gray-400'}`}>
            {config.name}
          </p>
          {showProgress && !isUnlocked && (
            <div className="mt-1 w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all"
                style={{ width: `${(progress / config.maxProgress) * 100}%` }}
              />
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
