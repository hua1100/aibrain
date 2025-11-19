import type { CategoryType, TaskInput } from '@/types';
import { CATEGORIES, CATEGORY_OPTIONS } from '@/constants';

interface TaskItemProps {
  index: number;
  task: TaskInput;
  onChange: (index: number, task: TaskInput) => void;
  onRemove?: (index: number) => void;
}

export function TaskItem({ index, task, onChange, onRemove }: TaskItemProps) {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(index, { ...task, name: e.target.value });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(index, { ...task, category: e.target.value as CategoryType });
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-white rounded-lg shadow-sm border border-gray-100">
      {/* 序號 */}
      <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full text-sm font-medium text-gray-600">
        {index + 1}
      </span>

      {/* 任務名稱輸入 */}
      <input
        type="text"
        value={task.name}
        onChange={handleNameChange}
        placeholder={`任務 ${index + 1}`}
        className="flex-1 px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        maxLength={20}
      />

      {/* 分類選擇 */}
      <select
        value={task.category}
        onChange={handleCategoryChange}
        className="px-2 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        style={{ color: CATEGORIES[task.category].color }}
      >
        {CATEGORY_OPTIONS.map((cat) => (
          <option key={cat} value={cat} style={{ color: CATEGORIES[cat].color }}>
            {CATEGORIES[cat].name}
          </option>
        ))}
      </select>

      {/* 刪除按鈕（可選） */}
      {onRemove && (
        <button
          onClick={() => onRemove(index)}
          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
          aria-label="刪除任務"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
