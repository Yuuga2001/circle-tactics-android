import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { api } from '../online/api';
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
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({
  gameId,
  clientId,
  session: initialSession,
  onGameStart,
  onLeave,
}) => {
  const { t } = useLang();
  const { session: polledSession } = usePolling(gameId, { intervalMs: 1500 });
  useHeartbeat(gameId, clientId, true);

  const session = polledSession ?? initialSession;

  useEffect(() => {
    if (polledSession?.status === 'PLAYING') onGameStart(polledSession);
  }, [polledSession, onGameStart]);

  const players = session?.players ?? [];
  const me = players.find((p) => p.clientId === clientId);

  const handleLeave = () => {
    api.leave(gameId, clientId).catch(() => {});
    clearActiveGame();
    onLeave();
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
                />
              ))}
            </View>
          )}
        </View>

        {!!me && <Text style={lobbyStyles.hint}>{t.youAre(me.color)}</Text>}

        <View style={lobbyStyles.actions}>
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
});

export default WaitingRoom;
