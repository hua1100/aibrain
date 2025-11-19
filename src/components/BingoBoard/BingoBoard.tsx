import { BingoCell } from './BingoCell';
import type { Task } from '@/types';

interface BingoBoardProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  completedLines?: number[][];
}

export function BingoBoard({ tasks, onTaskClick, completedLines = [] }: BingoBoardProps) {
  // 按位置排序任務
  const sortedTasks = [...tasks].sort((a, b) => a.position - b.position);

  // 檢查任務是否在已完成連線上
  const isTaskInCompletedLine = (position: number): boolean => {
    return completedLines.some(line => line.includes(position));
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="bingo-grid">
        {sortedTasks.map((task) => (
          <BingoCell
            key={task.id}
            task={task}
            onClick={onTaskClick}
            isHighlighted={isTaskInCompletedLine(task.position)}
          />
        ))}
      </div>
    </div>
  );
}
