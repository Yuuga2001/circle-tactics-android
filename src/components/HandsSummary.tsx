import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Player, PieceSize, SIZES, SIZE_LABEL } from '../types';
import { PLAYER_COLORS, COLORS, FONT_SIZE, SPACING } from '../styles/theme';

interface HandsSummaryProps {
  hands: Record<Player, Record<PieceSize, number>>;
  players: Player[];
  currentPlayer: Player;
}

const HandsSummary: React.FC<HandsSummaryProps> = ({ hands, players, currentPlayer }) => {
  return (
    <View style={styles.container}>
      {players.map((player) => {
        const isActive = player === currentPlayer;
        return (
          <View
            key={player}
            testID={`hands-row-${player}`}
            accessibilityState={{ selected: isActive }}
            style={[
              styles.row,
              isActive && { borderColor: PLAYER_COLORS[player], borderWidth: 2 },
            ]}
          >
            <View
              style={[styles.playerIndicator, { backgroundColor: PLAYER_COLORS[player] }]}
            />
            <View style={styles.counts}>
              {SIZES.map((size) => (
                <Text
                  key={size}
                  testID={`hands-count-${player}-${size}`}
                  style={[styles.countText, isActive && styles.activeText]}
                >
                  {SIZE_LABEL[size]}:{hands[player][size]}
                </Text>
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: SPACING.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 6,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  playerIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  counts: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  countText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
  },
  activeText: {
    color: COLORS.text,
    fontWeight: 'bold',
  },
});

export default HandsSummary;
