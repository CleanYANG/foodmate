import type { PlaceCategory } from '../types/place';

export type DiscoveryFilterId = 'all' | PlaceCategory;

export type DiscoveryRailItem = {
  id: DiscoveryFilterId;
  label: string;
  icon: string;
};

export const discoveryRailItems: DiscoveryRailItem[] = [
  { id: 'all', label: 'All', icon: '🌍' },
  { id: 'restaurant', label: 'Restaurant', icon: '🍽️' },
  { id: 'cafe', label: 'Cafe', icon: '☕' },
  { id: 'bar', label: 'Bar', icon: '🍸' },
  { id: 'on_mars', label: 'On Mars', icon: '🚀' },
];

export function formatCategoryLabel(category: PlaceCategory) {
  return discoveryRailItems.find((item) => item.id === category)?.label ?? category;
}
