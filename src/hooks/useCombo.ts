import { useState, useCallback, useRef, useEffect } from 'react';
import { COMBO_MULTIPLIERS, MAX_COMBO, COMBO_TIMEOUT_MS } from '@/constants';

interface ComboState {
  count: number;
  multiplier: number;
  lastCompletedAt: Date | null;
  isActive: boolean;
  timeRemaining: number;
}

export function useCombo() {
  const [state, setState] = useState<ComboState>({
    count: 0,
    multiplier: 1,
    lastCompletedAt: null,
    isActive: false,
    timeRemaining: 0,
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 清理計時器
  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  // 重置連擊
  const resetCombo = useCallback(() => {
    clearTimers();
    setState({
      count: 0,
      multiplier: 1,
      lastCompletedAt: null,
      isActive: false,
      timeRemaining: 0,
    });
  }, [clearTimers]);

  // 記錄任務完成
  const recordCompletion = useCallback(() => {
    const now = new Date();

    setState((prev) => {
      const newCount = Math.min(prev.count + 1, MAX_COMBO);
      const newMultiplier = COMBO_MULTIPLIERS[newCount] || COMBO_MULTIPLIERS[MAX_COMBO];

      return {
        count: newCount,
        multiplier: newMultiplier,
        lastCompletedAt: now,
        isActive: true,
        timeRemaining: COMBO_TIMEOUT_MS,
      };
    });

    // 清理舊計時器
    clearTimers();

    // 設置超時計時器
    timerRef.current = setTimeout(() => {
      resetCombo();
    }, COMBO_TIMEOUT_MS);

    // 設置倒計時更新
    countdownRef.current = setInterval(() => {
      setState((prev) => {
        const elapsed = prev.lastCompletedAt
          ? Date.now() - prev.lastCompletedAt.getTime()
          : 0;
        const remaining = Math.max(0, COMBO_TIMEOUT_MS - elapsed);

        if (remaining <= 0) {
          return prev;
        }

        return { ...prev, timeRemaining: remaining };
      });
    }, 1000);

    return state.multiplier;
  }, [clearTimers, resetCombo, state.multiplier]);

  // 清理效果
  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  return {
    ...state,
    recordCompletion,
    resetCombo,
    formattedTime: formatTime(state.timeRemaining),
  };
}

function formatTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
