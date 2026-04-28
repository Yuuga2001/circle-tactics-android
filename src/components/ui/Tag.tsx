import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { COLORS, FONT_FAMILY, FONT_SIZE } from '../../styles/theme';

type Variant = 'ai' | 'you' | 'host' | 'neutral';

interface TagProps {
  label: string;
  variant?: Variant;
  style?: StyleProp<ViewStyle>;
}

const Tag: React.FC<TagProps> = ({ label, variant = 'neutral', style }) => {
  const palette = paletteFor(variant);
  return (
    <View style={[styles.base, palette.container, style]}>
      <Text style={[styles.label, palette.label]}>{label}</Text>
    </View>
  );
};

function paletteFor(v: Variant) {
  switch (v) {
    case 'you':
      return {
        container: { backgroundColor: 'rgba(255,193,7,0.85)' },
        label: { color: '#5a4a40' },
      };
    case 'host':
      return {
        container: { backgroundColor: 'rgba(141,110,99,0.18)' },
        label: { color: COLORS.boardFrame },
      };
    case 'ai':
      return {
        container: { backgroundColor: 'rgba(0,0,0,0.10)' },
        label: { color: '#444' },
      };
    case 'neutral':
    default:
      return {
        container: { backgroundColor: 'rgba(255,255,255,0.7)' },
        label: { color: '#444' },
      };
  }
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.xs,
    letterSpacing: 0.5,
  },
});

export default Tag;
