import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Player } from '../types';
import {
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  PLAYER_COLORS,
  PLAYER_BORDER_COLORS,
  RADIUS,
  SHADOWS,
} from '../styles/theme';

export const lobbyStyles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 32,
    alignItems: 'center',
    gap: 10,
  },
  header: { alignItems: 'center' },
  title: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 20,
    color: COLORS.boardFrame,
    letterSpacing: 1,
  },
  subtitle: {
    marginTop: 6,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: RADIUS.section,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: COLORS.boardFrame,
    ...SHADOWS.subtle,
  },
  actions: {
    width: '100%',
    maxWidth: 460,
    gap: 10,
  },
  hint: {
    textAlign: 'center',
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.body,
  },
  errorMessage: {
    textAlign: 'center',
    fontFamily: FONT_FAMILY.bold,
    color: PLAYER_BORDER_COLORS.RED,
    fontSize: FONT_SIZE.body,
    marginTop: 6,
  },
});

export const codeStyles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginVertical: 4,
  },
  label: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 12,
    color: COLORS.boardFrame,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  value: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 36,
    color: PLAYER_BORDER_COLORS.RED,
    backgroundColor: 'rgba(255,248,196,0.55)',
    borderColor: COLORS.highlight,
    borderWidth: 3,
    borderRadius: 14,
    paddingHorizontal: 22,
    paddingVertical: 6,
    letterSpacing: 8,
    overflow: 'hidden',
    ...SHADOWS.subtle,
  },
  copyBtn: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: COLORS.boardFrame,
    backgroundColor: '#fff',
  },
  copyBtnCopied: {
    backgroundColor: COLORS.highlight,
    borderColor: '#9e7f02',
  },
  copyBtnLabel: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.body,
    color: COLORS.boardFrame,
  },
  copyBtnLabelCopied: {
    color: PLAYER_BORDER_COLORS.RED,
  },
});

interface PlayerChipProps {
  color: Player;
  isSelf?: boolean;
  selfLabel?: string;
}

export const PlayerChip: React.FC<PlayerChipProps> = ({ color, isSelf, selfLabel }) => {
  return (
    <View
      style={[
        chipStyles.chip,
        isSelf ? chipStyles.you : null,
      ] as ViewStyle[]}
    >
      <View
        style={[
          chipStyles.dot,
          { backgroundColor: PLAYER_COLORS[color], borderColor: PLAYER_BORDER_COLORS[color] },
        ]}
      />
      <Text style={chipStyles.label}>{color}</Text>
      {isSelf && selfLabel && <Text style={chipStyles.selfLabel}>({selfLabel})</Text>}
    </View>
  );
};

const chipStyles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  you: {
    borderColor: COLORS.highlight,
    backgroundColor: 'rgba(255,193,7,0.18)',
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  label: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.body,
    color: '#333',
  },
  selfLabel: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 11,
    color: '#444',
  },
});
