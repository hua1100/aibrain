import { useEffect, useRef } from 'react';
import { useBoardStore } from '@/stores/boardStore';
import { getNewlyCompletedLines } from '@/services/lineDetector';

interface UseLineDetectionReturn {
  completedLines: number[][];
  newLines: number[][];
  lineCount: number;
  onLineComplete?: (line: number[]) => void;
}

export function useLineDetection(
  onLineComplete?: (line: number[]) => void
): UseLineDetectionReturn {
  const { currentBoard } = useBoardStore();
  const previousLinesRef = useRef<number[][]>([]);

  const completedLines = currentBoard?.completedLines || [];
  const lineCount = completedLines.length;

  useEffect(() => {
    if (!currentBoard) return;

    // 檢查是否有新完成的連線
    const newLines = getNewlyCompletedLines(previousLinesRef.current, completedLines);

    if (newLines.length > 0 && onLineComplete) {
      // 逐條觸發連線完成回調
      newLines.forEach((line) => {
        onLineComplete(line);
      });
    }

    // 更新 ref
    previousLinesRef.current = completedLines;
  }, [completedLines, currentBoard, onLineComplete]);

  const newLines = getNewlyCompletedLines(previousLinesRef.current, completedLines);

  return {
    completedLines,
    newLines,
    lineCount,
    onLineComplete,
  };
}
