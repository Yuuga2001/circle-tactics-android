import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Modal,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLang } from '../i18n';
import { useSoloRecords, formatRecordDate } from '../hooks/useSoloRecords';
import { COLORS, FONT_FAMILY, FONT_SIZE, PLAYER_BORDER_COLORS } from '../styles/theme';

interface SoloRecordListProps {
  visible: boolean;
  onClose: () => void;
}

const SoloRecordList: React.FC<SoloRecordListProps> = ({ visible, onClose }) => {
  const { t } = useLang();
  const { records, refresh } = useSoloRecords();

  useEffect(() => {
    if (visible) refresh();
  }, [visible, refresh]);

  const winCount = records.filter((r) => r.isWin).length;
  const total = records.length;
  const winRateText = total === 0 ? '- %' : `${Math.round((winCount / total) * 100)}%`;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.root}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t.battleRecord}</Text>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </Pressable>
        </View>

        {total === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{t.noRecords}</Text>
          </View>
        ) : (
          <>
            {/* 勝率サマリー */}
            <View style={styles.summary}>
              <Text style={styles.winRateLabel}>{t.winRate}</Text>
              <Text style={styles.winRateValue}>{winRateText}</Text>
              <Text style={styles.winRateCount}>{winCount} / {total}</Text>
            </View>

            <View style={styles.divider} />

            {/* 履歴リスト */}
            <ScrollView contentContainerStyle={styles.listContent}>
              {[...records].reverse().map((record) => (
                <View key={record.id} style={styles.row}>
                  <Text style={styles.rowDate}>{formatRecordDate(record.date)}</Text>
                  <Text style={[styles.rowResult, record.isWin ? styles.rowWin : styles.rowLose]}>
                    {record.isWin ? t.soloWin : t.soloLose}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.boardFrame}33`,
  },
  headerTitle: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.md,
    color: COLORS.boardFrame,
    letterSpacing: 0.5,
  },
  closeBtn: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  closeBtnText: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 18,
    color: COLORS.textMuted,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body,
    color: COLORS.textMuted,
  },
  summary: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  winRateLabel: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.hint,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  winRateValue: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 44,
    color: PLAYER_BORDER_COLORS.RED,
    lineHeight: 54,
  },
  winRateCount: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.hint,
    color: COLORS.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: `${COLORS.boardFrame}33`,
  },
  listContent: {
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: `${COLORS.boardFrame}33`,
  },
  rowDate: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body,
    color: COLORS.text,
  },
  rowResult: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.body,
  },
  rowWin: {
    color: PLAYER_BORDER_COLORS.RED,
  },
  rowLose: {
    color: COLORS.textMuted,
  },
});

export default SoloRecordList;
