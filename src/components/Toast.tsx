import React, { useEffect } from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { COLORS, FONT_FAMILY, FONT_SIZE, SHADOWS } from '../styles/theme';

interface ToastProps {
  message: string | null;
  duration?: number;
  onDismiss?: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, duration = 2000, onDismiss }) => {
  const ty = useSharedValue(40);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!message) return;
    ty.value = withTiming(0, { duration: 250, easing: Easing.out(Easing.quad) });
    opacity.value = withSequence(
      withTiming(1, { duration: 250, easing: Easing.out(Easing.quad) }),
      withDelay(Math.max(0, duration - 650), withTiming(0, { duration: 400, easing: Easing.in(Easing.quad) })),
    );
    const timer = setTimeout(() => onDismiss?.(), duration);
    return () => clearTimeout(timer);
  }, [message, duration, onDismiss, opacity, ty]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: ty.value }],
    opacity: opacity.value,
  }));

  if (!message) return null;

  return (
    <Animated.View style={[styles.container, SHADOWS.elevated, animStyle]} pointerEvents="box-none">
      <Pressable testID="toast-container" onPress={onDismiss}>
        <Text style={styles.text}>{message}</Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    backgroundColor: 'rgba(40, 25, 20, 0.92)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    maxWidth: 320,
  },
  text: {
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.white,
    fontSize: FONT_SIZE.body,
    textAlign: 'center',
  },
});

export default Toast;
