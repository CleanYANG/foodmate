import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  type ImageSourcePropType,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../components/Button';
import { InlineNotice } from '../components/InlineNotice';
import { SkeletonBlock } from '../components/SkeletonBlock';
import { StateCard } from '../components/StateCard';
import { TasteAvatar } from '../components/TasteAvatar';
import { useAppViewport } from '../lib/useAppViewport';
import type { RootStackParamList } from '../navigation/types';
import { acceptPlaceInvite, closePlaceInvite, requestPlaceInvite } from '../services/inviteService';
import { fetchPlaceById } from '../services/placeService';
import { useAuth } from '../store/AuthContext';
import { useLanguage } from '../store/LanguageContext';
import { useSavedPlaces } from '../store/SavedPlacesContext';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { Place } from '../types/place';

type Props = NativeStackScreenProps<RootStackParamList, 'PlaceDetail'>;

function toErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function getImageSource(imageUrl: Place['imageUrl']): ImageSourcePropType {
  return typeof imageUrl === 'string' ? { uri: imageUrl } : imageUrl;
}

function formatRecommendedBy(language: 'en' | 'zh', label: string, name: string) {
  return language === 'zh' ? `${name} ${label}` : `${label} ${name}`;
}

export function PlaceDetailScreen({ route, navigation }: Props) {
  const { language, t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const { width: windowWidth } = useAppViewport();
  const { placeId } = route.params ?? {};
  const [place, setPlace] = useState<Place | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { savePlace, removePlace, isSaved } = useSavedPlaces();

  useEffect(() => {
    const loadPlace = async () => {
      if (!placeId) {
        setErrorMessage(t('detail.missing_id'));
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const nextPlace = await fetchPlaceById(placeId);

        if (!nextPlace) {
          setErrorMessage(t('detail.not_found'));
          return;
        }

        setPlace(nextPlace);
      } catch (error) {
        setErrorMessage(toErrorMessage(error, t('common.error')));
      } finally {
        setIsLoading(false);
      }
    };

    void loadPlace();
  }, [placeId, t]);

  useEffect(() => {
    if (!feedbackMessage) {
      return;
    }

    const timeout = setTimeout(() => setFeedbackMessage(null), 2200);
    return () => clearTimeout(timeout);
  }, [feedbackMessage]);

  const saved = useMemo(() => (place ? isSaved(place.id) : false), [isSaved, place]);

  if (isLoading) {
    return (
      <SafeAreaView edges={['bottom']} style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content} style={styles.scrollView}>
          <View style={styles.heroShell}>
            <SkeletonBlock style={styles.heroImage} />
          </View>
          <View style={styles.body}>
            <SkeletonBlock style={styles.skeletonLineShort} />
            <SkeletonBlock style={styles.skeletonTitle} />
            <SkeletonBlock style={styles.skeletonBodyBlock} />
            <SkeletonBlock style={styles.skeletonButton} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (errorMessage || !place) {
    return (
      <SafeAreaView edges={['bottom']} style={styles.screen}>
        <View style={styles.errorWrap}>
          <StateCard
            title={t('detail.unavailable_title')}
            description={errorMessage ?? t('detail.unavailable_body')}
            actionLabel={t('common.retry')}
            onAction={() => navigation.replace('PlaceDetail', { placeId })}
          />
        </View>
      </SafeAreaView>
    );
  }

  const handleToggleSave = async () => {
    try {
      if (saved) {
        await removePlace(place.id);
        setFeedbackMessage(t('detail.save_removed'));
      } else {
        await savePlace(place.id);
        setFeedbackMessage(t('detail.save_added'));
      }
    } catch (error) {
      setFeedbackMessage(toErrorMessage(error, t('common.error')));
    }
  };

  const handleInviteAction = async () => {
    if (!place) {
      return;
    }

    if (!isAuthenticated || !user?.id) {
      navigation.navigate('SignIn');
      return;
    }

    try {
      if (place.postMode !== 'invite') {
        return;
      }

      const isCreator = place.inviteCreatorUserId === user.id;
      const isAcceptedRequester = place.inviteAcceptedRequesterUserId === user.id;

      if (place.inviteStatus === 'accepted' && (isCreator || isAcceptedRequester)) {
        navigation.navigate('Chat', {
          placeId: place.id,
          initialMessage: t('chat.prefill', { title: place.name }),
        });
        return;
      }

      if (isCreator && place.inviteStatus === 'requested') {
        await acceptPlaceInvite(place.id, user.id);
        setPlace(await fetchPlaceById(place.id));
        setFeedbackMessage(t('detail.invite_accepted'));
        return;
      }

      if (!isCreator && place.inviteStatus === 'idle') {
        await requestPlaceInvite(place.id, user.id);
        setPlace(await fetchPlaceById(place.id));
        setFeedbackMessage(t('detail.invite_requested'));
      }
    } catch (error) {
      setFeedbackMessage(toErrorMessage(error, t('common.error')));
    }
  };

  const handleCloseInvite = async () => {
    if (!place || !user?.id) {
      return;
    }

    try {
      await closePlaceInvite(place.id, user.id);
      setPlace(await fetchPlaceById(place.id));
      setFeedbackMessage(t('detail.invite_closed'));
    } catch (error) {
      setFeedbackMessage(toErrorMessage(error, t('common.error')));
    }
  };

  const recommendedByLine = formatRecommendedBy(
    language,
    t('detail.recommendedBy'),
    place.recommender.name,
  );
  const story = place.story || place.fullDescription || place.shortReview;
  const galleryImages = place.imageUrls.slice(0, 5);
  const heroWidth = Math.max(windowWidth - spacing.md * 2, 0);
  const currentUserId = user?.id ?? null;
  const isCreator = place.inviteCreatorUserId != null && place.inviteCreatorUserId === currentUserId;
  const isRequester =
    place.inviteRequesterUserId != null && place.inviteRequesterUserId === currentUserId;
  const isAcceptedRequester =
    place.inviteAcceptedRequesterUserId != null &&
    place.inviteAcceptedRequesterUserId === currentUserId;

  const primaryAction = (() => {
    if (place.postMode !== 'invite') {
      return null;
    }

    if (place.inviteStatus === 'accepted') {
      if (isCreator || isAcceptedRequester) {
        return {
          label: t('detail.chat_ready'),
          onPress: () => void handleInviteAction(),
          disabled: false,
        };
      }

      return {
        label: t('detail.inviting'),
        onPress: () => undefined,
        disabled: true,
      };
    }

    if (place.inviteStatus === 'requested') {
      if (isCreator) {
        return {
          label: t('detail.accept_invite'),
          onPress: () => void handleInviteAction(),
          disabled: false,
        };
      }

      if (isRequester) {
        return {
          label: t('detail.request_pending'),
          onPress: () => undefined,
          disabled: true,
        };
      }
    }

    return {
      label: t('detail.inviting'),
      onPress: () => void handleInviteAction(),
      disabled: false,
    };
  })();

  const secondaryInviteAction = (() => {
    if (place.postMode !== 'invite' || !isCreator) {
      return null;
    }

    return {
      label: t('detail.close_invite'),
      onPress: () => void handleCloseInvite(),
    };
  })();

  return (
    <SafeAreaView edges={['bottom']} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} style={styles.scrollView}>
        <View style={styles.heroShell}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const nextIndex = Math.round(event.nativeEvent.contentOffset.x / heroWidth);
              setActiveImageIndex(Math.min(Math.max(nextIndex, 0), galleryImages.length - 1));
            }}
          >
            {galleryImages.map((imageUrl, index) => (
              <Image
                key={`${place.id}-image-${index}`}
                source={getImageSource(imageUrl)}
                style={[styles.heroImage, { width: heroWidth }]}
              />
            ))}
          </ScrollView>
          {galleryImages.length > 1 ? (
            <View style={styles.pagination}>
              {galleryImages.map((_, index) => (
                <View
                  key={`${place.id}-dot-${index}`}
                  style={[
                    styles.paginationDot,
                    index === activeImageIndex ? styles.paginationDotActive : null,
                  ]}
                />
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.body}>
          <View style={styles.identityBlock}>
            <View style={styles.recommenderRow}>
              <TasteAvatar avatarId={place.recommender.avatar} size={28} />
              <Text style={styles.recommenderLine}>{recommendedByLine}</Text>
            </View>
            <Text style={styles.placeTitle}>{place.name}</Text>
            {place.postMode === 'invite' ? (
              <Text style={styles.inviteLabel}>{t('detail.inviting')}</Text>
            ) : null}
          </View>

          <Text style={styles.storyText}>{story}</Text>

          {place.tags.length > 0 || place.address || place.budget ? (
            <View style={styles.metaWrap}>
              {place.tags.slice(0, 3).map((tag) => (
                <View key={tag} style={styles.metaChip}>
                  <Text style={styles.metaChipText}>{tag}</Text>
                </View>
              ))}
              {place.address ? (
                <Text numberOfLines={1} style={styles.metaText}>
                  {place.address}
                </Text>
              ) : null}
              {place.budget ? <Text style={styles.metaText}>{place.budget}</Text> : null}
            </View>
          ) : null}

          {feedbackMessage ? <InlineNotice message={feedbackMessage} tone="success" /> : null}
        </View>
      </ScrollView>

      <View style={styles.stickyBar}>
        {primaryAction ? (
          <Button
            disabled={primaryAction.disabled}
            style={styles.stickyPrimary}
            onPress={primaryAction.onPress}
          >
            {primaryAction.label}
          </Button>
        ) : null}
        {secondaryInviteAction ? (
          <Button variant="secondary" style={styles.stickySecondary} onPress={secondaryInviteAction.onPress}>
            {secondaryInviteAction.label}
          </Button>
        ) : null}
        <Button
          variant="secondary"
          style={[
            styles.stickySave,
            !primaryAction && !secondaryInviteAction ? styles.stickySaveFull : null,
          ]}
          onPress={() => void handleToggleSave()}
        >
          {saved ? t('detail.saved') : t('detail.save')}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  scrollView: {
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 124,
  },
  heroShell: {
    borderRadius: 34,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    overflow: 'hidden',
    position: 'relative',
  },
  heroImage: {
    height: 430,
  },
  pagination: {
    alignItems: 'center',
    bottom: spacing.md,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  paginationDot: {
    backgroundColor: 'rgba(250, 244, 232, 0.45)',
    borderRadius: 999,
    height: 8,
    width: 8,
  },
  paginationDotActive: {
    backgroundColor: '#FAF4E8',
    width: 20,
  },
  errorWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  body: {
    gap: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  placeTitle: {
    color: colors.text,
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.titleLg,
    lineHeight: typography.lineHeights.hero,
  },
  identityBlock: {
    gap: 6,
  },
  recommenderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  recommenderLine: {
    color: colors.textSecondary,
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.bodySm,
  },
  inviteLabel: {
    color: colors.accent,
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.caption,
  },
  storyText: {
    color: colors.text,
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.body,
    lineHeight: 31,
  },
  metaWrap: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  metaChip: {
    backgroundColor: colors.tagBg,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  metaChipText: {
    color: colors.tagText,
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.caption,
  },
  metaText: {
    color: colors.textMuted,
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.caption,
  },
  skeletonLineShort: {
    height: 18,
    width: '36%',
  },
  skeletonTitle: {
    height: 32,
    width: '64%',
  },
  skeletonBodyBlock: {
    borderRadius: 28,
    height: 180,
    width: '100%',
  },
  skeletonButton: {
    height: 54,
    width: '100%',
  },
  stickyBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: 'row',
    gap: spacing.sm,
    left: 0,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    position: 'absolute',
    right: 0,
  },
  stickyPrimary: {
    flex: 1.35,
    minHeight: 48,
  },
  stickySave: {
    flex: 0.95,
    minHeight: 48,
  },
  stickySecondary: {
    flex: 1,
    minHeight: 48,
  },
  stickySaveFull: {
    flex: 1,
  },
});
