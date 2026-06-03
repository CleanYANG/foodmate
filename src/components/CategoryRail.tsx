import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { discoveryRailItems, type DiscoveryFilterId } from '../config/discoveryRail';
import { useLanguage } from '../store/LanguageContext';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type CategoryRailProps = {
  compact: boolean;
  maxWidth?: number;
  selectedCategory: DiscoveryFilterId;
  onSelect: (category: DiscoveryFilterId) => void;
  onPressSavedForLater: () => void;
  onPressMyMoment: () => void;
};

export function CategoryRail({
  compact,
  maxWidth,
  selectedCategory,
  onSelect,
  onPressSavedForLater,
  onPressMyMoment,
}: CategoryRailProps) {
  const { t } = useLanguage();

  return (
    <View style={[styles.shell, maxWidth ? { maxWidth } : null]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          compact ? styles.contentCompact : styles.contentRegular,
        ]}
      >
        {discoveryRailItems.map((item) => {
          const selected = item.id === selectedCategory;

          return (
            <Pressable
              key={item.id}
              accessibilityLabel={t(item.translationKey)}
              accessibilityRole="button"
              onPress={() => onSelect(item.id)}
              style={[
                styles.item,
                compact ? styles.itemCompact : styles.itemRegular,
                selected ? styles.itemSelected : null,
              ]}
            >
              <Text style={styles.icon}>{item.icon}</Text>
              <Text style={[styles.label, selected ? styles.labelSelected : null]}>
                {t(item.translationKey)}
              </Text>
            </Pressable>
          );
        })}

        <View style={styles.utilityDivider} />

        <Pressable
          accessibilityLabel={t('nav.saved')}
          accessibilityRole="button"
          onPress={onPressSavedForLater}
          style={[styles.item, compact ? styles.itemCompact : styles.itemRegular]}
        >
          <Text style={styles.icon}>⭐</Text>
          <Text style={styles.label}>{t('nav.saved')}</Text>
        </Pressable>

        <Pressable
          accessibilityLabel={t('nav.me')}
          accessibilityRole="button"
          onPress={onPressMyMoment}
          style={[styles.item, compact ? styles.itemCompact : styles.itemRegular]}
        >
          <Text style={styles.icon}>📝</Text>
          <Text style={styles.label}>{t('nav.me')}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: 24,
    width: '100%',
  },
  content: {
    alignItems: 'center',
  },
  contentCompact: {
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  contentRegular: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  item: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 999,
    flexDirection: 'row',
  },
  itemCompact: {
    gap: spacing.xs,
    minHeight: 42,
    paddingHorizontal: spacing.sm,
    paddingVertical: 9,
  },
  itemRegular: {
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  itemSelected: {
    backgroundColor: colors.tagBg,
  },
  icon: {
    fontSize: 18,
    textAlign: 'center',
  },
  label: {
    color: colors.textSoft,
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.caption,
  },
  labelSelected: {
    color: colors.primary,
  },
  utilityDivider: {
    backgroundColor: colors.border,
    borderRadius: 999,
    height: 22,
    marginHorizontal: spacing.xs,
    width: 1,
  },
});
