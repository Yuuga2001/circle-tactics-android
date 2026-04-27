import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Player, PieceSize, HandState, SIZES, SIZE_LABEL } from '../types';
import { PLAYER_COLORS, COLORS, FONT_SIZE, SPACING } from '../styles/theme';
import Piece from './Piece';

interface PlayerHandProps {
  player: Player;
  hand: HandState;
  selectedSize: PieceSize | null;
  onSelectSize: (size: PieceSize) => void;
  interactive?: boolean;
}

const PlayerHand: React.FC<PlayerHandProps> = ({
  player,
  hand,
  selectedSize,
  onSelectSize,
  interactive = true,
}) => {
  return (
    <View style={styles.container}>
      {SIZES.map((size) => {
        const count = hand[size];
        const isDisabled = !interactive || count === 0;
        const isSelected = selectedSize === size;

        return (
          <TouchableOpacity
            key={size}
            testID={`size-btn-${size}`}
            onPress={isDisabled ? undefined : () => onSelectSize(size)}
            disabled={isDisabled}
            accessibilityState={{ disabled: isDisabled, selected: isSelected }}
            style={[
              styles.button,
              isSelected && { borderColor: PLAYER_COLORS[player], borderWidth: 2 },
              isDisabled && styles.disabledButton,
            ]}
            activeOpacity={0.7}
          >
            <Piece player={player} size={size} />
            <Text style={[styles.label, isDisabled && styles.disabledLabel]}>
              {SIZE_LABEL[size]} ×{count}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    padding: SPACING.sm,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sm,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 56,
  },
  disabledButton: {
    opacity: 0.4,
  },
  label: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.xs,
  },
  disabledLabel: {
    color: COLORS.textMuted,
  },
});

export default PlayerHand;
