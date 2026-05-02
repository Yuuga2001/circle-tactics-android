import React, { useReducer, useRef } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { gameReducer, createInitialGameState } from '../src/logic/gameReducer';
import type { Player } from '../src/types';
import GameComponent from '../src/components/Game';
import { useRegisterNewGame } from '../src/hooks/useNewGame';

export default function LocalScreen() {
  const router = useRouter();
  const { humanPlayers: humanPlayersParam } = useLocalSearchParams<{ humanPlayers: string }>();

  const humanPlayers: Player[] = React.useMemo(() => {
    try {
      return JSON.parse(humanPlayersParam ?? '["RED"]') as Player[];
    } catch {
      return ['RED'];
    }
  }, [humanPlayersParam]);

  const initialState = React.useMemo(() => {
    const base = createInitialGameState();
    return gameReducer(base, { type: 'START_GAME', payload: { humanPlayers } });
  }, [humanPlayers]);

  const [state, dispatch] = useReducer(gameReducer, initialState);

  const restartRef = useRef<(() => void) | null>(null);
  useRegisterNewGame(() => restartRef.current?.());

  // When state returns to TITLE mode, go back
  React.useEffect(() => {
    if (state.gameMode === 'TITLE') {
      router.replace('/');
    }
  }, [state.gameMode, router]);

  return <GameComponent state={state} dispatch={dispatch} restartRef={restartRef} />;
}
