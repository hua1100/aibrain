-- ============================================
-- 修復註冊時 "Database error saving new user" 的問題 (V2)
-- ============================================

-- 1. 確保 UUID 擴充功能已啟用
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. 刪除舊的觸發器和函數 (確保乾淨重建)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. 重建 handle_new_user 函數
-- 使用 SECURITY DEFINER 確保有權限寫入 public 表
-- 設定 search_path = public 避免路徑問題
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_categories jsonb;
BEGIN
  -- 定義預設分類 JSON
  default_categories := '[
      {"id": "work", "name": "工作", "color": "text-blue-600", "bgColor": "bg-blue-100", "icon": "💼", "isDefault": true},
      {"id": "health", "name": "健康", "color": "text-green-600", "bgColor": "bg-green-100", "icon": "💪", "isDefault": true},
      {"id": "personal", "name": "個人", "color": "text-purple-600", "bgColor": "bg-purple-100", "icon": "👤", "isDefault": true},
      {"id": "learning", "name": "學習", "color": "text-yellow-600", "bgColor": "bg-yellow-100", "icon": "📚", "isDefault": true},
      {"id": "free", "name": "自由", "color": "text-gray-600", "bgColor": "bg-gray-100", "icon": "✨", "isDefault": true}
    ]'::jsonb;

  -- 建立用戶統計記錄
  -- 使用 INSERT ... ON CONFLICT DO NOTHING 避免重複錯誤
  BEGIN
    INSERT INTO public.user_stats (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- 記錄錯誤但允許交易繼續 (防止註冊失敗)
    RAISE WARNING 'Error creating user_stats for user %: %', NEW.id, SQLERRM;
  END;
  
  -- 建立用戶設定記錄
  BEGIN
    INSERT INTO public.settings (
      user_id,
      categories
    ) VALUES (
      NEW.id,
      default_categories
    )
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- 記錄錯誤但允許交易繼續
    RAISE WARNING 'Error creating settings for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. 重建觸發器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. 確保 RLS 政策允許 (雖然 SECURITY DEFINER 應該繞過)
-- 檢查並修復 user_stats 的 INSERT 政策
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_stats' AND policyname = 'user_stats_insert_policy') THEN
        CREATE POLICY "user_stats_insert_policy" ON user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'settings' AND policyname = 'settings_insert_policy') THEN
        CREATE POLICY "settings_insert_policy" ON settings FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;
