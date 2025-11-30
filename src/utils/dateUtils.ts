/**
 * 取得本地日期字串 (YYYY-MM-DD)
 * 解決時區問題，確保 "今天" 是使用者的當地時間
 */
export function getLocalDate(date?: Date | string): string {
    const d = date ? new Date(date) : new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * 取得指定日期所在週的週一日期字串 (YYYY-MM-DD)
 * @param date 指定日期，若未提供則使用今天
 */
export function getWeekStartDate(date?: Date | string): string {
    const d = date ? new Date(date) : new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(d.setDate(diff));

    const year = monday.getFullYear();
    const month = String(monday.getMonth() + 1).padStart(2, '0');
    const dateStr = String(monday.getDate()).padStart(2, '0');

    return `${year}-${month}-${dateStr}`;
}
