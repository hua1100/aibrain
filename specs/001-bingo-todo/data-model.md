# 資料模型設計：Bingo 待辦事項

**功能分支**：`001-bingo-todo`
**建立日期**：2025-11-19
**狀態**：Phase 1 設計完成

---

## 概覽

本文件定義 Bingo 待辦事項應用程式的資料模型，包含 IndexedDB Schema 設計、TypeScript 型別定義、以及實體關係說明。

---

## 實體關係圖

```
┌─────────────┐       ┌─────────────┐
│  BingoBoard │───┬───│    Task     │
└─────────────┘   │   └─────────────┘
                  │
                  │   ┌─────────────┐
                  └───│  Category   │
                      └─────────────┘

┌─────────────┐       ┌─────────────┐
│ Achievement │       │  UserStats  │
└─────────────┘       └─────────────┘

┌─────────────┐
│  Settings   │
└─────────────┘
```

**關係說明**：
- 一個 BingoBoard 包含 9 個 Task（含 1 個免費格）
- 每個 Task 屬於一個 Category
- Achievement 和 UserStats 為獨立實體
- Settings 為單例，儲存用戶偏好

---

## 核心實體定義

### 1. BingoBoard（Bingo 板）

代表一個九宮格遊戲板。

```typescript
interface BingoBoard {
  id: string;                    // UUID，主鍵
  date: string;                  // ISO 日期 (YYYY-MM-DD)，索引
  tasks: Task[];                 // 9 個任務（含免費格）
  completedLines: number[][];    // 已完成的連線陣列
  status: BoardStatus;           // 板狀態
  score: number;                 // 總得分
  maxCombo: number;              // 本日最高連擊
  createdAt: Date;               // 建立時間
  completedAt: Date | null;      // 全清時間（若有）
}

type BoardStatus =
  | 'in_progress'  // 進行中
  | 'completed'    // 全清
  | 'expired';     // 已過期（跨日未完成）
```

**IndexedDB Schema**：
```typescript
boards: '&id, date, status, createdAt'
```

**索引說明**：
- `&id`：主鍵（唯一）
- `date`：按日期查詢今日/歷史板
- `status`：篩選進行中/已完成板
- `createdAt`：按時間排序

---

### 2. Task（任務）

代表 Bingo 板中的單一格子。

```typescript
interface Task {
  id: string;                    // UUID
  boardId: string;               // 所屬 BingoBoard ID
  name: string;                  // 任務名稱
  category: CategoryType;        // 分類
  position: number;              // 位置 (0-8)
  isCompleted: boolean;          // 是否完成
  isFreeSpace: boolean;          // 是否為免費格
  completedAt: Date | null;      // 完成時間
  comboMultiplier: number;       // 完成時的連擊倍數
  points: number;                // 獲得分數
}

// 位置對應
// 0 | 1 | 2
// ---------
// 3 | 4 | 5
// ---------
// 6 | 7 | 8
// 位置 4 為中央免費格
```

**IndexedDB Schema**：
```typescript
tasks: '&id, boardId, position, isCompleted'
```

---

### 3. Category（分類）

代表任務的類型分類。

```typescript
type CategoryType =
  | 'work'      // 工作
  | 'health'    // 健康
  | 'personal'  // 個人
  | 'learning'  // 學習
  | 'free';     // 免費格專用

interface CategoryConfig {
  type: CategoryType;
  name: string;           // 顯示名稱
  color: string;          // 主色（HEX）
  bgColor: string;        // 背景色
  icon: string;           // 圖示名稱
}

// 預設分類配置
const CATEGORIES: Record<CategoryType, CategoryConfig> = {
  work: {
    type: 'work',
    name: '工作',
    color: '#3B82F6',      // 藍色
    bgColor: '#DBEAFE',
    icon: 'briefcase',
  },
  health: {
    type: 'health',
    name: '健康',
    color: '#10B981',      // 綠色
    bgColor: '#D1FAE5',
    icon: 'heart',
  },
  personal: {
    type: 'personal',
    name: '個人',
    color: '#F59E0B',      // 橙色
    bgColor: '#FEF3C7',
    icon: 'user',
  },
  learning: {
    type: 'learning',
    name: '學習',
    color: '#8B5CF6',      // 紫色
    bgColor: '#EDE9FE',
    icon: 'book',
  },
  free: {
    type: 'free',
    name: '免費',
    color: '#6B7280',      // 灰色
    bgColor: '#F3F4F6',
    icon: 'star',
  },
};
```

**說明**：分類為常數定義，不儲存於 IndexedDB。

---

### 4. Achievement（成就）

代表用戶可解鎖的成就徽章。

```typescript
interface Achievement {
  id: string;                    // 成就 ID（預定義）
  type: AchievementType;         // 成就類型
  unlockedAt: Date | null;       // 解鎖時間（null 表示未解鎖）
  progress: number;              // 進度（0-100）
}

type AchievementType =
  | 'first_line'           // 首次連線
  | 'first_fullhouse'      // 首次全清
  | 'three_lines'          // 單日完成 3 條連線
  | 'five_lines'           // 單日完成 5 條連線
  | 'week_streak'          // 連續 7 天完成至少 1 條連線
  | 'month_streak'         // 連續 30 天
  | 'combo_3x'             // 達成 3x 連擊
  | 'combo_5x'             // 達成 5x 連擊（最高）
  | 'early_bird'           // 早上 8 點前完成 3 任務
  | 'night_owl'            // 晚上 10 點後完成 3 任務
  | 'category_master_work' // 完成 50 個工作任務
  | 'category_master_health'
  | 'category_master_personal'
  | 'category_master_learning'
  | 'speed_demon'          // 30 分鐘內全清
  | 'perfectionist'        // 累計 10 次全清
  | 'veteran';             // 累計使用 100 天

// 成就定義配置
interface AchievementConfig {
  type: AchievementType;
  name: string;              // 成就名稱
  description: string;       // 描述
  icon: string;              // 圖示
  condition: string;         // 解鎖條件說明
  maxProgress: number;       // 最大進度值
}
```

**IndexedDB Schema**：
```typescript
achievements: '&id, type, unlockedAt'
```

---

### 5. UserStats（用戶統計）

代表用戶的累計統計數據。

```typescript
interface UserStats {
  id: string;                    // 固定為 'global'（單例）

  // 累計統計
  totalBoards: number;           // 總建立板數
  totalTasks: number;            // 總完成任務數
  totalLines: number;            // 總完成連線數
  totalFullHouses: number;       // 總全清次數
  totalScore: number;            // 總得分

  // 記錄
  maxCombo: number;              // 歷史最高連擊
  maxDailyScore: number;         // 單日最高分
  maxDailyLines: number;         // 單日最多連線

  // 連續記錄
  currentStreak: number;         // 目前連續天數
  longestStreak: number;         // 最長連續天數
  lastActiveDate: string;        // 最後活躍日期

  // 分類統計
  categoryStats: Record<CategoryType, number>;  // 各分類完成數

  // 時間統計
  averageCompletionTime: number; // 平均全清時間（分鐘）
  fastestFullHouse: number;      // 最快全清時間（分鐘）
}
```

**IndexedDB Schema**：
```typescript
stats: '&id'
```

---

### 6. DailyStats（每日統計）

代表單日的統計數據，用於歷史圖表。

```typescript
interface DailyStats {
  id: string;                    // 日期 (YYYY-MM-DD)
  date: string;                  // ISO 日期
  tasksCompleted: number;        // 完成任務數
  linesCompleted: number;        // 完成連線數
  isFullHouse: boolean;          // 是否全清
  score: number;                 // 當日得分
  maxCombo: number;              // 當日最高連擊
  timeSpent: number;             // 花費時間（分鐘）
}
```

**IndexedDB Schema**：
```typescript
dailyStats: '&id, date'
```

---

### 7. Settings（設定）

代表用戶偏好設定。

```typescript
interface Settings {
  id: string;                    // 固定為 'user'（單例）

  // 音效設定
  soundEnabled: boolean;         // 音效開關
  soundVolume: number;           // 音量 (0-100)
  vibrationEnabled: boolean;     // 震動開關（行動裝置）

  // 顯示設定
  theme: 'light' | 'dark' | 'system';

  // 遊戲設定
  comboTimeout: number;          // 連擊超時（毫秒），預設 1800000 (30分鐘)
  showTutorial: boolean;         // 是否顯示教學

  // 通知設定
  reminderEnabled: boolean;      // 提醒開關
  reminderTime: string;          // 提醒時間 (HH:mm)
}
```

**IndexedDB Schema**：
```typescript
settings: '&id'
```

---

## IndexedDB 完整 Schema

```typescript
import Dexie, { Table } from 'dexie';

export class BingoTodoDatabase extends Dexie {
  boards!: Table<BingoBoard>;
  tasks!: Table<Task>;
  achievements!: Table<Achievement>;
  stats!: Table<UserStats>;
  dailyStats!: Table<DailyStats>;
  settings!: Table<Settings>;

  constructor() {
    super('BingoTodoDatabase');

    this.version(1).stores({
      boards: '&id, date, status, createdAt',
      tasks: '&id, boardId, position, isCompleted',
      achievements: '&id, type, unlockedAt',
      stats: '&id',
      dailyStats: '&id, date',
      settings: '&id',
    });
  }
}

export const db = new BingoTodoDatabase();
```

---

## 資料操作範例

### 建立新 Bingo 板

```typescript
async function createBoard(taskInputs: TaskInput[]): Promise<BingoBoard> {
  const boardId = crypto.randomUUID();
  const today = new Date().toISOString().split('T')[0];

  // 建立任務（含免費格）
  const tasks: Task[] = taskInputs.map((input, index) => ({
    id: crypto.randomUUID(),
    boardId,
    name: input.name,
    category: input.category,
    position: index < 4 ? index : index + 1, // 跳過位置 4
    isCompleted: false,
    isFreeSpace: false,
    completedAt: null,
    comboMultiplier: 1,
    points: 0,
  }));

  // 插入免費格（位置 4）
  tasks.splice(4, 0, {
    id: crypto.randomUUID(),
    boardId,
    name: '免費',
    category: 'free',
    position: 4,
    isCompleted: true,  // 免費格預設完成
    isFreeSpace: true,
    completedAt: new Date(),
    comboMultiplier: 1,
    points: 0,
  });

  const board: BingoBoard = {
    id: boardId,
    date: today,
    tasks,
    completedLines: [],
    status: 'in_progress',
    score: 0,
    maxCombo: 0,
    createdAt: new Date(),
    completedAt: null,
  };

  await db.transaction('rw', db.boards, db.tasks, async () => {
    await db.boards.add(board);
    await db.tasks.bulkAdd(tasks);
  });

  return board;
}
```

### 標記任務完成

```typescript
async function toggleTask(
  boardId: string,
  taskId: string,
  comboMultiplier: number
): Promise<void> {
  const task = await db.tasks.get(taskId);
  if (!task || task.isFreeSpace) return;

  const isCompleting = !task.isCompleted;
  const points = isCompleting ? 10 * comboMultiplier : 0;

  await db.tasks.update(taskId, {
    isCompleted: isCompleting,
    completedAt: isCompleting ? new Date() : null,
    comboMultiplier: isCompleting ? comboMultiplier : 1,
    points,
  });

  // 更新板總分
  const board = await db.boards.get(boardId);
  if (board) {
    const allTasks = await db.tasks.where('boardId').equals(boardId).toArray();
    const totalScore = allTasks.reduce((sum, t) => sum + t.points, 0);
    await db.boards.update(boardId, { score: totalScore });
  }
}
```

### 查詢今日 Bingo 板

```typescript
async function getTodayBoard(): Promise<BingoBoard | undefined> {
  const today = new Date().toISOString().split('T')[0];
  return db.boards.where('date').equals(today).first();
}
```

### 解鎖成就

```typescript
async function unlockAchievement(type: AchievementType): Promise<void> {
  const existing = await db.achievements.where('type').equals(type).first();

  if (existing && !existing.unlockedAt) {
    await db.achievements.update(existing.id, {
      unlockedAt: new Date(),
      progress: 100,
    });
  }
}
```

### 更新每日統計

```typescript
async function updateDailyStats(
  date: string,
  data: Partial<DailyStats>
): Promise<void> {
  const existing = await db.dailyStats.get(date);

  if (existing) {
    await db.dailyStats.update(date, data);
  } else {
    await db.dailyStats.add({
      id: date,
      date,
      tasksCompleted: 0,
      linesCompleted: 0,
      isFullHouse: false,
      score: 0,
      maxCombo: 0,
      timeSpent: 0,
      ...data,
    });
  }
}
```

---

## 資料備份與匯出

### 匯出格式

```typescript
interface ExportData {
  version: string;               // 匯出格式版本
  exportedAt: Date;              // 匯出時間
  boards: BingoBoard[];          // 所有 Bingo 板
  achievements: Achievement[];   // 所有成就
  stats: UserStats;              // 統計數據
  dailyStats: DailyStats[];      // 每日統計
  settings: Settings;            // 設定
}
```

### 匯出函數

```typescript
async function exportAllData(): Promise<string> {
  const data: ExportData = {
    version: '1.0.0',
    exportedAt: new Date(),
    boards: await db.boards.toArray(),
    achievements: await db.achievements.toArray(),
    stats: (await db.stats.get('global'))!,
    dailyStats: await db.dailyStats.toArray(),
    settings: (await db.settings.get('user'))!,
  };

  return JSON.stringify(data, null, 2);
}
```

---

## 資料遷移策略

當需要更新資料結構時，使用 Dexie 的版本管理：

```typescript
// 版本 2：新增欄位範例
this.version(2).stores({
  boards: '&id, date, status, createdAt',
  // ... 其他 stores
}).upgrade(tx => {
  return tx.table('boards').toCollection().modify(board => {
    // 為舊資料補上新欄位預設值
    if (board.newField === undefined) {
      board.newField = 'default';
    }
  });
});
```

---

## 下一步

資料模型設計完成，接下來建立：

1. **quickstart.md** - 開發環境設定指南
2. **tasks.md** - 具體開發任務分解（Phase 2）
