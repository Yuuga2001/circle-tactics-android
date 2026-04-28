import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Player, PLAYERS } from '../types';
import { DEFAULT_HUMAN_FLAGS } from '../logic/seating';
import { useLang } from '../i18n';
import {
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  PLAYER_COLORS,
  PLAYER_BORDER_COLORS,
  PLAYER_SEAT_TINT,
  RADIUS,
  SHADOWS,
} from '../styles/theme';
import ScreenContainer from './ui/ScreenContainer';
import Button from './ui/Button';
import DemoBoard from './DemoBoard';

interface TitleScreenProps {
  onPlayLocal: (humanPlayers: Player[]) => void;
  onPlayOnline: () => void;
}

type Role = 'HUMAN' | 'AI';

const TitleScreen: React.FC<TitleScreenProps> = ({ onPlayLocal, onPlayOnline }) => {
  const { t } = useLang();
  const [mode, setMode] = useState<'menu' | 'local'>('menu');
  const [humanFlags, setHumanFlags] = useState<Record<Player, boolean>>(DEFAULT_HUMAN_FLAGS);

  const humans = useMemo(() => PLAYERS.filter((p) => humanFlags[p]), [humanFlags]);
  const humanCount = humans.length;
  const aiCount = PLAYERS.length - humanCount;
  const canStart = humanCount >= 1;

  const toggleRole = (player: Player) => {
    setHumanFlags((prev) => ({ ...prev, [player]: !prev[player] }));
  };

  return (
    <ScreenContainer scroll>
      <View testID="title-screen" style={styles.container}>
        <View style={styles.header}>
          <Text testID="title-text" style={styles.title}>CircleTactics</Text>
          <Text style={styles.subtitle}>{t.subtitle}</Text>
        </View>

        {mode === 'menu' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.howToPlayTitle}</Text>
            <Text style={styles.rule}>• {t.rule1}</Text>
            <Text style={styles.rule}>• {t.rule2}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.subtitle}>{t.setSeats}</Text>
          <View style={styles.seatGrid}>
            {PLAYERS.map((p) => {
              const role: Role = humanFlags[p] ? 'HUMAN' : 'AI';
              const dark = PLAYER_BORDER_COLORS[p];
              const tint = PLAYER_SEAT_TINT[p];
              return (
                <Pressable
                  key={p}
                  testID={`seat-toggle-${p}`}
                  onPress={() => toggleRole(p)}
                  style={({ pressed }) => [
                    styles.seatCard,
                    role === 'HUMAN'
                      ? { borderColor: dark, backgroundColor: tint, ...SHADOWS.subtle }
                      : { borderColor: 'rgba(0,0,0,0.08)', backgroundColor: 'rgba(255,255,255,0.7)', opacity: 0.85 },
                    role === 'HUMAN' ? styles.seatActive : null,
                    pressed ? { transform: [{ translateY: 1 }, { scale: 0.99 }] } : null,
                  ]}
                >
                  <View style={styles.seatHeader}>
                    <View
                      style={[
                        styles.seatDot,
                        { backgroundColor: PLAYER_COLORS[p], borderColor: dark },
                      ]}
                    />
                    <Text style={[styles.seatLabel, { color: dark }]}>{p}</Text>
                  </View>
                  <View
                    style={[
                      styles.seatRole,
                      role === 'HUMAN' ? styles.seatRoleActive : null,
                    ]}
                  >
                    <Text style={styles.seatRoleIcon}>{role === 'HUMAN' ? '👤' : '🤖'}</Text>
                    <Text style={styles.seatRoleText}>
                      {role === 'HUMAN' ? t.playerLabel : t.aiLabel}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={[styles.summaryRow, !canStart ? styles.summaryWarn : null]}>
            {canStart ? (
              <>
                <Text style={styles.summaryText}>
                  <Text style={styles.summaryStrong}>{t.playerLabel}:</Text> {humanCount}
                </Text>
                <Text style={styles.summarySep}>/</Text>
                <Text style={styles.summaryText}>
                  <Text style={styles.summaryStrong}>{t.aiLabel}:</Text> {aiCount}
                </Text>
              </>
            ) : (
              <Text style={styles.summaryText}>{t.chooseAtLeastOne}</Text>
            )}
          </View>
        </View>

        <Button
          title={t.playLocal}
          variant="play"
          size="lg"
          disabled={!canStart}
          onPress={() => canStart && onPlayLocal(humans)}
          testID="play-local-btn"
        />
        <Button
          title={t.playOnline}
          variant="online"
          size="lg"
          onPress={onPlayOnline}
          testID="play-online-btn"
        />

        {mode === 'menu' && <DemoBoard />}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 24,
    alignItems: 'center',
    gap: 18,
  },
  header: { alignItems: 'center' },
  title: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.title,
    color: COLORS.boardFrame,
    letterSpacing: 1,
    textShadowColor: 'rgba(255,255,255,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    marginTop: 6,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body,
    color: COLORS.textMuted,
  },
  subtitleHint: {
    marginTop: 4,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.hint,
    color: COLORS.textHint,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: RADIUS.section,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: COLORS.boardFrame,
    ...SHADOWS.subtle,
  },
  sectionTitle: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.md,
    color: COLORS.boardFrame,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  rule: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body,
    color: '#444',
    marginBottom: 2,
    lineHeight: 20,
  },
  seatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  seatCard: {
    width: '48%',
    padding: 12,
    borderRadius: RADIUS.section,
    borderWidth: 2,
    gap: 8,
  },
  seatActive: {
    ...SHADOWS.subtle,
  },
  seatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  seatDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
  },
  seatLabel: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.md,
    letterSpacing: 1,
  },
  seatRole: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  seatRoleActive: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: COLORS.boardFrame,
  },
  seatRoleIcon: { fontSize: 18 },
  seatRoleText: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.body,
    color: '#444',
    letterSpacing: 0.5,
  },
  summaryRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  summaryWarn: {
    backgroundColor: 'rgba(220,75,75,0.12)',
  },
  summaryText: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body,
    color: '#444',
  },
  summaryStrong: {
    fontFamily: FONT_FAMILY.bold,
  },
  summarySep: {
    fontFamily: FONT_FAMILY.regular,
    color: '#000',
    opacity: 0.4,
    fontSize: FONT_SIZE.body,
  },
});

export default TitleScreen;
