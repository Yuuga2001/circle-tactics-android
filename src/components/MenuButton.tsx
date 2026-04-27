import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
} from 'react-native';
import { useLang } from '../i18n';
import { COLORS, FONT_SIZE, SPACING } from '../styles/theme';

interface MenuButtonProps {
  bgmMuted: boolean;
  seMuted: boolean;
  onToggleBgm: () => void;
  onToggleSe: () => void;
}

const MenuButton: React.FC<MenuButtonProps> = ({
  bgmMuted,
  seMuted,
  onToggleBgm,
  onToggleSe,
}) => {
  const [visible, setVisible] = useState(false);
  const { t } = useLang();

  return (
    <>
      <TouchableOpacity
        testID="menu-fab-btn"
        style={styles.fab}
        onPress={() => setVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>⚙</Text>
      </TouchableOpacity>

      {visible && (
        <Modal
          testID="menu-modal"
          transparent
          animationType="fade"
          visible={visible}
          onRequestClose={() => setVisible(false)}
        >
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={() => setVisible(false)}
          >
            <View
              style={styles.panel}
              // タッチイベントがオーバーレイに伝播しないようにする
              onStartShouldSetResponder={() => true}
            >
              {/* BGM トグル */}
              <TouchableOpacity
                testID="menu-bgm-btn"
                style={styles.toggleRow}
                onPress={onToggleBgm}
                accessibilityState={{ checked: !bgmMuted }}
              >
                <Text style={styles.label}>{t.bgmLabel}</Text>
                <View style={[styles.badge, bgmMuted ? styles.badgeOff : styles.badgeOn]}>
                  <Text style={styles.badgeText}>
                    {bgmMuted ? t.soundOff : t.soundOn}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* SE トグル */}
              <TouchableOpacity
                testID="menu-se-btn"
                style={styles.toggleRow}
                onPress={onToggleSe}
                accessibilityState={{ checked: !seMuted }}
              >
                <Text style={styles.label}>{t.seLabel}</Text>
                <View style={[styles.badge, seMuted ? styles.badgeOff : styles.badgeOn]}>
                  <Text style={styles.badgeText}>
                    {seMuted ? t.soundOff : t.soundOn}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* 閉じるボタン */}
              <TouchableOpacity
                testID="menu-close-btn"
                style={styles.closeBtn}
                onPress={() => setVisible(false)}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabIcon: {
    fontSize: FONT_SIZE.xl,
    color: COLORS.text,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  panel: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    minWidth: 200,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
    gap: SPACING.md,
  },
  label: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
    minWidth: 40,
    alignItems: 'center',
  },
  badgeOn: {
    backgroundColor: '#2ecc71',
  },
  badgeOff: {
    backgroundColor: COLORS.textMuted,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.sm,
    fontWeight: 'bold',
  },
  closeBtn: {
    alignSelf: 'center',
    marginTop: SPACING.xs,
    padding: SPACING.sm,
  },
  closeBtnText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.md,
  },
});

export default MenuButton;
