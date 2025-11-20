import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getLineType } from '@/services/lineDetector';

interface LineCompleteProps {
  line: number[] | null;
  onComplete?: () => void;
}

export function LineComplete({ line, onComplete }: LineCompleteProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (line) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [line, onComplete]);

  if (!line) return null;

  const lineType = getLineType(line);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: -50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 50 }}
          transition={{ type: 'spring', damping: 15 }}
          className="fixed top-1/3 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl px-8 py-4 shadow-2xl">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 0.5,
                repeat: 2,
              }}
              className="text-center"
            >
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-2xl font-bold text-white mb-1">連線！</h3>
              <p className="text-sm text-white/90">{lineType}</p>
            </motion.div>
          </div>

          {/* 光芒效果 */}
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
            }}
            className="absolute inset-0 bg-yellow-300 rounded-2xl blur-xl -z-10"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
