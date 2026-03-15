import { useEffect, useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import { Tag } from '../components/Tag';
import type { RootStackParamList } from '../navigation/types';
import { addPlaceReview, fetchPlaceById, fetchPlaceReviews } from '../services/placeService';
import { useAuth } from '../store/AuthContext';
import { useSavedPlaces } from '../store/SavedPlacesContext';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { Place } from '../types/place';
import type { PlaceReview } from '../types/review';

type Props = NativeStackScreenProps<RootStackParamList, 'PlaceDetail'>;

function toErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong while loading this place.';
}

function formatReviewDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

export function PlaceDetailScreen({ route, navigation }: Props) {
  const { placeId } = route.params ?? {};
  const { isAuthenticated } = useAuth();
  const [place, setPlace] = useState<Place | null>(null);
  const [reviews, setReviews] = useState<PlaceReview[]>([]);
  const [reviewText, setReviewText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reviewErrorMessage, setReviewErrorMessage] = useState<string | null>(null);
  const { isSaved, savePlace, removePlace, promptSignIn } = useSavedPlaces();

  useEffect(() => {
    const loadPlace = async () => {
      if (!placeId) {
        setErrorMessage('Missing place id.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const nextPlace = await fetchPlaceById(placeId);

        if (!nextPlace) {
          setErrorMessage('This place could not be found.');
          return;
        }

        setPlace(nextPlace);
      } catch (error) {
        setErrorMessage(toErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };

    void loadPlace();
  }, [placeId]);

  useEffect(() => {
    const loadReviews = async () => {
      if (!placeId) {
        setIsLoadingReviews(false);
        return;
      }

      setIsLoadingReviews(true);
      setReviewErrorMessage(null);

      try {
        const nextReviews = await fetchPlaceReviews(placeId);
        setReviews(nextReviews);
      } catch (error) {
        setReviewErrorMessage(toErrorMessage(error));
      } finally {
        setIsLoadingReviews(false);
      }
    };

    void loadReviews();
  }, [placeId]);

  const trimmedReviewText = useMemo(() => reviewText.trim(), [reviewText]);

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.body}>
          <ScreenHeader
            eyebrow="CityTalk"
            title="Loading place"
            description="Fetching the latest place details from Supabase."
          />
        </View>
      </Screen>
    );
  }

  if (errorMessage || !place) {
    return (
      <Screen>
        <View style={styles.body}>
          <ScreenHeader
            eyebrow="CityTalk"
            title="Could not load place"
            description={errorMessage ?? 'This place is unavailable right now.'}
          />
        </View>
      </Screen>
    );
  }

  const saved = isSaved(place.id);

  const handleSaveToggle = async () => {
    try {
      if (saved) {
        await removePlace(place.id);
        return;
      }

      await savePlace(place.id);
    } catch {
      // Prompting/error state is handled upstream.
    }
  };

  const handleSubmitReview = async () => {
    if (!trimmedReviewText) {
      setReviewErrorMessage('Review text cannot be empty.');
      return;
    }

    if (!isAuthenticated) {
      promptSignIn();
      navigation.navigate('SignIn');
      return;
    }

    setIsSubmittingReview(true);
    setReviewErrorMessage(null);

    const optimisticReview: PlaceReview = {
      id: `optimistic-${Date.now()}`,
      placeId: place.id,
      body: trimmedReviewText,
      createdAt: new Date().toISOString(),
      reviewerName: 'You',
      userId: 'local-user',
    };

    setReviews((currentValue) => [optimisticReview, ...currentValue]);
    setReviewText('');

    try {
      const createdReview = await addPlaceReview(place.id, trimmedReviewText);
      setReviews((currentValue) =>
        currentValue.map((review) => (review.id === optimisticReview.id ? createdReview : review)),
      );
    } catch (error) {
      setReviews((currentValue) =>
        currentValue.filter((review) => review.id !== optimisticReview.id),
      );
      setReviewText(trimmedReviewText);
      setReviewErrorMessage(toErrorMessage(error));
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <Image source={{ uri: place.imageUrl }} style={styles.heroImage} />

        <View style={styles.body}>
          <ScreenHeader
            eyebrow={place.category}
            title={place.name}
            description={place.shortReview}
          />

          {place.tags.length > 0 ? (
            <View style={styles.tagsRow}>
              {place.tags.map((tag) => (
                <Tag key={tag} label={`#${tag}`} />
              ))}
            </View>
          ) : null}

          <Button variant={saved ? 'secondary' : 'primary'} onPress={() => void handleSaveToggle()}>
            {saved ? 'Remove from saved' : 'Save this place'}
          </Button>

          <Card>
            <Text style={styles.sectionTitle}>About this place</Text>
            <Text style={styles.bodyText}>{place.fullDescription}</Text>
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Address</Text>
            <Text style={styles.bodyText}>{place.address}</Text>
          </Card>

          <Card>
            <View style={styles.reviewHeaderRow}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              <Text style={styles.reviewCount}>{reviews.length}</Text>
            </View>

            <View style={styles.reviewComposer}>
              <TextInput
                editable={!isSubmittingReview}
                multiline
                onChangeText={setReviewText}
                placeholder={
                  isAuthenticated
                    ? 'Share a quick thought about this place'
                    : 'Sign in to leave a short review'
                }
                placeholderTextColor={colors.textSoft}
                style={styles.reviewInput}
                textAlignVertical="top"
                value={reviewText}
              />

              {reviewErrorMessage ? (
                <Text style={styles.errorText}>{reviewErrorMessage}</Text>
              ) : null}

              <Button
                variant={isAuthenticated ? 'primary' : 'secondary'}
                onPress={() => void handleSubmitReview()}
              >
                {isSubmittingReview
                  ? 'Posting...'
                  : isAuthenticated
                    ? 'Post review'
                    : 'Sign in to review'}
              </Button>
            </View>

            {isLoadingReviews ? <Text style={styles.bodyText}>Loading reviews…</Text> : null}

            {!isLoadingReviews && reviews.length === 0 ? (
              <Text style={styles.bodyText}>
                No reviews yet. Be the first to leave a quick note.
              </Text>
            ) : null}

            {reviews.map((review) => (
              <View key={review.id} style={styles.reviewItem}>
                <View style={styles.reviewMetaRow}>
                  <Text style={styles.reviewAuthor}>{review.reviewerName}</Text>
                  <Text style={styles.reviewDate}>{formatReviewDate(review.createdAt)}</Text>
                </View>
                <Text style={styles.reviewBody}>{review.body}</Text>
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxl,
  },
  heroImage: {
    height: 420,
    width: '100%',
  },
  body: {
    gap: spacing.md,
    padding: spacing.md,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.sizes.titleSm,
    fontWeight: typography.weights.bold,
  },
  bodyText: {
    color: colors.textMuted,
    fontSize: typography.sizes.body,
    lineHeight: typography.lineHeights.body,
  },
  reviewHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reviewCount: {
    color: colors.textSoft,
    fontSize: typography.sizes.bodySm,
    fontWeight: typography.weights.semibold,
  },
  reviewComposer: {
    gap: spacing.sm,
  },
  reviewInput: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    color: colors.text,
    fontSize: typography.sizes.bodySm,
    lineHeight: typography.lineHeights.body,
    minHeight: 96,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  reviewItem: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    gap: spacing.xs,
    paddingTop: spacing.md,
  },
  reviewMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reviewAuthor: {
    color: colors.text,
    fontSize: typography.sizes.bodySm,
    fontWeight: typography.weights.bold,
  },
  reviewDate: {
    color: colors.textSoft,
    fontSize: typography.sizes.caption,
  },
  reviewBody: {
    color: colors.textMuted,
    fontSize: typography.sizes.bodySm,
    lineHeight: typography.lineHeights.body,
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.sizes.bodySm,
    lineHeight: typography.lineHeights.body,
  },
});
