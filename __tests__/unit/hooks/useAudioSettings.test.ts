import { renderHook, act } from '@testing-library/react-native';
import { useAudioSettings } from '../../../src/hooks/useAudioSettings';

// audioManager をモック
jest.mock('../../../src/audio/audioManager', () => ({
  audioManager: {
    getBgmMuted: jest.fn().mockReturnValue(false),
    getSeMuted: jest.fn().mockReturnValue(false),
    setBgmMuted: jest.fn(),
    setSeMuted: jest.fn(),
  },
}));

import { audioManager } from '../../../src/audio/audioManager';
const mockAudioManager = audioManager as {
  getBgmMuted: jest.Mock;
  getSeMuted: jest.Mock;
  setBgmMuted: jest.Mock;
  setSeMuted: jest.Mock;
};

beforeEach(() => {
  mockAudioManager.getBgmMuted.mockReturnValue(false);
  mockAudioManager.getSeMuted.mockReturnValue(false);
  mockAudioManager.setBgmMuted.mockClear();
  mockAudioManager.setSeMuted.mockClear();
});

describe('useAudioSettings', () => {
  describe('初期状態', () => {
    it('bgmMuted の初期値は audioManager.getBgmMuted() から取得する', () => {
      mockAudioManager.getBgmMuted.mockReturnValue(false);
      const { result } = renderHook(() => useAudioSettings());
      expect(result.current.bgmMuted).toBe(false);
    });

    it('seMuted の初期値は audioManager.getSeMuted() から取得する', () => {
      mockAudioManager.getSeMuted.mockReturnValue(false);
      const { result } = renderHook(() => useAudioSettings());
      expect(result.current.seMuted).toBe(false);
    });

    it('bgmMuted が初期値 true の場合、true として返す', () => {
      mockAudioManager.getBgmMuted.mockReturnValue(true);
      const { result } = renderHook(() => useAudioSettings());
      expect(result.current.bgmMuted).toBe(true);
    });

    it('seMuted が初期値 true の場合、true として返す', () => {
      mockAudioManager.getSeMuted.mockReturnValue(true);
      const { result } = renderHook(() => useAudioSettings());
      expect(result.current.seMuted).toBe(true);
    });

    it('setBgmMuted と setSeMuted 関数を返す', () => {
      const { result } = renderHook(() => useAudioSettings());
      expect(typeof result.current.setBgmMuted).toBe('function');
      expect(typeof result.current.setSeMuted).toBe('function');
    });
  });

  describe('setBgmMuted', () => {
    it('true を渡すと bgmMuted が true になる', () => {
      const { result } = renderHook(() => useAudioSettings());

      act(() => {
        result.current.setBgmMuted(true);
      });

      expect(result.current.bgmMuted).toBe(true);
    });

    it('false を渡すと bgmMuted が false になる', () => {
      mockAudioManager.getBgmMuted.mockReturnValue(true);
      const { result } = renderHook(() => useAudioSettings());

      act(() => {
        result.current.setBgmMuted(false);
      });

      expect(result.current.bgmMuted).toBe(false);
    });

    it('audioManager.setBgmMuted を呼び出す', () => {
      const { result } = renderHook(() => useAudioSettings());

      act(() => {
        result.current.setBgmMuted(true);
      });

      expect(mockAudioManager.setBgmMuted).toHaveBeenCalledWith(true);
    });

    it('audioManager.setBgmMuted は正しい値で呼ばれる', () => {
      const { result } = renderHook(() => useAudioSettings());

      act(() => {
        result.current.setBgmMuted(false);
      });

      expect(mockAudioManager.setBgmMuted).toHaveBeenCalledWith(false);
    });

    it('SE の状態には影響しない', () => {
      const { result } = renderHook(() => useAudioSettings());
      const initialSeMuted = result.current.seMuted;

      act(() => {
        result.current.setBgmMuted(true);
      });

      expect(result.current.seMuted).toBe(initialSeMuted);
    });
  });

  describe('setSeMuted', () => {
    it('true を渡すと seMuted が true になる', () => {
      const { result } = renderHook(() => useAudioSettings());

      act(() => {
        result.current.setSeMuted(true);
      });

      expect(result.current.seMuted).toBe(true);
    });

    it('false を渡すと seMuted が false になる', () => {
      mockAudioManager.getSeMuted.mockReturnValue(true);
      const { result } = renderHook(() => useAudioSettings());

      act(() => {
        result.current.setSeMuted(false);
      });

      expect(result.current.seMuted).toBe(false);
    });

    it('audioManager.setSeMuted を呼び出す', () => {
      const { result } = renderHook(() => useAudioSettings());

      act(() => {
        result.current.setSeMuted(true);
      });

      expect(mockAudioManager.setSeMuted).toHaveBeenCalledWith(true);
    });

    it('audioManager.setSeMuted は正しい値で呼ばれる', () => {
      const { result } = renderHook(() => useAudioSettings());

      act(() => {
        result.current.setSeMuted(false);
      });

      expect(mockAudioManager.setSeMuted).toHaveBeenCalledWith(false);
    });

    it('BGM の状態には影響しない', () => {
      const { result } = renderHook(() => useAudioSettings());
      const initialBgmMuted = result.current.bgmMuted;

      act(() => {
        result.current.setSeMuted(true);
      });

      expect(result.current.bgmMuted).toBe(initialBgmMuted);
    });
  });

  describe('連続操作', () => {
    it('BGM と SE を独立して切り替えられる', () => {
      const { result } = renderHook(() => useAudioSettings());

      act(() => {
        result.current.setBgmMuted(true);
        result.current.setSeMuted(true);
      });

      expect(result.current.bgmMuted).toBe(true);
      expect(result.current.seMuted).toBe(true);
    });

    it('複数回トグルしても正しい値を返す', () => {
      const { result } = renderHook(() => useAudioSettings());

      act(() => { result.current.setBgmMuted(true); });
      act(() => { result.current.setBgmMuted(false); });
      act(() => { result.current.setBgmMuted(true); });

      expect(result.current.bgmMuted).toBe(true);
      expect(mockAudioManager.setBgmMuted).toHaveBeenCalledTimes(3);
    });
  });
});
