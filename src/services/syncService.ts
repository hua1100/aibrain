import { db } from './database';

/**
 * 清除本地數據 (登入/登出時使用)
 */
export async function clearLocalData() {
    await db.boards.clear();
    await db.dailyStats.clear();
    console.log('✅ 本地數據已清除');
}

/**
 * 初始化用戶數據 (登入時調用)
 * 簡化版:直接清空本地數據,讓用戶從空白狀態開始
 */
export async function initializeUserData(userId: string) {
    console.log(`🔄 初始化用戶 ${userId} 的數據...`);
    await clearLocalData();
    console.log('✅ 用戶數據已初始化 (空白狀態)');
}
