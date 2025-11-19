# 開發環境設定指南：Bingo 待辦事項

**功能分支**：`001-bingo-todo`
**建立日期**：2025-11-19
**狀態**：Phase 1 設計完成

---

## 系統需求

| 項目 | 最低版本 | 建議版本 |
|------|----------|----------|
| Node.js | 18.x | 20.x LTS |
| npm | 9.x | 10.x |
| Git | 2.x | 最新 |

**支援作業系統**：macOS、Windows、Linux

---

## 快速開始

### 1. 複製專案

```bash
git clone <repository-url>
cd aibrain
```

### 2. 安裝依賴

```bash
npm install
```

### 3. 啟動開發伺服器

```bash
npm run dev
```

應用程式將在 `http://localhost:5173` 啟動。

### 4. 開啟瀏覽器

訪問 `http://localhost:5173` 即可看到應用程式。

---

## 專案初始化步驟

如果要從零開始建立專案，請按以下步驟操作：

### Step 1：建立 Vite 專案

```bash
npm create vite@latest bingo-todo -- --template react-ts
cd bingo-todo
```

### Step 2：安裝核心依賴

```bash
# 狀態管理
npm install zustand

# 本地儲存
npm install dexie

# 動畫
npm install framer-motion
npm install lottie-react

# 樣式
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 音效
npm install howler
npm install -D @types/howler

# 圖片生成
npm install html2canvas

# 路由
npm install react-router-dom

# 工具
npm install uuid
npm install -D @types/uuid
npm install date-fns
```

### Step 3：安裝 PWA 支援

```bash
npm install -D vite-plugin-pwa
```

### Step 4：安裝測試框架

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

### Step 5：安裝開發工具

```bash
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install -D prettier eslint-config-prettier
```

---

## 設定檔配置

### vite.config.ts

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Bingo 待辦事項',
        short_name: 'BingoTodo',
        description: '把待辦事項變成每日 Bingo 挑戰',
        theme_color: '#4F46E5',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
```

### tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 分類顏色
        work: {
          DEFAULT: '#3B82F6',
          light: '#DBEAFE',
        },
        health: {
          DEFAULT: '#10B981',
          light: '#D1FAE5',
        },
        personal: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
        },
        learning: {
          DEFAULT: '#8B5CF6',
          light: '#EDE9FE',
        },
      },
      animation: {
        'bounce-once': 'bounce 0.5s ease-in-out',
        'pulse-fast': 'pulse 0.5s ease-in-out',
      },
    },
  },
  plugins: [],
};
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.ts',
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
```

### tests/setup.ts

```typescript
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock IndexedDB
import 'fake-indexeddb/auto';

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
```

---

## NPM 腳本

在 `package.json` 中新增以下腳本：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,json}\"",
    "type-check": "tsc --noEmit"
  }
}
```

---

## 目錄結構建立

執行以下命令建立專案目錄結構：

```bash
# 建立主要目錄
mkdir -p src/{components,hooks,stores,services,types,constants,utils,assets,pages}

# 建立元件子目錄
mkdir -p src/components/{BingoBoard,TaskInput,Celebration,Stats,Achievement,common}

# 建立資源子目錄
mkdir -p src/assets/{sounds,animations,icons}

# 建立測試目錄
mkdir -p tests/{unit,integration}

# 建立公開資源目錄
mkdir -p public/icons
```

---

## 開發工作流程

### 日常開發

```bash
# 1. 啟動開發伺服器
npm run dev

# 2. 開啟另一個終端執行測試（監聽模式）
npm run test

# 3. 提交前檢查
npm run lint
npm run type-check
npm run format
```

### 建置與預覽

```bash
# 建置生產版本
npm run build

# 本地預覽生產版本
npm run preview
```

### 測試

```bash
# 執行所有測試
npm run test

# 執行測試並顯示 UI
npm run test:ui

# 執行測試並產生覆蓋率報告
npm run test:coverage
```

---

## 瀏覽器開發工具

### React DevTools

安裝 [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi) 擴充套件，用於除錯元件狀態。

### IndexedDB 檢視

使用瀏覽器開發者工具：
1. 開啟 DevTools (F12)
2. 前往 Application > Storage > IndexedDB
3. 找到 `BingoTodoDatabase` 查看資料

### PWA 偵錯

使用瀏覽器開發者工具：
1. 開啟 DevTools (F12)
2. 前往 Application > Service Workers
3. 查看 Service Worker 狀態與快取

---

## 環境變數

建立 `.env` 檔案（如需要）：

```bash
# .env.local（不要提交到版本控制）
VITE_APP_VERSION=1.0.0
VITE_APP_BUILD_DATE=2025-11-19
```

在程式碼中使用：

```typescript
const version = import.meta.env.VITE_APP_VERSION;
```

---

## 常見問題

### Q1：IndexedDB 資料遺失

**原因**：清除瀏覽器資料或使用無痕模式

**解決方案**：
- 提醒用戶定期匯出資料
- 使用 `beforeunload` 事件提醒未儲存的變更

### Q2：動畫卡頓

**原因**：過多的 re-render 或複雜的 DOM 操作

**解決方案**：
- 使用 `React.memo` 優化元件
- 確保動畫使用 `transform` 和 `opacity`
- 使用 Chrome DevTools Performance 分析

### Q3：PWA 無法安裝

**原因**：Manifest 設定錯誤或 Service Worker 未註冊

**解決方案**：
- 檢查 `manifest.json` 設定
- 確認 HTTPS（本地開發除外）
- 使用 Lighthouse 檢查 PWA 要求

### Q4：音效無法播放（iOS）

**原因**：iOS 需要用戶互動才能播放音效

**解決方案**：
- 在第一次用戶點擊時初始化音效
- 使用 Howler.js 的 `html5` 選項

---

## 程式碼風格指南

### 命名規範

| 項目 | 格式 | 範例 |
|------|------|------|
| 元件 | PascalCase | `BingoBoard.tsx` |
| Hook | camelCase + use 前綴 | `useBingoBoard.ts` |
| 工具函數 | camelCase | `dateUtils.ts` |
| 常數 | SCREAMING_SNAKE_CASE | `MAX_COMBO` |
| 型別 | PascalCase | `BingoBoard` |
| CSS 類別 | kebab-case | `bingo-cell` |

### 檔案結構

```typescript
// 1. 匯入
import React from 'react';
import { motion } from 'framer-motion';
import { useBingoBoard } from '@/hooks/useBingoBoard';

// 2. 型別定義
interface Props {
  // ...
}

// 3. 常數
const ANIMATION_DURATION = 300;

// 4. 元件
export function BingoBoard({ ... }: Props) {
  // hooks
  // state
  // handlers
  // effects
  // render
}
```

---

## 下一步

開發環境設定完成後，可開始進行：

1. **建立基礎元件**：BingoBoard、BingoCell、TaskInput
2. **實作核心邏輯**：連線檢測、連擊系統
3. **設定 IndexedDB**：資料庫初始化、CRUD 操作
4. **加入動畫效果**：完成動畫、連線動畫

參考 `tasks.md`（Phase 2）獲取詳細的開發任務清單。
