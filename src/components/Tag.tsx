import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type TagProps = {
  label: string;
  tone?: 'primary' | 'neutral';
  style?: StyleProp<ViewStyle>;
};

export function Tag({ label, tone = 'neutral', style }: TagProps) {
  return (
    <View style={[styles.base, tone === 'primary' ? styles.primary : styles.neutral, style]}>
      <Text style={[styles.label, tone === 'primary' ? styles.primaryLabel : styles.neutralLabel]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  primary: {
    backgroundColor: colors.primarySoft,
  },
  neutral: {
    backgroundColor: colors.surfaceMuted,
  },
  label: {
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.semibold,
  },
  primaryLabel: {
    color: colors.primary,
  },
  neutralLabel: {
    color: colors.textMuted,
  },
});
