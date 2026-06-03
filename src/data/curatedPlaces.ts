import type { ImageSourcePropType } from 'react-native';

import cafe1 from '../../assets/cafe/札幌 -allee cafe.jpg';
import cafe2 from '../../assets/cafe/札幌-Shizukuya.jpg';
import cafe3 from '../../assets/cafe/札幌-aile cafe.jpg';
import cafe4 from '../../assets/cafe/札幌-cafe-Noymond.jpg';
import cafe5 from '../../assets/cafe/札幌-patisserie Cafe feve-1.jpg';
import cafe6 from '../../assets/cafe/札幌-patisserie Cafe feve-2.jpg';
import cafe7 from '../../assets/cafe/札幌-patisserie Cafe feve-3.jpeg';
import cafe8 from '../../assets/cafe/札幌-trattoria KUJIRA sapporo-1.jpg';
import cafe9 from '../../assets/cafe/札幌-trattoria KUJIRA sapporo-2.jpg';
import cafe10 from '../../assets/cafe/札幌-一粒の麦.jpg';

import type { PlaceCategory, PlaceCoverImage } from '../types/place';

export type CuratedPlaceSeed = {
  id: string;
  name: string;
  shortReview: string;
  fullDescription: string;
  address: string;
  city: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  imageUrl: string | ImageSourcePropType;
  imageUrls: Array<string | ImageSourcePropType>;
  coverImage: PlaceCoverImage | null;
  tags: string[];
  category: PlaceCategory;
};

export const curatedPlaces: CuratedPlaceSeed[] = [
  {
    id: 'curated-sapporo-allee-cafe',
    name: '札幌-allee cafe',
    shortReview: 'A cozy cafe with a soft and relaxed mood.',
    fullDescription:
      'A simple, comfortable place for coffee and a quiet break.',
    address: 'Sapporo',
    city: 'Sapporo',
    country: 'Japan',
    latitude: null,
    longitude: null,
    imageUrl: cafe1,
    imageUrls: [cafe1],
    coverImage: { scale: 1.06, offsetX: 0, offsetY: -10 },
    tags: ['cozy', 'relaxed', 'quiet'],
    category: 'cafe',
  },
  {
    id: 'curated-sapporo-shizukuya',
    name: '札幌-Shizukuya',
    shortReview: 'A quiet cafe with a calm and gentle atmosphere.',
    fullDescription:
      'The space feels peaceful, simple, and easy to slow down in.',
    address: 'Sapporo',
    city: 'Sapporo',
    country: 'Japan',
    latitude: null,
    longitude: null,
    imageUrl: cafe2,
    imageUrls: [cafe2],
    coverImage: { scale: 1.08, offsetX: 0, offsetY: -14 },
    tags: ['peaceful', 'minimal', 'quiet'],
    category: 'cafe',
  },
  {
    id: 'curated-sapporo-aile-cafe',
    name: '札幌-aile cafe',
    shortReview: 'A bright cafe with a clean look and a friendly feel.',
    fullDescription:
      'It feels light, open, and easy to enjoy at any time of day.',
    address: 'Sapporo',
    city: 'Sapporo',
    country: 'Japan',
    latitude: null,
    longitude: null,
    imageUrl: cafe3,
    imageUrls: [cafe3],
    coverImage: { scale: 1.06, offsetX: 0, offsetY: -8 },
    tags: ['bright', 'friendly', 'casual'],
    category: 'cafe',
  },
  {
    id: 'curated-sapporo-cafe-noymond',
    name: '札幌-cafe Noymond',
    shortReview: 'A modern cafe with natural light and a calm mood.',
    fullDescription:
      'The space feels clean, quiet, and softly modern.',
    address: 'Sapporo',
    city: 'Sapporo',
    country: 'Japan',
    latitude: null,
    longitude: null,
    imageUrl: cafe4,
    imageUrls: [cafe4],
    coverImage: { scale: 1.06, offsetX: 0, offsetY: -12 },
    tags: ['modern', 'stylish', 'calm'],
    category: 'cafe',
  },
  {
    id: 'curated-sapporo-patisserie-cafe-feve',
    name: '札幌-patisserie Cafe feve',
    shortReview: 'A sweet little patisserie cafe with a soft and polished feel.',
    fullDescription:
      'A nice stop for dessert, coffee, and a quiet afternoon.',
    address: 'Sapporo',
    city: 'Sapporo',
    country: 'Japan',
    latitude: null,
    longitude: null,
    imageUrl: cafe5,
    imageUrls: [cafe5, cafe6, cafe7],
    coverImage: { scale: 1.1, offsetX: 0, offsetY: -18 },
    tags: ['dessert', 'patisserie', 'calm'],
    category: 'cafe',
  },
  {
    id: 'curated-sapporo-trattoria-kujira-sapporo',
    name: '札幌-trattoria KUJIRA sapporo',
    shortReview: 'A warm trattoria with a relaxed and easy atmosphere.',
    fullDescription:
      'It feels comfortable, welcoming, and slightly special without being formal.',
    address: 'Sapporo',
    city: 'Sapporo',
    country: 'Japan',
    latitude: null,
    longitude: null,
    imageUrl: cafe8,
    imageUrls: [cafe8, cafe9],
    coverImage: { scale: 1.08, offsetX: 0, offsetY: -12 },
    tags: ['dinner', 'warm', 'date spot'],
    category: 'restaurant',
  },
  {
    id: 'curated-sapporo-hitotsubu-no-mugi',
    name: '札幌-一粒の麦',
    shortReview: 'A warm little spot with a homey and quiet mood.',
    fullDescription:
      'It feels gentle, comfortable, and easy to spend time in.',
    address: 'Sapporo',
    city: 'Sapporo',
    country: 'Japan',
    latitude: null,
    longitude: null,
    imageUrl: cafe10,
    imageUrls: [cafe10],
    coverImage: { scale: 1.08, offsetX: 0, offsetY: -14 },
    tags: ['homey', 'dessert', 'gentle'],
    category: 'cafe',
  },
];
