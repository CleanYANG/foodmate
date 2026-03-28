import { AuthRequiredError, requireAuthenticatedUserId } from './authService';
import { mockPlaces } from '../data/mockPlaces';
import { env } from '../config/env';
import { derivePlaceTags, sortTags } from '../lib/placeTags';
import { supabase } from '../lib/supabase';
import type { Place, PlaceCategory, SavedPlace } from '../types/place';
import type { PlaceReview } from '../types/review';

import cafe1 from '../../assets/cafe_1.jpeg';
import cafe2 from '../../assets/cafe_2.jpeg';
import cafe3 from '../../assets/cafe_3.jpeg';
import cafe4 from '../../assets/cafe_4.jpeg';
import cafe5 from '../../assets/cafe_5.jpeg';
import cafe6 from '../../assets/cafe_6.jpeg';
import restaurant1 from '../../assets/restaurant_1.jpeg';
import restaurant2 from '../../assets/restaurant_2.jpeg';
import restaurant4 from '../../assets/restaurant_4.jpeg';
import restaurant5 from '../../assets/restaurant_5.jpeg';
import restaurant3 from '../../assets/resturant_3.jpeg';

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

type SavedPlaceRow = {
  place_id: string;
  created_at: string;
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

const cafeImages = [cafe1, cafe2, cafe3, cafe4, cafe5, cafe6] as const;
const restaurantImages = [restaurant1, restaurant2, restaurant3, restaurant4, restaurant5] as const;

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

function getLocalImageForPlace(
  place: Pick<Place, 'name' | 'category'>,
  categoryIndex: number,
): Place['imageUrl'] | undefined {
  const directNameMatch = directAssetImageByName[normalizeAssetKey(place.name)];

  if (directNameMatch) {
    return directNameMatch;
  }

  if (place.category === 'cafe') {
    return cafeImages[categoryIndex % cafeImages.length];
  }

  if (place.category === 'restaurant') {
    return restaurantImages[categoryIndex % restaurantImages.length];
  }

  return undefined;
}

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
  const place: Place = {
    id: placeRow.id,
    name: placeRow.name,
    shortReview: placeRow.short_review ?? 'A place worth checking out in the city.',
    fullDescription: placeRow.full_description ?? 'More details for this place are coming soon.',
    address: placeRow.address ?? 'Address unavailable',
    latitude: placeRow.latitude,
    longitude: placeRow.longitude,
    imageUrl: placeRow.image_url ?? 'https://placehold.co/800x1200?text=CityTalk+Place',
    tags: [],
    category: 'place',
    city: placeRow.city,
    country: placeRow.country,
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
    placeRow.image_url ??
    'https://placehold.co/800x1200?text=CityTalk+Place';

  return place;
}

function mapReviewRow(reviewRow: ReviewRow): PlaceReview {
  const reviewer = Array.isArray(reviewRow.users) ? reviewRow.users[0] : reviewRow.users;
  const reviewerName =
    reviewer?.display_name?.trim() || reviewer?.username?.trim() || 'Anonymous CityTalk User';

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
  return {
    ...place,
    imageUrl: getLocalImageForPlace(place, categoryIndex) ?? place.imageUrl,
    tags: sortTags(place.tags),
    city: 'Sapporo',
    country: 'Japan',
  };
}

export async function fetchPlaces(): Promise<Place[]> {
  if (env.useMockData) {
    const categoryCounts: Partial<Record<PlaceCategory, number>> = {};

    return mockPlaces.map((place) => {
      const categoryIndex = categoryCounts[place.category] ?? 0;
      categoryCounts[place.category] = categoryIndex + 1;
      return mapMockPlace(place, categoryIndex);
    });
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

  const categoryCounts: Partial<Record<PlaceCategory, number>> = {};

  return (data ?? []).map((placeRow) => {
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

    return mapMockPlace(place, Math.max(categoryIndex, 0));
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

  return data ? mapPlaceRow(data, 0) : null;
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

  return (
    (data as SavedPlaceRow[] | null)?.map((row) => ({
      placeId: row.place_id,
      savedAt: row.created_at,
    })) ?? []
  );
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

  const { error } = await supabase
    .from('saved_places')
    .delete()
    .eq('user_id', userId)
    .eq('place_id', placeId);

  if (error) {
    throw error;
  }
}
