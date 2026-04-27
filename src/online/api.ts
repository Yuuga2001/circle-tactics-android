import type { PieceSize } from '../types';
import type { CreateGameResponse, GameSession, JoinResponse } from './types';

const BASE_URL =
  (process.env.EXPO_PUBLIC_API_BASE_URL as string | undefined)?.replace(/\/$/, '') || '';

class ApiError extends Error {
  status: number;
  code?: string;
  constructor(status: number, code?: string, message?: string) {
    super(message ?? code ?? `HTTP ${status}`);
    this.status = status;
    this.code = code;
  }
}

async function request<T>(
  method: 'GET' | 'POST',
  path: string,
  body?: Record<string, unknown>,
): Promise<T> {
  if (!BASE_URL) {
    throw new ApiError(0, 'NO_API_BASE_URL', 'EXPO_PUBLIC_API_BASE_URL is not set');
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    // empty body
  }
  if (!res.ok) {
    const j = json as { error?: string } | null;
    throw new ApiError(res.status, j?.error, j?.error || `HTTP ${res.status}`);
  }
  return json as T;
}

export const api = {
  createGame: (clientId: string) =>
    request<CreateGameResponse>('POST', '/game', { clientId }),

  getByRoomCode: (roomCode: string) =>
    request<{ gameId: string }>('GET', `/game/by-code/${encodeURIComponent(roomCode)}`),

  join: (gameId: string, clientId: string, previousColor?: string) =>
    request<JoinResponse>('POST', `/game/${gameId}/join`, {
      clientId,
      ...(previousColor ? { previousColor } : {}),
    }),

  getGame: (gameId: string) =>
    request<GameSession>('GET', `/game/${gameId}`),

  heartbeat: (gameId: string, clientId: string) =>
    request<{ ok: true }>('POST', `/game/${gameId}/heartbeat`, { clientId }),

  start: (gameId: string, clientId: string, humanCount: number) =>
    request<GameSession>('POST', `/game/${gameId}/start`, { clientId, humanCount }),

  selectSize: (gameId: string, clientId: string, size: PieceSize) =>
    request<GameSession>('POST', `/game/${gameId}/select-size`, { clientId, size }),

  placePiece: (gameId: string, clientId: string, row: number, col: number, size?: PieceSize) =>
    request<GameSession>('POST', `/game/${gameId}/place-piece`, { clientId, row, col, size }),

  restart: (gameId: string, clientId: string) =>
    request<GameSession>('POST', `/game/${gameId}/restart`, { clientId }),

  leave: (gameId: string, clientId: string) =>
    request<{ ok: true }>('POST', `/game/${gameId}/leave`, { clientId }),
};

export { ApiError };

const ERROR_MESSAGES: Record<string, string> = {
  NOT_FOUND: 'Room not found',
  GAME_ALREADY_STARTED: 'Game already finished',
  ROOM_FULL: 'Room is full',
  WRONG_TURN: "It's not your turn",
  CELL_OCCUPIED: 'That slot is already taken',
  NO_PIECE: 'No pieces of that size left',
  NO_SIZE_SELECTED: 'Select a piece size first',
  GAME_OVER: 'The game is already over',
  NOT_PLAYING: 'Game has not started yet',
  NOT_HOST: 'Only the host can do that',
  NOT_FINISHED: 'Game is still in progress',
  NOT_IN_GAME: 'You are not in this game',
  CLIENT_ID_REQUIRED: 'Client ID missing',
  ROOM_CODE_REQUIRED: 'Enter a room code',
  ROOM_CODE_EXHAUSTED: 'Could not generate a room code — please try again',
  INVALID_REQUEST: 'Invalid request',
  INVALID_HUMAN_COUNT: 'Invalid player count',
  TOO_MANY_PLAYERS: 'Too many players',
  ALREADY_STARTED: 'Already started',
  GAME_ID_REQUIRED: 'Game ID missing',
  NO_API_BASE_URL: 'API URL is not configured',
};

export function friendlyError(error: unknown): string {
  if (error instanceof ApiError && error.code && ERROR_MESSAGES[error.code]) {
    return ERROR_MESSAGES[error.code];
  }
  if (error instanceof ApiError && error.code) return error.code;
  if (error instanceof Error) {
    if (ERROR_MESSAGES[error.message]) return ERROR_MESSAGES[error.message];
    return error.message;
  }
  return 'Something went wrong';
}
