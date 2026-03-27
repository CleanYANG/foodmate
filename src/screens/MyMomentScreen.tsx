import { useMemo } from 'react';
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { SkeletonBlock } from '../components/SkeletonBlock';
import type { RootStackParamList } from '../navigation/types';
import { useMoments } from '../store/MomentsContext';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'MyMoment'>;

function formatMomentDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

function MomentCard({
  title,
  text,
  date,
  imageUrl,
  onPress,
}: {
  title: string;
  text: string;
  date: string;
  imageUrl: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.cardPressable, pressed && styles.pressed]}
    >
      <ImageBackground
        source={{ uri: imageUrl }}
        style={styles.momentCard}
        imageStyle={styles.momentImage}
      >
        <View style={styles.momentOverlay} />
        <View style={styles.momentCopy}>
          <Text numberOfLines={2} style={styles.momentTitle}>
            {title}
          </Text>
          <Text numberOfLines={1} style={styles.momentText}>
            {text}
          </Text>
          <Text style={styles.momentDate}>{date}</Text>
        </View>
      </ImageBackground>
    </Pressable>
  );
}

export function MyMomentScreen({ navigation }: Props) {
  const { moments, isLoading } = useMoments();

  const cards = useMemo(
    () =>
      moments.map((moment) => ({
        ...moment,
        imageUrl:
          moment.userImageUrl ??
          moment.placeImageUrl ??
          'https://placehold.co/800x1200?text=CityTalk+Moment',
      })),
    [moments],
  );

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>This Week in Sapporo</Text>
          <Text style={styles.summaryLine}>3 moments · 2 places</Text>
          <Text style={styles.summaryLine}>A quiet, café-heavy week</Text>
        </Card>

        {isLoading ? (
          <View style={styles.grid}>
            <SkeletonBlock style={styles.skeletonCard} />
            <SkeletonBlock style={styles.skeletonCard} />
            <SkeletonBlock style={styles.skeletonCard} />
            <SkeletonBlock style={styles.skeletonCard} />
          </View>
        ) : (
          <View style={styles.grid}>
            {cards.map((moment) => (
              <MomentCard
                key={moment.id}
                date={formatMomentDate(moment.createdAt)}
                imageUrl={moment.imageUrl}
                onPress={() => navigation.navigate('PlaceDetail', { placeId: moment.placeId })}
                text={moment.text}
                title={moment.placeName}
              />
            ))}
          </View>
        )}
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
  summaryCard: {
    gap: spacing.xs,
    padding: spacing.lg,
  },
  summaryTitle: {
    color: colors.text,
    fontSize: typography.sizes.titleMd,
    fontWeight: typography.weights.heavy,
    letterSpacing: -0.6,
  },
  summaryLine: {
    color: colors.textMuted,
    fontSize: typography.sizes.body,
    lineHeight: typography.lineHeights.body,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  cardPressable: {
    width: '47.5%',
  },
  pressed: {
    transform: [{ scale: 0.985 }],
  },
  momentCard: {
    borderRadius: 24,
    height: 244,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  momentImage: {
    borderRadius: 24,
  },
  momentOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(12, 11, 11, 0.18)',
  },
  momentCopy: {
    backgroundColor: 'rgba(12, 11, 11, 0.22)',
    gap: 2,
    padding: spacing.md,
  },
  momentTitle: {
    color: colors.white,
    fontSize: typography.sizes.bodySm,
    fontWeight: typography.weights.bold,
  },
  momentText: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: typography.sizes.caption,
  },
  momentDate: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: typography.sizes.caption,
  },
  skeletonCard: {
    borderRadius: 24,
    height: 244,
    width: '47.5%',
  },
});
