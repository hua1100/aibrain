import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmail, signUpWithEmail } from '@/services/authService';
import { Button } from '@/components/common';

export function LoginPage() {
    const navigate = useNavigate();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isSignUp) {
                await signUpWithEmail(email, password);
                alert('註冊成功!請檢查您的信箱以驗證帳號。');
            } else {
                await signInWithEmail(email, password);
                navigate('/');
            }
        } catch (err: any) {
            setError(err.message || '登入失敗,請重試');
        } finally {
            setLoading(false);
        }
    };

    const handleGuestMode = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen py-8 px-4 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--nb-purple) 0%, var(--nb-pink) 100%)' }}>
            <div className="w-full max-w-md">
                {/* 標題 */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-[var(--nb-black)] mb-3 nb-heading">
                        {isSignUp ? '註冊帳號' : '登入'}
                    </h1>
                    <p className="text-base font-bold text-[var(--nb-black)] nb-text">
                        {isSignUp ? '建立帳號以同步數據' : '登入以同步您的數據'}
                    </p>
                </div>

                {/* 登入表單 */}
                <div className="bg-[var(--nb-white)] nb-border nb-shadow-lg p-6 space-y-4">
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-[var(--nb-black)] mb-2 nb-text">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 nb-border font-bold focus:outline-none focus:ring-4 focus:ring-[var(--nb-yellow)] nb-text"
                                placeholder="your@email.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[var(--nb-black)] mb-2 nb-text">
                                密碼
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 nb-border font-bold focus:outline-none focus:ring-4 focus:ring-[var(--nb-yellow)] nb-text"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-[var(--nb-coral)] nb-border text-white font-bold text-sm">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            isLoading={loading}
                            className="w-full"
                        >
                            {isSignUp ? '註冊' : '登入'}
                        </Button>
                    </form>

                    {/* 切換註冊/登入 */}
                    <div className="text-center">
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-sm font-bold text-[var(--nb-black)] hover:underline nb-text"
                        >
                            {isSignUp ? '已有帳號?登入' : '沒有帳號?註冊'}
                        </button>
                    </div>
                </div>

                {/* 訪客模式 */}
                <div className="mt-6 text-center">
                    <button
                        onClick={handleGuestMode}
                        className="text-sm font-bold text-[var(--nb-black)] hover:underline nb-text"
                    >
                        繼續使用訪客模式 (僅本地儲存)
                    </button>
                </div>
            </div>
        </div>
    );
}
