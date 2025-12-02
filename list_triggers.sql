-- ============================================
-- 列出 auth.users 上的所有觸發器 (SELECT 版本)
-- ============================================

SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM 
    information_schema.triggers
WHERE 
    event_object_table = 'users' 
    AND event_object_schema = 'auth';

-- 如果此查詢返回任何結果,代表觸發器仍然存在。
-- 請將結果截圖或複製給我。
