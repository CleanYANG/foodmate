import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthRequiredError, requireAuthenticatedUserId } from './authService';
import {
  deriveInviteStatus,
  getInviteMetaMap,
  getPlaceInviteMeta,
  registerPlaceInviteMeta,
} from './inviteService';
import { mockPlaces } from '../data/mockPlaces';
import { curatedPlaces } from '../data/curatedPlaces';
import { env } from '../config/env';
import { normalizePlaceCoverImage } from '../lib/placeCoverImage';
import { derivePlaceTags, sortTags } from '../lib/placeTags';
import { supabase } from '../lib/supabase';
import type { Place, PlaceCategory, PlaceCoverImage, SavedPlace } from '../types/place';
import type { PlaceReview } from '../types/review';

import cafe1 from '../../assets/cafe/札幌 -allee cafe.jpg';
import cafe2 from '../../assets/cafe/札幌-Shizukuya.jpg';
import cafe3 from '../../assets/cafe/札幌-aile cafe.jpg';
import cafe4 from '../../assets/cafe/札幌-cafe-Noymond.jpg';
import cafe5 from '../../assets/cafe/札幌-patisserie Cafe feve-1.jpg';
import cafe6 from '../../assets/cafe/札幌-patisserie Cafe feve-2.jpg';
import restaurant1 from '../../assets/cafe/札幌-patisserie Cafe feve-3.jpeg';
import restaurant2 from '../../assets/cafe/札幌-trattoria KUJIRA sapporo-1.jpg';
import restaurant4 from '../../assets/cafe/札幌-trattoria KUJIRA sapporo-2.jpg';
import restaurant5 from '../../assets/cafe/札幌-一粒の麦.jpg';
import restaurant3 from '../../assets/cafe/札幌-aile cafe.jpg';

type PlaceRow = {
  id: string;
  name: string;
  short_review: string | null;
  full_description: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  image_url: string | null;
  city: string | null;
  country: string | null;
  category?: string | null;
};

function normalizeImageGallery(
  images: Array<Place['imageUrl'] | null | undefined>,
  fallbackImage: Place['imageUrl'],
) {
  const gallery = images.filter((image): image is Place['imageUrl'] => image != null).slice(0, 5);

  if (gallery.length === 0) {
    return [fallbackImage];
  }

  return gallery;
}

const defaultRecommenders: Place['recommender'][] = [
  {
    name: 'Yuki',
    avatar: null,
    shortBio: 'Likes quiet cafes and slow winter walks.',
    intent: 'Looking for calm places with good coffee.',
    quote: 'The window seats feel especially nice here.',
  },
  {
    name: 'Mina',
    avatar: null,
    shortBio: 'Prefers small spots, warm food, and easy conversation.',
    intent: 'Looking for places that feel warm and relaxed.',
    quote: 'The atmosphere here feels easy from the start.',
  },
  {
    name: 'Ren',
    avatar: null,
    shortBio: 'Will take a detour for late food and a good drink.',
    intent: 'Looking for relaxed spots after work.',
    quote: 'A good place when you want something simple and good.',
  },
];

function getDefaultRecommender(seed: string) {
  const sum = seed.split('').reduce((total, char) => total + char.charCodeAt(0), 0);
  return defaultRecommenders[sum % defaultRecommenders.length];
}

function buildStory(place: Pick<Place, 'name' | 'shortReview' | 'fullDescription' | 'recommender'>) {
  return place.fullDescription || place.shortReview;
}

function buildBudget(category: PlaceCategory) {
  if (category === 'bar') {
    return '¥1500-3000';
  }

  if (category === 'restaurant') {
    return '¥1000-2500';
  }

  if (category === 'on_mars') {
    return '¥500-1200';
  }

  return '¥800-1500';
}

function buildBestFor(category: PlaceCategory) {
  if (category === 'bar') {
    return ['第一次见面', '下班小酌', '慢慢聊天'];
  }

  if (category === 'restaurant') {
    return ['认真吃饭', '分享食物', '周末约饭'];
  }

  if (category === 'on_mars') {
    return ['边走边吃', '轻松见面', '顺路加一站'];
  }

  return ['安静聊天', '慢一点坐着', '一个人也舒服'];
}

type SavedPlaceRow = {
  place_id: string;
  created_at: string;
};

type CreatePlaceInput = {
  name: string;
  shortReview: string;
  fullDescription: string;
  address: string;
  city: string;
  country: string;
  imageUrl: string;
  coverImage: PlaceCoverImage | null;
  category: PlaceCategory;
  tags: string[];
  postMode: Place['postMode'];
  recommenderAvatar: string | null;
};

type ReviewRow = {
  id: string;
  place_id: string;
  body: string;
  created_at: string;
  user_id: string;
  users:
    | {
        display_name: string | null;
        username: string | null;
      }
    | {
        display_name: string | null;
        username: string | null;
      }[]
    | null;
};

const LOCAL_SAVED_PLACE_KEY_PREFIX = 'citytalk.saved.curated';
const LOCAL_COVER_IMAGE_KEY = 'citytalk.placeCoverImages';
const LOCAL_RECOMMENDER_META_KEY = 'citytalk.placeRecommenderMeta';

const coffeeOptionImages = [
  cafe1,
  cafe2,
  cafe3,
  cafe4,
  cafe5,
  cafe6,
  restaurant1,
  restaurant2,
  restaurant3,
  restaurant4,
  restaurant5,
] as const;

const directAssetImageByName: Partial<Record<string, Place['imageUrl']>> = {
  cafe_1: cafe1,
  cafe_2: cafe2,
  cafe_3: cafe3,
  cafe_4: cafe4,
  cafe_5: cafe5,
  cafe_6: cafe6,
  restaurant_1: restaurant1,
  restaurant_2: restaurant2,
  restaurant_3: restaurant3,
  restaurant_4: restaurant4,
  restaurant_5: restaurant5,
};

function normalizeAssetKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function normalizePlaceName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .normalize('NFKC');
}

function isCuratedPlaceId(placeId: string) {
  return placeId.startsWith('curated-');
}

function getLocalSavedPlaceKey(userId: string) {
  return `${LOCAL_SAVED_PLACE_KEY_PREFIX}.${userId}`;
}

async function readLocalSavedPlaceIds(userId: string) {
  const rawValue = await AsyncStorage.getItem(getLocalSavedPlaceKey(userId));

  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((value): value is string => typeof value === 'string');
  } catch {
    return [];
  }
}

async function writeLocalSavedPlaceIds(userId: string, placeIds: string[]) {
  await AsyncStorage.setItem(getLocalSavedPlaceKey(userId), JSON.stringify(placeIds));
}

async function readLocalCoverImageMap() {
  const rawValue = await AsyncStorage.getItem(LOCAL_COVER_IMAGE_KEY);

  if (!rawValue) {
    return {} as Record<string, PlaceCoverImage>;
  }

  try {
    const parsed = JSON.parse(rawValue);

    if (parsed == null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {} as Record<string, PlaceCoverImage>;
    }

    return Object.fromEntries(
      Object.entries(parsed).flatMap(([placeId, config]) =>
        config && typeof config === 'object' && !Array.isArray(config)
          ? [[placeId, normalizePlaceCoverImage(config as Partial<PlaceCoverImage>)]]
          : [],
      ),
    );
  } catch {
    return {} as Record<string, PlaceCoverImage>;
  }
}

async function writeLocalCoverImageMap(value: Record<string, PlaceCoverImage>) {
  await AsyncStorage.setItem(LOCAL_COVER_IMAGE_KEY, JSON.stringify(value));
}

async function readLocalRecommenderMetaMap() {
  const rawValue = await AsyncStorage.getItem(LOCAL_RECOMMENDER_META_KEY);

  if (!rawValue) {
    return {} as Record<string, { avatar: string | null }>;
  }

  try {
    const parsed = JSON.parse(rawValue);

    if (parsed == null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {} as Record<string, { avatar: string | null }>;
    }

    return Object.fromEntries(
      Object.entries(parsed).map(([placeId, value]) => [
        placeId,
        {
          avatar:
            value && typeof value === 'object' && !Array.isArray(value) && typeof (value as { avatar?: unknown }).avatar === 'string'
              ? (value as { avatar: string }).avatar
              : null,
        },
      ]),
    );
  } catch {
    return {} as Record<string, { avatar: string | null }>;
  }
}

async function writeLocalRecommenderMetaMap(value: Record<string, { avatar: string | null }>) {
  await AsyncStorage.setItem(LOCAL_RECOMMENDER_META_KEY, JSON.stringify(value));
}

async function saveLocalCoverImage(placeId: string, coverImage: PlaceCoverImage | null) {
  if (!coverImage) {
    return;
  }

  const currentMap = await readLocalCoverImageMap();
  currentMap[placeId] = normalizePlaceCoverImage(coverImage);
  await writeLocalCoverImageMap(currentMap);
}

async function saveLocalRecommenderAvatar(placeId: string, avatar: string | null) {
  const currentMap = await readLocalRecommenderMetaMap();
  currentMap[placeId] = { avatar };
  await writeLocalRecommenderMetaMap(currentMap);
}

function getLocalImageForPlace(
  place: Pick<Place, 'name' | 'category'>,
  categoryIndex: number,
): Place['imageUrl'] | undefined {
  const directNameMatch = directAssetImageByName[normalizeAssetKey(place.name)];

  if (directNameMatch) {
    return directNameMatch;
  }

  if (place.category === 'cafe') {
    return coffeeOptionImages[categoryIndex % coffeeOptionImages.length];
  }

  return undefined;
}

const legacyMockPlaceNames = new Set(
  [
    'Snow Lantern Coffee',
    'North Alley Highball',
    'Sora Street Market Hall',
    'Miso Corner Shokudo',
    'Moondrop Terrace',
    'Maple Lane Bakehouse',
    'Clock Tower Garden Walk Cart',
    'River Snow Espresso',
    'Lantern Fox Izakaya',
    'Hokkaido Pantry Wagon',
    'Steam Pot Soup Curry',
    'Aurora Window Dining',
    'Birch Path Tea Room',
    'Hillview Sunset Truck',
    'Spruce & Stone Café',
    'Velvet Snow Cocktail Room',
    'Morning Crab Arcade Cart',
    'Charcoal Alley Jingisukan',
    'Secret Garden Coffee Stand',
    'Snowcap Park Espresso',
  ].map(normalizePlaceName),
);

function mapCuratedPlace(place: (typeof curatedPlaces)[number]): Place {
  const recommender = getDefaultRecommender(place.id);

  const mappedPlace: Place = {
    id: place.id,
    name: place.name,
    shortReview: place.shortReview,
    fullDescription: place.fullDescription,
    story: '',
    address: place.address,
    latitude: place.latitude,
    longitude: place.longitude,
    imageUrl: place.imageUrl,
    imageUrls: place.imageUrls,
    coverImage: place.coverImage ? normalizePlaceCoverImage(place.coverImage) : null,
    tags: sortTags(place.tags),
    category: place.category,
    city: place.city,
    country: place.country,
    recommender,
    budget: buildBudget(place.category),
    bestFor: buildBestFor(place.category),
    postMode: 'share',
    inviteStatus: 'idle',
    inviteCreatorUserId: null,
    inviteRequesterUserId: null,
    inviteAcceptedRequesterUserId: null,
  };

  mappedPlace.story = buildStory(mappedPlace);

  return mappedPlace;
}

const curatedPlacesById = curatedPlaces.reduce<Record<string, Place>>((accumulator, place) => {
  accumulator[place.id] = mapCuratedPlace(place);
  return accumulator;
}, {});

function inferCategory(place: Pick<Place, 'tags' | 'name'>): PlaceCategory {
  const normalized = [...place.tags, place.name].join(' ').toLowerCase();

  if (
    normalized.includes('vendor') ||
    normalized.includes('wagon') ||
    normalized.includes('truck') ||
    normalized.includes('cart') ||
    normalized.includes('pop-up') ||
    normalized.includes('popup') ||
    normalized.includes('mobile') ||
    normalized.includes('street food') ||
    normalized.includes('street vendor') ||
    normalized.includes('movable')
  ) {
    return 'on_mars';
  }

  if (
    normalized.includes('cafe') ||
    normalized.includes('coffee') ||
    normalized.includes('espresso') ||
    normalized.includes('tea room') ||
    normalized.includes('bakery')
  ) {
    return 'cafe';
  }

  if (
    normalized.includes('bar') ||
    normalized.includes('cocktail') ||
    normalized.includes('izakaya') ||
    normalized.includes('highball')
  ) {
    return 'bar';
  }

  if (
    normalized.includes('ramen') ||
    normalized.includes('restaurant') ||
    normalized.includes('dining') ||
    normalized.includes('soup curry') ||
    normalized.includes('jingisukan') ||
    normalized.includes('food') ||
    normalized.includes('shokudo')
  ) {
    return 'restaurant';
  }

  return 'place';
}

function mapPlaceRow(placeRow: PlaceRow, categoryIndex: number): Place {
  const recommender = getDefaultRecommender(placeRow.id);
  const fallbackImage = placeRow.image_url ?? 'https://placehold.co/800x1200?text=fooMate+Place';
  const place: Place = {
    id: placeRow.id,
    name: placeRow.name,
    shortReview: placeRow.short_review ?? 'A place worth checking out in the city.',
    fullDescription: placeRow.full_description ?? 'More details for this place are coming soon.',
    story: '',
    address: placeRow.address ?? 'Address unavailable',
    latitude: placeRow.latitude,
    longitude: placeRow.longitude,
    imageUrl: fallbackImage,
    imageUrls: [fallbackImage],
    coverImage: null,
    tags: [],
    category: 'place',
    city: placeRow.city,
    country: placeRow.country,
    recommender,
    budget: null,
    bestFor: [],
    postMode: 'share',
    inviteStatus: 'idle',
    inviteCreatorUserId: null,
    inviteRequesterUserId: null,
    inviteAcceptedRequesterUserId: null,
  };

  place.tags = sortTags(derivePlaceTags(place));
  place.category =
    placeRow.category === 'restaurant' ||
    placeRow.category === 'cafe' ||
    placeRow.category === 'bar' ||
    placeRow.category === 'on_mars'
      ? placeRow.category
      : inferCategory(place);

  place.imageUrl =
    getLocalImageForPlace(place, categoryIndex) ??
    fallbackImage;
  place.imageUrls = normalizeImageGallery([place.imageUrl, placeRow.image_url], place.imageUrl);
  place.budget = buildBudget(place.category);
  place.bestFor = buildBestFor(place.category);
  place.story = buildStory(place);

  return place;
}

function mapReviewRow(reviewRow: ReviewRow): PlaceReview {
  const reviewer = Array.isArray(reviewRow.users) ? reviewRow.users[0] : reviewRow.users;
  const reviewerName =
    reviewer?.display_name?.trim() || reviewer?.username?.trim() || 'Anonymous fooMate User';

  return {
    id: reviewRow.id,
    placeId: reviewRow.place_id,
    body: reviewRow.body,
    createdAt: reviewRow.created_at,
    reviewerName,
    userId: reviewRow.user_id,
  };
}

function mapMockPlace(place: (typeof mockPlaces)[number], categoryIndex: number): Place {
  const imageUrl = getLocalImageForPlace(place, categoryIndex) ?? place.imageUrl;
  const imageUrls = normalizeImageGallery([imageUrl, ...place.imageUrls], imageUrl);

  return {
    ...place,
    imageUrl,
    imageUrls,
    coverImage: null,
    tags: sortTags(place.tags),
    city: 'Sapporo',
    country: 'Japan',
    postMode: 'share',
    inviteStatus: 'idle',
    inviteCreatorUserId: null,
    inviteRequesterUserId: null,
    inviteAcceptedRequesterUserId: null,
  };
}

async function applyInviteMeta(place: Place): Promise<Place> {
  const meta = await getPlaceInviteMeta(place.id);

  return {
    ...place,
    postMode: meta.mode,
    inviteStatus: deriveInviteStatus(meta),
    inviteCreatorUserId: meta.creatorUserId,
    inviteRequesterUserId: meta.requesterUserId,
    inviteAcceptedRequesterUserId: meta.acceptedRequesterUserId,
  };
}

function applyLocalRecommenderAvatar(
  place: Place,
  avatarMap: Record<string, { avatar: string | null }>,
): Place {
  const avatar = avatarMap[place.id]?.avatar ?? null;

  if (!avatar) {
    return place;
  }

  return {
    ...place,
    recommender: {
      ...place.recommender,
      avatar,
    },
  };
}

async function applyInviteMetaToPlaces(places: Place[]): Promise<Place[]> {
  const metaMap = await getInviteMetaMap(places.map((place) => place.id));

  return places.map((place) => {
    const meta = metaMap[place.id];

    return {
      ...place,
      postMode: meta.mode,
      inviteStatus: deriveInviteStatus(meta),
      inviteCreatorUserId: meta.creatorUserId,
      inviteRequesterUserId: meta.requesterUserId,
      inviteAcceptedRequesterUserId: meta.acceptedRequesterUserId,
    };
  });
}

export async function fetchPlaces(): Promise<Place[]> {
  if (env.useMockData) {
    const categoryCounts: Partial<Record<PlaceCategory, number>> = {};

    const places = mockPlaces.map((place) => {
      const categoryIndex = categoryCounts[place.category] ?? 0;
      categoryCounts[place.category] = categoryIndex + 1;
      return mapMockPlace(place, categoryIndex);
    });

    return applyInviteMetaToPlaces(places);
  }

  const { data, error } = await supabase
    .from('places')
    .select(
      'id, name, short_review, full_description, address, latitude, longitude, image_url, city, country, category',
    )
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  const coverImageMap = await readLocalCoverImageMap();
  const recommenderMetaMap = await readLocalRecommenderMetaMap();
  const curatedPlaceList = curatedPlaces.map((place) => {
    const mappedPlace = mapCuratedPlace(place);
    return applyLocalRecommenderAvatar({
      ...mappedPlace,
      coverImage: coverImageMap[mappedPlace.id] ?? mappedPlace.coverImage,
    }, recommenderMetaMap);
  });
  const categoryCounts: Partial<Record<PlaceCategory, number>> = {};

  const remotePlaces = (data ?? [])
    .filter((placeRow) => !legacyMockPlaceNames.has(normalizePlaceName(placeRow.name)))
    .map((placeRow) => {
      let rawCategory: PlaceCategory | undefined;

      if (
        placeRow.category === 'restaurant' ||
        placeRow.category === 'cafe' ||
        placeRow.category === 'bar' ||
        placeRow.category === 'on_mars'
      ) {
        rawCategory = placeRow.category;
      }

      const categoryIndex = rawCategory ? (categoryCounts[rawCategory] ?? 0) : 0;

      if (rawCategory) {
        categoryCounts[rawCategory] = categoryIndex + 1;
      }

      return mapPlaceRow(placeRow, categoryIndex);
    });

  const seenNames = new Set(curatedPlaceList.map((place) => normalizePlaceName(place.name)));
  const dedupedRemotePlaces = remotePlaces.filter((place) => !seenNames.has(normalizePlaceName(place.name)));
  const places = [...curatedPlaceList, ...dedupedRemotePlaces].map((place) => ({
    ...applyLocalRecommenderAvatar(place, recommenderMetaMap),
    coverImage: coverImageMap[place.id] ?? place.coverImage ?? null,
  }));

  return applyInviteMetaToPlaces(places);
}

export async function fetchPlaceById(placeId: string): Promise<Place | null> {
  if (env.useMockData) {
    const place = mockPlaces.find((item) => item.id === placeId);

    if (!place) {
      return null;
    }

    const categoryIndex = mockPlaces
      .filter((item) => item.category === place.category)
      .findIndex((item) => item.id === place.id);

    return applyInviteMeta(mapMockPlace(place, Math.max(categoryIndex, 0)));
  }

  if (isCuratedPlaceId(placeId)) {
    const curatedPlace = curatedPlacesById[placeId];
    if (!curatedPlace) {
      return null;
    }

    const coverImageMap = await readLocalCoverImageMap();
    const recommenderMetaMap = await readLocalRecommenderMetaMap();
    return applyInviteMeta(applyLocalRecommenderAvatar({
      ...curatedPlace,
      coverImage: coverImageMap[curatedPlace.id] ?? curatedPlace.coverImage,
    }, recommenderMetaMap));
  }

  const { data, error } = await supabase
    .from('places')
    .select(
      'id, name, short_review, full_description, address, latitude, longitude, image_url, city, country, category',
    )
    .eq('id', placeId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const coverImageMap = await readLocalCoverImageMap();
  const recommenderMetaMap = await readLocalRecommenderMetaMap();

  return applyInviteMeta(applyLocalRecommenderAvatar({
    ...mapPlaceRow(data, 0),
    coverImage: coverImageMap[data.id] ?? null,
  }, recommenderMetaMap));
}

export async function fetchSavedPlaces(): Promise<SavedPlace[]> {
  if (env.useMockData) {
    return [];
  }

  let userId: string;

  try {
    userId = await requireAuthenticatedUserId();
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      return [];
    }

    throw error;
  }

  const { data, error } = await supabase
    .from('saved_places')
    .select('place_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  const remoteSavedPlaces =
    (data as SavedPlaceRow[] | null)?.map((row) => ({
      placeId: row.place_id,
      savedAt: row.created_at,
    })) ?? [];
  const localSavedPlaceIds = await readLocalSavedPlaceIds(userId);
  const localSavedPlaces = localSavedPlaceIds.map((placeId) => ({
    placeId,
    savedAt: new Date(0).toISOString(),
  }));

  return [...localSavedPlaces, ...remoteSavedPlaces];
}

export async function fetchPlaceReviews(placeId: string): Promise<PlaceReview[]> {
  if (env.useMockData) {
    return [];
  }

  const { data, error } = await supabase
    .from('reviews')
    .select('id, place_id, body, created_at, user_id, users(display_name, username)')
    .eq('place_id', placeId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return ((data as ReviewRow[] | null) ?? []).map(mapReviewRow);
}

export async function addPlaceReview(placeId: string, body: string): Promise<PlaceReview> {
  const trimmedBody = body.trim();

  if (!trimmedBody) {
    throw new Error('Review text cannot be empty.');
  }

  const userId = await requireAuthenticatedUserId();

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      place_id: placeId,
      user_id: userId,
      body: trimmedBody,
    })
    .select('id, place_id, body, created_at, user_id, users(display_name, username)')
    .single();

  if (error) {
    throw error;
  }

  return mapReviewRow(data as ReviewRow);
}

export async function savePlace(placeId: string): Promise<void> {
  const userId = await requireAuthenticatedUserId();

  if (isCuratedPlaceId(placeId)) {
    const currentSavedPlaceIds = await readLocalSavedPlaceIds(userId);

    if (!currentSavedPlaceIds.includes(placeId)) {
      await writeLocalSavedPlaceIds(userId, [...currentSavedPlaceIds, placeId]);
    }

    return;
  }

  const { error } = await supabase.from('saved_places').upsert(
    {
      user_id: userId,
      place_id: placeId,
    },
    {
      onConflict: 'user_id,place_id',
      ignoreDuplicates: true,
    },
  );

  if (error) {
    throw error;
  }
}

export async function unsavePlace(placeId: string): Promise<void> {
  const userId = await requireAuthenticatedUserId();

  if (isCuratedPlaceId(placeId)) {
    const currentSavedPlaceIds = await readLocalSavedPlaceIds(userId);
    await writeLocalSavedPlaceIds(
      userId,
      currentSavedPlaceIds.filter((savedPlaceId) => savedPlaceId !== placeId),
    );
    return;
  }

  const { error } = await supabase
    .from('saved_places')
    .delete()
    .eq('user_id', userId)
    .eq('place_id', placeId);

  if (error) {
    throw error;
  }
}

export async function createPlace(input: CreatePlaceInput): Promise<string> {
  const userId = await requireAuthenticatedUserId();
  const name = input.name.trim();
  const shortReview = input.shortReview.trim();
  const fullDescription = input.fullDescription.trim();

  if (!name) {
    throw new Error('Place name is required.');
  }

  if (!shortReview) {
    throw new Error('Short recommendation is required.');
  }

  if (!fullDescription) {
    throw new Error('Story is required.');
  }

  const normalizedTags = [...new Set(input.tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))];

  const { data, error } = await supabase
    .from('places')
    .insert({
      name,
      short_review: shortReview,
      full_description: fullDescription,
      address: input.address.trim() || null,
      city: input.city.trim() || null,
      country: input.country.trim() || null,
      image_url: input.imageUrl.trim() || null,
      category: input.category,
      tags: normalizedTags,
      created_by: userId,
    })
    .select('id')
    .single();

  if (error) {
    throw error;
  }

  const placeId = (data as { id: string }).id;
  await saveLocalCoverImage(placeId, input.coverImage);
  await saveLocalRecommenderAvatar(placeId, input.recommenderAvatar);
  await registerPlaceInviteMeta(placeId, {
    mode: input.postMode,
    creatorUserId: userId,
  });

  return placeId;
}
