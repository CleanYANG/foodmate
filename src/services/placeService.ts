import { AuthRequiredError, requireAuthenticatedUserId } from './authService';
import { mockPlaces } from '../data/mockPlaces';
import { env } from '../config/env';
import { derivePlaceTags, sortTags } from '../lib/placeTags';
import { supabase } from '../lib/supabase';
import type { Place, PlaceCategory, SavedPlace } from '../types/place';
import type { PlaceReview } from '../types/review';

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

function inferCategory(place: Pick<Place, 'tags' | 'name'>): PlaceCategory {
  const normalized = [...place.tags, place.name].join(' ').toLowerCase();

  if (
    normalized.includes('cafe') ||
    normalized.includes('coffee') ||
    normalized.includes('espresso')
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

  if (normalized.includes('market')) {
    return 'market';
  }

  if (
    normalized.includes('ramen') ||
    normalized.includes('soup curry') ||
    normalized.includes('jingisukan') ||
    normalized.includes('food')
  ) {
    return 'local food';
  }

  if (normalized.includes('date') || normalized.includes('romantic')) {
    return 'date spot';
  }

  if (
    normalized.includes('hidden') ||
    normalized.includes('quiet escape') ||
    normalized.includes('tea room')
  ) {
    return 'hidden gem';
  }

  if (
    normalized.includes('view') ||
    normalized.includes('lookout') ||
    normalized.includes('observation') ||
    normalized.includes('sightseeing') ||
    normalized.includes('park')
  ) {
    return 'sightseeing';
  }

  return 'place';
}

function mapPlaceRow(placeRow: PlaceRow): Place {
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

  place.category = inferCategory(place);
  place.tags = sortTags(derivePlaceTags(place));

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

function mapMockPlace(place: (typeof mockPlaces)[number]): Place {
  return {
    ...place,
    tags: sortTags(place.tags),
    city: 'Sapporo',
    country: 'Japan',
  };
}

export async function fetchPlaces(): Promise<Place[]> {
  if (env.useMockData) {
    return mockPlaces.map(mapMockPlace);
  }

  const { data, error } = await supabase
    .from('places')
    .select(
      'id, name, short_review, full_description, address, latitude, longitude, image_url, city, country',
    )
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapPlaceRow);
}

export async function fetchPlaceById(placeId: string): Promise<Place | null> {
  if (env.useMockData) {
    const place = mockPlaces.find((item) => item.id === placeId);
    return place ? mapMockPlace(place) : null;
  }

  const { data, error } = await supabase
    .from('places')
    .select(
      'id, name, short_review, full_description, address, latitude, longitude, image_url, city, country',
    )
    .eq('id', placeId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapPlaceRow(data) : null;
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
