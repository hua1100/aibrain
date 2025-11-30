import { useState, useEffect } from 'react';
import { getSettings } from '@/services/settingsService';
import type { Settings, CategoryConfig } from '@/types';
import { CATEGORIES } from '@/constants';

export function useSettings() {
    const [settings, setSettings] = useState<Settings | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function loadSettings() {
            try {
                setIsLoading(true);
                const data = await getSettings();
                setSettings(data);
            } catch (err) {
                console.error('Failed to load settings:', err);
                setError(err instanceof Error ? err : new Error('Unknown error'));
            } finally {
                setIsLoading(false);
            }
        }

        loadSettings();
    }, []);

    // 如果沒有設定或設定中沒有分類，使用預設分類
    const categories = settings?.categories && settings.categories.length > 0
        ? settings.categories.reduce((acc, cat) => {
            acc[cat.id] = cat;
            return acc;
        }, {} as Record<string, CategoryConfig>)
        : CATEGORIES;

    const categoryOptions = settings?.categories && settings.categories.length > 0
        ? settings.categories
        : Object.values(CATEGORIES).filter(c => c.id !== 'free');

    return {
        settings,
        categories, // Map: id -> config
        categoryOptions, // Array of configs
        isLoading,
        error,
        refreshSettings: async () => {
            const data = await getSettings();
            setSettings(data);
        }
    };
}
