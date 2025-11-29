export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            boards: {
                Row: BoardRow;
                Insert: BoardInsert;
                Update: BoardUpdate;
                Relationships: [
                    {
                        foreignKeyName: "boards_parent_id_fkey"
                        columns: ["parent_id"]
                        isOneToOne: false
                        referencedRelation: "boards"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "boards_root_id_fkey"
                        columns: ["root_id"]
                        isOneToOne: false
                        referencedRelation: "boards"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "boards_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ];
            };
            tasks: {
                Row: TaskRow;
                Insert: TaskInsert;
                Update: TaskUpdate;
                Relationships: [
                    {
                        foreignKeyName: "tasks_board_id_fkey"
                        columns: ["board_id"]
                        isOneToOne: false
                        referencedRelation: "boards"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "tasks_related_board_id_fkey"
                        columns: ["related_board_id"]
                        isOneToOne: false
                        referencedRelation: "boards"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "tasks_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ];
            };
            user_stats: {
                Row: UserStatsRow;
                Insert: UserStatsInsert;
                Update: UserStatsUpdate;
                Relationships: [
                    {
                        foreignKeyName: "user_stats_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: true
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ];
            };
            daily_stats: {
                Row: DailyStatsRow;
                Insert: DailyStatsInsert;
                Update: DailyStatsUpdate;
                Relationships: [
                    {
                        foreignKeyName: "daily_stats_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ];
            };
            settings: {
                Row: SettingsRow;
                Insert: SettingsInsert;
                Update: SettingsUpdate;
                Relationships: [
                    {
                        foreignKeyName: "settings_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: true
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ];
            };
        };
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
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
    created_at?: string;
    completed_at?: string | null;
    updated_at?: string;
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
    updated_at?: string;
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
    created_at?: string;
    updated_at?: string;
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
    updated_at?: string;
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
    category_stats: Json;
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
    category_stats?: Json;
    average_completion_time?: number;
    fastest_full_house?: number;
    created_at?: string;
    updated_at?: string;
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
    category_stats?: Json;
    average_completion_time?: number;
    fastest_full_house?: number;
    updated_at?: string;
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
    category_breakdown: Json;
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
    category_breakdown?: Json;
    created_at?: string;
    updated_at?: string;
}

export interface DailyStatsUpdate {
    tasks_completed?: number;
    lines_completed?: number;
    is_full_house?: boolean;
    score?: number;
    category_breakdown?: Json;
    updated_at?: string;
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
    categories: Json;
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
    categories?: Json;
    created_at?: string;
    updated_at?: string;
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
    categories?: Json;
    updated_at?: string;
}
