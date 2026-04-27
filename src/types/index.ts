export type Player = 'RED' | 'BLUE' | 'YELLOW' | 'GREEN';

export type PieceSize = 'SMALL' | 'MEDIUM' | 'LARGE';

export const SIZES: PieceSize[] = ['SMALL', 'MEDIUM', 'LARGE'];

/** Single-letter shorthand used in compact UI labels. */
export const SIZE_LABEL: Record<PieceSize, string> = {
  SMALL: 'S',
  MEDIUM: 'M',
  LARGE: 'L',
};
export const PLAYERS: Player[] = ['RED', 'BLUE', 'YELLOW', 'GREEN'];

export type Piece = {
  player: Player;
  size: PieceSize;
};

// A cell can contain up to three pieces, one of each size.
// The tuple represents [SMALL, MEDIUM, LARGE]. A null indicates no piece of that size.
export type CellState = [Piece | null, Piece | null, Piece | null];

// The board is a 4x4 grid of cells.
export type BoardState = [
  [CellState, CellState, CellState, CellState],
  [CellState, CellState, CellState, CellState],
  [CellState, CellState, CellState, CellState],
  [CellState, CellState, CellState, CellState]
];

// Represents the number of pieces of each size a player has.
export type HandState = Record<PieceSize, number>;

export type HumanCount = 1 | 2 | 3 | 4;

export type GameMode =
  | 'TITLE'
  | 'PLAYING'
  | 'ONLINE_LOBBY'
  | 'ONLINE_HOSTING'
  | 'ONLINE_JOINING'
  | 'ONLINE_PLAYING';

export interface WinInfo {
  player: Player;
  kind: 'CELL' | 'BOARD';
  cells: Array<{ row: number; col: number }>;
}

export interface GameState {
  board: BoardState;
  hands: Record<Player, HandState>;
  currentPlayer: Player;
  turnOrder: Player[];
  winner: Player | 'DRAW' | null;
  winInfo: WinInfo | null;
  selectedSize: PieceSize | null;
  gameMode: GameMode;
  humanPlayers: Player[];
}

export type Action =
  | { type: 'SELECT_SIZE'; payload: PieceSize }
  | { type: 'PLACE_PIECE'; payload: { row: number; col: number } }
  | { type: 'START_GAME'; payload: { humanPlayers: Player[] } }
  | { type: 'RESTART_GAME' }
  | { type: 'RETURN_TO_TITLE' }
  | { type: 'SKIP_TURN' }
  | { type: 'DECLARE_DRAW' };
