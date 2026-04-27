import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import { api, friendlyError } from '../online/api';
import { GameSession } from '../online/types';
import { usePolling } from '../online/usePolling';
import { useHeartbeat } from '../online/useHeartbeat';
import { saveActiveGame } from '../online/activeGame';
import { useLang } from '../i18n';
import { COLORS, FONT_SIZE, SPACING, PLAYER_COLORS } from '../styles/theme';

interface HostScreenProps {
  gameId: string;
  clientId: string;
  onGameStart: (session: GameSession) => void;
  onBack: () => void;
}

const HostScreen: React.FC<HostScreenProps> = ({ gameId: initialGameId, clientId, onGameStart, onBack }) => {
  const { t } = useLang();
  const [gameId, setGameId] = useState<string | null>(initialGameId || null);
  const [roomCode, setRoomCode] = useState<string>('');
  const [creating, setCreating] = useState(false);
  const [starting, setStarting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const createdRef = useRef(false);
  useEffect(() => {
    if (initialGameId) {
      // gameId is already provided — no need to create
      return;
    }
    if (createdRef.current) return;
    createdRef.current = true;
    setCreating(true);
    api.createGame(clientId)
      .then((r) => {
        setGameId(r.gameId);
        setRoomCode(r.roomCode);
        saveActiveGame({ gameId: r.gameId, roomCode: r.roomCode });
      })
      .catch((e) => setErrorMsg(friendlyError(e)))
      .finally(() => setCreating(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { session } = usePolling(gameId, { intervalMs: 3000 });
  useHeartbeat(gameId, clientId, gameId !== null);

  useEffect(() => {
    if (session?.status === 'PLAYING') {
      onGameStart(session);
    }
  }, [session, onGameStart]);

  const players = session?.players ?? [];
  const playersCount = players.length;
  const aiCount = Math.max(0, 4 - playersCount);

  const copyCode = async () => {
    if (!roomCode) return;
    try {
      await Clipboard.setStringAsync(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // noop
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
    <View testID="host-screen" style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.hostingRoom}</Text>
        <Text style={styles.subtitle}>{t.shareCode}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>{t.roomCode}</Text>
        {creating ? (
          <ActivityIndicator color={COLORS.text} />
        ) : (
          <>
            <Text testID="room-code-text" style={styles.codeValue}>
              {roomCode || '------'}
            </Text>
            {roomCode ? (
              <TouchableOpacity
                testID="copy-code-btn"
                style={styles.copyButton}
                onPress={copyCode}
                activeOpacity={0.8}
              >
                <Text style={styles.copyButtonText}>
                  {copied ? t.copied : t.copyRoomCode}
                </Text>
              </TouchableOpacity>
            ) : null}
          </>
        )}
      </View>

      {roomCode ? (
        <View style={styles.qrWrapper}>
          <QRCode value={roomCode} size={160} />
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t.playersInRoom(playersCount, 4)}
        </Text>
        {players.map((p) => (
          <View key={p.clientId} style={styles.playerChip}>
            <View style={[styles.playerDot, { backgroundColor: PLAYER_COLORS[p.color] }]} />
            <Text style={styles.playerName}>
              {p.color}
              {p.clientId === clientId ? ` (${t.hostLabel})` : ''}
            </Text>
          </View>
        ))}
        {aiCount > 0 && (
          <Text style={styles.hint}>{t.aiSeats(aiCount)}</Text>
        )}
      </View>

      {errorMsg ? (
        <Text style={styles.errorText}>{errorMsg}</Text>
      ) : null}

      <View style={styles.actions}>
        <TouchableOpacity
          testID="start-game-btn"
          style={[styles.primaryButton, (!gameId || starting) && styles.disabledButton]}
          onPress={handleStart}
          disabled={!gameId || starting}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>
            {starting ? t.starting : t.startGame}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.ghostButton} onPress={onBack} activeOpacity={0.8}>
          <Text style={styles.ghostButtonText}>{t.cancel}</Text>
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
  copyButton: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.lg,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  copyButtonText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
  },
  qrWrapper: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 8,
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
  hint: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
  },
  errorText: {
    color: COLORS.accent,
    fontSize: FONT_SIZE.sm,
  },
  actions: {
    width: '100%',
    alignItems: 'center',
    gap: SPACING.md,
  },
  primaryButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
  ghostButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
  },
  ghostButtonText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.md,
  },
});

export default HostScreen;
