import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
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
  /** Room code — immediately available for the host, derived from session for joiners. */
  roomCode?: string;
  onGameStart: (session: GameSession) => void;
  onLeave: () => void;
  onError?: (msg: string) => void;
}

const SHARE_BASE = 'https://circle-tactics.riverapp.jp/';

const WaitingRoom: React.FC<WaitingRoomProps> = ({
  gameId,
  clientId,
  roomCode: roomCodeProp,
  onGameStart,
  onLeave,
  onError,
}) => {
  const { t } = useLang();
  const { session } = usePolling(gameId, { intervalMs: 1500 });
  useHeartbeat(gameId, clientId, true);
  const [starting, setStarting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    if (session?.status === 'PLAYING') onGameStart(session);
  }, [session, onGameStart]);

  const displayCode = roomCodeProp ?? session?.roomCode ?? '';
  const shareUrl = displayCode ? `${SHARE_BASE}?room=${displayCode}` : '';

  const players = session?.players ?? [];
  const isPlayer = players.some((p) => p.clientId === clientId);

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

  const copyCode = async () => {
    if (!displayCode) return;
    try {
      await Clipboard.setStringAsync(displayCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* noop */ }
  };

  const copyUrl = async () => {
    if (!shareUrl) return;
    try {
      await Clipboard.setStringAsync(shareUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 1500);
    } catch { /* noop */ }
  };

  const aiCount = Math.max(0, 4 - players.length);

  return (
    <ScreenContainer scroll>
      <View testID="waiting-room" style={lobbyStyles.container}>
        <View style={lobbyStyles.header}>
          <Text style={lobbyStyles.title}>{t.waitingTitle}</Text>
        </View>

        {/* Room code + QR side by side */}
        <View style={lobbyStyles.section}>
          <View style={styles.codeQrRow}>
            {/* Left: code + copy */}
            <View style={styles.codeLeft}>
              <Text style={codeStyles.label}>{t.roomCode}</Text>
              {displayCode ? (
                <>
                  <Text testID="room-code-text" style={[codeStyles.value, styles.codeValueCompact]}>{displayCode}</Text>
                  <Pressable
                    testID="copy-code-btn"
                    onPress={copyCode}
                    style={[codeStyles.copyBtn, copied ? codeStyles.copyBtnCopied : null]}
                  >
                    <Text style={[codeStyles.copyBtnLabel, copied ? codeStyles.copyBtnLabelCopied : null]}>
                      {copied ? t.copied : t.copyRoomCode}
                    </Text>
                  </Pressable>
                </>
              ) : (
                <ActivityIndicator color={COLORS.boardFrame} style={{ marginTop: 8 }} />
              )}
            </View>
            {/* Right: QR + URL copy */}
            {!!shareUrl && (
              <View style={styles.qrRight}>
                <View style={styles.qrBox}>
                  <QRCode value={shareUrl} size={110} backgroundColor="#fff" />
                </View>
                <Pressable
                  testID="copy-url-btn"
                  onPress={copyUrl}
                  style={[codeStyles.copyBtn, copiedUrl ? codeStyles.copyBtnCopied : null]}
                >
                  <Text style={[codeStyles.copyBtnLabel, copiedUrl ? codeStyles.copyBtnLabelCopied : null]}>
                    {copiedUrl ? t.copied : t.copyUrl}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>

        {/* Player list */}
        <View style={lobbyStyles.section}>
          <Text style={styles.sectionTitle}>{t.playersInRoom(players.length, 4)}</Text>
          {players.length === 0 ? (
            <ActivityIndicator color={COLORS.boardFrame} />
          ) : (
            <View style={styles.chipRow}>
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
          {aiCount > 0 && (
            <Text style={[lobbyStyles.hint, { marginTop: 8 }]}>{t.aiSeats(aiCount)}</Text>
          )}
          {(session?.waitQueue?.length ?? 0) > 0 && (
            <>
              <View style={styles.divider} />
              <Text style={styles.spectatorHeader}>
                {t.spectatorsLabel(session!.waitQueue!.length)}
              </Text>
              <View style={styles.chipRow}>
                {session!.waitQueue!.map((cid, idx) => (
                  <View
                    key={cid}
                    style={[
                      styles.spectatorChip,
                      cid === clientId ? styles.spectatorChipSelf : null,
                    ]}
                  >
                    <Text style={styles.spectatorChipText}>
                      #{idx + 1}{cid === clientId ? ` (${t.youLabel})` : ''}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>

        <View style={lobbyStyles.actions}>
          {/* Any player (not spectator in queue) can start */}
          {isPlayer && (
            <Button
              title={starting ? t.starting : t.startGame}
              variant="play"
              fullWidth
              disabled={!displayCode || starting}
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

const styles = StyleSheet.create({
  codeQrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  codeLeft: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  codeValueCompact: {
    fontSize: 26,
    letterSpacing: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  qrRight: {
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  qrBox: {
    backgroundColor: '#fff',
    padding: 4,
    borderWidth: 2,
    borderColor: COLORS.boardFrame,
    borderRadius: 10,
  },
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
