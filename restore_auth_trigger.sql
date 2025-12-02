-- ============================================
-- 恢復自動註冊觸發器 (Restore Automatic Trigger)
-- ============================================

-- 在確認移除了異常的 'on_auth_user_created_init' 觸發器後
-- 我們可以安全地恢復正確的自動化流程
-- 這樣您就不需要每次手動執行初始化腳本了

-- 1. 再次確保清理舊的/錯誤的定義
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. 建立正確的處理函數 (V2 Robust Version)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_categories jsonb;
BEGIN
  -- 定義預設分類
  default_categories := '[
      {"id": "work", "name": "工作", "color": "text-blue-600", "bgColor": "bg-blue-100", "icon": "💼", "isDefault": true},
      {"id": "health", "name": "健康", "color": "text-green-600", "bgColor": "bg-green-100", "icon": "💪", "isDefault": true},
      {"id": "personal", "name": "個人", "color": "text-purple-600", "bgColor": "bg-purple-100", "icon": "👤", "isDefault": true},
      {"id": "learning", "name": "學習", "color": "text-yellow-600", "bgColor": "bg-yellow-100", "icon": "📚", "isDefault": true},
      {"id": "free", "name": "自由", "color": "text-gray-600", "bgColor": "bg-gray-100", "icon": "✨", "isDefault": true}
    ]'::jsonb;

  -- 建立 User Stats (帶錯誤處理)
  BEGIN
    INSERT INTO public.user_stats (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error creating user_stats for user %: %', NEW.id, SQLERRM;
  END;
  
  -- 建立 Settings (帶錯誤處理)
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
    RAISE WARNING 'Error creating settings for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. 重新啟用觸發器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 說明:
-- 執行此腳本後,新註冊的用戶將會自動初始化。
-- 您不需要再手動執行 manual_init_user.sql。
