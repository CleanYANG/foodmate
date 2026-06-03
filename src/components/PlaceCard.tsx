import { ImageBackground, StyleSheet, Text, View } from 'react-native';

import { Button } from './Button';
import { Tag } from './Tag';
import { formatTagLabel } from '../lib/placeTags';
import { useAppViewport } from '../lib/useAppViewport';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { Place } from '../types/place';

type PlaceCardProps = {
  place: Place;
  onPressDetails: () => void;
};

function getImageSource(imageUrl: Place['imageUrl']) {
  return typeof imageUrl === 'string' ? { uri: imageUrl } : imageUrl;
}

export function PlaceCard({ place, onPressDetails }: PlaceCardProps) {
  const { width: windowWidth } = useAppViewport();
  const compact = windowWidth < 768;
  const spacious = windowWidth >= 1280;

  return (
    <View
      style={[
        styles.frame,
        compact ? styles.frameCompact : null,
        spacious ? styles.frameSpacious : null,
      ]}
    >
      <ImageBackground
        source={getImageSource(place.imageUrl)}
        style={styles.card}
        imageStyle={styles.image}
      >
        <View
          style={[
            styles.content,
            compact ? styles.contentCompact : null,
            spacious ? styles.contentSpacious : null,
          ]}
        >
          <View style={[styles.textBlock, compact ? styles.textBlockCompact : null]}>
            <Text
              numberOfLines={2}
              style={[
                styles.title,
                compact ? styles.titleCompact : null,
                spacious ? styles.titleSpacious : null,
              ]}
            >
              {place.name}
            </Text>
            <Text
              numberOfLines={compact ? 2 : 3}
              style={[
                styles.description,
                compact ? styles.descriptionCompact : null,
                spacious ? styles.descriptionSpacious : null,
              ]}
            >
              {place.shortReview}
            </Text>
          </View>

          {place.tags.length > 0 ? (
            <View style={[styles.tagsRow, compact ? styles.tagsRowCompact : null]}>
              {place.tags.slice(0, compact ? 2 : 3).map((tag) => (
                <Tag key={tag} label={formatTagLabel(tag)} />
              ))}
            </View>
          ) : null}

          <Button
            variant="secondary"
            onPress={onPressDetails}
            style={[
              styles.button,
              compact ? styles.buttonCompact : null,
              spacious ? styles.buttonSpacious : null,
            ]}
          >
            View
          </Button>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    aspectRatio: 4 / 5,
    borderRadius: 32,
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  frameCompact: {
    borderRadius: 28,
  },
  frameSpacious: {
    borderRadius: 36,
  },
  card: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.sm,
  },
  image: {
    borderRadius: 24,
    resizeMode: 'cover',
  },
  content: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    gap: spacing.md,
    marginTop: spacing.sm,
    padding: spacing.lg,
  },
  contentCompact: {
    gap: spacing.sm,
    padding: spacing.md,
  },
  contentSpacious: {
    gap: spacing.lg,
    padding: 28,
  },
  textBlock: {
    gap: spacing.sm,
  },
  textBlockCompact: {
    gap: spacing.xs,
  },
  title: {
    color: colors.text,
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.titleLg,
    letterSpacing: -0.8,
    lineHeight: typography.lineHeights.hero,
  },
  titleCompact: {
    fontSize: typography.sizes.titleSm,
    lineHeight: 30,
  },
  titleSpacious: {
    fontSize: 34,
    lineHeight: 38,
  },
  description: {
    color: colors.textMuted,
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.body,
    lineHeight: typography.lineHeights.body,
  },
  descriptionCompact: {
    fontSize: typography.sizes.bodySm,
    lineHeight: 21,
  },
  descriptionSpacious: {
    fontSize: typography.sizes.body,
    lineHeight: 25,
    maxWidth: '90%',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tagsRowCompact: {
    gap: spacing.xs,
  },
  button: {
    alignSelf: 'flex-start',
    minWidth: 132,
  },
  buttonCompact: {
    minWidth: 116,
  },
  buttonSpacious: {
    minWidth: 144,
  },
});
