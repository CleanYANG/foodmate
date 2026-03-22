export type PlaceCategory = 'restaurant' | 'cafe' | 'bar' | 'market' | 'hidden gem' | 'place';

export type PlaceCollection = 'not on earth' | 'on mars';

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
  collections: string[];
  city: string | null;
  country: string | null;
};

export type SavedPlace = {
  placeId: string;
  savedAt: string;
};
