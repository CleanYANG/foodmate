import { Pressable, StyleSheet, Text, View } from 'react-native';

import { discoveryRailItems, type DiscoveryFilterId } from '../config/discoveryRail';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type CategoryRailProps = {
  selectedCategory: DiscoveryFilterId;
  onSelect: (category: DiscoveryFilterId) => void;
};

export function CategoryRail({ selectedCategory, onSelect }: CategoryRailProps) {
  return (
    <View style={styles.rail}>
      {discoveryRailItems.map((item) => {
        const selected = item.id === selectedCategory;

        return (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            onPress={() => onSelect(item.id)}
            style={[styles.item, selected ? styles.itemSelected : null]}
          >
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={[styles.label, selected ? styles.labelSelected : null]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
    width: 84,
  },
  item: {
    alignItems: 'center',
    borderRadius: 18,
    gap: 6,
    minHeight: 72,
    justifyContent: 'center',
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
