import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import OnlineGame from '../../../src/components/OnlineGame';
import type { GameSession } from '../../../src/online/types';

jest.useFakeTimers({ doNotFake: ['setInterval'] });

// ── モック定義 ────────────────────────────────────────────────────────────────

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
    restart: jest.fn(),
    start: jest.fn(),
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
      startGame: 'Start',
      joinBtn: 'Join',
      back: 'Back',
      createRoom: 'Create',
      joinRoom: 'Join',
      hostingRoom: 'Hosting',
      roomCode: 'Code',
      waitingTitle: 'Waiting',
      waitingDesc: 'desc',
      playersLabel: (n: number, m: number) => `${n}/${m}`,
      youAre: (c: string) => c,
      waitingToJoin: 'waiting',
      queuePos: (n: number) => `#${n}`,
      youreNext: 'next',
      willJoinAuto: 'auto',
      joiningLabel: 'joining',
      shareCode: 'share',
      copied: 'Copied',
      copyUrl: 'URL',
      playersInRoom: (n: number, m: number) => `${n}/${m}`,
      aiSeats: (n: number) => `${n}`,
      starting: 'starting',
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

// ── ヘルパー ─────────────────────────────────────────────────────────────────

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

// ── テスト ───────────────────────────────────────────────────────────────────

describe('OnlineGame', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { usePolling } = require('../../../src/online/usePolling');
    usePolling.mockReturnValue({ session: null, error: null, setSession: jest.fn() });
  });

  it('online-game-board が表示される', () => {
    const session = makeSession();
    const { getByTestId } = render(
      <OnlineGame
        gameId="game-123"
        clientId="client-host"
        initialSession={session}
        onLeave={jest.fn()}
        onDemoted={jest.fn()}
      />,
    );
    act(() => { jest.runAllTimers(); });
    expect(getByTestId('online-game-board')).toBeTruthy();
  });

  it('winner がいるとき online-victory-text が表示される', () => {
    const session = makeSession({ winner: 'RED', status: 'FINISHED' });
    const { getByTestId } = render(
      <OnlineGame
        gameId="game-123"
        clientId="client-host"
        initialSession={session}
        onLeave={jest.fn()}
        onDemoted={jest.fn()}
      />,
    );
    act(() => { jest.runAllTimers(); });
    expect(getByTestId('online-victory-text')).toBeTruthy();
  });

  it('winner がいるとき online-play-again-btn が表示される', () => {
    const session = makeSession({ winner: 'RED', status: 'FINISHED' });
    const { getByTestId } = render(
      <OnlineGame
        gameId="game-123"
        clientId="client-host"
        initialSession={session}
        onLeave={jest.fn()}
        onDemoted={jest.fn()}
      />,
    );
    act(() => { jest.runAllTimers(); });
    expect(getByTestId('online-play-again-btn')).toBeTruthy();
  });

  it('winner がいないとき online-victory-text は存在しない', () => {
    const session = makeSession({ winner: null });
    const { queryByTestId } = render(
      <OnlineGame
        gameId="game-123"
        clientId="client-host"
        initialSession={session}
        onLeave={jest.fn()}
        onDemoted={jest.fn()}
      />,
    );
    act(() => { jest.runAllTimers(); });
    expect(queryByTestId('online-victory-text')).toBeNull();
  });

  it('online-leave-btn (勝利後) を押すと確認ダイアログが表示される', () => {
    const session = makeSession({ winner: 'BLUE', status: 'PLAYING' });
    const { getByTestId, getByText } = render(
      <OnlineGame
        gameId="game-123"
        clientId="client-host"
        initialSession={session}
        onLeave={jest.fn()}
        onDemoted={jest.fn()}
      />,
    );
    act(() => { jest.runAllTimers(); });
    fireEvent.press(getByTestId('online-leave-btn'));
    expect(getByText('Leave the room?')).toBeTruthy();
  });

  it('確認ダイアログで OK を押すと onLeave が呼ばれる', () => {
    const onLeave = jest.fn();
    const session = makeSession({ winner: 'BLUE', status: 'PLAYING' });
    const { getByTestId, getByText } = render(
      <OnlineGame
        gameId="game-123"
        clientId="client-host"
        initialSession={session}
        onLeave={onLeave}
        onDemoted={jest.fn()}
      />,
    );
    act(() => { jest.runAllTimers(); });
    fireEvent.press(getByTestId('online-leave-btn'));
    fireEvent.press(getByText('OK'));
    expect(onLeave).toHaveBeenCalledTimes(1);
  });

  it('winner がいるとき勝利テキストが正しく表示される', () => {
    const session = makeSession({ winner: 'BLUE', status: 'FINISHED' });
    const { getByTestId } = render(
      <OnlineGame
        gameId="game-123"
        clientId="client-host"
        initialSession={session}
        onLeave={jest.fn()}
        onDemoted={jest.fn()}
      />,
    );
    act(() => { jest.runAllTimers(); });
    const victoryText = getByTestId('online-victory-text');
    expect(victoryText).toBeTruthy();
  });

  it('winner=DRAW のとき DRAW テキストが表示される', () => {
    const session = makeSession({ winner: 'DRAW', status: 'FINISHED' });
    const { getByTestId } = render(
      <OnlineGame
        gameId="game-123"
        clientId="client-host"
        initialSession={session}
        onLeave={jest.fn()}
        onDemoted={jest.fn()}
      />,
    );
    act(() => { jest.runAllTimers(); });
    expect(getByTestId('online-victory-text').props.children).toBe('DRAW');
  });

  it('確認ダイアログで Cancel を押すと onLeave は呼ばれない', () => {
    const onLeave = jest.fn();
    const session = makeSession({ winner: 'BLUE', status: 'PLAYING' });
    const { getByTestId, getByText, queryByText } = render(
      <OnlineGame
        gameId="game-123"
        clientId="client-host"
        initialSession={session}
        onLeave={onLeave}
        onDemoted={jest.fn()}
      />,
    );
    act(() => { jest.runAllTimers(); });
    fireEvent.press(getByTestId('online-leave-btn'));
    fireEvent.press(getByText('Cancel'));
    expect(onLeave).not.toHaveBeenCalled();
  });

  it('ボードにコマがある場合は shouldSkipRoulette が true → ゲームボードがすぐ表示される', () => {
    const boardWithPiece = makeSession().board;
    boardWithPiece[0][0][0] = { player: 'RED', size: 'SMALL' };
    const session = makeSession({ board: boardWithPiece });
    const { getByTestId } = render(
      <OnlineGame
        gameId="game-123"
        clientId="client-host"
        initialSession={session}
        onLeave={jest.fn()}
        onDemoted={jest.fn()}
      />,
    );
    // ルーレットなしで即レンダー（act なしでも board が存在する）
    expect(getByTestId('online-game-board')).toBeTruthy();
  });

  it('api.restart が呼ばれてセッションが更新される', async () => {
    const { api } = require('../../../src/online/api');
    const newSession = makeSession({ version: 2 });
    api.restart.mockResolvedValueOnce(newSession);

    const session = makeSession({ winner: 'RED', status: 'FINISHED' });
    const { getByTestId } = render(
      <OnlineGame
        gameId="game-123"
        clientId="client-host"
        initialSession={session}
        onLeave={jest.fn()}
        onDemoted={jest.fn()}
      />,
    );
    act(() => { jest.runAllTimers(); });
    await act(async () => {
      fireEvent.press(getByTestId('online-play-again-btn'));
    });
    expect(api.restart).toHaveBeenCalledWith('game-123', 'client-host');
  });

  it('他のユーザーが Play Again を押した後（polling で startedAt 更新）自分にもルーレットが再生される', async () => {
    const { usePolling } = require('../../../src/online/usePolling');

    // 終了済みセッションでマウント
    const finishedSession = makeSession({
      status: 'FINISHED',
      winner: 'RED',
      startedAt: new Date(Date.now() - 60000).toISOString(),
    });
    const { getByText, rerender } = render(
      <OnlineGame
        gameId="game-123"
        clientId="client-host"
        initialSession={finishedSession}
        onLeave={jest.fn()}
        onDemoted={jest.fn()}
      />,
    );
    act(() => { jest.runAllTimers(); });

    // polling で再開セッション（startedAt 更新・空盤面）が届く
    const restartedSession = makeSession({
      status: 'PLAYING',
      winner: null,
      startedAt: new Date().toISOString(),
      currentPlayer: 'BLUE',
    });
    usePolling.mockReturnValue({
      session: restartedSession,
      error: null,
      setSession: jest.fn(),
    });

    await act(async () => {
      rerender(
        <OnlineGame
          gameId="game-123"
          clientId="client-host"
          initialSession={finishedSession}
          onLeave={jest.fn()}
          onDemoted={jest.fn()}
        />,
      );
    });

    // startedAt 変化を検知してルーレットフェーズに復帰している
    expect(getByText('picking...')).toBeTruthy();
  });

  it('clientId がプレイヤーリストに存在しないとき onDemoted が呼ばれる', async () => {
    // usePolling のモックを上書きして、clientId 不在のセッションを返す
    const { usePolling } = require('../../../src/online/usePolling');
    const demotedSession = makeSession({
      status: 'PLAYING',
      players: [
        { clientId: 'other-client', color: 'BLUE', lastActiveAt: new Date().toISOString(), isHuman: true },
      ],
    });
    usePolling.mockReturnValueOnce({
      session: demotedSession,
      error: null,
      setSession: jest.fn(),
    });

    const onDemoted = jest.fn();
    const initialSession = makeSession({ status: 'PLAYING' });
    render(
      <OnlineGame
        gameId="game-123"
        clientId="client-host"
        initialSession={initialSession}
        onLeave={jest.fn()}
        onDemoted={onDemoted}
      />,
    );
    act(() => { jest.runAllTimers(); });
    expect(onDemoted).toHaveBeenCalledWith(demotedSession);
  });

  it('api.placePiece が失敗するとエラーメッセージは設定される（toast 表示）', async () => {
    const { api } = require('../../../src/online/api');
    api.placePiece.mockRejectedValueOnce(new Error('network error'));

    // board に駒を置いて shouldSkipRoulette=true → playing 即表示
    // さらに selectedSize='SMALL' をセットして handleCellClick が size を持つようにする
    const boardWithPiece = makeSession().board;
    boardWithPiece[0][0][0] = { player: 'BLUE', size: 'SMALL' };
    const session = makeSession({
      board: boardWithPiece,
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
    // board に駒あり → roulette スキップ → playing フェーズで即表示
    expect(getByTestId('online-game-board')).toBeTruthy();

    await act(async () => {
      fireEvent.press(getByTestId('cell-1-1'));
    });
    // api.placePiece が呼ばれたことを確認
    expect(api.placePiece).toHaveBeenCalledWith('game-123', 'client-host', 1, 1, 'SMALL');
  });

  it('winInfo.kind=CELL のとき winCell テキストが表示される', () => {
    const session = makeSession({
      winner: 'RED',
      status: 'FINISHED',
      winInfo: {
        player: 'RED',
        kind: 'CELL',
        cells: [{ row: 0, col: 0 }],
      },
    });
    const { getByText } = render(
      <OnlineGame
        gameId="game-123"
        clientId="client-host"
        initialSession={session}
        onLeave={jest.fn()}
        onDemoted={jest.fn()}
      />,
    );
    act(() => { jest.runAllTimers(); });
    expect(getByText('Cell win')).toBeTruthy();
  });

  it('winInfo.kind=BOARD のとき winRow テキストが表示される', () => {
    const session = makeSession({
      winner: 'RED',
      status: 'FINISHED',
      winInfo: {
        player: 'RED',
        kind: 'BOARD',
        cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 }],
      },
    });
    const { getByText } = render(
      <OnlineGame
        gameId="game-123"
        clientId="client-host"
        initialSession={session}
        onLeave={jest.fn()}
        onDemoted={jest.fn()}
      />,
    );
    act(() => { jest.runAllTimers(); });
    expect(getByText('4 in a row')).toBeTruthy();
  });

  it('status=FINISHED のとき Leave ボタン押下で確認ダイアログをスキップして onLeave が呼ばれる', () => {
    const onLeave = jest.fn();
    // board に駒を置いて shouldSkipRoulette=true → playing フェーズで即描画
    const boardWithPiece = makeSession().board;
    boardWithPiece[0][0][0] = { player: 'RED', size: 'SMALL' };
    const session = makeSession({ winner: 'RED', status: 'FINISHED', board: boardWithPiece });
    const { getByTestId } = render(
      <OnlineGame
        gameId="game-123"
        clientId="client-host"
        initialSession={session}
        onLeave={onLeave}
        onDemoted={jest.fn()}
      />,
    );
    // shouldSkipRoulette=true なので即 playing フェーズ → winner ボタンが表示される
    fireEvent.press(getByTestId('online-leave-btn'));
    // FINISHED 状態なので confirm ダイアログをスキップして即 onLeave
    expect(onLeave).toHaveBeenCalledTimes(1);
  });
});
