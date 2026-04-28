import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, ImageBackground, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, PLAYER_VICTORY_OVERLAY, PlayerKey } from '../../styles/theme';

interface ScreenContainerProps {
  children: React.ReactNode;
  scroll?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  victoryOverlay?: PlayerKey | null;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  scroll,
  contentContainerStyle,
  victoryOverlay,
  edges = ['top', 'bottom'],
}) => {
  const overlay = victoryOverlay ? PLAYER_VICTORY_OVERLAY[victoryOverlay] : null;

  const inner = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, contentContainerStyle]}>{children}</View>
  );

  return (
    <ImageBackground
      source={require('../../../assets/textures/wood-pattern.png')}
      style={styles.bg}
      resizeMode="repeat"
    >
      {overlay && <View style={[StyleSheet.absoluteFillObject, { backgroundColor: overlay }]} />}
      <SafeAreaView style={styles.flex} edges={edges}>
        {inner}
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
});

export default ScreenContainer;
