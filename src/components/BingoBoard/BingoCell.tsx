import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import type { Task } from '@/types';
import { CATEGORIES } from '@/constants';

interface BingoCellProps {
  task: Task;
  onClick?: (task: Task) => void;
  isHighlighted?: boolean;
}

export function BingoCell({ task, onClick, isHighlighted = false }: BingoCellProps) {
  const category = CATEGORIES[task.category];
  const isClickable = !task.isFreeSpace && onClick;
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    if (!isClickable) return;

    // 觸發動畫
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    onClick(task);
  };

  return (
    <motion.button
      whileTap={isClickable ? { scale: 0.9 } : undefined}
      whileHover={isClickable ? { scale: 1.05 } : undefined}
      animate={isAnimating ? { scale: [1, 1.1, 1] } : undefined}
      transition={{ duration: 0.2 }}
      onClick={handleClick}
      disabled={task.isFreeSpace}
      className={`
        bingo-cell relative overflow-hidden
        ${task.isCompleted ? 'ring-2 ring-offset-2' : ''}
        ${isHighlighted ? 'ring-2 ring-yellow-400 ring-offset-2' : ''}
        ${task.isFreeSpace ? 'cursor-default' : 'cursor-pointer hover:shadow-lg'}
        transition-shadow duration-200
      `}
      style={{
        backgroundColor: task.isCompleted ? category.color : category.bgColor,
        color: task.isCompleted ? 'white' : category.color,
        ringColor: task.isCompleted ? category.color : undefined,
      }}
    >
      {/* 點擊漣漪效果 */}
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 rounded-lg"
            style={{ backgroundColor: category.color }}
          />
        )}
      </AnimatePresence>

      {/* 任務名稱 */}
      <motion.span
        animate={{
          scale: task.isCompleted ? [1, 1.05, 1] : 1,
        }}
        transition={{ duration: 0.3 }}
        className="text-xs sm:text-sm font-medium line-clamp-2 px-1 relative z-10"
      >
        {task.isFreeSpace ? '免費' : task.name}
      </motion.span>

      {/* 完成打勾動畫 */}
      <AnimatePresence>
        {task.isCompleted && !task.isFreeSpace && (
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: -180 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0, rotate: 180 }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 30,
            }}
            className="absolute top-1 right-1"
          >
            <svg
              className="w-4 h-4 text-white drop-shadow-sm"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 免費格星星圖示 */}
      {task.isFreeSpace && (
        <motion.div
          animate={{
            rotate: [0, 5, -5, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
          }}
          className="absolute top-1 right-1"
        >
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </motion.div>
      )}

      {/* 完成時的閃光效果 */}
      <AnimatePresence>
        {isAnimating && task.isCompleted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-white rounded-lg"
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
}
