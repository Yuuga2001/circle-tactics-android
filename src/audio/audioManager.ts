import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';

type SoundName = 'place' | 'select' | 'win' | 'draw' | 'skip' | 'first' | 'roulette';

const SOUND_FILES: Record<SoundName, number> = {
  place:    require('../../assets/sounds/place.wav'),
  select:   require('../../assets/sounds/select.wav'),
  win:      require('../../assets/sounds/win.wav'),
  draw:     require('../../assets/sounds/draw.wav'),
  skip:     require('../../assets/sounds/skip.wav'),
  first:    require('../../assets/sounds/first.wav'),
  roulette: require('../../assets/sounds/roulette.wav'),
};

class AudioManager {
  private players: Partial<Record<SoundName, AudioPlayer>> = {};
  private bgmPlayer: AudioPlayer | null = null;
  private bgmMuted = false;
  private seMuted = false;

  async initialize(): Promise<void> {
    try {
      await setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers' });
    } catch {
      // noop
    }

    for (const [name, file] of Object.entries(SOUND_FILES) as [SoundName, number][]) {
      try {
        this.players[name] = createAudioPlayer(file);
      } catch {
        // noop
      }
    }
  }

  async play(name: SoundName): Promise<void> {
    if (this.seMuted) return;
    const player = this.players[name];
    if (!player) return;
    try {
      await player.seekTo(0);
      player.play();
    } catch {
      // noop
    }
  }

  async startBGM(): Promise<void> {
    if (this.bgmMuted) return;
    try {
      if (!this.bgmPlayer) {
        this.bgmPlayer = createAudioPlayer(require('../../assets/sounds/bgm_loop.wav'));
        this.bgmPlayer.loop = true;
        this.bgmPlayer.volume = 0.2;
      }
      this.bgmPlayer.play();
    } catch {
      // noop
    }
  }

  async stopBGM(): Promise<void> {
    try {
      this.bgmPlayer?.pause();
    } catch {
      // noop
    }
  }

  setBgmMuted(muted: boolean): void {
    this.bgmMuted = muted;
    if (muted) {
      this.stopBGM();
    } else {
      this.startBGM();
    }
  }

  setSeMuted(muted: boolean): void {
    this.seMuted = muted;
  }

  getBgmMuted(): boolean {
    return this.bgmMuted;
  }

  getSeMuted(): boolean {
    return this.seMuted;
  }
}

export const audioManager = new AudioManager();
