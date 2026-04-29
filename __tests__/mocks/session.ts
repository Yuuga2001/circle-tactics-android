import type { GameSession } from '../../src/online/types';
import type { CellState } from '../../src/types';

export function makeMockSession(overrides: Partial<GameSession> = {}): GameSession {
  return {
    gameId: 'game-123',
    roomCode: '123456',
    status: 'WAITING',
    hostClientId: 'client-host',
    players: [
      { clientId: 'client-host', color: 'RED', lastActiveAt: new Date().toISOString(), isHuman: true },
    ],
    humanCount: 1,
    board: Array(4).fill(null).map(() =>
      Array(4).fill(null).map(() => [null, null, null] as CellState),
    ) as GameSession['board'],
    hands: {
      RED: { SMALL: 4, MEDIUM: 4, LARGE: 4 },
      BLUE: { SMALL: 4, MEDIUM: 4, LARGE: 4 },
      YELLOW: { SMALL: 4, MEDIUM: 4, LARGE: 4 },
      GREEN: { SMALL: 4, MEDIUM: 4, LARGE: 4 },
    },
    currentPlayer: 'RED',
    selectedSize: null,
    turnOrder: ['RED', 'BLUE', 'YELLOW', 'GREEN'],
    winner: null,
    winInfo: null,
    startedAt: null,
    currentTurnStartedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    waitQueue: [],
    version: 1,
    ...overrides,
  };
}
