export type Place = {
  id: string;
  name: string;
  short_review: string;
  full_description: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  image_url: string;
  city: string | null;
  country: string | null;
  tags: string[];
  created_at?: string;
};

export type PlaceFormValues = {
  name: string;
  short_review: string;
  full_description: string;
  address: string;
  latitude: string;
  longitude: string;
  image_url: string;
  city: string;
  country: string;
  tagsText: string;
};
