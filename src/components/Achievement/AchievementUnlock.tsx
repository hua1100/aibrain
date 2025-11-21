import { motion, AnimatePresence } from 'framer-motion';
import type { AchievementType } from '@/types';
import { ACHIEVEMENTS } from '@/constants';
import { useEffect, useState } from 'react';

interface AchievementUnlockProps {
  types: AchievementType[];
  onComplete?: () => void;
}

export function AchievementUnlock({ types, onComplete }: AchievementUnlockProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (types.length > 0) {
      setCurrentIndex(0);
      setIsVisible(true);
    }
  }, [types]);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      if (currentIndex < types.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        setIsVisible(false);
        onComplete?.();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isVisible, currentIndex, types.length, onComplete]);

  if (!isVisible || types.length === 0) return null;

  const currentType = types[currentIndex];
  const config = ACHIEVEMENTS[currentType];

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
    <AnimatePresence>
      <motion.div
        key={currentType}
        initial={{ opacity: 0, y: -100, scale: 0.5 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.5 }}
        transition={{ type: 'spring', damping: 15 }}
        className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
      >
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl px-6 py-4 shadow-2xl">
          <div className="flex items-center gap-4">
            {/* 圖示 */}
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 0.5,
                repeat: 2,
              }}
              className="text-5xl"
            >
              {getIcon()}
            </motion.div>

            {/* 文字 */}
            <div className="text-white">
              <p className="text-sm opacity-80">成就解鎖！</p>
              <h3 className="text-xl font-bold">{config.name}</h3>
              <p className="text-sm opacity-80">{config.description}</p>
            </div>
          </div>

          {/* 進度指示器（多個成就時） */}
          {types.length > 1 && (
            <div className="flex justify-center gap-1 mt-3">
              {types.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i <= currentIndex ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* 光芒效果 */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
          className="absolute inset-0 bg-purple-400 rounded-2xl blur-xl -z-10"
        />
      </motion.div>
    </AnimatePresence>
  );
}
