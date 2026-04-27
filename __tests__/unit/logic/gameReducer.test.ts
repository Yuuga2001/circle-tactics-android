import { gameReducer, createInitialGameState } from '../../../src/logic/gameReducer';
import type { GameState, BoardState, HandState, Player } from '../../../src/types';
import { PLAYERS } from '../../../src/types';

// ── Helpers ───────────────────────────────────────────────────────────────────

function emptyBoard(): BoardState {
  return Array(4).fill(null).map(() =>
    Array(4).fill(null).map(() => [null, null, null])
  ) as BoardState;
}

function fullHands(): Record<Player, HandState> {
  const h = { SMALL: 4, MEDIUM: 4, LARGE: 4 };
  return { RED: { ...h }, BLUE: { ...h }, YELLOW: { ...h }, GREEN: { ...h } };
}

function playingState(overrides: Partial<GameState> = {}): GameState {
  return {
    board: emptyBoard(),
    hands: fullHands(),
    currentPlayer: 'RED',
    turnOrder: ['RED', 'BLUE', 'YELLOW', 'GREEN'],
    winner: null,
    winInfo: null,
    selectedSize: 'SMALL',
    gameMode: 'PLAYING',
    humanPlayers: ['RED'],
    ...overrides,
  };
}

// shuffle is random — stub it for deterministic tests
beforeEach(() => {
  jest.spyOn(Math, 'random').mockReturnValue(0);
});

// ── createInitialGameState ────────────────────────────────────────────────────

describe('createInitialGameState', () => {
  it('returns TITLE mode with no winner', () => {
    const state = createInitialGameState();
    expect(state.gameMode).toBe('TITLE');
    expect(state.winner).toBeNull();
    expect(state.selectedSize).toBeNull();
    expect(state.humanPlayers).toEqual([]);
  });

  it('initialises each player with 4 of each size', () => {
    const state = createInitialGameState();
    for (const p of PLAYERS) {
      expect(state.hands[p]).toEqual({ SMALL: 4, MEDIUM: 4, LARGE: 4 });
    }
  });
});

// ── SELECT_SIZE ───────────────────────────────────────────────────────────────

describe('SELECT_SIZE', () => {
  it('sets selectedSize when hand > 0 in PLAYING mode', () => {
    // Arrange
    const state = playingState({ selectedSize: null });
    // Act
    const next = gameReducer(state, { type: 'SELECT_SIZE', payload: 'LARGE' });
    // Assert
    expect(next.selectedSize).toBe('LARGE');
  });

  it('ignores selection when not in PLAYING mode', () => {
    const state = playingState({ gameMode: 'TITLE', selectedSize: null });
    const next = gameReducer(state, { type: 'SELECT_SIZE', payload: 'SMALL' });
    expect(next.selectedSize).toBeNull();
  });

  it('ignores selection when hand count is 0', () => {
    const hands = fullHands();
    hands['RED'].SMALL = 0;
    const state = playingState({ hands, selectedSize: null });
    const next = gameReducer(state, { type: 'SELECT_SIZE', payload: 'SMALL' });
    expect(next.selectedSize).toBeNull();
  });

  it('ignores when winner is set', () => {
    const state = playingState({ winner: 'RED', selectedSize: null });
    const next = gameReducer(state, { type: 'SELECT_SIZE', payload: 'SMALL' });
    expect(next.selectedSize).toBeNull();
  });

  it('can switch to a different size', () => {
    const state = playingState({ selectedSize: 'SMALL' });
    const next = gameReducer(state, { type: 'SELECT_SIZE', payload: 'LARGE' });
    expect(next.selectedSize).toBe('LARGE');
  });
});

// ── PLACE_PIECE ───────────────────────────────────────────────────────────────

describe('PLACE_PIECE', () => {
  it('places piece and decrements hand', () => {
    // Arrange
    const state = playingState({ selectedSize: 'SMALL' });
    // Act
    const next = gameReducer(state, { type: 'PLACE_PIECE', payload: { row: 0, col: 0 } });
    // Assert
    expect(next.board[0][0][0]).toEqual({ player: 'RED', size: 'SMALL' });
    expect(next.hands['RED'].SMALL).toBe(3);
  });

  it('advances to next player in turn order', () => {
    const state = playingState({ currentPlayer: 'RED', turnOrder: ['RED', 'BLUE', 'YELLOW', 'GREEN'] });
    const next = gameReducer(state, { type: 'PLACE_PIECE', payload: { row: 0, col: 0 } });
    expect(next.currentPlayer).toBe('BLUE');
  });

  it('wraps turn order correctly (last player → first)', () => {
    const state = playingState({ currentPlayer: 'GREEN', turnOrder: ['RED', 'BLUE', 'YELLOW', 'GREEN'] });
    const next = gameReducer(state, { type: 'PLACE_PIECE', payload: { row: 0, col: 0 } });
    expect(next.currentPlayer).toBe('RED');
  });

  it('clears selectedSize after placement', () => {
    const state = playingState({ selectedSize: 'MEDIUM' });
    const next = gameReducer(state, { type: 'PLACE_PIECE', payload: { row: 1, col: 1 } });
    expect(next.selectedSize).toBeNull();
  });

  it('ignores when no selectedSize', () => {
    const state = playingState({ selectedSize: null });
    const next = gameReducer(state, { type: 'PLACE_PIECE', payload: { row: 0, col: 0 } });
    expect(next).toBe(state);
  });

  it('ignores when winner is already set', () => {
    const state = playingState({ winner: 'RED' });
    const next = gameReducer(state, { type: 'PLACE_PIECE', payload: { row: 0, col: 0 } });
    expect(next).toBe(state);
  });

  it('ignores when target slot is already occupied', () => {
    const board = emptyBoard();
    board[0][0][0] = { player: 'BLUE', size: 'SMALL' };
    const state = playingState({ board, selectedSize: 'SMALL' });
    const next = gameReducer(state, { type: 'PLACE_PIECE', payload: { row: 0, col: 0 } });
    expect(next).toBe(state);
  });

  it('ignores when not in PLAYING mode', () => {
    const state = playingState({ gameMode: 'TITLE' });
    const next = gameReducer(state, { type: 'PLACE_PIECE', payload: { row: 0, col: 0 } });
    expect(next).toBe(state);
  });

  it('ignores when hand count is 0 for selectedSize', () => {
    const hands = fullHands();
    hands['RED'].SMALL = 0;
    const state = playingState({ hands, selectedSize: 'SMALL' });
    const next = gameReducer(state, { type: 'PLACE_PIECE', payload: { row: 0, col: 0 } });
    expect(next).toBe(state);
  });

  it('detects CELL WIN and sets winner', () => {
    // Arrange: place SMALL and MEDIUM for RED at [0][0], then LARGE via reducer
    const board = emptyBoard();
    board[0][0][0] = { player: 'RED', size: 'SMALL' };
    board[0][0][1] = { player: 'RED', size: 'MEDIUM' };
    const state = playingState({ board, selectedSize: 'LARGE' });
    // Act
    const next = gameReducer(state, { type: 'PLACE_PIECE', payload: { row: 0, col: 0 } });
    // Assert
    expect(next.winner).toBe('RED');
    expect(next.winInfo?.kind).toBe('CELL');
    expect(next.winInfo?.cells).toEqual([{ row: 0, col: 0 }]);
  });

  it('detects BOARD WIN and sets winner', () => {
    // Arrange: RED has SMALL in row 0 cols 0-2, placing at col 3 wins
    const board = emptyBoard();
    for (let c = 0; c < 3; c++) {
      board[0][c][0] = { player: 'RED', size: 'SMALL' };
    }
    const state = playingState({ board, selectedSize: 'SMALL' });
    // Act
    const next = gameReducer(state, { type: 'PLACE_PIECE', payload: { row: 0, col: 3 } });
    // Assert
    expect(next.winner).toBe('RED');
    expect(next.winInfo?.kind).toBe('BOARD');
  });

  it('sets winner=DRAW when board becomes full', () => {
    // Arrange: fill entire board except one slot, then place the last piece (no win line)
    const board = emptyBoard();
    const p = (player: Player, size: 'SMALL' | 'MEDIUM' | 'LARGE') => ({ player, size });
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        board[r][c] = [p('RED', 'SMALL'), p('BLUE', 'MEDIUM'), p('GREEN', 'LARGE')];
      }
    }
    // Free one LARGE slot at [0][0] — place there with YELLOW/LARGE → full, no win line for YELLOW
    board[0][0][2] = null;
    const hands = fullHands();
    hands['YELLOW'].LARGE = 1;
    const state = playingState({
      board,
      hands,
      selectedSize: 'LARGE',
      currentPlayer: 'YELLOW',
    });
    // Act
    const next = gameReducer(state, { type: 'PLACE_PIECE', payload: { row: 0, col: 0 } });
    // Assert
    expect(next.winner).toBe('DRAW');
    expect(next.winInfo).toBeNull();
  });
});

// ── SKIP_TURN ─────────────────────────────────────────────────────────────────

describe('SKIP_TURN', () => {
  it('advances to next player and clears selectedSize', () => {
    // Arrange
    const state = playingState({ currentPlayer: 'RED', selectedSize: 'SMALL' });
    // Act
    const next = gameReducer(state, { type: 'SKIP_TURN' });
    // Assert
    expect(next.currentPlayer).toBe('BLUE');
    expect(next.selectedSize).toBeNull();
  });

  it('wraps turn order (GREEN → RED)', () => {
    const state = playingState({ currentPlayer: 'GREEN' });
    const next = gameReducer(state, { type: 'SKIP_TURN' });
    expect(next.currentPlayer).toBe('RED');
  });

  it('is a no-op when winner is set', () => {
    const state = playingState({ winner: 'BLUE' });
    const next = gameReducer(state, { type: 'SKIP_TURN' });
    expect(next).toBe(state);
  });
});

// ── DECLARE_DRAW ──────────────────────────────────────────────────────────────

describe('DECLARE_DRAW', () => {
  it('sets winner=DRAW and clears winInfo/selectedSize', () => {
    // Arrange
    const state = playingState({ selectedSize: 'MEDIUM' });
    // Act
    const next = gameReducer(state, { type: 'DECLARE_DRAW' });
    // Assert
    expect(next.winner).toBe('DRAW');
    expect(next.winInfo).toBeNull();
    expect(next.selectedSize).toBeNull();
  });
});

// ── START_GAME ────────────────────────────────────────────────────────────────

describe('START_GAME', () => {
  it('transitions to PLAYING mode with given humanPlayers', () => {
    // Arrange
    const state = createInitialGameState();
    // Act
    const next = gameReducer(state, { type: 'START_GAME', payload: { humanPlayers: ['RED', 'BLUE'] } });
    // Assert
    expect(next.gameMode).toBe('PLAYING');
    expect(next.humanPlayers).toEqual(['RED', 'BLUE']);
  });

  it('resets board and hands', () => {
    const board = emptyBoard();
    board[0][0][0] = { player: 'RED', size: 'SMALL' };
    const hands = fullHands();
    hands['RED'].SMALL = 2;
    const state = playingState({ board, hands });
    const next = gameReducer(state, { type: 'START_GAME', payload: { humanPlayers: ['RED'] } });
    expect(next.board[0][0][0]).toBeNull();
    expect(next.hands['RED'].SMALL).toBe(4);
  });

  it('clears winner and winInfo', () => {
    const state = playingState({ winner: 'RED', winInfo: { player: 'RED', kind: 'CELL', cells: [{ row: 0, col: 0 }] } });
    const next = gameReducer(state, { type: 'START_GAME', payload: { humanPlayers: [] } });
    expect(next.winner).toBeNull();
    expect(next.winInfo).toBeNull();
  });
});

// ── RESTART_GAME ──────────────────────────────────────────────────────────────

describe('RESTART_GAME', () => {
  it('resets board, hands, winner while keeping current gameMode', () => {
    // Arrange
    const board = emptyBoard();
    board[2][2][0] = { player: 'BLUE', size: 'SMALL' };
    const hands = fullHands();
    hands['BLUE'].SMALL = 1;
    const state = playingState({ board, hands, winner: 'BLUE', gameMode: 'PLAYING' });
    // Act
    const next = gameReducer(state, { type: 'RESTART_GAME' });
    // Assert
    expect(next.winner).toBeNull();
    expect(next.winInfo).toBeNull();
    expect(next.board[2][2][0]).toBeNull();
    expect(next.hands['BLUE'].SMALL).toBe(4);
    expect(next.gameMode).toBe('PLAYING');
  });
});

// ── RETURN_TO_TITLE ───────────────────────────────────────────────────────────

describe('RETURN_TO_TITLE', () => {
  it('returns to initial state with TITLE mode', () => {
    // Arrange
    const state = playingState({ winner: 'GREEN' });
    // Act
    const next = gameReducer(state, { type: 'RETURN_TO_TITLE' });
    // Assert
    expect(next.gameMode).toBe('TITLE');
    expect(next.winner).toBeNull();
    expect(next.humanPlayers).toEqual([]);
  });
});

// ── unknown action ────────────────────────────────────────────────────────────

describe('unknown action', () => {
  it('returns state unchanged', () => {
    const state = playingState();
    // @ts-expect-error intentionally unknown action
    const next = gameReducer(state, { type: '__UNKNOWN__' });
    expect(next).toBe(state);
  });
});
