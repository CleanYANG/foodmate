import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type TagProps = {
  label: string;
  tone?: 'primary' | 'neutral';
  selected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function Tag({ label, tone = 'neutral', selected = false, onPress, style }: TagProps) {
  const content = (
    <View
      style={[
        styles.base,
        tone === 'primary' ? styles.primary : styles.neutral,
        selected ? styles.selected : null,
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          tone === 'primary' ? styles.primaryLabel : styles.neutralLabel,
          selected ? styles.selectedLabel : null,
        ]}
      >
        {label}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={styles.pressable}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  pressable: {
    alignSelf: 'flex-start',
  },
  base: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: spacing.xs + 1,
  },
  primary: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primarySoft,
  },
  neutral: {
    backgroundColor: colors.surfaceMuted,
  },
  selected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.caption,
    letterSpacing: 0.15,
  },
  primaryLabel: {
    color: colors.primary,
  },
  neutralLabel: {
    color: colors.textMuted,
  },
  selectedLabel: {
    color: colors.white,
  },
});
