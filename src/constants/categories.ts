import type { CategoryType, CategoryConfig } from '@/types';

export const CATEGORIES: Record<CategoryType, CategoryConfig> = {
  work: {
    id: 'work',
    name: '工作',
    color: '#2563eb',
    bgColor: '#A7DBD8',  // 淺青色
    icon: '💼',
  },
  health: {
    id: 'health',
    name: '健康',
    color: '#16a34a',
    bgColor: '#BAFCA2',  // 淺綠色
    icon: '💪',
  },
  personal: {
    id: 'personal',
    name: '個人',
    color: '#9333ea',
    bgColor: '#E6D5F5',  // 淺紫色
    icon: '👤',
  },
  learning: {
    id: 'learning',
    name: '學習',
    color: '#ca8a04',
    bgColor: '#FFDB58',  // 淺黃色
    icon: '📚',
  },
  free: {
    id: 'free',
    name: '自由',
    color: '#4b5563',
    bgColor: '#FFA07A',  // 淺珊瑚色
    icon: '✨',
  },
};

export const CATEGORY_OPTIONS: CategoryType[] = ['work', 'health', 'personal', 'learning'];
