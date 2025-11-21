import type { CategoryType } from '@/types';
import { CATEGORIES, CATEGORY_OPTIONS } from '@/constants';

interface CategorySelectorProps {
  value: CategoryType;
  onChange: (category: CategoryType) => void;
  size?: 'sm' | 'md';
}

export function CategorySelector({ value, onChange, size = 'md' }: CategorySelectorProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
  };

  return (
    <div className="flex gap-2">
      {CATEGORY_OPTIONS.map((cat) => {
        const category = CATEGORIES[cat];
        const isSelected = value === cat;

        return (
          <button
            key={cat}
            type="button"
            onClick={() => onChange(cat)}
            className={`
              ${sizeClasses[size]}
              rounded-full flex items-center justify-center
              transition-all duration-200
              ${isSelected
                ? 'ring-2 ring-offset-2 scale-110'
                : 'opacity-60 hover:opacity-100 hover:scale-105'
              }
            `}
            style={{
              backgroundColor: category.bgColor,
              color: category.color,
              '--tw-ring-color': isSelected ? category.color : undefined,
            } as React.CSSProperties}
            title={category.name}
          >
            {getCategoryIcon(cat)}
          </button>
        );
      })}
    </div>
  );
}

function getCategoryIcon(category: CategoryType): string {
  switch (category) {
    case 'work': return '💼';
    case 'health': return '❤️';
    case 'personal': return '👤';
    case 'learning': return '📚';
    default: return '⭐';
  }
}
