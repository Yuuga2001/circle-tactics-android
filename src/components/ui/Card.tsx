import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '../../styles/theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  bordered?: boolean;
  translucent?: boolean;
}

const Card: React.FC<CardProps> = ({ children, style, bordered = true, translucent = true }) => {
  return (
    <View
      style={[
        styles.base,
        translucent ? { backgroundColor: 'rgba(255,255,255,0.6)' } : { backgroundColor: COLORS.white },
        bordered ? { borderColor: COLORS.boardFrame, borderWidth: 2 } : null,
        SHADOWS.subtle,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.section,
    padding: 14,
  },
});

export default Card;
