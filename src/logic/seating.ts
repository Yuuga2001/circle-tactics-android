import { Player, HumanCount, PLAYERS } from '../types';

// Player → Human mapping per count: always picked in PLAYERS order (RED → BLUE → YELLOW → GREEN).
// Used by the online flow where the host selects a single "humanCount" value.
export const HUMAN_PLAYERS_BY_COUNT: Record<HumanCount, Player[]> = {
  1: ['RED'],
  2: ['RED', 'BLUE'],
  3: ['RED', 'BLUE', 'YELLOW'],
  4: ['RED', 'BLUE', 'YELLOW', 'GREEN'],
};

// Initial seat assignment for the Local Play picker: RED is human, others are AI.
export const DEFAULT_HUMAN_FLAGS: Record<Player, boolean> = {
  RED: true,
  BLUE: false,
  YELLOW: false,
  GREEN: false,
};

// Fisher-Yates shuffle, returns a new array.
export function shuffleTurnOrder(): Player[] {
  const arr = [...PLAYERS];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
