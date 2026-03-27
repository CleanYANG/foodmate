import type { ImageSourcePropType } from 'react-native';

export type PlaceCategory = 'restaurant' | 'cafe' | 'bar' | 'on_mars' | 'place';

export type Place = {
  id: string;
  name: string;
  shortReview: string;
  fullDescription: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  imageUrl: string | ImageSourcePropType;
  tags: string[];
  category: PlaceCategory;
  city: string | null;
  country: string | null;
};

export type SavedPlace = {
  placeId: string;
  savedAt: string;
};
