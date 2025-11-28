import { useMemo } from 'react';
import type { DailyStats } from '@/types';

interface ActivityHeatmapProps {
    data: DailyStats[];
    year?: number;
    onDateClick?: (date: string) => void;
    selectedDate?: string | null;
}

export function ActivityHeatmap({ data, year = new Date().getFullYear(), onDateClick, selectedDate }: ActivityHeatmapProps) {
    const { weeks, maxCount } = useMemo(() => {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31);
        const dataMap = new Map(data.map((d) => [d.date, d.tasksCompleted]));

        let max = 0;
        const weeksArray: { date: string; count: number }[][] = [];
        let currentWeek: { date: string; count: number }[] = [];

        // 補齊前面的空白天數 (如果第一天不是週日)
        const startDay = startDate.getDay(); // 0 is Sunday
        for (let i = 0; i < startDay; i++) {
            currentWeek.push({ date: '', count: -1 });
        }

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const count = dataMap.get(dateStr) || 0;
            if (count > max) max = count;

            currentWeek.push({ date: dateStr, count });

            if (currentWeek.length === 7) {
                weeksArray.push(currentWeek);
                currentWeek = [];
            }
        }

        // 補齊最後一週
        if (currentWeek.length > 0) {
            while (currentWeek.length < 7) {
                currentWeek.push({ date: '', count: -1 });
            }
            weeksArray.push(currentWeek);
        }

        return { weeks: weeksArray, maxCount: Math.max(max, 1) };
    }, [data, year]);

    const getColor = (count: number) => {
        if (count === -1) return 'transparent'; // Placeholder
        if (count === 0) return '#ebedf0';

        // 根據最大值計算強度 (4 levels)
        const intensity = Math.ceil((count / maxCount) * 4);
        switch (intensity) {
            case 1: return '#9be9a8';
            case 2: return '#40c463';
            case 3: return '#30a14e';
            case 4: return '#216e39';
            default: return '#ebedf0';
        }
    };

    return (
        <div className="w-full overflow-x-auto">
            <div className="min-w-[700px]">
                <div className="flex gap-1">
                    {weeks.map((week, wIndex) => (
                        <div key={wIndex} className="flex flex-col gap-1">
                            {week.map((day, dIndex) => (
                                <div
                                    key={`${wIndex}-${dIndex}`}
                                    className={`
                    w-3 h-3 rounded-sm cursor-pointer transition-all
                    ${selectedDate === day.date ? 'ring-2 ring-offset-1 ring-indigo-500' : ''}
                    hover:opacity-80
                  `}
                                    style={{ backgroundColor: getColor(day.count) }}
                                    title={day.date ? `${day.date}: ${day.count} 任務` : ''}
                                    onClick={() => day.date && onDateClick?.(day.date)}
                                />
                            ))}
                        </div>
                    ))}
                </div>
                <div className="mt-2 flex items-center justify-end gap-2 text-xs text-gray-500">
                    <span>Less</span>
                    <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-sm bg-[#ebedf0]" />
                        <div className="w-3 h-3 rounded-sm bg-[#9be9a8]" />
                        <div className="w-3 h-3 rounded-sm bg-[#40c463]" />
                        <div className="w-3 h-3 rounded-sm bg-[#30a14e]" />
                        <div className="w-3 h-3 rounded-sm bg-[#216e39]" />
                    </div>
                    <span>More</span>
                </div>
            </div>
        </div>
    );
}
