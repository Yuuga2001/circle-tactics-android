import { renderHook, act } from '@testing-library/react-native';
import { AppState } from 'react-native';
import { useHeartbeat } from '../../../src/online/useHeartbeat';

jest.mock('../../../src/online/api', () => ({
  api: {
    heartbeat: jest.fn().mockResolvedValue({}),
  },
}));

import { api } from '../../../src/online/api';
const mockHeartbeat = api.heartbeat as jest.Mock;

let appStateCallback: ((state: string) => void) | null = null;
const mockRemove = jest.fn();

beforeEach(() => {
  jest.useFakeTimers();
  mockHeartbeat.mockClear();
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

describe('useHeartbeat', () => {
  it('active=true のとき即座に heartbeat を送信する', async () => {
    renderHook(() => useHeartbeat('g1', 'client-1', true, 5000));

    await act(async () => { await Promise.resolve(); });

    expect(mockHeartbeat).toHaveBeenCalledWith('g1', 'client-1');
  });

  it('インターバルごとに heartbeat を繰り返し送信する', async () => {
    renderHook(() => useHeartbeat('g1', 'client-1', true, 5000));

    await act(async () => { await Promise.resolve(); });
    expect(mockHeartbeat).toHaveBeenCalledTimes(1);

    await advanceTime(5000);
    expect(mockHeartbeat).toHaveBeenCalledTimes(2);

    await advanceTime(5000);
    expect(mockHeartbeat).toHaveBeenCalledTimes(3);
  });

  it('active=false のとき heartbeat を送信しない', async () => {
    renderHook(() => useHeartbeat('g1', 'client-1', false, 5000));

    await advanceTime(10000);

    expect(mockHeartbeat).not.toHaveBeenCalled();
  });

  it('gameId が null のとき heartbeat を送信しない', async () => {
    renderHook(() => useHeartbeat(null, 'client-1', true, 5000));

    await advanceTime(10000);

    expect(mockHeartbeat).not.toHaveBeenCalled();
  });

  it('clientId が空文字のとき heartbeat を送信しない', async () => {
    renderHook(() => useHeartbeat('g1', '', true, 5000));

    await advanceTime(10000);

    expect(mockHeartbeat).not.toHaveBeenCalled();
  });

  it('AppState が background のとき heartbeat を送信しない', async () => {
    Object.defineProperty(AppState, 'currentState', {
      get: jest.fn().mockReturnValue('background'),
      configurable: true,
    });

    renderHook(() => useHeartbeat('g1', 'client-1', true, 5000));

    await advanceTime(10000);

    expect(mockHeartbeat).not.toHaveBeenCalled();
  });

  it('AppState が background になると heartbeat が止まる', async () => {
    renderHook(() => useHeartbeat('g1', 'client-1', true, 5000));

    // 最初の送信
    await act(async () => { await Promise.resolve(); });
    expect(mockHeartbeat).toHaveBeenCalledTimes(1);

    // background に変更
    act(() => {
      Object.defineProperty(AppState, 'currentState', {
        get: jest.fn().mockReturnValue('background'),
        configurable: true,
      });
      if (appStateCallback) appStateCallback('background');
    });

    // インターバルを進めても送信されない (timer は動くが heartbeat はスキップ)
    await advanceTime(10000);
    expect(mockHeartbeat).toHaveBeenCalledTimes(1);
  });

  it('AppState が active に戻ると heartbeat が再開する', async () => {
    renderHook(() => useHeartbeat('g1', 'client-1', true, 5000));

    await act(async () => { await Promise.resolve(); });
    const callsBefore = mockHeartbeat.mock.calls.length;

    // background に変更
    act(() => {
      Object.defineProperty(AppState, 'currentState', {
        get: jest.fn().mockReturnValue('background'),
        configurable: true,
      });
      if (appStateCallback) appStateCallback('background');
    });

    await advanceTime(5000);
    const callsInBackground = mockHeartbeat.mock.calls.length;
    expect(callsInBackground).toBe(callsBefore);

    // active に戻る
    act(() => {
      Object.defineProperty(AppState, 'currentState', {
        get: jest.fn().mockReturnValue('active'),
        configurable: true,
      });
      if (appStateCallback) appStateCallback('active');
    });

    // 次のインターバルで再開
    await advanceTime(5000);
    expect(mockHeartbeat.mock.calls.length).toBeGreaterThan(callsInBackground);
  });

  it('アンマウント時に heartbeat が停止する', async () => {
    const { unmount } = renderHook(() => useHeartbeat('g1', 'client-1', true, 5000));

    await act(async () => { await Promise.resolve(); });
    const callsAtUnmount = mockHeartbeat.mock.calls.length;

    unmount();

    await advanceTime(10000);
    expect(mockHeartbeat).toHaveBeenCalledTimes(callsAtUnmount);
  });

  it('heartbeat がエラーを返してもクラッシュしない', async () => {
    mockHeartbeat.mockRejectedValueOnce(new Error('network error'));

    expect(() => {
      renderHook(() => useHeartbeat('g1', 'client-1', true, 5000));
    }).not.toThrow();

    await act(async () => { await Promise.resolve(); });

    // エラー後も次のインターバルで再試行
    await advanceTime(5000);
    expect(mockHeartbeat).toHaveBeenCalledTimes(2);
  });

  it('AppState イベントリスナーがアンマウント時に削除される', () => {
    const { unmount } = renderHook(() => useHeartbeat('g1', 'client-1', true, 5000));
    unmount();
    expect(mockRemove).toHaveBeenCalled();
  });
});
