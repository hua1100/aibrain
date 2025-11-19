import type { CategoryType, CategoryConfig } from '@/types';

export const CATEGORIES: Record<CategoryType, CategoryConfig> = {
  work: {
    type: 'work',
    name: '工作',
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    icon: 'briefcase',
  },
  health: {
    type: 'health',
    name: '健康',
    color: '#10B981',
    bgColor: '#D1FAE5',
    icon: 'heart',
  },
  personal: {
    type: 'personal',
    name: '個人',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    icon: 'user',
  },
  learning: {
    type: 'learning',
    name: '學習',
    color: '#8B5CF6',
    bgColor: '#EDE9FE',
    icon: 'book',
  },
  free: {
    type: 'free',
    name: '免費',
    color: '#6B7280',
    bgColor: '#F3F4F6',
    icon: 'star',
  },
};

export const CATEGORY_OPTIONS: CategoryType[] = ['work', 'health', 'personal', 'learning'];
