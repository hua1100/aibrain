import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BingoBoard } from '@/components/BingoBoard';
import { ComboDisplay } from '@/components/BingoBoard/ComboDisplay';
import { LineComplete, Confetti } from '@/components/Celebration';
import { AchievementUnlock } from '@/components/Achievement';
import { Button, ShareButton } from '@/components/common';
import { useBingoBoard } from '@/hooks/useBingoBoard';
import { useSound } from '@/hooks/useSound';
import { useLineDetection } from '@/hooks/useLineDetection';
import { useCombo } from '@/hooks/useCombo';
import { useAchievements } from '@/hooks/useAchievements';

export function HomePage() {
  const navigate = useNavigate();
  const { board, isLoading, hasBoard, toggleTask } = useBingoBoard();
  const { playLineComplete, playFullHouse, playTaskComplete, playTaskUncomplete } = useSound();
  const combo = useCombo();
  const { newlyUnlocked, clearNewlyUnlocked, checkAndUnlock } = useAchievements();

  const [currentLine, setCurrentLine] = useState<number[] | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // 連線檢測
  useLineDetection((line) => {
    setCurrentLine(line);
    playLineComplete();
  });

  useEffect(() => {
    // 如果沒有今日 Bingo 板，導向建立頁面
    if (!isLoading && !hasBoard) {
      navigate('/create');
    }
  }, [isLoading, hasBoard, navigate]);

  useEffect(() => {
    // 檢測全清
    if (board?.status === 'completed' && !showConfetti) {
      setShowConfetti(true);
      playFullHouse();
    }
  }, [board?.status, showConfetti, playFullHouse]);

  const handleTaskClick = async (task: any) => {
    // 播放音效
    if (!task.isCompleted) {
      playTaskComplete();
      combo.recordCompletion();

      // 檢查成就
      const completedCount = board?.tasks.filter((t) => t.isCompleted).length || 0;
      await checkAndUnlock({
        linesCompleted: board?.completedLines.length || 0,
        isFullHouse: completedCount + 1 === 9,
        comboCount: combo.count + 1,
      });
    } else {
      playTaskUncomplete();
    }

    // 切換任務狀態
    toggleTask(task.id);
  };

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
            onTaskClick={handleTaskClick}
            completedLines={board.completedLines}
          />
        </div>

        {/* 全清訊息 */}
        {board.status === 'completed' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center mb-6">
            <div className="text-2xl mb-2">🎉</div>
            <h3 className="font-bold text-green-800">恭喜全清！</h3>
            <p className="text-sm text-green-600 mb-3">你完成了今天所有任務</p>
            <ShareButton board={board} />
          </div>
        )}

        {/* 分享按鈕（有連線時顯示） */}
        {lineCount > 0 && board.status !== 'completed' && (
          <div className="mb-6">
            <ShareButton board={board} />
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

      {/* Combo 顯示 */}
      <ComboDisplay
        count={combo.count}
        multiplier={combo.multiplier}
        isActive={combo.isActive}
        timeRemaining={combo.formattedTime}
      />

      {/* 連線完成動畫 */}
      <LineComplete
        line={currentLine}
        onComplete={() => setCurrentLine(null)}
      />

      {/* 全清慶祝動畫 */}
      <Confetti
        isActive={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />

      {/* 成就解鎖通知 */}
      <AchievementUnlock
        types={newlyUnlocked}
        onComplete={clearNewlyUnlocked}
      />
    </div>
  );
}
