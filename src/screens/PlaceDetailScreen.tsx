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

type Props = NativeStackScreenProps<RootStackParamList, 'PlaceDetail'>;

export function PlaceDetailScreen({ route }: Props) {
  const { placeId } = route.params ?? {};
  const { isSaved, savePlace, removePlace } = useSavedPlaces();
  const place = mockPlaces.find((item) => item.id === placeId) ?? mockPlaces[0];
  const saved = isSaved(place.id);

  const handleSaveToggle = () => {
    if (saved) {
      removePlace(place.id);
      return;
    }

    savePlace(place.id);
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

          <View style={styles.tagsRow}>
            {place.tags.map((tag) => (
              <Tag key={tag} label={`#${tag}`} />
            ))}
          </View>

          <Button variant={saved ? 'secondary' : 'primary'} onPress={handleSaveToggle}>
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
