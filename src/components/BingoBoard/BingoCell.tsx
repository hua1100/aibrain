import { motion } from 'framer-motion';
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

  return (
    <motion.button
      whileTap={isClickable ? { scale: 0.95 } : undefined}
      onClick={() => isClickable && onClick(task)}
      disabled={task.isFreeSpace}
      className={`
        bingo-cell relative overflow-hidden
        ${task.isCompleted ? 'ring-2 ring-offset-2' : ''}
        ${isHighlighted ? 'ring-2 ring-yellow-400' : ''}
        ${task.isFreeSpace ? 'cursor-default' : 'cursor-pointer hover:shadow-md'}
      `}
      style={{
        backgroundColor: task.isCompleted ? category.color : category.bgColor,
        color: task.isCompleted ? 'white' : category.color,
        ringColor: task.isCompleted ? category.color : undefined,
      }}
    >
      {/* 任務名稱 */}
      <span className="text-xs sm:text-sm font-medium line-clamp-2 px-1">
        {task.isFreeSpace ? '免費' : task.name}
      </span>

      {/* 完成打勾 */}
      {task.isCompleted && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute top-1 right-1"
        >
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </motion.div>
      )}

      {/* 免費格星星圖示 */}
      {task.isFreeSpace && (
        <div className="absolute top-1 right-1">
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
      )}
    </motion.button>
  );
}
