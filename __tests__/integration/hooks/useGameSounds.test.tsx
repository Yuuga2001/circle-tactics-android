import { renderHook, act } from '@testing-library/react-native';
import { useGameSounds } from '../../../src/hooks/useGameSounds';

jest.mock('../../../src/audio/audioManager', () => ({
  audioManager: {
    play: jest.fn(),
    startBGM: jest.fn(),
    stopBGM: jest.fn(),
  },
}));

describe('useGameSounds', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { audioManager } = require('../../../src/audio/audioManager');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('play("place") を呼ぶと audioManager.play("place") が呼ばれる', () => {
    const { result } = renderHook(() => useGameSounds());
    act(() => { result.current.play('place'); });
    expect(audioManager.play).toHaveBeenCalledWith('place');
  });

  it('play("win") を呼ぶと audioManager.play("win") が呼ばれる', () => {
    const { result } = renderHook(() => useGameSounds());
    act(() => { result.current.play('win'); });
    expect(audioManager.play).toHaveBeenCalledWith('win');
  });

  it('play("select") を呼ぶと audioManager.play("select") が呼ばれる', () => {
    const { result } = renderHook(() => useGameSounds());
    act(() => { result.current.play('select'); });
    expect(audioManager.play).toHaveBeenCalledWith('select');
  });

  it('startBGM を呼ぶと audioManager.startBGM が呼ばれる', () => {
    const { result } = renderHook(() => useGameSounds());
    act(() => { result.current.startBGM(); });
    expect(audioManager.startBGM).toHaveBeenCalledTimes(1);
  });

  it('stopBGM を呼ぶと audioManager.stopBGM が呼ばれる', () => {
    const { result } = renderHook(() => useGameSounds());
    act(() => { result.current.stopBGM(); });
    expect(audioManager.stopBGM).toHaveBeenCalledTimes(1);
  });

  it('play 関数はレンダー間で参照が安定している（useCallback）', () => {
    const { result, rerender } = renderHook(() => useGameSounds());
    const playRef1 = result.current.play;
    rerender({});
    const playRef2 = result.current.play;
    expect(playRef1).toBe(playRef2);
  });

  it('startBGM 関数はレンダー間で参照が安定している（useCallback）', () => {
    const { result, rerender } = renderHook(() => useGameSounds());
    const ref1 = result.current.startBGM;
    rerender({});
    expect(result.current.startBGM).toBe(ref1);
  });

  it('stopBGM 関数はレンダー間で参照が安定している（useCallback）', () => {
    const { result, rerender } = renderHook(() => useGameSounds());
    const ref1 = result.current.stopBGM;
    rerender({});
    expect(result.current.stopBGM).toBe(ref1);
  });

  it('play("reject") を呼ぶと audioManager.play が "reject" で呼ばれる', () => {
    const { result } = renderHook(() => useGameSounds());
    act(() => { result.current.play('reject'); });
    expect(audioManager.play).toHaveBeenCalledWith('reject');
  });

  it('play("tap") を呼ぶと audioManager.play が "tap" で呼ばれる', () => {
    const { result } = renderHook(() => useGameSounds());
    act(() => { result.current.play('tap'); });
    expect(audioManager.play).toHaveBeenCalledWith('tap');
  });
});
