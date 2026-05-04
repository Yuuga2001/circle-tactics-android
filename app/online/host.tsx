import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import HostScreen from '../../src/components/HostScreen';
import { getClientId } from '../../src/online/clientId';

export default function HostRoute() {
  const router = useRouter();
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    getClientId().then(setClientId);
  }, []);

  if (clientId === null) return null;

  return (
    <HostScreen
      clientId={clientId}
      onCreated={(gameId, roomCode) => {
        router.replace({
          pathname: '/online/waiting',
          params: { gameId, clientId, roomCode },
        });
      }}
      onBack={() => router.back()}
    />
  );
}
