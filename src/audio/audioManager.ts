import { Audio } from 'expo-av';

type SoundName = 'place' | 'select' | 'win' | 'draw' | 'skip' | 'first' | 'roulette';

const SOUND_FILES: Record<SoundName, number> = {
  place: require('../../assets/sounds/place.wav'),
  select: require('../../assets/sounds/select.wav'),
  win: require('../../assets/sounds/win.wav'),
  draw: require('../../assets/sounds/draw.wav'),
  skip: require('../../assets/sounds/skip.wav'),
  first: require('../../assets/sounds/first.wav'),
  roulette: require('../../assets/sounds/roulette.wav'),
};

class AudioManager {
  private sounds: Partial<Record<SoundName, Audio.Sound>> = {};
  private muted = false;
  private bgmMuted = false;
  private seMuted = false;
  private bgmSound: Audio.Sound | null = null;

  async initialize(): Promise<void> {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });

    await Promise.all(
      (Object.entries(SOUND_FILES) as [SoundName, number][]).map(async ([name, file]) => {
        const { sound } = await Audio.Sound.createAsync(file, { shouldPlay: false });
        this.sounds[name] = sound;
      }),
    );
  }

  async play(name: SoundName): Promise<void> {
    if (this.muted || this.seMuted) return;
    const sound = this.sounds[name];
    if (!sound) return;
    try {
      await sound.stopAsync();
      await sound.playAsync();
    } catch {
      // noop
    }
  }

  async startBGM(): Promise<void> {
    if (this.muted || this.bgmMuted) return;
    try {
      if (!this.bgmSound) {
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/bgm_loop.mp3'),
          { isLooping: true, shouldPlay: true },
        );
        this.bgmSound = sound;
      } else {
        await this.bgmSound.playAsync();
      }
    } catch {
      // noop
    }
  }

  async stopBGM(): Promise<void> {
    try {
      await this.bgmSound?.stopAsync();
    } catch {
      // noop
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (muted) this.stopBGM();
  }

  getMuted(): boolean {
    return this.muted;
  }

  setBgmMuted(muted: boolean): void {
    this.bgmMuted = muted;
    if (muted) this.stopBGM();
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
