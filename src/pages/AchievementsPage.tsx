import { Link } from 'react-router-dom';
import { AchievementList } from '@/components/Achievement';
import { Button } from '@/components/common';
import { useAchievements } from '@/hooks/useAchievements';

export function AchievementsPage() {
  const { achievements, unlockedCount, totalCount, isLoading } = useAchievements();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* 標題 */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">成就</h1>
          <p className="text-sm text-gray-500">
            已解鎖 {unlockedCount} / {totalCount}
          </p>
        </div>

        {/* 進度條 */}
        <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all"
              style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
            />
          </div>
          <p className="text-center text-sm text-gray-500 mt-2">
            {Math.round((unlockedCount / totalCount) * 100)}% 完成
          </p>
        </div>

        {/* 成就列表 */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <AchievementList achievements={achievements} showLocked />
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
