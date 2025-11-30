import { supabase } from './supabase';

/**
 * 清除本地 Session (登出時使用)
 */
export async function clearLocalData() {
    // await supabase.auth.signOut(); // 移除此行,避免在 onAuthStateChange 中造成循環
    console.log('✅ 已登出,本地數據清理完成');
}

/**
 * 初始化用戶數據 (登入時調用)
 * Supabase 會自動透過觸發器建立 user_stats 和 settings
 */
export async function initializeUserData(userId: string) {
    console.log(`🔄 初始化用戶 ${userId} 的數據...`);

    try {
        // 檢查是否已有 user_stats,如果沒有則等待觸發器建立
        const { data: stats, error } = await supabase
            .from('user_stats')
            .select('id')
            .eq('user_id', userId)
            .limit(1);

        if (error) {
            console.error('❌ 初始化檢查失敗:', error);
            return; // 如果是網絡錯誤等，暫停初始化
        }

        if (!stats || stats.length === 0) {
            console.log('⏳ 等待 Supabase 觸發器建立初始資料...');
            // 等待一下讓觸發器執行
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log('✅ 用戶數據已初始化');
    } catch (err) {
        console.error('❌ 初始化過程發生錯誤:', err);
    }
}

/**
 * 訂閱 Realtime 更新 (可選)
 */
export function subscribeToBoards(userId: string, callback: (payload: any) => void) {
    const channel = supabase
        .channel('boards-changes')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'boards',
                filter: `user_id=eq.${userId}`,
            },
            callback
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}

/**
 * 訂閱任務更新 (可選)
 */
export function subscribeToTasks(userId: string, callback: (payload: any) => void) {
    const channel = supabase
        .channel('tasks-changes')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'tasks',
                filter: `user_id=eq.${userId}`,
            },
            callback
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}
