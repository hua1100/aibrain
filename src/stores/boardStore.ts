import { create } from 'zustand';
import type { BingoBoard, TaskInput, BoardType } from '@/types';
import {
  createBoard as createBoardService,
  toggleTask as toggleTaskService,
  updateTaskName as updateTaskNameService,
  createMandalartSet,
  updateBoardLines,
  markBoardCompleted,
} from '@/services/boardService';
import { LINES } from '@/constants';

interface BoardState {
  currentBoard: BingoBoard | null;
  isLoading: boolean;
  error: string | null;

  // Persistent Board State
  carryOverTasks: TaskInput[];

  // Actions
  loadTodayBoard: () => Promise<void>; // Deprecated, alias to loadActiveBoard

  loadActiveBoard: () => Promise<void>;
  loadMandalartBoard: () => Promise<void>;
  loadBoard: (type?: BoardType, date?: string) => Promise<void>;
  createBoard: (tasks: TaskInput[], type?: BoardType, date?: string) => Promise<BingoBoard>;
  createMandalart: (goal: string, subGoals: string[]) => Promise<BingoBoard>;
  navigateToBoard: (boardId: string) => Promise<void>;
  toggleTask: (taskId: string) => Promise<void>;
  updateTaskName: (taskId: string, name: string) => Promise<void>;
  checkLines: () => Promise<number[][]>;
  deleteBoard: (boardId: string) => Promise<void>;
  resetBoardProgress: (boardId: string) => Promise<void>;
  archiveCurrentBoard: () => Promise<void>;
  setCarryOverTasks: (tasks: TaskInput[]) => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  currentBoard: null,
  isLoading: false,
  error: null,
  carryOverTasks: [],

  loadTodayBoard: async () => {
    await get().loadActiveBoard();
  },

  loadActiveBoard: async () => {
    set({ isLoading: true, error: null });
    try {
      const { getActiveBoard } = await import('@/services/boardService');
      const board = await getActiveBoard();
      set({ currentBoard: board || null, isLoading: false });
    } catch (error) {
      set({ error: '載入失敗', isLoading: false });
      console.error('Failed to load active board:', error);
    }
  },

  loadMandalartBoard: async () => {
    set({ isLoading: true, error: null });
    try {
      const { getBoard } = await import('@/services/boardService');
      const board = await getBoard('mandalart');
      set({ currentBoard: board || null, isLoading: false });
    } catch (error) {
      set({ error: '載入失敗', isLoading: false });
      console.error('Failed to load mandalart board:', error);
    }
  },

  createBoard: async (tasks: TaskInput[], type: BoardType = 'daily', date?: string) => {
    set({ isLoading: true, error: null });
    try {
      const board = await createBoardService(tasks, type, undefined, undefined, undefined, date);
      set({ currentBoard: board, isLoading: false });
      return board;
    } catch (error) {
      set({ error: '建立失敗', isLoading: false });
      console.error('Failed to create board:', error);
      throw error;
    }
  },

  loadBoard: async (type: BoardType = 'daily', date?: string) => {
    set({ isLoading: true, error: null });
    try {
      const { getBoard } = await import('@/services/boardService');
      const board = await getBoard(type, date);
      set({ currentBoard: board || null, isLoading: false });
    } catch (error) {
      set({ error: '載入失敗', isLoading: false });
      console.error('Failed to load board:', error);
    }
  },

  createMandalart: async (goal: string, subGoals: string[]) => {
    set({ isLoading: true, error: null });
    try {
      const board = await createMandalartSet(goal, subGoals);
      set({ currentBoard: board, isLoading: false });
      return board;
    } catch (error) {
      set({ error: '建立失敗', isLoading: false });
      console.error('Failed to create mandalart:', error);
      throw error;
    }
  },

  navigateToBoard: async (boardId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { getBoardById } = await import('@/services/boardService');
      const board = await getBoardById(boardId);
      if (board) {
        set({ currentBoard: board, isLoading: false });
      } else {
        set({ error: '找不到指定的 Bingo 板', isLoading: false });
      }
    } catch (error) {
      set({ error: '載入失敗', isLoading: false });
      console.error('Failed to navigate to board:', error);
    }
  },

  toggleTask: async (taskId: string) => {
    const { currentBoard } = get();
    if (!currentBoard) return;

    try {
      // 先更新 UI（樂觀更新）
      const updatedTasks = currentBoard.tasks.map((task) =>
        task.id === taskId
          ? { ...task, isCompleted: !task.isCompleted, completedAt: !task.isCompleted ? new Date() : null }
          : task
      );

      set({
        currentBoard: { ...currentBoard, tasks: updatedTasks },
      });

      // 後台更新資料庫
      await toggleTaskService(currentBoard.id, taskId);

      // 檢查連線
      await get().checkLines();
    } catch (error) {
      // 回滾
      set({ currentBoard });
      console.error('Failed to toggle task:', error);
    }
  },

  updateTaskName: async (taskId: string, name: string) => {
    const { currentBoard } = get();
    if (!currentBoard) return;

    try {
      // 樂觀更新
      const updatedTasks = currentBoard.tasks.map((task) =>
        task.id === taskId ? { ...task, name } : task
      );

      set({
        currentBoard: { ...currentBoard, tasks: updatedTasks },
      });

      await updateTaskNameService(taskId, name);
    } catch (error) {
      console.error('Failed to update task name:', error);
    }
  },

  checkLines: async () => {
    const { currentBoard } = get();
    if (!currentBoard) return [];

    // 建立完成狀態陣列
    const completionStatus = new Array(9).fill(false);
    currentBoard.tasks.forEach((task) => {
      completionStatus[task.position] = task.isCompleted;
    });

    // 檢測已完成的連線
    const completedLines = LINES.filter((line) =>
      line.every((index) => completionStatus[index])
    );

    // 更新資料庫
    await updateBoardLines(currentBoard.id, completedLines);

    // 檢查是否全清
    const allCompleted = completionStatus.every((status) => status);
    if (allCompleted && currentBoard.status !== 'completed') {
      await markBoardCompleted(currentBoard.id);
      set({
        currentBoard: {
          ...currentBoard,
          completedLines,
          status: 'completed',
          completedAt: new Date(),
        },
      });
    } else {
      set({
        currentBoard: { ...currentBoard, completedLines },
      });
    }

    return completedLines;
  },

  deleteBoard: async (boardId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { deleteBoard } = await import('@/services/boardService');
      await deleteBoard(boardId);
      set({ currentBoard: null, isLoading: false });
    } catch (error) {
      set({ error: '刪除失敗', isLoading: false });
      console.error('Failed to delete board:', error);
      throw error;
    }
  },

  resetBoardProgress: async (boardId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { resetBoardProgress, getBoardById } = await import('@/services/boardService');
      await resetBoardProgress(boardId);

      // 重新載入 Board 以更新狀態
      const updatedBoard = await getBoardById(boardId);
      set({ currentBoard: updatedBoard || null, isLoading: false });
    } catch (error) {
      set({ error: '重置失敗', isLoading: false });
      console.error('Failed to reset board progress:', error);
      throw error;
    }
  },

  archiveCurrentBoard: async () => {
    const { currentBoard } = get();
    if (!currentBoard) return;

    set({ isLoading: true, error: null });
    try {
      const { archiveBoard } = await import('@/services/boardService');
      await archiveBoard(currentBoard.id);

      // 歸檔後，清除當前板
      set({ currentBoard: null, isLoading: false });
    } catch (error) {
      set({ error: '歸檔失敗', isLoading: false });
      console.error('Failed to archive board:', error);
      throw error;
    }
  },

  setCarryOverTasks: (tasks: TaskInput[]) => {
    set({ carryOverTasks: tasks });
  },
}));
