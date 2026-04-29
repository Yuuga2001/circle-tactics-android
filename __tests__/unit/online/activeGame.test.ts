import AsyncStorage from '@react-native-async-storage/async-storage';
import { renderHook, act } from '@testing-library/react-native';
import {
  saveActiveGame,
  loadActiveGame,
  clearActiveGame,
  setLiveRoomCode,
  useLiveRoomCode,
  setLivePlayerCount,
  useLivePlayerCount,
} from '../../../src/online/activeGame';

const mockStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

beforeEach(() => {
  jest.clearAllMocks();
  mockStorage.getItem.mockResolvedValue(null);
});

describe('saveActiveGame', () => {
  it('AsyncStorage に gameId・roomCode・savedAt を保存する', async () => {
    await saveActiveGame({ gameId: 'g1', roomCode: 'ABC123' });
    expect(mockStorage.setItem).toHaveBeenCalledWith(
      expect.stringContaining('activeGame'),
      expect.stringContaining('g1'),
    );
  });

  it('color を含む場合も保存できる', async () => {
    await saveActiveGame({ gameId: 'g2', roomCode: 'DEF456', color: 'RED' });
    const raw = mockStorage.setItem.mock.calls[0][1];
    const parsed = JSON.parse(raw);
    expect(parsed.color).toBe('RED');
  });
});

describe('loadActiveGame', () => {
  it('保存済みデータを返す', async () => {
    const payload = { gameId: 'g1', roomCode: 'ABC', savedAt: Date.now() };
    mockStorage.getItem.mockResolvedValue(JSON.stringify(payload));

    const result = await loadActiveGame();
    expect(result).toMatchObject({ gameId: 'g1', roomCode: 'ABC' });
  });

  it('null を返す場合（データなし）', async () => {
    mockStorage.getItem.mockResolvedValue(null);
    const result = await loadActiveGame();
    expect(result).toBeNull();
  });

  it('6時間以上古いエントリを削除して null を返す', async () => {
    const old = { gameId: 'g1', roomCode: 'ABC', savedAt: Date.now() - 7 * 60 * 60 * 1000 };
    mockStorage.getItem.mockResolvedValue(JSON.stringify(old));

    const result = await loadActiveGame();
    expect(result).toBeNull();
    expect(mockStorage.removeItem).toHaveBeenCalled();
  });

  it('gameId または roomCode がない場合は null を返す', async () => {
    const incomplete = { savedAt: Date.now() };
    mockStorage.getItem.mockResolvedValue(JSON.stringify(incomplete));
    const result = await loadActiveGame();
    expect(result).toBeNull();
  });
});

describe('clearActiveGame', () => {
  it('AsyncStorage から削除する', async () => {
    await clearActiveGame();
    expect(mockStorage.removeItem).toHaveBeenCalled();
  });
});

describe('loadActiveGame — エラー系', () => {
  it('AsyncStorage が例外を投げた場合 null を返す', async () => {
    mockStorage.getItem.mockRejectedValue(new Error('disk error'));
    const result = await loadActiveGame();
    expect(result).toBeNull();
  });

  it('破損した JSON の場合 null を返す', async () => {
    mockStorage.getItem.mockResolvedValue('{broken json');
    const result = await loadActiveGame();
    expect(result).toBeNull();
  });
});

describe('saveActiveGame — エラー系', () => {
  it('AsyncStorage が例外を投げても例外を外に出さない', async () => {
    mockStorage.setItem.mockRejectedValue(new Error('write error'));
    await expect(saveActiveGame({ gameId: 'g1', roomCode: 'R1' })).resolves.toBeUndefined();
  });
});

describe('clearActiveGame — エラー系', () => {
  it('AsyncStorage が例外を投げても例外を外に出さない', async () => {
    mockStorage.removeItem.mockRejectedValue(new Error('remove error'));
    await expect(clearActiveGame()).resolves.toBeUndefined();
  });
});

describe('useLiveRoomCode', () => {
  beforeEach(() => {
    setLiveRoomCode(null);
  });

  it('初期値は null', () => {
    const { result } = renderHook(() => useLiveRoomCode());
    expect(result.current).toBeNull();
  });

  it('setLiveRoomCode を呼ぶとフックの値が更新される', () => {
    const { result } = renderHook(() => useLiveRoomCode());
    act(() => { setLiveRoomCode('ABC123'); });
    expect(result.current).toBe('ABC123');
  });

  it('null に戻すと null になる', () => {
    act(() => { setLiveRoomCode('XYZ'); });
    const { result } = renderHook(() => useLiveRoomCode());
    act(() => { setLiveRoomCode(null); });
    expect(result.current).toBeNull();
  });

  it('アンマウント後は更新を受け取らない', () => {
    const { result, unmount } = renderHook(() => useLiveRoomCode());
    unmount();
    act(() => { setLiveRoomCode('LEAKED'); });
    expect(result.current).toBeNull();
  });

  it('複数フックが同時に更新される', () => {
    const { result: r1 } = renderHook(() => useLiveRoomCode());
    const { result: r2 } = renderHook(() => useLiveRoomCode());
    act(() => { setLiveRoomCode('MULTI'); });
    expect(r1.current).toBe('MULTI');
    expect(r2.current).toBe('MULTI');
  });
});

describe('useLivePlayerCount', () => {
  beforeEach(() => {
    setLivePlayerCount(null);
  });

  it('初期値は null', () => {
    const { result } = renderHook(() => useLivePlayerCount());
    expect(result.current).toBeNull();
  });

  it('setLivePlayerCount を呼ぶとフックの値が更新される', () => {
    const { result } = renderHook(() => useLivePlayerCount());
    act(() => { setLivePlayerCount(3); });
    expect(result.current).toBe(3);
  });

  it('0 を設定できる', () => {
    const { result } = renderHook(() => useLivePlayerCount());
    act(() => { setLivePlayerCount(0); });
    expect(result.current).toBe(0);
  });

  it('アンマウント後は更新を受け取らない', () => {
    const { result, unmount } = renderHook(() => useLivePlayerCount());
    unmount();
    act(() => { setLivePlayerCount(99); });
    expect(result.current).toBeNull();
  });
});
