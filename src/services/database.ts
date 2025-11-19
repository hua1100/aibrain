import Dexie, { type Table } from 'dexie';
import type {
  BingoBoard,
  Task,
  Achievement,
  UserStats,
  DailyStats,
  Settings,
} from '@/types';

export class BingoTodoDatabase extends Dexie {
  boards!: Table<BingoBoard>;
  tasks!: Table<Task>;
  achievements!: Table<Achievement>;
  stats!: Table<UserStats>;
  dailyStats!: Table<DailyStats>;
  settings!: Table<Settings>;

  constructor() {
    super('BingoTodoDatabase');

    this.version(1).stores({
      boards: '&id, date, status, createdAt',
      tasks: '&id, boardId, position, isCompleted',
      achievements: '&id, type, unlockedAt',
      stats: '&id',
      dailyStats: '&id, date',
      settings: '&id',
    });
  }
}

export const db = new BingoTodoDatabase();

// 初始化預設設定
export async function initializeDatabase(): Promise<void> {
  const existingSettings = await db.settings.get('user');
  if (!existingSettings) {
    await db.settings.add({
      id: 'user',
      soundEnabled: true,
      soundVolume: 80,
      vibrationEnabled: true,
      theme: 'system',
      comboTimeout: 30 * 60 * 1000,
      showTutorial: true,
      reminderEnabled: false,
      reminderTime: '09:00',
    });
  }

  const existingStats = await db.stats.get('global');
  if (!existingStats) {
    await db.stats.add({
      id: 'global',
      totalBoards: 0,
      totalTasks: 0,
      totalLines: 0,
      totalFullHouses: 0,
      totalScore: 0,
      maxCombo: 0,
      maxDailyScore: 0,
      maxDailyLines: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: '',
      categoryStats: {
        work: 0,
        health: 0,
        personal: 0,
        learning: 0,
        free: 0,
      },
      averageCompletionTime: 0,
      fastestFullHouse: 0,
    });
  }
}
