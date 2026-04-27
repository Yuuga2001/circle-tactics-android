import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { api, friendlyError } from '../online/api';
import { saveActiveGame } from '../online/activeGame';
import { GameSession } from '../online/types';
import { useLang } from '../i18n';
import { COLORS, FONT_SIZE, SPACING } from '../styles/theme';

interface JoinScreenProps {
  clientId: string;
  initialCode?: string;
  onJoined: (gameId: string, session: GameSession) => void;
  onBack: () => void;
}

const JoinScreen: React.FC<JoinScreenProps> = ({ clientId, initialCode, onJoined, onBack }) => {
  const { t } = useLang();
  const [code, setCode] = useState(initialCode ?? '');
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const submit = async (raw: string) => {
    setErrorMsg(null);
    const sanitized = raw.replace(/\D/g, '').slice(0, 6);
    if (sanitized.length !== 6) {
      setErrorMsg(t.enterCode);
      return;
    }
    setBusy(true);
    try {
      const r = await api.getByRoomCode(sanitized);
      const joinRes = await api.join(r.gameId, clientId);
      saveActiveGame({ gameId: r.gameId, roomCode: sanitized });
      if (joinRes.status === 'PLAYING') {
        const session = await api.getGame(r.gameId);
        onJoined(r.gameId, session);
      } else {
        // WAITING or QUEUED — fetch session to pass along
        const session = await api.getGame(r.gameId);
        onJoined(r.gameId, session);
      }
    } catch (e) {
      setErrorMsg(friendlyError(e));
    } finally {
      setBusy(false);
    }
  };

  const autoSubmittedRef = useRef(false);
  useEffect(() => {
    if (autoSubmittedRef.current) return;
    if (initialCode && initialCode.replace(/\D/g, '').length === 6) {
      autoSubmittedRef.current = true;
      submit(initialCode);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode]);

  return (
    <View testID="join-screen" style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.joinTitle}</Text>
        <Text style={styles.subtitle}>{t.joinDesc}</Text>
      </View>

      <View style={styles.section}>
        <TextInput
          testID="code-input"
          style={styles.codeInput}
          keyboardType="numeric"
          maxLength={6}
          placeholder="000000"
          placeholderTextColor={COLORS.textMuted}
          value={code}
          onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))}
          onSubmitEditing={() => submit(code)}
          autoFocus
        />
        {errorMsg ? (
          <Text style={styles.errorText}>{errorMsg}</Text>
        ) : null}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          testID="join-btn"
          style={[styles.primaryButton, (busy || code.replace(/\D/g, '').length !== 6) && styles.disabledButton]}
          onPress={() => submit(code)}
          disabled={busy || code.replace(/\D/g, '').length !== 6}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>
            {busy ? t.joining : t.joinBtn}
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
    justifyContent: 'center',
    padding: SPACING.xl,
    gap: SPACING.xl,
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
  codeInput: {
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    fontSize: FONT_SIZE.xxxl,
    fontWeight: 'bold',
    letterSpacing: 8,
    textAlign: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: '80%',
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

export default JoinScreen;
