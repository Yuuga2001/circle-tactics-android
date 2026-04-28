import type { GameSession } from '../../src/online/types';
import type { CellState } from '../../src/types';

export function makeMockSession(overrides: Partial<GameSession> = {}): GameSession {
  return {
    gameId: 'game-123',
    status: 'WAITING',
    players: [
      { clientId: 'client-host', color: 'RED', lastActiveAt: new Date().toISOString(), isHuman: true },
    ],
    spectators: [],
    board: Array(4).fill(null).map(() =>
      Array(4).fill(null).map(() => [null, null, null] as CellState)
    ),
    hands: {
      RED: { SMALL: 5, MEDIUM: 5, LARGE: 5 },
      BLUE: { SMALL: 5, MEDIUM: 5, LARGE: 5 },
      YELLOW: { SMALL: 5, MEDIUM: 5, LARGE: 5 },
      GREEN: { SMALL: 5, MEDIUM: 5, LARGE: 5 },
    },
    currentPlayer: 'RED',
    selectedSize: null,
    winner: null,
    winInfo: null,
    startedAt: null,
    hostClientId: 'client-host',
    queue: [],
    turnStartedAt: null,
    ...overrides,
  };
}
