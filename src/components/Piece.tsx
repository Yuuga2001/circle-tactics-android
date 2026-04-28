import React, { useEffect } from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Player, PieceSize } from '../types';
import {
  PLAYER_COLORS,
  PLAYER_BORDER_COLORS,
  PIECE_SIZE_RATIO,
  PIECE_VERTICAL_OFFSET_RATIO,
  PIECE_Z_INDEX,
} from '../styles/theme';

interface PieceProps {
  player: Player;
  size: PieceSize;
  cellSize: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  /** When true, skip the entrance animation (used for static demos / preview UI). */
  static?: boolean;
}

const Piece: React.FC<PieceProps> = ({ player, size, cellSize, style, testID, static: isStatic }) => {
  const diameter = cellSize * PIECE_SIZE_RATIO[size];
  const verticalOffset = diameter * PIECE_VERTICAL_OFFSET_RATIO[size];

  const scale = useSharedValue(isStatic ? 1 : 0.5);
  const opacity = useSharedValue(isStatic ? 1 : 0);

  useEffect(() => {
    if (isStatic) return;
    scale.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.quad) });
    opacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.quad) });
  }, [isStatic, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      testID={testID}
      pointerEvents="none"
      style={[
        styles.absolute,
        {
          width: diameter,
          height: diameter,
          borderRadius: diameter / 2,
          backgroundColor: PLAYER_COLORS[player],
          borderWidth: 2,
          borderColor: PLAYER_BORDER_COLORS[player],
          // Center the piece in the cell, then apply the size-specific vertical
          // offset so SMALL pieces sit a bit above center, LARGE a bit below —
          // matching Web's translate(-50%, -80% / -50% / -20%).
          left: (cellSize - diameter) / 2,
          top: (cellSize - diameter) / 2 + verticalOffset,
          zIndex: PIECE_Z_INDEX[size],
        },
        animatedStyle,
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  absolute: { position: 'absolute' },
});

export default Piece;
