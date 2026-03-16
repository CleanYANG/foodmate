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
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  success: {
    backgroundColor: colors.secondarySoft,
    borderColor: colors.secondary,
  },
  error: {
    backgroundColor: colors.dangerSoft,
    borderColor: '#F8C7D0',
  },
  text: {
    color: colors.textMuted,
    fontSize: typography.sizes.bodySm,
    lineHeight: typography.lineHeights.body,
  },
  successText: {
    color: '#365B4B',
  },
  errorText: {
    color: colors.danger,
  },
});
