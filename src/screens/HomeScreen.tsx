import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomTabBar } from '../components/BottomTabBar';
import { Screen } from '../components/Screen';
import { normalizePlaceCoverImage } from '../lib/placeCoverImage';
import { useAppViewport } from '../lib/useAppViewport';
import type { RootStackParamList } from '../navigation/types';
import { fetchPlaces } from '../services/placeService';
import { useLanguage } from '../store/LanguageContext';
import { useSavedPlaces } from '../store/SavedPlacesContext';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { Place } from '../types/place';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

function toErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

const fallbackPlace: Place = {
  id: 'placeholder-snow-lantern-coffee',
  name: 'Snow Lantern Coffee',
  shortReview: 'A quiet, warm cafe for a slow break.',
  fullDescription: 'A quiet, warm cafe for a slow break.',
  story:
    'A calm cafe with soft light, comfortable window seats, and an easy pace.',
  address: 'Odori, Sapporo',
  latitude: null,
  longitude: null,
  imageUrl: 'https://placehold.co/800x1200?text=Snow+Lantern+Coffee',
  coverImage: null,
  tags: ['coffee', 'quiet', 'winter view'],
  category: 'cafe',
  city: 'Sapporo',
  country: 'Japan',
  recommender: {
    name: 'Yuki',
    avatar: null,
    shortBio: 'Likes quiet cafes and slow winter walks.',
    intent: 'Looking for calm places with good coffee.',
    quote: 'The window seats feel especially nice here.',
  },
  budget: '¥800-1200',
  bestFor: ['Quiet conversation', 'First meet', 'Slow afternoon'],
  postMode: 'share',
  inviteStatus: 'idle',
  inviteCreatorUserId: null,
  inviteRequesterUserId: null,
  inviteAcceptedRequesterUserId: null,
};

function getImageSource(imageUrl: Place['imageUrl']) {
  return typeof imageUrl === 'string' ? { uri: imageUrl } : imageUrl;
}

export function HomeScreen({ navigation }: Props) {
  const { t } = useLanguage();
  const [places, setPlaces] = useState<Place[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState<'skip' | 'save' | null>(null);
  const [swipeFeedbackMessage, setSwipeFeedbackMessage] = useState<string | null>(null);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(true);
  const [placesError, setPlacesError] = useState<string | null>(null);
  const pan = useRef(new Animated.ValueXY()).current;
  const { savePlace } = useSavedPlaces();
  const { width: windowWidth, height: screenHeight } = useAppViewport();
  const insets = useSafeAreaInsets();
  const swipeThreshold = Math.max(windowWidth * 0.18, 72);
  const swipeUpThreshold = 76;
  const swipeOutDistance = windowWidth * 1.15;
  const shortViewport = screenHeight - insets.top - insets.bottom < 740;
  const topGap = 12;
  const gapBetweenCardAndNav = 24;
  const bottomNavVisualHeight = 88;
  const bottomNavHeight = bottomNavVisualHeight + insets.bottom;
  const cardTop = insets.top + topGap;
  const cardWidth = windowWidth - 32;
  const cardHeight = Math.max(screenHeight - cardTop - gapBetweenCardAndNav - bottomNavHeight, 0);
  const imageViewportBottom = shortViewport ? 118 : 138;

  useEffect(() => {
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

    void loadPlaces();
  }, [t]);

  const selectedPlace =
    places.length > 0 ? places[Math.min(currentIndex, places.length - 1)] : fallbackPlace;
  const nextPlace =
    places.length > 1 ? places[(currentIndex + 1) % places.length] : null;
  const hasPlace = places.length > 0;

  useEffect(() => {
    pan.setValue({ x: 0, y: 0 });
    setFeedback(null);
  }, [currentIndex, pan]);

  useEffect(() => {
    if (!swipeFeedbackMessage) {
      return;
    }

    const timeout = setTimeout(() => setSwipeFeedbackMessage(null), 1800);
    return () => clearTimeout(timeout);
  }, [swipeFeedbackMessage]);

  const goToNextCard = () => {
    setCurrentIndex((value) => (places.length <= 1 ? 0 : (value + 1) % places.length));
  };

  const openDetail = () => {
    if (!hasPlace) {
      return;
    }

    navigation.navigate('PlaceDetail', { placeId: selectedPlace.id });
  };

  const resetCardPosition = () => {
    Animated.spring(pan, {
      toValue: { x: 0, y: 0 },
      friction: 7,
      tension: 80,
      useNativeDriver: false,
    }).start(() => setFeedback(null));
  };

  const handleSave = async () => {
    if (!hasPlace) {
      return;
    }

    try {
      await savePlace(selectedPlace.id);
      setSwipeFeedbackMessage(t('home.saveFeedback'));
    } catch {
      setSwipeFeedbackMessage(null);
    }
  };

  const animateSwipeOut = (toValue: { x: number; y: number }, onComplete: () => void) => {
    Animated.timing(pan, {
      toValue,
      duration: 220,
      useNativeDriver: false,
    }).start(() => {
      pan.setValue({ x: 0, y: 0 });
      setFeedback(null);
      onComplete();
    });
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (!hasPlace) {
      resetCardPosition();
      return;
    }

    if (direction === 'right') {
      await handleSave();
    }

    animateSwipeOut(
      {
        x: direction === 'right' ? swipeOutDistance : -swipeOutDistance,
        y: 10,
      },
      goToNextCard,
    );
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          hasPlace &&
          ((Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 8) ||
            (gestureState.dy < -8 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx))),
        onPanResponderMove: (_, gestureState) => {
          pan.setValue({
            x: gestureState.dx,
            y: gestureState.dy < 0 ? gestureState.dy * 0.22 : gestureState.dy * 0.08,
          });

          if (gestureState.dx > 18) {
            setFeedback('save');
          } else if (gestureState.dx < -18) {
            setFeedback('skip');
          } else {
            setFeedback(null);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (
            gestureState.dy < -swipeUpThreshold &&
            Math.abs(gestureState.dy) > Math.abs(gestureState.dx)
          ) {
            animateSwipeOut({ x: 0, y: -120 }, openDetail);
            return;
          }

          if (gestureState.dx > swipeThreshold) {
            void handleSwipe('right');
            return;
          }

          if (gestureState.dx < -swipeThreshold) {
            void handleSwipe('left');
            return;
          }

          resetCardPosition();
        },
        onPanResponderTerminate: resetCardPosition,
      }),
    [hasPlace, pan, selectedPlace.id, swipeOutDistance, swipeThreshold, swipeUpThreshold],
  );

  const rotate = pan.x.interpolate({
    inputRange: [-windowWidth, 0, windowWidth],
    outputRange: ['-6deg', '0deg', '6deg'],
    extrapolate: 'clamp',
  });
  const dragScale = pan.x.interpolate({
    inputRange: [-windowWidth, 0, windowWidth],
    outputRange: [0.99, 1, 0.99],
    extrapolate: 'clamp',
  });
  const imageTranslateX = pan.x.interpolate({
    inputRange: [-windowWidth, 0, windowWidth],
    outputRange: [-windowWidth * 0.08, 0, windowWidth * 0.08],
    extrapolate: 'clamp',
  });
  const imageScale = pan.x.interpolate({
    inputRange: [-windowWidth, 0, windowWidth],
    outputRange: [1.05, 1.03, 1.05],
    extrapolate: 'clamp',
  });
  const nextCardScale = pan.x.interpolate({
    inputRange: [-windowWidth, 0, windowWidth],
    outputRange: [1, 0.965, 1],
    extrapolate: 'clamp',
  });
  const nextCardTranslateY = pan.x.interpolate({
    inputRange: [-windowWidth, 0, windowWidth],
    outputRange: [0, 16, 0],
    extrapolate: 'clamp',
  });
  const nextCardOpacity = pan.x.interpolate({
    inputRange: [-windowWidth, 0, windowWidth],
    outputRange: [1, 0.92, 1],
    extrapolate: 'clamp',
  });
  const renderCardContent = (
    place: Place,
    options?: {
      interactive?: boolean;
    },
  ) => {
    const interactive = options?.interactive ?? false;

    return (
      <>
        <View style={[styles.cardImageViewport, { bottom: imageViewportBottom }]}>
          <Animated.Image
            source={getImageSource(place.imageUrl)}
            resizeMode="cover"
            style={[
              styles.cardImageAsset,
              {
                transform: [
                  { translateX: normalizePlaceCoverImage(place.coverImage).offsetX },
                  { translateY: normalizePlaceCoverImage(place.coverImage).offsetY },
                  { scale: normalizePlaceCoverImage(place.coverImage).scale },
                ],
              },
              interactive
                ? {
                    transform: [
                      { translateX: normalizePlaceCoverImage(place.coverImage).offsetX },
                      { translateY: normalizePlaceCoverImage(place.coverImage).offsetY },
                      { scale: normalizePlaceCoverImage(place.coverImage).scale },
                      { translateX: imageTranslateX },
                      { scale: imageScale },
                    ],
                  }
                : null,
            ]}
          />
        </View>
        <View style={styles.bottomContent}>
          <View style={styles.cardSummaryRow}>
            <View style={styles.copyColumn}>
              <Text numberOfLines={2} style={[styles.placeTitle, shortViewport ? styles.placeTitleCompact : null]}>
                {place.name}
              </Text>
              <View style={styles.tagPills}>
                {place.tags.slice(0, shortViewport ? 2 : 3).map((tag) => (
                  <View key={tag} style={styles.tagPill}>
                    <Text style={styles.tagPillText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.actionColumn}>
              <Pressable onPress={openDetail} style={styles.viewAction}>
                <Text style={styles.viewActionText}>{t('home.viewRecommendation')}</Text>
              </Pressable>
              <Pressable onPress={() => void handleSave()} style={styles.saveAction}>
                <Text style={styles.saveActionIcon}>☆</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </>
    );
  };

  return (
    <Screen edges={[]} padded={false}>
      <View style={styles.container}>
        <View style={[styles.cardDeck, { marginTop: cardTop, height: cardHeight }]}>
          {isLoadingPlaces ? (
            <View style={[styles.centerState, { height: cardHeight, width: cardWidth }]}>
              <ActivityIndicator color={colors.text} size="small" />
              <Text style={styles.stateText}>{t('home.loadingCards')}</Text>
            </View>
          ) : placesError ? (
            <View style={[styles.centerState, { height: cardHeight, width: cardWidth }]}>
              <Text style={styles.stateText}>{placesError}</Text>
              <Pressable onPress={() => navigation.replace('Home')} style={styles.retryButton}>
                <Text style={styles.retryText}>{t('common.retry')}</Text>
              </Pressable>
            </View>
          ) : (
            <View style={[styles.cardWrap, { width: cardWidth, height: cardHeight }]}>
              {nextPlace ? (
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.swipeCard,
                    styles.underCard,
                    {
                      width: cardWidth,
                      height: cardHeight,
                      opacity: nextCardOpacity,
                      transform: [
                        { translateY: nextCardTranslateY },
                        { scale: nextCardScale },
                      ],
                    },
                  ]}
                >
                  {renderCardContent(nextPlace, {
                  })}
                </Animated.View>
              ) : null}

              <Animated.View
                style={[
                  styles.swipeCard,
                  {
                    width: cardWidth,
                    height: cardHeight,
                    transform: [
                      ...pan.getTranslateTransform(),
                      { rotate },
                      { scale: dragScale },
                    ],
                  },
                ]}
                {...panResponder.panHandlers}
              >
                {renderCardContent(selectedPlace, {
                  interactive: true,
                })}

                {feedback ? (
                  <View
                    pointerEvents="none"
                    style={[
                      styles.feedbackPill,
                      feedback === 'save' ? styles.feedbackSave : styles.feedbackSkip,
                    ]}
                  >
                    <Text style={styles.feedbackText}>
                      {feedback === 'save' ? t('action.save') : t('home.skipFeedback')}
                    </Text>
                  </View>
                ) : null}
              </Animated.View>

              {!hasPlace ? (
                <View pointerEvents="none" style={styles.noticeWrap}>
                  <Text style={styles.noticeText}>{t('home.noCards')}</Text>
                </View>
              ) : null}

              {swipeFeedbackMessage ? (
                <View pointerEvents="none" style={styles.savedNoticeWrap}>
                  <Text style={styles.savedNoticeText}>{swipeFeedbackMessage}</Text>
                </View>
              ) : null}
            </View>
          )}
        </View>

        <View
          style={[
            styles.bottomNavWrap,
            {
              height: bottomNavHeight,
              paddingBottom: insets.bottom,
            },
          ]}
        >
          <BottomTabBar currentTab="Home" includeSafeAreaPadding={false} variant="compact" />
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
  cardDeck: {
    marginHorizontal: 16,
  },
  cardWrap: {
    justifyContent: 'flex-start',
    position: 'relative',
  },
  bottomNavWrap: {
    flexShrink: 0,
    justifyContent: 'center',
  },
  swipeCard: {
    backgroundColor: colors.surface,
    borderRadius: 32,
    overflow: 'hidden',
  },
  underCard: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  cardImageViewport: {
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  cardImageAsset: {
    height: '100%',
    width: '100%',
  },
  bottomContent: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: spacing.lg,
  },
  cardSummaryRow: {
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 248, 238, 0.28)',
    borderColor: colors.white,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(16px)',
        boxShadow: '0 10px 24px rgba(15, 10, 6, 0.16)',
      },
      default: {
        shadowColor: '#120d08',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 18,
        elevation: 3,
      },
    }),
  },
  copyColumn: {
    flex: 1,
    gap: 8,
    paddingRight: spacing.sm,
  },
  placeTitle: {
    color: colors.text,
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.titleSm,
    lineHeight: 28,
    letterSpacing: -0.4,
  },
  placeTitleCompact: {
    fontSize: 18,
    lineHeight: 24,
  },
  tagPills: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagPill: {
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagPillText: {
    color: colors.text,
    fontFamily: typography.fonts.medium,
    fontSize: 11,
  },
  actionColumn: {
    alignItems: 'center',
    gap: 8,
    justifyContent: 'flex-end',
    marginLeft: 10,
  },
  viewAction: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 999,
    justifyContent: 'center',
    minHeight: 32,
    minWidth: 54,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  viewActionText: {
    color: colors.text,
    fontFamily: typography.fonts.medium,
    fontSize: 12,
  },
  saveAction: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 999,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  saveActionIcon: {
    color: colors.text,
    fontSize: 12,
  },
  centerState: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 32,
    gap: spacing.sm,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  stateText: {
    color: colors.textSecondary,
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.body,
    lineHeight: typography.lineHeights.body,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  retryText: {
    color: colors.text,
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.bodySm,
  },
  feedbackPill: {
    borderRadius: 999,
    left: spacing.lg,
    paddingHorizontal: 14,
    paddingVertical: 8,
    position: 'absolute',
    top: spacing.xxl,
    transform: [{ rotate: '-6deg' }],
  },
  feedbackSave: {
    backgroundColor: colors.accent,
  },
  feedbackSkip: {
    backgroundColor: colors.surface,
  },
  feedbackText: {
    color: colors.text,
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.caption,
  },
  noticeWrap: {
    alignSelf: 'center',
    bottom: spacing.lg,
    position: 'absolute',
  },
  noticeText: {
    backgroundColor: colors.surface,
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
    backgroundColor: colors.primary,
    borderRadius: 999,
    color: colors.primaryText,
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.caption,
    overflow: 'hidden',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
});
