export type PlaceCategory =
  | 'cafe'
  | 'bar'
  | 'market'
  | 'local food'
  | 'date spot'
  | 'hidden gem'
  | 'sightseeing'
  | 'place';

export type Place = {
  id: string;
  name: string;
  shortReview: string;
  fullDescription: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  imageUrl: string;
  tags: string[];
  category: PlaceCategory;
  city: string | null;
  country: string | null;
};

export type SavedPlace = {
  placeId: string;
  savedAt: string;
};
