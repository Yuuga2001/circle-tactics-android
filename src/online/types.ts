import { BoardState, HandState, PieceSize, Player, WinInfo } from '../types';

export type SessionStatus = 'WAITING' | 'PLAYING' | 'FINISHED';

export interface ServerPlayer {
  clientId: string;
  color: Player;
  lastActiveAt: string;
  isHuman: boolean;
}

export interface GameSession {
  gameId: string;
  roomCode: string;
  status: SessionStatus;
  hostClientId: string;
  players: ServerPlayer[];
  humanCount: number;
  selectedSize: PieceSize | null;
  currentPlayer: Player;
  turnOrder: Player[];
  board: BoardState;
  hands: Record<Player, HandState>;
  winner: Player | null;
  winInfo: WinInfo | null;
  createdAt: string;
  updatedAt: string;
  startedAt: string | null;
  currentTurnStartedAt: string | null;
  waitQueue: string[];
  version: number;
}

export interface CreateGameResponse {
  gameId: string;
  roomCode: string;
  you: { clientId: string; color: Player };
}

export interface JoinResponse {
  you: { clientId: string; color: Player | null };
  players: ServerPlayer[];
  status: SessionStatus | 'QUEUED';
  queuePosition?: number;
  waitQueue?: string[];
}
