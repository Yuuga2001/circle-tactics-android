import React, { useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import JoinScreen from '../../src/components/JoinScreen';
import { saveActiveGame } from '../../src/online/activeGame';
import { getClientId } from '../../src/online/clientId';
import type { GameSession } from '../../src/online/types';

export default function JoinRoute() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code?: string }>();
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    getClientId().then(setClientId);
  }, []);

  const handleJoined = async (gameId: string, session: GameSession) => {
    const id = clientId ?? '';
    const player = session.players.find((p) => p.clientId === id);
    await saveActiveGame({
      gameId,
      roomCode: session.roomCode ?? '',
      color: player?.color,
    });
    router.replace({
      pathname: '/online/waiting',
      params: {
        gameId,
        clientId: id,
        session: JSON.stringify(session),
      },
    });
  };

  if (clientId === null) return null;

  return (
    <JoinScreen
      clientId={clientId}
      initialCode={code}
      onJoined={handleJoined}
      onBack={() => router.back()}
    />
  );
}
