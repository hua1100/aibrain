import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { getCurrentUser, onAuthStateChange } from '@/services/authService';

import { initializeUserData, clearLocalData } from '@/services/syncService';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

console.log('AuthContext module evaluated');

export function AuthProvider({ children }: { children: ReactNode }) {
    console.log('AuthProvider rendering');
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 初始化時檢查當前使用者
        getCurrentUser()
            .then(async (user) => {
                setUser(user);

                // 如果有使用者,初始化其數據
                if (user) {
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
                await initializeUserData(user.id);
            } else {
                // 當使用者登出時,清除本地數據
                await clearLocalData();
            }

            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        const { signOut } = await import('@/services/authService');
        await signOut();
        setUser(null);
    };

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        signOut,
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
