import { renderHook, act } from '@testing-library/react-native';
import { useAppInit } from '../../../src/hooks/useAppInit';

jest.mock('../../../src/online/clientId', () => ({
  getClientId: jest.fn().mockResolvedValue('test-client-id'),
}));

jest.mock('../../../src/online/activeGame', () => ({
  loadActiveGame: jest.fn().mockResolvedValue(null),
}));

jest.mock('../../../src/audio/audioManager', () => ({
  audioManager: {
    initialize: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('useAppInit', () => {
  it('初期状態は ready=false', () => {
    const { result } = renderHook(() => useAppInit());
    expect(result.current.ready).toBe(false);
  });

  it('全ての初期化が完了すると ready=true', async () => {
    const { result } = renderHook(() => useAppInit());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.ready).toBe(true);
  });

  it('clientId が設定される', async () => {
    const { result } = renderHook(() => useAppInit());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.clientId).toBe('test-client-id');
  });
});
