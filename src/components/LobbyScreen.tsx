import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useLang } from '../i18n';
import { COLORS, FONT_SIZE, SPACING } from '../styles/theme';

interface LobbyScreenProps {
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onBack: () => void;
}

const LobbyScreen: React.FC<LobbyScreenProps> = ({ onCreateRoom, onJoinRoom, onBack }) => {
  const { t } = useLang();

  return (
    <View testID="lobby-screen" style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.onlinePlay}</Text>
        <Text style={styles.subtitle}>{t.lobbyDesc}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          testID="create-room-btn"
          style={styles.primaryButton}
          onPress={onCreateRoom}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>{t.createRoom}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          testID="join-room-btn"
          style={styles.secondaryButton}
          onPress={onJoinRoom}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>{t.joinRoom}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.ghostButton}
          onPress={onBack}
          activeOpacity={0.8}
        >
          <Text style={styles.ghostButtonText}>{t.back}</Text>
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
  actions: {
    width: '100%',
    gap: SPACING.md,
    alignItems: 'center',
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
  secondaryButton: {
    backgroundColor: COLORS.surfaceAlt,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryButtonText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
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

export default LobbyScreen;
