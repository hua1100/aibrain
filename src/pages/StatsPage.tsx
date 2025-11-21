import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HistoryChart, CategoryStats, StreakDisplay } from '@/components/Stats';
import { Button } from '@/components/common';
import { getRecentStats, calculateStreak, getCategoryStats } from '@/services/statsService';
import type { DailyStats } from '@/types';

export function StatsPage() {
  const [recentStats, setRecentStats] = useState<DailyStats[]>([]);
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0 });
  const [categoryStats, setCategoryStats] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [recent, streakData, categories] = await Promise.all([
          getRecentStats(7),
          calculateStreak(),
          getCategoryStats(),
        ]);
        setRecentStats(recent);
        setStreak(streakData);
        setCategoryStats(categories);
      } catch (error) {
        console.error('載入統計失敗:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const totalTasks = recentStats.reduce((sum, s) => sum + s.tasksCompleted, 0);
  const totalLines = recentStats.reduce((sum, s) => sum + s.linesCompleted, 0);
  const fullHouseDays = recentStats.filter((s) => s.isFullHouse).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* 標題 */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">統計</h1>
          <p className="text-sm text-gray-500">查看你的完成記錄</p>
        </div>

        {/* 連續天數 */}
        <StreakDisplay
          currentStreak={streak.currentStreak}
          longestStreak={streak.longestStreak}
        />

        {/* 本週摘要 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-3">本週摘要</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-indigo-600">{totalTasks}</div>
              <div className="text-xs text-gray-500">完成任務</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{totalLines}</div>
              <div className="text-xs text-gray-500">連線數</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">{fullHouseDays}</div>
              <div className="text-xs text-gray-500">全清天數</div>
            </div>
          </div>
        </div>

        {/* 歷史圖表 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <HistoryChart data={recentStats} days={7} />
        </div>

        {/* 分類統計 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <CategoryStats data={categoryStats} />
        </div>

        {/* 返回按鈕 */}
        <Link to="/">
          <Button variant="outline" className="w-full">
            返回首頁
          </Button>
        </Link>
      </div>
    </div>
  );
}
