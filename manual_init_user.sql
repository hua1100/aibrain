-- ============================================
-- 手動初始化用戶資料 (修復無資料問題)
-- ============================================

-- 請將下面的 'YOUR_EMAIL_HERE' 替換為您剛註冊的 Email
DO $$
DECLARE
  target_email TEXT := 'YOUR_EMAIL_HERE'; -- <--- 請修改這裡
  target_user_id UUID;
BEGIN
  -- 1. 取得 User ID
  SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;
  
  IF target_user_id IS NULL THEN
    RAISE NOTICE '找不到 Email 為 % 的用戶', target_email;
    RETURN;
  END IF;

  RAISE NOTICE '正在初始化用戶 % (ID: %)', target_email, target_user_id;

  -- 2. 建立 User Stats
  INSERT INTO public.user_stats (user_id)
  VALUES (target_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- 3. 建立 Settings
  INSERT INTO public.settings (
    user_id,
    categories
  ) VALUES (
    target_user_id,
    '[
      {"id": "work", "name": "工作", "color": "text-blue-600", "bgColor": "bg-blue-100", "icon": "💼", "isDefault": true},
      {"id": "health", "name": "健康", "color": "text-green-600", "bgColor": "bg-green-100", "icon": "💪", "isDefault": true},
      {"id": "personal", "name": "個人", "color": "text-purple-600", "bgColor": "bg-purple-100", "icon": "👤", "isDefault": true},
      {"id": "learning", "name": "學習", "color": "text-yellow-600", "bgColor": "bg-yellow-100", "icon": "📚", "isDefault": true},
      {"id": "free", "name": "自由", "color": "text-gray-600", "bgColor": "bg-gray-100", "icon": "✨", "isDefault": true}
    ]'::jsonb
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RAISE NOTICE '初始化完成!';
END $$;
