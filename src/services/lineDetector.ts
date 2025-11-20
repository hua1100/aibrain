import { LINES } from '@/constants';

/**
 * 檢測已完成的連線
 * @param completionStatus 9 個格子的完成狀態陣列
 * @returns 已完成連線的陣列
 */
export function detectCompletedLines(completionStatus: boolean[]): number[][] {
  return LINES.filter((line) => line.every((index) => completionStatus[index]));
}

/**
 * 檢查是否為新完成的連線
 * @param previousLines 之前完成的連線
 * @param currentLines 目前完成的連線
 * @returns 新完成的連線陣列
 */
export function getNewlyCompletedLines(
  previousLines: number[][],
  currentLines: number[][]
): number[][] {
  return currentLines.filter(
    (currentLine) =>
      !previousLines.some((prevLine) => arraysEqual(prevLine, currentLine))
  );
}

/**
 * 檢查兩個陣列是否相等
 */
function arraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((val, index) => val === b[index]);
}

/**
 * 檢查是否全清（所有格子都完成）
 */
export function isFullHouse(completionStatus: boolean[]): boolean {
  return completionStatus.every((status) => status);
}

/**
 * 取得連線類型描述
 * @param line 連線的位置陣列
 * @returns 連線類型描述
 */
export function getLineType(line: number[]): string {
  const [a, b, c] = line;

  // 橫向連線
  if (a === 0 && b === 1 && c === 2) return '上橫';
  if (a === 3 && b === 4 && c === 5) return '中橫';
  if (a === 6 && b === 7 && c === 8) return '下橫';

  // 直向連線
  if (a === 0 && b === 3 && c === 6) return '左直';
  if (a === 1 && b === 4 && c === 7) return '中直';
  if (a === 2 && b === 5 && c === 8) return '右直';

  // 對角連線
  if (a === 0 && b === 4 && c === 8) return '左上對角';
  if (a === 2 && b === 4 && c === 6) return '右上對角';

  return '未知';
}

/**
 * 計算連線得分
 * @param lineCount 完成的連線數
 * @returns 得分
 */
export function calculateLineScore(lineCount: number): number {
  // 每條連線基礎分 50 分
  const baseScore = lineCount * 50;

  // 連線加成：3 條以上有額外獎勵
  const bonus = lineCount >= 3 ? (lineCount - 2) * 25 : 0;

  return baseScore + bonus;
}
