import { useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Screen } from '../components/Screen';
import { mockPlaces } from '../data/mockPlaces';
import type { RootStackParamList } from '../navigation/types';
import { useSavedPlaces } from '../store/SavedPlacesContext';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

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
    const shouldSave = direction === 'right' && currentPlace;

    if (shouldSave) {
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
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  const cardOpacity = pan.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: [0.9, 1, 0.9],
    extrapolate: 'clamp',
  });

  if (!hasMorePlaces) {
    return (
      <Screen>
        <View style={styles.container}>
          <View style={styles.topRow}>
            <View>
              <Text style={styles.eyebrow}>CityTalk</Text>
              <Text style={styles.title}>You made it through the full stack</Text>
              <Text style={styles.subtitle}>
                Saved your favorites? Jump into the list or start the deck over for another pass.
              </Text>
            </View>
          </View>

          <View style={styles.emptyStateCard}>
            <Text style={styles.emptyStateTitle}>All places reviewed</Text>
            <Text style={styles.emptyStateText}>
              You swiped through {mockPlaces.length} places. Restart the deck or open your saved
              list.
            </Text>

            <View style={styles.actionRow}>
              <Pressable style={styles.primaryButton} onPress={() => setCurrentIndex(0)}>
                <Text style={styles.primaryButtonText}>Restart deck</Text>
              </Pressable>
              <Pressable
                style={styles.secondaryButton}
                onPress={() => navigation.navigate('SavedPlaces')}
              >
                <Text style={styles.secondaryButtonText}>Saved places</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Screen>
    );
  }

  const nextPlace = mockPlaces[currentIndex + 1];

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.topRow}>
          <View style={styles.topCopy}>
            <Text style={styles.eyebrow}>CityTalk</Text>
            <Text style={styles.title}>Swipe through places worth talking about</Text>
            <Text style={styles.subtitle}>
              Left to skip. Right to save. Tap through when something feels like your kind of spot.
            </Text>
          </View>
          <Pressable
            style={styles.savedShortcut}
            onPress={() => navigation.navigate('SavedPlaces')}
          >
            <Text style={styles.savedShortcutLabel}>Saved</Text>
          </Pressable>
        </View>

        <View style={styles.progressCard}>
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
        </View>

        <View style={styles.deckArea}>
          {nextPlace ? (
            <View style={styles.backCard}>
              <Image source={{ uri: nextPlace.imageUrl }} style={styles.backCardImage} />
              <View style={styles.backCardOverlay} />
              <View style={styles.backCardFooter}>
                <Text style={styles.backCardTitle}>{nextPlace.name}</Text>
                <Text style={styles.backCardHint}>Up next</Text>
              </View>
            </View>
          ) : null}

          <Animated.View
            style={[
              styles.card,
              {
                transform: [...pan.getTranslateTransform(), { rotate }],
                opacity: cardOpacity,
              },
            ]}
            {...panResponder.panHandlers}
          >
            <Image source={{ uri: currentPlace.imageUrl }} style={styles.image} />
            <View style={styles.imageOverlay} />

            <View
              style={[
                styles.feedbackPill,
                feedback === 'save' ? styles.feedbackSave : styles.feedbackSkip,
                feedback ? styles.feedbackVisible : styles.feedbackHidden,
              ]}
            >
              <Text style={styles.feedbackText}>{feedback === 'save' ? 'SAVE' : 'SKIP'}</Text>
            </View>

            <View style={styles.cardBody}>
              <View style={styles.metaRow}>
                <View style={styles.categoryPill}>
                  <Text style={styles.categoryText}>{currentPlace.category}</Text>
                </View>
                {isSaved(currentPlace.id) ? (
                  <View style={styles.savedPill}>
                    <Text style={styles.savedPillText}>Saved</Text>
                  </View>
                ) : null}
              </View>

              <Text style={styles.placeTitle}>{currentPlace.name}</Text>
              <Text style={styles.placeReview}>{currentPlace.shortReview}</Text>

              <View style={styles.tagsWrap}>
                {currentPlace.tags.map((tag) => (
                  <View key={tag} style={styles.tagPill}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.actionRow}>
                <Pressable
                  style={styles.detailButton}
                  onPress={() =>
                    navigation.navigate('PlaceDetail', {
                      placeId: currentPlace.id,
                    })
                  }
                >
                  <Text style={styles.detailButtonText}>Open details</Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>
        </View>

        <View style={styles.swipeHintRow}>
          <Text style={styles.swipeHint}>← Skip</Text>
          <Text style={styles.swipeHint}>Save →</Text>
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
  topRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  topCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 34,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  savedShortcut: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  savedShortcutLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  progressCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
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
    fontSize: 14,
    fontWeight: '600',
  },
  progressValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  progressTrack: {
    backgroundColor: '#E6F4F1',
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
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minHeight: 540,
  },
  backCard: {
    backgroundColor: colors.surface,
    borderRadius: 30,
    bottom: 12,
    elevation: 4,
    height: '92%',
    left: 12,
    overflow: 'hidden',
    position: 'absolute',
    right: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
  },
  backCardImage: {
    height: '100%',
    width: '100%',
  },
  backCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 24, 39, 0.28)',
  },
  backCardFooter: {
    bottom: spacing.lg,
    left: spacing.lg,
    position: 'absolute',
    right: spacing.lg,
  },
  backCardTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  backCardHint: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 14,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 30,
    elevation: 10,
    height: '96%',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    width: '100%',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.26)',
  },
  feedbackPill: {
    borderRadius: 999,
    borderWidth: 2,
    left: spacing.lg,
    paddingHorizontal: 14,
    paddingVertical: 8,
    position: 'absolute',
    top: spacing.lg,
    transform: [{ rotate: '-10deg' }],
  },
  feedbackVisible: {
    opacity: 1,
  },
  feedbackHidden: {
    opacity: 0,
  },
  feedbackSave: {
    backgroundColor: 'rgba(15, 118, 110, 0.18)',
    borderColor: '#5EEAD4',
  },
  feedbackSkip: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderColor: '#FDA4AF',
  },
  feedbackText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 2,
  },
  cardBody: {
    bottom: 0,
    gap: spacing.md,
    left: 0,
    padding: spacing.lg,
    position: 'absolute',
    right: 0,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryPill: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderColor: 'rgba(255,255,255,0.24)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  savedPill: {
    backgroundColor: 'rgba(94, 234, 212, 0.14)',
    borderColor: 'rgba(94, 234, 212, 0.55)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  savedPillText: {
    color: '#D1FAE5',
    fontSize: 13,
    fontWeight: '700',
  },
  placeTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 36,
  },
  placeReview: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 15,
    lineHeight: 22,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tagPill: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  detailButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    minWidth: 140,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  detailButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  swipeHintRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: spacing.xs,
  },
  swipeHint: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyStateCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    gap: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.lg,
  },
  emptyStateTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  emptyStateText: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
});
