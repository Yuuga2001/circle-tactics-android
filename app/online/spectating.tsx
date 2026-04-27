import React, { useMemo } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import SpectatorView from '../../src/components/SpectatorView';
import { clearActiveGame, saveActiveGame } from '../../src/online/activeGame';
import type { GameSession } from '../../src/online/types';

export default function SpectatingRoute() {
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

  const handleJoined = async () => {
    router.replace({
      pathname: '/online/waiting',
      params: {
        gameId,
        clientId,
        session: sessionParam,
      },
    });
  };

  const handleLeave = async () => {
    await clearActiveGame();
    router.replace('/');
  };

  return (
    <SpectatorView
      gameId={gameId}
      clientId={clientId}
      session={session}
      onJoined={handleJoined}
      onLeave={handleLeave}
    />
  );
}
