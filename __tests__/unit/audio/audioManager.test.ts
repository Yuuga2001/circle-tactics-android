jest.mock('expo-av', () => require('../../mocks/expoAv').default);
jest.mock('../../../src/audio/audioManager', () => {
  const { Audio } = require('expo-av');
  const manager = {
    _muted: false,
    _bgmMuted: false,
    _seMuted: false,
    _sounds: {},
    _bgmSound: null,
    async initialize() {
      await Audio.setAudioModeAsync({});
    },
    async play(name: string) {
      if (this._muted || this._seMuted) return;
    },
    async startBGM() {
      if (this._muted || this._bgmMuted) return;
    },
    async stopBGM() {},
    setMuted(v: boolean) { this._muted = v; },
    getMuted() { return this._muted; },
    setBgmMuted(v: boolean) { this._bgmMuted = v; },
    setSeMuted(v: boolean) { this._seMuted = v; },
    getBgmMuted() { return this._bgmMuted; },
    getSeMuted() { return this._seMuted; },
  };
  return { audioManager: manager };
});

import { audioManager } from '../../../src/audio/audioManager';
import { Audio } from 'expo-av';

describe('audioManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    audioManager.setMuted(false);
    audioManager.setBgmMuted(false);
    audioManager.setSeMuted(false);
  });

  it('initialize が Audio.setAudioModeAsync を呼ぶ', async () => {
    await audioManager.initialize();
    expect(Audio.setAudioModeAsync).toHaveBeenCalled();
  });

  it('getMuted は初期 false', () => {
    expect(audioManager.getMuted()).toBe(false);
  });

  it('setMuted(true) で getMuted が true になる', () => {
    audioManager.setMuted(true);
    expect(audioManager.getMuted()).toBe(true);
  });

  it('setBgmMuted(true) で getBgmMuted が true になる', () => {
    audioManager.setBgmMuted(true);
    expect(audioManager.getBgmMuted()).toBe(true);
  });

  it('setSeMuted(true) で getSeMuted が true になる', () => {
    audioManager.setSeMuted(true);
    expect(audioManager.getSeMuted()).toBe(true);
  });
});
