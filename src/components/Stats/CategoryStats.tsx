import { CATEGORIES } from '@/constants';

interface CategoryStatsProps {
  data: Record<string, number>;
}

export function CategoryStats({ data }: CategoryStatsProps) {
  const total = Object.values(data).reduce((sum, val) => sum + val, 0);

  const categories = Object.entries(CATEGORIES).map(([key, category]) => ({
    key,
    name: category.name,
    color: category.color,
    bgColor: category.bgColor,
    count: data[key] || 0,
    percentage: total > 0 ? ((data[key] || 0) / total) * 100 : 0,
  }));

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700">分類統計</h3>
      <div className="space-y-2">
        {categories.map((cat) => (
          <div key={cat.key} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span style={{ color: cat.color }}>{cat.name}</span>
              <span className="text-gray-500">{cat.count} 次</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${cat.percentage}%`,
                  backgroundColor: cat.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
