import { GameState, PieceSize, SIZES, Player, BoardState, PLAYERS, HandState } from '../types';
import { checkWinner } from './winConditions';

const BOARD_SIZE = 4;

export type Move = {
  size: PieceSize;
  row: number;
  col: number;
};

// Helper function to create a temporary board state by applying a move
function applyMove(board: BoardState, move: Move, player: Player): BoardState {
  const newBoard = board.map(r => r.map(c => [...c])) as BoardState;
  const sizeIndex = SIZES.indexOf(move.size);
  newBoard[move.row][move.col][sizeIndex] = { player, size: move.size };
  return newBoard;
}

/**
 * Finds all winning moves for a given player.
 * @param board The current board state.
 * @param player The player to check for winning moves.
 * @param hands The current hands of all players.
 * @returns An array of moves that would result in a win.
 */
function findWinningMoves(board: BoardState, player: Player, hands: Record<Player, HandState>): Move[] {
  const winningMoves: Move[] = [];
  const playerHand = hands[player];

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      for (const size of SIZES) {
        // Check if the player has the piece and the cell slot is empty
        if (playerHand[size] > 0) {
          const sizeIndex = SIZES.indexOf(size);
          if (board[r][c][sizeIndex] === null) {
            const move: Move = { size, row: r, col: c };
            const tempBoard = applyMove(board, move, player);
            if (checkWinner(tempBoard, player, move)) {
              winningMoves.push(move);
            }
          }
        }
      }
    }
  }
  return winningMoves;
}

/**
 * Finds the best move for the AI based on a priority list.
 * 1. Win if possible.
 * 2. Block any opponent's winning move.
 * 3. Pick a random valid move.
 * @param state The current game state for the AI player.
 * @returns The best move found, or null if no moves are possible.
 */
export const findBestMove = (state: GameState): Move | null => {
  const { board, hands, currentPlayer } = state;
  const otherPlayers = PLAYERS.filter(p => p !== currentPlayer);

  // 1. Priority 1: Find a winning move for the current AI player
  const myWinningMoves = findWinningMoves(board, currentPlayer, hands);
  if (myWinningMoves.length > 0) {
    return myWinningMoves[0]; // Return the first winning move found
  }

  // 2. Priority 2: Block any opponent's winning move
  const threats: Move[] = [];
  for (const otherPlayer of otherPlayers) {
    const opponentWinningMoves = findWinningMoves(board, otherPlayer, hands);
    threats.push(...opponentWinningMoves);
  }

  if (threats.length > 0) {
    const threat = threats[0]; // Focus on blocking the first discovered threat
    const blockingSizes = SIZES.slice(SIZES.indexOf(threat.size)); // Same size or larger

    for (const blockingSize of blockingSizes) {
      if (hands[currentPlayer][blockingSize] > 0) {
        const sizeIndex = SIZES.indexOf(blockingSize);
        // Check if the AI can place a piece in the threatened cell
        // For this game, we block by occupying the *exact same slot*
        if (blockingSize === threat.size && board[threat.row][threat.col][sizeIndex] === null) {
          return { size: blockingSize, row: threat.row, col: threat.col };
        }
      }
    }
  }

  // 3. Priority 3: If no winning or blocking move, pick a random valid move
  const validMoves: Move[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      for (const size of SIZES) {
        if (hands[currentPlayer][size] > 0) {
          const sizeIndex = SIZES.indexOf(size);
          if (board[r][c][sizeIndex] === null) {
            validMoves.push({ size, row: r, col: c });
          }
        }
      }
    }
  }

  if (validMoves.length > 0) {
    const randomIndex = Math.floor(Math.random() * validMoves.length);
    return validMoves[randomIndex];
  }

  return null; // No moves left
};
