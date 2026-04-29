import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import HostScreen from '../../src/components/HostScreen';
import { saveActiveGame } from '../../src/online/activeGame';
import { getClientId } from '../../src/online/clientId';
import type { GameSession } from '../../src/online/types';

export default function HostRoute() {
  const router = useRouter();
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    getClientId().then(setClientId);
  }, []);

  const handleGameStart = async (session: GameSession) => {
    const id = clientId ?? '';
    const player = session.players.find((p) => p.clientId === id);
    await saveActiveGame({
      gameId: session.gameId,
      roomCode: session.roomCode ?? '',
      color: player?.color,
    });
    router.replace({
      pathname: '/online/playing',
      params: { gameId: session.gameId, clientId: id, session: JSON.stringify(session) },
    });
  };

  if (clientId === null) return null;

  return (
    <HostScreen
      clientId={clientId}
      onGameStart={handleGameStart}
      onBack={() => router.back()}
    />
  );
}
