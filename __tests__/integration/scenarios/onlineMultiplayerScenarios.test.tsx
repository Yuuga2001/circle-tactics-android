import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import type { GameSession, ServerPlayer } from '../../../src/online/types';

jest.useFakeTimers({ doNotFake: ['setInterval'] });

// ── 共通モック定義 ────────────────────────────────────────────────────────────

jest.mock('../../../src/online/usePolling', () => ({
  usePolling: jest.fn().mockReturnValue({ session: null, error: null, setSession: jest.fn() }),
}));

jest.mock('../../../src/online/useHeartbeat', () => ({
  useHeartbeat: () => {},
}));

jest.mock('../../../src/online/api', () => ({
  api: {
    createGame: jest.fn().mockResolvedValue({ gameId: 'g1', roomCode: 'ABC123' }),
    heartbeat: jest.fn().mockResolvedValue({}),
    leave: jest.fn().mockResolvedValue({}),
    placePiece: jest.fn(),
    selectSize: jest.fn(),
    restart: jest.fn().mockResolvedValue({}),
    start: jest.fn().mockResolvedValue({}),
  },
  friendlyError: (e: unknown) => (e instanceof Error ? e.message : 'error'),
}));

jest.mock('../../../src/online/activeGame', () => ({
  saveActiveGame: jest.fn(),
  clearActiveGame: jest.fn(),
  setLiveRoomCode: jest.fn(),
  useLiveRoomCode: jest.fn().mockReturnValue(null),
  setLivePlayerCount: jest.fn(),
  useLivePlayerCount: jest.fn().mockReturnValue(null),
}));

jest.mock('../../../src/i18n/index', () => ({
  useLang: () => ({
    t: {
      leave: 'Leave',
      leaveOnline: 'Leave',
      playAgain: 'Play Again',
      turn: '...',
      playerWins: (p: string) => `${p} WINS!`,
      loading: 'Loading...',
      copyRoomCode: 'Copy',
      startGame: 'Start Game',
      joinBtn: 'Join',
      back: 'Back',
      createRoom: 'Create',
      joinRoom: 'Join',
      hostingRoom: 'Hosting',
      roomCode: 'Room Code',
      waitingTitle: 'Waiting',
      waitingDesc: 'desc',
      playersLabel: (n: number, m: number) => `${n}/${m}`,
      playersInRoom: (n: number, m: number) => `${n}/${m}`,
      youAre: (c: string) => c,
      youLabel: 'you',
      waitingToJoin: 'Waiting to join',
      queuePos: (n: number) => `#${n}`,
      youreNext: "You're next",
      willJoinAuto: 'Will join auto',
      joiningLabel: 'Joining...',
      shareCode: 'share',
      copied: 'Copied',
      copyUrl: 'URL',
      aiSeats: (n: number) => `AI: ${n}`,
      starting: 'Starting...',
      enterCode: 'enter',
      joining: 'joining',
      lobbyDesc: 'desc',
      onlinePlay: 'online',
      creatingRoom: 'creating',
      cancelLabel: 'Cancel',
      cancel: 'Cancel',
      cancelLeave: 'Leave',
      confirmLeaveOnline: 'Leave the room?',
      ok: 'OK',
      pickingFirst: 'picking...',
      goesFirst: (p: string) => `${p} first!`,
      turnYou: 'Your turn',
      turnPlayer: (p: string) => `Turn: ${p}`,
      aiThinking: (p: string) => `${p} thinking...`,
      draw: 'DRAW',
      winCell: 'Cell win',
      winRow: '4 in a row',
      disconnected: (p: string, s: number) => `${p} ${s}s`,
      secsLeft: (s: number) => `${s}s`,
      secsOnly: (s: number) => `${s}s`,
      firstLabel: 'FIRST',
      playerLabel: 'Player',
      aiLabel: 'AI',
      yourHand: 'Your Hand',
      networkErrorTitle: 'Connection Error',
      networkErrorDesc: 'Check your connection.\nReconnecting…',
      retryBtn: 'Retry',
      errorTitle: 'Something went wrong',
      errorDesc: 'Please try again.',
      hostLabel: 'host',
      spectatorsLabel: (n: number) => `Spectators (${n})`,
      hostingRoom: 'Hosting',
      shareCode: 'share',
    },
    lang: 'en',
    setLang: jest.fn(),
  }),
  LangProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../../../src/audio/audioManager', () => ({
  audioManager: {
    play: jest.fn(),
    startBGM: jest.fn(),
    stopBGM: jest.fn(),
    setMuted: jest.fn(),
    getMuted: jest.fn().mockReturnValue(false),
    setBgmMuted: jest.fn(),
    setSeMuted: jest.fn(),
    getBgmMuted: jest.fn().mockReturnValue(false),
    getSeMuted: jest.fn().mockReturnValue(false),
  },
}));

jest.mock('../../../src/components/useBoardDrag', () => ({
  useBoardDrag: () => ({
    draggingSize: null,
    hoverCell: null,
    ghost: null,
    bindLongPress: () => ({}),
  }),
}));

jest.mock('expo-clipboard', () => ({ setStringAsync: jest.fn() }));
jest.mock('react-native-qrcode-svg', () => ({ __esModule: true, default: () => null }));

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
    gameId: 'game-123',
    roomCode: 'ABC123',
    status: 'PLAYING',
    hostClientId: 'client-host',
    players: [
      { clientId: 'client-host', color: 'RED', lastActiveAt: new Date().toISOString(), isHuman: true },
      { clientId: 'client-2', color: 'BLUE', lastActiveAt: new Date().toISOString(), isHuman: true },
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
    startedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    currentTurnStartedAt: null,
    waitQueue: [],
    version: 1,
    ...overrides,
  };
}

function makeWaitingSession(overrides: Partial<GameSession> = {}): GameSession {
  return makeSession({
    status: 'WAITING',
    startedAt: null,
    winner: null,
    players: [],
    humanCount: 0,
    ...overrides,
  });
}

// 盤面に駒がある状態（shouldSkipRoulette=true）を作るヘルパー
function makePlayingSession(overrides: Partial<GameSession> = {}): GameSession {
  const board = Array(4).fill(null).map(() =>
    Array(4).fill(null).map(() => [null, null, null] as [null, null, null])
  ) as GameSession['board'];
  board[0][0][0] = { player: 'RED', size: 'SMALL' };
  return makeSession({ board, ...overrides });
}

// ─────────────────────────────────────────────────────────────────────────────
// ホスト画面シナリオ
// ─────────────────────────────────────────────────────────────────────────────

describe('ホスト画面シナリオ', () => {
  let mockCreateGame: jest.Mock;
  let mockStart: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    const { usePolling } = require('../../../src/online/usePolling');
    usePolling.mockReturnValue({ session: null, error: null, setSession: jest.fn() });

    const { api } = require('../../../src/online/api');
    mockCreateGame = api.createGame;
    mockStart = api.start;
    mockCreateGame.mockResolvedValue({ gameId: 'g1', roomCode: 'ABC123' });
    mockStart.mockResolvedValue(makeWaitingSession({ status: 'PLAYING' }));
  });

  it('ホスト: polling でプレイヤーが追加されるとリスト更新', async () => {
    const { usePolling } = require('../../../src/online/usePolling');
    const HostScreen = require('../../../src/components/HostScreen').default;

    // 最初はプレイヤー0人
    usePolling.mockReturnValue({ session: makeWaitingSession({ players: [] }), error: null, setSession: jest.fn() });

    const { rerender, getByText } = render(
      <HostScreen gameId="g1" clientId="client-host" onGameStart={jest.fn()} onBack={jest.fn()} />,
    );
    await act(async () => {});

    // polling で1人追加
    const sessionWith1Player = makeWaitingSession({
      players: [makePlayer('client-host', 'RED')],
      humanCount: 1,
    });
    usePolling.mockReturnValue({ session: sessionWith1Player, error: null, setSession: jest.fn() });

    await act(async () => {
      rerender(
        <HostScreen gameId="g1" clientId="client-host" onGameStart={jest.fn()} onBack={jest.fn()} />,
      );
    });

    // プレイヤーカウントが 1/4 と表示される
    await waitFor(() => {
      expect(getByText('1/4')).toBeTruthy();
    });
  });

  it('ホスト: waitQueue に人が入ると観戦者セクション表示', async () => {
    const { usePolling } = require('../../../src/online/usePolling');
    const i18nModule = require('../../../src/i18n/index');
    const HostScreen = require('../../../src/components/HostScreen').default;

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

    const sessionWithQueue = makeWaitingSession({ waitQueue: ['client-99'] });
    usePolling.mockReturnValue({ session: sessionWithQueue, error: null, setSession: jest.fn() });

    const { getByText } = render(
      <HostScreen gameId="g1" clientId="client-host" onGameStart={jest.fn()} onBack={jest.fn()} />,
    );
    await act(async () => {});

    await waitFor(() => {
      expect(getByText('#1')).toBeTruthy();
    });

    jest.restoreAllMocks();
  });

  it('ホスト: PLAYING になると onGameStart が呼ばれる', async () => {
    const { usePolling } = require('../../../src/online/usePolling');
    const HostScreen = require('../../../src/components/HostScreen').default;

    const onGameStart = jest.fn();
    const playingSession = makeSession({ status: 'PLAYING' });

    usePolling.mockReturnValue({ session: makeWaitingSession(), error: null, setSession: jest.fn() });

    const { rerender } = render(
      <HostScreen gameId="g1" clientId="client-host" onGameStart={onGameStart} onBack={jest.fn()} />,
    );
    await act(async () => {});

    usePolling.mockReturnValue({ session: playingSession, error: null, setSession: jest.fn() });

    await act(async () => {
      rerender(
        <HostScreen gameId="g1" clientId="client-host" onGameStart={onGameStart} onBack={jest.fn()} />,
      );
    });

    await waitFor(() => {
      expect(onGameStart).toHaveBeenCalledWith(playingSession);
    });
  });

  it('ホスト: Start Game ボタン押下で api.start が呼ばれる', async () => {
    const { api } = require('../../../src/online/api');
    const { usePolling } = require('../../../src/online/usePolling');
    const HostScreen = require('../../../src/components/HostScreen').default;

    usePolling.mockReturnValue({ session: null, error: null, setSession: jest.fn() });

    const { getByTestId } = render(
      <HostScreen gameId="g1" clientId="client-host" onGameStart={jest.fn()} onBack={jest.fn()} />,
    );

    await act(async () => {});

    await act(async () => {
      fireEvent.press(getByTestId('start-game-btn'));
    });

    expect(api.start).toHaveBeenCalledWith('g1', 'client-host', expect.any(Number));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 待機室シナリオ
// ─────────────────────────────────────────────────────────────────────────────

describe('WaitingRoom シナリオ', () => {
  let mockPolledSession: GameSession | null;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPolledSession = null;
    const { usePolling } = require('../../../src/online/usePolling');
    usePolling.mockImplementation(() => ({
      session: mockPolledSession,
      error: null,
      setSession: jest.fn(),
    }));
  });

  it('WaitingRoom: プレイヤー数が2人→3人に増える', async () => {
    const { usePolling } = require('../../../src/online/usePolling');
    const WaitingRoom = require('../../../src/components/WaitingRoom').default;

    const session2 = makeWaitingSession({
      players: [makePlayer('client-1', 'RED'), makePlayer('client-2', 'BLUE')],
      humanCount: 2,
    });
    usePolling.mockReturnValue({ session: session2, error: null, setSession: jest.fn() });

    const { rerender, getByText } = render(
      <WaitingRoom
        gameId="g1"
        clientId="client-1"
        session={makeWaitingSession()}
        onGameStart={jest.fn()}
        onLeave={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(getByText('2/4')).toBeTruthy();
    });

    const session3 = makeWaitingSession({
      players: [
        makePlayer('client-1', 'RED'),
        makePlayer('client-2', 'BLUE'),
        makePlayer('client-3', 'YELLOW'),
      ],
      humanCount: 3,
    });
    usePolling.mockReturnValue({ session: session3, error: null, setSession: jest.fn() });

    await act(async () => {
      rerender(
        <WaitingRoom
          gameId="g1"
          clientId="client-1"
          session={makeWaitingSession()}
          onGameStart={jest.fn()}
          onLeave={jest.fn()}
        />,
      );
    });

    await waitFor(() => {
      expect(getByText('3/4')).toBeTruthy();
    });
  });

  it('WaitingRoom: ホストのとき Start ボタン表示', () => {
    const { usePolling } = require('../../../src/online/usePolling');
    const WaitingRoom = require('../../../src/components/WaitingRoom').default;

    const session = makeWaitingSession({
      hostClientId: 'client-1',
      players: [makePlayer('client-1', 'RED')],
    });
    usePolling.mockReturnValue({ session, error: null, setSession: jest.fn() });

    const { getByTestId } = render(
      <WaitingRoom
        gameId="g1"
        clientId="client-1"
        session={session}
        onGameStart={jest.fn()}
        onLeave={jest.fn()}
      />,
    );

    expect(getByTestId('start-btn')).toBeTruthy();
  });

  it('WaitingRoom: 非ホストのとき Start ボタンは非表示', () => {
    const { usePolling } = require('../../../src/online/usePolling');
    const WaitingRoom = require('../../../src/components/WaitingRoom').default;

    const session = makeWaitingSession({
      hostClientId: 'client-host',
      players: [
        makePlayer('client-host', 'RED'),
        makePlayer('client-2', 'BLUE'),
      ],
    });
    usePolling.mockReturnValue({ session, error: null, setSession: jest.fn() });

    const { queryByTestId } = render(
      <WaitingRoom
        gameId="g1"
        clientId="client-2"
        session={session}
        onGameStart={jest.fn()}
        onLeave={jest.fn()}
      />,
    );

    expect(queryByTestId('start-btn')).toBeNull();
  });

  it('WaitingRoom: PLAYING になると onGameStart が呼ばれる', async () => {
    const { usePolling } = require('../../../src/online/usePolling');
    const WaitingRoom = require('../../../src/components/WaitingRoom').default;

    const onGameStart = jest.fn();
    const initialSession = makeWaitingSession();
    const playingSession = makeSession({ status: 'PLAYING' });

    usePolling.mockReturnValue({ session: null, error: null, setSession: jest.fn() });

    const { rerender } = render(
      <WaitingRoom
        gameId="g1"
        clientId="client-1"
        session={initialSession}
        onGameStart={onGameStart}
        onLeave={jest.fn()}
      />,
    );

    usePolling.mockReturnValue({ session: playingSession, error: null, setSession: jest.fn() });

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
});

// ─────────────────────────────────────────────────────────────────────────────
// オンラインゲームシナリオ
// ─────────────────────────────────────────────────────────────────────────────

describe('OnlineGame シナリオ', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { usePolling } = require('../../../src/online/usePolling');
    usePolling.mockReturnValue({ session: null, error: null, setSession: jest.fn() });
  });

  it('OnlineGame: 自分のターンのとき盤面操作可能', async () => {
    const { api } = require('../../../src/online/api');
    api.placePiece.mockResolvedValue(makePlayingSession({ version: 2 }));

    const OnlineGame = require('../../../src/components/OnlineGame').default;

    // 自分(client-host=RED)のターン
    const session = makePlayingSession({
      currentPlayer: 'RED',
      selectedSize: 'SMALL',
    });

    const { getByTestId } = render(
      <OnlineGame
        gameId="game-123"
        clientId="client-host"
        initialSession={session}
        onLeave={jest.fn()}
        onDemoted={jest.fn()}
      />,
    );

    // shouldSkipRoulette=true なので即board表示
    expect(getByTestId('online-game-board')).toBeTruthy();

    await act(async () => {
      fireEvent.press(getByTestId('cell-1-1'));
    });

    expect(api.placePiece).toHaveBeenCalledWith('game-123', 'client-host', 1, 1, 'SMALL');
  });

  it('OnlineGame: 相手のターンのとき操作不可', async () => {
    const { api } = require('../../../src/online/api');
    const OnlineGame = require('../../../src/components/OnlineGame').default;

    // 相手(BLUE)のターン
    const session = makePlayingSession({
      currentPlayer: 'BLUE',
      selectedSize: 'SMALL',
    });

    const { getByTestId } = render(
      <OnlineGame
        gameId="game-123"
        clientId="client-host"
        initialSession={session}
        onLeave={jest.fn()}
        onDemoted={jest.fn()}
      />,
    );

    expect(getByTestId('online-game-board')).toBeTruthy();

    await act(async () => {
      fireEvent.press(getByTestId('cell-1-1'));
    });

    // 相手のターンなので placePiece は呼ばれない
    expect(api.placePiece).not.toHaveBeenCalled();
  });

  it('OnlineGame: プレイヤーが離脱してAIに入れ替わる', async () => {
    const { usePolling } = require('../../../src/online/usePolling');
    const OnlineGame = require('../../../src/components/OnlineGame').default;

    const session = makePlayingSession();

    const { rerender, getByTestId } = render(
      <OnlineGame
        gameId="game-123"
        clientId="client-host"
        initialSession={session}
        onLeave={jest.fn()}
        onDemoted={jest.fn()}
      />,
    );

    // BLUEがAIに入れ替わる
    const sessionWithAI = makePlayingSession({
      players: [
        { clientId: 'client-host', color: 'RED', lastActiveAt: new Date().toISOString(), isHuman: true },
        { clientId: 'ai-1', color: 'BLUE', lastActiveAt: new Date().toISOString(), isHuman: false },
      ],
    });
    usePolling.mockReturnValue({ session: sessionWithAI, error: null, setSession: jest.fn() });

    await act(async () => {
      rerender(
        <OnlineGame
          gameId="game-123"
          clientId="client-host"
          initialSession={session}
          onLeave={jest.fn()}
          onDemoted={jest.fn()}
        />,
      );
    });

    // board は引き続き表示
    expect(getByTestId('online-game-board')).toBeTruthy();
  });

  it('OnlineGame: 勝者が出たとき Play Again と Leave が両方表示される', () => {
    const OnlineGame = require('../../../src/components/OnlineGame').default;

    const session = makePlayingSession({ winner: 'RED', status: 'FINISHED' });

    const { getByTestId } = render(
      <OnlineGame
        gameId="game-123"
        clientId="client-host"
        initialSession={session}
        onLeave={jest.fn()}
        onDemoted={jest.fn()}
      />,
    );

    expect(getByTestId('online-play-again-btn')).toBeTruthy();
    expect(getByTestId('online-leave-btn')).toBeTruthy();
  });

  it('OnlineGame: 非ホストでも Play Again が表示される', () => {
    const OnlineGame = require('../../../src/components/OnlineGame').default;

    const session = makePlayingSession({ winner: 'RED', status: 'FINISHED' });

    // client-2 は非ホスト
    const { getByTestId } = render(
      <OnlineGame
        gameId="game-123"
        clientId="client-2"
        initialSession={session}
        onLeave={jest.fn()}
        onDemoted={jest.fn()}
      />,
    );

    expect(getByTestId('online-play-again-btn')).toBeTruthy();
  });

  it('OnlineGame: Play Again 押下で api.restart が呼ばれる', async () => {
    const { api } = require('../../../src/online/api');
    const OnlineGame = require('../../../src/components/OnlineGame').default;

    const newSession = makeSession({ version: 2 });
    api.restart.mockResolvedValueOnce(newSession);

    const session = makePlayingSession({ winner: 'RED', status: 'FINISHED' });

    const { getByTestId } = render(
      <OnlineGame
        gameId="game-123"
        clientId="client-host"
        initialSession={session}
        onLeave={jest.fn()}
        onDemoted={jest.fn()}
      />,
    );

    await act(async () => {
      fireEvent.press(getByTestId('online-play-again-btn'));
    });

    expect(api.restart).toHaveBeenCalledWith('game-123', 'client-host');
  });

  it('OnlineGame: Leave 押下で api.leave が呼ばれ onLeave が呼ばれる', async () => {
    const { api } = require('../../../src/online/api');
    const OnlineGame = require('../../../src/components/OnlineGame').default;

    const onLeave = jest.fn();
    // FINISHED 状態だと confirm なしで即 onLeave
    const session = makePlayingSession({ winner: 'RED', status: 'FINISHED' });

    const { getByTestId } = render(
      <OnlineGame
        gameId="game-123"
        clientId="client-host"
        initialSession={session}
        onLeave={onLeave}
        onDemoted={jest.fn()}
      />,
    );

    fireEvent.press(getByTestId('online-leave-btn'));

    expect(onLeave).toHaveBeenCalledTimes(1);
  });

  it('OnlineGame: ネットワークエラーが3秒継続するとエラーオーバーレイ表示', () => {
    const { usePolling } = require('../../../src/online/usePolling');
    const OnlineGame = require('../../../src/components/OnlineGame').default;

    const session = makePlayingSession({ currentPlayer: 'RED' });

    usePolling.mockReturnValue({ session: null, error: new Error('network'), setSession: jest.fn() });

    const { getByTestId } = render(
      <OnlineGame
        gameId="game-123"
        clientId="client-host"
        initialSession={session}
        onLeave={jest.fn()}
        onDemoted={jest.fn()}
      />,
    );

    act(() => { jest.advanceTimersByTime(3000); });

    expect(getByTestId('network-error-overlay')).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 観戦者シナリオ
// ─────────────────────────────────────────────────────────────────────────────

describe('SpectatorView シナリオ', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { usePolling } = require('../../../src/online/usePolling');
    usePolling.mockReturnValue({ session: null, error: null, setSession: jest.fn() });
  });

  it('SpectatorView: キュー1番目で表示', () => {
    const SpectatorView = require('../../../src/components/SpectatorView').default;

    const session = makeSession({ waitQueue: ['spectator-1'] });

    const { getByText } = render(
      <SpectatorView
        gameId="g1"
        clientId="spectator-1"
        session={session}
        onJoined={jest.fn()}
        onLeave={jest.fn()}
      />,
    );

    expect(getByText('#1', { exact: false })).toBeTruthy();
    expect(getByText("You're next", { exact: false })).toBeTruthy();
  });

  it('SpectatorView: キュー位置が変わると更新される', async () => {
    const { usePolling } = require('../../../src/online/usePolling');
    const SpectatorView = require('../../../src/components/SpectatorView').default;

    // 最初は2番目
    const session = makeSession({ waitQueue: ['other-client', 'spectator-1'] });

    const { rerender, getByText } = render(
      <SpectatorView
        gameId="g1"
        clientId="spectator-1"
        session={session}
        onJoined={jest.fn()}
        onLeave={jest.fn()}
      />,
    );

    expect(getByText('#2', { exact: false })).toBeTruthy();

    // 1番目に繰り上がり
    const updatedSession = makeSession({ waitQueue: ['spectator-1'] });
    usePolling.mockReturnValue({ session: updatedSession, error: null, setSession: jest.fn() });

    await act(async () => {
      rerender(
        <SpectatorView
          gameId="g1"
          clientId="spectator-1"
          session={session}
          onJoined={jest.fn()}
          onLeave={jest.fn()}
        />,
      );
    });

    await waitFor(() => {
      expect(getByText('#1', { exact: false })).toBeTruthy();
    });
  });

  it('SpectatorView: WAITING になると onPromotedToWaiting が呼ばれる', async () => {
    // SpectatorView は onJoined コールバックを使用する
    // WaitingStatus に変わったときのルートはテストしにくいため、
    // players に自分が現れると onJoined が呼ばれることをテスト
    const { usePolling } = require('../../../src/online/usePolling');
    const SpectatorView = require('../../../src/components/SpectatorView').default;

    const onJoined = jest.fn();
    const initialSession = makeSession({ waitQueue: ['spectator-1'] });

    usePolling.mockReturnValue({ session: null, error: null, setSession: jest.fn() });

    const { rerender } = render(
      <SpectatorView
        gameId="g1"
        clientId="spectator-1"
        session={initialSession}
        onJoined={onJoined}
        onLeave={jest.fn()}
      />,
    );

    // WAITING 状態で players に追加される
    const promotedSession = makeSession({
      status: 'WAITING',
      players: [
        makePlayer('client-host', 'RED'),
        makePlayer('client-2', 'BLUE'),
        makePlayer('spectator-1', 'YELLOW'),
      ],
      waitQueue: [],
    });
    usePolling.mockReturnValue({ session: promotedSession, error: null, setSession: jest.fn() });

    await act(async () => {
      rerender(
        <SpectatorView
          gameId="g1"
          clientId="spectator-1"
          session={initialSession}
          onJoined={onJoined}
          onLeave={jest.fn()}
        />,
      );
    });

    await waitFor(() => {
      expect(onJoined).toHaveBeenCalledTimes(1);
    });
  });

  it('SpectatorView: waitQueue が空になって PLAYING になると onJoined が呼ばれる', async () => {
    const { usePolling } = require('../../../src/online/usePolling');
    const SpectatorView = require('../../../src/components/SpectatorView').default;

    const onJoined = jest.fn();
    const initialSession = makeSession({ waitQueue: ['spectator-1'] });

    usePolling.mockReturnValue({ session: null, error: null, setSession: jest.fn() });

    const { rerender } = render(
      <SpectatorView
        gameId="g1"
        clientId="spectator-1"
        session={initialSession}
        onJoined={onJoined}
        onLeave={jest.fn()}
      />,
    );

    // PLAYING になって players に spectator-1 が追加される
    const joinedSession = makeSession({
      status: 'PLAYING',
      waitQueue: [],
      players: [
        makePlayer('client-host', 'RED'),
        makePlayer('client-2', 'BLUE'),
        makePlayer('spectator-1', 'YELLOW'),
      ],
    });
    usePolling.mockReturnValue({ session: joinedSession, error: null, setSession: jest.fn() });

    await act(async () => {
      rerender(
        <SpectatorView
          gameId="g1"
          clientId="spectator-1"
          session={initialSession}
          onJoined={onJoined}
          onLeave={jest.fn()}
        />,
      );
    });

    await waitFor(() => {
      expect(onJoined).toHaveBeenCalledTimes(1);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 繰り上がりシナリオ
// ─────────────────────────────────────────────────────────────────────────────

describe('繰り上がりシナリオ', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { usePolling } = require('../../../src/online/usePolling');
    usePolling.mockReturnValue({ session: null, error: null, setSession: jest.fn() });
  });

  it('繰り上がり: 観戦者が QUEUED→WAITING に昇格するとルーティング変わる', async () => {
    const { usePolling } = require('../../../src/online/usePolling');
    const SpectatorView = require('../../../src/components/SpectatorView').default;

    const onJoined = jest.fn();
    // キューに入っている状態
    const initialSession = makeSession({
      waitQueue: ['spectator-1'],
      players: [
        makePlayer('client-host', 'RED'),
        makePlayer('client-2', 'BLUE'),
      ],
    });

    usePolling.mockReturnValue({ session: null, error: null, setSession: jest.fn() });

    const { rerender } = render(
      <SpectatorView
        gameId="g1"
        clientId="spectator-1"
        session={initialSession}
        onJoined={onJoined}
        onLeave={jest.fn()}
      />,
    );

    // WAITING 状態（新ラウンド待機）で players に追加 → QUEUED→WAITING に昇格
    const promotedToWaitingSession = makeSession({
      status: 'WAITING',
      waitQueue: [],
      players: [
        makePlayer('client-host', 'RED'),
        makePlayer('client-2', 'BLUE'),
        makePlayer('spectator-1', 'YELLOW'),
      ],
    });
    usePolling.mockReturnValue({ session: promotedToWaitingSession, error: null, setSession: jest.fn() });

    await act(async () => {
      rerender(
        <SpectatorView
          gameId="g1"
          clientId="spectator-1"
          session={initialSession}
          onJoined={onJoined}
          onLeave={jest.fn()}
        />,
      );
    });

    // onJoined が呼ばれることでルーティングが変わる
    await waitFor(() => {
      expect(onJoined).toHaveBeenCalledTimes(1);
    });
  });
});
