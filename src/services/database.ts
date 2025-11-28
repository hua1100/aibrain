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
      boards: '&id, type, date, status, parentId, rootId, createdAt',
      tasks: '&id, boardId, position, isCompleted',
      achievements: '&id, type, unlockedAt',
      stats: '&id',
      dailyStats: '&id, date',
      settings: '&id',
    });

    this.version(2).stores({
      boards: '&id, type, date, [type+date], status, parentId, rootId, createdAt',
    });

    this.version(3).stores({
      tasks: '&id, boardId, position, isCompleted, completedAt',
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
      categories: [
        { id: 'work', name: '工作', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: '💼', isDefault: true },
        { id: 'health', name: '健康', color: 'text-green-600', bgColor: 'bg-green-100', icon: '💪', isDefault: true },
        { id: 'personal', name: '個人', color: 'text-purple-600', bgColor: 'bg-purple-100', icon: '👤', isDefault: true },
        { id: 'learning', name: '學習', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: '📚', isDefault: true },
        { id: 'free', name: '自由', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: '✨', isDefault: true },
      ],
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
