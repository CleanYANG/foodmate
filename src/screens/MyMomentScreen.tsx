import { useMemo } from 'react';
import { FlatList, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabBar } from '../components/BottomTabBar';
import { SkeletonBlock } from '../components/SkeletonBlock';
import { formatCategoryLabel } from '../config/discoveryRail';
import type { RootStackParamList } from '../navigation/types';
import { useLanguage } from '../store/LanguageContext';
import { useMoments } from '../store/MomentsContext';
import { useSavedPlaces } from '../store/SavedPlacesContext';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'MyMoment'>;

type MomentGridItem =
  | {
      id: string;
      kind: 'skeleton';
    }
  | {
      id: string;
      kind: 'moment';
      createdAt: string;
      imageUrl: string;
      placeId: string;
      placeName: string;
      text: string;
      vibeTags?: string[];
      category?: string;
    };

function formatMomentDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

function formatMomentCategory(
  category: string | undefined,
  t: (key: 'category.restaurant' | 'category.bar' | 'category.coffee' | 'category.streetFood') => string,
) {
  if (!category) {
    return null;
  }

  if (category === 'restaurant' || category === 'bar' || category === 'cafe' || category === 'on_mars') {
    return formatCategoryLabel(category, t);
  }

  return category;
}

function MomentCard({
  title,
  date,
  imageUrl,
  category,
  onPress,
  t,
}: {
  title: string;
  date: string;
  imageUrl: string;
  category?: string;
  onPress: () => void;
  t: (key: 'category.restaurant' | 'category.bar' | 'category.coffee' | 'category.streetFood') => string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.cardPressable, pressed && styles.pressed]}
    >
      <ImageBackground
        source={{ uri: imageUrl }}
        style={styles.momentCard}
        imageStyle={styles.momentImage}
      >
        <View style={styles.momentCopy}>
          <View style={styles.momentTopRow}>
            {category ? (
              <View style={styles.categoryChip}>
                <Text style={styles.categoryChipText}>{formatMomentCategory(category, t)}</Text>
              </View>
            ) : (
              <View />
            )}
            <Text style={styles.momentDate}>{date}</Text>
          </View>
          <Text numberOfLines={2} style={styles.momentTitle}>
            {title}
          </Text>
          <Text numberOfLines={1} style={styles.momentMetaLine}>
            {date}
          </Text>
        </View>
      </ImageBackground>
    </Pressable>
  );
}

export function MyMomentScreen({ navigation }: Props) {
  const { language, t } = useLanguage();
  const { moments, isLoading } = useMoments();
  const { savedPlaceIds } = useSavedPlaces();
  const totalPlaces = useMemo(() => new Set(moments.map((moment) => moment.placeId)).size, [moments]);
  const latestMood = useMemo(() => moments[0]?.vibeTags?.[0] ?? t('moments.default_mood'), [moments, t]);
  const summaryLine = t('moments.summary_line', {
    posts: moments.length,
    saved: savedPlaceIds.length,
    mood: latestMood,
  });

  const cards = useMemo(
    () =>
      moments.map((moment) => ({
        kind: 'moment' as const,
        ...moment,
        imageUrl:
          moment.userImageUrl ??
          moment.placeImageUrl ??
          'https://placehold.co/800x1200?text=fooMate+Moment',
      })),
    [moments],
  );

  const listData = useMemo<MomentGridItem[]>(
    () =>
      isLoading
        ? [
            { id: 'skeleton-1', kind: 'skeleton' },
            { id: 'skeleton-2', kind: 'skeleton' },
            { id: 'skeleton-3', kind: 'skeleton' },
            { id: 'skeleton-4', kind: 'skeleton' },
          ]
        : cards,
    [cards, isLoading],
  );

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <View style={styles.screen}>
        <FlatList
          ListHeaderComponent={
            <View style={styles.headerBlock}>
              <Text style={styles.pageTitle}>{t('me.title')}</Text>
              <Text style={styles.summaryLine}>{summaryLine}</Text>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>{t('me.myPosts')}</Text>
                <Text style={styles.sectionHint}>{totalPlaces}</Text>
              </View>
            </View>
          }
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.content}
          data={listData}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={({ item }) =>
            item.kind === 'skeleton' ? (
              <SkeletonBlock style={styles.skeletonCard} />
            ) : (
              <MomentCard
                date={formatMomentDate(item.createdAt, language === 'zh' ? 'zh-CN' : 'en-US')}
                imageUrl={item.imageUrl}
                onPress={() => navigation.navigate('PlaceDetail', { placeId: item.placeId })}
                title={item.placeName}
                category={item.category}
                t={t}
              />
            )
          }
          ListFooterComponent={
            <View style={styles.footerSection}>
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionTitle}>{t('me.savedCards')}</Text>
                <Pressable onPress={() => navigation.navigate('SavedPlaces')} style={styles.savedRow}>
                  <Text style={styles.savedRowText}>{t('me.openAccount')}</Text>
                  <Text style={styles.savedRowArrow}>›</Text>
                </Pressable>
              </View>

              <View style={styles.sectionBlock}>
                <Text style={styles.sectionTitle}>{t('me.settings')}</Text>
                <Pressable
                  onPress={() => navigation.navigate('Settings')}
                  style={({ pressed }) => [styles.settingsRow, pressed && styles.pressed]}
                >
                  <Text style={styles.savedRowText}>{t('me.openAccount')}</Text>
                  <Text style={styles.savedRowArrow}>›</Text>
                </Pressable>
              </View>
            </View>
          }
          style={styles.scrollView}
        />

        <BottomTabBar currentTab="MyMoment" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  scrollView: {
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  headerBlock: {
    marginBottom: spacing.lg,
  },
  pageTitle: {
    color: colors.text,
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.titleSm,
    letterSpacing: -0.4,
    lineHeight: typography.lineHeights.title,
    maxWidth: 290,
  },
  summaryLine: {
    color: colors.textMuted,
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.bodySm,
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  sectionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.body,
  },
  sectionHint: {
    color: colors.textMuted,
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.caption,
  },
  columnWrapper: {
    gap: spacing.sm,
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  cardPressable: {
    flex: 0.5,
    width: '47%',
  },
  pressed: {
    transform: [{ scale: 0.985 }],
  },
  momentCard: {
    aspectRatio: 0.8,
    backgroundColor: colors.surface,
    borderRadius: 28,
    justifyContent: 'space-between',
    overflow: 'hidden',
    padding: spacing.sm,
  },
  momentImage: {
    borderRadius: 20,
  },
  momentCopy: {
    backgroundColor: colors.surface,
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  momentTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryChip: {
    backgroundColor: colors.tagBg,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  categoryChipText: {
    color: colors.text,
    fontFamily: typography.fonts.medium,
    fontSize: 11,
  },
  momentTitle: {
    color: colors.text,
    fontFamily: typography.fonts.semibold,
    fontSize: 16,
    lineHeight: 20,
  },
  momentMetaLine: {
    color: colors.textMuted,
    fontFamily: typography.fonts.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  momentDate: {
    color: colors.textMuted,
    fontFamily: typography.fonts.medium,
    fontSize: 11,
  },
  skeletonCard: {
    aspectRatio: 0.8,
    borderRadius: 24,
    flex: 0.5,
    width: '47%',
  },
  footerSection: {
    gap: spacing.lg,
    marginTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  sectionBlock: {
    gap: spacing.sm,
  },
  settingsRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  savedRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  savedRowText: {
    color: colors.textSecondary,
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.bodySm,
  },
  savedRowArrow: {
    color: colors.textMuted,
    fontSize: 18,
  },
});
