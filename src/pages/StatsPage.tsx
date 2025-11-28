import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HistoryChart, CategoryStats, ActivityHeatmap, DailyTaskList } from '@/components/Stats';
import { Button } from '@/components/common';
import { getRecentStats, getCategoryStats, getStatsInRange } from '@/services/statsService';
import type { DailyStats } from '@/types';

export function StatsPage() {
  const [recentStats, setRecentStats] = useState<DailyStats[]>([]);
  const [yearStats, setYearStats] = useState<DailyStats[]>([]);
  const [categoryStats, setCategoryStats] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    async function loadStats() {
      try {
        const today = new Date();
        const startOfYear = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
        const endOfYear = new Date(today.getFullYear(), 11, 31).toISOString().split('T')[0];

        const [recent, yearData, categories] = await Promise.all([
          getRecentStats(7),
          getStatsInRange(startOfYear, endOfYear),
          getCategoryStats(),
        ]);
        setRecentStats(recent);
        setYearStats(yearData);
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--nb-purple) 0%, var(--nb-cyan) 100%)' }}>
        <div className="animate-spin h-16 w-16 nb-border-thick" style={{ borderTopColor: 'var(--nb-yellow)', borderRightColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: 'transparent' }} />
      </div>
    );
  }

  const totalTasks = yearStats.reduce((sum, s) => sum + s.tasksCompleted, 0);
  const totalLines = yearStats.reduce((sum, s) => sum + s.linesCompleted, 0);
  const fullHouseDays = yearStats.filter((s) => s.isFullHouse).length;

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(135deg, var(--nb-purple) 0%, var(--nb-cyan) 100%)' }}>
      <div className="max-w-md mx-auto space-y-6">
        {/* 標題 */}
        <div className="text-center">
          <h1 className="text-4xl font-black text-[var(--nb-black)] mb-2 nb-heading">
            儀表板
          </h1>
          <p className="text-base font-bold text-[var(--nb-black)] nb-text">
            你的任務完成分析
          </p>
        </div>

        {/* 年度摘要 - Neo Brutalism Cards */}
        <div className="bg-[var(--nb-white)] nb-border nb-shadow-lg p-5">
          <h3 className="text-lg font-black text-[var(--nb-black)] mb-4 nb-heading uppercase">年度摘要</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-[var(--nb-yellow)] nb-border p-3">
              <div className="text-3xl font-black text-[var(--nb-black)] nb-heading">{totalTasks}</div>
              <div className="text-xs font-bold text-[var(--nb-black)] uppercase mt-1">完成任務</div>
            </div>
            <div className="bg-[var(--nb-lime)] nb-border p-3">
              <div className="text-3xl font-black text-[var(--nb-black)] nb-heading">{totalLines}</div>
              <div className="text-xs font-bold text-[var(--nb-black)] uppercase mt-1">連線數</div>
            </div>
            <div className="bg-[var(--nb-coral)] nb-border p-3">
              <div className="text-3xl font-black text-[var(--nb-white)] nb-heading">{fullHouseDays}</div>
              <div className="text-xs font-bold text-[var(--nb-white)] uppercase mt-1">全清天數</div>
            </div>
          </div>
        </div>

        {/* 活躍度熱力圖 */}
        <div className="bg-[var(--nb-white)] nb-border nb-shadow-lg p-5 overflow-hidden">
          <h3 className="text-lg font-black text-[var(--nb-black)] mb-4 nb-heading uppercase">活躍度</h3>
          <ActivityHeatmap
            data={yearStats}
            onDateClick={setSelectedDate}
            selectedDate={selectedDate}
          />
        </div>

        {/* 每日任務清單 */}
        {selectedDate && (
          <DailyTaskList date={selectedDate} />
        )}

        {/* 歷史圖表 (最近7天) */}
        <div className="bg-[var(--nb-white)] nb-border nb-shadow-lg p-5">
          <HistoryChart data={recentStats} days={7} />
        </div>

        {/* 分類統計 */}
        <div className="bg-[var(--nb-white)] nb-border nb-shadow-lg p-5">
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
