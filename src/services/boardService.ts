import { v4 as uuidv4 } from 'uuid';
import { db } from './database';
import type { BingoBoard, Task, TaskInput, BoardType } from '@/types';

export async function createBoard(
  taskInputs: TaskInput[],
  type: BoardType = 'daily',
  parentId?: string,
  rootId?: string,
  position?: number
): Promise<BingoBoard> {
  const boardId = uuidv4();
  const today = new Date().toISOString().split('T')[0];

  // 建立 9 個任務
  const tasks: Task[] = taskInputs.map((input, index) => ({
    id: uuidv4(),
    boardId,
    name: input.name.trim(),
    category: input.category,
    position: index,
    isCompleted: false,
    completedAt: null,
    comboMultiplier: 1,
    points: 0,
  }));

  const board: BingoBoard = {
    id: boardId,
    type,
    date: today,
    parentId,
    rootId,
    position,
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

  // 更新統計 (僅針對主板或獨立板)
  if (!parentId) {
    const stats = await db.stats.get('global');
    if (stats) {
      await db.stats.update('global', {
        totalBoards: stats.totalBoards + 1,
      });
    }
  }

  return board;
}

export async function createMandalartSet(
  mainGoal: string,
  subGoals: string[]
): Promise<BingoBoard> {
  const rootId = uuidv4();

  // 1. 建立核心板 (Root Board)
  // 核心板的任務是 8 個子目標 + 1 個最終目標 (中間)
  // 位置 4 是最終目標，其他是子目標
  const rootTasksInputs: TaskInput[] = [];
  for (let i = 0; i < 9; i++) {
    if (i === 4) {
      rootTasksInputs.push({ name: mainGoal, category: 'personal' });
    } else {
      // 映射子目標索引 (0-7) 到九宮格位置 (跳過 4)
      const subGoalIndex = i > 4 ? i - 1 : i;
      rootTasksInputs.push({ name: subGoals[subGoalIndex] || '未設定', category: 'work' });
    }
  }

  const rootBoard = await createBoard(rootTasksInputs, 'mandalart', undefined, rootId);

  // 2. 建立 8 個延伸板 (Sub Boards)
  for (let i = 0; i < 9; i++) {
    if (i === 4) continue; // 跳過中間

    const subGoalIndex = i > 4 ? i - 1 : i;
    const subGoalName = subGoals[subGoalIndex] || '未設定';

    // 預設子板任務
    const subBoardTasks: TaskInput[] = Array(9).fill({ name: '待規劃', category: 'work' });
    subBoardTasks[4] = { name: subGoalName, category: 'work' }; // 中間是子目標

    const subBoard = await createBoard(subBoardTasks, 'mandalart', rootBoard.id, rootId, i);

    // 更新核心板對應任務的 relatedBoardId
    // 核心板任務位置映射：
    // 0(左上) -> subBoard 0
    // 1(中上) -> subBoard 1
    // ...
    // 4(中間) -> 最終目標 (無 subBoard)
    // ...
    // 8(右下) -> subBoard 8

    // 找出核心板中對應位置的任務
    const rootTaskPosition = i;
    const rootTask = rootBoard.tasks.find(t => t.position === rootTaskPosition);
    if (rootTask) {
      await db.tasks.update(rootTask.id, { relatedBoardId: subBoard.id });
      rootTask.relatedBoardId = subBoard.id; // 更新記憶體中的物件
    }
  }

  return rootBoard;
}

export async function getBoard(
  type: BoardType = 'daily',
  date?: string
): Promise<BingoBoard | undefined> {
  const targetDate = date || new Date().toISOString().split('T')[0];

  let board: BingoBoard | undefined;

  if (type === 'mandalart') {
    // 獲取最新的 Mandalart Root Board
    board = await db.boards
      .where('type')
      .equals('mandalart')
      .and(b => !b.parentId) // 只找 Root
      .last();
  } else {
    // Daily or Weekly
    // 由於可能有多個同類型的板（例如重新建立），我們需要找出最新建立的一個
    // 因為 [type+date] 索引不保證順序，我們需要取出所有符合的並在記憶體中排序
    const boards = await db.boards
      .where('[type+date]')
      .equals([type, targetDate])
      .toArray();

    // 降序排序，取第一個（最新的）
    board = boards.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
  }

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

export async function updateTaskName(taskId: string, name: string): Promise<void> {
  await db.tasks.update(taskId, { name });
}

export async function toggleTask(
  boardId: string,
  taskId: string
): Promise<Task | undefined> {
  const task = await db.tasks.get(taskId);
  if (!task) return undefined;

  const isCompleting = !task.isCompleted;
  // 移除連擊加成，固定分數為 10 分
  const points = isCompleting ? 10 : 0;

  await db.tasks.update(taskId, {
    isCompleted: isCompleting,
    completedAt: isCompleting ? new Date() : null,
    comboMultiplier: 1, // 保持為 1，不再使用連擊
    points,
  });

  // 更新板總分
  const board = await db.boards.get(boardId);
  if (board) {
    const allTasks = await db.tasks.where('boardId').equals(boardId).toArray();
    const totalScore = allTasks.reduce((sum, t) => sum + t.points, 0);
    await db.boards.update(boardId, { score: totalScore });

    // Mandalart 邏輯：如果這是子板，檢查是否所有周圍任務都完成了
    if (board.type === 'mandalart' && board.parentId && board.rootId) {
      // 找出所有非中間(位置4)的任務
      const surroundingTasks = allTasks.filter(t => t.position !== 4);
      const allSurroundingCompleted = surroundingTasks.every(t => t.isCompleted);

      // 找出中間任務 (子目標)
      const centerTask = allTasks.find(t => t.position === 4);

      if (centerTask) {
        // 如果周圍都完成了，自動完成中間任務
        // 如果有任何一個未完成，中間任務設為未完成 (或者保持不變? 這裡假設是嚴格連動)
        // 用戶希望的是：子目標都完成了，中間的核心目標才能點擊 -> 這是指 Root Board 的中間
        // 這裡我們處理的是：子板的 8 個任務完成了 -> 子板的中間任務完成 -> Root Board 對應的任務完成

        if (allSurroundingCompleted && !centerTask.isCompleted) {
          await toggleTask(boardId, centerTask.id);
        } else if (!allSurroundingCompleted && centerTask.isCompleted) {
          // 選擇性：如果取消了某個任務，是否要取消中間任務？
          // 為了保持一致性，應該取消
          await toggleTask(boardId, centerTask.id);
        }
      }

      // 傳播到 Root Board
      // 找出 Root Board 中對應這個子板的任務
      // 我們可以透過 relatedBoardId 反查，或者透過位置計算
      // 最準確的是反查
      const rootBoard = await db.boards.get(board.rootId);
      if (rootBoard) {
        const rootTasks = await db.tasks.where('boardId').equals(rootBoard.id).toArray();
        const relatedTask = rootTasks.find(t => t.relatedBoardId === board.id);

        if (relatedTask) {
          // 如果子板的中間任務完成了，Root Board 的對應任務也完成
          // 注意：我們剛剛可能才更新了 centerTask，所以要重新獲取
          const updatedCenterTask = await db.tasks.get(centerTask?.id || '');
          const isCenterCompleted = updatedCenterTask?.isCompleted || false;

          if (relatedTask.isCompleted !== isCenterCompleted) {
            await toggleTask(rootBoard.id, relatedTask.id);
          }
        }
      }
    }
  }

  // 更新全局統計
  const stats = await db.stats.get('global');
  if (stats && isCompleting) {
    const updatedCategoryStats = { ...stats.categoryStats };
    updatedCategoryStats[task.category] = (updatedCategoryStats[task.category] || 0) + 1;

    await db.stats.update('global', {
      totalTasks: stats.totalTasks + 1,
      categoryStats: updatedCategoryStats,
    });
  }

  // 更新每日統計
  const today = new Date().toISOString().split('T')[0];
  const dailyStats = await db.dailyStats.get(today);

  if (dailyStats) {
    const categoryBreakdown = { ...dailyStats.categoryBreakdown };
    if (isCompleting) {
      categoryBreakdown[task.category] = (categoryBreakdown[task.category] || 0) + 1;
      await db.dailyStats.update(today, {
        tasksCompleted: dailyStats.tasksCompleted + 1,
        categoryBreakdown,
        score: dailyStats.score + points,
      });
    } else {
      // 如果取消完成，扣除數量
      categoryBreakdown[task.category] = Math.max((categoryBreakdown[task.category] || 0) - 1, 0);
      await db.dailyStats.update(today, {
        tasksCompleted: Math.max(dailyStats.tasksCompleted - 1, 0),
        categoryBreakdown,
        score: Math.max(dailyStats.score - points, 0),
      });
    }
  } else if (isCompleting) {
    // 如果今天還沒有統計資料，且是完成任務，則建立新資料
    await db.dailyStats.put({
      id: today,
      date: today,
      tasksCompleted: 1,
      linesCompleted: 0,
      isFullHouse: false,
      score: points,
      categoryBreakdown: {
        work: 0,
        health: 0,
        personal: 0,
        learning: 0,
        free: 0,
        [task.category]: 1,
      },
    });
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
