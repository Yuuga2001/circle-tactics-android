import React, { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import HostScreen from '../../src/components/HostScreen';
import { saveActiveGame } from '../../src/online/activeGame';
import { getClientId } from '../../src/online/clientId';
import type { GameSession } from '../../src/online/types';

export default function HostRoute() {
  const router = useRouter();
  const clientIdRef = useRef<string>('');

  useEffect(() => {
    getClientId().then((id) => { clientIdRef.current = id; });
  }, []);

  const handleGameStart = async (session: GameSession) => {
    const player = session.players.find((p) => p.clientId === clientIdRef.current);
    await saveActiveGame({
      gameId: session.gameId,
      roomCode: session.roomCode ?? '',
      color: player?.color,
    });
    router.replace({
      pathname: '/online/playing',
      params: { gameId: session.gameId, clientId: clientIdRef.current },
    });
  };

  return (
    <HostScreen
      gameId=""
      clientId={clientIdRef.current}
      onGameStart={handleGameStart}
      onBack={() => router.back()}
    />
  );
}
