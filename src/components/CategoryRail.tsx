import { Pressable, StyleSheet, Text, View } from 'react-native';

import { discoveryRailItems, type DiscoveryFilterId } from '../config/discoveryRail';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type CategoryRailProps = {
  selectedCategory: DiscoveryFilterId;
  onSelect: (category: DiscoveryFilterId) => void;
  onPressMyMoment: () => void;
};

export function CategoryRail({ selectedCategory, onSelect, onPressMyMoment }: CategoryRailProps) {
  return (
    <View style={styles.rail}>
      <View style={styles.topSection}>
        {discoveryRailItems.map((item) => {
          const selected = item.id === selectedCategory;

          return (
            <Pressable
              key={item.id}
              accessibilityLabel={item.label}
              accessibilityRole="button"
              onPress={() => onSelect(item.id)}
              style={[styles.item, selected ? styles.itemSelected : null]}
            >
              <Text style={styles.icon}>{item.icon}</Text>
              <Text style={[styles.label, selected ? styles.labelSelected : null]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.divider} />
        <Pressable
          accessibilityLabel="My Moment"
          accessibilityRole="button"
          onPress={onPressMyMoment}
          style={styles.item}
        >
          <Text style={styles.icon}>📝</Text>
          <Text style={styles.label}>My Moment</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
    width: 84,
  },
  topSection: {
    gap: spacing.sm,
  },
  bottomSection: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  divider: {
    backgroundColor: colors.border,
    borderRadius: 999,
    height: 1,
    marginHorizontal: 10,
  },
  item: {
    alignItems: 'center',
    borderRadius: 18,
    gap: 6,
    justifyContent: 'center',
    minHeight: 72,
    paddingHorizontal: 6,
    paddingVertical: spacing.sm,
  },
  itemSelected: {
    backgroundColor: colors.primarySoft,
  },
  icon: {
    fontSize: 24,
    textAlign: 'center',
  },
  label: {
    color: colors.textSoft,
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.semibold,
    textAlign: 'center',
  },
  labelSelected: {
    color: colors.primary,
  },
});
