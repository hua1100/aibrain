-- ============================================
-- 診斷腳本: 檢查 auth.users 的觸發器狀態
-- ============================================

DO $$
DECLARE
    trigger_rec RECORD;
    func_rec RECORD;
    trigger_count INTEGER := 0;
BEGIN
    RAISE NOTICE '=== 開始診斷 auth.users 觸發器 ===';

    -- 1. 列出 auth.users 上的所有觸發器
    FOR trigger_rec IN 
        SELECT trigger_name, action_timing, event_manipulation, action_statement
        FROM information_schema.triggers
        WHERE event_object_table = 'users' AND event_object_schema = 'auth'
    LOOP
        RAISE NOTICE '發現觸發器: % (Timing: %, Event: %)', 
            trigger_rec.trigger_name, 
            trigger_rec.action_timing, 
            trigger_rec.event_manipulation;
        trigger_count := trigger_count + 1;
    END LOOP;

    IF trigger_count = 0 THEN
        RAISE NOTICE '未發現任何觸發器 (這是預期的,如果已執行 disable 腳本)';
    ELSE
        RAISE NOTICE '警告: 仍有 % 個觸發器存在!', trigger_count;
    END IF;

    -- 2. 檢查 handle_new_user 函數是否存在
    SELECT routine_name INTO func_rec
    FROM information_schema.routines
    WHERE routine_name = 'handle_new_user' AND routine_schema = 'public';

    IF FOUND THEN
        RAISE NOTICE '發現函數: public.handle_new_user (這可能導致問題如果被其他觸發器呼叫)';
    ELSE
        RAISE NOTICE '未發現函數: public.handle_new_user';
    END IF;

    RAISE NOTICE '=== 診斷結束 ===';
END $$;
