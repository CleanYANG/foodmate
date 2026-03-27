import { View, Text, StyleSheet } from 'react-native';

import { Button } from './Button';
import { Card } from './Card';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type StateCardProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function StateCard({ title, description, actionLabel, onAction }: StateCardProps) {
  return (
    <Card>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        {actionLabel && onAction ? (
          <Button variant="secondary" onPress={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.titleSm,
  },
  description: {
    color: colors.textMuted,
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.body,
    lineHeight: typography.lineHeights.body,
  },
});
