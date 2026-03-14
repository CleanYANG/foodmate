import { useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Image, PanResponder, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import { Tag } from '../components/Tag';
import { mockPlaces } from '../data/mockPlaces';
import type { RootStackParamList } from '../navigation/types';
import { useSavedPlaces } from '../store/SavedPlacesContext';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.22;
const SWIPE_OUT_DISTANCE = SCREEN_WIDTH * 1.2;

export function HomeScreen({ navigation }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState<'skip' | 'save' | null>(null);
  const { savePlace, isSaved } = useSavedPlaces();
  const pan = useRef(new Animated.ValueXY()).current;

  const currentPlace = mockPlaces[currentIndex];
  const hasMorePlaces = currentIndex < mockPlaces.length;
  const progress = currentIndex + 1;

  const resetCardPosition = () => {
    Animated.spring(pan, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
      friction: 7,
      tension: 80,
    }).start(() => setFeedback(null));
  };

  const advanceCard = (direction: 'left' | 'right') => {
    if (direction === 'right' && currentPlace) {
      savePlace(currentPlace.id);
    }

    Animated.timing(pan, {
      toValue: {
        x: direction === 'right' ? SWIPE_OUT_DISTANCE : -SWIPE_OUT_DISTANCE,
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
          if (gestureState.dx > SWIPE_THRESHOLD) {
            advanceCard('right');
            return;
          }

          if (gestureState.dx < -SWIPE_THRESHOLD) {
            advanceCard('left');
            return;
          }

          resetCardPosition();
        },
        onPanResponderTerminate: resetCardPosition,
      }),
    [pan, currentPlace, savePlace],
  );

  const rotate = pan.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ['-8deg', '0deg', '8deg'],
    extrapolate: 'clamp',
  });

  if (!hasMorePlaces) {
    return (
      <Screen>
        <View style={styles.container}>
          <ScreenHeader
            eyebrow="CityTalk"
            title="Deck complete"
            description="You made it through the full set. Restart the deck or jump into your saved places."
          />

          <Card>
            <Text style={styles.emptyTitle}>All places reviewed</Text>
            <Text style={styles.emptyText}>
              You swiped through {mockPlaces.length} places in this session.
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
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.headerCopy}>
            <ScreenHeader
              eyebrow="CityTalk"
              title="Discover places one card at a time"
              description="A minimal swipe deck with a travel-editorial feel: skip left, save right, open details when a place catches you."
            />
          </View>
          <Button variant="secondary" onPress={() => navigation.navigate('SavedPlaces')}>
            Saved
          </Button>
        </View>

        <Card style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Deck progress</Text>
            <Text style={styles.progressValue}>
              {Math.min(progress, mockPlaces.length)} / {mockPlaces.length}
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${(Math.min(progress, mockPlaces.length) / mockPlaces.length) * 100}%` },
              ]}
            />
          </View>
        </Card>

        <View style={styles.deckArea}>
          <Animated.View
            style={[
              styles.swipeCard,
              {
                transform: [...pan.getTranslateTransform(), { rotate }],
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

            <View style={styles.cardContent}>
              <View style={styles.topMetaRow}>
                <Tag label={currentPlace.category} tone="primary" />
                {isSaved(currentPlace.id) ? <Tag label="saved" /> : null}
              </View>

              <Text style={styles.placeTitle}>{currentPlace.name}</Text>
              <Text style={styles.placeReview}>{currentPlace.shortReview}</Text>

              <View style={styles.tagsRow}>
                {currentPlace.tags.map((tag) => (
                  <Tag key={tag} label={`#${tag}`} />
                ))}
              </View>

              <Button
                variant="secondary"
                onPress={() => navigation.navigate('PlaceDetail', { placeId: currentPlace.id })}
              >
                Open details
              </Button>
            </View>
          </Animated.View>
        </View>

        <View style={styles.hintRow}>
          <Text style={styles.hintText}>← Skip</Text>
          <Text style={styles.hintText}>Save →</Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.md,
  },
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  headerCopy: {
    flex: 1,
  },
  progressCard: {
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
    flex: 1,
    minHeight: 560,
  },
  swipeCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 28,
    borderWidth: 1,
    flex: 1,
    overflow: 'hidden',
    shadowColor: '#2C221B',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 28,
    elevation: 5,
  },
  heroImage: {
    height: '100%',
    position: 'absolute',
    width: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  feedbackPill: {
    borderRadius: 999,
    left: spacing.lg,
    paddingHorizontal: 14,
    paddingVertical: 8,
    position: 'absolute',
    top: spacing.lg,
    transform: [{ rotate: '-8deg' }],
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
    padding: spacing.lg,
    gap: spacing.md,
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
    letterSpacing: -0.8,
    lineHeight: typography.lineHeights.hero,
  },
  placeReview: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: typography.sizes.body,
    lineHeight: typography.lineHeights.body,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  hintRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hintText: {
    color: colors.textSoft,
    fontSize: typography.sizes.bodySm,
    fontWeight: typography.weights.semibold,
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
