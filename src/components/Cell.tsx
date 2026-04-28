import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  cancelAnimation,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';
import { CellState, Player, SIZES } from '../types';
import { COLORS, RADIUS, PLAYER_BORDER_COLORS } from '../styles/theme';
import Piece from './Piece';

interface CellProps {
  row: number;
  col: number;
  cell: CellState;
  cellSize: number;
  onPress: () => void;
  isWinning?: boolean;
  winningPlayer?: Player | null;
  isValid?: boolean;
  isDragOver?: boolean;
}

const Cell: React.FC<CellProps> = ({
  row,
  col,
  cell,
  cellSize,
  onPress,
  isWinning,
  winningPlayer,
  isValid,
  isDragOver,
}) => {
  const validPulse = useSharedValue(0);
  const winPulse = useSharedValue(0);
  const pressed = useSharedValue(0);

  // valid-pulse: 1.4s ease-in-out infinite alternate (Web の inset shadow を境界線で擬似再現)
  useEffect(() => {
    if (isValid && !isWinning) {
      validPulse.value = withRepeat(
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
        -1,
        true,
      );
    } else {
      cancelAnimation(validPulse);
      validPulse.value = withTiming(0, { duration: 200 });
    }
  }, [isValid, isWinning, validPulse]);

  // win-pulse: 1.1s ease-in-out infinite (gold glow)
  useEffect(() => {
    if (isWinning) {
      winPulse.value = withRepeat(
        withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.quad) }),
        -1,
        true,
      );
    } else {
      cancelAnimation(winPulse);
      winPulse.value = withTiming(0, { duration: 200 });
    }
  }, [isWinning, winPulse]);

  const animatedContainer = useAnimatedStyle(() => {
    const winBg = interpolateColor(
      winPulse.value,
      [0, 1],
      ['rgba(255,248,196,0.7)', 'rgba(255,248,196,1)'],
    );
    return {
      transform: [{ scale: 1 - pressed.value * 0.06 }],
      backgroundColor: isWinning ? winBg : isDragOver ? 'rgba(255,193,7,0.32)' : COLORS.cell,
      borderColor: isWinning ? '#ffd54f' : COLORS.boardFrame,
    };
  });

  const animatedGlow = useAnimatedStyle(() => ({
    opacity: isWinning ? winPulse.value : 0,
  }));

  const animatedValidRing = useAnimatedStyle(() => ({
    opacity: isValid && !isWinning ? 0.5 + validPulse.value * 0.5 : 0,
  }));

  const dragOverStyle: ViewStyle | null = isDragOver
    ? { borderWidth: 3, borderColor: COLORS.highlight, transform: [{ scale: 0.97 }] }
    : null;

  return (
    <Pressable
      testID={`cell-${row}-${col}`}
      onPress={onPress}
      onPressIn={() => {
        pressed.value = withTiming(1, { duration: 80 });
      }}
      onPressOut={() => {
        pressed.value = withTiming(0, { duration: 120 });
      }}
      style={[styles.pressable, { width: cellSize, height: cellSize }]}
    >
      <Animated.View
        style={[
          styles.cellBase,
          { width: cellSize, height: cellSize },
          animatedContainer,
          dragOverStyle,
        ]}
      >
        {/* 勝利時のゴールドグロー（複数オーバーレイで疑似 box-shadow） */}
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            styles.winGlow,
            animatedGlow,
          ]}
        />
        {/* 有効セルの白パルス枠 */}
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            styles.validRing,
            animatedValidRing,
          ]}
        />
        {/* ピース描画: LARGE→MEDIUM→SMALL の順で z-index を効かせる */}
        {/* overflow:'visible' は Android でコンテナ外へのはみ出し描画を許可するために必須 */}
        <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, { overflow: 'visible' }]}>
          {SIZES.map((size, idx) => {
            const piece = cell[idx];
            if (!piece) return null;
            return (
              <Piece
                key={size}
                player={piece.player}
                size={size}
                cellSize={cellSize - 4}
                testID={`piece-${row}-${col}-${size.toLowerCase()}`}
              />
            );
          })}
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressable: {
    position: 'relative',
  },
  cellBase: {
    borderRadius: RADIUS.cell,
    borderWidth: 2,
    overflow: 'visible',
  },
  winGlow: {
    borderRadius: RADIUS.cell,
    borderWidth: 3,
    borderColor: '#fff8b0',
    shadowColor: '#ffe66e',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 26,
    elevation: 18,
  },
  validRing: {
    borderRadius: RADIUS.cell,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,1)',
  },
});

export default Cell;
