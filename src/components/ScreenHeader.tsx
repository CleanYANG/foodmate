import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type ScreenHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
};

export function ScreenHeader({ eyebrow, title, description }: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: typography.sizes.eyebrow,
    fontWeight: typography.weights.bold,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: typography.sizes.titleMd,
    fontWeight: typography.weights.heavy,
    letterSpacing: -0.6,
    lineHeight: typography.lineHeights.title,
  },
  description: {
    color: colors.textMuted,
    fontSize: typography.sizes.body,
    lineHeight: typography.lineHeights.body,
  },
});
