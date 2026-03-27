export type Moment = {
  id: string;
  userId: string;
  placeId: string;
  city: string;
  placeName: string;
  placeImageUrl: string | null;
  userImageUrl: string | null;
  text: string;
  createdAt: string;
  vibeTags?: string[];
  category?: string;
};
