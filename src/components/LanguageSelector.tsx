import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LANGUAGES, LangCode, useLang } from '../i18n';
import { COLORS, FONT_FAMILY, FONT_SIZE, RADIUS, SHADOWS } from '../styles/theme';

const LanguageSelector: React.FC = () => {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);

  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0);

  const openMenu = () => {
    setOpen(true);
    scale.value = withSequence(
      withTiming(1.05, { duration: 130, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 80 }),
    );
    opacity.value = withTiming(1, { duration: 150 });
  };
  const closeMenu = () => {
    scale.value = withTiming(0.7, { duration: 100 });
    opacity.value = withTiming(0, { duration: 100 });
    setTimeout(() => setOpen(false), 110);
  };

  const dropdownStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <>
      <Pressable
        onPress={() => (open ? closeMenu() : openMenu())}
        style={[styles.trigger, SHADOWS.subtle]}
      >
        <Text style={styles.globe}>🌐</Text>
        <Text style={styles.current}>Language</Text>
        <Text style={styles.chevron}>{open ? '▲' : '▼'}</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="none" onRequestClose={closeMenu}>
        <Pressable style={styles.backdrop} onPress={closeMenu}>
          <Pressable onPress={(e) => e.stopPropagation()} style={styles.dropdownAnchor}>
            <Animated.View style={[styles.dropdown, SHADOWS.elevated, dropdownStyle]}>
              <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                {(Object.entries(LANGUAGES) as [LangCode, string][]).map(([code, name]) => {
                  const selected = code === lang;
                  return (
                    <Pressable
                      key={code}
                      onPress={() => {
                        setLang(code);
                        closeMenu();
                      }}
                      style={({ pressed }) => [
                        styles.option,
                        selected ? styles.optionSelected : null,
                        pressed && !selected ? styles.optionPressed : null,
                      ]}
                    >
                      <Text style={[styles.optionText, selected ? styles.optionSelectedText : null]}>
                        {name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </Animated.View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 2,
    borderColor: COLORS.boardFrame,
  },
  globe: { fontSize: 14 },
  current: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.body,
    color: COLORS.boardFrame,
  },
  chevron: {
    fontSize: 10,
    color: COLORS.boardFrame,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(40,25,20,0.35)',
  },
  dropdownAnchor: {
    position: 'absolute',
    top: 56,
    left: 12,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.boardFrame,
    minWidth: 200,
    maxHeight: 360,
    overflow: 'hidden',
  },
  scroll: {
    maxHeight: 360,
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  optionPressed: {
    backgroundColor: 'rgba(141,110,99,0.12)',
  },
  optionSelected: {
    backgroundColor: 'rgba(255,193,7,0.28)',
  },
  optionText: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.lg,
    color: '#333',
  },
  optionSelectedText: {
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.boardFrame,
  },
});

export default LanguageSelector;
