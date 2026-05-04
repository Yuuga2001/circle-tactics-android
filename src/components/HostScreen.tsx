import React, { useEffect, useRef, useState } from 'react';
import { View, Text } from 'react-native';
import { api, friendlyError } from '../online/api';
import { saveActiveGame } from '../online/activeGame';
import { useLang } from '../i18n';
import ScreenContainer from './ui/ScreenContainer';
import { lobbyStyles } from './LobbyShared';

interface HostScreenProps {
  clientId: string;
  /** Called once the room is created — hands off to unified WaitingRoom. */
  onCreated: (gameId: string, roomCode: string) => void;
  onBack: () => void;
}

/** Minimal room-creation screen: spinner while the API call runs, then redirects. */
const HostScreen: React.FC<HostScreenProps> = ({ clientId, onCreated, onBack }) => {
  const { t } = useLang();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const createdRef = useRef(false);

  useEffect(() => {
    if (createdRef.current) return;
    createdRef.current = true;
    api
      .createGame(clientId)
      .then((r) => {
        saveActiveGame({ gameId: r.gameId, roomCode: r.roomCode });
        onCreated(r.gameId, r.roomCode);
      })
      .catch((e) => {
        setErrorMsg(friendlyError(e));
      });
  }, [clientId, onCreated]);

  return (
    <ScreenContainer>
      <View testID="host-screen" style={[lobbyStyles.container, { justifyContent: 'center' }]}>
        {errorMsg ? (
          <Text style={lobbyStyles.errorMessage}>{errorMsg}</Text>
        ) : (
          <Text style={lobbyStyles.hint}>{t.creatingRoom}</Text>
        )}
      </View>
    </ScreenContainer>
  );
};

export default HostScreen;
