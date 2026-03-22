import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  discoveryRailItems,
  formatCategoryLabel,
  type DiscoveryFilterId,
} from '../config/discoveryRail';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { InlineNotice } from '../components/InlineNotice';
import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import { SkeletonBlock } from '../components/SkeletonBlock';
import { StateCard } from '../components/StateCard';
import { Tag } from '../components/Tag';
import { formatTagLabel } from '../lib/placeTags';
import type { RootStackParamList } from '../navigation/types';
import { fetchPlaces } from '../services/placeService';
import { useSavedPlaces } from '../store/SavedPlacesContext';
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

export function HomeScreen({ navigation }: Props) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState<'skip' | 'save' | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<DiscoveryFilterId>('all');
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(true);
  const [placesError, setPlacesError] = useState<string | null>(null);
  const [saveFeedbackMessage, setSaveFeedbackMessage] = useState<string | null>(null);
  const [showDiscoveryHint, setShowDiscoveryHint] = useState(false);
  const [isRailExpanded, setIsRailExpanded] = useState(false);
  const { savePlace, isSaved, errorMessage: savedPlacesError } = useSavedPlaces();
  const pan = useRef(new Animated.ValueXY()).current;
  const railWidth = useRef(new Animated.Value(68)).current;
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const screenWidth = Math.max(windowWidth, 320);
  const isCompactWidth = screenWidth < 390;
  const isShortScreen = windowHeight < 760;
  const isVeryShortScreen = windowHeight < 700;
  const swipeThreshold = screenWidth * 0.22;
  const swipeOutDistance = screenWidth * 1.2;
  const cardPadding = isCompactWidth || isShortScreen ? spacing.lg : spacing.xl;
  const layoutGap = isShortScreen ? spacing.md : spacing.lg;
  const headerGap = isShortScreen ? spacing.xs : spacing.sm;
  const railExpandedWidth = isCompactWidth ? 150 : 168;
  const cardMinHeight = Math.min(
    Math.max(windowHeight * (isVeryShortScreen ? 0.42 : 0.48), 360),
    620,
  );
  const reviewLines = isVeryShortScreen ? 2 : isShortScreen ? 3 : 4;
  const titleLines = isCompactWidth ? 2 : 3;
  const contentBottomPadding = Math.max(insets.bottom, spacing.sm) + spacing.md;

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

  useEffect(() => {
    void loadPlaces();
  }, []);

  useEffect(() => {
    Animated.timing(railWidth, {
      toValue: isRailExpanded ? railExpandedWidth : 68,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [isRailExpanded, railExpandedWidth, railWidth]);

  const filteredPlaces = useMemo(() => {
    if (selectedFilter === 'all') {
      return places;
    }

    return places.filter(
      (place) =>
        place.category === selectedFilter ||
        place.collections.includes(selectedFilter) ||
        place.tags.includes(selectedFilter),
    );
  }, [places, selectedFilter]);

  useEffect(() => {
    setCurrentIndex(0);
    setFeedback(null);
    pan.setValue({ x: 0, y: 0 });
  }, [selectedFilter, pan]);

  useEffect(() => {
    if (!saveFeedbackMessage) {
      return;
    }

    const timeout = setTimeout(() => setSaveFeedbackMessage(null), 2400);
    return () => clearTimeout(timeout);
  }, [saveFeedbackMessage]);

  useEffect(() => {
    if (isLoadingPlaces || placesError || filteredPlaces.length === 0 || currentIndex !== 0) {
      setShowDiscoveryHint(false);
      return;
    }

    setShowDiscoveryHint(true);
    const timeout = setTimeout(() => setShowDiscoveryHint(false), 2800);
    return () => clearTimeout(timeout);
  }, [currentIndex, filteredPlaces.length, isLoadingPlaces, placesError]);

  const currentPlace = filteredPlaces[currentIndex];
  const hasMorePlaces = currentIndex < filteredPlaces.length;
  const progress = filteredPlaces.length === 0 ? 0 : currentIndex + 1;

  const resetCardPosition = () => {
    Animated.spring(pan, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
      friction: 7,
      tension: 80,
    }).start(() => setFeedback(null));
  };

  const advanceCard = (direction: 'left' | 'right') => {
    const activePlace = currentPlace;

    if (direction === 'right' && activePlace) {
      void savePlace(activePlace.id)
        .then(() => {
          setSaveFeedbackMessage(`${activePlace.name} saved.`);
        })
        .catch(() => {
          // Prompting/rollback is handled in context.
        });
    }

    Animated.timing(pan, {
      toValue: {
        x: direction === 'right' ? swipeOutDistance : -swipeOutDistance,
        y: 20,
      },
      duration: 220,
      useNativeDriver: false,
    }).start(() => {
      pan.setValue({ x: 0, y: 0 });
      setFeedback(null);
      setCurrentIndex((prev) => prev + 1);
    });
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 8,
        onPanResponderMove: (_, gestureState) => {
          pan.setValue({ x: gestureState.dx, y: gestureState.dy * 0.08 });

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
            advanceCard('right');
            return;
          }

          if (gestureState.dx < -swipeThreshold) {
            advanceCard('left');
            return;
          }

          resetCardPosition();
        },
        onPanResponderTerminate: resetCardPosition,
      }),
    [currentPlace, pan, savePlace, swipeOutDistance, swipeThreshold],
  );

  const rotate = pan.x.interpolate({
    inputRange: [-screenWidth, 0, screenWidth],
    outputRange: ['-7deg', '0deg', '7deg'],
    extrapolate: 'clamp',
  });

  const cardScale = pan.x.interpolate({
    inputRange: [-screenWidth, 0, screenWidth],
    outputRange: [0.985, 1, 0.985],
    extrapolate: 'clamp',
  });

  if (isLoadingPlaces) {
    return (
      <Screen>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { gap: layoutGap, paddingBottom: contentBottomPadding },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <ScreenHeader
            eyebrow="CityTalk"
            title="Loading places"
            description="Pulling the latest deck from Supabase."
          />
          <View style={styles.discoveryRow}>
            <Card style={styles.loadingRailCard}>
              <SkeletonBlock style={styles.loadingRailButton} />
              <SkeletonBlock style={styles.loadingRailButton} />
              <SkeletonBlock style={styles.loadingRailButton} />
            </Card>
            <View style={styles.mainColumn}>
              <Card style={styles.progressCard}>
                <SkeletonBlock style={styles.skeletonLineShort} />
                <SkeletonBlock style={styles.skeletonTrack} />
              </Card>
              <Card style={[styles.loadingDeckCard, { minHeight: cardMinHeight }]}>
                <SkeletonBlock style={[styles.loadingHero, { height: cardMinHeight * 0.58 }]} />
                <View style={[styles.loadingCardContent, { padding: cardPadding }]}>
                  <View style={styles.topMetaRow}>
                    <SkeletonBlock style={styles.skeletonChip} />
                    <SkeletonBlock style={styles.skeletonChip} />
                  </View>
                  <SkeletonBlock style={styles.skeletonTitle} />
                  <SkeletonBlock style={styles.skeletonBodyLine} />
                  <SkeletonBlock style={styles.skeletonBodyLineShort} />
                  <View style={styles.tagsRow}>
                    <SkeletonBlock style={styles.skeletonChip} />
                    <SkeletonBlock style={styles.skeletonChipWide} />
                  </View>
                  <SkeletonBlock style={styles.skeletonButton} />
                </View>
              </Card>
            </View>
          </View>
        </ScrollView>
      </Screen>
    );
  }

  if (placesError) {
    return (
      <Screen>
        <View style={[styles.container, { gap: layoutGap }]}>
          <ScreenHeader
            eyebrow="CityTalk"
            title="Could not load places"
            description={placesError}
          />
          <StateCard
            title="The place feed didn’t load"
            description="Check your connection or Supabase config, then try again."
            actionLabel="Retry"
            onAction={() => void loadPlaces()}
          />
        </View>
      </Screen>
    );
  }

  if (places.length === 0) {
    return (
      <Screen>
        <View style={[styles.container, { gap: layoutGap }]}>
          <ScreenHeader
            eyebrow="CityTalk"
            title="No places yet"
            description="Your places table is empty right now. Add a few rows in Supabase and this deck will populate automatically."
          />
          <StateCard
            title="Your feed is empty"
            description="Add the first place from the admin panel, then come back here to swipe through it."
            actionLabel="Retry"
            onAction={() => void loadPlaces()}
          />
        </View>
      </Screen>
    );
  }

  if (filteredPlaces.length === 0) {
    return (
      <Screen>
        <View style={[styles.container, { gap: layoutGap }]}>
          <ScreenHeader
            eyebrow="CityTalk"
            title="No matches for this filter"
            description="Try another category or clear the rail selection to see the full discovery deck again."
          />
          <Button variant="secondary" onPress={() => setSelectedFilter('all')}>
            Show all places
          </Button>
        </View>
      </Screen>
    );
  }

  if (!hasMorePlaces) {
    return (
      <Screen>
        <View style={[styles.container, { gap: layoutGap }]}>
          <ScreenHeader
            eyebrow="CityTalk"
            title="Deck complete"
            description={
              selectedFilter === 'all'
                ? 'You made it through the full set. Restart the deck or jump into your saved places.'
                : `You made it through every place in ${discoveryRailItems.find((item) => item.id === selectedFilter)?.label ?? 'this filter'}.`
            }
          />
          <Card>
            <Text style={styles.emptyTitle}>All places reviewed</Text>
            <Text style={styles.emptyText}>
              You swiped through {filteredPlaces.length} places in this session.
            </Text>
            <View style={styles.actionRow}>
              <Button
                variant="primary"
                style={styles.flexButton}
                onPress={() => setCurrentIndex(0)}
              >
                Restart deck
              </Button>
              <Button
                variant="secondary"
                style={styles.flexButton}
                onPress={() => navigation.navigate('SavedPlaces')}
              >
                Saved places
              </Button>
            </View>
          </Card>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.scrollContent,
          { gap: layoutGap, paddingBottom: contentBottomPadding },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerCopy}>
            <ScreenHeader
              eyebrow="CityTalk"
              title="Discover places one card at a time"
              description="Swipe-first city discovery with quick filters on the left."
            />
          </View>
          <Button variant="secondary" onPress={() => navigation.navigate('SavedPlaces')}>
            Saved
          </Button>
        </View>

        {showDiscoveryHint ? (
          <InlineNotice message="Swipe left to skip, right to save. Tap the left rail to switch categories or collections." />
        ) : null}

        {saveFeedbackMessage ? <InlineNotice message={saveFeedbackMessage} tone="success" /> : null}
        {savedPlacesError ? <InlineNotice message={savedPlacesError} tone="error" /> : null}

        <View style={styles.discoveryRow}>
          <Animated.View style={[styles.rail, { width: railWidth }]}>
            <Pressable
              onPress={() => setIsRailExpanded((value) => !value)}
              style={[styles.railToggle, isRailExpanded ? styles.railToggleExpanded : null]}
            >
              <Text style={styles.railToggleIcon}>{isRailExpanded ? '⬅️' : '➡️'}</Text>
              {isRailExpanded ? <Text style={styles.railToggleLabel}>Filters</Text> : null}
            </Pressable>

            {discoveryRailItems.map((item) => {
              const selected = selectedFilter === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setSelectedFilter(item.id)}
                  style={[styles.railItem, selected ? styles.railItemSelected : null]}
                >
                  <Text style={styles.railIcon}>{item.icon}</Text>
                  {isRailExpanded ? (
                    <Text
                      style={[styles.railLabel, selected ? styles.railLabelSelected : null]}
                      numberOfLines={1}
                    >
                      {item.label}
                    </Text>
                  ) : null}
                </Pressable>
              );
            })}
          </Animated.View>

          <View style={styles.mainColumn}>
            <Card style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Deck progress</Text>
                <Text style={styles.progressValue}>
                  {Math.min(progress, filteredPlaces.length)} / {filteredPlaces.length}
                </Text>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${filteredPlaces.length === 0 ? 0 : (Math.min(progress, filteredPlaces.length) / filteredPlaces.length) * 100}%`,
                    },
                  ]}
                />
              </View>
            </Card>

            <View style={[styles.deckArea, { minHeight: cardMinHeight }]}>
              <Animated.View
                style={[
                  styles.swipeCard,
                  {
                    minHeight: cardMinHeight,
                    transform: [...pan.getTranslateTransform(), { rotate }, { scale: cardScale }],
                  },
                ]}
                {...panResponder.panHandlers}
              >
                <Image source={{ uri: currentPlace.imageUrl }} style={styles.heroImage} />
                <View style={styles.imageOverlay} />

                {feedback ? (
                  <View
                    style={[
                      styles.feedbackPill,
                      feedback === 'save' ? styles.feedbackSave : styles.feedbackSkip,
                    ]}
                  >
                    <Text style={styles.feedbackText}>{feedback === 'save' ? 'SAVE' : 'SKIP'}</Text>
                  </View>
                ) : null}

                <View style={[styles.cardContent, { padding: cardPadding, gap: headerGap }]}>
                  <View style={styles.topMetaRow}>
                    <Tag label={formatCategoryLabel(currentPlace.category)} tone="primary" />
                    {isSaved(currentPlace.id) ? <Tag label="saved" /> : null}
                    {currentPlace.collections.slice(0, 1).map((collection) => (
                      <Tag key={collection} label={formatTagLabel(collection)} />
                    ))}
                  </View>

                  <Text
                    style={[
                      styles.placeTitle,
                      isCompactWidth ? styles.placeTitleCompact : null,
                      isVeryShortScreen ? styles.placeTitleShortScreen : null,
                    ]}
                    numberOfLines={titleLines}
                  >
                    {currentPlace.name}
                  </Text>
                  <Text style={styles.placeReview} numberOfLines={reviewLines}>
                    {currentPlace.shortReview}
                  </Text>

                  {currentPlace.tags.length > 0 ? (
                    <View style={styles.tagsRow}>
                      {currentPlace.tags.slice(0, isVeryShortScreen ? 2 : 4).map((tag) => (
                        <Tag key={tag} label={formatTagLabel(tag)} />
                      ))}
                    </View>
                  ) : null}

                  <View style={styles.cardActions}>
                    <Button
                      variant="secondary"
                      style={styles.flexButton}
                      onPress={() =>
                        navigation.navigate('PlaceDetail', { placeId: currentPlace.id })
                      }
                    >
                      Open details
                    </Button>
                    <Button
                      variant="primary"
                      style={styles.flexButton}
                      onPress={() => advanceCard('right')}
                    >
                      Save
                    </Button>
                  </View>
                </View>
              </Animated.View>
            </View>

            <View style={styles.hintRow}>
              <Text style={styles.hintText}>← Skip</Text>
              <Text style={styles.activeFilterText} numberOfLines={1}>
                {selectedFilter === 'all'
                  ? 'All places'
                  : discoveryRailItems.find((item) => item.id === selectedFilter)?.label}
              </Text>
              <Text style={styles.hintText}>Save →</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    gap: spacing.lg,
  },
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  headerCopy: {
    flex: 1,
  },
  discoveryRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
  },
  rail: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    gap: spacing.sm,
    overflow: 'hidden',
    padding: spacing.sm,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 3,
  },
  railToggle: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: 16,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: spacing.sm,
  },
  railToggleExpanded: {
    justifyContent: 'flex-start',
  },
  railToggleIcon: {
    fontSize: 16,
  },
  railToggleLabel: {
    color: colors.text,
    fontSize: typography.sizes.bodySm,
    fontWeight: typography.weights.bold,
  },
  railItem: {
    alignItems: 'center',
    borderRadius: 18,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 50,
    paddingHorizontal: spacing.sm,
  },
  railItemSelected: {
    backgroundColor: colors.primarySoft,
  },
  railIcon: {
    fontSize: 22,
    width: 24,
    textAlign: 'center',
  },
  railLabel: {
    color: colors.textMuted,
    flex: 1,
    fontSize: typography.sizes.bodySm,
    fontWeight: typography.weights.semibold,
  },
  railLabelSelected: {
    color: colors.primary,
  },
  mainColumn: {
    flex: 1,
    gap: spacing.md,
    minWidth: 0,
  },
  loadingRailCard: {
    gap: spacing.sm,
    padding: spacing.sm,
    width: 68,
  },
  loadingRailButton: {
    borderRadius: 16,
    height: 48,
    width: '100%',
  },
  loadingDeckCard: {
    overflow: 'hidden',
    padding: 0,
  },
  loadingHero: {
    width: '100%',
  },
  loadingCardContent: {
    gap: spacing.md,
  },
  skeletonLineShort: {
    height: 16,
    width: '35%',
  },
  skeletonTrack: {
    height: 8,
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
  skeletonTitle: {
    height: 36,
    width: '72%',
  },
  skeletonBodyLine: {
    height: 18,
    width: '100%',
  },
  skeletonBodyLineShort: {
    height: 18,
    width: '66%',
  },
  skeletonButton: {
    height: 52,
    width: '100%',
  },
  progressCard: {
    borderRadius: 22,
    gap: spacing.sm,
    padding: spacing.md,
  },
  progressHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    color: colors.textMuted,
    fontSize: typography.sizes.bodySm,
    fontWeight: typography.weights.semibold,
  },
  progressValue: {
    color: colors.text,
    fontSize: typography.sizes.bodySm,
    fontWeight: typography.weights.bold,
  },
  progressTrack: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 999,
    height: 8,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    height: '100%',
  },
  deckArea: {
    flexShrink: 1,
  },
  swipeCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 32,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.14,
    shadowRadius: 30,
    elevation: 8,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 15, 13, 0.22)',
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
  feedbackSave: {
    backgroundColor: colors.secondarySoft,
  },
  feedbackSkip: {
    backgroundColor: colors.primarySoft,
  },
  feedbackText: {
    color: colors.text,
    fontSize: typography.sizes.bodySm,
    fontWeight: typography.weights.heavy,
    letterSpacing: 1.2,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  topMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  placeTitle: {
    color: colors.white,
    fontSize: typography.sizes.titleLg,
    fontWeight: typography.weights.heavy,
    letterSpacing: -0.9,
    lineHeight: typography.lineHeights.hero,
    textShadowColor: 'rgba(0,0,0,0.14)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 14,
  },
  placeTitleCompact: {
    fontSize: typography.sizes.titleMd,
    lineHeight: typography.lineHeights.title,
  },
  placeTitleShortScreen: {
    fontSize: 28,
    lineHeight: 34,
  },
  placeReview: {
    color: 'rgba(255,255,255,0.94)',
    fontSize: typography.sizes.body,
    lineHeight: typography.lineHeights.body,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  hintRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hintText: {
    color: colors.textSoft,
    fontSize: typography.sizes.bodySm,
    fontWeight: typography.weights.semibold,
    letterSpacing: 0.2,
  },
  activeFilterText: {
    color: colors.textMuted,
    flex: 1,
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.semibold,
    paddingHorizontal: spacing.sm,
    textAlign: 'center',
  },
  emptyTitle: {
    color: colors.text,
    fontSize: typography.sizes.titleSm,
    fontWeight: typography.weights.heavy,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: typography.sizes.body,
    lineHeight: typography.lineHeights.body,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flexButton: {
    flex: 1,
  },
});
