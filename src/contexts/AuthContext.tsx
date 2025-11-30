import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from 'react';
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
    const initializedUserRef = useRef<string | null>(null);

    useEffect(() => {
        // 初始化時檢查當前使用者 (只設定狀態，不執行初始化，交給 onAuthStateChange)
        getCurrentUser()
            .then((user) => {
                setUser(user);
            })
            .catch(() => setUser(null))
            .finally(() => setLoading(false));

        // 監聽認證狀態變化
        const subscription = onAuthStateChange(async (user, event) => {
            setUser(user);

            // 只在登入或初始 Session 時初始化數據，且避免重複初始化
            if (user && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
                if (initializedUserRef.current !== user.id) {
                    initializedUserRef.current = user.id;
                    await initializeUserData(user.id);
                }
            } else if (!user && event === 'SIGNED_OUT') {
                // 當使用者登出時,清除本地數據
                initializedUserRef.current = null;
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
