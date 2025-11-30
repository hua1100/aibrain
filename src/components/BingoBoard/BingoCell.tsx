import { motion } from 'framer-motion';
import { useState } from 'react';
import type { Task, CategoryConfig } from '@/types';
import { CATEGORIES as DEFAULT_CATEGORIES } from '@/constants';

interface BingoCellProps {
  task: Task;
  onClick?: (task: Task) => void;
  onEdit?: (task: Task, newName: string) => void;
  isHighlighted?: boolean;
  isLocked?: boolean;
  categories?: Record<string, CategoryConfig>;
}

// Tailwind color mapping for animation support
const TAILWIND_COLORS: Record<string, string> = {
  'text-blue-600': '#2563eb',
  'bg-blue-100': '#dbeafe',
  'text-green-600': '#16a34a',
  'bg-green-100': '#dcfce7',
  'text-purple-600': '#9333ea',
  'bg-purple-100': '#f3e8ff',
  'text-yellow-600': '#ca8a04',
  'bg-yellow-100': '#fef9c3',
  'text-gray-600': '#4b5563',
  'bg-gray-100': '#f3f4f6',
};

function resolveColor(color: string): string {
  // 如果已經是 hex 或 rgb 格式,直接返回
  if (color.startsWith('#') || color.startsWith('rgb')) return color;
  // 否則從映射表中查找
  return TAILWIND_COLORS[color] || color;
}

export function BingoCell({
  task,
  onClick,
  onEdit,
  isHighlighted = false,
  isLocked = false,
  categories = DEFAULT_CATEGORIES
}: BingoCellProps) {
  // 使用傳入的 categories 或預設值
  const category = categories[task.category] || categories['personal'] || DEFAULT_CATEGORIES['personal'];
  const isClickable = !!onClick && !isLocked;
  const [isAnimating, setIsAnimating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.name);

  // Resolve colors for animation and style
  const bgColor = resolveColor(category?.bgColor || '#E6D5F5');
  const textColor = resolveColor(category?.color || '#9333ea');

  const handleClick = () => {
    if (!isClickable || isEditing) return;

    // 如果是待規劃任務，單擊直接進入編輯模式
    if (onEdit && task.name === '待規劃' && !task.isCompleted && !isLocked) {
      setIsEditing(true);
      setEditValue(task.name);
      return;
    }

    // 觸發動畫
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    onClick(task);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit && !task.isCompleted && !isLocked) {
      setIsEditing(true);
      setEditValue(task.name);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editValue.trim()) {
      onEdit?.(task, editValue.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(task.name);
    }
  };

  return (
    <motion.button
      whileTap={isClickable ? { scale: 0.98 } : undefined}
      whileHover={isClickable ? { y: -2 } : undefined}
      animate={isAnimating ? { scale: [1, 1.03, 1] } : undefined}
      transition={{ duration: 0.15 }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      disabled={isLocked}
      className={`
        bingo-cell relative overflow-hidden
        ${isHighlighted ? 'ring-4 ring-[var(--nb-yellow)] ring-offset-2' : ''}
        ${isLocked ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'}
      `}
      style={{
        backgroundColor: task.isCompleted ? textColor : bgColor,
        color: task.isCompleted ? '#FFFFFF' : textColor,
      } as React.CSSProperties}
    >
      {/* 完成打勾 - 簡化版 */}
      {task.isCompleted && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="absolute top-2 right-2"
        >
          <svg
            className="w-5 h-5 text-white drop-shadow-lg"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={4}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </motion.div>
      )}

      {/* 任務名稱或編輯框 */}
      <div className="relative z-10 w-full h-full flex items-center justify-center px-1">
        {isEditing ? (
          <form onSubmit={handleEditSubmit} className="w-full">
            <input
              autoFocus
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => setIsEditing(false)}
              className="w-full bg-white text-gray-900 text-xs sm:text-sm px-2 py-1 nb-border focus:outline-none focus:ring-2 focus:ring-[var(--nb-yellow)]"
              onClick={(e) => e.stopPropagation()}
            />
          </form>
        ) : (
          <span className="text-xs sm:text-sm font-bold line-clamp-2 select-none text-center nb-text">
            {task.name}
            {isLocked && <span className="block text-[10px] opacity-75 mt-1">(鎖定)</span>}
          </span>
        )}
      </div>
    </motion.button>
  );
}
