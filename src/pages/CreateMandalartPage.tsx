import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common';
import { useBingoBoard } from '@/hooks/useBingoBoard';

export function CreateMandalartPage() {
    const navigate = useNavigate();
    const { createMandalart, isLoading } = useBingoBoard();

    const [mainGoal, setMainGoal] = useState('');
    const [subGoals, setSubGoals] = useState<string[]>(Array(8).fill(''));

    const handleSubGoalChange = (index: number, value: string) => {
        const newSubGoals = [...subGoals];
        newSubGoals[index] = value;
        setSubGoals(newSubGoals);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mainGoal.trim() || subGoals.some(goal => !goal.trim())) return;

        try {
            // 過濾掉空的子目標，或者保留它們作為"未設定"
            // 這裡我們直接傳遞陣列，createMandalart 會處理
            // 這裡我們直接傳遞陣列，createMandalart 會處理
            const board = await createMandalart(mainGoal, subGoals);
            if (board) {
                navigate(`/board/${board.id}`);
            } else {
                navigate('/');
            }
        } catch (error) {
            console.error('Failed to create mandalart:', error);
        }
    };

    const isFormValid = mainGoal.trim() !== '' && subGoals.every(goal => goal.trim() !== '');

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <div className="mb-4 flex justify-start">
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
                        >
                            <span>←</span>
                            <span>返回首頁</span>
                        </button>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        建立曼陀羅計畫
                    </h1>
                    <p className="text-gray-600">
                        設定一個核心目標，並規劃 8 個子目標來達成它
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-8">
                    {/* 核心目標 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            核心目標 (Core Goal)
                        </label>
                        <input
                            type="text"
                            value={mainGoal}
                            onChange={(e) => setMainGoal(e.target.value)}
                            placeholder="例如：2024年成為全端工程師"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                            required
                        />
                    </div>

                    {/* 子目標 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-4">
                            子目標 (Sub Goals)
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {subGoals.map((goal, index) => (
                                <div key={index}>
                                    <label className="block text-xs text-gray-500 mb-1">
                                        子目標 {index + 1}
                                    </label>
                                    <input
                                        type="text"
                                        value={goal}
                                        onChange={(e) => handleSubGoalChange(index, e.target.value)}
                                        placeholder={`子目標 ${index + 1}`}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 提交按鈕 */}
                    <div className="pt-4">
                        <Button
                            type="submit"
                            disabled={!isFormValid || isLoading}
                            className="w-full"
                            size="lg"
                        >
                            {isLoading ? '建立中...' : '建立計畫'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
