import { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { InlineNotice } from '../components/InlineNotice';
import { BottomTabBar } from '../components/BottomTabBar';
import { Screen } from '../components/Screen';
import { TasteAvatar, tasteAvatarOptions, type TasteAvatarId } from '../components/TasteAvatar';
import { DEFAULT_PLACE_COVER_IMAGE, normalizePlaceCoverImage } from '../lib/placeCoverImage';
import type { RootStackParamList } from '../navigation/types';
import { createPlace } from '../services/placeService';
import { useAuth } from '../store/AuthContext';
import { useLanguage } from '../store/LanguageContext';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { Place, PlaceCategory } from '../types/place';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

type PlaceFormState = {
  postMode: Place['postMode'];
  name: string;
  shortReview: string;
  fullDescription: string;
  address: string;
  city: string;
  country: string;
  imageUrl: string;
  coverScale: number;
  coverOffsetX: number;
  coverOffsetY: number;
  tagsText: string;
  category: PlaceCategory;
  recommenderAvatar: TasteAvatarId;
};

const initialFormState: PlaceFormState = {
  postMode: 'share',
  name: '',
  shortReview: '',
  fullDescription: '',
  address: '',
  city: '',
  country: '',
  imageUrl: '',
  coverScale: DEFAULT_PLACE_COVER_IMAGE.scale,
  coverOffsetX: DEFAULT_PLACE_COVER_IMAGE.offsetX,
  coverOffsetY: DEFAULT_PLACE_COVER_IMAGE.offsetY,
  tagsText: '',
  category: 'cafe',
  recommenderAvatar: 'cat:coffee',
};

function toErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function parseTags(value: string) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function ProfileScreen({ navigation }: Props) {
  const { t } = useLanguage();
  const { isAuthenticated, isInitializing, authError } = useAuth();
  const [formState, setFormState] = useState<PlaceFormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [createdPlaceId, setCreatedPlaceId] = useState<string | null>(null);
  const [isCoverReady, setIsCoverReady] = useState(false);

  const categoryOptions = useMemo(
    () =>
      [
        { value: 'cafe', label: t('profile.share_category_cafe') },
        { value: 'restaurant', label: t('profile.share_category_restaurant') },
        { value: 'bar', label: t('profile.share_category_bar') },
        { value: 'on_mars', label: t('profile.share_category_on_mars') },
        { value: 'place', label: t('profile.share_category_place') },
      ] as const satisfies ReadonlyArray<{ value: PlaceCategory; label: string }>,
    [t],
  );

  const setField = (field: keyof PlaceFormState, value: string) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const imageUrl = formState.imageUrl.trim();
  const hasImagePreview = imageUrl.length > 0;
  const coverImage = normalizePlaceCoverImage({
    scale: formState.coverScale,
    offsetX: formState.coverOffsetX,
    offsetY: formState.coverOffsetY,
  });

  const setCoverField = (field: 'coverScale' | 'coverOffsetX' | 'coverOffsetY', value: number) => {
    setFormState((current) => ({ ...current, [field]: value }));
    setIsCoverReady(false);
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    setSubmitMessage(null);
    setCreatedPlaceId(null);

    if (!formState.name.trim()) {
      setSubmitError(t('profile.share_requires_name'));
      return;
    }

    if (!formState.shortReview.trim()) {
      setSubmitError(t('profile.share_requires_short_review'));
      return;
    }

    if (!formState.fullDescription.trim()) {
      setSubmitError(t('profile.share_requires_story'));
      return;
    }

    setIsSubmitting(true);

    try {
      const nextPlaceId = await createPlace({
        name: formState.name,
        shortReview: formState.shortReview,
        fullDescription: formState.fullDescription,
        address: formState.address,
        city: formState.city,
        country: formState.country,
        imageUrl: formState.imageUrl,
        coverImage: hasImagePreview ? coverImage : null,
        category: formState.category,
        tags: parseTags(formState.tagsText),
        postMode: formState.postMode,
        recommenderAvatar: formState.recommenderAvatar,
      });

      setFormState(initialFormState);
      setIsCoverReady(false);
      setCreatedPlaceId(nextPlaceId);
      setSubmitMessage(t('profile.share_success'));
    } catch (error) {
      setSubmitError(toErrorMessage(error, t('common.error')));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isInitializing) {
    return (
      <Screen padded={false}>
        <View style={styles.screen}>
          <View style={styles.container}>
            <View style={styles.decorBlobOne} pointerEvents="none" />
            <View style={styles.decorBlobTwo} pointerEvents="none" />
            <View style={styles.headerBlock}>
              <Text style={styles.brand}>fooMate</Text>
            </View>
          </View>

          <BottomTabBar currentTab="Profile" />
        </View>
      </Screen>
    );
  }

  if (!isAuthenticated) {
    return (
      <Screen padded={false}>
        <View style={styles.screen}>
          <View style={styles.container}>
            <View style={styles.decorBlobOne} pointerEvents="none" />
            <View style={styles.decorBlobTwo} pointerEvents="none" />

            <View style={styles.headerBlock}>
              <Text style={styles.brand}>fooMate</Text>
              <Text style={styles.title}>{t('publish.title')}</Text>
            </View>

            <Card style={styles.primaryCard}>
              {authError ? <InlineNotice message={authError} tone="error" /> : null}
              <Button variant="primary" onPress={() => navigation.navigate('SignIn')}>
                {t('profile.continue_email')}
              </Button>
            </Card>
          </View>

          <BottomTabBar currentTab="Profile" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          style={styles.scrollView}
        >
          <View style={styles.container}>
            <View style={styles.decorBlobOne} pointerEvents="none" />
            <View style={styles.decorBlobTwo} pointerEvents="none" />

            <View style={styles.headerBlock}>
              <Text style={styles.brand}>fooMate</Text>
              <Text style={styles.title}>{t('publish.title')}</Text>
              <Text style={styles.description}>{t('profile.share_body')}</Text>
            </View>

            <Card style={styles.primaryCard}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>{t('profile.post_mode')}</Text>
                <View style={styles.categoryWrap}>
                  {(['share', 'invite'] as const).map((mode) => {
                    const active = formState.postMode === mode;

                    return (
                      <TouchableOpacity
                        key={mode}
                        activeOpacity={0.9}
                        onPress={() => setFormState((current) => ({ ...current, postMode: mode }))}
                        style={[styles.categoryChip, active ? styles.categoryChipActive : null]}
                      >
                        <Text
                          style={[
                            styles.categoryChipText,
                            active ? styles.categoryChipTextActive : null,
                          ]}
                        >
                          {mode === 'invite' ? t('profile.post_mode_invite') : t('profile.post_mode_share')}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <Text style={styles.hint}>
                  {formState.postMode === 'invite'
                    ? t('profile.post_mode_invite_hint')
                    : t('profile.post_mode_share_hint')}
                </Text>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>{t('profile.avatar_label')}</Text>
                <View style={styles.avatarGrid}>
                  {tasteAvatarOptions.map((option) => {
                    const active = formState.recommenderAvatar === option.id;

                    return (
                      <TouchableOpacity
                        key={option.id}
                        activeOpacity={0.9}
                        onPress={() =>
                          setFormState((current) => ({
                            ...current,
                            recommenderAvatar: option.id,
                          }))
                        }
                        style={[styles.avatarOption, active ? styles.avatarOptionActive : null]}
                      >
                        <TasteAvatar avatarId={option.id} size={42} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>{t('profile.share_name')}</Text>
                <TextInput
                  onChangeText={(value) => setField('name', value)}
                  placeholder={t('profile.share_placeholder_name')}
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                  value={formState.name}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>{t('profile.share_short_review')}</Text>
                <TextInput
                  multiline
                  onChangeText={(value) => setField('shortReview', value)}
                  placeholder={t('profile.share_placeholder_short_review')}
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, styles.textAreaSmall]}
                  textAlignVertical="top"
                  value={formState.shortReview}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>{t('profile.share_story')}</Text>
                <TextInput
                  multiline
                  onChangeText={(value) => setField('fullDescription', value)}
                  placeholder={t('profile.share_placeholder_story')}
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, styles.textAreaLarge]}
                  textAlignVertical="top"
                  value={formState.fullDescription}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>{t('profile.share_category')}</Text>
                <View style={styles.categoryWrap}>
                  {categoryOptions.map((option) => {
                    const active = formState.category === option.value;

                    return (
                      <TouchableOpacity
                        key={option.value}
                        activeOpacity={0.9}
                        onPress={() =>
                          setFormState((current) => ({
                            ...current,
                            category: option.value,
                          }))
                        }
                        style={[styles.categoryChip, active ? styles.categoryChipActive : null]}
                      >
                        <Text
                          style={[
                            styles.categoryChipText,
                            active ? styles.categoryChipTextActive : null,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>{t('profile.share_address')}</Text>
                <TextInput
                  onChangeText={(value) => setField('address', value)}
                  placeholder={t('profile.share_placeholder_address')}
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                  value={formState.address}
                />
              </View>

              <View style={styles.twoColumnRow}>
                <View style={styles.column}>
                  <Text style={styles.label}>{t('profile.share_city')}</Text>
                  <TextInput
                    onChangeText={(value) => setField('city', value)}
                    placeholder={t('profile.share_placeholder_city')}
                    placeholderTextColor={colors.textMuted}
                    style={styles.input}
                    value={formState.city}
                  />
                </View>
                <View style={styles.column}>
                  <Text style={styles.label}>{t('profile.share_country')}</Text>
                  <TextInput
                    onChangeText={(value) => setField('country', value)}
                    placeholder={t('profile.share_placeholder_country')}
                    placeholderTextColor={colors.textMuted}
                    style={styles.input}
                    value={formState.country}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>{t('profile.share_image_url')}</Text>
                <TextInput
                  autoCapitalize="none"
                  keyboardType="url"
                  onChangeText={(value) => {
                    setField('imageUrl', value);
                    setIsCoverReady(false);
                  }}
                  placeholder={t('profile.share_placeholder_image_url')}
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                  value={formState.imageUrl}
                />
              </View>

              {hasImagePreview ? (
                <View style={styles.formGroup}>
                  <Text style={styles.label}>{t('profile.cover_preview')}</Text>
                  <View style={styles.coverPreviewFrame}>
                    <Image
                      source={{ uri: imageUrl }}
                      resizeMode="cover"
                      style={[
                        styles.coverPreviewImage,
                        {
                          transform: [
                            { translateX: coverImage.offsetX },
                            { translateY: coverImage.offsetY },
                            { scale: coverImage.scale },
                          ],
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.coverControlsRow}>
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => setCoverField('coverScale', coverImage.scale - 0.06)}
                      style={styles.coverControlChip}
                    >
                      <Text style={styles.coverControlText}>{t('profile.cover_zoom_out')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => setCoverField('coverScale', coverImage.scale + 0.06)}
                      style={styles.coverControlChip}
                    >
                      <Text style={styles.coverControlText}>{t('profile.cover_zoom_in')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => setCoverField('coverOffsetY', coverImage.offsetY - 12)}
                      style={styles.coverControlChip}
                    >
                      <Text style={styles.coverControlText}>{t('profile.cover_up')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => setCoverField('coverOffsetY', coverImage.offsetY + 12)}
                      style={styles.coverControlChip}
                    >
                      <Text style={styles.coverControlText}>{t('profile.cover_down')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => setCoverField('coverOffsetX', coverImage.offsetX - 10)}
                      style={styles.coverControlChip}
                    >
                      <Text style={styles.coverControlText}>{t('profile.cover_left')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => setCoverField('coverOffsetX', coverImage.offsetX + 10)}
                      style={styles.coverControlChip}
                    >
                      <Text style={styles.coverControlText}>{t('profile.cover_right')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => {
                        setFormState((current) => ({
                          ...current,
                          coverScale: DEFAULT_PLACE_COVER_IMAGE.scale,
                          coverOffsetX: DEFAULT_PLACE_COVER_IMAGE.offsetX,
                          coverOffsetY: DEFAULT_PLACE_COVER_IMAGE.offsetY,
                        }));
                        setIsCoverReady(false);
                      }}
                      style={styles.coverControlChip}
                    >
                      <Text style={styles.coverControlText}>{t('profile.cover_reset')}</Text>
                    </TouchableOpacity>
                  </View>
                  <Button variant={isCoverReady ? 'secondary' : 'primary'} onPress={() => setIsCoverReady(true)}>
                    {isCoverReady ? t('profile.cover_ready') : t('profile.cover_confirm')}
                  </Button>
                </View>
              ) : null}

              <View style={styles.formGroup}>
                <Text style={styles.label}>{t('profile.share_tags')}</Text>
                <TextInput
                  onChangeText={(value) => setField('tagsText', value)}
                  placeholder={t('profile.share_placeholder_tags')}
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                  value={formState.tagsText}
                />
                <Text style={styles.hint}>{t('profile.share_tags_hint')}</Text>
              </View>

              {submitError ? <InlineNotice message={submitError} tone="error" /> : null}
              {submitMessage ? <InlineNotice message={submitMessage} tone="success" /> : null}

              <Button
                disabled={isSubmitting || (hasImagePreview && !isCoverReady)}
                variant="primary"
                onPress={() => void handleSubmit()}
              >
                {isSubmitting ? t('profile.share_submitting') : t('profile.share_submit')}
              </Button>

              {createdPlaceId ? (
                <Button
                  variant="secondary"
                  onPress={() => navigation.navigate('PlaceDetail', { placeId: createdPlaceId })}
                >
                  {t('profile.share_open')}
                </Button>
              ) : null}
            </Card>
          </View>
        </ScrollView>

        <BottomTabBar currentTab="Profile" />
      </View>
    </Screen>
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
  scrollContent: {
    paddingBottom: spacing.xxl + spacing.md,
  },
  container: {
    backgroundColor: colors.background,
    flexGrow: 1,
    gap: spacing.xl,
    padding: spacing.lg,
  },
  decorBlobOne: {
    backgroundColor: 'transparent',
    borderRadius: 140,
    height: 120,
    left: -40,
    position: 'absolute',
    top: 100,
    width: 120,
  },
  decorBlobTwo: {
    backgroundColor: 'transparent',
    borderRadius: 130,
    height: 120,
    position: 'absolute',
    right: -36,
    top: 260,
    width: 120,
  },
  headerBlock: {
    paddingTop: spacing.sm,
  },
  brand: {
    color: colors.text,
    fontFamily: typography.fonts.semibold,
    fontSize: 18,
    letterSpacing: -0.3,
  },
  title: {
    color: colors.text,
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.titleLg,
    letterSpacing: -0.5,
    lineHeight: 32,
    marginTop: spacing.sm,
    maxWidth: 300,
  },
  description: {
    color: colors.textMuted,
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.bodySm,
    lineHeight: 22,
    marginTop: spacing.xs,
    maxWidth: 320,
  },
  primaryCard: {
    backgroundColor: colors.white,
  },
  formGroup: {
    gap: spacing.xs,
  },
  label: {
    color: colors.text,
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.bodySm,
  },
  input: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 0,
    color: colors.text,
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.body,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  coverPreviewFrame: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    height: 300,
    overflow: 'hidden',
    width: '100%',
  },
  coverPreviewImage: {
    height: '100%',
    width: '100%',
  },
  coverControlsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  coverControlChip: {
    backgroundColor: colors.tagBg,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  coverControlText: {
    color: colors.text,
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.caption,
  },
  textAreaSmall: {
    minHeight: 88,
  },
  textAreaLarge: {
    minHeight: 140,
  },
  categoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryChip: {
    backgroundColor: colors.tagBg,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    color: colors.text,
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.bodySm,
  },
  categoryChipTextActive: {
    color: colors.primaryText,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  avatarOption: {
    alignItems: 'center',
    backgroundColor: colors.tagBg,
    borderColor: 'transparent',
    borderRadius: 18,
    borderWidth: 1.5,
    height: 62,
    justifyContent: 'center',
    width: 62,
  },
  avatarOptionActive: {
    backgroundColor: '#FFF8F1',
    borderColor: colors.text,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  column: {
    flex: 1,
    gap: spacing.xs,
  },
  hint: {
    color: colors.textMuted,
    fontFamily: typography.fonts.regular,
    fontSize: 12,
    lineHeight: 18,
  },
});
