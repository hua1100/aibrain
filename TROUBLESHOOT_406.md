# Supabase 406 錯誤診斷與修復

## ✅ 資料表已建立

您的截圖顯示所有 5 個資料表都已成功建立:
- boards
- daily_stats  
- settings
- tasks
- user_stats

## 🔍 問題診斷

HTTP 406 (Not Acceptable) 錯誤通常是因為:

1. **RLS 政策問題** - 最可能的原因
2. **API 設定問題**
3. **PostgREST 版本不相容**

---

## 🛠️ 修復步驟

### 步驟 1: 檢查 RLS 是否正確啟用

在 Supabase SQL Editor 執行:

```sql
-- 檢查 RLS 狀態
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('boards', 'tasks', 'user_stats', 'daily_stats', 'settings');
```

**預期結果**: 所有資料表的 `rowsecurity` 都應該是 `true`

---

### 步驟 2: 檢查 RLS 政策是否存在

```sql
-- 檢查政策
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

**預期結果**: 應該看到多個政策,例如:
- `用戶只能查看自己的 boards`
- `用戶只能新增自己的 boards`
- 等等...

---

### 步驟 3: 暫時停用 RLS 測試 (僅用於診斷)

```sql
-- ⚠️ 僅用於測試,不要在生產環境使用
ALTER TABLE boards DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
```

執行後,重新整理瀏覽器測試。

**如果 406 錯誤消失**:
- 問題確定是 RLS 政策
- 需要修復政策後重新啟用 RLS

**如果 406 錯誤仍存在**:
- 問題可能是 API 設定或其他原因

---

### 步驟 4: 檢查 Supabase API 設定

1. 在 Supabase Dashboard 點擊 **"Settings"** → **"API"**
2. 確認 **"Auto-generated API"** 是啟用的
3. 檢查 **"PostgREST Version"**

---

### 步驟 5: 重新啟用 RLS (如果步驟 3 有效)

```sql
-- 重新啟用 RLS
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
```

---

## 🔧 可能的修復方案

### 方案 A: 修復 RLS 政策 (如果政策有問題)

在 SQL Editor 執行:

```sql
-- 刪除所有現有政策
DROP POLICY IF EXISTS "用戶只能查看自己的 boards" ON boards;
DROP POLICY IF EXISTS "用戶只能新增自己的 boards" ON boards;
DROP POLICY IF EXISTS "用戶只能更新自己的 boards" ON boards;
DROP POLICY IF EXISTS "用戶只能刪除自己的 boards" ON boards;

-- 重新建立政策 (使用簡單的政策)
CREATE POLICY "Enable all for authenticated users" ON boards
  FOR ALL USING (auth.uid() = user_id);

-- 對其他表重複相同操作
CREATE POLICY "Enable all for authenticated users" ON tasks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Enable all for authenticated users" ON user_stats
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Enable all for authenticated users" ON daily_stats
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Enable all for authenticated users" ON settings
  FOR ALL USING (auth.uid() = user_id);
```

---

### 方案 B: 完全重置 (如果以上都無效)

```sql
-- 1. 刪除所有資料表
DROP TABLE IF EXISTS boards CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS user_stats CASCADE;
DROP TABLE IF EXISTS daily_stats CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

-- 2. 重新執行完整的 supabase_schema.sql
```

---

## 📝 請執行並回報

請先執行 **步驟 1** 和 **步驟 2**,並告訴我結果。

如果看到任何錯誤訊息或異常,請複製貼上給我!
