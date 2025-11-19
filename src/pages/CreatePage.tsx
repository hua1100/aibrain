import { useNavigate } from 'react-router-dom';
import { TaskInput } from '@/components/TaskInput';
import { useBoardStore } from '@/stores/boardStore';
import type { TaskInput as TaskInputType } from '@/types';

export function CreatePage() {
  const navigate = useNavigate();
  const { createBoard, isLoading } = useBoardStore();

  const handleSubmit = async (tasks: TaskInputType[]) => {
    try {
      await createBoard(tasks);
      navigate('/');
    } catch (error) {
      console.error('Failed to create board:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* 標題 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            建立今日 Bingo 板
          </h1>
          <p className="text-gray-600">
            輸入你今天要完成的 8 個任務
          </p>
        </div>

        {/* 任務輸入表單 */}
        <TaskInput onSubmit={handleSubmit} isLoading={isLoading} />

        {/* 提示 */}
        <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
          <h3 className="font-medium text-indigo-900 mb-2">小提示</h3>
          <ul className="text-sm text-indigo-700 space-y-1">
            <li>• 中央格為免費格，自動完成</li>
            <li>• 完成一條連線（橫/直/斜）獲得獎勵</li>
            <li>• 連續完成任務可獲得連擊加成</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
