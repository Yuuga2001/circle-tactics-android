import { checkWinner, isBoardFull, hasAnyValidMove } from '../../../src/logic/winConditions';
import type { BoardState, CellState, HandState } from '../../../src/types';

// ── Helpers ──────────────────────────────────────────────────────────────────

function emptyCell(): CellState { return [null, null, null]; }

function emptyBoard(): BoardState {
  return Array(4).fill(null).map(() =>
    Array(4).fill(null).map(() => emptyCell())
  ) as BoardState;
}

function piece(player: 'RED' | 'BLUE' | 'YELLOW' | 'GREEN', size: 'SMALL' | 'MEDIUM' | 'LARGE') {
  return { player, size };
}

// ── checkWinner ───────────────────────────────────────────────────────────────

describe('checkWinner', () => {
  it('[CELL WIN] S/M/L of same player fills one cell → kind=CELL', () => {
    // Arrange
    const board = emptyBoard();
    board[1][2] = [piece('RED', 'SMALL'), piece('RED', 'MEDIUM'), piece('RED', 'LARGE')];

    // Act
    const result = checkWinner(board, 'RED', { row: 1, col: 2 });

    // Assert
    expect(result).not.toBeNull();
    expect(result!.kind).toBe('CELL');
    expect(result!.player).toBe('RED');
    expect(result!.cells).toEqual([{ row: 1, col: 2 }]);
  });

  it('[CELL WIN] works for BLUE player', () => {
    const board = emptyBoard();
    board[0][0] = [piece('BLUE', 'SMALL'), piece('BLUE', 'MEDIUM'), piece('BLUE', 'LARGE')];
    const result = checkWinner(board, 'BLUE', { row: 0, col: 0 });
    expect(result?.kind).toBe('CELL');
    expect(result?.player).toBe('BLUE');
  });

  it('[BOARD WIN] horizontal row of 4 → kind=BOARD', () => {
    // Arrange
    const board = emptyBoard();
    for (let c = 0; c < 4; c++) {
      board[2][c][0] = piece('RED', 'SMALL'); // place SMALL in row 2
    }

    // Act
    const result = checkWinner(board, 'RED', { row: 2, col: 3 });

    // Assert
    expect(result!.kind).toBe('BOARD');
    expect(result!.cells).toHaveLength(4);
    expect(result!.cells.every(c => c.row === 2)).toBe(true);
  });

  it('[BOARD WIN] vertical column of 4 → kind=BOARD', () => {
    const board = emptyBoard();
    for (let r = 0; r < 4; r++) {
      board[r][1][1] = piece('BLUE', 'MEDIUM');
    }
    const result = checkWinner(board, 'BLUE', { row: 3, col: 1 });
    expect(result!.kind).toBe('BOARD');
    expect(result!.cells.every(c => c.col === 1)).toBe(true);
  });

  it('[BOARD WIN] diagonal TL→BR', () => {
    const board = emptyBoard();
    for (let i = 0; i < 4; i++) {
      board[i][i][0] = piece('YELLOW', 'SMALL');
    }
    const result = checkWinner(board, 'YELLOW', { row: 3, col: 3 });
    expect(result!.kind).toBe('BOARD');
    expect(result!.cells).toEqual([
      { row: 0, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 2 }, { row: 3, col: 3 },
    ]);
  });

  it('[BOARD WIN] diagonal TR→BL', () => {
    const board = emptyBoard();
    for (let i = 0; i < 4; i++) {
      board[i][3 - i][0] = piece('GREEN', 'SMALL');
    }
    const result = checkWinner(board, 'GREEN', { row: 3, col: 0 });
    expect(result!.kind).toBe('BOARD');
    expect(result!.cells).toEqual([
      { row: 0, col: 3 }, { row: 1, col: 2 }, { row: 2, col: 1 }, { row: 3, col: 0 },
    ]);
  });

  it('[NO WIN] only 3 in a row → null', () => {
    const board = emptyBoard();
    for (let c = 0; c < 3; c++) {
      board[0][c][0] = piece('RED', 'SMALL');
    }
    const result = checkWinner(board, 'RED', { row: 0, col: 2 });
    expect(result).toBeNull();
  });

  it('[NO WIN] mixed players in a row → null', () => {
    const board = emptyBoard();
    board[0][0][0] = piece('RED', 'SMALL');
    board[0][1][0] = piece('BLUE', 'SMALL');
    board[0][2][0] = piece('RED', 'SMALL');
    board[0][3][0] = piece('RED', 'SMALL');
    const result = checkWinner(board, 'RED', { row: 0, col: 3 });
    expect(result).toBeNull();
  });

  it('[NO WIN] cell win for different player at move cell → null for current player', () => {
    const board = emptyBoard();
    // move cell has RED pieces but only SMALL placed (not all 3)
    board[0][0][0] = piece('RED', 'SMALL');
    const result = checkWinner(board, 'RED', { row: 0, col: 0 });
    expect(result).toBeNull();
  });

  it('[NO WIN] empty board → null', () => {
    const board = emptyBoard();
    const result = checkWinner(board, 'RED', { row: 0, col: 0 });
    expect(result).toBeNull();
  });

  it('[BOARD WIN] any-size piece counts (LARGE piece in row)', () => {
    const board = emptyBoard();
    for (let c = 0; c < 4; c++) {
      board[3][c][2] = piece('RED', 'LARGE');
    }
    const result = checkWinner(board, 'RED', { row: 3, col: 0 });
    expect(result!.kind).toBe('BOARD');
  });
});

// ── isBoardFull ───────────────────────────────────────────────────────────────

describe('isBoardFull', () => {
  it('empty board → false', () => {
    // Arrange
    const board = emptyBoard();
    // Act & Assert
    expect(isBoardFull(board)).toBe(false);
  });

  it('all slots filled → true', () => {
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
    // Act & Assert
    expect(isBoardFull(board)).toBe(true);
  });

  it('one slot empty → false', () => {
    // Arrange
    const board = emptyBoard();
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        board[r][c] = [piece('RED', 'SMALL'), piece('BLUE', 'MEDIUM'), piece('GREEN', 'LARGE')];
      }
    }
    board[3][3][2] = null; // leave one slot empty
    // Act & Assert
    expect(isBoardFull(board)).toBe(false);
  });
});

// ── hasAnyValidMove ───────────────────────────────────────────────────────────

describe('hasAnyValidMove', () => {
  function fullHandState(): HandState { return { SMALL: 4, MEDIUM: 4, LARGE: 4 }; }
  function emptyHandState(): HandState { return { SMALL: 0, MEDIUM: 0, LARGE: 0 }; }

  it('full hand + empty board → true', () => {
    // Arrange, Act, Assert
    expect(hasAnyValidMove(emptyBoard(), fullHandState())).toBe(true);
  });

  it('empty hand → false', () => {
    expect(hasAnyValidMove(emptyBoard(), emptyHandState())).toBe(false);
  });

  it('hand has SMALL but all SMALL slots occupied → false', () => {
    // Arrange
    const board = emptyBoard();
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        board[r][c][0] = piece('RED', 'SMALL'); // occupy all SMALL slots
      }
    }
    const hand: HandState = { SMALL: 4, MEDIUM: 0, LARGE: 0 };
    // Act & Assert
    expect(hasAnyValidMove(board, hand)).toBe(false);
  });

  it('SMALL occupied everywhere but MEDIUM available → true', () => {
    // Arrange
    const board = emptyBoard();
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        board[r][c][0] = piece('RED', 'SMALL');
      }
    }
    const hand: HandState = { SMALL: 4, MEDIUM: 2, LARGE: 0 };
    // Act & Assert
    expect(hasAnyValidMove(board, hand)).toBe(true);
  });

  it('all slots for every size occupied → false', () => {
    // Arrange
    const board = emptyBoard();
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        board[r][c] = [piece('RED', 'SMALL'), piece('BLUE', 'MEDIUM'), piece('GREEN', 'LARGE')];
      }
    }
    // Act & Assert
    expect(hasAnyValidMove(board, fullHandState())).toBe(false);
  });
});
