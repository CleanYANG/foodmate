import { useEffect, useMemo, useState } from 'react';
import { Image, type ImageSourcePropType, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { formatCategoryLabel } from '../config/discoveryRail';
import { Button } from '../components/Button';
import { InlineNotice } from '../components/InlineNotice';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import { SkeletonBlock } from '../components/SkeletonBlock';
import { StateCard } from '../components/StateCard';
import { Tag } from '../components/Tag';
import { formatTagLabel } from '../lib/placeTags';
import type { RootStackParamList } from '../navigation/types';
import { fetchPlaces } from '../services/placeService';
import { useAuth } from '../store/AuthContext';
import { useSavedPlaces } from '../store/SavedPlacesContext';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { Place } from '../types/place';

type Props = NativeStackScreenProps<RootStackParamList, 'SavedPlaces'>;

function getImageSource(imageUrl: Place['imageUrl']): ImageSourcePropType {
  return typeof imageUrl === 'string' ? { uri: imageUrl } : imageUrl;
}

function toErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong while loading places.';
}

export function SavedPlacesScreen({ navigation }: Props) {
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
      setPlacesError(toErrorMessage(error));
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

  if (!isAuthenticated) {
    return (
      <Screen>
        <View style={styles.content}>
          <ScreenHeader
            eyebrow="Saved"
            title="Sign in to keep your places"
            description="Guests can browse the full CityTalk deck, but saved places only unlock after a quick magic-link sign-in."
          />

          <Card>
            <Text style={styles.emptyTitle}>Guest browsing is on</Text>
            <Text style={styles.emptyText}>
              Once you sign in, anything you save will appear here automatically.
            </Text>
            <Button variant="primary" onPress={() => navigation.navigate('SignIn')}>
              Sign in with email
            </Button>
          </Card>
        </View>
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerWrap}>
          <ScreenHeader
            eyebrow="Saved"
            title="Your collected places"
            description="Saved places are synced through Supabase for your signed-in account."
          />
        </View>

        {saveFeedbackMessage ? <InlineNotice message={saveFeedbackMessage} tone="success" /> : null}
        {errorMessage ? <InlineNotice message={errorMessage} tone="error" /> : null}

        {placesError ? (
          <StateCard
            title="Could not load saved place details"
            description={placesError}
            actionLabel="Retry"
            onAction={() => void loadPlaces()}
          />
        ) : null}

        {isLoading || isLoadingPlaces ? (
          <Card>
            <Text style={styles.emptyTitle}>Loading saved places</Text>
            <Text style={styles.emptyText}>Syncing your saved list and place details.</Text>
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
            title="Nothing saved yet"
            description="Swipe right on the Home screen to keep places here for later."
            actionLabel="Browse places"
            onAction={() => navigation.navigate('Home')}
          />
        ) : null}

        {savedPlaces.map((place) => (
          <Card key={place.id} style={styles.placeCard}>
            <Image source={getImageSource(place.imageUrl)} style={styles.placeImage} />

            <View style={styles.placeBody}>
              <Tag label={formatCategoryLabel(place.category)} tone="primary" />
              <Text style={styles.placeTitle}>{place.name}</Text>
              <Text style={styles.placeReview}>{place.shortReview}</Text>
              {place.tags.length > 0 ? (
                <View style={styles.tagsRow}>
                  {place.tags.map((tag) => (
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
                Open details
              </Button>
              <Button
                variant="danger"
                style={styles.flexButton}
                onPress={() =>
                  void removePlace(place.id)
                    .then(() => {
                      setSaveFeedbackMessage(`${place.name} removed from saved places.`);
                      return refreshSavedPlaces();
                    })
                    .catch(() => {
                      // Prompting/error state is handled upstream.
                    })
                }
              >
                Remove
              </Button>
            </View>
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  headerWrap: {
    paddingTop: spacing.sm,
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
  placeCard: {
    padding: spacing.md,
    gap: spacing.md,
  },
  loadingImage: {
    borderRadius: 18,
    height: 220,
    width: '100%',
  },
  placeImage: {
    borderRadius: 22,
    height: 228,
    width: '100%',
  },
  placeBody: {
    gap: spacing.sm,
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
    fontSize: typography.sizes.titleSm,
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  placeReview: {
    color: colors.textMuted,
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.bodySm,
    lineHeight: typography.lineHeights.body,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flexButton: {
    flex: 1,
  },
});
