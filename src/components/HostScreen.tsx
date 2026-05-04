import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { api, friendlyError } from '../online/api';
import { saveActiveGame } from '../online/activeGame';
import { usePolling } from '../online/usePolling';
import { useHeartbeat } from '../online/useHeartbeat';
import { GameSession } from '../online/types';
import { useLang } from '../i18n';
import ScreenContainer from './ui/ScreenContainer';
import Button from './ui/Button';
import { lobbyStyles, codeStyles, PlayerChip } from './LobbyShared';
import { COLORS, FONT_FAMILY, FONT_SIZE } from '../styles/theme';

interface HostScreenProps {
  /** 既存ゲームID。空文字なら新規作成する */
  gameId: string;
  clientId: string;
  onGameStart: (session: GameSession) => void;
  onBack: () => void;
}

const HostScreen: React.FC<HostScreenProps> = ({ gameId: gameIdProp, clientId, onGameStart, onBack }) => {
  const { t } = useLang();
  const [gameId, setGameId] = useState(gameIdProp || '');
  const [roomCode, setRoomCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [copied, setCopied] = useState(false);
  const createdRef = useRef(false);

  const { session } = usePolling(gameId, { intervalMs: 1500 });
  useHeartbeat(gameId, clientId, !!gameId);

  // gameId が空の場合は新規作成
  useEffect(() => {
    if (gameIdProp) return;
    if (createdRef.current) return;
    createdRef.current = true;
    api
      .createGame(clientId)
      .then((r) => {
        saveActiveGame({ gameId: r.gameId, roomCode: r.roomCode });
        setGameId(r.gameId);
        setRoomCode(r.roomCode);
      })
      .catch((e) => setErrorMsg(friendlyError(e)));
  }, [gameIdProp, clientId]);

  // gameId が渡されている場合はポーリングから roomCode を取得
  useEffect(() => {
    if (!gameIdProp || roomCode) return;
    if (session?.roomCode) setRoomCode(session.roomCode);
  }, [gameIdProp, session, roomCode]);

  // PLAYING になったら onGameStart を呼ぶ
  useEffect(() => {
    if (session?.status === 'PLAYING') onGameStart(session);
  }, [session, onGameStart]);

  const players = session?.players ?? [];
  const aiCount = Math.max(0, 4 - players.length);

  const handleStart = async () => {
    if (starting || !gameId) return;
    setStarting(true);
    try {
      const humanCount = Math.max(1, players.length);
      const updated = await api.start(gameId, clientId, humanCount);
      onGameStart(updated);
    } catch (e) {
      setErrorMsg(friendlyError(e));
    } finally {
      setStarting(false);
    }
  };

  const handleCopyCode = async () => {
    if (!roomCode) return;
    try {
      await Clipboard.setStringAsync(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* noop */ }
  };

  return (
    <ScreenContainer scroll>
      <View testID="host-screen" style={lobbyStyles.container}>
        {errorMsg ? (
          <Text style={lobbyStyles.errorMessage}>{errorMsg}</Text>
        ) : !roomCode ? (
          <ActivityIndicator color={COLORS.boardFrame} />
        ) : (
          <>
            {/* ルームコード */}
            <View style={lobbyStyles.section}>
              <Text style={codeStyles.label}>{t.roomCode}</Text>
              <Text testID="room-code-text" style={codeStyles.value}>{roomCode}</Text>
              <Pressable
                testID="copy-code-btn"
                onPress={handleCopyCode}
                style={[codeStyles.copyBtn, copied ? codeStyles.copyBtnCopied : null]}
              >
                <Text style={[codeStyles.copyBtnLabel, copied ? codeStyles.copyBtnLabelCopied : null]}>
                  {copied ? t.copied : t.copyRoomCode}
                </Text>
              </Pressable>
            </View>

            {/* プレイヤーリスト */}
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
                      selfLabel={t.hostLabel}
                    />
                  ))}
                </View>
              )}
              {aiCount > 0 && (
                <Text style={[lobbyStyles.hint, { marginTop: 8 }]}>{t.aiSeats(aiCount)}</Text>
              )}

              {/* waitQueue */}
              {(session?.waitQueue?.length ?? 0) > 0 && (
                <>
                  <View style={styles.divider} />
                  <Text style={styles.spectatorHeader}>
                    {t.spectatorsLabel(session!.waitQueue!.length)}
                  </Text>
                  <View style={styles.chipRow}>
                    {session!.waitQueue!.map((cid, idx) => (
                      <View key={cid} style={styles.spectatorChip}>
                        <Text style={styles.spectatorChipText}>
                          #{idx + 1}
                        </Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </View>
          </>
        )}

        {/* アクション: gameId が確定していればスタートボタンを表示 */}
        <View style={lobbyStyles.actions}>
          {!!gameId && (
            <Button
              title={starting ? t.starting : t.startGame}
              variant="play"
              fullWidth
              disabled={starting}
              onPress={handleStart}
              testID="start-game-btn"
            />
          )}
          <Button title={t.cancel} variant="ghost" fullWidth onPress={onBack} testID="cancel-btn" />
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
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
  spectatorChipText: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.body,
    color: '#999',
  },
});

export default HostScreen;
