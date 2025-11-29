-- ============================================
-- Bingo Todo - Supabase 資料庫架構
-- ============================================

-- 啟用 UUID 擴充功能
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Boards 表 (賓果板)
-- ============================================
CREATE TABLE boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('daily', 'weekly', 'mandalart')),
  date DATE NOT NULL,
  parent_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  root_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  position INTEGER CHECK (position >= 0 AND position <= 8),
  completed_lines JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'expired')),
  score INTEGER DEFAULT 0,
  max_combo INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引優化
CREATE INDEX idx_boards_user_id ON boards(user_id);
CREATE INDEX idx_boards_type_date ON boards(type, date);
CREATE INDEX idx_boards_parent_id ON boards(parent_id);
CREATE INDEX idx_boards_root_id ON boards(root_id);
CREATE INDEX idx_boards_created_at ON boards(created_at DESC);

-- ============================================
-- 2. Tasks 表 (任務)
-- ============================================
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  position INTEGER NOT NULL CHECK (position >= 0 AND position <= 8),
  is_completed BOOLEAN DEFAULT FALSE,
  related_board_id UUID REFERENCES boards(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  combo_multiplier INTEGER DEFAULT 1,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引優化
CREATE INDEX idx_tasks_board_id ON tasks(board_id);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_is_completed ON tasks(is_completed);
CREATE INDEX idx_tasks_completed_at ON tasks(completed_at DESC);

-- ============================================
-- 3. User Stats 表 (用戶統計)
-- ============================================
CREATE TABLE user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_boards INTEGER DEFAULT 0,
  total_tasks INTEGER DEFAULT 0,
  total_lines INTEGER DEFAULT 0,
  total_full_houses INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  max_combo INTEGER DEFAULT 0,
  max_daily_score INTEGER DEFAULT 0,
  max_daily_lines INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active_date DATE,
  category_stats JSONB DEFAULT '{}'::jsonb,
  average_completion_time INTEGER DEFAULT 0,
  fastest_full_house INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);

-- ============================================
-- 4. Daily Stats 表 (每日統計)
-- ============================================
CREATE TABLE daily_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  tasks_completed INTEGER DEFAULT 0,
  lines_completed INTEGER DEFAULT 0,
  is_full_house BOOLEAN DEFAULT FALSE,
  score INTEGER DEFAULT 0,
  category_breakdown JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_daily_stats_user_id ON daily_stats(user_id);
CREATE INDEX idx_daily_stats_date ON daily_stats(date DESC);

-- ============================================
-- 5. Settings 表 (用戶設定)
-- ============================================
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sound_enabled BOOLEAN DEFAULT TRUE,
  sound_volume INTEGER DEFAULT 80 CHECK (sound_volume >= 0 AND sound_volume <= 100),
  vibration_enabled BOOLEAN DEFAULT TRUE,
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  combo_timeout INTEGER DEFAULT 1800000,
  show_tutorial BOOLEAN DEFAULT TRUE,
  reminder_enabled BOOLEAN DEFAULT FALSE,
  reminder_time TIME DEFAULT '09:00',
  categories JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_settings_user_id ON settings(user_id);

-- ============================================
-- 6. Row Level Security (RLS) 政策
-- ============================================

-- 啟用 RLS
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Boards 政策
CREATE POLICY "用戶只能查看自己的 boards" ON boards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用戶只能新增自己的 boards" ON boards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用戶只能更新自己的 boards" ON boards
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用戶只能刪除自己的 boards" ON boards
  FOR DELETE USING (auth.uid() = user_id);

-- Tasks 政策
CREATE POLICY "用戶只能查看自己的 tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用戶只能新增自己的 tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用戶只能更新自己的 tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用戶只能刪除自己的 tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- User Stats 政策
CREATE POLICY "用戶只能查看自己的統計" ON user_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用戶只能更新自己的統計" ON user_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- Daily Stats 政策
CREATE POLICY "用戶只能查看自己的每日統計" ON daily_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用戶只能新增自己的每日統計" ON daily_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用戶只能更新自己的每日統計" ON daily_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- Settings 政策
CREATE POLICY "用戶只能查看自己的設定" ON settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用戶只能更新自己的設定" ON settings
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 7. 觸發器 (自動更新 updated_at)
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_boards_updated_at BEFORE UPDATE ON boards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_stats_updated_at BEFORE UPDATE ON daily_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. 初始化函數 (新用戶註冊時自動建立記錄)
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 建立用戶統計記錄
  INSERT INTO user_stats (user_id)
  VALUES (NEW.id);
  
  -- 建立用戶設定記錄
  INSERT INTO settings (
    user_id,
    categories
  ) VALUES (
    NEW.id,
    '[
      {"id": "work", "name": "工作", "color": "text-blue-600", "bgColor": "bg-blue-100", "icon": "💼", "isDefault": true},
      {"id": "health", "name": "健康", "color": "text-green-600", "bgColor": "bg-green-100", "icon": "💪", "isDefault": true},
      {"id": "personal", "name": "個人", "color": "text-purple-600", "bgColor": "bg-purple-100", "icon": "👤", "isDefault": true},
      {"id": "learning", "name": "學習", "color": "text-yellow-600", "bgColor": "bg-yellow-100", "icon": "📚", "isDefault": true},
      {"id": "free", "name": "自由", "color": "text-gray-600", "bgColor": "bg-gray-100", "icon": "✨", "isDefault": true}
    ]'::jsonb
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 註冊觸發器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 9. 統計更新函數 (當新增 board 時自動更新)
-- ============================================

CREATE OR REPLACE FUNCTION update_stats_on_board_create()
RETURNS TRIGGER AS $$
BEGIN
  -- 只在主板或獨立板時更新 (非子板)
  IF NEW.parent_id IS NULL THEN
    UPDATE user_stats
    SET total_boards = total_boards + 1,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_board_created
  AFTER INSERT ON boards
  FOR EACH ROW EXECUTE FUNCTION update_stats_on_board_create();
