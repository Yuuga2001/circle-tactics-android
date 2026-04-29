import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { GameSession } from '../online/types';
import { usePolling } from '../online/usePolling';
import { setLiveRoomCode, setLivePlayerCount } from '../online/activeGame';
import { useLang } from '../i18n';
import BoardComponent from './Board';
import HandsSummary from './HandsSummary';
import ScreenContainer from './ui/ScreenContainer';
import { COLORS, FONT_FAMILY, FONT_SIZE, RADIUS, SHADOWS } from '../styles/theme';

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
}) => {
  const { t } = useLang();
  const { session: polledSession } = usePolling(gameId, { intervalMs: 2000 });
  const promotedRef = useRef(false);

  const session = polledSession ?? initialSession;

  // AppChrome にルームコードとプレイヤー数を公開
  useEffect(() => {
    setLiveRoomCode(session.roomCode ?? null);
    return () => { setLiveRoomCode(null); };
  }, [session.roomCode]);

  useEffect(() => {
    const humanCount = session.players.filter((p) => p.isHuman).length;
    const spectators = session.waitQueue?.length ?? 0;
    setLivePlayerCount(humanCount + spectators);
    return () => { setLivePlayerCount(null); };
  }, [session.players, session.waitQueue]);

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
    <ScreenContainer>
      <ScrollView
        testID="spectator-view"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.queueBanner}>
          {queuePosition !== null ? (
            <>
              <Text style={styles.queueTitle}>⏳ {t.waitingToJoin}</Text>
              <Text style={styles.queueSub}>
                {t.queuePos(queuePosition)}
                {queuePosition === 1 ? ` — ${t.youreNext}` : ` — ${t.willJoinAuto}`}
              </Text>
            </>
          ) : (
            <Text style={styles.queueTitle}>{t.joiningLabel}</Text>
          )}
        </View>

        {session ? (
          <>
            <HandsSummary
              hands={session.hands}
              players={session.turnOrder}
              humanPlayers={humanPlayers}
              currentPlayer={session.currentPlayer}
              myColor={null}
            />

            <View style={styles.boardArea}>
              <BoardComponent
                board={session.board}
                onCellClick={() => {}}
                winningCells={session.winInfo?.cells}
                winningPlayer={session.winInfo?.player ?? null}
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
            <ActivityIndicator color={COLORS.boardFrame} />
            <Text style={styles.loadingText}>{t.loading}</Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingTop: 56,
    paddingHorizontal: 8,
    paddingBottom: 24,
    gap: 8,
  },
  queueBanner: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: RADIUS.section,
    borderWidth: 2,
    borderColor: COLORS.boardFrame,
    alignItems: 'center',
    gap: 4,
    ...SHADOWS.subtle,
  },
  queueTitle: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.lg,
    color: COLORS.boardFrame,
  },
  queueSub: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  boardArea: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  statusBar: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  statusText: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.status,
    color: COLORS.boardFrame,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.body,
  },
});

export default SpectatorView;
