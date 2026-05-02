import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, ScrollView, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

const PRESS_IN_DUR = 80;
const PRESS_OUT_DUR = 150;
const PRESS_EASING = Easing.out(Easing.quad);

function usePressScale(to = 0.93) {
  const s = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  const onPressIn = () => { audioManager.play('tap'); s.value = withTiming(to, { duration: PRESS_IN_DUR, easing: PRESS_EASING }); };
  const onPressOut = () => { s.value = withTiming(1, { duration: PRESS_OUT_DUR, easing: PRESS_EASING }); };
  return { style, onPressIn, onPressOut };
}
import { LANGUAGES, LangCode, useLang } from '../i18n';
import { audioManager } from '../audio/audioManager';
import { useAudioSettings } from '../hooks/useAudioSettings';
import {
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  PLAYER_BORDER_COLORS,
  PLAYER_COLORS,
  RADIUS,
  SHADOWS,
} from '../styles/theme';
import ConfirmDialog from './ConfirmDialog';

export type MenuMode = 'title' | 'local' | 'online' | 'other';

interface MenuButtonProps {
  mode?: MenuMode;
  onTitle?: () => void;
  onNewGame?: () => void;
  // 後方互換: 古い API。現在は内部で useAudioSettings を使うため未使用。
  bgmMuted?: boolean;
  seMuted?: boolean;
  onToggleBgm?: () => void;
  onToggleSe?: () => void;
}

const MenuButton: React.FC<MenuButtonProps> = ({ mode = 'other', onTitle, onNewGame, onToggleBgm, onToggleSe, bgmMuted: bgmMutedProp, seMuted: seMutedProp }) => {
  const { t, lang, isAuto, setLang, setAuto } = useLang();
  const { bgmMuted: bgmMutedHook, seMuted: seMutedHook, setBgmMuted, setSeMuted } = useAudioSettings();
  const bgmMuted = bgmMutedProp !== undefined ? bgmMutedProp : bgmMutedHook;
  const seMuted = seMutedProp !== undefined ? seMutedProp : seMutedHook;
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ message: string; onConfirm: () => void } | null>(null);

  const panelScale = useSharedValue(0.6);
  const panelOpacity = useSharedValue(0);

  const openPanel = () => {
    setOpen(true);
    panelScale.value = withSequence(
      withTiming(1.05, { duration: 140, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 80 }),
    );
    panelOpacity.value = withTiming(1, { duration: 160 });
  };
  const closePanel = () => {
    panelScale.value = withTiming(0.7, { duration: 120 });
    panelOpacity.value = withTiming(0, { duration: 120 });
    setOpen(false);
  };

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ scale: panelScale.value }],
    opacity: panelOpacity.value,
  }));

  const handleTitle = () => {
    if (!onTitle) return;
    const msg = mode === 'online' ? t.confirmLeaveOnline : t.confirmLeave;
    setConfirmAction({ message: msg, onConfirm: () => { closePanel(); onTitle(); } });
  };

  const handleNewGame = () => {
    if (!onNewGame) return;
    setConfirmAction({ message: t.confirmNewGame, onConfirm: () => { closePanel(); onNewGame(); } });
  };

  const titleLabel = mode === 'online' ? t.leaveOnline : t.titleBtn;

  const fab = usePressScale(0.92);
  const titleItem = usePressScale(0.95);
  const newGameItem = usePressScale(0.95);
  const bgmBtn = usePressScale(0.90);
  const seBtn = usePressScale(0.90);

  return (
    <>
      <Animated.View style={fab.style}>
        <Pressable
          testID="menu-fab-btn"
          onPress={() => (open ? closePanel() : openPanel())}
          onPressIn={fab.onPressIn}
          onPressOut={fab.onPressOut}
          style={styles.fab}
        >
          <Text style={styles.fabLabel}>Menu</Text>
        </Pressable>
      </Animated.View>

      <Modal testID="menu-modal" visible={open} transparent animationType="none" onRequestClose={closePanel}>
        <Pressable style={styles.backdrop} onPress={closePanel} testID="menu-close-btn">
          <Pressable onPress={(e) => e.stopPropagation()}>
            <Animated.View style={[styles.panel, SHADOWS.elevated, panelStyle]}>
              {!!onTitle && (
                <Animated.View style={titleItem.style}>
                  <Pressable
                    onPress={handleTitle}
                    onPressIn={titleItem.onPressIn}
                    onPressOut={titleItem.onPressOut}
                    style={styles.item}
                  >
                    <Text style={styles.itemText}>{titleLabel}</Text>
                  </Pressable>
                </Animated.View>
              )}
              {mode === 'local' && !!onNewGame && (
                <Animated.View style={newGameItem.style}>
                  <Pressable
                    onPress={handleNewGame}
                    onPressIn={newGameItem.onPressIn}
                    onPressOut={newGameItem.onPressOut}
                    style={styles.item}
                  >
                    <Text style={styles.itemText}>{t.newGame}</Text>
                  </Pressable>
                </Animated.View>
              )}
              <View style={styles.divider} />
              <Pressable
                onPress={() => setLangOpen(true)}
                onPressIn={() => audioManager.play('tap')}
                style={({ pressed }) => [styles.item, pressed ? styles.itemPressed : null]}
              >
                <View style={styles.langRow}>
                  <View>
                    <Text style={styles.itemText}>🌐 Language</Text>
                    <Text style={styles.langSubLabel}>
                      {isAuto ? `Auto · ${LANGUAGES[lang]}` : LANGUAGES[lang]}
                    </Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </View>
              </Pressable>
              <View style={styles.divider} />
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>{t.bgmLabel}</Text>
                <Animated.View style={bgmBtn.style}>
                  <Pressable
                    testID="menu-bgm-btn"
                    accessibilityState={{ checked: !bgmMuted }}
                    onPress={() => { setBgmMuted(!bgmMuted); onToggleBgm?.(); }}
                    onPressIn={bgmBtn.onPressIn}
                    onPressOut={bgmBtn.onPressOut}
                    style={[styles.toggle, bgmMuted ? styles.toggleOff : styles.toggleOn]}
                  >
                    <Text style={styles.toggleText}>{bgmMuted ? t.soundOff : t.soundOn}</Text>
                  </Pressable>
                </Animated.View>
              </View>
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>{t.seLabel}</Text>
                <Animated.View style={seBtn.style}>
                  <Pressable
                    testID="menu-se-btn"
                    accessibilityState={{ checked: !seMuted }}
                    onPress={() => { setSeMuted(!seMuted); onToggleSe?.(); }}
                    onPressIn={seBtn.onPressIn}
                    onPressOut={seBtn.onPressOut}
                    style={[styles.toggle, seMuted ? styles.toggleOff : styles.toggleOn]}
                  >
                    <Text style={styles.toggleText}>{seMuted ? t.soundOff : t.soundOn}</Text>
                  </Pressable>
                </Animated.View>
              </View>

              <View style={styles.divider} />
              {[
                { label: t.aboutApp,      url: 'https://riverapp.jp/app-document/circletactics/about' },
                { label: t.privacyPolicy, url: 'https://riverapp.jp/app-document/circletactics/privacy-policy' },
                { label: t.termsOfService,url: 'https://riverapp.jp/app-document/circletactics/terms-of-service' },
                { label: t.contactUs,     url: 'https://riverapp.jp/app-document/circletactics/contact' },
              ].map(({ label, url }) => (
                <Pressable
                  key={url}
                  onPress={() => { audioManager.play('tap'); Linking.openURL(url); }}
                  style={({ pressed }) => [styles.item, pressed ? styles.itemPressed : null]}
                >
                  <Text style={styles.itemText}>{label}</Text>
                </Pressable>
              ))}

              <View style={styles.divider} />
              {[
                { label: t.webVersion,   url: 'https://circle-tactics.riverapp.jp/' },
                { label: t.appHomepage,  url: 'https://riverapp.jp/apps/circletactics' },
                { label: t.writeReview,  url: 'market://details?id=jp.riverapp.circletactics' },
              ].map(({ label, url }) => (
                <Pressable
                  key={url}
                  onPress={() => {
                    audioManager.play('tap');
                    if (url.startsWith('market://')) {
                      Linking.openURL(url).catch(() =>
                        Linking.openURL('https://play.google.com/store/apps/details?id=jp.riverapp.circletactics')
                      );
                    } else {
                      Linking.openURL(url);
                    }
                  }}
                  style={({ pressed }) => [styles.item, pressed ? styles.itemPressed : null]}
                >
                  <Text style={styles.itemText}>{label}</Text>
                </Pressable>
              ))}

              <View style={styles.divider} />
              <Pressable
                onPress={() => {
                  audioManager.play('tap');
                  setConfirmAction({
                    message: t.confirmClearData,
                    onConfirm: async () => {
                      await AsyncStorage.clear().catch(() => {});
                      closePanel();
                    },
                  });
                }}
                style={({ pressed }) => [styles.item, pressed ? styles.itemPressed : null]}
              >
                <Text style={[styles.itemText, styles.itemDanger]}>{t.clearLocalData}</Text>
              </Pressable>

              <View style={styles.divider} />
              <View style={styles.versionRow}>
                <Text style={styles.versionLabel}>{t.versionLabel}</Text>
                <Text style={styles.versionValue}>{Constants.expoConfig?.version ?? '1.0.0'}</Text>
              </View>
            </Animated.View>
          </Pressable>
        </Pressable>
      </Modal>

      <ConfirmDialog
        visible={!!confirmAction}
        message={confirmAction?.message ?? ''}
        onConfirm={() => {
          confirmAction?.onConfirm();
          setConfirmAction(null);
        }}
        onCancel={() => setConfirmAction(null)}
      />

      <Modal visible={langOpen} transparent animationType="fade" onRequestClose={() => setLangOpen(false)}>
        <Pressable style={styles.langBackdrop} onPress={() => setLangOpen(false)}>
          <Pressable onPress={(e) => e.stopPropagation()} style={styles.langPanel}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Follow device setting option */}
              <Pressable
                onPress={() => { setAuto(); setLangOpen(false); }}
                onPressIn={() => audioManager.play('tap')}
                style={({ pressed }) => [
                  styles.langOption,
                  isAuto ? styles.langOptionSelected : null,
                  pressed && !isAuto ? styles.itemPressed : null,
                ]}
              >
                <View style={styles.langAutoRow}>
                  <View>
                    <Text style={[styles.langOptionText, isAuto ? styles.langOptionSelectedText : null]}>
                      Follow device settings
                    </Text>
                    <Text style={styles.langAutoSub}>{LANGUAGES[lang]}</Text>
                  </View>
                  {isAuto && <Text style={styles.langCheck}>✓</Text>}
                </View>
              </Pressable>
              <View style={styles.langDivider} />
              {(Object.entries(LANGUAGES) as [LangCode, string][]).map(([code, name]) => {
                const selected = !isAuto && code === lang;
                return (
                  <Pressable
                    key={code}
                    onPress={() => { setLang(code); setLangOpen(false); }}
                    onPressIn={() => audioManager.play('tap')}
                    style={({ pressed }) => [
                      styles.langOption,
                      selected ? styles.langOptionSelected : null,
                      pressed && !selected ? styles.itemPressed : null,
                    ]}
                  >
                    <View style={styles.langAutoRow}>
                      <Text style={[styles.langOptionText, selected ? styles.langOptionSelectedText : null]}>
                        {name}
                      </Text>
                      {selected && <Text style={styles.langCheck}>✓</Text>}
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 2,
    borderColor: COLORS.boardFrame,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabLabel: {
    fontSize: FONT_SIZE.body,
    color: COLORS.boardFrame,
    fontFamily: FONT_FAMILY.bold,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(40,25,20,0.45)',
    alignItems: 'flex-end',
    paddingTop: 64,
    paddingRight: 12,
  },
  panel: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.section,
    paddingVertical: 8,
    paddingHorizontal: 4,
    minWidth: 220,
    borderWidth: 2,
    borderColor: COLORS.boardFrame,
  },
  item: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: RADIUS.small,
  },
  itemPressed: {
    backgroundColor: 'rgba(141,110,99,0.12)',
  },
  itemText: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.lg,
    color: COLORS.boardFrame,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(141,110,99,0.2)',
    marginVertical: 6,
    marginHorizontal: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  toggleLabel: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.body,
    color: '#333',
  },
  toggle: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 999,
    minWidth: 56,
    alignItems: 'center',
  },
  toggleOn: {
    backgroundColor: PLAYER_COLORS.GREEN,
  },
  toggleOff: {
    backgroundColor: '#bdbdbd',
  },
  toggleText: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 13,
    color: COLORS.white,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chevron: {
    fontSize: 18,
    color: COLORS.boardFrame,
    opacity: 0.6,
  },
  langBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(40,25,20,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  langPanel: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.section,
    borderWidth: 2,
    borderColor: COLORS.boardFrame,
    minWidth: 240,
    maxHeight: 420,
    overflow: 'hidden',
    ...SHADOWS.elevated,
  },
  langOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  langOptionSelected: {
    backgroundColor: 'rgba(255,193,7,0.28)',
  },
  langOptionText: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.lg,
    color: '#333',
  },
  langOptionSelectedText: {
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.boardFrame,
  },
  langSubLabel: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.hint,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  langAutoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  langAutoSub: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.hint,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  langCheck: {
    fontSize: 16,
    color: COLORS.boardFrame,
    fontFamily: FONT_FAMILY.bold,
  },
  langDivider: {
    height: 1,
    backgroundColor: 'rgba(141,110,99,0.2)',
    marginHorizontal: 8,
    marginVertical: 2,
  },
  itemDanger: {
    color: '#c0392b',
  },
  versionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  versionLabel: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body,
    color: COLORS.textMuted,
  },
  versionValue: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body,
    color: COLORS.textMuted,
  },
});

export default MenuButton;
