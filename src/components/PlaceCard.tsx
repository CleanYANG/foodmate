import { ImageBackground, StyleSheet, Text, View } from 'react-native';

import { Button } from './Button';
import { Tag } from './Tag';
import { formatTagLabel } from '../lib/placeTags';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { Place } from '../types/place';

type PlaceCardProps = {
  place: Place;
  onPressDetails: () => void;
};

export function PlaceCard({ place, onPressDetails }: PlaceCardProps) {
  return (
    <ImageBackground source={{ uri: place.imageUrl }} style={styles.card} imageStyle={styles.image}>
      <View style={styles.overlay} />
      <View style={styles.content}>
        <View style={styles.textBlock}>
          <Text numberOfLines={2} style={styles.title}>
            {place.name}
          </Text>
          <Text numberOfLines={3} style={styles.description}>
            {place.shortReview}
          </Text>
        </View>

        {place.tags.length > 0 ? (
          <View style={styles.tagsRow}>
            {place.tags.slice(0, 3).map((tag) => (
              <Tag key={tag} label={formatTagLabel(tag)} />
            ))}
          </View>
        ) : null}

        <Button variant="secondary" onPress={onPressDetails} style={styles.button}>
          Details
        </Button>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 32,
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  image: {
    borderRadius: 32,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(16, 14, 13, 0.34)',
  },
  content: {
    gap: spacing.md,
    padding: spacing.xl,
  },
  textBlock: {
    gap: spacing.sm,
  },
  title: {
    color: colors.white,
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.titleLg,
    letterSpacing: -0.8,
    lineHeight: typography.lineHeights.hero,
  },
  description: {
    color: 'rgba(255,255,255,0.94)',
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.body,
    lineHeight: typography.lineHeights.body,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  button: {
    alignSelf: 'flex-start',
    minWidth: 132,
  },
});
