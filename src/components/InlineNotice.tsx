import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type InlineNoticeProps = {
  message: string;
  tone?: 'info' | 'success' | 'error';
};

export function InlineNotice({ message, tone = 'info' }: InlineNoticeProps) {
  return (
    <View
      style={[
        styles.base,
        tone === 'success' ? styles.success : null,
        tone === 'error' ? styles.error : null,
      ]}
    >
      <Text
        style={[
          styles.text,
          tone === 'success' ? styles.successText : null,
          tone === 'error' ? styles.errorText : null,
        ]}
      >
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  success: {
    backgroundColor: colors.white,
  },
  error: {
    backgroundColor: colors.white,
  },
  text: {
    color: colors.textMuted,
    fontSize: typography.sizes.bodySm,
    lineHeight: typography.lineHeights.body,
  },
  successText: {
    color: colors.mutedOlive,
  },
  errorText: {
    color: colors.danger,
  },
});
