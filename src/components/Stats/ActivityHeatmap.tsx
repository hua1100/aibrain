import { useMemo } from 'react';
import type { DailyStats } from '@/types';

interface ActivityHeatmapProps {
    data: DailyStats[];
    year?: number;
    startDate?: string; // 新增 startDate prop
    onDateClick?: (date: string) => void;
    selectedDate?: string | null;
}

export function ActivityHeatmap({ data, year = new Date().getFullYear(), startDate: startDateProp, onDateClick, selectedDate }: ActivityHeatmapProps) {
    const { days, maxCount } = useMemo(() => {
        // 如果有提供 startDateProp，就用它，否則預設為當年 1/1
        // 注意：這裡使用字串操作來避免時區問題
        const start = startDateProp ? new Date(startDateProp) : new Date(year, 0, 1);
        const end = new Date(year, 11, 31);

        // 建立資料 Map
        const dataMap = new Map(data.map((d) => [d.date, d.tasksCompleted]));

        let max = 0;
        const daysArray: { date: string; count: number }[] = [];

        // 使用本地時間遍歷日期
        const current = new Date(start);

        // 為了避免無限迴圈，設定一個安全閥值 (例如 400 天)
        let safetyCounter = 0;

        while (current <= end && safetyCounter < 400) {
            safetyCounter++;

            // 格式化為 YYYY-MM-DD (使用本地時間)
            const yearStr = current.getFullYear();
            const monthStr = String(current.getMonth() + 1).padStart(2, '0');
            const dayStr = String(current.getDate()).padStart(2, '0');
            const dateStr = `${yearStr}-${monthStr}-${dayStr}`;

            const count = dataMap.get(dateStr) || 0;
            if (count > max) max = count;

            daysArray.push({ date: dateStr, count });

            // 前進一天
            current.setDate(current.getDate() + 1);
        }

        return { days: daysArray, maxCount: Math.max(max, 1) };
    }, [data, year, startDateProp]);

    const getColor = (count: number) => {
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
        <div className="w-full">
            <div className="flex flex-wrap gap-1">
                {days.map((day, index) => (
                    <div
                        key={index}
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
        </div>
    );
}
