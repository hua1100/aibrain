import { BingoCell } from './BingoCell';
import { LineOverlay } from './LineOverlay';
import type { Task, CategoryConfig } from '@/types';

interface BingoBoardProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onEditTask?: (task: Task, newName: string) => void;
  completedLines?: number[][];
  isMandalartRoot?: boolean;
  isMandalartChild?: boolean;
  categories?: Record<string, CategoryConfig>;
}

export function BingoBoard({
  tasks,
  onTaskClick,
  onEditTask,
  completedLines = [],
  isMandalartRoot = false,
  isMandalartChild = false,
  categories
}: BingoBoardProps) {
  // 按位置排序任務
  const sortedTasks = [...tasks].sort((a, b) => a.position - b.position);

  // 檢查任務是否在已完成連線上
  const isTaskInCompletedLine = (position: number): boolean => {
    return completedLines.some(line => line.includes(position));
  };

  // 檢查是否鎖定
  const isLocked = (task: Task) => {
    // 只有中間格(位置4)需要特殊處理
    if (task.position !== 4) return false;

    // Mandalart (無論是核心板還是子板) 的中間格
    // 只有當周圍 8 格都完成時才解鎖
    if (isMandalartRoot || isMandalartChild) {
      const surroundingTasks = sortedTasks.filter(t => t.position !== 4);
      return !surroundingTasks.every(t => t.isCompleted);
    }

    return false;
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="bingo-grid relative">
        {sortedTasks.map((task) => (
          <BingoCell
            key={task.id}
            task={task}
            onClick={onTaskClick}
            onEdit={onEditTask}
            isHighlighted={isTaskInCompletedLine(task.position)}
            isLocked={isLocked(task)}
            categories={categories}
          />
        ))}

        {/* 連線疊加層 */}
        <LineOverlay completedLines={completedLines} />
      </div>
    </div>
  );
}
