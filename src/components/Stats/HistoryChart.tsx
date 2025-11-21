import type { DailyStats } from '@/types';

interface HistoryChartProps {
  data: DailyStats[];
  days?: number;
}

export function HistoryChart({ data, days = 7 }: HistoryChartProps) {
  // 補齊缺失的日期
  const filledData = fillMissingDates(data, days);
  const maxTasks = Math.max(...filledData.map((d) => d.tasksCompleted), 9);

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700">最近 {days} 天</h3>
      <div className="flex items-end gap-1 h-32">
        {filledData.map((stat) => {
          const height = (stat.tasksCompleted / maxTasks) * 100;
          const isFullHouse = stat.isFullHouse;

          return (
            <div
              key={stat.date}
              className="flex-1 flex flex-col items-center gap-1"
            >
              <div
                className={`
                  w-full rounded-t transition-all
                  ${isFullHouse ? 'bg-yellow-400' : 'bg-indigo-500'}
                `}
                style={{ height: `${Math.max(height, 4)}%` }}
                title={`${stat.date}: ${stat.tasksCompleted} 任務`}
              />
              <span className="text-xs text-gray-500">
                {new Date(stat.date).getDate()}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-gray-400">
        <span>0</span>
        <span>{maxTasks} 任務</span>
      </div>
    </div>
  );
}

function fillMissingDates(data: DailyStats[], days: number): DailyStats[] {
  const result: DailyStats[] = [];
  const dataMap = new Map(data.map((d) => [d.date, d]));

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    result.push(
      dataMap.get(date) || {
        date,
        tasksCompleted: 0,
        linesCompleted: 0,
        isFullHouse: false,
        score: 0,
        categoryBreakdown: { work: 0, health: 0, personal: 0, learning: 0 },
      }
    );
  }

  return result;
}
