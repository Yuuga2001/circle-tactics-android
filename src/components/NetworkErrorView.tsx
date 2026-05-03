import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useLang } from '../i18n';
import { COLORS, FONT_FAMILY, FONT_SIZE, RADIUS } from '../styles/theme';

interface NetworkErrorViewProps {
  visible: boolean;
  onBack: () => void;
}

const NetworkErrorView: React.FC<NetworkErrorViewProps> = ({ visible, onBack }) => {
  const { t } = useLang();

  // ドット3つがそれぞれずれて点滅するアニメーション
  const dot1 = useSharedValue(0.25);
  const dot2 = useSharedValue(0.25);
  const dot3 = useSharedValue(0.25);

  const DURATION = 500;

  useEffect(() => {
    dot1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: DURATION, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.25, { duration: DURATION, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
    const t2 = setTimeout(() => {
      dot2.value = withRepeat(
        withSequence(
          withTiming(1, { duration: DURATION, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.25, { duration: DURATION, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
      );
    }, DURATION * 0.4);
    const t3 = setTimeout(() => {
      dot3.value = withRepeat(
        withSequence(
          withTiming(1, { duration: DURATION, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.25, { duration: DURATION, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
      );
    }, DURATION * 0.8);
    return () => { clearTimeout(t2); clearTimeout(t3); };
  }, [dot1, dot2, dot3]);

  const dot1Style = useAnimatedStyle(() => ({ opacity: dot1.value }));
  const dot2Style = useAnimatedStyle(() => ({ opacity: dot2.value }));
  const dot3Style = useAnimatedStyle(() => ({ opacity: dot3.value }));

  if (!visible) return null;

  return (
    <View style={styles.overlay} testID="network-error-overlay">
      <View style={styles.card}>
        <Text style={styles.icon}>📡</Text>
        <Text style={styles.title}>{t.networkErrorTitle}</Text>
        <Text style={styles.desc}>{t.networkErrorDesc}</Text>
        <View style={styles.dotsRow}>
          <Animated.View style={[styles.dot, dot1Style]} />
          <Animated.View style={[styles.dot, dot2Style]} />
          <Animated.View style={[styles.dot, dot3Style]} />
        </View>
        <Pressable onPress={onBack} testID="network-error-back-btn" style={styles.backBtn}>
          <Text style={styles.backBtnText}>{t.backToTitle}</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(40,25,20,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: 24,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.card,
    paddingVertical: 28,
    paddingHorizontal: 28,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    fontSize: 40,
    marginBottom: 4,
  },
  title: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.xl,
    color: COLORS.text,
    textAlign: 'center',
  },
  desc: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.boardFrame,
  },
  backBtn: {
    marginTop: 8,
  },
  backBtnText: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.body,
    color: COLORS.textMuted,
    textDecorationLine: 'underline',
  },
});

export default NetworkErrorView;
