import { Pressable, StyleSheet, Text, View } from 'react-native';

import { discoveryRailItems, type DiscoveryFilterId } from '../config/discoveryRail';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type CategoryRailProps = {
  expanded: boolean;
  selectedCategory: DiscoveryFilterId;
  onToggleExpanded: () => void;
  onSelect: (category: DiscoveryFilterId) => void;
  onPressSavedForLater: () => void;
  onPressMyMoment: () => void;
};

export function CategoryRail({
  expanded,
  selectedCategory,
  onToggleExpanded,
  onSelect,
  onPressSavedForLater,
  onPressMyMoment,
}: CategoryRailProps) {
  return (
    <Pressable
      accessibilityLabel={expanded ? 'Collapse category rail' : 'Expand category rail'}
      accessibilityRole="button"
      onPress={onToggleExpanded}
      style={[styles.rail, expanded ? styles.railExpanded : styles.railCollapsed]}
    >
      <View style={styles.topSection}>
        {discoveryRailItems.map((item) => {
          const selected = item.id === selectedCategory;

          return (
            <Pressable
              key={item.id}
              accessibilityLabel={item.label}
              accessibilityRole="button"
              onPress={(event) => {
                event.stopPropagation();
                onSelect(item.id);
              }}
              style={[
                styles.item,
                expanded ? styles.itemExpanded : styles.itemCollapsed,
                selected ? styles.itemSelected : null,
              ]}
            >
              <Text style={styles.icon}>{item.icon}</Text>
              {expanded ? (
                <Text
                  numberOfLines={1}
                  style={[styles.label, selected ? styles.labelSelected : null]}
                >
                  {item.label}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.divider} />
        <Pressable
          accessibilityLabel="Saved for later"
          accessibilityRole="button"
          onPress={(event) => {
            event.stopPropagation();
            onPressSavedForLater();
          }}
          style={[styles.item, expanded ? styles.itemExpanded : styles.itemCollapsed]}
        >
          <Text style={styles.icon}>⭐</Text>
          {expanded ? <Text style={styles.label}>Saved for later</Text> : null}
        </Pressable>
        <Pressable
          accessibilityLabel="My Moment"
          accessibilityRole="button"
          onPress={(event) => {
            event.stopPropagation();
            onPressMyMoment();
          }}
          style={[styles.item, expanded ? styles.itemExpanded : styles.itemCollapsed]}
        >
          <Text style={styles.icon}>📝</Text>
          {expanded ? <Text style={styles.label}>My Moment</Text> : null}
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  rail: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  railCollapsed: {
    paddingHorizontal: spacing.xs,
    width: 64,
  },
  railExpanded: {
    paddingHorizontal: spacing.sm,
    width: 156,
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
    marginHorizontal: 8,
  },
  item: {
    borderRadius: 18,
    minHeight: 60,
    paddingVertical: spacing.sm,
  },
  itemCollapsed: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  itemExpanded: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.sm,
  },
  itemSelected: {
    backgroundColor: colors.primarySoft,
  },
  icon: {
    fontSize: 22,
    textAlign: 'center',
    width: 24,
  },
  label: {
    color: colors.textSoft,
    flex: 1,
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.caption,
  },
  labelSelected: {
    color: colors.primary,
  },
});
