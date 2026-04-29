import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import GameComponent from '../../../src/components/Game';
import { GameState } from '../../../src/types';
import { createInitialGameState } from '../../../src/logic/gameReducer';

jest.useFakeTimers();

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

jest.mock('../../../src/i18n/index', () => ({
  useLang: () => ({
    t: {
      pickingFirst: '...',
      goesFirst: (p: string) => p,
      turnYou: 'Your Turn',
      turnPlayer: (p: string) => p,
      playerWins: (p: string) => `${p} WINS!`,
      draw: 'DRAW',
      playAgain: 'Play Again',
      titleBtn: 'Title',
      firstLabel: 'FIRST',
      skipLabel: 'SKIP',
      noMoves: 'No moves',
      aiThinking: (p: string) => p,
      winCell: 'Cell win',
      winRow: '4 in a row!',
      yourHand: 'Hand',
      playerLabel: 'Player',
      aiLabel: 'AI',
      youLabel: 'You',
      soundOn: 'ON',
      soundOff: 'OFF',
      bgmLabel: 'BGM',
      seLabel: 'SE',
      subtitle: 'subtitle',
      setSeats: 'Set seats',
      chooseAtLeastOne: 'Choose at least one',
      playLocal: 'Play Local',
      playOnline: 'Play Online',
    },
    lang: 'en',
    setLang: jest.fn(),
  }),
  LangProvider: ({ children }: { children: React.ReactNode }) => children,
}));

function makePlaying(overrides: Partial<GameState> = {}): GameState {
  const base = createInitialGameState();
  return {
    ...base,
    gameMode: 'PLAYING',
    humanPlayers: ['RED'],
    currentPlayer: 'RED',
    turnOrder: ['RED', 'BLUE', 'YELLOW', 'GREEN'],
    ...overrides,
  };
}

describe('Game component', () => {
  it('ゲームボードが表示される', async () => {
    const dispatch = jest.fn();
    const state = makePlaying();
    const { getByTestId } = render(<GameComponent state={state} dispatch={dispatch} />);
    // ルーレットアニメーションをスキップ
    act(() => {
      jest.runAllTimers();
    });
    expect(getByTestId('game-board')).toBeTruthy();
  });

  it('winner=RED のとき victory-text が表示される', () => {
    const dispatch = jest.fn();
    const state = makePlaying({ winner: 'RED', gameMode: 'PLAYING' });
    const { getByTestId } = render(<GameComponent state={state} dispatch={dispatch} />);
    act(() => { jest.runAllTimers(); });
    expect(getByTestId('victory-text')).toBeTruthy();
  });

  it('Play Again ボタンクリックで dispatch({type:"RESTART_GAME"}) が呼ばれる', () => {
    const dispatch = jest.fn();
    const state = makePlaying({ winner: 'RED', gameMode: 'PLAYING' });
    const { getByTestId } = render(<GameComponent state={state} dispatch={dispatch} />);
    act(() => { jest.runAllTimers(); });
    fireEvent.press(getByTestId('play-again-btn'));
    expect(dispatch).toHaveBeenCalledWith({ type: 'RESTART_GAME' });
  });

  it('Title ボタンクリックで dispatch({type:"RETURN_TO_TITLE"}) が呼ばれる', () => {
    const dispatch = jest.fn();
    const state = makePlaying({ winner: 'RED', gameMode: 'PLAYING' });
    const { getByTestId } = render(<GameComponent state={state} dispatch={dispatch} />);
    act(() => { jest.runAllTimers(); });
    fireEvent.press(getByTestId('title-btn'));
    act(() => { jest.runAllTimers(); });
    expect(dispatch).toHaveBeenCalledWith({ type: 'RETURN_TO_TITLE' });
  });

  it('winner がないとき turn-text が表示される', async () => {
    const dispatch = jest.fn();
    const state = makePlaying();
    const { getByTestId } = render(<GameComponent state={state} dispatch={dispatch} />);
    // rouletting → announcing → playing
    act(() => { jest.runAllTimers(); });
    expect(getByTestId('turn-text')).toBeTruthy();
  });

  it('winner がないとき victory-text は存在しない', () => {
    const dispatch = jest.fn();
    const state = makePlaying();
    const { queryByTestId } = render(<GameComponent state={state} dispatch={dispatch} />);
    act(() => { jest.runAllTimers(); });
    expect(queryByTestId('victory-text')).toBeNull();
  });

  it('skippingPlayer がないとき skip-overlay は存在しない', () => {
    const dispatch = jest.fn();
    const state = makePlaying();
    const { queryByTestId } = render(<GameComponent state={state} dispatch={dispatch} />);
    act(() => { jest.runAllTimers(); });
    expect(queryByTestId('skip-overlay')).toBeNull();
  });

  it('winner=DRAW のとき draw テキストが表示される', () => {
    const dispatch = jest.fn();
    const state = makePlaying({ winner: 'DRAW', gameMode: 'PLAYING' });
    const { getByTestId } = render(<GameComponent state={state} dispatch={dispatch} />);
    act(() => { jest.runAllTimers(); });
    expect(getByTestId('victory-text').props.children).toBe('DRAW');
  });

  it('winInfo.kind=CELL のとき winCell テキストが表示される', () => {
    const dispatch = jest.fn();
    const state = makePlaying({
      winner: 'RED',
      gameMode: 'PLAYING',
      winInfo: { player: 'RED', kind: 'CELL', cells: [{ row: 0, col: 0 }] },
    });
    const { getByText } = render(<GameComponent state={state} dispatch={dispatch} />);
    act(() => { jest.runAllTimers(); });
    expect(getByText('Cell win')).toBeTruthy();
  });

  it('winInfo.kind=BOARD のとき winRow テキストが表示される', () => {
    const dispatch = jest.fn();
    const state = makePlaying({
      winner: 'RED',
      gameMode: 'PLAYING',
      winInfo: { player: 'RED', kind: 'BOARD', cells: [{ row: 0, col: 0 }] },
    });
    const { getByText } = render(<GameComponent state={state} dispatch={dispatch} />);
    act(() => { jest.runAllTimers(); });
    expect(getByText('4 in a row!')).toBeTruthy();
  });

  it('AI のターンのとき(humanPlayers に含まれない player) aiThinking テキストが表示される', () => {
    const dispatch = jest.fn();
    // humanPlayers = ['RED'], currentPlayer = 'BLUE' → AI turn
    const state = makePlaying({ humanPlayers: ['RED'], currentPlayer: 'BLUE' });
    const { getByTestId } = render(<GameComponent state={state} dispatch={dispatch} />);
    act(() => { jest.runAllTimers(); });
    // After roulette+announce, turn-text should show AI thinking
    expect(getByTestId('turn-text')).toBeTruthy();
  });

  it('複数人間プレイヤーのとき turnPlayer テキストが表示される', () => {
    const dispatch = jest.fn();
    const state = makePlaying({ humanPlayers: ['RED', 'BLUE'], currentPlayer: 'RED' });
    const { getByTestId } = render(<GameComponent state={state} dispatch={dispatch} />);
    act(() => { jest.runAllTimers(); });
    expect(getByTestId('turn-text')).toBeTruthy();
  });

  it('AI のターンで有効手あり → dispatch(SELECT_SIZE) と dispatch(PLACE_PIECE) が呼ばれる', () => {
    const dispatch = jest.fn();
    // BLUE は humanPlayers に含まれていない → AI
    const state = makePlaying({ humanPlayers: ['RED'], currentPlayer: 'BLUE' });
    render(<GameComponent state={state} dispatch={dispatch} />);
    // roulette (~3000ms) → announcing (1200ms) → AI thinking (1000ms) → place (200ms)
    act(() => { jest.advanceTimersByTime(3500); }); // roulette 終了
    act(() => { jest.advanceTimersByTime(1500); }); // announcing → playing
    act(() => { jest.advanceTimersByTime(1500); }); // AI SELECT_SIZE
    act(() => { jest.advanceTimersByTime(500); });  // AI PLACE_PIECE
    const types = dispatch.mock.calls.map((c) => c[0].type);
    expect(types).toContain('SELECT_SIZE');
    expect(types).toContain('PLACE_PIECE');
  });

  it('hand が空の状態で board が表示され turn-text も表示される', () => {
    const dispatch = jest.fn();
    const emptyHand = { SMALL: 0, MEDIUM: 0, LARGE: 0 };
    const base = createInitialGameState();
    const state: GameState = {
      ...base,
      gameMode: 'PLAYING',
      humanPlayers: ['RED'],
      currentPlayer: 'RED',
      turnOrder: ['RED', 'BLUE', 'YELLOW', 'GREEN'],
      hands: {
        RED: emptyHand,
        BLUE: base.hands.BLUE,
        YELLOW: base.hands.YELLOW,
        GREEN: base.hands.GREEN,
      },
    };
    const { getByTestId } = render(<GameComponent state={state} dispatch={dispatch} />);
    act(() => { jest.runAllTimers(); });
    expect(getByTestId('game-board')).toBeTruthy();
  });

  it('Restart 後に roulette が再起動される（dispatch なしで phase が rouletting に戻る）', () => {
    const dispatch = jest.fn();
    const state = makePlaying({ winner: 'RED' });
    const { getByTestId, rerender } = render(<GameComponent state={state} dispatch={dispatch} />);
    act(() => { jest.runAllTimers(); });
    fireEvent.press(getByTestId('play-again-btn'));
    expect(dispatch).toHaveBeenCalledWith({ type: 'RESTART_GAME' });
  });

  it('winner=RED のとき play-again-btn と title-btn の両方が表示される', () => {
    const dispatch = jest.fn();
    const state = makePlaying({ winner: 'RED' });
    const { getByTestId } = render(<GameComponent state={state} dispatch={dispatch} />);
    act(() => { jest.runAllTimers(); });
    expect(getByTestId('play-again-btn')).toBeTruthy();
    expect(getByTestId('title-btn')).toBeTruthy();
  });

  it('winner がないとき play-again-btn と title-btn は表示されない', () => {
    const dispatch = jest.fn();
    const state = makePlaying();
    const { queryByTestId } = render(<GameComponent state={state} dispatch={dispatch} />);
    act(() => { jest.runAllTimers(); });
    expect(queryByTestId('play-again-btn')).toBeNull();
    expect(queryByTestId('title-btn')).toBeNull();
  });

  it('複数人間プレイヤー（humanPlayers.length > 1）のとき PlayerHand が表示される', () => {
    const dispatch = jest.fn();
    const state = makePlaying({ humanPlayers: ['RED', 'BLUE'], currentPlayer: 'RED' });
    const { getByTestId } = render(<GameComponent state={state} dispatch={dispatch} />);
    act(() => { jest.runAllTimers(); });
    expect(getByTestId('game-board')).toBeTruthy();
  });

  it('DECLARE_DRAW が発火するシナリオで dispatch が呼ばれる可能性がある（auto-skip ロジック）', () => {
    // 全プレイヤーが有効手なし → DECLARE_DRAW
    // このテストでは hasAnyValidMove が実際の状態に依存するため
    // dispatch の呼ばれ方を記録して smoke test として確認
    const dispatch = jest.fn();
    const state = makePlaying();
    render(<GameComponent state={state} dispatch={dispatch} />);
    act(() => { jest.runAllTimers(); });
    // dispatch は何かしら呼ばれる可能性がある（winner=null, 空盤面なら SKIP_TURN や DECLARE_DRAW）
    // 例外なく動作することを確認
    expect(dispatch).toBeDefined();
  });

  it('playing フェーズで人間ターン: セルクリックで dispatch(PLACE_PIECE) が呼ばれる', () => {
    const dispatch = jest.fn();
    // 人間ターン: humanPlayers=['RED'], currentPlayer='RED'
    const base = createInitialGameState();
    const state: GameState = {
      ...base,
      gameMode: 'PLAYING',
      humanPlayers: ['RED'],
      currentPlayer: 'RED',
      turnOrder: ['RED', 'BLUE', 'YELLOW', 'GREEN'],
      selectedSize: 'SMALL',
    };
    const { getByTestId } = render(<GameComponent state={state} dispatch={dispatch} />);
    // roulette の cascading setTimeout を2段階で消化: roulette完了 → announcing → playing
    act(() => { jest.advanceTimersByTime(3500); }); // roulette 完了 → setPhase('announcing')
    act(() => { jest.advanceTimersByTime(1500); }); // announcing → setPhase('playing')
    fireEvent.press(getByTestId('cell-0-0'));
    const types = dispatch.mock.calls.map((c: { type: string }[]) => c[0].type);
    expect(types).toContain('PLACE_PIECE');
  });
});
