import type { PlaceCategory, PlaceCollection } from '../types/place';

export type DiscoveryFilterId = 'all' | PlaceCategory | PlaceCollection;

export type DiscoveryRailItem = {
  id: DiscoveryFilterId;
  label: string;
  icon: string;
  kind: 'all' | 'category' | 'collection';
};

export const discoveryRailItems: DiscoveryRailItem[] = [
  { id: 'all', label: 'All', icon: '🌍', kind: 'all' },
  { id: 'restaurant', label: 'Restaurant', icon: '🍽️', kind: 'category' },
  { id: 'cafe', label: 'Cafe', icon: '☕', kind: 'category' },
  { id: 'bar', label: 'Bar', icon: '🍸', kind: 'category' },
  { id: 'market', label: 'Market', icon: '🛍️', kind: 'category' },
  { id: 'hidden gem', label: 'Hidden Gem', icon: '💎', kind: 'category' },
  { id: 'not on earth', label: 'Not on Earth', icon: '🪐', kind: 'collection' },
  { id: 'on mars', label: 'On Mars', icon: '🚀', kind: 'collection' },
];

export function formatCategoryLabel(category: PlaceCategory) {
  return discoveryRailItems.find((item) => item.id === category)?.label ?? category;
}

export function formatCollectionLabel(collection: PlaceCollection) {
  return discoveryRailItems.find((item) => item.id === collection)?.label ?? collection;
}
