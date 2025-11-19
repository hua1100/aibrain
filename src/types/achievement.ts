export type AchievementType =
  | 'first_line'
  | 'first_fullhouse'
  | 'three_lines'
  | 'five_lines'
  | 'week_streak'
  | 'month_streak'
  | 'combo_3x'
  | 'combo_5x'
  | 'early_bird'
  | 'night_owl'
  | 'category_master_work'
  | 'category_master_health'
  | 'category_master_personal'
  | 'category_master_learning'
  | 'speed_demon'
  | 'perfectionist'
  | 'veteran';

export interface Achievement {
  id: string;
  type: AchievementType;
  unlockedAt: Date | null;
  progress: number;
}

export interface AchievementConfig {
  type: AchievementType;
  name: string;
  description: string;
  icon: string;
  condition: string;
  maxProgress: number;
}
