import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Player, PieceSize, HandState, SIZES } from '../types';
import {
  COLORS,
  PLAYER_COLORS,
  PLAYER_BORDER_COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  RADIUS,
  SHADOWS,
} from '../styles/theme';

interface PlayerHandProps {
  player: Player;
  hand: HandState;
  selectedSize: PieceSize | null;
  onSelectSize: (size: PieceSize) => void;
  isCurrentPlayer?: boolean;
  variant?: 'full' | 'compact';
  label?: string;
  interactive?: boolean;
  draggingSize?: PieceSize | null;
  bindPiecePointerDown?: (size: PieceSize) => Record<string, unknown>;
}

const PREVIEW_SIZE: Record<PieceSize, number> = {
  SMALL: 20,
  MEDIUM: 36,
  LARGE: 56,
};

const PlayerHand: React.FC<PlayerHandProps> = ({
  player,
  hand,
  selectedSize,
  onSelectSize,
  isCurrentPlayer = true,
  variant = 'full',
  label,
  interactive,
  draggingSize,
  bindPiecePointerDown,
}) => {
  const isInteractive = interactive ?? (variant === 'full' && isCurrentPlayer);
  const playerDark = PLAYER_BORDER_COLORS[player];

  return (
    <View
      style={[
        styles.container,
        SHADOWS.subtle,
        { borderColor: playerDark },
        isCurrentPlayer ? styles.active : null,
      ]}
    >
      {label !== undefined && (
        <Text style={[styles.label, { color: playerDark }]}>{label || ' '}</Text>
      )}
      <View style={styles.pieces}>
        {SIZES.map((size) => {
          const count = hand[size];
          const isSelected = selectedSize === size && isInteractive;
          const isDisabled = !isInteractive || count === 0;
          const isDragging = draggingSize === size;
          const containerStyle: ViewStyle[] = [styles.pieceSelector];
          if (isSelected) containerStyle.push(styles.selected);
          if (isDisabled) containerStyle.push(styles.disabled);
          if (isDragging) containerStyle.push(styles.dragging);

          const dia = PREVIEW_SIZE[size];

          const extraHandlers = isInteractive && count > 0 && bindPiecePointerDown
            ? bindPiecePointerDown(size)
            : {};

          return (
            <Pressable
              key={size}
              testID={`size-btn-${size}`}
              disabled={isDisabled}
              accessibilityState={{ selected: isSelected }}
              onPress={() => {
                if (!isDisabled) onSelectSize(size);
              }}
              style={({ pressed }) => [
                ...containerStyle,
                pressed && !isDisabled
                  ? { transform: [{ scale: 0.96 }, { translateY: 2 }], backgroundColor: 'rgba(255,193,7,0.18)' }
                  : null,
              ]}
              {...(extraHandlers as object)}
            >
              <View
                testID={`piece-preview-${size}`}
                style={{
                  width: dia,
                  height: dia,
                  borderRadius: dia / 2,
                  backgroundColor: PLAYER_COLORS[player],
                  borderWidth: 3,
                  borderColor: playerDark,
                  opacity: isDisabled ? 0.6 : 1,
                }}
              />
              <Text style={styles.pieceCount}>x {count}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: RADIUS.card,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 3,
  },
  active: {
    ...SHADOWS.standard,
  },
  label: {
    textAlign: 'center',
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.sm,
    letterSpacing: 1.5,
    marginBottom: 6,
    minHeight: 16,
    textTransform: 'uppercase',
  },
  pieces: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: 8,
  },
  pieceSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 9,
    paddingHorizontal: 6,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: 'transparent',
    backgroundColor: 'rgba(255,255,255,0.6)',
    minWidth: 0,
  } as ViewStyle,
  selected: {
    borderColor: COLORS.highlight,
    backgroundColor: 'rgba(255,193,7,0.28)',
    transform: [{ translateY: -2 }],
    ...SHADOWS.standard,
  } as ViewStyle,
  disabled: {
    opacity: 0.55,
  },
  dragging: {
    opacity: 0.4,
  },
  pieceCount: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.lg,
    color: '#333',
  } as TextStyle,
});

export default PlayerHand;
