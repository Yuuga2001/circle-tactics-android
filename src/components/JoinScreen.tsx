import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { api, friendlyError } from '../online/api';
import { saveActiveGame } from '../online/activeGame';
import { GameSession } from '../online/types';
import { useLang } from '../i18n';
import ScreenContainer from './ui/ScreenContainer';
import Button from './ui/Button';
import { lobbyStyles } from './LobbyShared';
import { COLORS, FONT_FAMILY } from '../styles/theme';

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
      const session = await api.getGame(r.gameId);
      onJoined(r.gameId, session);
      void joinRes;
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
    <ScreenContainer scroll>
      <View testID="join-screen" style={lobbyStyles.container}>
        <View style={lobbyStyles.header}>
          <Text style={lobbyStyles.title}>{t.joinTitle}</Text>
          <Text style={lobbyStyles.subtitle}>{t.joinDesc}</Text>
        </View>

        <View style={lobbyStyles.section}>
          <TextInput
            testID="code-input"
            keyboardType="number-pad"
            maxLength={6}
            placeholder="000000"
            placeholderTextColor="rgba(0,0,0,0.25)"
            value={code}
            onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))}
            onSubmitEditing={() => submit(code)}
            autoFocus
            style={joinStyles.codeInput}
          />
          {!!errorMsg && <Text style={lobbyStyles.errorMessage}>{errorMsg}</Text>}
        </View>

        <View style={lobbyStyles.actions}>
          <Button
            title={busy ? t.joining : t.joinBtn}
            variant="primary"
            fullWidth
            disabled={busy || code.length !== 6}
            onPress={() => submit(code)}
            testID="join-btn"
          />
          <Button title={t.cancel} variant="ghost" fullWidth onPress={onBack} testID="join-back-btn" />
        </View>
      </View>
    </ScreenContainer>
  );
};

const joinStyles = StyleSheet.create({
  codeInput: {
    width: '100%',
    textAlign: 'center',
    fontFamily: FONT_FAMILY.bold,
    fontSize: 30,
    letterSpacing: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: COLORS.boardFrame,
    backgroundColor: '#fff',
    color: '#333',
  },
});

export default JoinScreen;
