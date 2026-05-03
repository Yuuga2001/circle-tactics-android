import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAppInit } from '../../../src/hooks/useAppInit';

jest.mock('../../../src/online/clientId', () => ({
  getClientId: jest.fn().mockResolvedValue('client-abc'),
}));

jest.mock('../../../src/online/activeGame', () => ({
  loadActiveGame: jest.fn().mockResolvedValue(null),
  clearActiveGame: jest.fn(),
  saveActiveGame: jest.fn(),
  useLiveRoomCode: jest.fn().mockReturnValue(null),
  useLivePlayerCount: jest.fn().mockReturnValue(null),
  setLiveRoomCode: jest.fn(),
  setLivePlayerCount: jest.fn(),
}));

jest.mock('../../../src/audio/audioManager', () => ({
  audioManager: {
    initialize: jest.fn().mockResolvedValue(undefined),
    play: jest.fn(),
    startBGM: jest.fn(),
    stopBGM: jest.fn(),
    setBgmMuted: jest.fn(),
    setSeMuted: jest.fn(),
    getBgmMuted: jest.fn().mockReturnValue(false),
    getSeMuted: jest.fn().mockReturnValue(false),
  },
}));

describe('useAppInit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('初期状態では ready=false', () => {
    const { result } = renderHook(() => useAppInit());
    expect(result.current.ready).toBe(false);
  });

  it('初期状態では clientId=null', () => {
    const { result } = renderHook(() => useAppInit());
    expect(result.current.clientId).toBeNull();
  });

  it('非同期初期化後に ready=true になる', async () => {
    const { result } = renderHook(() => useAppInit());
    await waitFor(() => {
      expect(result.current.ready).toBe(true);
    });
  });

  it('非同期初期化後に clientId がセットされる', async () => {
    const { result } = renderHook(() => useAppInit());
    await waitFor(() => {
      expect(result.current.clientId).toBe('client-abc');
    });
  });

  it('audioManager.initialize が失敗しても ready=true になる', async () => {
    const { audioManager } = require('../../../src/audio/audioManager');
    audioManager.initialize.mockRejectedValueOnce(new Error('audio error'));

    const { result } = renderHook(() => useAppInit());
    await waitFor(() => {
      expect(result.current.ready).toBe(true);
    });
  });

  it('アンマウント後はステート更新が呼ばれない（cancelled フラグ）', async () => {
    const { getClientId } = require('../../../src/online/clientId');
    let resolveId: (v: string) => void;
    getClientId.mockReturnValueOnce(
      new Promise<string>((resolve) => { resolveId = resolve; })
    );

    const { result, unmount } = renderHook(() => useAppInit());
    expect(result.current.ready).toBe(false);

    // アンマウント後に Promise を解決
    unmount();
    act(() => { resolveId!('late-client'); });

    // アンマウント後なので ready は false のまま
    expect(result.current.ready).toBe(false);
    expect(result.current.clientId).toBeNull();
  });
});
