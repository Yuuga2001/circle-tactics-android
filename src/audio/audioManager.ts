import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_BGM = 'circletactics.audio.bgmMuted';
const STORAGE_KEY_SE  = 'circletactics.audio.seMuted';

type SoundName = 'place' | 'select' | 'win' | 'draw' | 'skip' | 'first' | 'roulette' | 'tap';

const SOUND_FILES: Record<SoundName, number> = {
  place:    require('../../assets/sounds/place.wav'),
  select:   require('../../assets/sounds/select.wav'),
  win:      require('../../assets/sounds/win.wav'),
  draw:     require('../../assets/sounds/draw.wav'),
  skip:     require('../../assets/sounds/skip.wav'),
  first:    require('../../assets/sounds/first.wav'),
  roulette: require('../../assets/sounds/roulette.wav'),
  tap:      require('../../assets/sounds/select.wav'),
};

// Sounds that may be triggered in rapid succession get a pool of players
// so we never seek on an actively-playing instance (which causes crackling).
const POOL_SIZE = 3;
const POOLED_SOUNDS: ReadonlySet<SoundName> = new Set(['place', 'roulette']);

class AudioManager {
  private players: Partial<Record<SoundName, AudioPlayer>> = {};
  private pools: Partial<Record<SoundName, AudioPlayer[]>> = {};
  private poolIndex: Partial<Record<SoundName, number>> = {};
  private bgmPlayer: AudioPlayer | null = null;
  private keepalivePlayer: AudioPlayer | null = null;
  private bgmMuted = false;
  private seMuted = false;

  async initialize(): Promise<void> {
    try {
      const [bgm, se] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY_BGM),
        AsyncStorage.getItem(STORAGE_KEY_SE),
      ]);
      if (bgm !== null) this.bgmMuted = bgm === 'true';
      if (se !== null) this.seMuted = se === 'true';
    } catch {
      // noop
    }

    try {
      await setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers' });
    } catch {
      // noop
    }

    // 無音ループで AudioTrack を常時アクティブに保つ。
    // これがないと BGM OFF 時に AudioTrack が毎回コールドスタートし、
    // SE 冒頭に初期化ノイズ（音割れ）が発生する Android の既知問題への対処。
    try {
      this.keepalivePlayer = createAudioPlayer(require('../../assets/sounds/silent.wav'));
      this.keepalivePlayer.volume = 0;
      this.keepalivePlayer.loop = true;
      this.keepalivePlayer.play();
    } catch {
      // noop
    }

    for (const [name, file] of Object.entries(SOUND_FILES) as [SoundName, number][]) {
      try {
        if (POOLED_SOUNDS.has(name)) {
          this.pools[name] = Array.from({ length: POOL_SIZE }, () => createAudioPlayer(file));
          this.poolIndex[name] = 0;
        } else {
          this.players[name] = createAudioPlayer(file);
        }
      } catch {
        // noop
      }
    }
  }

  async play(name: SoundName): Promise<void> {
    if (this.seMuted) return;
    try {
      if (POOLED_SOUNDS.has(name)) {
        const pool = this.pools[name];
        if (!pool) return;
        const idx = this.poolIndex[name] ?? 0;
        const player = pool[idx];
        this.poolIndex[name] = (idx + 1) % POOL_SIZE;
        await player.seekTo(0);
        player.play();
      } else {
        const player = this.players[name];
        if (!player) return;
        player.pause();
        await player.seekTo(0);
        player.play();
      }
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
    AsyncStorage.setItem(STORAGE_KEY_BGM, String(muted)).catch(() => {});
    if (muted) {
      this.stopBGM();
    } else {
      this.startBGM();
    }
  }

  setSeMuted(muted: boolean): void {
    this.seMuted = muted;
    AsyncStorage.setItem(STORAGE_KEY_SE, String(muted)).catch(() => {});
  }

  getBgmMuted(): boolean {
    return this.bgmMuted;
  }

  getSeMuted(): boolean {
    return this.seMuted;
  }
}

export const audioManager = new AudioManager();
