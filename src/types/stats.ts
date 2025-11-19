import type { CategoryType } from './board';

export interface UserStats {
  id: string; // 'global'
  totalBoards: number;
  totalTasks: number;
  totalLines: number;
  totalFullHouses: number;
  totalScore: number;
  maxCombo: number;
  maxDailyScore: number;
  maxDailyLines: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  categoryStats: Record<CategoryType, number>;
  averageCompletionTime: number;
  fastestFullHouse: number;
}

export interface DailyStats {
  id: string; // date (YYYY-MM-DD)
  date: string;
  tasksCompleted: number;
  linesCompleted: number;
  isFullHouse: boolean;
  score: number;
  maxCombo: number;
  timeSpent: number;
}

export interface Settings {
  id: string; // 'user'
  soundEnabled: boolean;
  soundVolume: number;
  vibrationEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
  comboTimeout: number;
  showTutorial: boolean;
  reminderEnabled: boolean;
  reminderTime: string;
}
