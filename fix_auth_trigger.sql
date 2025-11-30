-- ============================================
-- 修復註冊時 "Database error saving new user" 的問題
-- ============================================

-- 1. 確保 UUID 擴充功能已啟用
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. 重建 handle_new_user 函數
-- 使用 SECURITY DEFINER 確保有權限寫入 public 表
-- 設定 search_path = public 避免路徑問題
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 建立用戶統計記錄
  -- 使用 INSERT ... ON CONFLICT DO NOTHING 避免重複錯誤
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- 建立用戶設定記錄
  INSERT INTO public.settings (
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
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. 重建觸發器
-- 先刪除舊的以防萬一
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. 確保 RLS 政策允許(雖然 SECURITY DEFINER 應該繞過,但多一層保障)
-- 這裡不需要額外的 INSERT 政策,因為函數是 SECURITY DEFINER
