import { useState, useCallback } from 'react';
import type { BingoBoard } from '@/types';
import {
  shareToSocial,
  generateShareImage,
  downloadImage,
  copyImageToClipboard,
} from '@/services/shareService';

interface UseShareResult {
  isSharing: boolean;
  share: (board: BingoBoard) => Promise<boolean>;
  download: (board: BingoBoard) => Promise<void>;
  copyToClipboard: (board: BingoBoard) => Promise<boolean>;
  canShare: boolean;
}

export function useShare(): UseShareResult {
  const [isSharing, setIsSharing] = useState(false);

  const canShare =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const share = useCallback(async (board: BingoBoard): Promise<boolean> => {
    setIsSharing(true);
    try {
      return await shareToSocial(board);
    } finally {
      setIsSharing(false);
    }
  }, []);

  const download = useCallback(async (board: BingoBoard): Promise<void> => {
    setIsSharing(true);
    try {
      const blob = await generateShareImage(board);
      downloadImage(blob, `bingo-${new Date().toISOString().split('T')[0]}.png`);
    } finally {
      setIsSharing(false);
    }
  }, []);

  const copyToClipboard = useCallback(
    async (board: BingoBoard): Promise<boolean> => {
      setIsSharing(true);
      try {
        return await copyImageToClipboard(board);
      } finally {
        setIsSharing(false);
      }
    },
    []
  );

  return {
    isSharing,
    share,
    download,
    copyToClipboard,
    canShare,
  };
}
