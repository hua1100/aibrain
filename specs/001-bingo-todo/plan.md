# 實作計畫：Bingo 待辦事項

**分支**：`001-bingo-todo` | **日期**：2025-11-19 | **規格**：[spec.md](./spec.md)
**輸入**：功能規格書 `/specs/001-bingo-todo/spec.md`

## 摘要

建立一個結合待辦事項與 Bingo 遊戲的 PWA 應用程式。用戶可以將每日 8 個任務配置到九宮格中，透過完成任務來達成連線，獲得遊戲化的成就感。技術上採用 React + TypeScript + Vite 建構，使用 IndexedDB 本地儲存，Framer Motion + Lottie 實現動畫效果。

## 技術環境

**語言/版本**：TypeScript 5.x + React 18
**主要依賴**：
- Vite 5.x（建置工具）
- Zustand（狀態管理）
- Dexie.js（IndexedDB 封裝）
- Framer Motion（互動動畫）
- Lottie React（慶祝特效）
- Tailwind CSS（樣式）
- Howler.js（音效）
- html2canvas（圖片生成）

**儲存**：IndexedDB（本地優先）
**測試**：Vitest + React Testing Library
**目標平台**：PWA（桌面/行動裝置瀏覽器）
**專案類型**：單一專案（Single Project）
**效能目標**：
- 首次載入 < 3 秒
- 動畫 60fps
- 連線檢測 < 100ms
**限制條件**：
- 離線可用
- 無需帳號即可使用
- 支援主流瀏覽器（Chrome、Safari、Firefox、Edge）
**規模範圍**：MVP 階段，單人使用

## 憲章檢核

*閘門：必須在 Phase 0 研究前通過。Phase 1 設計後重新檢核。*

| 原則 | 檢核項目 | 狀態 |
|------|----------|------|
| 文件語言 | 所有文件使用繁體中文 | ✅ 通過 |
| 文件語言 | 憲章使用英文 | ✅ 通過 |

## 專案結構

### 文件結構（此功能）

```
specs/001-bingo-todo/
├── spec.md              # 功能規格書
├── plan.md              # 本文件（實作計畫）
├── research.md          # Phase 0 研究產出
├── data-model.md        # Phase 1 資料模型設計
├── quickstart.md        # 開發環境設定指南
└── tasks.md             # Phase 2 任務清單
```

### 原始碼結構（專案根目錄）

```
src/
├── components/          # UI 元件
│   ├── BingoBoard/      # Bingo 板元件
│   │   ├── BingoBoard.tsx
│   │   ├── BingoCell.tsx
│   │   ├── LineOverlay.tsx
│   │   └── index.ts
│   ├── TaskInput/       # 任務輸入元件
│   │   ├── TaskInput.tsx
│   │   ├── TaskItem.tsx
│   │   └── index.ts
│   ├── Celebration/     # 慶祝動畫元件
│   │   ├── Confetti.tsx
│   │   ├── LineComplete.tsx
│   │   └── index.ts
│   ├── Stats/           # 統計元件
│   │   ├── StatsPage.tsx
│   │   ├── HistoryChart.tsx
│   │   └── index.ts
│   ├── Achievement/     # 成就元件
│   │   ├── AchievementBadge.tsx
│   │   ├── AchievementList.tsx
│   │   └── index.ts
│   └── common/          # 共用元件
│       ├── Button.tsx
│       ├── Modal.tsx
│       └── index.ts
│
├── hooks/               # 自定義 Hooks
│   ├── useBingoBoard.ts
│   ├── useLineDetection.ts
│   ├── useCombo.ts
│   ├── useAchievements.ts
│   ├── useSound.ts
│   └── useShare.ts
│
├── stores/              # Zustand 狀態管理
│   ├── boardStore.ts
│   ├── settingsStore.ts
│   └── statsStore.ts
│
├── services/            # 服務層
│   ├── database.ts      # Dexie.js 資料庫設定
│   ├── lineDetector.ts  # 連線檢測邏輯
│   ├── achievementChecker.ts
│   ├── shareService.ts
│   └── soundManager.ts
│
├── types/               # TypeScript 型別定義
│   ├── board.ts
│   ├── task.ts
│   ├── achievement.ts
│   └── index.ts
│
├── constants/           # 常數定義
│   ├── categories.ts    # 任務分類
│   ├── achievements.ts  # 成就定義
│   ├── sounds.ts        # 音效設定
│   └── lines.ts         # 連線定義
│
├── utils/               # 工具函數
│   ├── dateUtils.ts
│   ├── shuffleUtils.ts
│   └── exportUtils.ts
│
├── assets/              # 靜態資源
│   ├── sounds/          # 音效檔案
│   ├── animations/      # Lottie 動畫 JSON
│   └── icons/           # 圖示
│
├── pages/               # 頁面元件
│   ├── HomePage.tsx     # 主頁（Bingo 板）
│   ├── CreatePage.tsx   # 建立新板頁面
│   ├── StatsPage.tsx    # 統計頁面
│   ├── AchievementsPage.tsx
│   └── SettingsPage.tsx
│
├── App.tsx              # 應用程式入口
├── main.tsx             # React 入口
└── index.css            # 全域樣式

tests/
├── unit/                # 單元測試
│   ├── lineDetector.test.ts
│   ├── achievementChecker.test.ts
│   └── utils.test.ts
├── integration/         # 整合測試
│   ├── createBoard.test.tsx
│   ├── completeTask.test.tsx
│   └── lineCompletion.test.tsx
└── setup.ts             # 測試設定

public/
├── manifest.json        # PWA manifest
├── sw.js                # Service Worker
└── icons/               # App 圖示

# 根目錄設定檔
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── README.md
```

**結構決定**：採用單一專案結構，因為這是純前端 PWA 應用程式，無需後端服務。元件採用功能導向分類（BingoBoard、TaskInput 等），服務層封裝核心業務邏輯，hooks 提供可重用的狀態邏輯。

## 複雜度追蹤

*僅在憲章檢核有違規需要說明時填寫*

目前無違規項目。

---

## 核心模組設計

### 1. 連線檢測模組 (`lineDetector.ts`)

**功能**：檢測九宮格中的 8 條可能連線

```typescript
// 連線定義（位置索引 0-8）
const LINES = [
  [0, 1, 2], // 上橫
  [3, 4, 5], // 中橫
  [6, 7, 8], // 下橫
  [0, 3, 6], // 左直
  [1, 4, 7], // 中直
  [2, 5, 8], // 右直
  [0, 4, 8], // 左上到右下對角
  [2, 4, 6], // 右上到左下對角
];

// 檢測已完成的連線
function detectCompletedLines(cells: boolean[]): number[][] {
  return LINES.filter(line =>
    line.every(index => cells[index])
  );
}
```

### 2. 連擊系統 (`useCombo.ts`)

**功能**：追蹤連續完成任務的時間間隔

```typescript
interface ComboState {
  count: number;          // 目前連擊數
  lastCompletedAt: Date;  // 上次完成時間
  timeout: number;        // 超時毫秒數（預設 30 分鐘）
}

// 連擊倍數對應
const COMBO_MULTIPLIERS = {
  1: 1,
  2: 1.5,
  3: 2,
  4: 2.5,
  5: 3, // 最高倍數
};
```

### 3. 成就系統 (`achievementChecker.ts`)

**功能**：檢查並解鎖成就

```typescript
// 成就類型
type AchievementType =
  | 'first_line'      // 首次連線
  | 'first_fullhouse' // 首次全清
  | 'week_streak'     // 連續 7 天
  | 'combo_master'    // 達成 5x 連擊
  | 'category_focus'  // 單日完成同分類 3 任務
  | 'early_bird'      // 早上 8 點前完成 3 任務
  // ... 更多成就
```

### 4. 分享功能 (`shareService.ts`)

**功能**：生成分享圖片並呼叫 Web Share API

```typescript
async function generateShareImage(board: BingoBoard): Promise<Blob> {
  // 使用 html2canvas 擷取 Bingo 板
  // 加上品牌浮水印
  // 轉換為適合社群媒體的尺寸
}

async function shareToSocial(blob: Blob, text: string): Promise<void> {
  if (navigator.share) {
    // 使用 Web Share API
  } else {
    // 降級方案：下載圖片
  }
}
```

---

## 狀態管理設計

### Zustand Store 結構

```typescript
// boardStore.ts - Bingo 板狀態
interface BoardStore {
  currentBoard: BingoBoard | null;
  isLoading: boolean;

  // Actions
  createBoard: (tasks: Task[]) => Promise<void>;
  toggleTask: (position: number) => void;
  loadTodayBoard: () => Promise<void>;
}

// settingsStore.ts - 用戶設定
interface SettingsStore {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  theme: 'light' | 'dark' | 'system';

  // Actions
  toggleSound: () => void;
  setTheme: (theme: string) => void;
}

// statsStore.ts - 統計數據
interface StatsStore {
  totalBoards: number;
  totalLines: number;
  maxCombo: number;

  // Actions
  loadStats: () => Promise<void>;
  updateStats: (data: Partial<Stats>) => Promise<void>;
}
```

---

## 頁面流程

### 1. 首次使用流程

```
啟動 App
  ↓
檢查是否有今日 Bingo 板
  ↓
[無] → 顯示建立頁面 → 輸入 8 個任務 → 選擇配置方式 → 建立完成
  ↓
[有] → 顯示今日 Bingo 板
```

### 2. 每日使用流程

```
開啟 App → 載入今日 Bingo 板 → 點擊任務標記完成
  ↓
檢測連線 → [有新連線] → 播放動畫 + 音效
  ↓
檢測連擊 → 更新連擊倍數
  ↓
檢測成就 → [達成] → 顯示成就解鎖通知
  ↓
[全清] → 播放慶祝動畫 → 顯示今日總結
```

---

## PWA 設定

### Service Worker 策略

```javascript
// 快取策略
- App Shell: Cache First（優先使用快取）
- API 資料: Network First（優先使用網路）
- 靜態資源: Stale While Revalidate（使用快取同時更新）
```

### Manifest 設定

```json
{
  "name": "Bingo 待辦事項",
  "short_name": "BingoTodo",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4F46E5",
  "icons": [...]
}
```

---

## 效能優化策略

1. **程式碼分割**
   - 路由層級懶加載
   - Lottie 動畫按需載入

2. **動畫效能**
   - 使用 `transform` 和 `opacity`
   - 啟用 GPU 加速
   - 動畫完成後清理

3. **儲存效能**
   - IndexedDB 批次寫入
   - 使用索引加速查詢

4. **資源優化**
   - 圖片壓縮
   - 音效使用 mp3/ogg 格式
   - Lottie JSON 壓縮

---

## 開發里程碑

| 階段 | 內容 | 預估時間 |
|------|------|----------|
| **M1：核心功能** | 建立板、標記任務、連線檢測 | 3 天 |
| **M2：視覺回饋** | 動畫效果、音效、分類顏色 | 2 天 |
| **M3：遊戲化** | 連擊系統、成就徽章 | 2 天 |
| **M4：資料持久** | IndexedDB、歷史記錄、統計 | 2 天 |
| **M5：PWA** | Service Worker、離線支援、安裝 | 1 天 |
| **M6：分享功能** | 圖片生成、社群分享 | 1 天 |
| **M7：測試優化** | 測試覆蓋、效能優化、修復 | 2 天 |

**總計**：約 13 個工作天

---

## 下一步

Phase 1 實作計畫完成，接下來建立：

1. **data-model.md** - 詳細資料模型與 IndexedDB Schema
2. **quickstart.md** - 開發環境設定步驟
3. **tasks.md** - 具體開發任務分解（Phase 2）
