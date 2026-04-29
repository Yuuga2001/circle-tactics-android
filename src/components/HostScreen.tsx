import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import { api, friendlyError } from '../online/api';
import { GameSession } from '../online/types';
import { usePolling } from '../online/usePolling';
import { useHeartbeat } from '../online/useHeartbeat';
import { saveActiveGame } from '../online/activeGame';
import { useLang } from '../i18n';
import ScreenContainer from './ui/ScreenContainer';
import Button from './ui/Button';
import { lobbyStyles, codeStyles, PlayerChip } from './LobbyShared';
import { COLORS, FONT_FAMILY, FONT_SIZE } from '../styles/theme';

interface HostScreenProps {
  gameId?: string;
  clientId: string;
  onGameStart: (session: GameSession) => void;
  onBack: () => void;
}

const HostScreen: React.FC<HostScreenProps> = ({ gameId: initialGameId, clientId, onGameStart, onBack }) => {
  const { t } = useLang();
  const [gameId, setGameId] = useState<string | null>(initialGameId || null);
  const [roomCode, setRoomCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [starting, setStarting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const createdRef = useRef(false);
  useEffect(() => {
    if (initialGameId) return;
    if (createdRef.current) return;
    createdRef.current = true;
    setCreating(true);
    api
      .createGame(clientId)
      .then((r) => {
        setGameId(r.gameId);
        setRoomCode(r.roomCode);
        saveActiveGame({ gameId: r.gameId, roomCode: r.roomCode });
      })
      .catch((e) => setErrorMsg(friendlyError(e)))
      .finally(() => setCreating(false));
  }, [clientId, initialGameId]);

  const { session } = usePolling(gameId, { intervalMs: 3000 });
  useHeartbeat(gameId, clientId, gameId !== null);

  useEffect(() => {
    if (session?.status === 'PLAYING') onGameStart(session);
  }, [session, onGameStart]);

  const players = session?.players ?? [];
  const playersCount = players.length;
  const aiCount = Math.max(0, 4 - playersCount);

  const copyUrl = async () => {
    if (!roomCode) return;
    try {
      await Clipboard.setStringAsync(`https://circle-tactics.riverapp.jp/?room=${roomCode}`);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 1500);
    } catch {
      /* noop */
    }
  };

  const copyCode = async () => {
    if (!roomCode) return;
    try {
      await Clipboard.setStringAsync(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  };

  const handleStart = async () => {
    if (!gameId) return;
    setStarting(true);
    setErrorMsg(null);
    try {
      const humanCount = Math.max(1, playersCount);
      const updated = await api.start(gameId, clientId, humanCount);
      onGameStart(updated);
    } catch (e) {
      setErrorMsg(friendlyError(e));
    } finally {
      setStarting(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <View testID="host-screen" style={lobbyStyles.container}>
        <View style={lobbyStyles.header}>
          <Text style={lobbyStyles.title}>{t.hostingRoom}</Text>
          <Text style={lobbyStyles.subtitle}>{t.shareCode}</Text>
        </View>

        <View style={lobbyStyles.section}>
          <View style={codeStyles.wrap}>
            <Text style={codeStyles.label}>{t.roomCode}</Text>
            {creating ? (
              <ActivityIndicator color={COLORS.boardFrame} />
            ) : (
              <>
                <Text testID="room-code-text" style={codeStyles.value}>
                  {roomCode || '------'}
                </Text>
                {!!roomCode && (
                  <Pressable
                    testID="copy-code-btn"
                    onPress={copyCode}
                    style={[codeStyles.copyBtn, copied ? codeStyles.copyBtnCopied : null]}
                  >
                    <Text
                      style={[
                        codeStyles.copyBtnLabel,
                        copied ? codeStyles.copyBtnLabelCopied : null,
                      ]}
                    >
                      {copied ? t.copied : t.copyRoomCode}
                    </Text>
                  </Pressable>
                )}
              </>
            )}
          </View>

          {!!roomCode && (
            <View style={hostStyles.qrWrap}>
              <View style={hostStyles.qrBox}>
                <QRCode value={`https://circle-tactics.riverapp.jp/?room=${roomCode}`} size={180} backgroundColor="#fff" />
              </View>
              <Pressable
                testID="copy-url-btn"
                onPress={copyUrl}
                style={[codeStyles.copyBtn, copiedUrl ? codeStyles.copyBtnCopied : null, hostStyles.copyUrlBtn]}
              >
                <Text style={[codeStyles.copyBtnLabel, copiedUrl ? codeStyles.copyBtnLabelCopied : null]}>
                  {copiedUrl ? t.copied : t.copyUrl}
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        <View style={lobbyStyles.section}>
          <Text style={hostStyles.sectionTitle}>{t.playersInRoom(playersCount, 4)}</Text>
          <View style={hostStyles.chipRow}>
            {players.map((p) => (
              <PlayerChip
                key={p.clientId}
                color={p.color}
                isSelf={p.clientId === clientId}
                selfLabel={t.hostLabel}
              />
            ))}
          </View>
          {aiCount > 0 && <Text style={[lobbyStyles.hint, { marginTop: 8 }]}>{t.aiSeats(aiCount)}</Text>}
        </View>

        {!!errorMsg && <Text style={lobbyStyles.errorMessage}>{errorMsg}</Text>}

        <View style={lobbyStyles.actions}>
          <Button
            title={starting ? t.starting : t.startGame}
            variant="primary"
            fullWidth
            disabled={!gameId || starting}
            onPress={handleStart}
            testID="start-game-btn"
          />
          <Button title={t.cancel} variant="ghost" fullWidth onPress={onBack} testID="host-back-btn" />
        </View>
      </View>
    </ScreenContainer>
  );
};

const hostStyles = StyleSheet.create({
  qrWrap: {
    alignItems: 'center',
    marginTop: 12,
    gap: 10,
  },
  copyUrlBtn: {
    marginTop: 2,
  },
  qrBox: {
    backgroundColor: '#fff',
    padding: 6,
    borderWidth: 3,
    borderColor: COLORS.boardFrame,
    borderRadius: 12,
  },
  sectionTitle: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.body,
    marginBottom: 8,
    color: '#333',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
});

export default HostScreen;
