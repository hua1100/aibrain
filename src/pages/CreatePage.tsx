import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TaskInput } from '@/components/TaskInput';
import { useBoardStore } from '@/stores/boardStore';
import type { TaskInput as TaskInputType } from '@/types';
import { shuffleTaskPositions } from '@/utils/shuffleUtils';

export function CreatePage() {
  const navigate = useNavigate();
  const { createBoard, isLoading } = useBoardStore();
  const [enableShuffle, setEnableShuffle] = useState(false);

  const handleSubmit = async (tasks: TaskInputType[]) => {
    try {
      // 如果啟用隨機配置，洗牌任務順序
      const orderedTasks = enableShuffle
        ? shuffleTaskPositions(tasks).filter((t): t is TaskInputType => t !== null)
        : tasks;

      await createBoard(orderedTasks);
      navigate('/');
    } catch (error) {
      console.error('Failed to create board:', error);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(135deg, var(--nb-cyan) 0%, var(--nb-lime) 100%)' }}>
      <div className="max-w-md mx-auto">
        {/* 標題 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-[var(--nb-black)] mb-3 nb-heading">
            建立今日 BINGO 板
          </h1>
          <p className="text-base font-bold text-[var(--nb-black)] nb-text">
            輸入你今天要完成的 9 個任務
          </p>
        </div>

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
        <TaskInput onSubmit={handleSubmit} isLoading={isLoading} />

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
