import { useEffect } from 'react';
import { soundManager } from '@/services/soundManager';

export function useSound() {
  useEffect(() => {
    // 初始化音效（在用戶第一次互動時）
    const handleUserInteraction = () => {
      soundManager.initialize();
      // 只需要初始化一次
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);

  return {
    playLineComplete: () => soundManager.playLineComplete(),
    playFullHouse: () => soundManager.playFullHouse(),
    playTaskComplete: () => soundManager.playTaskComplete(),
    playTaskUncomplete: () => soundManager.playTaskUncomplete(),
    setEnabled: (enabled: boolean) => soundManager.setEnabled(enabled),
    setVolume: (volume: number) => soundManager.setVolume(volume),
    getState: () => soundManager.getState(),
  };
}
