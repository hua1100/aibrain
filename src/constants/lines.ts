// 九宮格連線定義
// 位置索引：
// 0 | 1 | 2
// ---------
// 3 | 4 | 5
// ---------
// 6 | 7 | 8

export const LINES: number[][] = [
  [0, 1, 2], // 上橫
  [3, 4, 5], // 中橫
  [6, 7, 8], // 下橫
  [0, 3, 6], // 左直
  [1, 4, 7], // 中直
  [2, 5, 8], // 右直
  [0, 4, 8], // 左上到右下對角
  [2, 4, 6], // 右上到左下對角
];

export const FREE_SPACE_POSITION = 4;

export const TOTAL_CELLS = 9;

export const TOTAL_TASKS = 8; // 不含免費格
