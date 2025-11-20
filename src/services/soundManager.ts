/**
 * 音效管理器
 * 使用 Web Audio API 生成簡單音效
 */

class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.8;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  /**
   * 初始化音效（需要用戶互動）
   */
  async initialize(): Promise<void> {
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  /**
   * 播放連線完成音效
   */
  playLineComplete(): void {
    if (!this.enabled || !this.audioContext) return;

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    // 創建升調音效
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523.25, now); // C5
    oscillator.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
    oscillator.frequency.exponentialRampToValueAtTime(783.99, now + 0.2); // G5

    gainNode.gain.setValueAtTime(this.volume * 0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    oscillator.start(now);
    oscillator.stop(now + 0.3);
  }

  /**
   * 播放全清音效
   */
  playFullHouse(): void {
    if (!this.enabled || !this.audioContext) return;

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    // 創建勝利和弦音效
    const frequencies = [523.25, 659.25, 783.99]; // C-E-G 大三和弦

    frequencies.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, now);

      gainNode.gain.setValueAtTime(this.volume * 0.2, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1);

      oscillator.start(now + index * 0.1);
      oscillator.stop(now + 1);
    });
  }

  /**
   * 播放任務完成音效
   */
  playTaskComplete(): void {
    if (!this.enabled || !this.audioContext) return;

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(659.25, now); // E5

    gainNode.gain.setValueAtTime(this.volume * 0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    oscillator.start(now);
    oscillator.stop(now + 0.1);
  }

  /**
   * 播放任務取消音效
   */
  playTaskUncomplete(): void {
    if (!this.enabled || !this.audioContext) return;

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523.25, now); // C5
    oscillator.frequency.exponentialRampToValueAtTime(392.00, now + 0.1); // G4

    gainNode.gain.setValueAtTime(this.volume * 0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    oscillator.start(now);
    oscillator.stop(now + 0.1);
  }

  /**
   * 設定音效開關
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * 設定音量 (0-1)
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * 取得當前狀態
   */
  getState(): { enabled: boolean; volume: number } {
    return {
      enabled: this.enabled,
      volume: this.volume,
    };
  }
}

// 單例實例
export const soundManager = new SoundManager();
