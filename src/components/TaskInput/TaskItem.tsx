import { useState, useEffect } from 'react';
import { db } from '@/services/database';
import type { CategoryType, TaskInput, CategoryConfig } from '@/types';

interface TaskItemProps {
  index: number;
  task: TaskInput;
  onChange: (index: number, task: TaskInput) => void;
  onRemove?: (index: number) => void;
}

export function TaskItem({ index, task, onChange, onRemove }: TaskItemProps) {
  const [categories, setCategories] = useState<CategoryConfig[]>([]);

  useEffect(() => {
    db.settings.get('user').then((settings) => {
      if (settings?.categories) {
        setCategories(settings.categories);
      }
    });
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(index, { ...task, name: e.target.value });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(index, { ...task, category: e.target.value as CategoryType });
  };

  // 找到當前分類的配置
  const currentCategory = categories.find(cat => cat.id === task.category);

  return (
    <div className="flex items-center gap-3 p-4 bg-[var(--nb-white)] nb-border nb-shadow">
      {/* 序號 */}
      <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-[var(--nb-black)] text-[var(--nb-white)] font-black text-sm nb-text">
        {index + 1}
      </span>

      {/* 任務名稱輸入 */}
      <input
        type="text"
        value={task.name}
        onChange={handleNameChange}
        placeholder={`任務 ${index + 1}`}
        className="flex-1 px-4 py-3 nb-border text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[var(--nb-yellow)] nb-text"
        maxLength={20}
      />

      {/* 分類選擇 */}
      <select
        value={task.category}
        onChange={handleCategoryChange}
        className="px-3 py-3 nb-border text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[var(--nb-yellow)] nb-text bg-[var(--nb-white)]"
        style={{
          color: currentCategory?.color.startsWith('text-')
            ? undefined
            : currentCategory?.color
        }}
      >
        {categories.map((cat) => (
          <option
            key={cat.id}
            value={cat.id}
            style={{
              color: cat.color.startsWith('text-') ? undefined : cat.color
            }}
          >
            {cat.icon} {cat.name}
          </option>
        ))}
      </select>

      {/* 刪除按鈕（可選） */}
      {onRemove && (
        <button
          onClick={() => onRemove(index)}
          className="p-2 text-[var(--nb-black)] hover:bg-[var(--nb-coral)] hover:text-white transition-colors nb-border"
          aria-label="刪除任務"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
