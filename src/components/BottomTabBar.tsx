import { useEffect, useMemo, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLanguage } from '../store/LanguageContext';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type TabRoute = 'Home' | 'Profile' | 'MyMoment';
type CurrentTabRoute = TabRoute | 'SavedPlaces';

type BottomTabBarProps = {
  currentTab: CurrentTabRoute;
  variant?: 'default' | 'compact';
  includeSafeAreaPadding?: boolean;
};

export const BOTTOM_TAB_BAR_BASE_HEIGHT = 64;
export const BOTTOM_TAB_BAR_COMPACT_HEIGHT = 62;

export function BottomTabBar({
  currentTab,
  variant = 'default',
  includeSafeAreaPadding = true,
}: BottomTabBarProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const isCompact = variant === 'compact';
  const activeTab: TabRoute = currentTab === 'SavedPlaces' ? 'MyMoment' : currentTab;
  const tabs = useMemo<Array<{ route: TabRoute; icon: string; label: string }>>(
    () => [
      { route: 'Home', icon: '⌂', label: t('nav.discover') },
      { route: 'Profile', icon: '+', label: t('nav.post') },
      { route: 'MyMoment', icon: '◠', label: t('nav.me') },
    ],
    [t],
  );
  const tabAnimations = useRef(
    tabs.reduce<Record<TabRoute, Animated.Value>>(
      (accumulator, tab) => ({
        ...accumulator,
        [tab.route]: new Animated.Value(tab.route === activeTab ? 1 : 0),
      }),
      {} as Record<TabRoute, Animated.Value>,
    ),
  ).current;

  useEffect(() => {
    Animated.parallel(
      tabs.map((tab) =>
        Animated.timing(tabAnimations[tab.route], {
          toValue: tab.route === activeTab ? 1 : 0,
          duration: 180,
          useNativeDriver: false,
        }),
      ),
    ).start();
  }, [activeTab, tabAnimations, tabs]);

  return (
    <View
      style={[
        styles.shell,
        isCompact ? styles.shellCompact : null,
        {
          paddingBottom: includeSafeAreaPadding
            ? Math.max(insets.bottom, isCompact ? spacing.xs : spacing.sm)
            : 0,
        },
      ]}
    >
      {tabs.map((tab) => {
        const isActive = tab.route === activeTab;
        const animation = tabAnimations[tab.route];
        const iconTranslateY = animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -2],
        });
        const iconColor = animation.interpolate({
          inputRange: [0, 1],
          outputRange: [colors.textMuted, colors.text],
        });
        const dotOpacity = animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        });

        return (
          <Pressable
            key={tab.route}
            accessibilityLabel={tab.label}
            accessibilityRole="button"
            onPress={() => {
              if (!isActive) {
                navigation.navigate(tab.route);
              }
            }}
            style={[styles.tab, isCompact ? styles.tabCompact : null]}
          >
            <Animated.Text
              style={[
                styles.icon,
                isCompact ? styles.iconCompact : null,
                {
                  color: iconColor,
                  transform: [{ translateY: iconTranslateY }],
                },
              ]}
            >
              {tab.icon}
            </Animated.Text>
            <Animated.View
              style={[
                styles.marker,
                isCompact ? styles.markerCompact : null,
                isActive ? styles.markerActive : null,
                { opacity: dotOpacity },
              ]}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  shellCompact: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minHeight: BOTTOM_TAB_BAR_BASE_HEIGHT,
    minWidth: 88,
    paddingHorizontal: spacing.sm,
  },
  tabCompact: {
    minHeight: BOTTOM_TAB_BAR_COMPACT_HEIGHT,
    minWidth: 72,
    paddingHorizontal: spacing.xs,
  },
  icon: {
    color: colors.textMuted,
    fontSize: 22,
    lineHeight: 24,
  },
  iconCompact: {
    fontSize: 20,
    lineHeight: 22,
  },
  marker: {
    backgroundColor: colors.border,
    borderRadius: 999,
    height: 4,
    marginTop: 8,
    width: 20,
  },
  markerCompact: {
    height: 4,
    marginTop: 7,
    width: 18,
  },
  markerActive: {
    backgroundColor: colors.accent,
  },
});
