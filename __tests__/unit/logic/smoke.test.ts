import { createInitialGameState, gameReducer } from '../../../src/logic/gameReducer';

describe('smoke test', () => {
  it('createInitialGameState が動く', () => {
    const state = createInitialGameState();
    expect(state).toBeDefined();
    expect(state.board).toHaveLength(4);
  });

  it('START_GAME アクションが動く', () => {
    const state = gameReducer(createInitialGameState(), {
      type: 'START_GAME',
      payload: { humanPlayers: ['RED'] },
    });
    expect(state.humanPlayers).toContain('RED');
  });
});
