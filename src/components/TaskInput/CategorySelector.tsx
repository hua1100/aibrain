import { useState, useEffect } from 'react';
import type { CategoryType, CategoryConfig } from '@/types';
import { CATEGORIES as DEFAULT_CATEGORIES } from '@/constants';

interface CategorySelectorProps {
  value: CategoryType;
  onChange: (category: CategoryType) => void;
  size?: 'sm' | 'md';
  categories?: CategoryConfig[];
}

export function CategorySelector({
  value,
  onChange,
  size = 'md',
  categories = Object.values(DEFAULT_CATEGORIES).filter(c => c.id !== 'free')
}: CategorySelectorProps) {
  // 移除內部的 getSettings 調用，改由 props 傳入

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {categories.map((cat) => {
        const isSelected = value === cat.id;

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onChange(cat.id)}
            className={`
              ${sizeClasses[size]}
              rounded-full flex items-center justify-center
              transition-all duration-200
              ${isSelected
                ? 'ring-2 ring-offset-2 scale-110'
                : 'opacity-60 hover:opacity-100 hover:scale-105'
              }
              ${cat.bgColor.startsWith('bg-') ? cat.bgColor : ''}
              ${cat.color.startsWith('text-') ? cat.color : ''}
            `}
            style={{
              // 如果是 Tailwind class 則不需要 style，但為了相容舊資料或自定義顏色，保留 style
              // 這裡假設 bgColor/color 可能是 hex 或 tailwind class
              // 簡單起見，我們讓 CategoryManager 存的是 Tailwind class，但這裡做個防禦
              backgroundColor: cat.bgColor.startsWith('#') ? cat.bgColor : undefined,
              color: cat.color.startsWith('#') ? cat.color : undefined,
              '--tw-ring-color': isSelected ? (cat.color.startsWith('#') ? cat.color : 'currentColor') : undefined,
            } as React.CSSProperties}
            title={cat.name}
          >
            {cat.icon}
          </button>
        );
      })}
    </div>
  );
}
