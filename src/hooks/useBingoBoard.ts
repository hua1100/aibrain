import { useBoardStore } from '@/stores/boardStore';

export function useBingoBoard() {
  const {
    currentBoard,
    isLoading,
    error,
    loadTodayBoard,
    loadBoard,
    createBoard,
    createMandalart,
    navigateToBoard,
    toggleTask,
    updateTaskName,
    deleteBoard,
    resetBoardProgress,
  } = useBoardStore();

  return {
    board: currentBoard,
    isLoading,
    error,
    hasBoard: !!currentBoard,
    loadTodayBoard,
    loadBoard,
    createBoard,
    createMandalart,
    navigateToBoard,
    toggleTask,
    updateTaskName,
    deleteBoard,
    resetBoardProgress,
  };
}
