import React, { useEffect } from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useLang } from '../i18n';
import { audioManager } from '../audio/audioManager';
import {
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  PLAYER_COLORS,
  RADIUS,
  SHADOWS,
} from '../styles/theme';

interface ConfirmDialogProps {
  visible: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  message,
  onConfirm,
  onCancel,
  confirmLabel,
  cancelLabel,
}) => {
  const { t } = useLang();
  const scale = useSharedValue(0.6);
  const cancelScale = useSharedValue(1);
  const confirmScale = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      scale.value = withSequence(
        withTiming(1.08, { duration: 150, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 100 }),
      );
    } else {
      scale.value = 0.6;
    }
  }, [visible, scale]);

  const cardStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const cancelAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: cancelScale.value }] }));
  const confirmAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: confirmScale.value }] }));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <Animated.View style={[styles.card, SHADOWS.elevated, cardStyle]}>
            <Text style={styles.message}>{message}</Text>
            <View style={styles.buttons}>
              <Animated.View style={[{ flex: 1 }, cancelAnimStyle]}>
                <Pressable
                  onPress={onCancel}
                  onPressIn={() => { audioManager.play('tap'); cancelScale.value = withTiming(0.94, { duration: 80, easing: Easing.out(Easing.quad) }); }}
                  onPressOut={() => { cancelScale.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.quad) }); }}
                  style={[styles.button, styles.cancel]}
                >
                  <Text style={styles.cancelText}>{cancelLabel ?? t.cancel}</Text>
                </Pressable>
              </Animated.View>
              <Animated.View style={[{ flex: 1 }, confirmAnimStyle]}>
                <Pressable
                  onPress={onConfirm}
                  onPressIn={() => { audioManager.play('tap'); confirmScale.value = withTiming(0.94, { duration: 80, easing: Easing.out(Easing.quad) }); }}
                  onPressOut={() => { confirmScale.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.quad) }); }}
                  style={[styles.button, styles.confirm]}
                >
                  <Text style={styles.confirmText}>{confirmLabel ?? t.ok}</Text>
                </Pressable>
              </Animated.View>
            </View>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(40,25,20,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 22,
    paddingHorizontal: 20,
    width: 320,
    maxWidth: '100%',
  },
  message: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.lg,
    color: '#333',
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 22,
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    paddingVertical: 11,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancel: {
    backgroundColor: '#ede8e3',
  },
  confirm: {
    backgroundColor: PLAYER_COLORS.RED,
    ...SHADOWS.subtle,
  },
  cancelText: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.lg,
    color: '#555',
  },
  confirmText: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.lg,
    color: COLORS.white,
  },
});

export default ConfirmDialog;
