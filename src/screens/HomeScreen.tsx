import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { CategoryRail } from '../components/CategoryRail';
import { PlaceCard } from '../components/PlaceCard';
import { Screen } from '../components/Screen';
import { type DiscoveryFilterId } from '../config/discoveryRail';
import type { RootStackParamList } from '../navigation/types';
import { fetchPlaces } from '../services/placeService';
import { useSavedPlaces } from '../store/SavedPlacesContext';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { Place } from '../types/place';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

type DiscoverLayoutConfig = {
  pagePadding: number;
  sectionGap: number;
  categoryBarMaxWidth?: number;
  categoryBarMinHeight: number;
  cardAreaUsage: number;
  cardWidthRatio: number;
  cardAspectRatio: number;
  cardMinHeight: number;
  cardMinWidth: number;
  cardMaxWidth?: number;
  cardMaxHeight?: number;
};

function toErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong while loading places.';
}

function getDiscoverLayoutConfig(windowWidth: number): DiscoverLayoutConfig {
  if (windowWidth >= 1440) {
    return {
      pagePadding: 32,
      sectionGap: 24,
      categoryBarMaxWidth: 980,
      categoryBarMinHeight: 76,
      cardAreaUsage: 0.88,
      cardWidthRatio: 0.86,
      cardAspectRatio: 0.84,
      cardMinHeight: 580,
      cardMinWidth: 520,
      cardMaxWidth: 820,
      cardMaxHeight: 880,
    };
  }

  if (windowWidth >= 1280) {
    return {
      pagePadding: 28,
      sectionGap: 22,
      categoryBarMaxWidth: 920,
      categoryBarMinHeight: 74,
      cardAreaUsage: 0.86,
      cardWidthRatio: 0.84,
      cardAspectRatio: 0.83,
      cardMinHeight: 540,
      cardMinWidth: 460,
      cardMaxWidth: 740,
      cardMaxHeight: 820,
    };
  }

  if (windowWidth >= 1024) {
    return {
      pagePadding: 24,
      sectionGap: 20,
      categoryBarMaxWidth: 860,
      categoryBarMinHeight: 72,
      cardAreaUsage: 0.84,
      cardWidthRatio: 0.82,
      cardAspectRatio: 0.82,
      cardMinHeight: 500,
      cardMinWidth: 420,
      cardMaxWidth: 660,
      cardMaxHeight: 760,
    };
  }

  if (windowWidth >= 768) {
    return {
      pagePadding: 20,
      sectionGap: 18,
      categoryBarMaxWidth: 680,
      categoryBarMinHeight: 68,
      cardAreaUsage: 0.88,
      cardWidthRatio: 0.86,
      cardAspectRatio: 0.8,
      cardMinHeight: 450,
      cardMinWidth: 340,
      cardMaxWidth: 520,
      cardMaxHeight: 660,
    };
  }

  return {
    pagePadding: 16,
    sectionGap: 14,
    categoryBarMinHeight: 62,
    cardAreaUsage: 0.94,
    cardWidthRatio: 0.92,
    cardAspectRatio: 0.76,
    cardMinHeight: 400,
    cardMinWidth: 250,
    cardMaxWidth: 430,
    cardMaxHeight: 540,
  };
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
  const [currentIndexByCategory, setCurrentIndexByCategory] = useState<
    Record<DiscoveryFilterId, number>
  >({
    restaurant: 0,
    bar: 0,
    cafe: 0,
    on_mars: 0,
  });
  const [feedback, setFeedback] = useState<'skip' | 'save' | null>(null);
  const [swipeFeedbackMessage, setSwipeFeedbackMessage] = useState<string | null>(null);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(true);
  const [placesError, setPlacesError] = useState<string | null>(null);
  const pan = useRef(new Animated.ValueXY()).current;
  const { savePlace } = useSavedPlaces();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const swipeThreshold = Math.max(windowWidth * 0.18, 72);
  const swipeOutDistance = windowWidth * 1.15;

  const layout = useMemo(() => getDiscoverLayoutConfig(windowWidth), [windowWidth]);
  const compactTopBar = windowWidth < 768;
  const contentWidth = Math.max(windowWidth - layout.pagePadding * 2, layout.cardMinWidth);
  const cardAreaWidth = contentWidth * layout.cardAreaUsage;
  const availableCardHeight = Math.max(
    windowHeight - layout.pagePadding * 2 - layout.categoryBarMinHeight - layout.sectionGap,
    layout.cardMinHeight,
  );
  const heightBoundWidth = (layout.cardMaxHeight ?? availableCardHeight) * layout.cardAspectRatio;
  const preferredCardWidth = Math.min(
    Math.max(cardAreaWidth * layout.cardWidthRatio, layout.cardMinWidth),
    layout.cardMaxWidth ?? Number.POSITIVE_INFINITY,
    contentWidth,
    heightBoundWidth,
  );
  const cardWidth = Math.max(preferredCardWidth, Math.min(layout.cardMinWidth, contentWidth));
  const cardHeight = Math.min(
    Math.max(cardWidth / layout.cardAspectRatio, layout.cardMinHeight),
    layout.cardMaxHeight ?? availableCardHeight,
    availableCardHeight,
  );
  const categoryBarWidth = Math.min(
    Math.max(cardWidth, 0),
    layout.categoryBarMaxWidth ?? contentWidth,
    contentWidth,
  );

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

  const placesByCategory = useMemo(
    () => ({
      restaurant: places.filter((place) => place.category === 'restaurant'),
      bar: places.filter((place) => place.category === 'bar'),
      cafe: places.filter((place) => place.category === 'cafe'),
      on_mars: places.filter((place) => place.category === 'on_mars'),
    }),
    [places],
  );

  const categoryPlaces = placesByCategory[selectedCategory];
  const rawCurrentIndex = currentIndexByCategory[selectedCategory] ?? 0;
  const normalizedCurrentIndex =
    categoryPlaces.length > 0 ? Math.min(rawCurrentIndex, categoryPlaces.length - 1) : 0;
  const selectedPlace =
    categoryPlaces.length > 0 ? categoryPlaces[normalizedCurrentIndex] : fallbackPlace;
  const hasSelectedCategoryPlace = categoryPlaces.length > 0;

  useEffect(() => {
    pan.setValue({ x: 0, y: 0 });
    setFeedback(null);
  }, [pan, selectedCategory, normalizedCurrentIndex]);

  useEffect(() => {
    if (!swipeFeedbackMessage) {
      return;
    }

    const timeout = setTimeout(() => setSwipeFeedbackMessage(null), 1800);
    return () => clearTimeout(timeout);
  }, [swipeFeedbackMessage]);

  const resetCardPosition = () => {
    Animated.spring(pan, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
      friction: 7,
      tension: 80,
    }).start(() => setFeedback(null));
  };

  const advanceCard = async (direction: 'left' | 'right') => {
    if (!hasSelectedCategoryPlace) {
      resetCardPosition();
      return;
    }

    if (direction === 'right') {
      try {
        await savePlace(selectedPlace.id);
        setSwipeFeedbackMessage('Saved for later');
      } catch {
        setSwipeFeedbackMessage(null);
      }
    }

    Animated.timing(pan, {
      toValue: {
        x: direction === 'right' ? swipeOutDistance : -swipeOutDistance,
        y: 12,
      },
      duration: 220,
      useNativeDriver: false,
    }).start(() => {
      pan.setValue({ x: 0, y: 0 });
      setFeedback(null);
      setCurrentIndexByCategory((currentValue) => {
        const maxIndex = Math.max(categoryPlaces.length - 1, 0);
        const nextIndex = maxIndex === 0 ? 0 : (rawCurrentIndex + 1) % categoryPlaces.length;

        return {
          ...currentValue,
          [selectedCategory]: nextIndex,
        };
      });
    });
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          hasSelectedCategoryPlace &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) &&
          Math.abs(gestureState.dx) > 8,
        onPanResponderMove: (_, gestureState) => {
          pan.setValue({ x: gestureState.dx, y: gestureState.dy * 0.06 });

          if (gestureState.dx > 18) {
            setFeedback('save');
          } else if (gestureState.dx < -18) {
            setFeedback('skip');
          } else {
            setFeedback(null);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx > swipeThreshold) {
            void advanceCard('right');
            return;
          }

          if (gestureState.dx < -swipeThreshold) {
            void advanceCard('left');
            return;
          }

          resetCardPosition();
        },
        onPanResponderTerminate: resetCardPosition,
      }),
    [
      hasSelectedCategoryPlace,
      pan,
      rawCurrentIndex,
      selectedCategory,
      swipeOutDistance,
      swipeThreshold,
    ],
  );

  const rotate = pan.x.interpolate({
    inputRange: [-windowWidth, 0, windowWidth],
    outputRange: ['-7deg', '0deg', '7deg'],
    extrapolate: 'clamp',
  });

  const cardScale = pan.x.interpolate({
    inputRange: [-windowWidth, 0, windowWidth],
    outputRange: [0.985, 1, 0.985],
    extrapolate: 'clamp',
  });

  return (
    <Screen padded={false}>
      <View
        style={[
          styles.container,
          {
            gap: layout.sectionGap,
            paddingHorizontal: layout.pagePadding,
            paddingVertical: layout.pagePadding,
          },
        ]}
      >
        <CategoryRail
          compact={compactTopBar}
          maxWidth={categoryBarWidth}
          selectedCategory={selectedCategory}
          onSelect={(category) => setSelectedCategory(category)}
          onPressSavedForLater={() => navigation.navigate('SavedPlaces')}
          onPressMyMoment={() => navigation.navigate('MyMoment')}
        />

        <View style={styles.cardArea}>
          {isLoadingPlaces ? (
            <View style={[styles.centerState, { height: cardHeight, maxWidth: cardWidth }]}>
              <ActivityIndicator color={colors.primary} size="small" />
            </View>
          ) : placesError ? (
            <View style={[styles.centerState, { height: cardHeight, maxWidth: cardWidth }]}>
              <Text style={styles.stateText}>{placesError}</Text>
            </View>
          ) : (
            <View
              style={[
                styles.cardWrap,
                { width: cardWidth, maxWidth: cardWidth, height: cardHeight },
              ]}
            >
              <Animated.View
                style={[
                  styles.swipeCard,
                  {
                    transform: [...pan.getTranslateTransform(), { rotate }, { scale: cardScale }],
                  },
                ]}
                {...panResponder.panHandlers}
              >
                <PlaceCard
                  place={selectedPlace}
                  onPressDetails={() =>
                    navigation.navigate('PlaceDetail', { placeId: selectedPlace.id })
                  }
                />

                {feedback ? (
                  <View
                    style={[
                      styles.feedbackPill,
                      feedback === 'save' ? styles.feedbackRight : styles.feedbackLeft,
                    ]}
                    pointerEvents="none"
                  >
                    <Text style={styles.feedbackText}>{feedback === 'save' ? 'SAVE' : 'SKIP'}</Text>
                  </View>
                ) : null}
              </Animated.View>

              {!hasSelectedCategoryPlace ? (
                <View pointerEvents="none" style={styles.noticeWrap}>
                  <Text style={styles.noticeText}>No live places in this category yet.</Text>
                </View>
              ) : null}

              {swipeFeedbackMessage ? (
                <View pointerEvents="none" style={styles.savedNoticeWrap}>
                  <Text style={styles.savedNoticeText}>{swipeFeedbackMessage}</Text>
                </View>
              ) : null}
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
  },
  cardArea: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  cardWrap: {
    justifyContent: 'center',
  },
  swipeCard: {
    flex: 1,
  },
  centerState: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 32,
    borderWidth: 1,
    justifyContent: 'center',
    minWidth: 240,
    padding: spacing.lg,
    width: '100%',
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
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.caption,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
  },
  savedNoticeWrap: {
    alignSelf: 'center',
    bottom: spacing.lg,
    position: 'absolute',
  },
  savedNoticeText: {
    backgroundColor: 'rgba(25, 22, 20, 0.82)',
    borderRadius: 999,
    color: colors.white,
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.caption,
    overflow: 'hidden',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  feedbackPill: {
    borderRadius: 999,
    left: spacing.lg,
    paddingHorizontal: 16,
    paddingVertical: 9,
    position: 'absolute',
    top: spacing.lg,
    transform: [{ rotate: '-7deg' }],
  },
  feedbackLeft: {
    backgroundColor: colors.primarySoft,
  },
  feedbackRight: {
    backgroundColor: colors.secondarySoft,
  },
  feedbackText: {
    color: colors.text,
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.bodySm,
    letterSpacing: 1.1,
  },
  retryButton: {
    alignSelf: 'center',
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  retryText: {
    color: colors.primary,
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.bodySm,
  },
});
