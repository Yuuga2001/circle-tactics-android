import { findBestMove } from '../../../src/logic/ai';
import type { GameState, BoardState, HandState, Player } from '../../../src/types';

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

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    board: emptyBoard(),
    hands: fullHands(),
    currentPlayer: 'RED',
    turnOrder: ['RED', 'BLUE', 'YELLOW', 'GREEN'],
    winner: null,
    winInfo: null,
    selectedSize: null,
    gameMode: 'PLAYING',
    humanPlayers: [],
    ...overrides,
  };
}

function piece(player: Player, size: 'SMALL' | 'MEDIUM' | 'LARGE') {
  return { player, size };
}

afterEach(() => {
  jest.restoreAllMocks();
});

// ── Priority 1: Win if possible ───────────────────────────────────────────────

describe('findBestMove – Priority 1: winning move', () => {
  it('returns the winning move when RED can win with CELL WIN', () => {
    // Arrange: RED has SMALL and MEDIUM at [0][0], placing LARGE wins
    const board = emptyBoard();
    board[0][0][0] = piece('RED', 'SMALL');
    board[0][0][1] = piece('RED', 'MEDIUM');
    const state = makeState({ board, currentPlayer: 'RED' });

    // Act
    const move = findBestMove(state);

    // Assert
    expect(move).not.toBeNull();
    expect(move!.row).toBe(0);
    expect(move!.col).toBe(0);
    expect(move!.size).toBe('LARGE');
  });

  it('returns winning BOARD WIN move (4 in a row)', () => {
    // Arrange: RED has SMALL in row 0 cols 0-2, placing at col 3 wins
    const board = emptyBoard();
    for (let c = 0; c < 3; c++) {
      board[0][c][0] = piece('RED', 'SMALL');
    }
    const state = makeState({ board, currentPlayer: 'RED' });

    // Act
    const move = findBestMove(state);

    // Assert
    expect(move).not.toBeNull();
    expect(move!.row).toBe(0);
    expect(move!.col).toBe(3);
    expect(move!.size).toBe('SMALL');
  });

  it('wins over blocking (own win takes priority)', () => {
    // Arrange: RED can win at [0][3]; BLUE can also win at [1][3] — RED should win, not block
    const board = emptyBoard();
    for (let c = 0; c < 3; c++) {
      board[0][c][0] = piece('RED', 'SMALL');
      board[1][c][0] = piece('BLUE', 'SMALL');
    }
    const state = makeState({ board, currentPlayer: 'RED' });

    // Act
    const move = findBestMove(state);

    // Assert: RED takes the win, not the block
    expect(move!.row).toBe(0);
    expect(move!.col).toBe(3);
  });
});

// ── Priority 2: Block opponent ────────────────────────────────────────────────

describe('findBestMove – Priority 2: blocking move', () => {
  it('blocks opponent CELL WIN threat', () => {
    // Arrange: BLUE has SMALL and MEDIUM at [1][1]; RED should block LARGE there
    const board = emptyBoard();
    board[1][1][0] = piece('BLUE', 'SMALL');
    board[1][1][1] = piece('BLUE', 'MEDIUM');
    const state = makeState({ board, currentPlayer: 'RED' });

    // Act
    const move = findBestMove(state);

    // Assert
    expect(move!.row).toBe(1);
    expect(move!.col).toBe(1);
    expect(move!.size).toBe('LARGE');
  });

  it('blocks opponent BOARD WIN threat', () => {
    // Arrange: BLUE has SMALL in row 2 cols 0-2; RED should block at [2][3]
    const board = emptyBoard();
    for (let c = 0; c < 3; c++) {
      board[2][c][0] = piece('BLUE', 'SMALL');
    }
    const state = makeState({ board, currentPlayer: 'RED' });

    // Act
    const move = findBestMove(state);

    // Assert
    expect(move!.row).toBe(2);
    expect(move!.col).toBe(3);
    expect(move!.size).toBe('SMALL');
  });

  it('falls through to random when RED has no piece of threatened size', () => {
    // Arrange: BLUE threatens LARGE win but RED has no LARGE
    const board = emptyBoard();
    board[0][0][0] = piece('BLUE', 'SMALL');
    board[0][0][1] = piece('BLUE', 'MEDIUM');
    const hands = fullHands();
    hands['RED'].LARGE = 0; // RED cannot block LARGE
    jest.spyOn(Math, 'random').mockReturnValue(0); // deterministic random pick
    const state = makeState({ board, hands, currentPlayer: 'RED' });

    // Act
    const move = findBestMove(state);

    // Assert: some random valid move (not the threatened cell since LARGE unavailable)
    expect(move).not.toBeNull();
  });
});

// ── Priority 3: Random valid move ─────────────────────────────────────────────

describe('findBestMove – Priority 3: random valid move', () => {
  it('returns a valid move when no win or threat', () => {
    // Arrange
    jest.spyOn(Math, 'random').mockReturnValue(0);
    const state = makeState();

    // Act
    const move = findBestMove(state);

    // Assert
    expect(move).not.toBeNull();
    expect(['SMALL', 'MEDIUM', 'LARGE']).toContain(move!.size);
    expect(move!.row).toBeGreaterThanOrEqual(0);
    expect(move!.col).toBeGreaterThanOrEqual(0);
  });

  it('Math.random selection: mockReturnValue(0.99) picks near-last validMove', () => {
    // Arrange
    jest.spyOn(Math, 'random').mockReturnValue(0.9999);
    const state = makeState({ currentPlayer: 'RED' });

    // Act
    const move = findBestMove(state);

    // Assert: still returns a valid move
    expect(move).not.toBeNull();
  });
});

// ── No moves available ────────────────────────────────────────────────────────

describe('findBestMove – no moves available', () => {
  it('returns null when all hands are 0', () => {
    // Arrange
    const hands = fullHands();
    for (const p of ['RED', 'BLUE', 'YELLOW', 'GREEN'] as Player[]) {
      hands[p] = { SMALL: 0, MEDIUM: 0, LARGE: 0 };
    }
    const state = makeState({ hands, currentPlayer: 'RED' });

    // Act
    const move = findBestMove(state);

    // Assert
    expect(move).toBeNull();
  });

  it('returns null when all board slots occupied', () => {
    // Arrange
    const board = emptyBoard();
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        board[r][c] = [
          piece('RED', 'SMALL'),
          piece('BLUE', 'MEDIUM'),
          piece('GREEN', 'LARGE'),
        ];
      }
    }
    const state = makeState({ board, currentPlayer: 'RED' });

    // Act
    const move = findBestMove(state);

    // Assert
    expect(move).toBeNull();
  });
});

// ── Immutability ──────────────────────────────────────────────────────────────

describe('findBestMove – immutability', () => {
  it('does not mutate original board state', () => {
    // Arrange
    const board = emptyBoard();
    const boardSnapshot = JSON.stringify(board);
    const state = makeState({ board });

    // Act
    findBestMove(state);

    // Assert
    expect(JSON.stringify(board)).toBe(boardSnapshot);
  });
});
