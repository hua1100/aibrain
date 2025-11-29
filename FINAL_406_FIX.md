# 406 錯誤最終診斷

## ✅ 確認事項

1. ✅ Supabase 資料表已建立
2. ✅ RLS 已啟用
3. ✅ RLS 政策已建立
4. ✅ API 本身正常 (curl 測試返回 200)

## ❌ 問題根源

**瀏覽器請求返回 406,但 curl 返回 200**

這表示問題出在:
1. **Supabase JS 客戶端設定**
2. **請求 Header 問題**
3. **PostgREST 版本不相容**

---

## 🔧 解決方案

### 方案 1: 檢查 Supabase 專案設定

1. 前往 Supabase Dashboard
2. 點擊 **Settings** → **API**
3. 確認以下設定:
   - **PostgREST Version**: 應該是最新版本
   - **Auto-generated API**: 應該是啟用的
   - **Schema**: 應該是 `public`

### 方案 2: 重新啟動 Supabase 服務

在 Supabase Dashboard:
1. 點擊 **Settings** → **General**
2. 找到 **Pause project** 按鈕
3. 暫停專案,等待 30 秒
4. 重新啟動專案

這會重新啟動 PostgREST 服務,可能修復 406 錯誤。

### 方案 3: 檢查 API Schema

在 Supabase SQL Editor 執行:

```sql
-- 檢查 API Schema 設定
SHOW search_path;

-- 確認 public schema 存在
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name = 'public';
```

### 方案 4: 暫時停用 RLS 測試

如果以上都無效,暫時停用 RLS 來確認問題:

```sql
ALTER TABLE boards DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
```

重新整理瀏覽器測試。

**如果 406 消失**:
- 問題確定是 RLS 相關
- 可能是政策的 `USING` 或 `WITH CHECK` 子句有問題

**如果 406 仍存在**:
- 問題是 PostgREST 或 API 設定
- 需要檢查 Supabase 專案設定

---

## 🎯 最可能的解決方案

根據經驗,最常見的原因是:

1. **PostgREST 需要重啟** → 暫停/重啟專案
2. **Schema 設定錯誤** → 確認 API 設定中的 Schema 是 `public`
3. **RLS 政策語法問題** → 暫時停用 RLS 測試

請先嘗試**暫停/重啟專案**,這通常能解決 406 錯誤!
