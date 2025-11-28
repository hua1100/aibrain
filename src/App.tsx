import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { initializeDatabase } from '@/services/database';
import { AuthProvider } from '@/contexts/AuthContext';
import { HomePage } from '@/pages/HomePage';
import { CreatePage } from '@/pages/CreatePage';
import { CreateMandalartPage } from '@/pages/CreateMandalartPage';
import { StatsPage } from '@/pages/StatsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { LoginPage } from '@/pages/LoginPage';

export default function App() {
    console.log('App: Rendering');
    useEffect(() => {
        initializeDatabase();
    }, []);

    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/create" element={<CreatePage />} />
                    <Route path="/create-mandalart" element={<CreateMandalartPage />} />
                    <Route path="/stats" element={<StatsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/login" element={<LoginPage />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
