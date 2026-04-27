import {
  shuffleTurnOrder,
  HUMAN_PLAYERS_BY_COUNT,
  DEFAULT_HUMAN_FLAGS,
} from '../../../src/logic/seating';
import { PLAYERS } from '../../../src/types';

afterEach(() => {
  jest.restoreAllMocks();
});

describe('shuffleTurnOrder', () => {
  it('returns all 4 players (no duplicates, no missing)', () => {
    // Arrange, Act
    const result = shuffleTurnOrder();
    // Assert
    expect(result).toHaveLength(4);
    expect([...result].sort()).toEqual([...PLAYERS].sort());
  });

  it('does not mutate the PLAYERS constant', () => {
    // Arrange
    const before = [...PLAYERS];
    // Act
    shuffleTurnOrder();
    // Assert
    expect(PLAYERS).toEqual(before);
  });

  it('with Math.random=0, always swaps to produce a specific order', () => {
    // Arrange: Math.random=0 means j=0 every iteration
    // Fisher-Yates with j=0: swap i=3 with 0, i=2 with 0, i=1 with 0
    jest.spyOn(Math, 'random').mockReturnValue(0);
    // Act
    const result = shuffleTurnOrder();
    // Assert: all players still present
    expect([...result].sort()).toEqual([...PLAYERS].sort());
  });

  it('with Math.random=0.99, picks near-end indices', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.9999);
    const result = shuffleTurnOrder();
    expect([...result].sort()).toEqual([...PLAYERS].sort());
  });
});

describe('HUMAN_PLAYERS_BY_COUNT', () => {
  it('count=1 → only RED', () => {
    expect(HUMAN_PLAYERS_BY_COUNT[1]).toEqual(['RED']);
  });

  it('count=2 → RED and BLUE', () => {
    expect(HUMAN_PLAYERS_BY_COUNT[2]).toEqual(['RED', 'BLUE']);
  });

  it('count=3 → RED, BLUE, YELLOW', () => {
    expect(HUMAN_PLAYERS_BY_COUNT[3]).toEqual(['RED', 'BLUE', 'YELLOW']);
  });

  it('count=4 → all players', () => {
    expect(HUMAN_PLAYERS_BY_COUNT[4]).toEqual(['RED', 'BLUE', 'YELLOW', 'GREEN']);
  });
});

describe('DEFAULT_HUMAN_FLAGS', () => {
  it('RED is human by default', () => {
    expect(DEFAULT_HUMAN_FLAGS.RED).toBe(true);
  });

  it('BLUE, YELLOW, GREEN are AI by default', () => {
    expect(DEFAULT_HUMAN_FLAGS.BLUE).toBe(false);
    expect(DEFAULT_HUMAN_FLAGS.YELLOW).toBe(false);
    expect(DEFAULT_HUMAN_FLAGS.GREEN).toBe(false);
  });
});
