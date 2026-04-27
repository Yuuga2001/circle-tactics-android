import { renderHook, act } from '@testing-library/react-native';
import { AppState } from 'react-native';
import { usePolling } from '../../../src/online/usePolling';

jest.mock('../../../src/online/api', () => ({
  api: {
    getGame: jest.fn().mockResolvedValue({
      gameId: 'g1',
      players: [],
      status: 'WAITING',
    }),
  },
}));

import { api } from '../../../src/online/api';
const mockGetGame = api.getGame as jest.Mock;

// AppState event subscription mock
let appStateCallback: ((state: string) => void) | null = null;
const mockRemove = jest.fn();

beforeEach(() => {
  jest.useFakeTimers();
  mockGetGame.mockClear();
  mockRemove.mockClear();
  appStateCallback = null;

  jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, cb) => {
    appStateCallback = cb as (state: string) => void;
    return { remove: mockRemove };
  });

  Object.defineProperty(AppState, 'currentState', {
    get: jest.fn().mockReturnValue('active'),
    configurable: true,
  });
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

/** タイマーを進めて非同期処理をフラッシュするヘルパー */
async function advanceTime(ms: number) {
  act(() => { jest.advanceTimersByTime(ms); });
  await act(async () => { await Promise.resolve(); });
}

describe('usePolling', () => {
  it('gameId が null のとき api を呼ばない', () => {
    renderHook(() => usePolling(null));
    expect(mockGetGame).not.toHaveBeenCalled();
  });

  it('gameId が与えられると即座に api.getGame を呼び出す', async () => {
    renderHook(() => usePolling('g1', { intervalMs: 1000 }));

    await act(async () => { await Promise.resolve(); });

    expect(mockGetGame).toHaveBeenCalledWith('g1');
  });

  it('インターバルごとに api.getGame を繰り返し呼ぶ', async () => {
    renderHook(() => usePolling('g1', { intervalMs: 1000 }));

    // 最初の呼び出し
    await act(async () => { await Promise.resolve(); });
    expect(mockGetGame).toHaveBeenCalledTimes(1);

    // 1秒後 → 2回目
    await advanceTime(1000);
    expect(mockGetGame).toHaveBeenCalledTimes(2);

    // さらに1秒後 → 3回目
    await advanceTime(1000);
    expect(mockGetGame).toHaveBeenCalledTimes(3);
  });

  it('api レスポンスが session に格納される', async () => {
    const mockSession = { gameId: 'g1', players: [], status: 'WAITING' };
    mockGetGame.mockResolvedValue(mockSession);

    const { result } = renderHook(() => usePolling('g1', { intervalMs: 1000 }));

    await act(async () => { await Promise.resolve(); });

    expect(result.current.session).toEqual(mockSession);
    expect(result.current.error).toBeNull();
  });

  it('api がエラーを返すと error に格納される', async () => {
    const err = new Error('network error');
    mockGetGame.mockRejectedValue(err);

    const { result } = renderHook(() => usePolling('g1', { intervalMs: 1000 }));

    await act(async () => { await Promise.resolve(); });

    expect(result.current.error).toEqual(err);
  });

  it('pause=true のとき api を呼ばない', async () => {
    renderHook(() => usePolling('g1', { intervalMs: 1000, pause: true }));

    await advanceTime(3000);

    expect(mockGetGame).not.toHaveBeenCalled();
  });

  it('AppState が background になると polling が止まる', async () => {
    renderHook(() => usePolling('g1', { intervalMs: 1000 }));

    // 最初の呼び出し
    await act(async () => { await Promise.resolve(); });
    expect(mockGetGame).toHaveBeenCalledTimes(1);

    // background に変更
    act(() => {
      Object.defineProperty(AppState, 'currentState', {
        get: jest.fn().mockReturnValue('background'),
        configurable: true,
      });
      if (appStateCallback) appStateCallback('background');
    });

    // インターバル経過しても呼ばれない
    await advanceTime(3000);
    expect(mockGetGame).toHaveBeenCalledTimes(1);
  });

  it('AppState が active に戻ると polling が再開する', async () => {
    renderHook(() => usePolling('g1', { intervalMs: 1000 }));

    // 最初の呼び出し
    await act(async () => { await Promise.resolve(); });
    const callsBefore = mockGetGame.mock.calls.length;

    // background に変更
    act(() => {
      Object.defineProperty(AppState, 'currentState', {
        get: jest.fn().mockReturnValue('background'),
        configurable: true,
      });
      if (appStateCallback) appStateCallback('background');
    });

    // background 中はスキップ
    await advanceTime(2000);
    expect(mockGetGame).toHaveBeenCalledTimes(callsBefore);

    // active に戻る
    act(() => {
      Object.defineProperty(AppState, 'currentState', {
        get: jest.fn().mockReturnValue('active'),
        configurable: true,
      });
      if (appStateCallback) appStateCallback('active');
    });

    // 次のインターバルで再開
    await advanceTime(1000);
    expect(mockGetGame.mock.calls.length).toBeGreaterThan(callsBefore);
  });

  it('アンマウント時にポーリングが停止する', async () => {
    const { unmount } = renderHook(() => usePolling('g1', { intervalMs: 1000 }));

    await act(async () => { await Promise.resolve(); });
    const callsAtUnmount = mockGetGame.mock.calls.length;

    unmount();

    await advanceTime(3000);
    expect(mockGetGame).toHaveBeenCalledTimes(callsAtUnmount);
  });

  it('setSession を使って session を手動更新できる', async () => {
    const { result } = renderHook(() => usePolling('g1', { intervalMs: 1000 }));

    await act(async () => { await Promise.resolve(); });

    const newSession = { gameId: 'g1', players: [], status: 'PLAYING' };
    act(() => {
      result.current.setSession(newSession as any);
    });

    expect(result.current.session).toEqual(newSession);
  });

  it('AppState イベントリスナーがアンマウント時に削除される', () => {
    const { unmount } = renderHook(() => usePolling('g1'));
    unmount();
    expect(mockRemove).toHaveBeenCalled();
  });
});
