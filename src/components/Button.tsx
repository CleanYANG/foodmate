import { PropsWithChildren } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';

import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type ButtonProps = PropsWithChildren<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}>;

export function Button({
  children,
  variant = 'primary',
  onPress,
  style,
  disabled = false,
}: ButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null,
        style,
      ]}
      onPress={onPress}
    >
      <Text
        style={[styles.label, styles[`${variant}Label`], disabled ? styles.disabledLabel : null]}
      >
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: 999,
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: spacing.lg,
    paddingVertical: 15,
  },
  label: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.bodySm,
    letterSpacing: 0.2,
  },
  pressed: {
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: 0.55,
  },
  primary: {
    backgroundColor: colors.text,
  },
  secondary: {
    backgroundColor: colors.white,
  },
  ghost: {
    backgroundColor: colors.white,
  },
  danger: {
    backgroundColor: colors.white,
  },
  primaryLabel: {
    color: colors.primaryText,
  },
  secondaryLabel: {
    color: colors.text,
  },
  ghostLabel: {
    color: colors.textMuted,
  },
  dangerLabel: {
    color: colors.danger,
  },
  disabledLabel: {
    opacity: 0.9,
  },
});
