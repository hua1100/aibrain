import { motion, AnimatePresence } from 'framer-motion';
import { MAX_COMBO } from '@/constants';

interface ComboDisplayProps {
  count: number;
  multiplier: number;
  isActive: boolean;
  timeRemaining: string;
}

export function ComboDisplay({ count, multiplier, isActive, timeRemaining }: ComboDisplayProps) {
  if (!isActive || count === 0) return null;

  const getComboColor = () => {
    if (count >= MAX_COMBO) return 'from-red-500 to-orange-500';
    if (count >= 3) return 'from-yellow-500 to-orange-500';
    return 'from-blue-500 to-indigo-500';
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.8 }}
        className="flex items-center gap-3"
      >
        {/* 連擊倍數 */}
        <motion.div
          key={count}
          initial={{ scale: 1.5 }}
          animate={{ scale: 1 }}
          className={`
            px-4 py-2 rounded-full
            bg-gradient-to-r ${getComboColor()}
            text-white font-bold shadow-lg
          `}
        >
          <motion.span
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatDelay: 1,
            }}
            className="text-lg"
          >
            {multiplier}x
          </motion.span>
          <span className="text-sm ml-1">連擊</span>
        </motion.div>

        {/* 剩餘時間 */}
        <div className="text-sm text-gray-500">
          <span className="font-mono">{timeRemaining}</span>
        </div>

        {/* 連擊進度指示器 */}
        <div className="flex gap-1">
          {Array.from({ length: MAX_COMBO }).map((_, i) => (
            <motion.div
              key={i}
              initial={i === count - 1 ? { scale: 0 } : undefined}
              animate={i === count - 1 ? { scale: 1 } : undefined}
              className={`
                w-2 h-2 rounded-full
                ${i < count ? 'bg-yellow-500' : 'bg-gray-200'}
              `}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
