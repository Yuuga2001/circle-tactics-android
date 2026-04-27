import { useState } from 'react';
import { audioManager } from '../audio/audioManager';

export function useAudioSettings() {
  const [bgmMuted, setBgmMutedState] = useState(() => audioManager.getBgmMuted());
  const [seMuted, setSeMutedState] = useState(() => audioManager.getSeMuted());

  const setBgmMuted = (muted: boolean) => {
    audioManager.setBgmMuted(muted);
    setBgmMutedState(muted);
  };

  const setSeMuted = (muted: boolean) => {
    audioManager.setSeMuted(muted);
    setSeMutedState(muted);
  };

  return { bgmMuted, seMuted, setBgmMuted, setSeMuted };
}
