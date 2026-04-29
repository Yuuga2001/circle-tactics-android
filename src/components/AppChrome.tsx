import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useSegments } from 'expo-router';
import MenuButton, { MenuMode } from './MenuButton';
import { api } from '../online/api';
import { clearActiveGame } from '../online/activeGame';
import { getClientId } from '../online/clientId';
import { COLORS, FONT_FAMILY, FONT_SIZE } from '../styles/theme';

const AppChrome: React.FC = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const segments = useSegments() as string[];
  const top: string = segments[0] ?? '';
  const second: string = segments[1] ?? '';

  let mode: MenuMode = 'other';
  if (top === '' || segments.length === 0 || top === 'index') mode = 'title';
  else if (top === 'local') mode = 'local';
  else if (top === 'online' && second === 'playing') mode = 'online';

  const isPlaying = mode === 'local' || mode === 'online';

  const goTitle = async () => {
    if (mode === 'online') {
      try {
        const clientId = await getClientId();
        await clearActiveGame();
        void clientId;
      } catch { /* noop */ }
    }
    router.replace('/');
  };

  const topOffset = insets.top + 8;

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <View style={[styles.left, { top: topOffset }]} pointerEvents="box-none">
        <Text style={styles.appTitle}>CircleTactics</Text>
      </View>
      <View style={[styles.right, { top: topOffset }]} pointerEvents="box-none">
        <MenuButton mode={mode} onTitle={isPlaying ? goTitle : undefined} />
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
    left: 12,
  },
  right: {
    position: 'absolute',
    right: 12,
  },
  appTitle: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.md,
    color: COLORS.boardFrame,
    letterSpacing: 1,
    paddingVertical: 7,
  },
});

export default AppChrome;
