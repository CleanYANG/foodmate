import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { discoveryRailItems, type DiscoveryFilterId } from '../config/discoveryRail';
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
              accessibilityLabel={item.label}
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
                {item.label}
              </Text>
            </Pressable>
          );
        })}

        <View style={styles.utilityDivider} />

        <Pressable
          accessibilityLabel="Saved for later"
          accessibilityRole="button"
          onPress={onPressSavedForLater}
          style={[styles.item, compact ? styles.itemCompact : styles.itemRegular]}
        >
          <Text style={styles.icon}>⭐</Text>
          <Text style={styles.label}>Saved</Text>
        </Pressable>

        <Pressable
          accessibilityLabel="My Moment"
          accessibilityRole="button"
          onPress={onPressMyMoment}
          style={[styles.item, compact ? styles.itemCompact : styles.itemRegular]}
        >
          <Text style={styles.icon}>📝</Text>
          <Text style={styles.label}>My Moment</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#2C221B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 18,
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
    backgroundColor: colors.surfaceMuted,
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
    backgroundColor: colors.primarySoft,
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
