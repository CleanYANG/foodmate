import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
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

type Props = NativeStackScreenProps<RootStackParamList, 'SavedPlaces'>;

export function SavedPlacesScreen({ navigation }: Props) {
  const { savedPlaceIds, removePlace } = useSavedPlaces();
  const savedPlaces = mockPlaces.filter((place) => savedPlaceIds.includes(place.id));

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerWrap}>
          <ScreenHeader
            eyebrow="Saved"
            title="Your collected places"
            description="A simple local list for now — just the places you saved during this app session."
          />
        </View>

        {savedPlaces.length === 0 ? (
          <Card>
            <Text style={styles.emptyTitle}>Nothing saved yet</Text>
            <Text style={styles.emptyText}>
              Swipe right on the Home screen to keep places here for later.
            </Text>
          </Card>
        ) : null}

        {savedPlaces.map((place) => (
          <Card key={place.id} style={styles.placeCard}>
            <Image source={{ uri: place.imageUrl }} style={styles.placeImage} />

            <View style={styles.placeBody}>
              <Tag label={place.category} tone="primary" />
              <Text style={styles.placeTitle}>{place.name}</Text>
              <Text style={styles.placeReview}>{place.shortReview}</Text>
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
                onPress={() => removePlace(place.id)}
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
    gap: spacing.md,
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  headerWrap: {
    paddingTop: spacing.sm,
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
  placeCard: {
    padding: spacing.md,
  },
  placeImage: {
    borderRadius: 18,
    height: 220,
    width: '100%',
  },
  placeBody: {
    gap: spacing.sm,
  },
  placeTitle: {
    color: colors.text,
    fontSize: typography.sizes.titleSm,
    fontWeight: typography.weights.bold,
    lineHeight: 28,
  },
  placeReview: {
    color: colors.textMuted,
    fontSize: typography.sizes.bodySm,
    lineHeight: 22,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flexButton: {
    flex: 1,
  },
});
