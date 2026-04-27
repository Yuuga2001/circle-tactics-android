import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { GameSession } from '../online/types';
import { usePolling } from '../online/usePolling';
import { useLang } from '../i18n';
import BoardComponent from './Board';
import HandsSummary from './HandsSummary';
import { COLORS, FONT_SIZE, SPACING } from '../styles/theme';

interface SpectatorViewProps {
  gameId: string;
  clientId: string;
  session: GameSession;
  onJoined: () => void;
  onLeave: () => void;
}

const SpectatorView: React.FC<SpectatorViewProps> = ({
  gameId,
  clientId,
  session: initialSession,
  onJoined,
  onLeave,
}) => {
  const { t } = useLang();
  const { session: polledSession } = usePolling(gameId, { intervalMs: 2000 });
  const promotedRef = useRef(false);

  const session = polledSession ?? initialSession;

  useEffect(() => {
    if (!polledSession || promotedRef.current) return;
    const inPlayers = polledSession.players.some((p) => p.clientId === clientId);
    if (!inPlayers) return;
    promotedRef.current = true;
    onJoined();
  }, [polledSession, clientId, onJoined]);

  const queuePosition = session
    ? session.waitQueue.indexOf(clientId) >= 0
      ? session.waitQueue.indexOf(clientId) + 1
      : null
    : null;

  const players = session?.players ?? [];
  const humanPlayers = players.filter((p) => p.isHuman).map((p) => p.color);

  return (
    <View testID="spectator-view" style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <Text style={styles.title}>CircleTactics</Text>
          {session?.roomCode ? (
            <Text style={styles.roomCode}>#{session.roomCode}</Text>
          ) : null}
        </View>
        <TouchableOpacity style={styles.leaveButton} onPress={onLeave} activeOpacity={0.8}>
          <Text style={styles.leaveButtonText}>{t.leave}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.queueBanner}>
        {queuePosition !== null ? (
          <View style={styles.queueContent}>
            <Text style={styles.queueTitle}>{t.waitingToJoin}</Text>
            <Text style={styles.queueSub}>
              {t.queuePos(queuePosition)}
              {queuePosition === 1 ? ` — ${t.youreNext}` : ''}
            </Text>
          </View>
        ) : (
          <Text style={styles.queueTitle}>{t.joiningLabel}</Text>
        )}
      </View>

      {session ? (
        <>
          <HandsSummary
            hands={session.hands}
            players={session.turnOrder}
            currentPlayer={session.currentPlayer}
          />

          <View style={styles.boardArea}>
            <BoardComponent
              board={session.board}
              onCellClick={() => {}}
              winningCells={session.winInfo?.cells}
              validCells={[]}
            />
          </View>

          <View style={styles.statusBar}>
            {session.winner ? (
              <Text style={styles.statusText}>
                {t.playerWins(`${t.playerLabel} ${session.winner}`)}
              </Text>
            ) : (
              <Text style={styles.statusText}>
                {players.find((p) => p.color === session.currentPlayer)?.isHuman
                  ? t.turnPlayer(session.currentPlayer)
                  : t.aiThinking(session.currentPlayer)}
              </Text>
            )}
          </View>
        </>
      ) : (
        <View style={styles.loading}>
          <ActivityIndicator color={COLORS.text} />
          <Text style={styles.loadingText}>{t.loading}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
  },
  roomCode: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.md,
  },
  leaveButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
  },
  leaveButtonText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
  },
  queueBanner: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  queueContent: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  queueTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
  },
  queueSub: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
  },
  boardArea: {
    alignItems: 'center',
  },
  statusBar: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  statusText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.md,
  },
});

export default SpectatorView;
