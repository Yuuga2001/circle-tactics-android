import React, { useMemo } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import WaitingRoom from '../../src/components/WaitingRoom';
import { saveActiveGame } from '../../src/online/activeGame';
import { clearActiveGame } from '../../src/online/activeGame';
import type { GameSession } from '../../src/online/types';

export default function WaitingRoute() {
  const router = useRouter();
  const { gameId, clientId, session: sessionParam } = useLocalSearchParams<{
    gameId: string;
    clientId: string;
    session: string;
  }>();

  const session = useMemo<GameSession | null>(() => {
    try {
      return JSON.parse(sessionParam ?? 'null') as GameSession;
    } catch {
      return null;
    }
  }, [sessionParam]);

  if (!session || !gameId || !clientId) {
    router.replace('/');
    return null;
  }

  const handleGameStart = async (startedSession: GameSession) => {
    const player = startedSession.players.find((p) => p.clientId === clientId);
    await saveActiveGame({
      gameId,
      roomCode: startedSession.roomCode ?? '',
      color: player?.color,
    });
    router.replace({
      pathname: '/online/playing',
      params: {
        gameId,
        clientId,
        session: JSON.stringify(startedSession),
      },
    });
  };

  const handleLeave = async () => {
    await clearActiveGame();
    router.replace('/');
  };

  return (
    <WaitingRoom
      gameId={gameId}
      clientId={clientId}
      session={session}
      onGameStart={handleGameStart}
      onLeave={handleLeave}
    />
  );
}
