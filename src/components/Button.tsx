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
    borderRadius: 18,
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: spacing.md,
    paddingVertical: 15,
  },
  label: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.bodySm,
    letterSpacing: 0.1,
  },
  pressed: {
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: 0.55,
  },
  primary: {
    backgroundColor: colors.primary,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 3,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderWidth: 1,
  },
  ghost: {
    backgroundColor: colors.surfaceMuted,
  },
  danger: {
    backgroundColor: colors.dangerSoft,
  },
  primaryLabel: {
    color: colors.white,
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
