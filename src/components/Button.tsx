import { PropsWithChildren } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';

import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type ButtonProps = PropsWithChildren<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}>;

export function Button({ children, variant = 'primary', onPress, style }: ButtonProps) {
  return (
    <Pressable style={[styles.base, styles[variant], style]} onPress={onPress}>
      <Text style={[styles.label, styles[`${variant}Label`]]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: 16,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  label: {
    fontSize: typography.sizes.bodySm,
    fontWeight: typography.weights.bold,
  },
  primary: {
    backgroundColor: colors.primary,
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
});
