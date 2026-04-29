import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppChrome from '../../../src/components/AppChrome';

const TEST_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

function renderWithSafeArea(ui: React.ReactElement) {
  return render(<SafeAreaProvider initialMetrics={TEST_METRICS}>{ui}</SafeAreaProvider>);
}

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
    replace: mockReplace,
    back: jest.fn(),
  }),
  useSegments: jest.fn().mockReturnValue([]),
}));

jest.mock('../../../src/online/api', () => ({
  api: {
    leave: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock('../../../src/online/activeGame', () => ({
  clearActiveGame: jest.fn().mockResolvedValue(undefined),
  useLiveRoomCode: jest.fn().mockReturnValue(null),
  setLiveRoomCode: jest.fn(),
  useLivePlayerCount: jest.fn().mockReturnValue(null),
  setLivePlayerCount: jest.fn(),
}));

jest.mock('../../../src/online/clientId', () => ({
  getClientId: jest.fn().mockResolvedValue('client-123'),
}));

jest.mock('../../../src/i18n/index', () => ({
  useLang: () => ({
    lang: 'en',
    isAuto: true,
    setLang: jest.fn(),
    setAuto: jest.fn(),
    t: {
      bgmLabel: 'BGM',
      seLabel: 'SE',
      soundOn: 'ON',
      soundOff: 'OFF',
      menuLabel: 'Menu',
      titleBtn: 'Back to Title',
      leaveOnline: 'Leave',
      newGame: 'New Game',
      confirmLeave: 'Leave and return to title?',
      confirmLeaveOnline: 'Leave the room and return to title?',
      cancel: 'Cancel',
      ok: 'OK',
    },
  }),
  LANGUAGES: {
    en: 'English',
    ja: '日本語',
  },
  LangProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../../../src/audio/audioManager', () => ({
  audioManager: {
    play: jest.fn(),
    startBGM: jest.fn(),
    stopBGM: jest.fn(),
    getBgmMuted: jest.fn().mockReturnValue(false),
    getSeMuted: jest.fn().mockReturnValue(false),
    setBgmMuted: jest.fn(),
    setSeMuted: jest.fn(),
  },
}));

describe('AppChrome', () => {
  const { useSegments } = require('expo-router');

  beforeEach(() => {
    jest.clearAllMocks();
    useSegments.mockReturnValue([]);
  });

  it('タイトル画面では CircleTactics テキストが表示される', () => {
    const { getByText } = renderWithSafeArea(<AppChrome />);
    expect(getByText('CircleTactics')).toBeTruthy();
  });

  it('segments が空（タイトル画面）でも MenuButton は常時表示される', () => {
    useSegments.mockReturnValue([]);
    const { getByTestId } = renderWithSafeArea(<AppChrome />);
    expect(getByTestId('menu-fab-btn')).toBeTruthy();
  });

  it('segments が ["local"] のとき MenuButton が表示される', () => {
    useSegments.mockReturnValue(['local']);
    const { getByTestId } = renderWithSafeArea(<AppChrome />);
    expect(getByTestId('menu-fab-btn')).toBeTruthy();
  });

  it('segments が ["online", "playing"] のとき MenuButton が表示される', () => {
    useSegments.mockReturnValue(['online', 'playing']);
    const { getByTestId } = renderWithSafeArea(<AppChrome />);
    expect(getByTestId('menu-fab-btn')).toBeTruthy();
  });

  it('segments が ["settings"] のとき mode=other で MenuButton が表示される', () => {
    useSegments.mockReturnValue(['settings']);
    const { getByTestId } = renderWithSafeArea(<AppChrome />);
    expect(getByTestId('menu-fab-btn')).toBeTruthy();
  });

  it('segments が ["index"] のとき MenuButton は常時表示される', () => {
    useSegments.mockReturnValue(['index']);
    const { getByTestId } = renderWithSafeArea(<AppChrome />);
    expect(getByTestId('menu-fab-btn')).toBeTruthy();
  });

  it('プレイ中（local）は左側にアプリタイトルが表示される', () => {
    useSegments.mockReturnValue(['local']);
    const { getByText, queryByText } = renderWithSafeArea(<AppChrome />);
    expect(getByText('CircleTactics')).toBeTruthy();
    expect(queryByText('Language')).toBeNull();
  });

  it('タイトル画面では左側に CircleTactics タイトルが表示される', () => {
    useSegments.mockReturnValue([]);
    const { getByText, queryByText } = renderWithSafeArea(<AppChrome />);
    expect(getByText('CircleTactics')).toBeTruthy();
    expect(queryByText('Language')).toBeNull();
  });

  it('online/playing モードで Leave → OK で clearActiveGame と router.replace が呼ばれる', async () => {
    const { clearActiveGame } = require('../../../src/online/activeGame');
    const { useRouter } = require('expo-router');
    const mockRouterReplace = jest.fn();
    useRouter.mockReturnValue({ push: jest.fn(), replace: mockRouterReplace, back: jest.fn() });
    useSegments.mockReturnValue(['online', 'playing']);
    const { getByTestId, getByText } = renderWithSafeArea(<AppChrome />);
    fireEvent.press(getByTestId('menu-fab-btn'));
    fireEvent.press(getByText('Leave'));
    fireEvent.press(getByText('OK'));
    await waitFor(() => {
      expect(clearActiveGame).toHaveBeenCalled();
    });
    expect(mockRouterReplace).toHaveBeenCalledWith('/');
  });
});
