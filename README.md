# Bingo Todo - 賓果待辦事項管理系統

一個結合賓果遊戲機制與曼陀羅思考法的創新待辦事項管理應用程式，讓目標管理變得更有趣且更有成就感。

## ✨ 核心特色

### 🎯 賓果遊戲化任務管理
- **每日/每週賓果板**：將待辦事項轉化為 3×3 賓果遊戲
- **連線獎勵系統**：完成橫向、縱向或對角線連線獲得額外分數
- **連擊加成機制**：連續完成任務可獲得分數倍增獎勵
- **即時慶祝動畫**：完成連線時觸發視覺與音效回饋

### 🌸 曼陀羅目標規劃
- **9×9 曼陀羅矩陣**：採用日本曼陀羅思考法進行目標分解
- **階層式目標管理**：中心目標自動展開為 8 個子目標板
- **雙向導航系統**：在主板與子板之間無縫切換
- **核心目標鎖定**：確保目標一致性與專注度

### 📊 數據統計與分析
- **完成度熱力圖**：視覺化呈現每日任務完成情況
- **成就系統**：追蹤里程碑與個人紀錄
- **分類統計**：按類別分析任務完成率與時間分配
- **歷史趨勢**：長期追蹤個人生產力變化

### 🎨 現代化 UI/UX
- **Neo Brutalism 設計風格**：大膽的色彩、粗黑邊框、硬陰影
- **流暢動畫效果**：使用 Framer Motion 打造絲滑的互動體驗
- **響應式設計**：完美適配桌面與行動裝置
- **自訂分類系統**：可自由新增與管理任務分類

## 🛠 技術架構

### 前端框架
- **React 19** - 最新版本的 React 框架
- **TypeScript** - 型別安全的開發體驗
- **Vite** - 極速的建置工具與開發伺服器

### UI 與動畫
- **Tailwind CSS 4** - 實用優先的 CSS 框架
- **Framer Motion** - 強大的動畫函式庫
- **Lottie React** - 高品質向量動畫

### 狀態管理與資料持久化
- **Zustand** - 輕量級狀態管理
- **Dexie.js** - IndexedDB 封裝，提供本地資料儲存
- **React Router DOM** - 客戶端路由管理

### 開發工具
- **ESLint** - 程式碼品質檢查
- **Prettier** - 程式碼格式化
- **Vitest** - 單元測試框架
- **TypeScript ESLint** - TypeScript 專用的 Lint 規則

### 其他功能
- **PWA 支援** - 可安裝為桌面應用程式
- **音效系統** - 使用 Howler.js 提供音效回饋
- **截圖功能** - 使用 html2canvas 匯出賓果板

## 📦 安裝與執行

### 環境需求
- Node.js 18+ 
- npm 或 pnpm

### 安裝步驟

```bash
# 複製專案
git clone <repository-url>
cd aibrain

# 安裝依賴套件
npm install

# 啟動開發伺服器
npm run dev
```

### 可用指令

```bash
# 開發模式（熱重載）
npm run dev

# 建置生產版本
npm run build

# 預覽生產版本
npm run preview

# 執行測試
npm run test

# 執行測試（UI 模式）
npm run test:ui

# 測試覆蓋率報告
npm run test:coverage

# 程式碼檢查
npm run lint

# 程式碼格式化
npm run format

# 型別檢查
npm run type-check
```

## 📁 專案結構

```
aibrain/
├── src/
│   ├── components/          # React 元件
│   │   ├── BingoBoard/     # 賓果板相關元件
│   │   ├── Mandalart/      # 曼陀羅相關元件
│   │   ├── Stats/          # 統計圖表元件
│   │   ├── Settings/       # 設定頁面元件
│   │   ├── TaskInput/      # 任務輸入元件
│   │   ├── Celebration/    # 慶祝動畫元件
│   │   └── common/         # 共用元件
│   ├── pages/              # 頁面元件
│   │   ├── HomePage.tsx
│   │   ├── CreatePage.tsx
│   │   ├── CreateMandalartPage.tsx
│   │   ├── StatsPage.tsx
│   │   └── SettingsPage.tsx
│   ├── services/           # 業務邏輯服務
│   │   ├── database.ts     # IndexedDB 資料庫
│   │   ├── boardService.ts # 賓果板服務
│   │   └── ...
│   ├── stores/             # Zustand 狀態管理
│   ├── types/              # TypeScript 型別定義
│   ├── hooks/              # 自訂 React Hooks
│   ├── utils/              # 工具函式
│   ├── constants/          # 常數定義
│   ├── assets/             # 靜態資源
│   ├── App.tsx             # 應用程式主元件
│   ├── main.tsx            # 應用程式入口
│   └── index.css           # 全域樣式
├── public/                 # 公開靜態資源
├── tests/                  # 測試檔案
├── dist/                   # 建置輸出目錄
├── index.html              # HTML 模板
├── vite.config.ts          # Vite 設定
├── tailwind.config.js      # Tailwind CSS 設定
├── tsconfig.json           # TypeScript 設定
├── netlify.toml            # Netlify 部署設定
└── package.json            # 專案依賴與腳本
```

## 🎮 使用指南

### 建立每日賓果板
1. 點擊「建立賓果板」
2. 選擇「每日」或「每週」模式
3. 輸入 9 個任務並指定分類
4. 開始完成任務並享受連線的樂趣！

### 使用曼陀羅規劃
1. 點擊「建立曼陀羅」
2. 在中心格輸入核心目標
3. 在周圍 8 格輸入子目標
4. 系統自動為每個子目標建立專屬的 3×3 賓果板
5. 點擊任意子目標進入對應的賓果板

### 自訂分類
1. 進入「設定」頁面
2. 新增、編輯或刪除任務分類
3. 為每個分類設定專屬顏色與圖示

## 🚀 部署

本專案已設定好 Netlify 與 Vercel 的部署設定檔：

### Netlify 部署
```bash
# 使用 Netlify CLI
npm install -g netlify-cli
netlify deploy --prod
```

### Vercel 部署
```bash
# 使用 Vercel CLI
npm install -g vercel
vercel --prod
```

## 🧪 測試

專案使用 Vitest 作為測試框架，並整合了 Testing Library：

```bash
# 執行所有測試
npm run test

# 監聽模式（開發時使用）
npm run test -- --watch

# 產生覆蓋率報告
npm run test:coverage

# UI 模式（視覺化測試介面）
npm run test:ui
```

## 📝 開發規範

### 程式碼風格
- 使用 ESLint 進行程式碼品質檢查
- 使用 Prettier 統一程式碼格式
- 遵循 TypeScript 嚴格模式

### Git 提交規範
建議使用語義化提交訊息：
- `feat:` 新功能
- `fix:` 錯誤修復
- `docs:` 文件更新
- `style:` 程式碼格式調整
- `refactor:` 重構
- `test:` 測試相關
- `chore:` 建置或工具相關

## 🤝 貢獻指南

歡迎提交 Issue 或 Pull Request！

1. Fork 本專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'feat: 新增某個很棒的功能'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📄 授權

本專案採用 MIT 授權條款。

## 🙏 致謝

- 曼陀羅思考法靈感來自日本教育家今泉浩晃
- UI 設計受到 Neo Brutalism 設計風格啟發
- 感謝所有開源專案的貢獻者

---

**享受遊戲化的生產力提升之旅！** 🎯✨
