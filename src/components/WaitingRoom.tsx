import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { api, friendlyError } from '../online/api';
import { GameSession } from '../online/types';
import { usePolling } from '../online/usePolling';
import { useHeartbeat } from '../online/useHeartbeat';
import { clearActiveGame } from '../online/activeGame';
import { useLang } from '../i18n';
import ScreenContainer from './ui/ScreenContainer';
import Button from './ui/Button';
import { lobbyStyles, codeStyles, PlayerChip } from './LobbyShared';
import { COLORS, FONT_FAMILY, FONT_SIZE } from '../styles/theme';

interface WaitingRoomProps {
  gameId: string;
  clientId: string;
  session?: GameSession;
  onGameStart: (session: GameSession) => void;
  onLeave: () => void;
  onError?: (msg: string) => void;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({
  gameId,
  clientId,
  session: initialSession,
  onGameStart,
  onLeave,
  onError,
}) => {
  const { t } = useLang();
  const { session: polledSession } = usePolling(gameId, { intervalMs: 1500 });
  useHeartbeat(gameId, clientId, true);
  const [starting, setStarting] = useState(false);

  const session = polledSession ?? initialSession;

  useEffect(() => {
    if (polledSession?.status === 'PLAYING') onGameStart(polledSession);
  }, [polledSession, onGameStart]);

  const players = session?.players ?? [];
  const me = players.find((p) => p.clientId === clientId);
  const isHost = session?.hostClientId === clientId;

  const handleLeave = () => {
    api.leave(gameId, clientId).catch(() => {});
    clearActiveGame();
    onLeave();
  };

  const handleStart = async () => {
    if (starting) return;
    setStarting(true);
    try {
      const humanCount = Math.max(1, players.length);
      const updated = await api.start(gameId, clientId, humanCount);
      onGameStart(updated);
    } catch (e) {
      onError?.(friendlyError(e));
    } finally {
      setStarting(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <View testID="waiting-room" style={lobbyStyles.container}>
        <View style={lobbyStyles.header}>
          <Text style={lobbyStyles.title}>{t.waitingTitle}</Text>
          <Text style={lobbyStyles.subtitle}>{t.waitingDesc}</Text>
        </View>

        <View style={lobbyStyles.section}>
          <View style={codeStyles.wrap}>
            <Text style={codeStyles.label}>{t.roomCode}</Text>
            <Text style={codeStyles.value}>{session?.roomCode ?? '------'}</Text>
          </View>
        </View>

        <View style={lobbyStyles.section}>
          <Text style={waitingStyles.sectionTitle}>{t.playersLabel(players.length, 4)}</Text>
          {players.length === 0 ? (
            <ActivityIndicator color={COLORS.boardFrame} />
          ) : (
            <View style={waitingStyles.chipRow}>
              {players.map((p) => (
                <PlayerChip
                  key={p.clientId}
                  color={p.color}
                  isSelf={p.clientId === clientId}
                  selfLabel={t.youLabel}
                  isHost={p.clientId === session?.hostClientId}
                  hostLabel={p.clientId === clientId ? t.hostLabel : t.hostOnlyLabel}
                />
              ))}
            </View>
          )}
          {(session?.waitQueue?.length ?? 0) > 0 && (
            <>
              <View style={waitingStyles.divider} />
              <Text style={waitingStyles.spectatorHeader}>
                {t.spectatorsLabel(session!.waitQueue!.length)}
              </Text>
              <View style={waitingStyles.chipRow}>
                {session!.waitQueue!.map((cid, idx) => (
                  <View
                    key={cid}
                    style={[
                      waitingStyles.spectatorChip,
                      cid === clientId ? waitingStyles.spectatorChipSelf : null,
                    ]}
                  >
                    <Text style={waitingStyles.spectatorChipText}>
                      #{idx + 1}{cid === clientId ? ` (${t.youLabel})` : ''}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>

        {!!me && <Text style={lobbyStyles.hint}>{t.youAre(me.color)}</Text>}

        <View style={lobbyStyles.actions}>
          {isHost && (
            <Button
              title={starting ? t.starting : t.startGame}
              variant="play"
              fullWidth
              disabled={starting}
              onPress={handleStart}
              testID="start-btn"
            />
          )}
          <Button title={t.leave} variant="ghost" fullWidth onPress={handleLeave} testID="leave-btn" />
        </View>
      </View>
    </ScreenContainer>
  );
};

const waitingStyles = StyleSheet.create({
  sectionTitle: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.body,
    color: '#333',
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: 8,
  },
  spectatorHeader: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 12,
    color: '#999',
    marginBottom: 6,
  },
  spectatorChip: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.15)',
  },
  spectatorChipSelf: {
    borderColor: 'rgba(255,193,7,0.6)',
  },
  spectatorChipText: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.body,
    color: '#999',
  },
});

export default WaitingRoom;
