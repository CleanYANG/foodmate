import type { ImageSourcePropType } from 'react-native';

export type PlaceCategory = 'restaurant' | 'cafe' | 'bar' | 'on_mars' | 'place';
export type PlacePostMode = 'share' | 'invite';
export type PlaceInviteStatus = 'idle' | 'requested' | 'accepted' | 'closed';
export type PlaceCoverImage = {
  scale: number;
  offsetX: number;
  offsetY: number;
};

export type PlaceRecommender = {
  name: string;
  avatar: string | null;
  shortBio: string;
  intent: string;
  quote: string;
};

export type Place = {
  id: string;
  name: string;
  shortReview: string;
  fullDescription: string;
  story: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  imageUrl: string | ImageSourcePropType;
  imageUrls: Array<string | ImageSourcePropType>;
  coverImage: PlaceCoverImage | null;
  tags: string[];
  category: PlaceCategory;
  city: string | null;
  country: string | null;
  recommender: PlaceRecommender;
  budget: string | null;
  bestFor: string[];
  postMode: PlacePostMode;
  inviteStatus: PlaceInviteStatus;
  inviteCreatorUserId: string | null;
  inviteRequesterUserId: string | null;
  inviteAcceptedRequesterUserId: string | null;
};

export type SavedPlace = {
  placeId: string;
  savedAt: string;
};
