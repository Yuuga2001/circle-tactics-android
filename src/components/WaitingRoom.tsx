import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { api } from '../online/api';
import { GameSession } from '../online/types';
import { usePolling } from '../online/usePolling';
import { useHeartbeat } from '../online/useHeartbeat';
import { clearActiveGame } from '../online/activeGame';
import { useLang } from '../i18n';
import { COLORS, FONT_SIZE, SPACING, PLAYER_COLORS } from '../styles/theme';

interface WaitingRoomProps {
  gameId: string;
  clientId: string;
  session: GameSession;
  onGameStart: (session: GameSession) => void;
  onLeave: () => void;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({
  gameId,
  clientId,
  session: initialSession,
  onGameStart,
  onLeave,
}) => {
  const { t } = useLang();
  const { session: polledSession } = usePolling(gameId, { intervalMs: 3000 });
  useHeartbeat(gameId, clientId, true);

  const session = polledSession ?? initialSession;

  useEffect(() => {
    if (polledSession?.status === 'PLAYING') {
      onGameStart(polledSession);
    }
  }, [polledSession, onGameStart]);

  const players = session?.players ?? [];
  const me = players.find((p) => p.clientId === clientId);

  const handleLeave = () => {
    api.leave(gameId, clientId).catch(() => {});
    clearActiveGame();
    onLeave();
  };

  return (
    <View testID="waiting-room" style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.waitingTitle}</Text>
        <Text style={styles.subtitle}>{t.waitingDesc}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>{t.roomCode}</Text>
        <Text style={styles.codeValue}>{session?.roomCode ?? '------'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t.playersLabel(players.length, 4)}
        </Text>
        {players.length === 0 ? (
          <ActivityIndicator color={COLORS.text} />
        ) : (
          players.map((p) => (
            <View key={p.clientId} style={styles.playerChip}>
              <View style={[styles.playerDot, { backgroundColor: PLAYER_COLORS[p.color] }]} />
              <Text style={styles.playerName}>
                {p.color}
                {p.clientId === clientId ? ` (${t.youLabel})` : ''}
              </Text>
            </View>
          ))
        )}
      </View>

      {me ? (
        <Text style={styles.youAre}>{t.youAre(me.color)}</Text>
      ) : null}

      <View style={styles.actions}>
        <TouchableOpacity
          testID="leave-btn"
          style={styles.ghostButton}
          onPress={handleLeave}
          activeOpacity={0.8}
        >
          <Text style={styles.ghostButtonText}>{t.leave}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    padding: SPACING.xl,
    gap: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  codeValue: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xxxl,
    fontWeight: 'bold',
    letterSpacing: 8,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: 'bold',
  },
  playerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  playerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  playerName: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
  },
  youAre: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.md,
  },
  actions: {
    width: '100%',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  ghostButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
  },
  ghostButtonText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.md,
  },
});

export default WaitingRoom;
