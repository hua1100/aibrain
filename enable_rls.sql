-- ============================================
-- 重新啟用 RLS (修復 Unrestricted 狀態)
-- ============================================

-- 1. 確保所有資料表都啟用 RLS
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 2. 確認政策存在 (如果之前執行過 fix_rls_policies.sql 應該已經有了)
-- 如果沒有,這裡再次建立以防萬一

DO $$
BEGIN
    -- boards
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'boards' AND policyname = 'boards_policy') THEN
        CREATE POLICY "boards_policy" ON boards FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- tasks
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'tasks_policy') THEN
        CREATE POLICY "tasks_policy" ON tasks FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- user_stats
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_stats' AND policyname = 'user_stats_policy') THEN
        CREATE POLICY "user_stats_policy" ON user_stats FOR ALL USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_stats' AND policyname = 'user_stats_insert_policy') THEN
        CREATE POLICY "user_stats_insert_policy" ON user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    -- daily_stats
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'daily_stats' AND policyname = 'daily_stats_policy') THEN
        CREATE POLICY "daily_stats_policy" ON daily_stats FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- settings
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'settings' AND policyname = 'settings_policy') THEN
        CREATE POLICY "settings_policy" ON settings FOR ALL USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'settings' AND policyname = 'settings_insert_policy') THEN
        CREATE POLICY "settings_insert_policy" ON settings FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;
