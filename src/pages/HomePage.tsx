import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BingoBoard } from '@/components/BingoBoard';
import { LineComplete, Confetti } from '@/components/Celebration';
import { Button, ShareButton } from '@/components/common';
import { MandalartView } from '@/components/Mandalart/MandalartView';
import { useBingoBoard } from '@/hooks/useBingoBoard';
import { useSound } from '@/hooks/useSound';
import { useLineDetection } from '@/hooks/useLineDetection';
import { useSettings } from '@/hooks/useSettings';
import type { BoardType, Task } from '@/types';

import { useBoardStore } from '@/stores/boardStore';
import { getUnfinishedTasks } from '@/services/boardService';

export function HomePage() {
  const {
    currentBoard: board,
    isLoading,
    loadActiveBoard,
    loadMandalartBoard,
    toggleTask,
    navigateToBoard,
    updateTaskName,
    deleteBoard,
    archiveCurrentBoard,
    setCarryOverTasks,
  } = useBoardStore();

  const { playLineComplete, playFullHouse, playTaskComplete, playTaskUncomplete } = useSound();
  const { categories } = useSettings();



  const [currentLine, setCurrentLine] = useState<number[] | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [boardType, setBoardType] = useState<BoardType>('daily');

  const { boardId } = useParams<{ boardId: string }>();

  // 連線檢測
  useLineDetection((line) => {
    setCurrentLine(line);
    playLineComplete();
  });

  // 載入看板
  useEffect(() => {
    if (boardId) {
      navigateToBoard(boardId);
    } else {
      if (boardType === 'mandalart') {
        loadMandalartBoard();
      } else {
        loadActiveBoard();
      }
    }
  }, [boardType, loadActiveBoard, loadMandalartBoard, boardId, navigateToBoard]);

  // 為了避免修改 imports (雖然最好是加 useRef)，我們可以用一個簡單的 state 來記錄是否是第一次載入
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (board && !isLoaded) {
      setIsLoaded(true);
    }
  }, [board, isLoaded]);

  useEffect(() => {
    // 檢測全清
    // 只有在已經載入過(不是第一次渲染)且狀態為 completed 時才播放
    // 這樣可以避免重新整理頁面時播放
    if (isLoaded && board?.status === 'completed' && !showConfetti) {
      // 還有一個邊緣情況：如果用戶剛完成，isLoaded 已經是 true，所以會播放
      // 如果用戶重新整理，isLoaded 初始為 false，當 board 載入(completed)時，isLoaded 變 true
      // 下一次 render... 等等，這邏輯有點複雜。

      // 讓我們換個方式：檢查 completedAt 時間是否很近？
      // 或者，只在點擊任務導致狀態改變時播放？
      // 其實 playFullHouse 是在 checkLines (boardStore) 中呼叫會更好，但這裡是前端效果。

      // 簡單解法：檢查 completedAt 是否在過去 5 秒內
      const now = new Date().getTime();
      const completedAt = board.completedAt ? new Date(board.completedAt).getTime() : 0;

      if (now - completedAt < 5000) {
        setShowConfetti(true);
        playFullHouse();
      }
    }
  }, [board?.status, board?.completedAt, showConfetti, playFullHouse, isLoaded]);

  // 防止刷連擊：記錄最近取消的任務 ID
  const [recentlyUncompleted, setRecentlyUncompleted] = useState<Set<string>>(new Set());

  const handleTaskClick = async (task: Task) => {
    // 如果是 Mandalart 模式且有相關聯的板，則導航
    if (boardType === 'mandalart' && task.relatedBoardId) {
      navigateToBoard(task.relatedBoardId);
      return;
    }

    // 播放音效與連擊邏輯
    if (!task.isCompleted) {
      // 只有當任務不在「最近取消清單」中，才給予獎勵
      if (!recentlyUncompleted.has(task.id)) {
        playTaskComplete();
      }
    } else {
      playTaskUncomplete();
      // 加入最近取消清單
      setRecentlyUncompleted(prev => {
        const newSet = new Set(prev);
        newSet.add(task.id);
        return newSet;
      });
      // 5秒後移除，允許重新獲得獎勵（避免永久無法獲得）
      setTimeout(() => {
        setRecentlyUncompleted(prev => {
          const newSet = new Set(prev);
          newSet.delete(task.id);
          return newSet;
        });
      }, 5000);
    }

    // 切換任務狀態
    toggleTask(task.id);
  };

  const navigate = useNavigate();

  const handleCreateMandalart = () => {
    navigate('/create-mandalart');
  };

  const handleStartNewGame = async () => {
    // 如果有當前板，先檢查是否有未完成任務
    if (board) {
      try {
        const unfinishedTasks = await getUnfinishedTasks(board.id);
        if (unfinishedTasks.length > 0) {
          const confirmRollover = confirm(
            `您有 ${unfinishedTasks.length} 個未完成任務。要將它們帶入新的一局嗎？\n\n按「確定」帶入，按「取消」捨棄。`
          );

          if (confirmRollover) {
            setCarryOverTasks(unfinishedTasks.map(t => ({ name: t.name, category: t.category })));
          } else {
            setCarryOverTasks([]);
          }
        } else {
          setCarryOverTasks([]);
        }

        // 歸檔舊板
        await archiveCurrentBoard();
      } catch (error) {
        console.error('Error handling new game:', error);
      }
    } else {
      setCarryOverTasks([]);
    }

    navigate('/create');
  };

  const handleArchiveMandalart = async () => {
    if (confirm('確定要歸檔目前的曼陀羅計畫嗎？\n歸檔後將無法再編輯，但可以在歷史紀錄中查看。')) {
      await archiveCurrentBoard();
      navigate('/create-mandalart');
    }
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

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(135deg, var(--nb-purple) 0%, var(--nb-pink) 100%)' }}>
      <div className="max-w-md mx-auto">
        {/* 標題與切換 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col">
            {boardId && (
              <Link to="/" className="mb-2 inline-flex items-center text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">
                <span>←</span>
                <span className="ml-1">返回首頁</span>
              </Link>
            )}
            <h1 className="text-4xl font-black text-[var(--nb-black)] nb-heading">
              BINGO 待辦事項
            </h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              const { signOut } = await import('@/services/authService');
              await signOut();
            }}
          >
            登出
          </Button>
        </div>

        {/* 模式切換 Tabs - Neo Brutalism Style */}
        <div className="flex justify-center gap-3 mb-4">
          <button
            onClick={() => setBoardType('daily')}
            className={`
                  px-6 py-3 font-bold text-sm uppercase tracking-wide nb-border nb-shadow transition-all
                  ${boardType === 'daily'
                ? 'bg-[var(--nb-yellow)] text-[var(--nb-black)] transform -translate-y-1'
                : 'bg-[var(--nb-white)] text-[var(--nb-black)] hover:transform hover:-translate-y-0.5'}
                `}
          >
            當前進度
          </button>
          <button
            onClick={() => setBoardType('mandalart')}
            className={`
                  px-6 py-3 font-bold text-sm uppercase tracking-wide nb-border nb-shadow transition-all
                  ${boardType === 'mandalart'
                ? 'bg-[var(--nb-yellow)] text-[var(--nb-black)] transform -translate-y-1'
                : 'bg-[var(--nb-white)] text-[var(--nb-black)] hover:transform hover:-translate-y-0.5'}
                `}
          >
            曼陀羅計畫
          </button>
        </div>

        <p className="text-sm font-bold text-[var(--nb-black)] nb-text">
          {new Date().toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
          })}
        </p>

        {!board ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {boardType === 'mandalart' ? '尚未建立曼陀羅計畫' : '尚無進行中的 Bingo 板'}
            </h3>
            <p className="text-gray-500 mb-6">
              {boardType === 'mandalart'
                ? '建立一個核心目標，並延伸出 8 個子目標來達成它！'
                : '開始新的一局，建立你的 Bingo 挑戰吧！'}
            </p>
            {boardType === 'mandalart' ? (
              <Button onClick={handleCreateMandalart}>
                建立曼陀羅計畫
              </Button>
            ) : (
              <Button onClick={handleStartNewGame}>
                開始新的一局
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Mandalart 導航 */}
            {boardType === 'mandalart' && (
              <MandalartView
                currentBoard={board}
                onNavigate={navigateToBoard}
              />
            )}

            {/* 統計資訊 - Neo Brutalism Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-[var(--nb-yellow)] nb-border nb-shadow p-4 text-center">
                <div className="text-3xl font-black text-[var(--nb-black)] nb-heading">
                  {board.tasks.filter((t) => t.isCompleted).length}/9
                </div>
                <div className="text-xs font-bold text-[var(--nb-black)] uppercase mt-1">已完成</div>
              </div>
              <div className="bg-[var(--nb-lime)] nb-border nb-shadow p-4 text-center">
                <div className="text-3xl font-black text-[var(--nb-black)] nb-heading">
                  {board.completedLines.length}
                </div>
                <div className="text-xs font-bold text-[var(--nb-black)] uppercase mt-1">連線</div>
              </div>
              <div className="bg-[var(--nb-coral)] nb-border nb-shadow p-4 text-center">
                <div className="text-3xl font-black text-[var(--nb-white)] nb-heading">{board.score}</div>
                <div className="text-xs font-bold text-[var(--nb-white)] uppercase mt-1">分數</div>
              </div>
            </div>

            {/* Bingo 板 - Neo Brutalism Style */}
            <div className="mb-6">
              <BingoBoard
                tasks={board.tasks}
                onTaskClick={handleTaskClick}
                onEditTask={(task, newName) => {
                  updateTaskName(task.id, newName);
                }}
                completedLines={board.completedLines}
                isMandalartRoot={board.type === 'mandalart' && !board.parentId}
                isMandalartChild={board.type === 'mandalart' && !!board.parentId}
              />
            </div>

            {/* 全清訊息 */}
            {board.status === 'completed' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center mb-6">
                <div className="text-2xl mb-2">🎉</div>
                <h3 className="font-bold text-green-800">恭喜全清！</h3>
                <p className="text-sm text-green-600 mb-3">你完成了所有任務</p>
                <div className="flex justify-center gap-2">
                  <ShareButton board={board} />
                  {boardType === 'mandalart' ? (
                    <Button variant="outline" size="sm" onClick={handleArchiveMandalart}>
                      歸檔計畫
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={handleStartNewGame}>
                      開啟新局
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* 分享按鈕 */}
            {board.completedLines.length > 0 && board.status !== 'completed' && (
              <div className="mb-6">
                <ShareButton board={board} />
              </div>
            )}

            {/* 管理功能 */}
            <div className="mb-6 flex gap-2 justify-center">
              <Button
                variant="outline"
                className="text-red-500 border-red-200 hover:bg-red-50"
                onClick={async () => {
                  if (confirm('確定要刪除這個 Bingo 板嗎？此動作無法復原。')) {
                    await deleteBoard(board.id);
                  }
                }}
              >
                刪除 Bingo 板
              </Button>
            </div>

            {/* 結束本局按鈕 (Standard Only) */}
            {board.status === 'in_progress' && boardType !== 'mandalart' && (
              <div className="mb-6 flex justify-center">
                <Button
                  variant="outline"
                  className="w-full max-w-xs border-dashed border-2 hover:border-solid"
                  onClick={handleStartNewGame}
                >
                  結束本局並開始新的挑戰
                </Button>
              </div>
            )}

            {/* 歸檔按鈕 (Mandalart Only) */}
            {board.status === 'in_progress' && boardType === 'mandalart' && (
              <div className="mb-6 flex justify-center">
                <Button
                  variant="outline"
                  className="w-full max-w-xs border-dashed border-red-200 text-red-500 hover:bg-red-50 hover:border-red-500"
                  onClick={handleArchiveMandalart}
                >
                  歸檔此曼陀羅計畫
                </Button>
              </div>
            )}
          </>
        )}

        {/* 底部導航 */}
        <div className="flex gap-3 mt-6">
          <Link to="/stats" className="flex-1">
            <Button variant="outline" className="w-full">
              儀表板
            </Button>
          </Link>
          <Link to="/settings" className="flex-1">
            <Button variant="outline" className="w-full">
              設定
            </Button>
          </Link>
        </div>
      </div>


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
    </div >
  );
}
