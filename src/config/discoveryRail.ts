import type { PlaceCategory } from '../types/place';

export type DiscoveryFilterId = Extract<PlaceCategory, 'restaurant' | 'cafe' | 'bar' | 'on_mars'>;

export type DiscoveryRailItem = {
  id: DiscoveryFilterId;
  icon: string;
  translationKey: 'category.restaurant' | 'category.bar' | 'category.coffee' | 'category.streetFood';
};

export const discoveryRailItems: DiscoveryRailItem[] = [
  { id: 'bar', icon: '◌', translationKey: 'category.bar' },
  { id: 'restaurant', icon: '⌂', translationKey: 'category.restaurant' },
  { id: 'cafe', icon: '◔', translationKey: 'category.coffee' },
  { id: 'on_mars', icon: '△', translationKey: 'category.streetFood' },
];

export function getCategoryTranslationKey(category: PlaceCategory) {
  return (
    discoveryRailItems.find((item) => item.id === category)?.translationKey ??
    'category.restaurant'
  );
}

export function formatCategoryLabel(
  category: PlaceCategory,
  t: (key: DiscoveryRailItem['translationKey']) => string,
) {
  return t(getCategoryTranslationKey(category));
}
