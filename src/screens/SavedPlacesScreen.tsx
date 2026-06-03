import { useEffect, useMemo, useState } from 'react';
import { Image, type ImageSourcePropType, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { formatCategoryLabel } from '../config/discoveryRail';
import { BottomTabBar } from '../components/BottomTabBar';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { InlineNotice } from '../components/InlineNotice';
import { Screen } from '../components/Screen';
import { SkeletonBlock } from '../components/SkeletonBlock';
import { StateCard } from '../components/StateCard';
import { Tag } from '../components/Tag';
import { TasteAvatar } from '../components/TasteAvatar';
import { normalizePlaceCoverImage } from '../lib/placeCoverImage';
import { formatTagLabel } from '../lib/placeTags';
import type { RootStackParamList } from '../navigation/types';
import { fetchPlaces } from '../services/placeService';
import { useAuth } from '../store/AuthContext';
import { useLanguage } from '../store/LanguageContext';
import { useSavedPlaces } from '../store/SavedPlacesContext';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { Place } from '../types/place';

type Props = NativeStackScreenProps<RootStackParamList, 'SavedPlaces'>;

function getImageSource(imageUrl: Place['imageUrl']): ImageSourcePropType {
  return typeof imageUrl === 'string' ? { uri: imageUrl } : imageUrl;
}

function toErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export function SavedPlacesScreen({ navigation }: Props) {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(true);
  const [placesError, setPlacesError] = useState<string | null>(null);
  const [saveFeedbackMessage, setSaveFeedbackMessage] = useState<string | null>(null);
  const { savedPlaceIds, removePlace, isLoading, errorMessage, refreshSavedPlaces } =
    useSavedPlaces();

  const loadPlaces = async () => {
    setIsLoadingPlaces(true);
    setPlacesError(null);

    try {
      setPlaces(await fetchPlaces());
    } catch (error) {
      setPlacesError(toErrorMessage(error, t('common.error')));
    } finally {
      setIsLoadingPlaces(false);
    }
  };

  useEffect(() => {
    void loadPlaces();
  }, []);

  useEffect(() => {
    if (!saveFeedbackMessage) {
      return;
    }

    const timeout = setTimeout(() => setSaveFeedbackMessage(null), 2400);
    return () => clearTimeout(timeout);
  }, [saveFeedbackMessage]);

  const savedPlaces = useMemo(
    () => places.filter((place) => savedPlaceIds.includes(place.id)),
    [places, savedPlaceIds],
  );
  const leftColumnPlaces = savedPlaces.filter((_, index) => index % 2 === 0);
  const rightColumnPlaces = savedPlaces.filter((_, index) => index % 2 === 1);

  const handleRemove = (place: Place) =>
    void removePlace(place.id)
      .then(() => {
        setSaveFeedbackMessage(t('saved.removed_feedback', { name: place.name }));
        return refreshSavedPlaces();
      })
      .catch(() => {
        // Prompting/error state is handled upstream.
      });

  if (!isAuthenticated) {
    return (
      <Screen padded={false}>
        <View style={styles.screen}>
          <View style={styles.decorBlobOne} pointerEvents="none" />
          <View style={styles.decorBlobTwo} pointerEvents="none" />

          <View style={styles.content}>
            <Card style={styles.guestCard}>
              <Text style={styles.emptyTitle}>{t('nav.sign_in')}</Text>
              <Button variant="primary" onPress={() => navigation.navigate('SignIn')}>
                {t('saved.sign_in')}
              </Button>
            </Card>
          </View>

          <BottomTabBar currentTab="SavedPlaces" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <View style={styles.screen}>
        <View style={styles.decorBlobOne} pointerEvents="none" />
        <View style={styles.decorBlobTwo} pointerEvents="none" />

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.headerWrap}>
            <ScreenHeader
              eyebrow={t('saved.eyebrow')}
              title={t('saved.title')}
              description={t('saved.description')}
            />
          </View>

          {saveFeedbackMessage ? <InlineNotice message={saveFeedbackMessage} tone="success" /> : null}
          {errorMessage ? <InlineNotice message={errorMessage} tone="error" /> : null}

          {placesError ? (
            <StateCard
              title={t('saved.error_title')}
              description={placesError}
              actionLabel={t('common.retry')}
              onAction={() => void loadPlaces()}
            />
          ) : null}

          {isLoading || isLoadingPlaces ? (
            <Card>
              <Text style={styles.emptyTitle}>{t('saved.loading_title')}</Text>
              <Text style={styles.emptyText}>{t('saved.loading_body')}</Text>
              <SkeletonBlock style={styles.loadingImage} />
              <SkeletonBlock style={styles.skeletonTitle} />
              <SkeletonBlock style={styles.skeletonBodyLine} />
              <View style={styles.tagsRow}>
                <SkeletonBlock style={styles.skeletonChip} />
                <SkeletonBlock style={styles.skeletonChipWide} />
              </View>
            </Card>
          ) : null}

          {!isLoading && !isLoadingPlaces && savedPlaces.length === 0 ? (
            <StateCard
              title={t('saved.empty_title')}
              description={t('saved.empty_body')}
              actionLabel={t('tabs.discover')}
              onAction={() => navigation.navigate('Home')}
            />
          ) : null}

          {!isLoading && !isLoadingPlaces && savedPlaces.length > 0 ? (
            <View style={styles.masonryGrid}>
              <View style={styles.masonryColumn}>
                {leftColumnPlaces.map((place, index) => (
                  <Card
                    key={place.id}
                    style={[styles.placeCard, index % 2 === 0 ? styles.tallCard : styles.shortCard]}
                  >
                    <View style={styles.placeImageFrame}>
                      <Image
                        source={getImageSource(place.imageUrl)}
                        style={[
                          styles.placeImage,
                          {
                            transform: [
                              { translateX: normalizePlaceCoverImage(place.coverImage).offsetX * 0.45 },
                              { translateY: normalizePlaceCoverImage(place.coverImage).offsetY * 0.45 },
                              { scale: normalizePlaceCoverImage(place.coverImage).scale },
                            ],
                          },
                        ]}
                      />
                    </View>
                    <View style={styles.imageBadgeRow}>
                      <Tag label={formatCategoryLabel(place.category, t)} tone="primary" />
                      <Text style={styles.imageBadgeHeart}>♥</Text>
                    </View>

                    <View style={styles.placeBody}>
                      <View style={styles.recommenderRow}>
                        <TasteAvatar avatarId={place.recommender.avatar} size={24} />
                        <Text style={styles.recommenderLine}>
                          {place.postMode === 'invite'
                            ? t('detail.inviting')
                            : t('saved.recommends', { name: place.recommender.name })}
                        </Text>
                      </View>
                      <Text style={styles.placeTitle}>{place.name}</Text>
                      <Text numberOfLines={3} style={styles.placeReview}>
                        “{place.recommender.quote}”
                      </Text>
                      {place.tags.length > 0 ? (
                        <View style={styles.tagsRow}>
                          {place.tags.slice(0, 2).map((tag) => (
                            <Tag key={tag} label={formatTagLabel(tag)} />
                          ))}
                        </View>
                      ) : null}
                    </View>

                    <View style={styles.actionsRow}>
                      <Button
                        variant="secondary"
                        style={styles.flexButton}
                        onPress={() => navigation.navigate('PlaceDetail', { placeId: place.id })}
                      >
                        {t('saved.open')}
                      </Button>
                      <Button variant="danger" style={styles.flexButton} onPress={() => handleRemove(place)}>
                        {t('saved.remove')}
                      </Button>
                    </View>
                  </Card>
                ))}
              </View>

              <View style={styles.masonryColumn}>
                {rightColumnPlaces.map((place, index) => (
                  <Card
                    key={place.id}
                    style={[styles.placeCard, index % 2 === 0 ? styles.shortCard : styles.tallCard]}
                  >
                    <View style={styles.placeImageFrame}>
                      <Image
                        source={getImageSource(place.imageUrl)}
                        style={[
                          styles.placeImage,
                          {
                            transform: [
                              { translateX: normalizePlaceCoverImage(place.coverImage).offsetX * 0.45 },
                              { translateY: normalizePlaceCoverImage(place.coverImage).offsetY * 0.45 },
                              { scale: normalizePlaceCoverImage(place.coverImage).scale },
                            ],
                          },
                        ]}
                      />
                    </View>
                    <View style={styles.imageBadgeRow}>
                      <Tag label={formatCategoryLabel(place.category, t)} tone="primary" />
                      <Text style={styles.imageBadgeHeart}>♥</Text>
                    </View>

                    <View style={styles.placeBody}>
                      <View style={styles.recommenderRow}>
                        <TasteAvatar avatarId={place.recommender.avatar} size={24} />
                        <Text style={styles.recommenderLine}>
                          {place.postMode === 'invite'
                            ? t('detail.inviting')
                            : t('saved.recommends', { name: place.recommender.name })}
                        </Text>
                      </View>
                      <Text style={styles.placeTitle}>{place.name}</Text>
                      <Text numberOfLines={3} style={styles.placeReview}>
                        “{place.recommender.quote}”
                      </Text>
                      {place.tags.length > 0 ? (
                        <View style={styles.tagsRow}>
                          {place.tags.slice(0, 2).map((tag) => (
                            <Tag key={tag} label={formatTagLabel(tag)} />
                          ))}
                        </View>
                      ) : null}
                    </View>

                    <View style={styles.actionsRow}>
                      <Button
                        variant="secondary"
                        style={styles.flexButton}
                        onPress={() => navigation.navigate('PlaceDetail', { placeId: place.id })}
                      >
                        {t('saved.open')}
                      </Button>
                      <Button variant="danger" style={styles.flexButton} onPress={() => handleRemove(place)}>
                        {t('saved.remove')}
                      </Button>
                    </View>
                  </Card>
                ))}
              </View>
            </View>
          ) : null}
        </ScrollView>

        <BottomTabBar currentTab="SavedPlaces" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  decorBlobOne: {
    backgroundColor: 'transparent',
    borderRadius: 120,
    height: 140,
    left: -50,
    position: 'absolute',
    top: 80,
    width: 140,
  },
  decorBlobTwo: {
    backgroundColor: 'transparent',
    borderRadius: 140,
    height: 160,
    position: 'absolute',
    right: -60,
    top: 220,
    width: 160,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xxl + spacing.lg,
  },
  headerWrap: {
    paddingTop: spacing.sm,
  },
  guestCard: {
    alignItems: 'stretch',
    marginTop: spacing.sm,
  },
  emptyTitle: {
    color: colors.text,
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.titleSm,
  },
  emptyText: {
    color: colors.textMuted,
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.body,
    lineHeight: typography.lineHeights.body,
  },
  masonryGrid: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
  },
  masonryColumn: {
    flex: 1,
    gap: spacing.md,
  },
  placeCard: {
    gap: spacing.md,
    padding: spacing.md,
  },
  tallCard: {
    minHeight: 370,
  },
  shortCard: {
    minHeight: 324,
  },
  loadingImage: {
    borderRadius: 18,
    height: 220,
    width: '100%',
  },
  placeImage: {
    height: 188,
    width: '100%',
  },
  placeImageFrame: {
    borderRadius: 22,
    height: 188,
    overflow: 'hidden',
    width: '100%',
  },
  imageBadgeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -6,
  },
  imageBadgeHeart: {
    backgroundColor: colors.white,
    borderRadius: 999,
    color: colors.text,
    fontSize: 14,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  placeBody: {
    gap: spacing.sm,
  },
  recommenderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  recommenderLine: {
    color: colors.accent,
    fontFamily: typography.fonts.medium,
    fontSize: 12,
    letterSpacing: 0.2,
  },
  skeletonTitle: {
    height: 28,
    width: '68%',
  },
  skeletonBodyLine: {
    height: 18,
    width: '100%',
  },
  skeletonChip: {
    height: 32,
    width: 86,
  },
  skeletonChipWide: {
    height: 32,
    width: 124,
  },
  placeTitle: {
    color: colors.text,
    fontFamily: typography.fonts.semibold,
    fontSize: 22,
    letterSpacing: -0.4,
    lineHeight: 28,
  },
  placeReview: {
    color: colors.textSecondary,
    fontFamily: typography.fonts.regular,
    fontSize: 14,
    lineHeight: 22,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  flexButton: {
    flex: 1,
    minHeight: 46,
  },
});
