import React, { useMemo } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import OnlineGame from '../../src/components/OnlineGame';
import ErrorView from '../../src/components/ErrorView';
import { clearActiveGame } from '../../src/online/activeGame';
import type { GameSession } from '../../src/online/types';

export default function PlayingRoute() {
  const router = useRouter();
  const { gameId, clientId, session: sessionParam } = useLocalSearchParams<{
    gameId: string;
    clientId: string;
    session: string;
  }>();

  const initialSession = useMemo<GameSession | null>(() => {
    try {
      return JSON.parse(sessionParam ?? 'null') as GameSession;
    } catch {
      return null;
    }
  }, [sessionParam]);

  if (!initialSession || !gameId || !clientId) {
    return (
      <ErrorView
        onBack={() => router.replace('/')}
      />
    );
  }

  const handleLeave = async () => {
    await clearActiveGame();
    router.replace('/');
  };

  const handleDemoted = async (spectatorSession: GameSession) => {
    router.replace({
      pathname: '/online/spectating',
      params: {
        gameId,
        clientId,
        session: JSON.stringify(spectatorSession),
      },
    });
  };

  return (
    <OnlineGame
      gameId={gameId}
      clientId={clientId}
      initialSession={initialSession}
      onLeave={handleLeave}
      onDemoted={handleDemoted}
    />
  );
}
