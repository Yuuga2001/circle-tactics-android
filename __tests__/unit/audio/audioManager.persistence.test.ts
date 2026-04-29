/**
 * audioManager の AsyncStorage 永続化をテストする。
 * audioManager モジュール自体はモックせず実クラスを使う。
 * ただし expo-audio は setup.ts でグローバルモック済み。
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { audioManager } from '../../../src/audio/audioManager';

const mockStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

const BGM_KEY = 'circletactics.audio.bgmMuted';
const SE_KEY  = 'circletactics.audio.seMuted';

beforeEach(() => {
  jest.clearAllMocks();
  mockStorage.getItem.mockResolvedValue(null);
  // シングルトンの内部状態をリセット
  audioManager.setBgmMuted(false);
  audioManager.setSeMuted(false);
  jest.clearAllMocks(); // setBgmMuted/setSeMuted が setItem を呼んだ後にクリア
});

describe('initialize — 保存済み設定の復元', () => {
  it('bgmMuted=true が保存されていれば getBgmMuted() が true になる', async () => {
    mockStorage.getItem.mockImplementation(async (key) =>
      key === BGM_KEY ? 'true' : null,
    );
    await audioManager.initialize();
    expect(audioManager.getBgmMuted()).toBe(true);
  });

  it('seMuted=true が保存されていれば getSeMuted() が true になる', async () => {
    mockStorage.getItem.mockImplementation(async (key) =>
      key === SE_KEY ? 'true' : null,
    );
    await audioManager.initialize();
    expect(audioManager.getSeMuted()).toBe(true);
  });

  it('保存値がない場合はデフォルト false のまま', async () => {
    mockStorage.getItem.mockResolvedValue(null);
    await audioManager.initialize();
    expect(audioManager.getBgmMuted()).toBe(false);
    expect(audioManager.getSeMuted()).toBe(false);
  });

  it('"false" が保存されていれば false になる', async () => {
    mockStorage.getItem.mockResolvedValue('false');
    await audioManager.initialize();
    expect(audioManager.getBgmMuted()).toBe(false);
    expect(audioManager.getSeMuted()).toBe(false);
  });

  it('AsyncStorage が例外を投げてもデフォルト値で続行する', async () => {
    mockStorage.getItem.mockRejectedValue(new Error('storage error'));
    await expect(audioManager.initialize()).resolves.not.toThrow();
    expect(audioManager.getBgmMuted()).toBe(false);
    expect(audioManager.getSeMuted()).toBe(false);
  });
});

describe('setBgmMuted — AsyncStorage への書き込み', () => {
  it('setBgmMuted(true) で BGM_KEY に "true" が書き込まれる', async () => {
    audioManager.setBgmMuted(true);
    await Promise.resolve();
    expect(mockStorage.setItem).toHaveBeenCalledWith(BGM_KEY, 'true');
  });

  it('setBgmMuted(false) で BGM_KEY に "false" が書き込まれる', async () => {
    audioManager.setBgmMuted(false);
    await Promise.resolve();
    expect(mockStorage.setItem).toHaveBeenCalledWith(BGM_KEY, 'false');
  });

  it('getBgmMuted() が同期で更新される', () => {
    audioManager.setBgmMuted(true);
    expect(audioManager.getBgmMuted()).toBe(true);
    audioManager.setBgmMuted(false);
    expect(audioManager.getBgmMuted()).toBe(false);
  });
});

describe('setSeMuted — AsyncStorage への書き込み', () => {
  it('setSeMuted(true) で SE_KEY に "true" が書き込まれる', async () => {
    audioManager.setSeMuted(true);
    await Promise.resolve();
    expect(mockStorage.setItem).toHaveBeenCalledWith(SE_KEY, 'true');
  });

  it('setSeMuted(false) で SE_KEY に "false" が書き込まれる', async () => {
    audioManager.setSeMuted(false);
    await Promise.resolve();
    expect(mockStorage.setItem).toHaveBeenCalledWith(SE_KEY, 'false');
  });

  it('getSeMuted() が同期で更新される', () => {
    audioManager.setSeMuted(true);
    expect(audioManager.getSeMuted()).toBe(true);
    audioManager.setSeMuted(false);
    expect(audioManager.getSeMuted()).toBe(false);
  });
});
