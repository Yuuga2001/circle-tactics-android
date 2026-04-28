import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Player, HandState, SIZES, SIZE_LABEL } from '../types';
import {
  COLORS,
  PLAYER_COLORS,
  PLAYER_BORDER_COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  RADIUS,
  SHADOWS,
} from '../styles/theme';

interface HandsSummaryProps {
  hands: Record<Player, HandState>;
  players: Player[];
  humanPlayers?: Player[];
  currentPlayer: Player;
  myColor?: Player | null;
}

const HandsSummary: React.FC<HandsSummaryProps> = ({
  hands,
  players,
  humanPlayers = [],
  currentPlayer,
  myColor,
}) => {
  return (
    <View style={[styles.summary, SHADOWS.subtle]}>
      <View style={[styles.row, styles.headerRow]}>
        <Text style={[styles.headerCell, styles.headerPlayerCell]}>PLAYER</Text>
        {SIZES.map((size) => (
          <Text key={size} style={styles.headerCell}>
            {SIZE_LABEL[size]}
          </Text>
        ))}
      </View>
      {players.map((player) => {
        const isHuman = humanPlayers.includes(player);
        const isCurrent = currentPlayer === player;
        const isMine = myColor === player;
        return (
          <View
            key={player}
            testID={`hands-row-${player}`}
            accessibilityState={{ selected: isCurrent }}
            style={[styles.row, isCurrent ? styles.currentRow : null] as ViewStyle[]}
          >
            <View style={[styles.cell, styles.playerCell]}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: PLAYER_COLORS[player],
                    borderColor: PLAYER_BORDER_COLORS[player],
                  },
                ]}
              />
              <Text style={styles.playerName}>{player}</Text>
              {isMine && (
                <View style={[styles.tag, styles.youTag]}>
                  <Text style={[styles.tagText, styles.youTagText]}>You</Text>
                </View>
              )}
              {!isHuman && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>AI</Text>
                </View>
              )}
            </View>
            {SIZES.map((size) => (
              <Text
                key={size}
                testID={`hands-count-${player}-${size}`}
                style={styles.countCell}
              >
                {hands[player][size]}
              </Text>
            ))}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  summary: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderColor: COLORS.boardFrame,
    borderWidth: 2,
    borderRadius: RADIUS.board,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 2,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(141,110,99,0.15)',
  },
  headerRow: {
    paddingBottom: 4,
    marginBottom: 2,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.boardFrame,
  },
  headerCell: {
    flex: 1,
    fontFamily: FONT_FAMILY.bold,
    fontSize: 11,
    color: COLORS.boardFrame,
    letterSpacing: 1,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  headerPlayerCell: {
    flex: 1.4,
    textAlign: 'left',
    paddingLeft: 22,
  },
  cell: {
    flex: 1,
  },
  playerCell: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  countCell: {
    flex: 1,
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.lg,
    color: '#333',
    textAlign: 'center',
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  playerName: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.md,
    color: '#333',
    letterSpacing: 1,
  },
  tag: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  tagText: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 10,
    color: '#555',
    letterSpacing: 0.5,
  },
  youTag: {
    backgroundColor: COLORS.highlight,
  },
  youTagText: {
    color: PLAYER_BORDER_COLORS.RED,
  },
  currentRow: {
    backgroundColor: 'rgba(255,193,7,0.18)',
    borderRadius: 6,
  },
});

export default HandsSummary;
