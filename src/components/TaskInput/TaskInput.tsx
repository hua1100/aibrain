import { useState, useEffect } from 'react';
import { TaskItem } from './TaskItem';
import { Button } from '@/components/common';
import type { TaskInput as TaskInputType, CategoryType, CategoryConfig } from '@/types';
import { TOTAL_TASKS } from '@/constants';
import { getSettings } from '@/services/settingsService';

interface TaskInputProps {
  onSubmit: (tasks: TaskInputType[]) => void;
  isLoading?: boolean;
  submitText?: string;
}

const createEmptyTask = (category: CategoryType = 'personal'): TaskInputType => ({
  name: '',
  category,
});

const defaultCategories: CategoryType[] = [
  'work', 'health', 'personal', 'learning',
  'work', 'health', 'personal', 'learning',
  'personal',
];

export function TaskInput({ onSubmit, isLoading = false, submitText = '建立今日 Bingo 板' }: TaskInputProps) {
  const [tasks, setTasks] = useState<TaskInputType[]>(
    defaultCategories.map((cat) => createEmptyTask(cat))
  );
  const [categories, setCategories] = useState<CategoryConfig[]>([]);

  useEffect(() => {
    getSettings().then((settings) => {
      if (settings?.categories) {
        setCategories(settings.categories);
      }
    });
  }, []);

  const handleTaskChange = (index: number, task: TaskInputType) => {
    const newTasks = [...tasks];
    newTasks[index] = task;
    setTasks(newTasks);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 驗證所有任務都有名稱
    const validTasks = tasks.filter((t) => t.name.trim() !== '');
    if (validTasks.length !== TOTAL_TASKS) {
      alert(`請輸入完整 ${TOTAL_TASKS} 個任務`);
      return;
    }

    onSubmit(tasks);
  };

  const filledCount = tasks.filter((t) => t.name.trim() !== '').length;
  const isValid = filledCount === TOTAL_TASKS;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 進度提示 */}
      <div className="flex items-center justify-between text-sm bg-[var(--nb-white)] nb-border nb-shadow p-4">
        <span className="font-bold text-[var(--nb-black)] nb-text">
          已填寫 <span className="text-lg">{filledCount}</span> / {TOTAL_TASKS} 個任務
        </span>
        {isValid && (
          <span className="font-black text-[var(--nb-black)] nb-text">✓ 可以建立</span>
        )}
      </div>

      {/* 進度條 - Neo Brutalism Style */}
      <div className="w-full h-4 bg-[var(--nb-white)] nb-border">
        <div
          className="h-full bg-[var(--nb-yellow)] transition-all duration-300 nb-border-thick"
          style={{ width: `${(filledCount / TOTAL_TASKS) * 100}%`, borderWidth: '0 4px 0 0' }}
        />
      </div>

      {/* 任務列表 */}
      <div className="space-y-3">
        {tasks.map((task, index) => (
          <TaskItem
            key={index}
            index={index}
            task={task}
            onChange={handleTaskChange}
            categories={categories}
          />
        ))}
      </div>

      {/* 提交按鈕 */}
      <div className="pt-4">
        <Button
          type="submit"
          disabled={!isValid}
          isLoading={isLoading}
          className="w-full"
          size="lg"
        >
          {submitText}
        </Button>
      </div>
    </form>
  );
}
