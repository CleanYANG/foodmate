import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import { Tag } from '../components/Tag';
import type { RootStackParamList } from '../navigation/types';
import { fetchPlaceById } from '../services/placeService';
import { useSavedPlaces } from '../store/SavedPlacesContext';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { Place } from '../types/place';

type Props = NativeStackScreenProps<RootStackParamList, 'PlaceDetail'>;

function toErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong while loading this place.';
}

export function PlaceDetailScreen({ route }: Props) {
  const { placeId } = route.params ?? {};
  const [place, setPlace] = useState<Place | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { isSaved, savePlace, removePlace } = useSavedPlaces();

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
    if (saved) {
      await removePlace(place.id);
      return;
    }

    await savePlace(place.id);
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
});
