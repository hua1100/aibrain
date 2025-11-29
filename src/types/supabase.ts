/**
 * Supabase 資料庫型別定義
 * 對應 supabase_schema.sql 中的資料表結構
 */

export interface Database {
    public: {
        Tables: {
            boards: {
                Row: BoardRow;
                Insert: BoardInsert;
                Update: BoardUpdate;
            };
            tasks: {
                Row: TaskRow;
                Insert: TaskInsert;
                Update: TaskUpdate;
            };
            user_stats: {
                Row: UserStatsRow;
                Insert: UserStatsInsert;
                Update: UserStatsUpdate;
            };
            daily_stats: {
                Row: DailyStatsRow;
                Insert: DailyStatsInsert;
                Update: DailyStatsUpdate;
            };
            settings: {
                Row: SettingsRow;
                Insert: SettingsInsert;
                Update: SettingsUpdate;
            };
        };
    };
}

// ============================================
// Boards 表
// ============================================

export interface BoardRow {
    id: string;
    user_id: string;
    type: 'daily' | 'weekly' | 'mandalart';
    date: string;
    parent_id: string | null;
    root_id: string | null;
    position: number | null;
    completed_lines: number[][];
    status: 'in_progress' | 'completed' | 'expired';
    score: number;
    max_combo: number;
    created_at: string;
    completed_at: string | null;
    updated_at: string;
}

export interface BoardInsert {
    id?: string;
    user_id: string;
    type: 'daily' | 'weekly' | 'mandalart';
    date: string;
    parent_id?: string | null;
    root_id?: string | null;
    position?: number | null;
    completed_lines?: number[][];
    status?: 'in_progress' | 'completed' | 'expired';
    score?: number;
    max_combo?: number;
    completed_at?: string | null;
}

export interface BoardUpdate {
    type?: 'daily' | 'weekly' | 'mandalart';
    date?: string;
    parent_id?: string | null;
    root_id?: string | null;
    position?: number | null;
    completed_lines?: number[][];
    status?: 'in_progress' | 'completed' | 'expired';
    score?: number;
    max_combo?: number;
    completed_at?: string | null;
}

// ============================================
// Tasks 表
// ============================================

export interface TaskRow {
    id: string;
    board_id: string;
    user_id: string;
    name: string;
    category: string;
    position: number;
    is_completed: boolean;
    related_board_id: string | null;
    completed_at: string | null;
    combo_multiplier: number;
    points: number;
    created_at: string;
    updated_at: string;
}

export interface TaskInsert {
    id?: string;
    board_id: string;
    user_id: string;
    name: string;
    category: string;
    position: number;
    is_completed?: boolean;
    related_board_id?: string | null;
    completed_at?: string | null;
    combo_multiplier?: number;
    points?: number;
}

export interface TaskUpdate {
    name?: string;
    category?: string;
    position?: number;
    is_completed?: boolean;
    related_board_id?: string | null;
    completed_at?: string | null;
    combo_multiplier?: number;
    points?: number;
}

// ============================================
// User Stats 表
// ============================================

export interface UserStatsRow {
    id: string;
    user_id: string;
    total_boards: number;
    total_tasks: number;
    total_lines: number;
    total_full_houses: number;
    total_score: number;
    max_combo: number;
    max_daily_score: number;
    max_daily_lines: number;
    current_streak: number;
    longest_streak: number;
    last_active_date: string | null;
    category_stats: Record<string, number>;
    average_completion_time: number;
    fastest_full_house: number;
    created_at: string;
    updated_at: string;
}

export interface UserStatsInsert {
    id?: string;
    user_id: string;
    total_boards?: number;
    total_tasks?: number;
    total_lines?: number;
    total_full_houses?: number;
    total_score?: number;
    max_combo?: number;
    max_daily_score?: number;
    max_daily_lines?: number;
    current_streak?: number;
    longest_streak?: number;
    last_active_date?: string | null;
    category_stats?: Record<string, number>;
    average_completion_time?: number;
    fastest_full_house?: number;
}

export interface UserStatsUpdate {
    total_boards?: number;
    total_tasks?: number;
    total_lines?: number;
    total_full_houses?: number;
    total_score?: number;
    max_combo?: number;
    max_daily_score?: number;
    max_daily_lines?: number;
    current_streak?: number;
    longest_streak?: number;
    last_active_date?: string | null;
    category_stats?: Record<string, number>;
    average_completion_time?: number;
    fastest_full_house?: number;
}

// ============================================
// Daily Stats 表
// ============================================

export interface DailyStatsRow {
    id: string;
    user_id: string;
    date: string;
    tasks_completed: number;
    lines_completed: number;
    is_full_house: boolean;
    score: number;
    category_breakdown: Record<string, number>;
    created_at: string;
    updated_at: string;
}

export interface DailyStatsInsert {
    id?: string;
    user_id: string;
    date: string;
    tasks_completed?: number;
    lines_completed?: number;
    is_full_house?: boolean;
    score?: number;
    category_breakdown?: Record<string, number>;
}

export interface DailyStatsUpdate {
    tasks_completed?: number;
    lines_completed?: number;
    is_full_house?: boolean;
    score?: number;
    category_breakdown?: Record<string, number>;
}

// ============================================
// Settings 表
// ============================================

export interface SettingsRow {
    id: string;
    user_id: string;
    sound_enabled: boolean;
    sound_volume: number;
    vibration_enabled: boolean;
    theme: 'light' | 'dark' | 'system';
    combo_timeout: number;
    show_tutorial: boolean;
    reminder_enabled: boolean;
    reminder_time: string;
    categories: Array<{
        id: string;
        name: string;
        color: string;
        bgColor: string;
        icon: string;
        isDefault?: boolean;
    }>;
    created_at: string;
    updated_at: string;
}

export interface SettingsInsert {
    id?: string;
    user_id: string;
    sound_enabled?: boolean;
    sound_volume?: number;
    vibration_enabled?: boolean;
    theme?: 'light' | 'dark' | 'system';
    combo_timeout?: number;
    show_tutorial?: boolean;
    reminder_enabled?: boolean;
    reminder_time?: string;
    categories?: Array<{
        id: string;
        name: string;
        color: string;
        bgColor: string;
        icon: string;
        isDefault?: boolean;
    }>;
}

export interface SettingsUpdate {
    sound_enabled?: boolean;
    sound_volume?: number;
    vibration_enabled?: boolean;
    theme?: 'light' | 'dark' | 'system';
    combo_timeout?: number;
    show_tutorial?: boolean;
    reminder_enabled?: boolean;
    reminder_time?: string;
    categories?: Array<{
        id: string;
        name: string;
        color: string;
        bgColor: string;
        icon: string;
        isDefault?: boolean;
    }>;
}
