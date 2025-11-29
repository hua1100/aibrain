# Supabase 設定指南

## 🚨 目前狀態

您看到的 **HTTP 406 錯誤** 是因為 Supabase 資料表尚未建立。

```
Failed to load resource: the server responded with a status of 406
```

這是正常的!只需要執行以下步驟即可解決。

---

## 📋 設定步驟

### 步驟 1: 登入 Supabase Dashboard

1. 前往 https://supabase.com/dashboard
2. 使用您的帳號登入
3. 選擇專案: `dnnzkhsckhvxtlwaxxrq`

---

### 步驟 2: 執行 SQL Schema

1. 在左側選單點擊 **"SQL Editor"**
2. 點擊 **"New query"** 建立新查詢
3. 複製 `supabase_schema.sql` 的**完整內容**
4. 貼上到 SQL Editor
5. 點擊 **"Run"** 執行

> [!IMPORTANT]
> 必須執行完整的 SQL 檔案,包含所有資料表、索引、RLS 政策和觸發器。

---

### 步驟 3: 驗證資料表建立

執行完成後,在左側選單點擊 **"Table Editor"**,應該會看到:

- ✅ `boards`
- ✅ `tasks`
- ✅ `user_stats`
- ✅ `daily_stats`
- ✅ `settings`

---

### 步驟 4: 重新整理應用程式

1. 回到瀏覽器
2. 按 `Ctrl+Shift+R` (或 `Cmd+Shift+R` on Mac) 強制重新整理
3. 重新登入

---

## ✅ 預期結果

執行 Schema 後,您應該會看到:

```
🔄 初始化用戶 xxx 的數據...
✅ 用戶數據已初始化
```

**不再有 406 錯誤!**

---

## 🔍 常見問題

### Q: 執行 SQL 時出現錯誤?

**A**: 確保您複製了完整的 `supabase_schema.sql` 內容,包含:
- CREATE TABLE 語句
- CREATE INDEX 語句
- CREATE POLICY 語句
- CREATE TRIGGER 語句
- CREATE FUNCTION 語句

### Q: 資料表建立了,但還是 406 錯誤?

**A**: 檢查 RLS (Row Level Security) 政策是否正確啟用:

```sql
-- 在 SQL Editor 執行
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

所有資料表的 `rowsecurity` 應該都是 `true`。

### Q: 觸發器有執行嗎?

**A**: 檢查觸發器:

```sql
-- 在 SQL Editor 執行
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

應該會看到:
- `on_auth_user_created` (auth.users 表)
- `on_board_created` (boards 表)
- `update_*_updated_at` (各資料表)

---

## 📞 需要協助?

如果執行後還有問題,請提供:
1. SQL 執行的錯誤訊息
2. 瀏覽器 Console 的完整錯誤
3. Supabase Table Editor 的截圖

---

## 🎯 下一步

Schema 執行成功後:

1. **測試登入**: 註冊新帳號或登入現有帳號
2. **建立 Bingo 板**: 測試資料是否正確寫入
3. **檢查 Supabase**: 在 Table Editor 查看資料

祝您設定順利! 🚀
