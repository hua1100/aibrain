import { v4 as uuidv4 } from 'uuid';
import { supabase } from './supabase';
import type { BingoBoard, Task, TaskInput, BoardType } from '@/types';

/**
 * 取得當前登入使用者 ID
 */
async function getCurrentUserId(): Promise<string> {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('使用者未登入');
  }

  return user.id;
}

/**
 * 將 Supabase Row 轉換為應用程式的 BingoBoard 型別
 */
function mapRowToBoard(row: any, tasks: Task[]): BingoBoard {
  return {
    id: row.id,
    type: row.type,
    date: row.date,
    parentId: row.parent_id,
    rootId: row.root_id,
    position: row.position,
    tasks,
    completedLines: row.completed_lines || [],
    status: row.status,
    score: row.score,
    maxCombo: row.max_combo,
    createdAt: new Date(row.created_at),
    completedAt: row.completed_at ? new Date(row.completed_at) : null,
  };
}

/**
 * 將 Supabase Task Row 轉換為應用程式的 Task 型別
 */
function mapRowToTask(row: any): Task {
  return {
    id: row.id,
    boardId: row.board_id,
    name: row.name,
    category: row.category,
    position: row.position,
    isCompleted: row.is_completed,
    relatedBoardId: row.related_board_id,
    completedAt: row.completed_at ? new Date(row.completed_at) : null,
    comboMultiplier: row.combo_multiplier,
    points: row.points,
  };
}

/**
 * 建立新的 Bingo 板
 */
export async function createBoard(
  taskInputs: TaskInput[],
  type: BoardType = 'daily',
  parentId?: string,
  rootId?: string,
  position?: number
): Promise<BingoBoard> {
  const userId = await getCurrentUserId();
  const boardId = uuidv4();
  const today = new Date().toISOString().split('T')[0];

  // 建立 board 記錄
  const { data: boardData, error: boardError } = await supabase
    .from('boards')
    .insert({
      id: boardId,
      user_id: userId,
      type,
      date: today,
      parent_id: parentId || null,
      root_id: rootId || null,
      position: position ?? null,
      completed_lines: [],
      status: 'in_progress',
      score: 0,
      max_combo: 0,
    })
    .select()
    .single();

  if (boardError) {
    console.error('建立 board 失敗:', boardError);
    throw new Error(`建立 board 失敗: ${boardError.message}`);
  }

  // 建立 9 個任務
  const tasksToInsert = taskInputs.map((input, index) => ({
    id: uuidv4(),
    board_id: boardId,
    user_id: userId,
    name: input.name.trim(),
    category: input.category,
    position: index,
    is_completed: false,
    combo_multiplier: 1,
    points: 0,
  }));

  const { data: tasksData, error: tasksError } = await supabase
    .from('tasks')
    .insert(tasksToInsert)
    .select();

  if (tasksError) {
    console.error('建立 tasks 失敗:', tasksError);
    // 回滾 board
    await supabase.from('boards').delete().eq('id', boardId);
    throw new Error(`建立 tasks 失敗: ${tasksError.message}`);
  }

  const tasks = tasksData.map(mapRowToTask);
  return mapRowToBoard(boardData, tasks);
}

/**
 * 建立 Mandalart 目標集 (1 個根板 + 8 個子板)
 */
export async function createMandalartSet(
  mainGoal: string,
  subGoals: string[]
): Promise<BingoBoard> {
  const userId = await getCurrentUserId();
  // const rootId = uuidv4(); // 移除預先生成的 rootId

  // 1. 建立核心板 (Root Board)
  const rootTasksInputs: TaskInput[] = [];
  for (let i = 0; i < 9; i++) {
    if (i === 4) {
      rootTasksInputs.push({ name: mainGoal, category: 'personal' });
    } else {
      const subGoalIndex = i > 4 ? i - 1 : i;
      rootTasksInputs.push({ name: subGoals[subGoalIndex] || '未設定', category: 'work' });
    }
  }

  // Root Board 的 root_id 設為 null (或是它自己的 ID,但這裡我們先設為 null)
  const rootBoard = await createBoard(rootTasksInputs, 'mandalart');

  // 2. 建立 8 個延伸板 (Sub Boards)
  const subBoardPromises = [];

  for (let i = 0; i < 9; i++) {
    if (i === 4) continue; // 跳過中間

    const subGoalIndex = i > 4 ? i - 1 : i;
    const subGoalName = subGoals[subGoalIndex] || '未設定';

    // 預設子板任務
    const subBoardTasks: TaskInput[] = Array(9).fill({ name: '待規劃', category: 'work' });
    subBoardTasks[4] = { name: subGoalName, category: 'work' }; // 中間是子目標

    subBoardPromises.push(
      createBoard(subBoardTasks, 'mandalart', rootBoard.id, rootBoard.id, i)
    );
  }

  const subBoards = await Promise.all(subBoardPromises);

  // 3. 更新核心板對應任務的 relatedBoardId
  const updatePromises = subBoards.map((subBoard, idx) => {
    // 計算對應的根板任務位置 (跳過位置 4)
    const position = idx >= 4 ? idx + 1 : idx;
    const rootTask = rootBoard.tasks.find(t => t.position === position);

    if (rootTask) {
      return supabase
        .from('tasks')
        .update({ related_board_id: subBoard.id })
        .eq('id', rootTask.id);
    }
    return Promise.resolve();
  });

  await Promise.all(updatePromises);

  // 重新載入 rootBoard 以取得更新後的 tasks
  return getBoardById(rootBoard.id) as Promise<BingoBoard>;
}

/**
 * 取得指定類型和日期的 Board
 */
export async function getBoard(
  type: BoardType = 'daily',
  date?: string
): Promise<BingoBoard | undefined> {
  const userId = await getCurrentUserId();
  const targetDate = date || new Date().toISOString().split('T')[0];

  let query = supabase
    .from('boards')
    .select('*')  // 先只查詢 board,不包含 tasks
    .eq('user_id', userId)
    .eq('type', type);

  if (type === 'mandalart') {
    // 獲取最新的 Mandalart Root Board
    query = query.is('parent_id', null).order('created_at', { ascending: false }).limit(1);
  } else {
    // Daily or Weekly
    query = query.eq('date', targetDate).order('created_at', { ascending: false }).limit(1);
  }

  const { data: boardDataArray, error } = await query;

  if (error) {
    console.error('取得 board 失敗:', error);
    throw new Error(`取得 board 失敗: ${error.message}`);
  }

  const boardData = boardDataArray?.[0];

  if (!boardData) return undefined;

  // 單獨查詢 tasks
  const { data: tasksData, error: tasksError } = await supabase
    .from('tasks')
    .select('*')
    .eq('board_id', boardData.id)
    .order('position', { ascending: true });

  if (tasksError) {
    console.error('取得 tasks 失敗:', tasksError);
    throw new Error(`取得 tasks 失敗: ${tasksError.message}`);
  }

  const tasks = (tasksData || []).map(mapRowToTask);
  return mapRowToBoard(boardData, tasks);
}

/**
 * 根據 ID 取得 Board
 */
export async function getBoardById(boardId: string): Promise<BingoBoard | undefined> {
  const userId = await getCurrentUserId();

  const { data: boardDataArray, error } = await supabase
    .from('boards')
    .select('*')  // 先只查詢 board
    .eq('id', boardId)
    .eq('user_id', userId)
    .limit(1);

  if (error) {
    console.error('取得 board 失敗:', error);
    throw new Error(`取得 board 失敗: ${error.message}`);
  }

  const boardData = boardDataArray?.[0];

  if (!boardData) return undefined;

  // 單獨查詢 tasks
  const { data: tasksData, error: tasksError } = await supabase
    .from('tasks')
    .select('*')
    .eq('board_id', boardId)
    .order('position', { ascending: true });

  if (tasksError) {
    console.error('取得 tasks 失敗:', tasksError);
    throw new Error(`取得 tasks 失敗: ${tasksError.message}`);
  }

  const tasks = (tasksData || []).map(mapRowToTask);
  return mapRowToBoard(boardData, tasks);
}

/**
 * 更新任務名稱
 */
export async function updateTaskName(taskId: string, name: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .update({ name })
    .eq('id', taskId);

  if (error) {
    console.error('更新任務名稱失敗:', error);
    throw new Error(`更新任務名稱失敗: ${error.message}`);
  }
}

/**
 * 切換任務完成狀態
 */
export async function toggleTask(
  boardId: string,
  taskId: string
): Promise<Task | undefined> {
  const userId = await getCurrentUserId();

  // 1. 取得任務當前狀態
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .eq('user_id', userId)
    .maybeSingle();

  if (taskError || !task) {
    console.error('取得任務失敗:', taskError);
    return undefined;
  }

  const isCompleting = !task.is_completed;
  const points = isCompleting ? 10 : 0;

  // 2. 更新任務狀態
  const { error: updateError } = await supabase
    .from('tasks')
    .update({
      is_completed: isCompleting,
      completed_at: isCompleting ? new Date().toISOString() : null,
      combo_multiplier: 1,
      points,
    })
    .eq('id', taskId);

  if (updateError) {
    console.error('更新任務失敗:', updateError);
    throw new Error(`更新任務失敗: ${updateError.message}`);
  }

  // 3. 更新板總分
  const { data: allTasks } = await supabase
    .from('tasks')
    .select('points')
    .eq('board_id', boardId);

  const totalScore = (allTasks || []).reduce((sum, t) => sum + t.points, 0);

  await supabase
    .from('boards')
    .update({ score: totalScore })
    .eq('id', boardId);

  // 4. Mandalart 邏輯處理
  const { data: board } = await supabase
    .from('boards')
    .select('type, parent_id, root_id')
    .eq('id', boardId)
    .maybeSingle();

  if (board?.type === 'mandalart' && board.parent_id && board.root_id) {
    await handleMandalartCompletion(boardId, board.parent_id, board.root_id);
  }

  // 5. 更新統計
  if (isCompleting) {
    await updateUserStats(userId, task.category, points);
    await updateDailyStats(userId, task.category, points);
  }

  // 6. 返回更新後的任務
  const { data: updatedTask } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .maybeSingle();

  return updatedTask ? mapRowToTask(updatedTask) : undefined;
}

/**
 * 處理 Mandalart 完成邏輯
 */
async function handleMandalartCompletion(
  boardId: string,
  parentId: string,
  rootId: string
): Promise<void> {
  // 取得所有任務
  const { data: allTasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('board_id', boardId);

  if (!allTasks) return;

  // 找出周圍任務 (非中間位置 4)
  const surroundingTasks = allTasks.filter(t => t.position !== 4);
  const allSurroundingCompleted = surroundingTasks.every(t => t.is_completed);

  // 找出中間任務
  const centerTask = allTasks.find(t => t.position === 4);

  // 移除自動完成中間任務的邏輯，改為由使用者手動點擊
  // if (centerTask) {
  //   // 如果周圍都完成了,自動完成中間任務
  //   if (allSurroundingCompleted && !centerTask.is_completed) {
  //     await toggleTask(boardId, centerTask.id);
  //   } else if (!allSurroundingCompleted && centerTask.is_completed) {
  //     await toggleTask(boardId, centerTask.id);
  //   }
  // }

  // 傳播到 Root Board
  const { data: rootTasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('board_id', rootId)
    .eq('related_board_id', boardId);

  if (rootTasks && rootTasks.length > 0) {
    const relatedTask = rootTasks[0];
    const { data: updatedCenterTask } = await supabase
      .from('tasks')
      .select('is_completed')
      .eq('id', centerTask?.id || '')
      .maybeSingle();

    const isCenterCompleted = updatedCenterTask?.is_completed || false;

    if (relatedTask.is_completed !== isCenterCompleted) {
      await toggleTask(rootId, relatedTask.id);
    }
  }
}

/**
 * 更新使用者統計
 */
async function updateUserStats(userId: string, category: string, points: number): Promise<void> {
  const { data: stats } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (stats) {
    const updatedCategoryStats = { ...(stats.category_stats as Record<string, number>) };
    updatedCategoryStats[category] = (updatedCategoryStats[category] || 0) + 1;

    await supabase
      .from('user_stats')
      .update({
        total_tasks: stats.total_tasks + 1,
        total_score: stats.total_score + points,
        category_stats: updatedCategoryStats,
      } as any)
      .eq('user_id', userId);
  } else {
    // 建立新的使用者統計
    await supabase
      .from('user_stats')
      .insert({
        user_id: userId,
        total_tasks: 1,
        total_score: points,
        category_stats: { [category]: 1 },
      } as any);
  }
}

/**
 * 更新每日統計
 */
async function updateDailyStats(userId: string, category: string, points: number): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  const { data: dailyStats } = await supabase
    .from('daily_stats')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle();

  if (dailyStats) {
    const categoryBreakdown = { ...(dailyStats.category_breakdown as Record<string, number>) };
    categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1;

    await supabase
      .from('daily_stats')
      .update({
        tasks_completed: dailyStats.tasks_completed + 1,
        category_breakdown: categoryBreakdown,
        score: dailyStats.score + points,
      })
      .eq('id', dailyStats.id);
  } else {
    // 建立新的每日統計
    await supabase
      .from('daily_stats')
      .insert({
        user_id: userId,
        date: today,
        tasks_completed: 1,
        lines_completed: 0,
        is_full_house: false,
        score: points,
        category_breakdown: {
          work: 0,
          health: 0,
          personal: 0,
          learning: 0,
          [category]: 1,
        },
      });
  }
}

/**
 * 更新板的連線狀態
 */
export async function updateBoardLines(
  boardId: string,
  completedLines: number[][]
): Promise<void> {
  const { error } = await supabase
    .from('boards')
    .update({ completed_lines: completedLines })
    .eq('id', boardId);

  if (error) {
    console.error('更新連線狀態失敗:', error);
    throw new Error(`更新連線狀態失敗: ${error.message}`);
  }
}

/**
 * 標記板為已完成
 */
export async function markBoardCompleted(boardId: string): Promise<void> {
  const userId = await getCurrentUserId();

  const { error } = await supabase
    .from('boards')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', boardId);

  if (error) {
    console.error('標記板完成失敗:', error);
    throw new Error(`標記板完成失敗: ${error.message}`);
  }

  // 更新統計
  const { data: stats } = await supabase
    .from('user_stats')
    .select('total_full_houses')
    .eq('user_id', userId)
    .maybeSingle();

  if (stats) {
    await supabase
      .from('user_stats')
      .update({
        total_full_houses: stats.total_full_houses + 1,
      } as any)
      .eq('user_id', userId);
  } else {
    // 建立新的使用者統計
    await supabase
      .from('user_stats')
      .insert({
        user_id: userId,
        total_full_houses: 1,
      } as any);
  }
}

/**
 * 刪除 Board
 */
export async function deleteBoard(boardId: string): Promise<void> {
  const userId = await getCurrentUserId();

  // 1. 先回滾統計數據
  await revertStats(boardId, userId);

  // 2. 刪除 Board (Tasks 會因為 Cascade Delete 自動刪除，但我們已經在 revertStats 讀取過了)
  const { error } = await supabase
    .from('boards')
    .delete()
    .eq('id', boardId);

  if (error) {
    console.error('刪除 board 失敗:', error);
    throw new Error(`刪除 board 失敗: ${error.message}`);
  }
}

/**
 * 重置 Board 進度 (刪除已完成任務的狀態)
 */
/**
 * 回滾統計數據
 */
async function revertStats(boardId: string, userId: string): Promise<void> {
  // 1. 取得該板所有已完成的任務
  const { data: completedTasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('board_id', boardId)
    .eq('is_completed', true);

  if (!completedTasks || completedTasks.length === 0) return;

  // 2. 計算要扣除的數值
  const totalPoints = completedTasks.reduce((sum, t) => sum + (t.points || 0), 0);
  const totalTasks = completedTasks.length;
  const categoryCounts: Record<string, number> = {};

  completedTasks.forEach(t => {
    categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
  });

  // 3. 更新 User Stats
  const { data: userStats } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (userStats) {
    const updatedCategoryStats = { ...(userStats.category_stats as Record<string, number>) };

    // 扣除各分類計數
    Object.entries(categoryCounts).forEach(([category, count]) => {
      if (updatedCategoryStats[category]) {
        updatedCategoryStats[category] = Math.max(0, updatedCategoryStats[category] - count);
      }
    });

    await supabase
      .from('user_stats')
      .update({
        total_tasks: Math.max(0, userStats.total_tasks - totalTasks),
        total_score: Math.max(0, userStats.total_score - totalPoints),
        category_stats: updatedCategoryStats,
      } as any)
      .eq('user_id', userId);
  }

  // 4. 更新 Daily Stats (這裡簡化處理：假設都扣除今天的，因為很難追溯每一筆是哪天完成的)
  // 如果要精確，需要對 tasks 依 completed_at 分組，然後分別扣除該日期的 stats
  // 這裡我們先實作精確版

  const tasksByDate: Record<string, { points: number; count: number; categories: Record<string, number> }> = {};

  completedTasks.forEach(t => {
    if (!t.completed_at) return;
    const date = new Date(t.completed_at).toISOString().split('T')[0];

    if (!tasksByDate[date]) {
      tasksByDate[date] = { points: 0, count: 0, categories: {} };
    }

    tasksByDate[date].points += (t.points || 0);
    tasksByDate[date].count += 1;
    tasksByDate[date].categories[t.category] = (tasksByDate[date].categories[t.category] || 0) + 1;
  });

  for (const [date, stats] of Object.entries(tasksByDate)) {
    const { data: dailyStats } = await supabase
      .from('daily_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();

    if (dailyStats) {
      const updatedBreakdown = { ...(dailyStats.category_breakdown as Record<string, number>) };

      Object.entries(stats.categories).forEach(([category, count]) => {
        if (updatedBreakdown[category]) {
          updatedBreakdown[category] = Math.max(0, updatedBreakdown[category] - count);
        }
      });

      await supabase
        .from('daily_stats')
        .update({
          tasks_completed: Math.max(0, dailyStats.tasks_completed - stats.count),
          score: Math.max(0, dailyStats.score - stats.points),
          category_breakdown: updatedBreakdown,
        } as any)
        .eq('id', dailyStats.id);
    }
  }
}

/**
 * 重置 Board 進度 (刪除已完成任務的狀態)
 */
export async function resetBoardProgress(boardId: string): Promise<void> {
  const userId = await getCurrentUserId();

  // 1. 先回滾統計數據
  await revertStats(boardId, userId);

  // 2. 重置所有任務狀態
  const { error: tasksError } = await supabase
    .from('tasks')
    .update({
      is_completed: false,
      completed_at: null,
      points: 0,
      combo_multiplier: 1,
    })
    .eq('board_id', boardId);

  if (tasksError) {
    console.error('重置任務失敗:', tasksError);
    throw new Error(`重置任務失敗: ${tasksError.message}`);
  }

  // 3. 重置 Board 狀態
  const { error: boardError } = await supabase
    .from('boards')
    .update({
      score: 0,
      completed_lines: [],
      status: 'in_progress',
      completed_at: null,
      max_combo: 0,
    })
    .eq('id', boardId);

  if (boardError) {
    console.error('重置 board 失敗:', boardError);
    throw new Error(`重置 board 失敗: ${boardError.message}`);
  }
}

/**
 * 重置使用者所有進度 (全域重置)
 * 1. 重置所有 Board 狀態
 * 2. 重置所有 Task 狀態
 * 3. 清空 Daily Stats
 * 4. 重置 User Stats
 */
export async function resetAllUserProgress(): Promise<void> {
  const userId = await getCurrentUserId();

  // 1. 重置所有 Board
  const { error: boardError } = await supabase
    .from('boards')
    .update({
      score: 0,
      completed_lines: [],
      status: 'in_progress',
      completed_at: null,
      max_combo: 0,
    })
    .eq('user_id', userId);

  if (boardError) {
    console.error('重置 boards 失敗:', boardError);
    throw new Error(`重置 boards 失敗: ${boardError.message}`);
  }

  // 2. 重置所有 Tasks
  const { error: taskError } = await supabase
    .from('tasks')
    .update({
      is_completed: false,
      completed_at: null,
      points: 0,
      combo_multiplier: 1,
    })
    .eq('user_id', userId);

  if (taskError) {
    console.error('重置 tasks 失敗:', taskError);
    throw new Error(`重置 tasks 失敗: ${taskError.message}`);
  }

  // 3. 清空 Daily Stats
  const { error: dailyStatsError } = await supabase
    .from('daily_stats')
    .delete()
    .eq('user_id', userId);

  if (dailyStatsError) {
    console.error('清空 daily_stats 失敗:', dailyStatsError);
    throw new Error(`清空 daily_stats 失敗: ${dailyStatsError.message}`);
  }

  // 4. 重置 User Stats
  const { error: userStatsError } = await supabase
    .from('user_stats')
    .update({
      total_tasks: 0,
      total_score: 0,
      total_full_houses: 0,
      category_stats: {},
    })
    .eq('user_id', userId);

  if (userStatsError) {
    console.error('重置 user_stats 失敗:', userStatsError);
    throw new Error(`重置 user_stats 失敗: ${userStatsError.message}`);
  }
}
