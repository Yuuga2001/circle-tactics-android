import { BoardState, CellState, HandState, Player, SIZES } from '../types';

const BOARD_SIZE = 4;
const LINE_LENGTH = 4;

export type WinKind = 'CELL' | 'BOARD';

export interface WinResult {
  player: Player;
  kind: WinKind;
  cells: Array<{ row: number; col: number }>;
}

const hasAnyPieceOfPlayer = (cell: CellState, player: Player): boolean => {
  return cell.some(piece => piece && piece.player === player);
};

const checkCellWin = (cell: CellState, player: Player): boolean => {
  return cell.every(piece => piece && piece.player === player);
};

/**
 * Returns the set of 4 cells if the given player has a "Board Win" line, otherwise null.
 */
const findBoardWinLine = (board: BoardState, player: Player): Array<{ row: number; col: number }> | null => {
  // Rows
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c <= BOARD_SIZE - LINE_LENGTH; c++) {
      const cells = Array.from({ length: LINE_LENGTH }, (_, i) => ({ row: r, col: c + i }));
      if (cells.every(({ row, col }) => hasAnyPieceOfPlayer(board[row][col], player))) {
        return cells;
      }
    }
  }
  // Columns
  for (let c = 0; c < BOARD_SIZE; c++) {
    for (let r = 0; r <= BOARD_SIZE - LINE_LENGTH; r++) {
      const cells = Array.from({ length: LINE_LENGTH }, (_, i) => ({ row: r + i, col: c }));
      if (cells.every(({ row, col }) => hasAnyPieceOfPlayer(board[row][col], player))) {
        return cells;
      }
    }
  }
  // Diagonals (TL → BR)
  for (let r = 0; r <= BOARD_SIZE - LINE_LENGTH; r++) {
    for (let c = 0; c <= BOARD_SIZE - LINE_LENGTH; c++) {
      const cells = Array.from({ length: LINE_LENGTH }, (_, i) => ({ row: r + i, col: c + i }));
      if (cells.every(({ row, col }) => hasAnyPieceOfPlayer(board[row][col], player))) {
        return cells;
      }
    }
  }
  // Diagonals (TR → BL)
  for (let r = 0; r <= BOARD_SIZE - LINE_LENGTH; r++) {
    for (let c = LINE_LENGTH - 1; c < BOARD_SIZE; c++) {
      const cells = Array.from({ length: LINE_LENGTH }, (_, i) => ({ row: r + i, col: c - i }));
      if (cells.every(({ row, col }) => hasAnyPieceOfPlayer(board[row][col], player))) {
        return cells;
      }
    }
  }
  return null;
};

/**
 * Checks all win conditions for a given player after a move.
 * Returns details about the winning line/cell, or null if no win yet.
 */
export const checkWinner = (
  board: BoardState,
  player: Player,
  moveCoords: { row: number; col: number }
): WinResult | null => {
  // 1. Cell Win at the just-moved cell
  const movedCell = board[moveCoords.row][moveCoords.col];
  if (checkCellWin(movedCell, player)) {
    return { player, kind: 'CELL', cells: [{ row: moveCoords.row, col: moveCoords.col }] };
  }

  // 2. Board Win (4 in a row)
  const line = findBoardWinLine(board, player);
  if (line) {
    return { player, kind: 'BOARD', cells: line };
  }

  return null;
};

export const isBoardFull = (board: BoardState): boolean =>
  board.every(row => row.every(cell => cell.every(piece => piece !== null)));

export const hasAnyValidMove = (board: BoardState, hand: HandState): boolean =>
  SIZES.some(size =>
    hand[size] > 0 &&
    board.some(row => row.some(cell => cell[SIZES.indexOf(size)] === null))
  );
