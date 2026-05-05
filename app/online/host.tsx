import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import WaitingRoom from '../../src/components/WaitingRoom';
import { getClientId } from '../../src/online/clientId';

export default function HostRoute() {
  const router = useRouter();
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    getClientId().then(setClientId);
  }, []);

  if (clientId === null) return null;

  return (
    <WaitingRoom
      gameId=""
      clientId={clientId}
      onGameStart={(session) => {
        router.replace({
          pathname: '/online/playing',
          params: { gameId: session.gameId, clientId, session: JSON.stringify(session) },
        });
      }}
      onLeave={() => router.back()}
    />
  );
}
