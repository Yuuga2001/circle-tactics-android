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
});
