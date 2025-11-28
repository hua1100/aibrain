import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { getCurrentUser, onAuthStateChange } from '@/services/authService';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 初始化時檢查當前使用者
        getCurrentUser()
            .then(async (user) => {
                setUser(user);

                // 如果有使用者,初始化其數據
                if (user) {
                    const { initializeUserData } = await import('@/services/syncService');
                    await initializeUserData(user.id);
                }
            })
            .catch(() => setUser(null))
            .finally(() => setLoading(false));

        // 監聽認證狀態變化
        const subscription = onAuthStateChange(async (user) => {
            setUser(user);

            // 當使用者登入時,初始化數據
            if (user) {
                const { initializeUserData } = await import('@/services/syncService');
                await initializeUserData(user.id);
            } else {
                // 當使用者登出時,清除本地數據
                const { clearLocalData } = await import('@/services/syncService');
                await clearLocalData();
            }

            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
