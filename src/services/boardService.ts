import { v4 as uuidv4 } from 'uuid';
import { db } from './database';
import type { BingoBoard, Task, TaskInput } from '@/types';
import { FREE_SPACE_POSITION } from '@/constants';

export async function createBoard(taskInputs: TaskInput[]): Promise<BingoBoard> {
  const boardId = uuidv4();
  const today = new Date().toISOString().split('T')[0];

  // 建立任務（跳過位置 4 給免費格）
  const tasks: Task[] = taskInputs.map((input, index) => ({
    id: uuidv4(),
    boardId,
    name: input.name.trim(),
    category: input.category,
    position: index < FREE_SPACE_POSITION ? index : index + 1,
    isCompleted: false,
    isFreeSpace: false,
    completedAt: null,
    comboMultiplier: 1,
    points: 0,
  }));

  // 插入免費格（位置 4）
  const freeSpaceTask: Task = {
    id: uuidv4(),
    boardId,
    name: '免費',
    category: 'free',
    position: FREE_SPACE_POSITION,
    isCompleted: true,
    isFreeSpace: true,
    completedAt: new Date(),
    comboMultiplier: 1,
    points: 0,
  };

  // 按位置排序插入免費格
  tasks.splice(FREE_SPACE_POSITION, 0, freeSpaceTask);

  const board: BingoBoard = {
    id: boardId,
    date: today,
    tasks,
    completedLines: [],
    status: 'in_progress',
    score: 0,
    maxCombo: 0,
    createdAt: new Date(),
    completedAt: null,
  };

  // 儲存到 IndexedDB
  await db.transaction('rw', db.boards, db.tasks, async () => {
    await db.boards.add(board);
    await db.tasks.bulkAdd(tasks);
  });

  // 更新統計
  const stats = await db.stats.get('global');
  if (stats) {
    await db.stats.update('global', {
      totalBoards: stats.totalBoards + 1,
    });
  }

  return board;
}

export async function getTodayBoard(): Promise<BingoBoard | undefined> {
  const today = new Date().toISOString().split('T')[0];
  const board = await db.boards.where('date').equals(today).first();

  if (board) {
    // 載入關聯的任務
    const tasks = await db.tasks.where('boardId').equals(board.id).toArray();
    board.tasks = tasks.sort((a, b) => a.position - b.position);
  }

  return board;
}

export async function getBoardById(boardId: string): Promise<BingoBoard | undefined> {
  const board = await db.boards.get(boardId);

  if (board) {
    const tasks = await db.tasks.where('boardId').equals(board.id).toArray();
    board.tasks = tasks.sort((a, b) => a.position - b.position);
  }

  return board;
}

export async function toggleTask(
  boardId: string,
  taskId: string,
  comboMultiplier: number = 1
): Promise<Task | undefined> {
  const task = await db.tasks.get(taskId);
  if (!task || task.isFreeSpace) return undefined;

  const isCompleting = !task.isCompleted;
  const points = isCompleting ? 10 * comboMultiplier : 0;

  await db.tasks.update(taskId, {
    isCompleted: isCompleting,
    completedAt: isCompleting ? new Date() : null,
    comboMultiplier: isCompleting ? comboMultiplier : 1,
    points,
  });

  // 更新板總分
  const board = await db.boards.get(boardId);
  if (board) {
    const allTasks = await db.tasks.where('boardId').equals(boardId).toArray();
    const totalScore = allTasks.reduce((sum, t) => sum + t.points, 0);
    await db.boards.update(boardId, { score: totalScore });
  }

  return db.tasks.get(taskId);
}

export async function updateBoardLines(
  boardId: string,
  completedLines: number[][]
): Promise<void> {
  await db.boards.update(boardId, { completedLines });
}

export async function markBoardCompleted(boardId: string): Promise<void> {
  await db.boards.update(boardId, {
    status: 'completed',
    completedAt: new Date(),
  });

  // 更新統計
  const stats = await db.stats.get('global');
  if (stats) {
    await db.stats.update('global', {
      totalFullHouses: stats.totalFullHouses + 1,
    });
  }
}
