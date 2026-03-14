import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Screen } from '../components/Screen';
import { mockPlaces } from '../data/mockPlaces';
import type { RootStackParamList } from '../navigation/types';
import { useSavedPlaces } from '../store/SavedPlacesContext';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'SavedPlaces'>;

export function SavedPlacesScreen({ navigation }: Props) {
  const { savedPlaceIds, isReady } = useSavedPlaces();
  const savedPlaces = mockPlaces.filter((place) => savedPlaceIds.includes(place.id));

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Saved</Text>
          <Text style={styles.title}>Your favorite places</Text>
          <Text style={styles.subtitle}>
            Right-swiped spots stay here so you can come back to them later.
          </Text>
        </View>

        {!isReady ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Loading saved places…</Text>
          </View>
        ) : null}

        {isReady && savedPlaces.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Nothing saved yet</Text>
            <Text style={styles.emptyText}>
              Head back to the deck and swipe right on places you want to keep.
            </Text>
          </View>
        ) : null}

        {isReady && savedPlaces.length > 0
          ? savedPlaces.map((place) => (
              <Pressable
                key={place.id}
                style={styles.placeCard}
                onPress={() => navigation.navigate('PlaceDetail', { placeId: place.id })}
              >
                <Image source={{ uri: place.imageUrl }} style={styles.placeImage} />
                <View style={styles.placeBody}>
                  <Text style={styles.placeTitle}>{place.name}</Text>
                  <Text style={styles.placeReview}>{place.shortReview}</Text>
                </View>
              </Pressable>
            ))
          : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
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
  emptyCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  placeCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  placeImage: {
    height: 220,
    width: '100%',
  },
  placeBody: {
    gap: spacing.sm,
    padding: spacing.md,
  },
  placeTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  placeReview: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
});
