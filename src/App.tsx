import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { HomePage } from '@/pages/HomePage';
import { CreatePage } from '@/pages/CreatePage';
import { CreateMandalartPage } from '@/pages/CreateMandalartPage';
import { StatsPage } from '@/pages/StatsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { LoginPage } from '@/pages/LoginPage';

export default function App() {
    console.log('App: Rendering');

    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                    <Route path="/create" element={<ProtectedRoute><CreatePage /></ProtectedRoute>} />
                    <Route path="/create-mandalart" element={<ProtectedRoute><CreateMandalartPage /></ProtectedRoute>} />
                    <Route path="/stats" element={<ProtectedRoute><StatsPage /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                    <Route path="/board/:boardId" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
