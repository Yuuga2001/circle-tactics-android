import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZE, SPACING } from '../styles/theme';

interface ToastProps {
  message: string | null;
  onDismiss?: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <TouchableOpacity
      testID="toast-container"
      style={styles.container}
      onPress={onDismiss}
      activeOpacity={0.85}
    >
      <Text style={styles.text}>{message}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 24,
    maxWidth: 320,
  },
  text: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
  },
});

export default Toast;
