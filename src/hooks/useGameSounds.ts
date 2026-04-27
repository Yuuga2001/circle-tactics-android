import { useCallback } from 'react';
import { audioManager } from '../audio/audioManager';

type SoundName = 'place' | 'select' | 'win' | 'draw' | 'skip' | 'first' | 'roulette';

export function useGameSounds() {
  const play = useCallback((name: SoundName) => {
    audioManager.play(name);
  }, []);

  const startBGM = useCallback(() => {
    audioManager.startBGM();
  }, []);

  const stopBGM = useCallback(() => {
    audioManager.stopBGM();
  }, []);

  return { play, startBGM, stopBGM };
}
