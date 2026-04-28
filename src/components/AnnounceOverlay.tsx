import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Player } from '../types';
import {
  COLORS,
  PLAYER_BORDER_COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  RADIUS,
  SHADOWS,
} from '../styles/theme';

interface AnnounceOverlayProps {
  player: Player;
  label: string;
  role: string;
}

const AnnounceOverlay: React.FC<AnnounceOverlayProps> = ({ player, label, role }) => {
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // announce-pop: 0.6 → 1.08 → 1 in ~0.45s
    scale.value = withSequence(
      withTiming(1.08, { duration: 270, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 180, easing: Easing.inOut(Easing.quad) }),
    );
    // announce-fade: visible 0–70%, fades 70–100% over 1.2s
    opacity.value = withSequence(
      withTiming(1, { duration: 250, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 600 }),
      withTiming(0, { duration: 350, easing: Easing.in(Easing.quad) }),
    );
  }, [opacity, scale]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFillObject, styles.overlay, overlayStyle]} pointerEvents="none">
      <Animated.View style={[styles.card, { borderColor: PLAYER_BORDER_COLORS[player] }, SHADOWS.announce, cardStyle]}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.color, { color: PLAYER_BORDER_COLORS[player] }]}>{player}</Text>
        <Text style={styles.role}>{role}</Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
  },
  card: {
    paddingVertical: 18,
    paddingHorizontal: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 4,
    alignItems: 'center',
  },
  label: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.sm,
    color: COLORS.boardFrame,
    letterSpacing: 4,
  },
  color: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 32,
    letterSpacing: 2,
    marginVertical: 2,
  },
  role: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.md,
    color: '#444',
    letterSpacing: 1.5,
  },
});

export default AnnounceOverlay;
