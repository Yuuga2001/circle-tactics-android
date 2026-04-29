import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLang } from '../i18n';
import { COLORS, FONT_FAMILY, FONT_SIZE, RADIUS } from '../styles/theme';
import Button from './ui/Button';

interface ErrorViewProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onBack: () => void;
}

const ErrorView: React.FC<ErrorViewProps> = ({ title, message, onRetry, onBack }) => {
  const { t } = useLang();

  return (
    <View style={styles.container} testID="error-view">
      <View style={styles.card}>
        <Text style={styles.icon}>⚠</Text>
        <Text style={styles.title}>{title ?? t.errorTitle}</Text>
        <Text style={styles.message}>{message ?? t.errorDesc}</Text>
        <View style={styles.buttons}>
          {onRetry && (
            <Button
              title={t.retryBtn}
              variant="secondary"
              onPress={onRetry}
              fullWidth
              testID="error-view-retry-btn"
            />
          )}
          <Button
            title={t.backToTitle}
            variant="primary"
            onPress={onBack}
            fullWidth
            testID="error-view-back-btn"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.card,
    paddingVertical: 32,
    paddingHorizontal: 28,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    fontSize: 44,
    marginBottom: 4,
  },
  title: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.xl,
    color: COLORS.text,
    textAlign: 'center',
  },
  message: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttons: {
    width: '100%',
    gap: 10,
    marginTop: 8,
  },
});

export default ErrorView;
