/**
 * Fisher-Yates 洗牌演算法
 * 將陣列隨機排序
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 隨機配置任務位置（保持中心為自由格）
 * @param tasks 8 個任務的陣列
 * @returns 隨機排列後的 9 格位置（索引 4 為自由格）
 */
export function shuffleTaskPositions<T>(tasks: T[]): (T | null)[] {
  if (tasks.length !== 8) {
    throw new Error('必須提供 8 個任務');
  }

  // 洗牌 8 個任務
  const shuffled = shuffle(tasks);

  // 建立 9 格陣列，中心（索引 4）為 null（自由格）
  const result: (T | null)[] = [];
  let taskIndex = 0;

  for (let i = 0; i < 9; i++) {
    if (i === 4) {
      result.push(null); // 中心自由格
    } else {
      result.push(shuffled[taskIndex++]);
    }
  }

  return result;
}

/**
 * 產生隨機種子（用於重現相同配置）
 */
export function generateSeed(): string {
  return Math.random().toString(36).substring(2, 10);
}

/**
 * 使用種子的確定性洗牌
 */
export function seededShuffle<T>(array: T[], seed: string): T[] {
  const result = [...array];
  let hash = 0;

  // 將種子轉換為數字
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }

  // 使用線性同餘產生器
  const random = () => {
    hash = (hash * 1103515245 + 12345) | 0;
    return (hash >>> 16) / 65536;
  };

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}
