import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import WaitingRoom from '../../src/components/WaitingRoom';
import { saveActiveGame, clearActiveGame } from '../../src/online/activeGame';
import type { GameSession } from '../../src/online/types';

export default function WaitingRoute() {
  const router = useRouter();
  const { gameId, clientId, roomCode } = useLocalSearchParams<{
    gameId: string;
    clientId: string;
    roomCode?: string;
  }>();

  if (!gameId || !clientId) {
    router.replace('/');
    return null;
  }

  const handleGameStart = async (startedSession: GameSession) => {
    const player = startedSession.players.find((p) => p.clientId === clientId);
    await saveActiveGame({
      gameId,
      roomCode: startedSession.roomCode ?? roomCode ?? '',
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
      roomCode={roomCode}
      onGameStart={handleGameStart}
      onLeave={handleLeave}
    />
  );
}
