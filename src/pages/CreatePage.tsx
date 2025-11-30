import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TaskInput } from '@/components/TaskInput';
import { useBoardStore } from '@/stores/boardStore';
import type { TaskInput as TaskInputType } from '@/types';
import { shuffleTaskPositions, shuffle } from '@/utils/shuffleUtils';

import { useSearchParams } from 'react-router-dom';
import type { BoardType } from '@/types';

export function CreatePage() {
  const navigate = useNavigate();
  const { createBoard, isLoading, carryOverTasks } = useBoardStore();
  const [enableShuffle, setEnableShuffle] = useState(false);
  const [searchParams] = useSearchParams();
  const type = (searchParams.get('type') as BoardType) || 'daily';
  // const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // 移除日期選擇

  const handleSubmit = async (tasks: TaskInputType[]) => {
    try {
      // 如果啟用隨機配置，洗牌任務順序
      let orderedTasks = tasks;
      if (enableShuffle) {
        if (tasks.length === 9) {
          // 9 個任務直接洗牌
          orderedTasks = shuffle(tasks);
        } else if (tasks.length === 8) {
          // 8 個任務使用 shuffleTaskPositions (含中間自由格)
          orderedTasks = shuffleTaskPositions(tasks).filter((t): t is TaskInputType => t !== null);
        }
      }

      const board = await createBoard(orderedTasks, type); // 不再傳入日期
      navigate(`/board/${board.id}`);
    } catch (error) {
      console.error('Failed to create board:', error);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(135deg, var(--nb-cyan) 0%, var(--nb-lime) 100%)' }}>
      <div className="max-w-md mx-auto">
        {/* 頂部導航 */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 font-bold text-[var(--nb-black)] hover:opacity-70 transition-opacity"
          >
            <span>←</span>
            <span>返回首頁</span>
          </button>
        </div>

        {/* 標題 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-[var(--nb-black)] mb-3 nb-heading">
            {type === 'mandalart' ? '建立曼陀羅計畫' : '建立新的一局'}
          </h1>
          <p className="text-base font-bold text-[var(--nb-black)] nb-text">
            {type === 'mandalart' ? '設定核心目標與子目標' : '輸入你要挑戰的 9 個任務'}
          </p>
        </div>

        {/* 日期選擇已移除 */}

        {/* 隨機配置選項 - Neo Brutalism Style */}
        <div className="mb-6 p-5 bg-[var(--nb-yellow)] nb-border nb-shadow-lg">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={enableShuffle}
              onChange={(e) => setEnableShuffle(e.target.checked)}
              className="w-6 h-6 nb-border accent-[var(--nb-black)]"
            />
            <div>
              <span className="font-black text-[var(--nb-black)] nb-text">隨機配置模式</span>
              <p className="text-sm font-bold text-[var(--nb-black)] mt-1">系統自動隨機排列任務位置</p>
            </div>
          </label>
        </div>

        {/* 任務輸入表單 */}
        <TaskInput
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitText={type === 'mandalart' ? '建立曼陀羅計畫' : '開始挑戰'}
          initialTasks={type !== 'mandalart' ? carryOverTasks : undefined}
        />

        {/* 提示 - Neo Brutalism Style */}
        <div className="mt-6 p-5 bg-[var(--nb-coral)] nb-border nb-shadow-lg">
          <h3 className="font-black text-white mb-3 nb-heading text-lg">小提示</h3>
          <ul className="text-sm font-bold text-white space-y-2 nb-text">
            <li>• 完成一條連線（橫/直/斜）獲得獎勵</li>
            <li>• 連續完成任務可獲得連擊加成</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
