import { Link } from 'react-router-dom';
import { Button } from '@/components/common';
import { CategoryManager } from '@/components/Settings/CategoryManager';

export function SettingsPage() {
    return (
        <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(135deg, var(--nb-lime) 0%, var(--nb-yellow) 100%)' }}>
            <div className="max-w-md mx-auto space-y-6">
                <div className="text-center">
                    <h1 className="text-4xl font-black text-[var(--nb-black)] mb-2 nb-heading">
                        設定
                    </h1>
                    <p className="text-base font-bold text-[var(--nb-black)] nb-text">
                        自訂你的體驗
                    </p>
                </div>

                <CategoryManager />

                <Link to="/">
                    <Button variant="outline" className="w-full">
                        返回首頁
                    </Button>
                </Link>
            </div>
        </div>
    );
}
