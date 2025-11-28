import { supabase } from './supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthState {
    user: User | null;
    session: Session | null;
    loading: boolean;
}

/**
 * 使用 Email 和密碼登入
 */
export async function signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;
    return data;
}

/**
 * 使用 Email 和密碼註冊
 */
export async function signUpWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) throw error;
    return data;
}

/**
 * 使用 Google OAuth 登入
 */
export async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${window.location.origin}/`,
        },
    });

    if (error) throw error;
    return data;
}

/**
 * 登出
 */
export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

/**
 * 取得當前使用者
 */
export async function getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
}

/**
 * 取得當前 Session
 */
export async function getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
}

/**
 * 監聽認證狀態變化
 */
export function onAuthStateChange(callback: (user: User | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
            callback(session?.user ?? null);
        }
    );

    return subscription;
}

/**
 * 重設密碼
 */
export async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
}

/**
 * 更新密碼
 */
export async function updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
        password: newPassword,
    });

    if (error) throw error;
}
