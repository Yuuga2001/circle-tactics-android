import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import SpectatorView from '../../../src/components/SpectatorView';
import { GameSession, ServerPlayer } from '../../../src/online/types';

// ── モック定義 ────────────────────────────────────────────────────────────────

let mockPolledSession: GameSession | null = null;

jest.mock('../../../src/online/usePolling', () => ({
  usePolling: () => ({ session: mockPolledSession, error: null, setSession: jest.fn() }),
}));

jest.mock('../../../src/online/activeGame', () => ({
  setLiveRoomCode: jest.fn(),
  setLivePlayerCount: jest.fn(),
}));

jest.mock('../../../src/i18n/index', () => ({
  useLang: () => ({
    t: {
      back: 'Back',
      leave: 'Leave',
      waitingToJoin: 'Waiting to join',
      queuePos: (n: number) => `#${n}`,
      youreNext: "You're next",
      willJoinAuto: 'Will join auto',
      joiningLabel: 'Joining...',
      loading: 'Loading...',
      playerWins: (p: string) => `${p} WINS!`,
      playerLabel: 'Player',
      turnPlayer: (p: string) => `Turn: ${p}`,
      aiThinking: (p: string) => `${p} thinking...`,
    },
  }),
}));

jest.mock('../../../src/components/Board', () => ({
  __esModule: true,
  default: () => {
    const { View } = require('react-native');
    return <View testID="mock-board" />;
  },
}));

jest.mock('../../../src/components/HandsSummary', () => ({
  __esModule: true,
  default: () => {
    const { View } = require('react-native');
    return <View testID="mock-hands-summary" />;
  },
}));

// ── ヘルパー ─────────────────────────────────────────────────────────────────

function makePlayer(clientId: string, color: 'RED' | 'BLUE' | 'YELLOW' | 'GREEN', isHuman = true): ServerPlayer {
  return { clientId, color, lastActiveAt: new Date().toISOString(), isHuman };
}

function makeSession(overrides: Partial<GameSession> = {}): GameSession {
  return {
    gameId: 'g1',
    roomCode: 'ABC123',
    status: 'PLAYING',
    hostClientId: 'client-host',
    players: [
      makePlayer('client-host', 'RED'),
      makePlayer('client-2', 'BLUE'),
    ],
    humanCount: 2,
    selectedSize: null,
    currentPlayer: 'RED',
    turnOrder: ['RED', 'BLUE', 'YELLOW', 'GREEN'],
    board: Array(4).fill(null).map(() =>
      Array(4).fill(null).map(() => [null, null, null] as [null, null, null])
    ) as GameSession['board'],
    hands: {
      RED: { SMALL: 4, MEDIUM: 4, LARGE: 4 },
      BLUE: { SMALL: 4, MEDIUM: 4, LARGE: 4 },
      YELLOW: { SMALL: 4, MEDIUM: 4, LARGE: 4 },
      GREEN: { SMALL: 4, MEDIUM: 4, LARGE: 4 },
    },
    winner: null,
    winInfo: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    startedAt: new Date().toISOString(),
    currentTurnStartedAt: null,
    waitQueue: [],
    version: 1,
    ...overrides,
  };
}

// ── テスト ───────────────────────────────────────────────────────────────────

describe('SpectatorView', () => {
  beforeEach(() => {
    mockPolledSession = null;
    jest.clearAllMocks();
  });

  it('spectator-view が表示される', () => {
    const { getByTestId } = render(
      <SpectatorView gameId="g1" clientId="spectator-1" session={makeSession()} onJoined={jest.fn()} onLeave={jest.fn()} />,
    );
    expect(getByTestId('spectator-view')).toBeTruthy();
  });

  it('ボードがスペクテーターモードで表示される', () => {
    const { getByTestId } = render(
      <SpectatorView gameId="g1" clientId="spectator-1" session={makeSession()} onJoined={jest.fn()} onLeave={jest.fn()} />,
    );
    expect(getByTestId('mock-board')).toBeTruthy();
  });

  it('HandsSummary が表示される', () => {
    const { getByTestId } = render(
      <SpectatorView gameId="g1" clientId="spectator-1" session={makeSession()} onJoined={jest.fn()} onLeave={jest.fn()} />,
    );
    expect(getByTestId('mock-hands-summary')).toBeTruthy();
  });

  it('waitQueue に clientId があるときキュー位置テキストが表示される', () => {
    const session = makeSession({ waitQueue: ['spectator-1'] });
    const { getByText } = render(
      <SpectatorView gameId="g1" clientId="spectator-1" session={session} onJoined={jest.fn()} onLeave={jest.fn()} />,
    );
    expect(getByText('#1', { exact: false })).toBeTruthy();
  });

  it('キュー位置 1 のとき youreNext テキストが表示される', () => {
    const session = makeSession({ waitQueue: ['spectator-1'] });
    const { getByText } = render(
      <SpectatorView gameId="g1" clientId="spectator-1" session={session} onJoined={jest.fn()} onLeave={jest.fn()} />,
    );
    expect(getByText("You're next", { exact: false })).toBeTruthy();
  });

  it('キュー位置が 2 以上のとき willJoinAuto テキストが表示される', () => {
    const session = makeSession({ waitQueue: ['other-client', 'spectator-1'] });
    const { getByText } = render(
      <SpectatorView gameId="g1" clientId="spectator-1" session={session} onJoined={jest.fn()} onLeave={jest.fn()} />,
    );
    expect(getByText('Will join auto', { exact: false })).toBeTruthy();
  });

  it('waitQueue に clientId がないとき Joining テキストが表示される', () => {
    const session = makeSession({ waitQueue: [] });
    const { getByText } = render(
      <SpectatorView gameId="g1" clientId="spectator-1" session={session} onJoined={jest.fn()} onLeave={jest.fn()} />,
    );
    expect(getByText('Joining...')).toBeTruthy();
  });

  it('ポーリングで clientId が players に現れると onJoined が呼ばれる', async () => {
    const onJoined = jest.fn();
    const initialSession = makeSession();
    const promotedSession = makeSession({
      players: [
        makePlayer('client-host', 'RED'),
        makePlayer('client-2', 'BLUE'),
        makePlayer('spectator-1', 'YELLOW'),
      ],
    });

    const { rerender } = render(
      <SpectatorView gameId="g1" clientId="spectator-1" session={initialSession} onJoined={onJoined} onLeave={jest.fn()} />,
    );

    mockPolledSession = promotedSession;
    await act(async () => {
      rerender(
        <SpectatorView gameId="g1" clientId="spectator-1" session={initialSession} onJoined={onJoined} onLeave={jest.fn()} />,
      );
    });

    await waitFor(() => {
      expect(onJoined).toHaveBeenCalledTimes(1);
    });
  });

  it('winner がいるとき勝利テキストが表示される', () => {
    const session = makeSession({ winner: 'RED', status: 'FINISHED' });
    const { getByText } = render(
      <SpectatorView gameId="g1" clientId="spectator-1" session={session} onJoined={jest.fn()} onLeave={jest.fn()} />,
    );
    expect(getByText('Player RED WINS!')).toBeTruthy();
  });

  it('マウント時に setLiveRoomCode がルームコードで呼ばれる', () => {
    const { setLiveRoomCode } = require('../../../src/online/activeGame');
    const session = makeSession({ roomCode: 'XYZ999' });
    render(
      <SpectatorView gameId="g1" clientId="spectator-1" session={session} onJoined={jest.fn()} onLeave={jest.fn()} />,
    );
    expect(setLiveRoomCode).toHaveBeenCalledWith('XYZ999');
  });

  it('マウント時に setLivePlayerCount がプレイヤー数で呼ばれる', () => {
    const { setLivePlayerCount } = require('../../../src/online/activeGame');
    const session = makeSession({ waitQueue: ['spectator-1'] });
    render(
      <SpectatorView gameId="g1" clientId="spectator-1" session={session} onJoined={jest.fn()} onLeave={jest.fn()} />,
    );
    // players 2人 + waitQueue 1人 = 3
    expect(setLivePlayerCount).toHaveBeenCalledWith(3);
  });
});
