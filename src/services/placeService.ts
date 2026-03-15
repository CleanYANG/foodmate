import { ensureAppUser } from './authService';
import { supabase } from '../lib/supabase';
import type { Place, PlaceCategory, SavedPlace } from '../types/place';

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

  return place;
}

export async function fetchPlaces(): Promise<Place[]> {
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
  const userId = await ensureAppUser();

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

export async function savePlace(placeId: string): Promise<void> {
  const userId = await ensureAppUser();

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
  const userId = await ensureAppUser();

  const { error } = await supabase
    .from('saved_places')
    .delete()
    .eq('user_id', userId)
    .eq('place_id', placeId);

  if (error) {
    throw error;
  }
}
