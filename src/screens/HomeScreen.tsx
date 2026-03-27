import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { CategoryRail } from '../components/CategoryRail';
import { PlaceCard } from '../components/PlaceCard';
import { Screen } from '../components/Screen';
import { discoveryRailItems, type DiscoveryFilterId } from '../config/discoveryRail';
import type { RootStackParamList } from '../navigation/types';
import { fetchPlaces } from '../services/placeService';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { Place } from '../types/place';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

function toErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong while loading places.';
}

const fallbackPlace: Place = {
  id: 'placeholder-snow-lantern-coffee',
  name: 'Snow Lantern Coffee',
  shortReview:
    'A calm café with soft jazz, creamy lattes, and a window view that makes snowy mornings feel cinematic.',
  fullDescription:
    'A calm café with soft jazz, creamy lattes, and a window view that makes snowy mornings feel cinematic.',
  address: 'Address unavailable',
  latitude: null,
  longitude: null,
  imageUrl: 'https://placehold.co/800x1200?text=Snow+Lantern+Coffee',
  tags: ['cozy', 'quiet', 'coffee'],
  category: 'cafe',
  city: null,
  country: null,
};

export function HomeScreen({ navigation }: Props) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<DiscoveryFilterId>('cafe');
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(true);
  const [placesError, setPlacesError] = useState<string | null>(null);

  useEffect(() => {
    const loadPlaces = async () => {
      setIsLoadingPlaces(true);
      setPlacesError(null);

      try {
        const nextPlaces = await fetchPlaces();
        setPlaces(nextPlaces);
      } catch (error) {
        setPlacesError(toErrorMessage(error));
      } finally {
        setIsLoadingPlaces(false);
      }
    };

    void loadPlaces();
  }, []);

  const selectedPlace = useMemo(() => {
    const categoryMatch = places.find((place) => place.category === selectedCategory);

    if (categoryMatch) {
      return categoryMatch;
    }

    const firstAvailableCategory = discoveryRailItems.find((item) =>
      places.some((place) => place.category === item.id),
    );

    if (firstAvailableCategory) {
      return places.find((place) => place.category === firstAvailableCategory.id) ?? fallbackPlace;
    }

    return fallbackPlace;
  }, [places, selectedCategory]);

  const hasSelectedCategoryPlace = places.some((place) => place.category === selectedCategory);
  const matchedVisibleCategory = discoveryRailItems.find(
    (item) => item.id === selectedPlace.category,
  );
  const visibleCategory = matchedVisibleCategory?.id ?? selectedCategory;

  return (
    <Screen padded={false}>
      <View style={styles.container}>
        <CategoryRail
          selectedCategory={hasSelectedCategoryPlace ? selectedCategory : visibleCategory}
          onSelect={setSelectedCategory}
        />

        <View style={styles.cardArea}>
          {isLoadingPlaces ? (
            <View style={styles.centerState}>
              <ActivityIndicator color={colors.primary} size="small" />
            </View>
          ) : placesError ? (
            <View style={styles.centerState}>
              <Text style={styles.stateText}>{placesError}</Text>
            </View>
          ) : !hasSelectedCategoryPlace ? (
            <View style={styles.cardWrap}>
              <PlaceCard
                place={selectedPlace}
                onPressDetails={() =>
                  navigation.navigate('PlaceDetail', { placeId: selectedPlace.id })
                }
              />
              <View style={styles.noticeWrap}>
                <Text style={styles.noticeText}>No live places in this category yet.</Text>
              </View>
            </View>
          ) : (
            <View style={styles.cardWrap}>
              <PlaceCard
                place={selectedPlace}
                onPressDetails={() =>
                  navigation.navigate('PlaceDetail', { placeId: selectedPlace.id })
                }
              />
            </View>
          )}

          {!isLoadingPlaces && placesError ? (
            <Pressable onPress={() => navigation.replace('Home')} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  cardArea: {
    flex: 1,
    justifyContent: 'center',
  },
  cardWrap: {
    flex: 1,
  },
  centerState: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 32,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 560,
    padding: spacing.lg,
  },
  stateText: {
    color: colors.textMuted,
    fontSize: typography.sizes.body,
    lineHeight: typography.lineHeights.body,
    textAlign: 'center',
  },
  noticeWrap: {
    left: spacing.lg,
    position: 'absolute',
    top: spacing.lg,
  },
  noticeText: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 999,
    color: colors.text,
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.semibold,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
  },
  retryButton: {
    alignSelf: 'center',
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  retryText: {
    color: colors.primary,
    fontSize: typography.sizes.bodySm,
    fontWeight: typography.weights.bold,
  },
});
