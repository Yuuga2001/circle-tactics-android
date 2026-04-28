import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLang } from '../i18n';
import ScreenContainer from './ui/ScreenContainer';
import Button from './ui/Button';
import { lobbyStyles } from './LobbyShared';

interface LobbyScreenProps {
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onBack: () => void;
}

const LobbyScreen: React.FC<LobbyScreenProps> = ({ onCreateRoom, onJoinRoom, onBack }) => {
  const { t } = useLang();
  return (
    <ScreenContainer scroll>
      <View testID="lobby-screen" style={lobbyStyles.container}>
        <View style={lobbyStyles.header}>
          <Text style={lobbyStyles.title}>{t.onlinePlay}</Text>
          <Text style={lobbyStyles.subtitle}>{t.lobbyDesc}</Text>
        </View>

        <View style={lobbyStyles.actions}>
          <Button
            title={t.createRoom}
            variant="primary"
            fullWidth
            onPress={onCreateRoom}
            testID="create-room-btn"
          />
          <Button
            title={t.joinRoom}
            variant="secondary"
            fullWidth
            onPress={onJoinRoom}
            testID="join-room-btn"
          />
          <Button
            title={t.back}
            variant="ghost"
            fullWidth
            onPress={onBack}
            testID="lobby-back-btn"
          />
        </View>
      </View>
    </ScreenContainer>
  );
};

export default LobbyScreen;
