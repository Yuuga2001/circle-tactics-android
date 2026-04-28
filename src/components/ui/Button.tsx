import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  PressableStateCallbackType,
} from 'react-native';
import { COLORS, FONT_FAMILY, FONT_SIZE, RADIUS, SHADOWS, PLAYER_COLORS, PLAYER_BORDER_COLORS } from '../../styles/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'header' | 'play' | 'online' | 'dialogConfirm' | 'dialogCancel';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
  testID?: string;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  style,
  textStyle,
  fullWidth,
  testID,
}) => {
  const containerBase = getContainerStyle(variant, size, disabled);
  const labelBase = getLabelStyle(variant, size);

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      style={(state: PressableStateCallbackType) => [
        styles.base,
        containerBase,
        fullWidth ? { alignSelf: 'stretch' } : null,
        state.pressed && !disabled ? activeStyleFor(variant) : null,
        style,
      ]}
      android_disableSound={false}
    >
      <Text style={[styles.label, labelBase, textStyle]} numberOfLines={1}>
        {title}
      </Text>
    </Pressable>
  );
};

function getContainerStyle(variant: ButtonVariant, size: ButtonSize, disabled?: boolean): ViewStyle {
  const sizePadding = sizePaddingMap[size];
  const base: ViewStyle = {
    paddingVertical: sizePadding.v,
    paddingHorizontal: sizePadding.h,
    borderRadius: variant === 'header' ? RADIUS.button : RADIUS.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  };
  switch (variant) {
    case 'primary':
    case 'play':
      return {
        ...base,
        backgroundColor: disabled ? '#c9bdb6' : PLAYER_COLORS.RED,
        borderColor: disabled ? '#a39288' : PLAYER_BORDER_COLORS.RED,
        ...(disabled ? {} : SHADOWS.standard),
        opacity: disabled ? 0.85 : 1,
      };
    case 'online':
      return {
        ...base,
        backgroundColor: disabled ? '#c9bdb6' : PLAYER_COLORS.BLUE,
        borderColor: disabled ? '#a39288' : PLAYER_BORDER_COLORS.BLUE,
        ...(disabled ? {} : SHADOWS.standard),
        opacity: disabled ? 0.85 : 1,
      };
    case 'secondary':
      return {
        ...base,
        backgroundColor: disabled ? '#e5ddd6' : COLORS.white,
        borderColor: disabled ? '#a39288' : COLORS.boardFrame,
        ...(disabled ? {} : SHADOWS.subtle),
        opacity: disabled ? 0.85 : 1,
      };
    case 'header':
      return {
        ...base,
        backgroundColor: COLORS.white,
        borderColor: COLORS.boardFrame,
        ...SHADOWS.subtle,
      };
    case 'ghost':
      return {
        ...base,
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderWidth: 0,
      };
    case 'dialogCancel':
      return {
        ...base,
        backgroundColor: '#ede8e3',
        borderColor: '#ede8e3',
      };
    case 'dialogConfirm':
      return {
        ...base,
        backgroundColor: PLAYER_COLORS.RED,
        borderColor: PLAYER_COLORS.RED,
        ...SHADOWS.subtle,
      };
  }
}

function getLabelStyle(variant: ButtonVariant, size: ButtonSize): TextStyle {
  const fontSize = size === 'sm' ? FONT_SIZE.buttonSm : size === 'lg' ? FONT_SIZE.buttonLg : FONT_SIZE.button;
  switch (variant) {
    case 'primary':
    case 'play':
    case 'online':
    case 'dialogConfirm':
      return { fontSize, color: COLORS.white };
    case 'secondary':
    case 'header':
      return { fontSize, color: COLORS.boardFrame };
    case 'ghost':
      return { fontSize: FONT_SIZE.body, color: COLORS.boardFrame, textDecorationLine: 'underline' };
    case 'dialogCancel':
      return { fontSize, color: '#555' };
  }
}

function activeStyleFor(variant: ButtonVariant): ViewStyle {
  if (variant === 'ghost') return { opacity: 0.55 };
  return { transform: [{ scale: 0.97 }, { translateY: 1 }], opacity: 0.92 };
}

const sizePaddingMap: Record<ButtonSize, { v: number; h: number }> = {
  sm: { v: 6, h: 14 },
  md: { v: 11, h: 32 },
  lg: { v: 14, h: 44 },
};

const styles = StyleSheet.create({
  base: {
    overflow: 'visible',
  },
  label: {
    fontFamily: FONT_FAMILY.bold,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});

export default Button;
