import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import LanguageSelector from './LanguageSelector';
import MenuButton, { MenuMode } from './MenuButton';
import { api } from '../online/api';
import { clearActiveGame } from '../online/activeGame';
import { getClientId } from '../online/clientId';

/**
 * Persistent chrome (LanguageSelector top-left, MenuButton top-right) shown on
 * top of every route — matches the Web app where these live in App.tsx outside
 * the route switch.
 */
const AppChrome: React.FC = () => {
  const router = useRouter();
  const segments = useSegments() as string[];
  const top: string = segments[0] ?? '';
  const second: string = segments[1] ?? '';

  let mode: MenuMode = 'other';
  if (top === '' || segments.length === 0 || top === 'index') mode = 'title';
  else if (top === 'local') mode = 'local';
  else if (top === 'online' && second === 'playing') mode = 'online';

  const goTitle = async () => {
    if (mode === 'online') {
      try {
        const clientId = await getClientId();
        // Best-effort leave — segments give us no gameId here, so we just clear
        // local state and navigate; the OnlineGame screen handles its own leave
        // confirm before unmount when reachable.
        await clearActiveGame();
        void clientId;
      } catch { /* noop */ }
    }
    router.replace('/');
  };

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <View style={styles.left} pointerEvents="box-none">
        <LanguageSelector />
      </View>
      <View style={styles.right} pointerEvents="box-none">
        <MenuButton mode={mode} onTitle={mode === 'title' ? undefined : goTitle} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 0,
    zIndex: 100,
  },
  left: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  right: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
});

export default AppChrome;
