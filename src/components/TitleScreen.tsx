import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Player, PLAYERS } from '../types';
import { useLang } from '../i18n';
import { COLORS, FONT_SIZE, SPACING, PLAYER_COLORS } from '../styles/theme';

interface TitleScreenProps {
  onPlayLocal: (humanPlayers: Player[]) => void;
  onPlayOnline: () => void;
}

type SeatConfig = 'human' | 'ai';

const TitleScreen: React.FC<TitleScreenProps> = ({ onPlayLocal, onPlayOnline }) => {
  const { t } = useLang();
  const [seats, setSeats] = useState<Record<Player, SeatConfig>>({
    RED: 'human',
    BLUE: 'ai',
    YELLOW: 'ai',
    GREEN: 'ai',
  });

  const toggleSeat = (player: Player) => {
    setSeats((prev) => ({
      ...prev,
      [player]: prev[player] === 'human' ? 'ai' : 'human',
    }));
  };

  const handlePlayLocal = () => {
    const humanPlayers = PLAYERS.filter((p) => seats[p] === 'human');
    if (humanPlayers.length === 0) return;
    onPlayLocal(humanPlayers);
  };

  const humanCount = PLAYERS.filter((p) => seats[p] === 'human').length;

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View testID="title-screen" style={styles.container}>
        {/* Title */}
        <View style={styles.header}>
          <Text testID="title-text" style={styles.title}>
            CircleTactics
          </Text>
          <Text style={styles.subtitle}>{t.subtitle}</Text>
        </View>

        {/* Seat selection */}
        <View style={styles.seatSection}>
          <Text style={styles.seatSectionLabel}>{t.setSeats}</Text>
          <View style={styles.seatGrid}>
            {PLAYERS.map((player) => (
              <View
                key={player}
                style={[styles.seatCard, { borderColor: PLAYER_COLORS[player] }]}
              >
                <View
                  style={[styles.playerDot, { backgroundColor: PLAYER_COLORS[player] }]}
                />
                <Text style={[styles.playerName, { color: PLAYER_COLORS[player] }]}>
                  {player}
                </Text>
                <TouchableOpacity
                  testID={`seat-toggle-${player}`}
                  onPress={() => toggleSeat(player)}
                  style={[
                    styles.toggleButton,
                    seats[player] === 'human' && {
                      backgroundColor: PLAYER_COLORS[player],
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      seats[player] === 'human' && styles.toggleTextActive,
                    ]}
                  >
                    {seats[player] === 'human' ? t.playerLabel : t.aiLabel}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
          {humanCount === 0 && (
            <Text style={styles.warningText}>{t.chooseAtLeastOne}</Text>
          )}
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            testID="play-local-btn"
            onPress={handlePlayLocal}
            disabled={humanCount === 0}
            style={[styles.primaryButton, humanCount === 0 && styles.disabledButton]}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>{t.playLocal}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            testID="play-online-btn"
            onPress={onPlayOnline}
            style={styles.secondaryButton}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>{t.playOnline}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    gap: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xxxl,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.md,
  },
  seatSection: {
    width: '100%',
    gap: SPACING.md,
  },
  seatSectionLabel: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    letterSpacing: 1,
  },
  seatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    justifyContent: 'center',
  },
  seatCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderRadius: 10,
    padding: SPACING.md,
    alignItems: 'center',
    gap: SPACING.sm,
    minWidth: 80,
  },
  playerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  playerName: {
    fontSize: FONT_SIZE.sm,
    fontWeight: 'bold',
  },
  toggleButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 6,
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 56,
    alignItems: 'center',
  },
  toggleText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    fontWeight: 'bold',
  },
  toggleTextActive: {
    color: COLORS.white,
  },
  warningText: {
    color: COLORS.accent,
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    gap: SPACING.md,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.lg,
    borderRadius: 10,
    minWidth: 200,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.4,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.lg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 200,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
  },
});

export default TitleScreen;
