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
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.eyebrow,
    letterSpacing: typography.letterSpacing.wide,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.titleMd,
    letterSpacing: typography.letterSpacing.tight,
    lineHeight: typography.lineHeights.title,
  },
  description: {
    color: colors.textMuted,
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.body,
    lineHeight: typography.lineHeights.relaxed,
    maxWidth: 720,
  },
});
