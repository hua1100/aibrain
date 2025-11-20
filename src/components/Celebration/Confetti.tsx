import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ConfettiProps {
  isActive: boolean;
  onComplete?: () => void;
}

// 單個紙屑
function ConfettiPiece({ delay }: { delay: number }) {
  const colors = ['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const x = Math.random() * 100 - 50; // -50 到 50
  const rotation = Math.random() * 360;

  return (
    <motion.div
      initial={{ y: -20, x: 0, opacity: 1, rotate: 0 }}
      animate={{
        y: window.innerHeight + 20,
        x: [0, x, x * 2, x * 3],
        rotate: [0, rotation, rotation * 2],
        opacity: [1, 1, 0.5, 0],
      }}
      transition={{
        duration: 3,
        delay,
        ease: 'easeIn',
      }}
      style={{
        position: 'absolute',
        left: `${Math.random() * 100}%`,
        width: '10px',
        height: '10px',
        backgroundColor: color,
      }}
      className="rounded-sm"
    />
  );
}

export function Confetti({ isActive, onComplete }: ConfettiProps) {
  const [pieces, setPieces] = useState<number[]>([]);

  useEffect(() => {
    if (isActive) {
      // 生成 50 個紙屑
      setPieces(Array.from({ length: 50 }, (_, i) => i));

      const timer = setTimeout(() => {
        setPieces([]);
        onComplete?.();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  return (
    <AnimatePresence>
      {isActive && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {pieces.map((i) => (
            <ConfettiPiece key={i} delay={i * 0.02} />
          ))}

          {/* 全清訊息 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 100 }}
            transition={{ type: 'spring', damping: 10 }}
            className="absolute top-1/4 left-1/2 -translate-x-1/2"
          >
            <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-3xl px-12 py-6 shadow-2xl">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 0.5,
                  repeat: 3,
                }}
                className="text-center"
              >
                <div className="text-6xl mb-3">🎉</div>
                <h2 className="text-4xl font-bold text-white mb-2">恭喜全清！</h2>
                <p className="text-lg text-white/90">完成今日所有任務</p>
              </motion.div>
            </div>

            {/* 光環效果 */}
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
              className="absolute inset-0 bg-green-300 rounded-3xl blur-2xl -z-10"
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
