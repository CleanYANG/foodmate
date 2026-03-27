import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  type ImageSourcePropType,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '../components/Button';
import { InlineNotice } from '../components/InlineNotice';
import { Screen } from '../components/Screen';
import { SkeletonBlock } from '../components/SkeletonBlock';
import { StateCard } from '../components/StateCard';
import { Tag } from '../components/Tag';
import { formatTagLabel } from '../lib/placeTags';
import type { RootStackParamList } from '../navigation/types';
import { fetchPlaceById } from '../services/placeService';
import { useMoments } from '../store/MomentsContext';
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

function getImageSource(imageUrl: Place['imageUrl']): ImageSourcePropType {
  return typeof imageUrl === 'string' ? { uri: imageUrl } : imageUrl;
}

function formatPrice(place: Place) {
  if (place.category === 'bar') {
    return '$$';
  }

  if (place.category === 'restaurant') {
    return '$$$';
  }

  return '$$';
}

function PlaceDetailInfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <View style={styles.infoCopy}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

export function PlaceDetailScreen({ route, navigation }: Props) {
  const { placeId } = route.params ?? {};
  const [place, setPlace] = useState<Place | null>(null);
  const [momentText, setMomentText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingMoment, setIsSavingMoment] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const { saveMoment } = useMoments();

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
    if (!feedbackMessage) {
      return;
    }

    const timeout = setTimeout(() => setFeedbackMessage(null), 2200);
    return () => clearTimeout(timeout);
  }, [feedbackMessage]);

  const trimmedMomentText = useMemo(() => momentText.trim(), [momentText]);

  if (isLoading) {
    return (
      <Screen padded={false}>
        <ScrollView contentContainerStyle={styles.content}>
          <SkeletonBlock style={styles.heroImage} />
          <View style={styles.body}>
            <SkeletonBlock style={styles.skeletonTitle} />
            <SkeletonBlock style={styles.skeletonBodyLine} />
            <View style={styles.tagsRow}>
              <SkeletonBlock style={styles.skeletonChip} />
              <SkeletonBlock style={styles.skeletonChipWide} />
            </View>
            <View style={styles.infoBlock}>
              <SkeletonBlock style={styles.skeletonInfoRow} />
              <SkeletonBlock style={styles.skeletonInfoRow} />
              <SkeletonBlock style={styles.skeletonInfoRow} />
            </View>
            <SkeletonBlock style={styles.skeletonInput} />
            <SkeletonBlock style={styles.skeletonButton} />
          </View>
        </ScrollView>
      </Screen>
    );
  }

  if (errorMessage || !place) {
    return (
      <Screen>
        <View style={styles.errorWrap}>
          <StateCard
            title="Place details are unavailable"
            description={errorMessage ?? 'This place is unavailable right now.'}
            actionLabel="Retry"
            onAction={() => navigation.replace('PlaceDetail', { placeId })}
          />
        </View>
      </Screen>
    );
  }

  const handleSaveMoment = async () => {
    if (!trimmedMomentText) {
      Alert.alert('Your Moment', 'Write a short memory before saving it.');
      return;
    }

    setIsSavingMoment(true);

    try {
      await saveMoment(place, trimmedMomentText);
      setMomentText('');
      setFeedbackMessage('Moment saved.');
    } catch (error) {
      setFeedbackMessage(toErrorMessage(error));
    } finally {
      setIsSavingMoment(false);
    }
  };

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <Image source={getImageSource(place.imageUrl)} style={styles.heroImage} />
        <View style={styles.heroImageOverlay} />

        <View style={styles.body}>
          <View style={styles.textBlock}>
            <Text style={styles.placeTitle}>{place.name}</Text>
            <Text style={styles.placeReview}>{place.shortReview}</Text>
          </View>

          {place.tags.length > 0 ? (
            <View style={styles.tagsRow}>
              {place.tags.slice(0, 3).map((tag) => (
                <Tag key={tag} label={formatTagLabel(tag)} />
              ))}
            </View>
          ) : null}

          <View style={styles.infoBlock}>
            <PlaceDetailInfoRow icon="📍" label="Location" value={place.address} />
            <PlaceDetailInfoRow icon="🕒" label="Hours" value="Hours coming soon" />
            <PlaceDetailInfoRow icon="💰" label="Price" value={formatPrice(place)} />
          </View>

          <View style={styles.momentBlock}>
            <Text style={styles.sectionTitle}>Your Moment</Text>
            <TextInput
              multiline
              onChangeText={setMomentText}
              placeholder="What did this place feel like?"
              placeholderTextColor={colors.textSoft}
              style={styles.momentInput}
              textAlignVertical="top"
              value={momentText}
            />
          </View>

          {feedbackMessage ? <InlineNotice message={feedbackMessage} tone="success" /> : null}

          <Button disabled={isSavingMoment} onPress={() => void handleSaveMoment()}>
            {isSavingMoment ? 'Saving...' : 'Save Moment'}
          </Button>
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
  heroImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 16, 13, 0.1)',
    bottom: undefined,
    height: 420,
  },
  body: {
    gap: spacing.lg,
    marginTop: -16,
    padding: spacing.md,
  },
  errorWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  textBlock: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 28,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  placeTitle: {
    color: colors.text,
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.titleLg,
    letterSpacing: -0.8,
    lineHeight: typography.lineHeights.hero,
  },
  placeReview: {
    color: colors.textMuted,
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.body,
    lineHeight: typography.lineHeights.body,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  infoBlock: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 28,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  infoIcon: {
    fontSize: 20,
    width: 24,
  },
  infoCopy: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    color: colors.textSoft,
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.caption,
  },
  infoValue: {
    color: colors.text,
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.bodySm,
    lineHeight: typography.lineHeights.compact,
  },
  momentBlock: {
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.titleSm,
    letterSpacing: -0.3,
  },
  momentInput: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    color: colors.text,
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.body,
    lineHeight: typography.lineHeights.body,
    minHeight: 148,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  skeletonChip: {
    height: 32,
    width: 86,
  },
  skeletonChipWide: {
    height: 32,
    width: 132,
  },
  skeletonTitle: {
    height: 34,
    width: '72%',
  },
  skeletonBodyLine: {
    height: 18,
    width: '100%',
  },
  skeletonInfoRow: {
    height: 42,
    width: '100%',
  },
  skeletonInput: {
    borderRadius: 24,
    height: 148,
    width: '100%',
  },
  skeletonButton: {
    height: 54,
    width: '100%',
  },
});
