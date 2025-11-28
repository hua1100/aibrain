import { useEffect, useState } from 'react';
import { getTasksByDate } from '@/services/statsService';
import { db } from '@/services/database';
import type { Task, CategoryConfig } from '@/types';

interface DailyTaskListProps {
    date: string;
}

export function DailyTaskList({ date }: DailyTaskListProps) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [categories, setCategories] = useState<Record<string, CategoryConfig>>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                const [taskList, settings] = await Promise.all([
                    getTasksByDate(date),
                    db.settings.get('user'),
                ]);

                setTasks(taskList);

                if (settings?.categories) {
                    const catMap = settings.categories.reduce((acc, cat) => {
                        acc[cat.id] = cat;
                        return acc;
                    }, {} as Record<string, CategoryConfig>);
                    setCategories(catMap);
                }
            } catch (error) {
                console.error('Failed to load daily tasks:', error);
            } finally {
                setIsLoading(false);
            }
        }

        loadData();
    }, [date]);

    if (isLoading) {
        return <div className="text-center py-4 text-gray-500">載入中...</div>;
    }

    if (tasks.length === 0) {
        return (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500">這一天沒有完成的任務</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900">
                {new Date(date).toLocaleDateString('zh-TW', { month: 'long', day: 'numeric' })} 的完成清單
            </h3>
            <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
                {tasks.map((task) => {
                    const category = categories[task.category] || {
                        name: '未知',
                        icon: '❓',
                        color: 'text-gray-500',
                        bgColor: 'bg-gray-100',
                    };

                    return (
                        <div key={task.id} className="p-3 flex items-center gap-3">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${category.bgColor} ${category.color}`}
                            >
                                {category.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-gray-900 font-medium truncate">{task.name}</p>
                                <p className="text-xs text-gray-500">
                                    {task.completedAt
                                        ? new Date(task.completedAt).toLocaleTimeString('zh-TW', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })
                                        : ''}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
