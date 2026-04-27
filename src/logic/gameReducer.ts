import { GameState, Action, SIZES, Player, BoardState, HandState, PLAYERS } from '../types';
import { checkWinner, isBoardFull } from './winConditions';
import { shuffleTurnOrder } from './seating';

function freshBoardAndHands(): { board: BoardState; hands: Record<Player, HandState> } {
  const initialHand: HandState = { SMALL: 4, MEDIUM: 4, LARGE: 4 };
  return {
    board: Array(4).fill(null).map(() => Array(4).fill(null).map(() => [null, null, null])) as BoardState,
    hands: {
      RED: { ...initialHand },
      BLUE: { ...initialHand },
      YELLOW: { ...initialHand },
      GREEN: { ...initialHand },
    },
  };
}

export function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SELECT_SIZE': {
      if (state.gameMode !== 'PLAYING') return state;
      if (state.winner || state.hands[state.currentPlayer][action.payload] === 0) {
        return state;
      }
      // Selecting is sticky — clicking the same size again does nothing.
      // Players can switch to a different size, but they cannot deselect.
      return {
        ...state,
        selectedSize: action.payload,
      };
    }

    case 'PLACE_PIECE': {
      if (state.gameMode !== 'PLAYING') return state;
      const { row, col } = action.payload;
      const { selectedSize, currentPlayer, board, hands, winner, turnOrder } = state;

      if (!selectedSize || winner) return state;
      if (hands[currentPlayer][selectedSize] <= 0) return state;

      const sizeIndex = SIZES.indexOf(selectedSize);
      if (board[row][col][sizeIndex] !== null) return state;

      const newBoard = board.map(r => r.map(c => [...c])) as BoardState;
      const newHands = JSON.parse(JSON.stringify(hands)) as Record<Player, HandState>;

      newBoard[row][col][sizeIndex] = { player: currentPlayer, size: selectedSize };
      newHands[currentPlayer][selectedSize]--;

      const winResult = checkWinner(newBoard, currentPlayer, { row, col });
      if (winResult) {
        return {
          ...state,
          board: newBoard,
          hands: newHands,
          winner: winResult.player,
          winInfo: winResult,
          selectedSize: null,
        };
      }

      if (isBoardFull(newBoard)) {
        return { ...state, board: newBoard, hands: newHands, winner: 'DRAW', winInfo: null, selectedSize: null };
      }

      const currentIdx = turnOrder.indexOf(currentPlayer);
      const nextPlayer = turnOrder[(currentIdx + 1) % turnOrder.length];

      return { ...state, board: newBoard, hands: newHands, currentPlayer: nextPlayer, selectedSize: null };
    }

    case 'SKIP_TURN': {
      if (state.winner) return state;
      const { currentPlayer, turnOrder } = state;
      const idx = turnOrder.indexOf(currentPlayer);
      const nextPlayer = turnOrder[(idx + 1) % turnOrder.length];
      return { ...state, currentPlayer: nextPlayer, selectedSize: null };
    }

    case 'DECLARE_DRAW': {
      return { ...state, winner: 'DRAW', winInfo: null, selectedSize: null };
    }

    case 'START_GAME': {
      const fresh = freshBoardAndHands();
      const turnOrder = shuffleTurnOrder();
      return {
        ...fresh,
        currentPlayer: turnOrder[0],
        turnOrder,
        winner: null,
        winInfo: null,
        selectedSize: null,
        gameMode: 'PLAYING',
        humanPlayers: action.payload.humanPlayers,
      };
    }

    case 'RESTART_GAME': {
      const fresh = freshBoardAndHands();
      const turnOrder = shuffleTurnOrder();
      return {
        ...state,
        ...fresh,
        currentPlayer: turnOrder[0],
        turnOrder,
        winner: null,
        winInfo: null,
        selectedSize: null,
      };
    }

    case 'RETURN_TO_TITLE': {
      return createInitialGameState();
    }

    default:
      return state;
  }
}

export const createInitialGameState = (): GameState => {
  const fresh = freshBoardAndHands();
  return {
    ...fresh,
    currentPlayer: 'RED',
    turnOrder: [...PLAYERS],
    winner: null,
    winInfo: null,
    selectedSize: null,
    gameMode: 'TITLE',
    humanPlayers: [],
  };
};
