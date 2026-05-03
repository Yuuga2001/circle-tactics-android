import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import HostScreen from '../../../src/components/HostScreen';
import type { GameSession } from '../../../src/online/types';

// ── モック定義 ────────────────────────────────────────────────────────────────

let mockPolledSession: GameSession | null = null;

jest.mock('../../../src/online/usePolling', () => ({
  usePolling: () => ({ session: mockPolledSession, error: null, setSession: jest.fn() }),
}));

jest.mock('../../../src/online/useHeartbeat', () => ({
  useHeartbeat: () => {},
}));

const mockCreateGame = jest.fn();
const mockStart = jest.fn();

jest.mock('../../../src/online/api', () => ({
  api: {
    createGame: (...args: unknown[]) => mockCreateGame(...args),
    start: (...args: unknown[]) => mockStart(...args),
    heartbeat: jest.fn().mockResolvedValue({}),
    leave: jest.fn().mockResolvedValue({}),
  },
  friendlyError: (e: unknown) => (e instanceof Error ? e.message : 'error'),
}));

jest.mock('../../../src/online/activeGame', () => ({
  saveActiveGame: jest.fn(),
  clearActiveGame: jest.fn(),
}));

jest.mock('expo-clipboard', () => ({ setStringAsync: jest.fn() }));
jest.mock('react-native-qrcode-svg', () => ({ __esModule: true, default: () => null }));

jest.mock('../../../src/i18n/index', () => ({
  useLang: () => ({
    t: {
      back: 'Back',
      cancel: 'Cancel',
      leave: 'Leave',
      roomCode: 'Room Code',
      startGame: 'Start Game',
      copyRoomCode: 'Copy',
      waitingTitle: 'Waiting',
      waitingDesc: 'desc',
      playersLabel: (n: number, m: number) => `${n}/${m}`,
      playersInRoom: (n: number, m: number) => `${n}/${m}`,
      youAre: (c: string) => c,
      waitingToJoin: 'Waiting to join',
      hostingRoom: 'Hosting',
      shareCode: 'Share code',
      hostLabel: 'host',
      copied: 'Copied',
      starting: 'Starting...',
      aiSeats: (n: number) => `AI: ${n}`,
    },
  }),
}));

// ── ヘルパー ─────────────────────────────────────────────────────────────────

function makeSession(overrides: Partial<GameSession> = {}): GameSession {
  return {
    gameId: 'g1',
    roomCode: 'ABC123',
    status: 'WAITING',
    hostClientId: 'client-1',
    players: [],
    humanCount: 0,
    selectedSize: null,
    currentPlayer: 'RED',
    turnOrder: ['RED', 'BLUE', 'YELLOW', 'GREEN'],
    board: Array(4).fill(null).map(() =>
      Array(4).fill(null).map(() => [null, null, null] as [null, null, null])
    ) as GameSession['board'],
    hands: {
      RED: { SMALL: 5, MEDIUM: 5, LARGE: 5 },
      BLUE: { SMALL: 5, MEDIUM: 5, LARGE: 5 },
      YELLOW: { SMALL: 5, MEDIUM: 5, LARGE: 5 },
      GREEN: { SMALL: 5, MEDIUM: 5, LARGE: 5 },
    },
    winner: null,
    winInfo: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    startedAt: null,
    currentTurnStartedAt: null,
    waitQueue: [],
    version: 1,
    ...overrides,
  };
}

// ── テスト ───────────────────────────────────────────────────────────────────

describe('HostScreen', () => {
  beforeEach(() => {
    mockPolledSession = null;
    jest.clearAllMocks();
    mockCreateGame.mockResolvedValue({
      gameId: 'g1',
      roomCode: 'ABC123',
      you: { clientId: 'client-1', color: 'RED' },
    });
    mockStart.mockResolvedValue(makeSession({ status: 'PLAYING' }));
  });

  it('host-screen が表示される', async () => {
    const { getByTestId } = render(
      <HostScreen
        gameId=""
        clientId="client-1"
        onGameStart={jest.fn()}
        onBack={jest.fn()}
      />,
    );
    expect(getByTestId('host-screen')).toBeTruthy();
  });

  it('マウント時に api.createGame が呼ばれる', async () => {
    render(
      <HostScreen
        gameId=""
        clientId="client-1"
        onGameStart={jest.fn()}
        onBack={jest.fn()}
      />,
    );
    await act(async () => {});
    expect(mockCreateGame).toHaveBeenCalledWith('client-1');
  });

  it('gameId が渡されているとき api.createGame が呼ばれない', async () => {
    render(
      <HostScreen
        gameId="existing-game"
        clientId="client-1"
        onGameStart={jest.fn()}
        onBack={jest.fn()}
      />,
    );
    await act(async () => {});
    expect(mockCreateGame).not.toHaveBeenCalled();
  });

  it('ルームコードが作成後に表示される', async () => {
    const { getByTestId } = render(
      <HostScreen
        gameId=""
        clientId="client-1"
        onGameStart={jest.fn()}
        onBack={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(getByTestId('room-code-text')).toBeTruthy();
    });

    await waitFor(() => {
      const codeText = getByTestId('room-code-text');
      expect(codeText.props.children).toBe('ABC123');
    });
  });

  it('back/cancel ボタンを押すと onBack が呼ばれる', async () => {
    const onBack = jest.fn();
    const { getByText } = render(
      <HostScreen
        gameId=""
        clientId="client-1"
        onGameStart={jest.fn()}
        onBack={onBack}
      />,
    );

    await act(async () => {});

    fireEvent.press(getByText('Cancel'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('start-game-btn を押すと api.start が呼ばれる', async () => {
    const { getByTestId } = render(
      <HostScreen
        gameId=""
        clientId="client-1"
        onGameStart={jest.fn()}
        onBack={jest.fn()}
      />,
    );

    // createGame の完了を待つ
    await act(async () => {});

    await act(async () => {
      fireEvent.press(getByTestId('start-game-btn'));
    });

    expect(mockStart).toHaveBeenCalledWith('g1', 'client-1', expect.any(Number));
  });

  it('start-game-btn を押すと onGameStart が呼ばれる', async () => {
    const onGameStart = jest.fn();
    const playingSession = makeSession({ status: 'PLAYING' });
    mockStart.mockResolvedValue(playingSession);

    const { getByTestId } = render(
      <HostScreen
        gameId=""
        clientId="client-1"
        onGameStart={onGameStart}
        onBack={jest.fn()}
      />,
    );

    await act(async () => {});

    await act(async () => {
      fireEvent.press(getByTestId('start-game-btn'));
    });

    expect(onGameStart).toHaveBeenCalledWith(playingSession);
  });

  it('ポーリングで status が PLAYING になると onGameStart が呼ばれる', async () => {
    const onGameStart = jest.fn();
    const playingSession = makeSession({ status: 'PLAYING' });

    const { rerender } = render(
      <HostScreen
        gameId=""
        clientId="client-1"
        onGameStart={onGameStart}
        onBack={jest.fn()}
      />,
    );

    await act(async () => {});

    mockPolledSession = playingSession;
    await act(async () => {
      rerender(
        <HostScreen
          gameId=""
          clientId="client-1"
          onGameStart={onGameStart}
          onBack={jest.fn()}
        />,
      );
    });

    await waitFor(() => {
      expect(onGameStart).toHaveBeenCalledWith(playingSession);
    });
  });

  it('api.createGame が失敗するとエラーメッセージが表示される', async () => {
    mockCreateGame.mockRejectedValue(new Error('Network error'));

    const { findByText } = render(
      <HostScreen
        gameId=""
        clientId="client-1"
        onGameStart={jest.fn()}
        onBack={jest.fn()}
      />,
    );

    expect(await findByText('Network error')).toBeTruthy();
  });

  it('copy-code-btn を押すとクリップボードにコピーされる', async () => {
    const { Clipboard } = require('expo-clipboard');
    const { getByTestId } = render(
      <HostScreen
        gameId=""
        clientId="client-1"
        onGameStart={jest.fn()}
        onBack={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(getByTestId('copy-code-btn')).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(getByTestId('copy-code-btn'));
    });

    const { setStringAsync } = require('expo-clipboard');
    expect(setStringAsync).toHaveBeenCalledWith('ABC123');
  });

  it('プレイヤーが少ないとき AI シート数が表示される', async () => {
    mockPolledSession = makeSession({ status: 'WAITING', players: [
      { clientId: 'client-1', color: 'RED', lastActiveAt: new Date().toISOString(), isHuman: true },
    ] });

    const { getByText } = render(
      <HostScreen
        gameId="existing-game"
        clientId="client-1"
        onGameStart={jest.fn()}
        onBack={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(getByText('AI: 3')).toBeTruthy();
    });
  });

  it('api.start が失敗するとエラーが表示される', async () => {
    mockStart.mockRejectedValue(new Error('Start failed'));

    const { getByTestId, findByText } = render(
      <HostScreen
        gameId=""
        clientId="client-1"
        onGameStart={jest.fn()}
        onBack={jest.fn()}
      />,
    );

    await act(async () => {});

    await act(async () => {
      fireEvent.press(getByTestId('start-game-btn'));
    });

    expect(await findByText('Start failed')).toBeTruthy();
  });
});

// ── waitQueue テスト ─────────────────────────────────────────────────────────
// spectatorsLabel が必要なため useLang をスパイして上書きする

describe('HostScreen / waitQueue', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const i18nModule = require('../../../src/i18n/index');

  beforeEach(() => {
    mockPolledSession = null;
    jest.clearAllMocks();
    mockCreateGame.mockResolvedValue({
      gameId: 'g1',
      roomCode: 'ABC123',
      you: { clientId: 'client-1', color: 'RED' },
    });
    mockStart.mockResolvedValue(makeSession({ status: 'PLAYING' }));
    jest.spyOn(i18nModule, 'useLang').mockReturnValue({
      t: {
        back: 'Back',
        cancel: 'Cancel',
        leave: 'Leave',
        roomCode: 'Room Code',
        startGame: 'Start Game',
        copyRoomCode: 'Copy',
        waitingTitle: 'Waiting',
        waitingDesc: 'desc',
        playersLabel: (n: number, m: number) => `${n}/${m}`,
        playersInRoom: (n: number, m: number) => `${n}/${m}`,
        youAre: (c: string) => c,
        waitingToJoin: 'Waiting to join',
        hostingRoom: 'Hosting',
        shareCode: 'Share code',
        hostLabel: 'host',
        copied: 'Copied',
        starting: 'Starting...',
        aiSeats: (n: number) => `AI: ${n}`,
        spectatorsLabel: (n: number) => `Spectators (${n})`,
      },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('waitQueue が空のとき観戦者セクションは表示されない', async () => {
    mockPolledSession = makeSession({ status: 'WAITING', waitQueue: [] });
    const { queryByText } = render(
      <HostScreen
        gameId="existing-game"
        clientId="client-1"
        onGameStart={jest.fn()}
        onBack={jest.fn()}
      />,
    );
    await act(async () => {});
    expect(queryByText(/Spectators/)).toBeNull();
  });

  it('waitQueue に 1 人いるとき "#1" が表示される', async () => {
    mockPolledSession = makeSession({ status: 'WAITING', waitQueue: ['client-99'] });
    const { getByText } = render(
      <HostScreen
        gameId="existing-game"
        clientId="client-1"
        onGameStart={jest.fn()}
        onBack={jest.fn()}
      />,
    );
    await waitFor(() => {
      expect(getByText('#1')).toBeTruthy();
    });
  });
});
