export type BoardStatus = 'in_progress' | 'completed' | 'expired';

export interface BingoBoard {
  id: string;
  date: string; // ISO date (YYYY-MM-DD)
  tasks: Task[];
  completedLines: number[][];
  status: BoardStatus;
  score: number;
  maxCombo: number;
  createdAt: Date;
  completedAt: Date | null;
}

export interface Task {
  id: string;
  boardId: string;
  name: string;
  category: CategoryType;
  position: number; // 0-8
  isCompleted: boolean;
  isFreeSpace: boolean;
  completedAt: Date | null;
  comboMultiplier: number;
  points: number;
}

export interface TaskInput {
  name: string;
  category: CategoryType;
}

export type CategoryType = 'work' | 'health' | 'personal' | 'learning' | 'free';

export interface CategoryConfig {
  type: CategoryType;
  name: string;
  color: string;
  bgColor: string;
  icon: string;
}
