import React from 'react';
import { useRouter } from 'expo-router';
import LobbyScreen from '../../src/components/LobbyScreen';

export default function LobbyRoute() {
  const router = useRouter();

  return (
    <LobbyScreen
      onCreateRoom={() => router.push('/online/host')}
      onJoinRoom={() => router.push('/online/join')}
      onBack={() => router.back()}
    />
  );
}
