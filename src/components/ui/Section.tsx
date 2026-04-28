import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { COLORS, FONT_FAMILY, FONT_SIZE, RADIUS, SHADOWS } from '../../styles/theme';

interface SectionProps {
  title?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const Section: React.FC<SectionProps> = ({ title, children, style }) => {
  return (
    <View style={[styles.section, SHADOWS.subtle, style]}>
      {title && <Text style={styles.title}>{title}</Text>}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: RADIUS.section,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderColor: COLORS.boardFrame,
    borderWidth: 2,
    alignSelf: 'center',
  },
  title: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.md,
    color: COLORS.boardFrame,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
});

export default Section;
