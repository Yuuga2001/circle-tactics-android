import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useLang } from '../i18n';
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
  const { t } = useLang();
  const { bgmMuted: bgmMutedHook, seMuted: seMutedHook, setBgmMuted, setSeMuted } = useAudioSettings();
  const bgmMuted = bgmMutedProp !== undefined ? bgmMutedProp : bgmMutedHook;
  const seMuted = seMutedProp !== undefined ? seMutedProp : seMutedHook;
  const [open, setOpen] = useState(false);
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

  if (mode === 'title') return null;

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

  return (
    <>
      <Pressable
        testID="menu-fab-btn"
        onPress={() => (open ? closePanel() : openPanel())}
        style={[styles.fab, SHADOWS.standard]}
      >
        <Text style={styles.fabIcon}>≡</Text>
      </Pressable>

      <Modal testID="menu-modal" visible={open} transparent animationType="none" onRequestClose={closePanel}>
        <Pressable style={styles.backdrop} onPress={closePanel} testID="menu-close-btn">
          <Pressable onPress={(e) => e.stopPropagation()}>
            <Animated.View style={[styles.panel, SHADOWS.elevated, panelStyle]}>
              {!!onTitle && (
                <Pressable
                  onPress={handleTitle}
                  style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
                >
                  <Text style={styles.itemText}>{titleLabel}</Text>
                </Pressable>
              )}
              {mode === 'local' && !!onNewGame && (
                <Pressable
                  onPress={handleNewGame}
                  style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
                >
                  <Text style={styles.itemText}>{t.newGame}</Text>
                </Pressable>
              )}
              <View style={styles.divider} />
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>{t.bgmLabel}</Text>
                <Pressable
                  testID="menu-bgm-btn"
                  accessibilityState={{ checked: !bgmMuted }}
                  onPress={() => { setBgmMuted(!bgmMuted); onToggleBgm?.(); }}
                  style={[styles.toggle, bgmMuted ? styles.toggleOff : styles.toggleOn]}
                >
                  <Text style={styles.toggleText}>{bgmMuted ? t.soundOff : t.soundOn}</Text>
                </Pressable>
              </View>
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>{t.seLabel}</Text>
                <Pressable
                  testID="menu-se-btn"
                  accessibilityState={{ checked: !seMuted }}
                  onPress={() => { setSeMuted(!seMuted); onToggleSe?.(); }}
                  style={[styles.toggle, seMuted ? styles.toggleOff : styles.toggleOn]}
                >
                  <Text style={styles.toggleText}>{seMuted ? t.soundOff : t.soundOn}</Text>
                </Pressable>
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
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: COLORS.boardFrame,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
  },
  fabIcon: {
    fontSize: 22,
    color: COLORS.boardFrame,
    fontFamily: FONT_FAMILY.bold,
    marginTop: -2,
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
});

export default MenuButton;
