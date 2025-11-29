import { supabase } from './supabase';
import type { DailyStats, UserStats } from '@/types';

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
 * 將 Supabase Row 轉換為 UserStats
 */
function mapRowToUserStats(row: any): UserStats {
  return {
    id: row.id,
    totalBoards: row.total_boards,
    totalTasks: row.total_tasks,
    totalLines: row.total_lines,
    totalFullHouses: row.total_full_houses,
    totalScore: row.total_score,
    maxCombo: row.max_combo,
    maxDailyScore: row.max_daily_score,
    maxDailyLines: row.max_daily_lines,
    currentStreak: row.current_streak,
    longestStreak: row.longest_streak,
    lastActiveDate: row.last_active_date || '',
    categoryStats: row.category_stats || {},
    averageCompletionTime: row.average_completion_time,
    fastestFullHouse: row.fastest_full_house,
  };
}

/**
 * 將 Supabase Row 轉換為 DailyStats
 */
function mapRowToDailyStats(row: any): DailyStats {
  return {
    date: row.date,
    tasksCompleted: row.tasks_completed,
    linesCompleted: row.lines_completed,
    isFullHouse: row.is_full_house,
    score: row.score,
    categoryBreakdown: row.category_breakdown || {},
  };
}

/**
 * 取得全局統計
 */
export async function getGlobalStats(): Promise<UserStats | undefined> {
  const userId = await getCurrentUserId();

  const { data: dataArray, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .limit(1);

  const data = dataArray?.[0];

  if (error) {
    if (error.code === 'PGRST116') {
      // 沒有找到資料,返回 undefined
      return undefined;
    }
    console.error('取得統計失敗:', error);
    throw new Error(`取得統計失敗: ${error.message}`);
  }

  return data ? mapRowToUserStats(data) : undefined;
}

/**
 * 更新每日統計
 */
export async function updateDailyStats(
  date: string,
  updates: Partial<DailyStats>
): Promise<void> {
  const userId = await getCurrentUserId();

  const { data: existingArray } = await supabase
    .from('daily_stats')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .limit(1);

  const existing = existingArray?.[0];

  if (existing) {
    // 更新現有記錄
    const { error } = await supabase
      .from('daily_stats')
      .update({
        tasks_completed: updates.tasksCompleted ?? existing.tasks_completed,
        lines_completed: updates.linesCompleted ?? existing.lines_completed,
        is_full_house: updates.isFullHouse ?? existing.is_full_house,
        score: updates.score ?? existing.score,
        category_breakdown: updates.categoryBreakdown ?? existing.category_breakdown,
      })
      .eq('user_id', userId)
      .eq('date', date);

    if (error) {
      console.error('更新每日統計失敗:', error);
      throw new Error(`更新每日統計失敗: ${error.message}`);
    }
  } else {
    // 建立新記錄
    const { error } = await supabase
      .from('daily_stats')
      .insert({
        user_id: userId,
        date,
        tasks_completed: updates.tasksCompleted || 0,
        lines_completed: updates.linesCompleted || 0,
        is_full_house: updates.isFullHouse || false,
        score: updates.score || 0,
        category_breakdown: updates.categoryBreakdown || {
          work: 0,
          health: 0,
          personal: 0,
          learning: 0,
        },
      });

    if (error) {
      console.error('建立每日統計失敗:', error);
      throw new Error(`建立每日統計失敗: ${error.message}`);
    }
  }
}

/**
 * 取得日期範圍內的統計
 */
export async function getStatsInRange(
  startDate: string,
  endDate: string
): Promise<DailyStats[]> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('daily_stats')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) {
    console.error('取得日期範圍統計失敗:', error);
    throw new Error(`取得日期範圍統計失敗: ${error.message}`);
  }

  return (data || []).map(mapRowToDailyStats);
}

/**
 * 取得最近 N 天的統計
 */
export async function getRecentStats(days: number): Promise<DailyStats[]> {
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  return getStatsInRange(startDate, endDate);
}

/**
 * 計算連續天數
 */
export async function calculateStreak(): Promise<{
  currentStreak: number;
  longestStreak: number;
}> {
  const userId = await getCurrentUserId();

  const { data: stats, error } = await supabase
    .from('daily_stats')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    console.error('計算連續天數失敗:', error);
    return { currentStreak: 0, longestStreak: 0 };
  }

  if (!stats || stats.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let lastDate: Date | null = null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const stat of stats) {
    const statDate = new Date(stat.date);
    statDate.setHours(0, 0, 0, 0);

    if (stat.tasks_completed > 0) {
      if (lastDate === null) {
        // 檢查是否為今天或昨天
        const diffDays = Math.floor(
          (today.getTime() - statDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diffDays <= 1) {
          tempStreak = 1;
          currentStreak = 1;
        }
      } else {
        const diffDays = Math.floor(
          (lastDate.getTime() - statDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diffDays === 1) {
          tempStreak++;
          if (currentStreak > 0) currentStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      lastDate = statDate;
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak);

  return { currentStreak, longestStreak };
}

/**
 * 取得分類統計
 */
export async function getCategoryStats(): Promise<Record<string, number>> {
  const globalStats = await getGlobalStats();
  return globalStats?.categoryStats || {};
}

/**
 * 記錄今日統計
 */
export async function recordTodayCompletion(
  tasksCompleted: number,
  linesCompleted: number,
  isFullHouse: boolean,
  score: number,
  category: string
): Promise<void> {
  const userId = await getCurrentUserId();
  const today = new Date().toISOString().split('T')[0];

  const { data: existingArray } = await supabase
    .from('daily_stats')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .limit(1);

  const existing = existingArray?.[0];

  if (existing) {
    const categoryBreakdown = { ...existing.category_breakdown };
    categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1;

    await supabase
      .from('daily_stats')
      .update({
        tasks_completed: existing.tasks_completed + tasksCompleted,
        lines_completed: Math.max(existing.lines_completed, linesCompleted),
        is_full_house: existing.is_full_house || isFullHouse,
        score: Math.max(existing.score, score),
        category_breakdown: categoryBreakdown,
      })
      .eq('user_id', userId)
      .eq('date', today);
  } else {
    await supabase
      .from('daily_stats')
      .insert({
        user_id: userId,
        date: today,
        tasks_completed: tasksCompleted,
        lines_completed: linesCompleted,
        is_full_house: isFullHouse,
        score: score,
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
 * 取得指定日期的完成任務
 */
export async function getTasksByDate(date: string): Promise<any[]> {
  const userId = await getCurrentUserId();

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .gte('completed_at', startOfDay.toISOString())
    .lte('completed_at', endOfDay.toISOString());

  if (error) {
    console.error('取得任務失敗:', error);
    return [];
  }

  return data || [];
}
