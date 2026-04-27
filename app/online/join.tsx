import React, { useEffect, useRef } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import JoinScreen from '../../src/components/JoinScreen';
import { saveActiveGame } from '../../src/online/activeGame';
import { getClientId } from '../../src/online/clientId';
import type { GameSession } from '../../src/online/types';

export default function JoinRoute() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code?: string }>();
  const clientIdRef = useRef<string>('');

  useEffect(() => {
    getClientId().then((id) => { clientIdRef.current = id; });
  }, []);

  const handleJoined = async (gameId: string, session: GameSession) => {
    const player = session.players.find((p) => p.clientId === clientIdRef.current);
    await saveActiveGame({
      gameId,
      roomCode: session.roomCode ?? '',
      color: player?.color,
    });
    router.replace({
      pathname: '/online/waiting',
      params: {
        gameId,
        clientId: clientIdRef.current,
        session: JSON.stringify(session),
      },
    });
  };

  return (
    <JoinScreen
      clientId={clientIdRef.current}
      initialCode={code}
      onJoined={handleJoined}
      onBack={() => router.back()}
    />
  );
}
