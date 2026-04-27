import React from 'react';
import { useRouter } from 'expo-router';
import type { Player } from '../src/types';
import TitleScreen from '../src/components/TitleScreen';

export default function IndexScreen() {
  const router = useRouter();

  const handlePlayLocal = (humanPlayers: Player[]) => {
    router.push({ pathname: '/local', params: { humanPlayers: JSON.stringify(humanPlayers) } });
  };

  const handlePlayOnline = () => {
    router.push('/online/lobby');
  };

  return <TitleScreen onPlayLocal={handlePlayLocal} onPlayOnline={handlePlayOnline} />;
}
