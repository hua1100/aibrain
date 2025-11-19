import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { initializeDatabase } from '@/services/database';
import { HomePage, CreatePage } from '@/pages';

// 暫時的頁面佔位符
function StatsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">統計</h1>
        <p className="text-gray-600">查看你的完成記錄</p>
      </div>
    </div>
  );
}

function AchievementsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">成就</h1>
        <p className="text-gray-600">解鎖的徽章</p>
      </div>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">設定</h1>
        <p className="text-gray-600">自訂你的體驗</p>
      </div>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    initializeDatabase();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/achievements" element={<AchievementsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
