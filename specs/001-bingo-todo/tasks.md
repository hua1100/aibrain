# 任務清單：Bingo 待辦事項

**輸入**：設計文件 `/specs/001-bingo-todo/`
**前置條件**：plan.md（必要）、spec.md（必要）、research.md、data-model.md、quickstart.md

## 格式說明：`[ID] [P?] [Story] 描述`
- **[P]**：可並行執行（不同檔案、無依賴）
- **[Story]**：所屬用戶故事（US1、US2、US3...）
- 描述包含確切檔案路徑

## 路徑慣例
- 原始碼：`src/`
- 測試：`tests/`
- 公開資源：`public/`

---

## Phase 1：專案設定（共用基礎建設）

**目的**：專案初始化與基本結構

- [ ] T001 使用 Vite + React + TypeScript 建立專案
- [ ] T002 [P] 安裝核心依賴（Zustand、Dexie、Framer Motion、Lottie）
- [ ] T003 [P] 安裝樣式依賴（Tailwind CSS）並設定 tailwind.config.js
- [ ] T004 [P] 安裝測試框架（Vitest、Testing Library）並設定 vitest.config.ts
- [ ] T005 設定 vite.config.ts（路徑別名、PWA 插件）
- [ ] T006 [P] 設定 tsconfig.json（路徑別名、嚴格模式）
- [ ] T007 [P] 設定 ESLint 與 Prettier
- [ ] T008 建立目錄結構（components、hooks、stores、services、types、constants、utils、assets、pages）

---

## Phase 2：基礎建設（阻擋性前置條件）

**目的**：核心基礎設施，必須完成後才能開始任何用戶故事

**⚠️ 重要**：此階段完成前，不可開始任何用戶故事

- [ ] T009 建立 TypeScript 型別定義 src/types/board.ts（BingoBoard、BoardStatus）
- [ ] T010 [P] 建立 TypeScript 型別定義 src/types/task.ts（Task、TaskInput）
- [ ] T011 [P] 建立 TypeScript 型別定義 src/types/achievement.ts（Achievement、AchievementType）
- [ ] T012 [P] 建立 TypeScript 型別定義 src/types/index.ts（匯出所有型別）
- [ ] T013 建立常數定義 src/constants/categories.ts（CategoryType、CATEGORIES）
- [ ] T014 [P] 建立常數定義 src/constants/lines.ts（LINES 連線定義陣列）
- [ ] T015 [P] 建立常數定義 src/constants/achievements.ts（成就定義配置）
- [ ] T016 建立 IndexedDB 資料庫設定 src/services/database.ts（Dexie 初始化）
- [ ] T017 建立共用元件 src/components/common/Button.tsx
- [ ] T018 [P] 建立共用元件 src/components/common/Modal.tsx
- [ ] T019 [P] 建立共用元件 src/components/common/index.ts
- [ ] T020 設定 React Router 路由 src/App.tsx
- [ ] T021 建立全域樣式 src/index.css（Tailwind 基礎樣式）

**檢查點**：基礎建設完成 - 用戶故事實作可以開始

---

## Phase 3：用戶故事 1 - 建立今日 Bingo 板（優先級：P1）🎯 MVP

**目標**：用戶可以輸入 8 個任務並建立九宮格 Bingo 板

**獨立測試**：建立一個 Bingo 板並確認 9 個格子（含免費格）正確顯示

### 實作任務

- [ ] T022 [P] [US1] 建立 BingoCell 元件 src/components/BingoBoard/BingoCell.tsx
- [ ] T023 [P] [US1] 建立 BingoBoard 元件 src/components/BingoBoard/BingoBoard.tsx
- [ ] T024 [P] [US1] 建立 BingoBoard 索引 src/components/BingoBoard/index.ts
- [ ] T025 [P] [US1] 建立 TaskItem 元件 src/components/TaskInput/TaskItem.tsx
- [ ] T026 [US1] 建立 TaskInput 元件 src/components/TaskInput/TaskInput.tsx（依賴 T025）
- [ ] T027 [P] [US1] 建立 TaskInput 索引 src/components/TaskInput/index.ts
- [ ] T028 [US1] 建立 boardStore src/stores/boardStore.ts（Zustand 狀態管理）
- [ ] T029 [US1] 實作 createBoard 服務函數 src/services/boardService.ts
- [ ] T030 [US1] 建立 CreatePage 頁面 src/pages/CreatePage.tsx
- [ ] T031 [US1] 建立 HomePage 頁面 src/pages/HomePage.tsx（顯示今日 Bingo 板）
- [ ] T032 [US1] 實作載入今日 Bingo 板邏輯 src/hooks/useBingoBoard.ts
- [ ] T033 [US1] 加入任務數量驗證（必須 8 個）
- [ ] T034 [US1] 處理免費格自動完成邏輯

**檢查點**：用戶故事 1 完成 - 可獨立測試建立 Bingo 板功能

---

## Phase 4：用戶故事 2 - 完成任務並標記（優先級：P1）🎯 MVP

**目標**：用戶可以點擊格子標記任務完成/未完成

**獨立測試**：點擊任務格子，確認狀態切換與視覺回饋

### 實作任務

- [ ] T035 [US2] 實作 toggleTask 服務函數 src/services/boardService.ts
- [ ] T036 [US2] 更新 BingoCell 元件加入點擊處理 src/components/BingoBoard/BingoCell.tsx
- [ ] T037 [US2] 加入完成狀態視覺效果（打勾、變色）
- [ ] T038 [US2] 實作取消完成功能（再次點擊）
- [ ] T039 [US2] 更新 boardStore 加入 toggleTask action
- [ ] T040 [US2] 禁止點擊免費格
- [ ] T041 [US2] 加入點擊動畫效果（Framer Motion 縮放）

**檢查點**：用戶故事 2 完成 - 可獨立測試任務標記功能

---

## Phase 5：用戶故事 3 - 連線檢測與獎勵（優先級：P1）🎯 MVP

**目標**：完成連線時顯示視覺與音效回饋

**獨立測試**：完成三個連續格子，確認連線動畫與音效觸發

### 實作任務

- [ ] T042 [US3] 實作連線檢測邏輯 src/services/lineDetector.ts
- [ ] T043 [US3] 建立 useLineDetection Hook src/hooks/useLineDetection.ts
- [ ] T044 [US3] 建立 LineOverlay 元件 src/components/BingoBoard/LineOverlay.tsx（畫線動畫）
- [ ] T045 [P] [US3] 建立 LineComplete 元件 src/components/Celebration/LineComplete.tsx
- [ ] T046 [P] [US3] 建立 Confetti 元件 src/components/Celebration/Confetti.tsx（全清動畫）
- [ ] T047 [US3] 建立 soundManager 服務 src/services/soundManager.ts
- [ ] T048 [US3] 建立 useSound Hook src/hooks/useSound.ts
- [ ] T049 [P] [US3] 加入音效檔案 src/assets/sounds/（line-complete.mp3、fullhouse.mp3）
- [ ] T050 [P] [US3] 加入 Lottie 動畫檔案 src/assets/animations/（confetti.json）
- [ ] T051 [US3] 整合連線檢測到 boardStore
- [ ] T052 [US3] 實作全清（Full House）檢測與慶祝動畫
- [ ] T053 [US3] 更新 BingoBoard 顯示已完成連線

**檢查點**：用戶故事 3 完成 - MVP 核心功能完成，可進行完整遊戲流程

---

## Phase 6：用戶故事 4 - 任務分類與顏色標籤（優先級：P2）

**目標**：任務可設定分類並以顏色區分顯示

**獨立測試**：建立帶有不同分類的任務，確認顏色正確顯示

### 實作任務

- [ ] T054 [US4] 更新 TaskItem 元件加入分類選擇器 src/components/TaskInput/TaskItem.tsx
- [ ] T055 [US4] 建立 CategorySelector 元件 src/components/TaskInput/CategorySelector.tsx
- [ ] T056 [US4] 更新 BingoCell 元件顯示分類顏色 src/components/BingoBoard/BingoCell.tsx
- [ ] T057 [US4] 加入分類圖示顯示
- [ ] T058 [US4] 更新 createBoard 邏輯處理分類資料

**檢查點**：用戶故事 4 完成 - 任務分類功能可用

---

## Phase 7：用戶故事 5 - 連擊加成系統（優先級：P2）

**目標**：連續完成任務獲得加成分數

**獨立測試**：在 30 分鐘內連續完成任務，確認連擊倍數增加

### 實作任務

- [ ] T059 [US5] 建立 useCombo Hook src/hooks/useCombo.ts
- [ ] T060 [US5] 實作連擊計算邏輯（30 分鐘超時）
- [ ] T061 [US5] 建立 ComboDisplay 元件 src/components/BingoBoard/ComboDisplay.tsx
- [ ] T062 [US5] 加入連擊數字動畫（彈跳效果）
- [ ] T063 [US5] 更新 toggleTask 計算加成分數
- [ ] T064 [US5] 更新 boardStore 追蹤連擊狀態
- [ ] T065 [US5] 加入連擊中斷音效

**檢查點**：用戶故事 5 完成 - 連擊系統可用

---

## Phase 8：用戶故事 6 - 成就徽章系統（優先級：P2）

**目標**：達成里程碑時解鎖成就徽章

**獨立測試**：首次全清後確認徽章解鎖通知出現

### 實作任務

- [ ] T066 [US6] 實作成就檢查邏輯 src/services/achievementChecker.ts
- [ ] T067 [US6] 建立 useAchievements Hook src/hooks/useAchievements.ts
- [ ] T068 [US6] 建立 AchievementBadge 元件 src/components/Achievement/AchievementBadge.tsx
- [ ] T069 [P] [US6] 建立 AchievementList 元件 src/components/Achievement/AchievementList.tsx
- [ ] T070 [P] [US6] 建立 AchievementUnlock 通知元件 src/components/Achievement/AchievementUnlock.tsx
- [ ] T071 [US6] 建立 AchievementsPage 頁面 src/pages/AchievementsPage.tsx
- [ ] T072 [US6] 整合成就檢查到任務完成流程
- [ ] T073 [US6] 加入成就解鎖動畫與音效
- [ ] T074 [P] [US6] 加入成就圖示 src/assets/icons/achievements/

**檢查點**：用戶故事 6 完成 - 成就系統可用

---

## Phase 9：用戶故事 7 - 隨機配置模式（優先級：P3）

**目標**：系統自動隨機配置任務位置

**獨立測試**：選擇隨機模式，確認任務位置與輸入順序不同

### 實作任務

- [ ] T075 [US7] 建立 shuffleUtils 工具函數 src/utils/shuffleUtils.ts
- [ ] T076 [US7] 更新 CreatePage 加入隨機配置選項
- [ ] T077 [US7] 更新 createBoard 服務支援隨機配置

**檢查點**：用戶故事 7 完成 - 隨機配置功能可用

---

## Phase 10：用戶故事 8 - 歷史統計與回顧（優先級：P3）

**目標**：查看過去完成記錄與統計圖表

**獨立測試**：使用數天後查看統計頁面，確認數據正確顯示

### 實作任務

- [ ] T078 [US8] 建立 statsStore src/stores/statsStore.ts
- [ ] T079 [US8] 實作 updateDailyStats 服務函數 src/services/statsService.ts
- [ ] T080 [US8] 建立 HistoryChart 元件 src/components/Stats/HistoryChart.tsx
- [ ] T081 [P] [US8] 建立 CategoryStats 元件 src/components/Stats/CategoryStats.tsx
- [ ] T082 [P] [US8] 建立 StreakDisplay 元件 src/components/Stats/StreakDisplay.tsx
- [ ] T083 [US8] 建立 StatsPage 頁面 src/pages/StatsPage.tsx
- [ ] T084 [US8] 整合統計更新到任務完成流程
- [ ] T085 [US8] 實作歷史 Bingo 板回顧功能

**檢查點**：用戶故事 8 完成 - 統計功能可用

---

## Phase 11：用戶故事 9 - 社群分享功能（優先級：P3）

**目標**：完成連線時可分享成果到社群媒體

**獨立測試**：完成連線後點擊分享，確認分享圖片正確生成

### 實作任務

- [ ] T086 [US9] 建立 shareService 服務 src/services/shareService.ts
- [ ] T087 [US9] 實作圖片生成邏輯（html2canvas）
- [ ] T088 [US9] 建立 useShare Hook src/hooks/useShare.ts
- [ ] T089 [US9] 建立 ShareButton 元件 src/components/common/ShareButton.tsx
- [ ] T090 [US9] 加入分享圖片浮水印與品牌元素
- [ ] T091 [US9] 實作 Web Share API 呼叫
- [ ] T092 [US9] 加入降級方案（下載圖片）

**檢查點**：用戶故事 9 完成 - 分享功能可用

---

## Phase 12：PWA 與設定

**目的**：PWA 支援與用戶設定功能

- [ ] T093 [P] 建立 settingsStore src/stores/settingsStore.ts
- [ ] T094 [P] 建立 SettingsPage 頁面 src/pages/SettingsPage.tsx
- [ ] T095 實作主題切換（亮色/暗色/系統）
- [ ] T096 實作音效開關與音量控制
- [ ] T097 設定 PWA manifest public/manifest.json
- [ ] T098 [P] 建立 PWA 圖示 public/icons/（192x192、512x512）
- [ ] T099 設定 Service Worker（Workbox）
- [ ] T100 實作離線支援與快取策略
- [ ] T101 加入 PWA 安裝提示

**檢查點**：PWA 功能完成 - 可安裝、離線可用

---

## Phase 13：資料備份與匯出

**目的**：資料匯出與匯入功能

- [ ] T102 建立 exportUtils 工具函數 src/utils/exportUtils.ts
- [ ] T103 實作匯出 JSON 功能
- [ ] T104 實作匯入還原功能
- [ ] T105 在 SettingsPage 加入匯出/匯入按鈕

---

## Phase 14：收尾與跨領域優化

**目的**：影響多個用戶故事的改進

- [ ] T106 [P] 建立首次使用教學引導
- [ ] T107 [P] 更新 README.md 文件
- [ ] T108 程式碼重構與清理
- [ ] T109 效能優化（React.memo、懶載入）
- [ ] T110 [P] 執行 quickstart.md 驗證
- [ ] T111 跨瀏覽器測試（Chrome、Safari、Firefox、Edge）
- [ ] T112 行動裝置測試（iOS Safari、Android Chrome）
- [ ] T113 Lighthouse PWA 檢查與優化

---

## 依賴關係與執行順序

### Phase 依賴

- **Phase 1（設定）**：無依賴 - 可立即開始
- **Phase 2（基礎建設）**：依賴 Phase 1 完成 - 阻擋所有用戶故事
- **Phase 3-5（P1 用戶故事）**：依賴 Phase 2 完成
  - US1 → US2 → US3（有順序依賴）
- **Phase 6-8（P2 用戶故事）**：依賴 Phase 5（US3）完成
  - US4、US5、US6 可並行
- **Phase 9-11（P3 用戶故事）**：依賴 Phase 8 完成
  - US7、US8、US9 可並行
- **Phase 12-14**：依賴所需用戶故事完成

### 用戶故事依賴

- **US1（建立板）**：Phase 2 完成後可開始 - 無其他故事依賴
- **US2（標記任務）**：依賴 US1 - 需要 Bingo 板才能標記
- **US3（連線檢測）**：依賴 US2 - 需要標記功能才能檢測連線
- **US4（分類標籤）**：依賴 US1 - 獨立於 US2/US3
- **US5（連擊系統）**：依賴 US2 - 需要標記功能
- **US6（成就系統）**：依賴 US3 - 需要連線檢測
- **US7（隨機配置）**：依賴 US1 - 獨立功能
- **US8（統計）**：依賴 US3 - 需要完整遊戲數據
- **US9（分享）**：依賴 US3 - 需要連線結果

### 並行機會

- Phase 1 所有 [P] 任務可並行
- Phase 2 所有 [P] 任務可並行
- Phase 2 完成後，US1 元件任務可並行（T022-T027）
- US4、US5、US6 可並行開發
- US7、US8、US9 可並行開發

---

## 並行範例：Phase 2 基礎建設

```bash
# 同時執行所有型別定義任務：
任務：「建立 TypeScript 型別定義 src/types/board.ts」
任務：「建立 TypeScript 型別定義 src/types/task.ts」
任務：「建立 TypeScript 型別定義 src/types/achievement.ts」

# 同時執行所有常數定義任務：
任務：「建立常數定義 src/constants/categories.ts」
任務：「建立常數定義 src/constants/lines.ts」
任務：「建立常數定義 src/constants/achievements.ts」
```

---

## 實作策略

### MVP 優先（僅 P1 用戶故事）

1. 完成 Phase 1：設定
2. 完成 Phase 2：基礎建設（重要 - 阻擋所有故事）
3. 完成 Phase 3：US1 建立 Bingo 板
4. 完成 Phase 4：US2 標記任務
5. 完成 Phase 5：US3 連線檢測
6. **停止並驗證**：測試完整遊戲流程
7. 部署/展示 MVP

### 增量交付

1. 完成 MVP → 部署/展示
2. 加入 US4 分類標籤 → 測試 → 部署
3. 加入 US5 連擊系統 → 測試 → 部署
4. 加入 US6 成就系統 → 測試 → 部署
5. 加入 P3 功能 → 測試 → 部署
6. 每個用戶故事獨立增加價值

---

## 預估時程

| Phase | 任務數 | 預估時間 |
|-------|--------|----------|
| Phase 1-2（設定+基礎） | 21 | 1.5 天 |
| Phase 3（US1） | 13 | 1 天 |
| Phase 4（US2） | 7 | 0.5 天 |
| Phase 5（US3） | 12 | 1 天 |
| Phase 6（US4） | 5 | 0.5 天 |
| Phase 7（US5） | 7 | 0.5 天 |
| Phase 8（US6） | 9 | 1 天 |
| Phase 9（US7） | 3 | 0.25 天 |
| Phase 10（US8） | 8 | 1 天 |
| Phase 11（US9） | 7 | 0.75 天 |
| Phase 12-14（收尾） | 21 | 2 天 |
| **總計** | **113** | **~10 工作天** |

---

## 注意事項

- [P] 任務 = 不同檔案、無依賴
- [Story] 標籤對應用戶故事以便追蹤
- 每個用戶故事應可獨立完成與測試
- 實作前先確認測試失敗（如有撰寫測試）
- 每個任務或邏輯群組完成後提交
- 在任何檢查點停止以獨立驗證故事
- 避免：模糊任務、同檔案衝突、破壞獨立性的跨故事依賴
