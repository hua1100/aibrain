import { BingoCell } from './BingoCell';
import { LineOverlay } from './LineOverlay';
import type { Task } from '@/types';

interface BingoBoardProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onEditTask?: (task: Task, newName: string) => void;
  completedLines?: number[][];
  isMandalartRoot?: boolean;
  isMandalartChild?: boolean;
}

export function BingoBoard({
  tasks,
  onTaskClick,
  onEditTask,
  completedLines = [],
  isMandalartRoot = false,
  isMandalartChild = false
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

    // 情況 1: Mandalart 子板的中間格 (子目標)
    // 應該始終鎖定，因為它是由周圍任務自動完成的
    if (isMandalartChild) return true;

    // 情況 2: Mandalart 核心板的中間格 (核心目標)
    // 只有當周圍 8 格都完成時才解鎖
    if (isMandalartRoot) {
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
          />
        ))}

        {/* 連線疊加層 */}
        <LineOverlay completedLines={completedLines} />
      </div>
    </div>
  );
}
