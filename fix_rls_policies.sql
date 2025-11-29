-- ============================================
-- 修復 RLS 政策 - 使用英文名稱
-- ============================================

-- 1. 刪除所有現有政策
DROP POLICY IF EXISTS "用戶只能查看自己的 boards" ON boards;
DROP POLICY IF EXISTS "用戶只能新增自己的 boards" ON boards;
DROP POLICY IF EXISTS "用戶只能更新自己的 boards" ON boards;
DROP POLICY IF EXISTS "用戶只能刪除自己的 boards" ON boards;

DROP POLICY IF EXISTS "用戶只能查看自己的 tasks" ON tasks;
DROP POLICY IF EXISTS "用戶只能新增自己的 tasks" ON tasks;
DROP POLICY IF EXISTS "用戶只能更新自己的 tasks" ON tasks;
DROP POLICY IF EXISTS "用戶只能刪除自己的 tasks" ON tasks;

DROP POLICY IF EXISTS "用戶只能查看自己的統計" ON user_stats;
DROP POLICY IF EXISTS "用戶只能更新自己的統計" ON user_stats;

DROP POLICY IF EXISTS "用戶只能查看自己的每日統計" ON daily_stats;
DROP POLICY IF EXISTS "用戶只能新增自己的每日統計" ON daily_stats;
DROP POLICY IF EXISTS "用戶只能更新自己的每日統計" ON daily_stats;

DROP POLICY IF EXISTS "用戶只能查看自己的設定" ON settings;
DROP POLICY IF EXISTS "用戶只能更新自己的設定" ON settings;

-- 2. 使用簡化的英文政策 (更容易維護)
CREATE POLICY "boards_policy" ON boards
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "tasks_policy" ON tasks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "user_stats_policy" ON user_stats
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "daily_stats_policy" ON daily_stats
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "settings_policy" ON settings
  FOR ALL USING (auth.uid() = user_id);

-- 3. 為 user_stats 和 settings 新增 INSERT 政策 (新用戶註冊時需要)
CREATE POLICY "user_stats_insert_policy" ON user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "settings_insert_policy" ON settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
