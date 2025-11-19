import { useEffect } from 'react';
import { useBoardStore } from '@/stores/boardStore';

export function useBingoBoard() {
  const {
    currentBoard,
    isLoading,
    error,
    loadTodayBoard,
    createBoard,
    toggleTask,
  } = useBoardStore();

  useEffect(() => {
    loadTodayBoard();
  }, [loadTodayBoard]);

  return {
    board: currentBoard,
    isLoading,
    error,
    hasBoard: !!currentBoard,
    createBoard,
    toggleTask,
    reload: loadTodayBoard,
  };
}
