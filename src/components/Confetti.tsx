import React, { useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';

const COLORS = [
  '#ffc107', '#f44336', '#4caf50', '#2196f3', '#e91e63',
  '#ff9800', '#9c27b0', '#00bcd4', '#8bc34a', '#ffeb3b',
  '#795548', '#cddc39', '#607d8b', '#ff5722', '#03a9f4',
];

interface ConfettiPieceProps {
  left: string;
  delay: number;
  color: string;
  height: number;
}

const ConfettiPiece: React.FC<ConfettiPieceProps> = ({ left, delay, color, height }) => {
  const ty = useSharedValue(-30);
  const rot = useSharedValue(0);

  useEffect(() => {
    ty.value = withDelay(
      delay,
      withRepeat(withTiming(height + 60, { duration: 4000, easing: Easing.out(Easing.quad) }), -1, false),
    );
    rot.value = withDelay(
      delay,
      withRepeat(withTiming(360, { duration: 4000, easing: Easing.linear }), -1, false),
    );
    return () => {
      cancelAnimation(ty);
      cancelAnimation(rot);
    };
  }, [delay, height, rot, ty]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: ty.value }, { rotate: `${rot.value}deg` }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.piece,
        { left: left as `${number}%`, backgroundColor: color },
        style,
      ]}
    />
  );
};

interface ConfettiProps {
  count?: number;
}

const Confetti: React.FC<ConfettiProps> = ({ count = 50 }) => {
  const { height } = Dimensions.get('window');
  const pieces = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 5000,
      color: COLORS[i % COLORS.length],
    }));
  }, [count]);

  return (
    <>
      {pieces.map((p, idx) => (
        <ConfettiPiece key={idx} left={p.left} delay={p.delay} color={p.color} height={height} />
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  piece: {
    position: 'absolute',
    top: 0,
    width: 10,
    height: 20,
    opacity: 0.9,
    zIndex: 40,
  },
});

export default Confetti;
