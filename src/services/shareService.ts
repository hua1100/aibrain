import type { BingoBoard } from '@/types';

/**
 * 分享選項
 */
interface ShareOptions {
  title?: string;
  text?: string;
  includeWatermark?: boolean;
}

/**
 * 產生分享用的 Canvas 圖片
 */
export async function generateShareImage(
  board: BingoBoard,
  options: ShareOptions = {}
): Promise<Blob> {
  const { includeWatermark = true } = options;

  // 建立 Canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const size = 600;
  const padding = 40;
  const cellSize = (size - padding * 2) / 3;

  canvas.width = size;
  canvas.height = size + (includeWatermark ? 60 : 0);

  // 背景
  ctx.fillStyle = '#f9fafb';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 標題
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('今日 Bingo', size / 2, 30);

  // 繪製格子
  board.tasks.forEach((task, index) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    const x = padding + col * cellSize;
    const y = padding + 20 + row * cellSize;

    // 格子背景
    ctx.fillStyle = task.isCompleted ? '#10B981' : '#E5E7EB';
    ctx.beginPath();
    ctx.roundRect(x + 4, y + 4, cellSize - 8, cellSize - 8, 8);
    ctx.fill();

    // 任務文字
    ctx.fillStyle = task.isCompleted ? '#FFFFFF' : '#374151';
    ctx.font = task.category === 'free' ? 'bold 14px sans-serif' : '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const text = task.category === 'free' ? '★ FREE ★' : task.name;
    const maxWidth = cellSize - 20;
    const lines = wrapText(ctx, text, maxWidth);

    const lineHeight = 16;
    const startY = y + cellSize / 2 - ((lines.length - 1) * lineHeight) / 2;

    lines.forEach((line, i) => {
      ctx.fillText(line, x + cellSize / 2, startY + i * lineHeight);
    });
  });

  // 分數
  ctx.fillStyle = '#4F46E5';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(
    `分數：${board.score} | 連線：${board.completedLines.length}`,
    size / 2,
    size - 10
  );

  // 浮水印
  if (includeWatermark) {
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '14px sans-serif';
    ctx.fillText('Bingo Todo App', size / 2, size + 35);
  }

  // 轉換為 Blob
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob!);
    }, 'image/png');
  });
}

/**
 * 文字換行處理
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split('');
  const lines: string[] = [];
  let currentLine = '';

  for (const char of words) {
    const testLine = currentLine + char;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = char;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.slice(0, 3); // 最多 3 行
}

/**
 * 使用 Web Share API 分享
 */
export async function shareToSocial(
  board: BingoBoard,
  options: ShareOptions = {}
): Promise<boolean> {
  const {
    title = '我的 Bingo 成果',
    text = `今天完成了 ${board.tasks.filter((t) => t.isCompleted).length}/9 個任務！`,
  } = options;

  try {
    const blob = await generateShareImage(board, options);
    const file = new File([blob], 'bingo-result.png', { type: 'image/png' });

    if (navigator.share && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title,
        text,
        files: [file],
      });
      return true;
    } else {
      // 降級方案：下載圖片
      downloadImage(blob, 'bingo-result.png');
      return true;
    }
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error('分享失敗:', error);
    }
    return false;
  }
}

/**
 * 下載圖片
 */
export function downloadImage(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 複製圖片到剪貼簿
 */
export async function copyImageToClipboard(board: BingoBoard): Promise<boolean> {
  try {
    const blob = await generateShareImage(board);
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob }),
    ]);
    return true;
  } catch (error) {
    console.error('複製失敗:', error);
    return false;
  }
}
