-- ============================================
-- 移除異常觸發器 (Rogue Trigger Removal)
-- ============================================

-- 發現有一個名為 'on_auth_user_created_init' 的觸發器
-- 這可能是舊版本的殘留,導致了 500 錯誤
DROP TRIGGER IF EXISTS on_auth_user_created_init ON auth.users;

-- 同時刪除其對應的函數
DROP FUNCTION IF EXISTS public.handle_new_user_init();

-- 確保原本的觸發器也被清理 (如果有的話)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 說明:
-- 執行此腳本後,所有的自動註冊觸發器都將被移除。
-- 您現在應該可以順利註冊,不會再出現 500 錯誤。
-- 註冊後,請務必執行 manual_init_user.sql 來初始化資料。
