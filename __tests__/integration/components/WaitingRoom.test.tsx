import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import WaitingRoom from '../../../src/components/WaitingRoom';
import type { GameSession, ServerPlayer } from '../../../src/online/types';

// ── モック定義 ────────────────────────────────────────────────────────────────

let mockPolledSession: GameSession | null = null;

jest.mock('../../../src/online/usePolling', () => ({
  usePolling: () => ({ session: mockPolledSession, error: null, setSession: jest.fn() }),
}));

jest.mock('../../../src/online/useHeartbeat', () => ({
  useHeartbeat: () => {},
}));

jest.mock('../../../src/online/api', () => ({
  api: {
    leave: jest.fn().mockResolvedValue({}),
    heartbeat: jest.fn().mockResolvedValue({}),
  },
  friendlyError: (e: unknown) => (e instanceof Error ? e.message : 'error'),
}));

jest.mock('../../../src/online/activeGame', () => ({
  saveActiveGame: jest.fn(),
  clearActiveGame: jest.fn(),
}));

jest.mock('../../../src/i18n/index', () => ({
  useLang: () => ({
    t: {
      back: 'Back',
      leave: 'Leave',
      roomCode: 'Room Code',
      startGame: 'Start Game',
      copyRoomCode: 'Copy',
      waitingTitle: 'Waiting',
      waitingDesc: 'desc',
      playersLabel: (n: number, m: number) => `${n}/${m}`,
      youAre: (c: string) => c,
      youLabel: 'you',
      waitingToJoin: 'Waiting to join',
      queuePos: (n: number) => `#${n}`,
      youreNext: "You're next",
      willJoinAuto: 'You will join automatically',
      joinBtn: 'Join',
      enterCode: 'Enter code',
      joinRoom: 'Join Room',
      scanQR: 'Scan QR',
      joiningRoom: 'Joining...',
      spectating: 'Spectating',
    },
  }),
}));

// ── ヘルパー ─────────────────────────────────────────────────────────────────

function makePlayer(clientId: string, color: 'RED' | 'BLUE' | 'YELLOW' | 'GREEN'): ServerPlayer {
  return {
    clientId,
    color,
    lastActiveAt: new Date().toISOString(),
    isHuman: true,
  };
}

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

describe('WaitingRoom', () => {
  beforeEach(() => {
    mockPolledSession = null;
    jest.clearAllMocks();
  });

  it('waiting-room が表示される', () => {
    const session = makeSession();
    const { getByTestId } = render(
      <WaitingRoom
        gameId="g1"
        clientId="client-1"
        session={session}
        onGameStart={jest.fn()}
        onLeave={jest.fn()}
      />,
    );
    expect(getByTestId('waiting-room')).toBeTruthy();
  });

  it('ルームコードが表示される', () => {
    const session = makeSession({ roomCode: 'ABC123' });
    const { getByText } = render(
      <WaitingRoom
        gameId="g1"
        clientId="client-1"
        session={session}
        onGameStart={jest.fn()}
        onLeave={jest.fn()}
      />,
    );
    expect(getByText('ABC123')).toBeTruthy();
  });

  it('セッションのプレイヤーリストが表示される', () => {
    const session = makeSession({
      players: [
        makePlayer('client-1', 'RED'),
        makePlayer('client-2', 'BLUE'),
      ],
    });
    const { getAllByText } = render(
      <WaitingRoom
        gameId="g1"
        clientId="client-1"
        session={session}
        onGameStart={jest.fn()}
        onLeave={jest.fn()}
      />,
    );
    // RED はプレイヤー名と youAre テキストで複数表示される場合があるので getAllByText を使用
    expect(getAllByText(/RED/).length).toBeGreaterThan(0);
    expect(getAllByText(/BLUE/).length).toBeGreaterThan(0);
  });

  it('leave ボタンを押すと onLeave が呼ばれる', () => {
    const onLeave = jest.fn();
    const session = makeSession();
    const { getByTestId } = render(
      <WaitingRoom
        gameId="g1"
        clientId="client-1"
        session={session}
        onGameStart={jest.fn()}
        onLeave={onLeave}
      />,
    );
    fireEvent.press(getByTestId('leave-btn'));
    expect(onLeave).toHaveBeenCalledTimes(1);
  });

  it('leave ボタンを押すと api.leave が呼ばれる', () => {
    const { api } = require('../../../src/online/api');
    const session = makeSession();
    const { getByTestId } = render(
      <WaitingRoom
        gameId="g1"
        clientId="client-1"
        session={session}
        onGameStart={jest.fn()}
        onLeave={jest.fn()}
      />,
    );
    fireEvent.press(getByTestId('leave-btn'));
    expect(api.leave).toHaveBeenCalledWith('g1', 'client-1');
  });

  it('leave ボタンを押すと clearActiveGame が呼ばれる', () => {
    const { clearActiveGame } = require('../../../src/online/activeGame');
    const session = makeSession();
    const { getByTestId } = render(
      <WaitingRoom
        gameId="g1"
        clientId="client-1"
        session={session}
        onGameStart={jest.fn()}
        onLeave={jest.fn()}
      />,
    );
    fireEvent.press(getByTestId('leave-btn'));
    expect(clearActiveGame).toHaveBeenCalledTimes(1);
  });

  it('ポーリングで status が PLAYING になると onGameStart が呼ばれる', async () => {
    const onGameStart = jest.fn();
    const initialSession = makeSession();
    const playingSession = makeSession({ status: 'PLAYING' });

    const { rerender } = render(
      <WaitingRoom
        gameId="g1"
        clientId="client-1"
        session={initialSession}
        onGameStart={onGameStart}
        onLeave={jest.fn()}
      />,
    );

    // ポーリングセッションを PLAYING に更新してコンポーネントを再レンダー
    mockPolledSession = playingSession;
    await act(async () => {
      rerender(
        <WaitingRoom
          gameId="g1"
          clientId="client-1"
          session={initialSession}
          onGameStart={onGameStart}
          onLeave={jest.fn()}
        />,
      );
    });

    await waitFor(() => {
      expect(onGameStart).toHaveBeenCalledWith(playingSession);
    });
  });

  it('プレイヤーが0人のときプレイヤーカウントが 0/4 と表示される', () => {
    const session = makeSession({ players: [] });
    const { getByText } = render(
      <WaitingRoom
        gameId="g1"
        clientId="client-1"
        session={session}
        onGameStart={jest.fn()}
        onLeave={jest.fn()}
      />,
    );
    expect(getByText('0/4')).toBeTruthy();
  });

  it('自分のプレイヤーが含まれているとき youAre テキストが表示される', () => {
    const session = makeSession({
      players: [makePlayer('client-1', 'RED')],
    });
    const { getByText } = render(
      <WaitingRoom
        gameId="g1"
        clientId="client-1"
        session={session}
        onGameStart={jest.fn()}
        onLeave={jest.fn()}
      />,
    );
    // t.youAre('RED') = 'RED'
    // findAll to handle multiple occurrences
    const elements = render(
      <WaitingRoom
        gameId="g1"
        clientId="client-1"
        session={session}
        onGameStart={jest.fn()}
        onLeave={jest.fn()}
      />,
    ).getAllByText('RED');
    expect(elements.length).toBeGreaterThan(0);
  });
});
