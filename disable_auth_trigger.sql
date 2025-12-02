-- ============================================
-- 暫時停用註冊觸發器 (Debugging)
-- ============================================

-- 1. 刪除觸發器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. 刪除函數 (可選,但為了乾淨起見)
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 說明:
-- 執行此腳本後,請嘗試註冊新帳號。
-- 如果註冊成功,代表問題確實出在觸發器或函數本身。
-- 註冊成功後,請執行 manual_init_user.sql 來初始化該用戶的資料。
