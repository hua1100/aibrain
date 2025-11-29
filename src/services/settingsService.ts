import { supabase } from './supabase';
import type { Settings, CategoryConfig } from '@/types';

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
 * 將 Supabase Row 轉換為 Settings
 */
function mapRowToSettings(row: any): Settings {
    return {
        id: row.id,
        soundEnabled: row.sound_enabled,
        soundVolume: row.sound_volume,
        vibrationEnabled: row.vibration_enabled,
        theme: row.theme,
        comboTimeout: row.combo_timeout,
        showTutorial: row.show_tutorial,
        reminderEnabled: row.reminder_enabled,
        reminderTime: row.reminder_time,
        categories: row.categories || [],
    };
}

/**
 * 取得使用者設定
 */
export async function getSettings(): Promise<Settings | undefined> {
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

    if (error) {
        if (error.code === 'PGRST116') {
            // 沒有找到資料,返回 undefined
            return undefined;
        }
        console.error('取得設定失敗:', error);
        throw new Error(`取得設定失敗: ${error.message}`);
    }

    return data ? mapRowToSettings(data) : undefined;
}

/**
 * 更新使用者設定
 */
export async function updateSettings(updates: Partial<Settings>): Promise<void> {
    const userId = await getCurrentUserId();

    const updateData: any = {};

    if (updates.soundEnabled !== undefined) updateData.sound_enabled = updates.soundEnabled;
    if (updates.soundVolume !== undefined) updateData.sound_volume = updates.soundVolume;
    if (updates.vibrationEnabled !== undefined) updateData.vibration_enabled = updates.vibrationEnabled;
    if (updates.theme !== undefined) updateData.theme = updates.theme;
    if (updates.comboTimeout !== undefined) updateData.combo_timeout = updates.comboTimeout;
    if (updates.showTutorial !== undefined) updateData.show_tutorial = updates.showTutorial;
    if (updates.reminderEnabled !== undefined) updateData.reminder_enabled = updates.reminderEnabled;
    if (updates.reminderTime !== undefined) updateData.reminder_time = updates.reminderTime;
    if (updates.categories !== undefined) updateData.categories = updates.categories;

    const { error } = await supabase
        .from('settings')
        .upsert({ user_id: userId, ...updateData } as any, { onConflict: 'user_id' })
        .select();

    if (error) {
        console.error('更新設定失敗:', error);
        throw new Error(`更新設定失敗: ${error.message}`);
    }
}

/**
 * 取得使用者分類設定
 */
export async function getCategories() {
    const settings = await getSettings();
    return settings?.categories || [];
}

/**
 * 更新使用者分類設定
 */
export async function updateCategories(categories: CategoryConfig[]) {
    await updateSettings({ categories });
}

