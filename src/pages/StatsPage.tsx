import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CategoryStats, ActivityHeatmap, DailyTaskList } from '@/components/Stats';
import { Button } from '@/components/common';
import { getCategoryStats, getStatsInRange } from '@/services/statsService';
import { getCurrentUser } from '@/services/authService';
import { getSettings } from '@/services/settingsService';
import type { DailyStats, CategoryConfig } from '@/types';

export function StatsPage() {
  const [yearStats, setYearStats] = useState<DailyStats[]>([]);
  const [categoryStats, setCategoryStats] = useState<Record<string, number>>({});
  const [categories, setCategories] = useState<CategoryConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    async function loadStats() {
      try {
        const today = new Date();
        const user = await getCurrentUser();

        // 使用使用者註冊時間作為起始時間，如果沒有則預設為今年年初
        let startDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
        if (user?.created_at) {
          startDate = user.created_at.split('T')[0];
        }

        const endOfYear = new Date(today.getFullYear(), 11, 31).toISOString().split('T')[0];

        const [yearData, statsCategories, settings] = await Promise.all([
          getStatsInRange(startDate, endOfYear),
          getCategoryStats(),
          getSettings(),
        ]);
        setYearStats(yearData);
        setCategoryStats(statsCategories);
        if (settings?.categories) {
          setCategories(settings.categories);
        }
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

        {/* 歷史圖表 (最近7天) - 已移除 */}
        {/* <div className="bg-[var(--nb-white)] nb-border nb-shadow-lg p-5">
          <HistoryChart data={recentStats} days={7} />
        </div> */}

        {/* 分類統計 */}
        <div className="bg-[var(--nb-white)] nb-border nb-shadow-lg p-5">
          <CategoryStats data={categoryStats} categories={categories} />
        </div>

        {/* 危險區域 - 重置所有進度 */}
        <div className="bg-red-50 border-2 border-red-200 p-5 rounded-lg">
          <h3 className="text-lg font-black text-red-600 mb-2 nb-heading uppercase">危險區域</h3>
          <p className="text-sm text-red-500 font-bold mb-4">
            此操作將重置所有任務進度、統計數據和成就。此動作無法復原。
          </p>
          <Button
            variant="outline"
            className="w-full text-red-500 border-red-200 hover:bg-red-100 hover:text-red-600"
            onClick={async () => {
              if (confirm('確定要重置所有進度嗎？這將清空所有統計數據和任務狀態，且無法復原！')) {
                try {
                  const { resetAllUserProgress } = await import('@/services/boardService');
                  await resetAllUserProgress();
                  alert('所有進度已重置');
                  window.location.reload();
                } catch (error) {
                  console.error('重置失敗:', error);
                  alert('重置失敗，請稍後再試');
                }
              }
            }}
          >
            重置所有進度
          </Button>
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
