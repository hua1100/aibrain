import { create } from 'zustand';
import type { BingoBoard, Task, TaskInput } from '@/types';
import {
  createBoard as createBoardService,
  getTodayBoard,
  toggleTask as toggleTaskService,
  updateBoardLines,
  markBoardCompleted,
} from '@/services/boardService';
import { LINES } from '@/constants';

interface BoardState {
  currentBoard: BingoBoard | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadTodayBoard: () => Promise<void>;
  createBoard: (tasks: TaskInput[]) => Promise<BingoBoard>;
  toggleTask: (taskId: string) => Promise<void>;
  checkLines: () => Promise<number[][]>;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  currentBoard: null,
  isLoading: false,
  error: null,

  loadTodayBoard: async () => {
    set({ isLoading: true, error: null });
    try {
      const board = await getTodayBoard();
      set({ currentBoard: board || null, isLoading: false });
    } catch (error) {
      set({ error: '載入失敗', isLoading: false });
      console.error('Failed to load today board:', error);
    }
  },

  createBoard: async (tasks: TaskInput[]) => {
    set({ isLoading: true, error: null });
    try {
      const board = await createBoardService(tasks);
      set({ currentBoard: board, isLoading: false });
      return board;
    } catch (error) {
      set({ error: '建立失敗', isLoading: false });
      console.error('Failed to create board:', error);
      throw error;
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
      await toggleTaskService(currentBoard.id, taskId, 1);

      // 檢查連線
      await get().checkLines();
    } catch (error) {
      // 回滾
      set({ currentBoard });
      console.error('Failed to toggle task:', error);
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
}));
