import { useState, useEffect } from 'react';
import { db } from '@/services/database';
import { Button } from '@/components/common';
import type { CategoryConfig } from '@/types';

export function CategoryManager() {
    const [categories, setCategories] = useState<CategoryConfig[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [newCategory, setNewCategory] = useState<Partial<CategoryConfig>>({
        name: '',
        icon: '🏷️',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
    });

    useEffect(() => {
        loadCategories();
    }, []);

    async function loadCategories() {
        const settings = await db.settings.get('user');
        if (settings?.categories) {
            setCategories(settings.categories);
        }
    }

    async function handleSave() {
        if (!newCategory.name) return;

        const id = crypto.randomUUID();
        const category: CategoryConfig = {
            id,
            name: newCategory.name,
            icon: newCategory.icon || '🏷️',
            color: newCategory.color || 'text-gray-600',
            bgColor: newCategory.bgColor || 'bg-gray-100',
            isDefault: false,
        };

        const updatedCategories = [...categories, category];
        await db.settings.update('user', { categories: updatedCategories });
        setCategories(updatedCategories);
        setNewCategory({ name: '', icon: '🏷️', color: 'text-gray-600', bgColor: 'bg-gray-100' });
        setIsEditing(false);
    }

    async function handleDelete(id: string) {
        if (!confirm('確定要刪除此分類嗎？')) return;
        const updatedCategories = categories.filter(c => c.id !== id);
        await db.settings.update('user', { categories: updatedCategories });
        setCategories(updatedCategories);
    }

    return (
        <div className="space-y-4">
            <div className="bg-[var(--nb-white)] nb-border nb-shadow-lg p-5">
                <h3 className="text-lg font-black text-[var(--nb-black)] mb-4 nb-heading uppercase">任務分類管理</h3>

                <div className="grid gap-3">
                    {categories.map((cat) => (
                        <div key={cat.id} className="flex items-center justify-between p-4 bg-[var(--nb-bg)] nb-border">
                            <div className="flex items-center gap-3">
                                <span className={`w-10 h-10 flex items-center justify-center nb-border text-xl ${cat.bgColor}`}>
                                    {cat.icon}
                                </span>
                                <span className="font-bold text-[var(--nb-black)] nb-text">{cat.name}</span>
                            </div>
                            {!cat.isDefault && (
                                <button
                                    onClick={() => handleDelete(cat.id)}
                                    className="px-4 py-2 bg-[var(--nb-coral)] text-white font-bold nb-border hover:bg-[var(--nb-pink)] transition-colors uppercase text-xs"
                                >
                                    刪除
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {isEditing ? (
                <div className="p-5 bg-[var(--nb-white)] nb-border nb-shadow-lg space-y-4">
                    <input
                        type="text"
                        placeholder="分類名稱"
                        className="w-full p-3 nb-border font-bold focus:outline-none focus:ring-4 focus:ring-[var(--nb-yellow)] nb-text"
                        value={newCategory.name}
                        onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                    />
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="圖示 (Emoji)"
                            className="w-24 p-3 nb-border text-center text-xl focus:outline-none focus:ring-4 focus:ring-[var(--nb-yellow)]"
                            value={newCategory.icon}
                            onChange={e => setNewCategory({ ...newCategory, icon: e.target.value })}
                        />
                        {/* 簡單的顏色選擇器可以用預設的幾個選項 */}
                    </div>
                    <div className="flex gap-3">
                        <Button onClick={handleSave}>儲存</Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>取消</Button>
                    </div>
                </div>
            ) : (
                <Button variant="primary" onClick={() => setIsEditing(true)} className="w-full">
                    + 新增分類
                </Button>
            )}
        </div>
    );
}
