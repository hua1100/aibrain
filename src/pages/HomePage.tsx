import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BingoBoard } from '@/components/BingoBoard';
import { Button } from '@/components/common';
import { useBingoBoard } from '@/hooks/useBingoBoard';

export function HomePage() {
  const navigate = useNavigate();
  const { board, isLoading, hasBoard, toggleTask } = useBingoBoard();

  useEffect(() => {
    // 如果沒有今日 Bingo 板，導向建立頁面
    if (!isLoading && !hasBoard) {
      navigate('/create');
    }
  }, [isLoading, hasBoard, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  if (!board) {
    return null;
  }

  const completedCount = board.tasks.filter((t) => t.isCompleted).length;
  const lineCount = board.completedLines.length;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* 標題 */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            今日 Bingo
          </h1>
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString('zh-TW', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </p>
        </div>

        {/* 統計資訊 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <div className="text-2xl font-bold text-indigo-600">{completedCount}/9</div>
            <div className="text-xs text-gray-500">已完成</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <div className="text-2xl font-bold text-green-600">{lineCount}</div>
            <div className="text-xs text-gray-500">連線</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <div className="text-2xl font-bold text-yellow-600">{board.score}</div>
            <div className="text-xs text-gray-500">分數</div>
          </div>
        </div>

        {/* Bingo 板 */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <BingoBoard
            tasks={board.tasks}
            onTaskClick={(task) => toggleTask(task.id)}
            completedLines={board.completedLines}
          />
        </div>

        {/* 全清訊息 */}
        {board.status === 'completed' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center mb-6">
            <div className="text-2xl mb-2">🎉</div>
            <h3 className="font-bold text-green-800">恭喜全清！</h3>
            <p className="text-sm text-green-600">你完成了今天所有任務</p>
          </div>
        )}

        {/* 底部導航 */}
        <div className="flex gap-3">
          <Link to="/stats" className="flex-1">
            <Button variant="outline" className="w-full">
              統計
            </Button>
          </Link>
          <Link to="/achievements" className="flex-1">
            <Button variant="outline" className="w-full">
              成就
            </Button>
          </Link>
          <Link to="/settings" className="flex-1">
            <Button variant="ghost" className="w-full">
              設定
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
