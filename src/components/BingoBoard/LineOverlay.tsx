import { motion, AnimatePresence } from 'framer-motion';

interface LineOverlayProps {
  completedLines: number[][];
}

// 計算連線的起點和終點座標（相對於九宮格）
function getLineCoordinates(line: number[]): { x1: number; y1: number; x2: number; y2: number } {
  const positions = line.map((index) => ({
    row: Math.floor(index / 3),
    col: index % 3,
  }));

  const start = positions[0];
  const end = positions[2];

  // 轉換為百分比座標（格子中心點）
  const x1 = (start.col * 33.33) + 16.67; // 33.33% 是每格寬度，16.67% 是中心點
  const y1 = (start.row * 33.33) + 16.67;
  const x2 = (end.col * 33.33) + 16.67;
  const y2 = (end.row * 33.33) + 16.67;

  return { x1, y1, x2, y2 };
}

export function LineOverlay({ completedLines }: LineOverlayProps) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 100 100"
      style={{ zIndex: 10 }}
    >
      <AnimatePresence>
        {completedLines.map((line, index) => {
          const { x1, y1, x2, y2 } = getLineCoordinates(line);

          return (
            <motion.line
              key={`${line.join('-')}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#F59E0B"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                pathLength: { duration: 0.5, ease: 'easeInOut' },
                opacity: { duration: 0.3 },
              }}
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
              }}
            />
          );
        })}
      </AnimatePresence>
    </svg>
  );
}
