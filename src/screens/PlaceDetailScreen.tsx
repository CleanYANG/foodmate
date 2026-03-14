import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Screen } from '../components/Screen';
import { mockPlaces } from '../data/mockPlaces';
import type { RootStackParamList } from '../navigation/types';
import { useSavedPlaces } from '../store/SavedPlacesContext';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'PlaceDetail'>;

export function PlaceDetailScreen({ route }: Props) {
  const { placeId } = route.params ?? {};
  const { isSaved, savePlace, removePlace } = useSavedPlaces();
  const place = mockPlaces.find((item) => item.id === placeId) ?? mockPlaces[0];
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
          <View style={styles.titleRow}>
            <View style={styles.titleCopy}>
              <Text style={styles.eyebrow}>{place.category}</Text>
              <Text style={styles.title}>{place.name}</Text>
            </View>
            <Pressable
              style={[styles.saveButton, saved && styles.saveButtonActive]}
              onPress={() => void handleSaveToggle()}
            >
              <Text style={[styles.saveButtonText, saved && styles.saveButtonTextActive]}>
                {saved ? 'Saved' : 'Save'}
              </Text>
            </Pressable>
          </View>

          <Text style={styles.shortReview}>{place.shortReview}</Text>

          <View style={styles.tagRow}>
            {place.tags.map((tag) => (
              <View key={tag} style={styles.tagPill}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>About this place</Text>
            <Text style={styles.bodyText}>{place.fullDescription}</Text>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Address</Text>
            <Text style={styles.bodyText}>{place.address}</Text>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xl,
  },
  heroImage: {
    height: 420,
    width: '100%',
  },
  body: {
    gap: spacing.lg,
    padding: spacing.md,
  },
  titleRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  titleCopy: {
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
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 36,
  },
  saveButton: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  saveButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  saveButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  saveButtonTextActive: {
    color: '#FFFFFF',
  },
  shortReview: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tagPill: {
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tagText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  bodyText: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 24,
  },
});
