import { useCallback } from 'react';

let audioCtx: AudioContext | null = null;

type AudioContextWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
};

function getCtx(): AudioContext {
  if (typeof window === 'undefined') {
    throw new Error('Web Audio API is unavailable outside the browser');
  }

  const audioWindow = window as AudioContextWindow;
  const AudioContextCtor = audioWindow.AudioContext || audioWindow.webkitAudioContext;
  if (!AudioContextCtor) {
    throw new Error('Web Audio API is not supported by this browser');
  }

  if (!audioCtx) {
    audioCtx = new AudioContextCtor();
  }
  if (audioCtx.state === 'suspended') {
    void audioCtx.resume().catch(() => undefined);
  }
  return audioCtx;
}

// Вызывается из обработчика реального touch/click, чтобы браузер разрешил звук.
export function unlockAudio(): void {
  try {
    const ctx = getCtx();
    if (ctx.state === 'suspended') {
      void ctx.resume().catch(() => undefined);
    }
  } catch {
    // Audio не критичен для работы приложения.
  }
}

export function useSound() {
  const playTone = useCallback((frequency: number, volume: number, duration: number) => {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startAt = ctx.currentTime;
      const endAt = startAt + duration;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, startAt);
      gain.gain.setValueAtTime(volume, startAt);
      gain.gain.exponentialRampToValueAtTime(0.001, endAt);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startAt);
      osc.stop(endAt);
    } catch {
      // Звук необязателен: его отсутствие не должно мешать интерфейсу.
    }
  }, []);

  const playClick = useCallback(() => playTone(1000, 0.15, 0.05), [playTone]);
  const playTab = useCallback(() => playTone(1200, 0.12, 0.04), [playTone]);

  return { playClick, playTab };
}
