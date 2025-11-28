export type BoardStatus = 'in_progress' | 'completed' | 'expired';

export type BoardType = 'daily' | 'weekly' | 'mandalart';

export interface BingoBoard {
  id: string;
  type: BoardType;
  date: string; // ISO date (YYYY-MM-DD)
  parentId?: string; // For Mandalart sub-boards
  rootId?: string; // For Mandalart root board
  position?: number; // 0-8 for Mandalart sub-boards
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
  relatedBoardId?: string; // For Mandalart center tasks linking to sub-boards
  completedAt: Date | null;
  comboMultiplier: number;
  points: number;
}

export interface TaskInput {
  name: string;
  category: CategoryType;
}

export type CategoryType = string;

export interface CategoryConfig {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  icon: string;
  isDefault?: boolean;
}
