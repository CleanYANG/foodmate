import type { Place, PlaceCategory } from '../types/place';

const CATEGORY_TAG_MAP: Record<Exclude<PlaceCategory, 'place'>, string[]> = {
  restaurant: ['restaurant'],
  cafe: ['cafe'],
  bar: ['night'],
  market: ['tourist-friendly'],
  'hidden gem': ['hidden gem'],
};

const TAG_RULES: Array<{ tag: string; keywords: string[] }> = [
  { tag: 'cafe', keywords: ['cafe', 'coffee', 'espresso', 'latte', 'tea room', 'bakery'] },
  {
    tag: 'tourist-friendly',
    keywords: [
      'traveler',
      'travelers',
      'visitor',
      'visitors',
      'first-timer',
      'first timers',
      'sightseeing',
      'central',
      'iconic',
      'souvenir',
      'souvenirs',
      'easy',
      'beginner',
    ],
  },
  { tag: 'hidden gem', keywords: ['hidden', 'tucked away', 'easy to miss', 'secret', 'detour'] },
  { tag: 'date spot', keywords: ['date', 'romantic', 'couples', 'candlelit', 'intimate'] },
  {
    tag: 'cheap',
    keywords: ['cheap', 'budget', 'casual', 'quick meal', 'market', 'food hall', 'snack', 'snacks'],
  },
  {
    tag: 'night',
    keywords: [
      'night',
      'nightlife',
      'late-night',
      'late night',
      'evening',
      'bar',
      'cocktail',
      'izakaya',
    ],
  },
  {
    tag: 'local favorite',
    keywords: ['locals', 'local', 'regulars', 'neighborhood', 'classic', 'specialty'],
  },
  {
    tag: 'restaurant',
    keywords: ['restaurant', 'dining', 'ramen', 'soup curry', 'jingisukan', 'shokudo'],
  },
];

function normalizeTag(value: string) {
  return value.trim().toLowerCase();
}

export function formatTagLabel(tag: string) {
  return normalizeTag(tag);
}

function addUnique(target: string[], value: string) {
  const normalizedValue = normalizeTag(value);

  if (!normalizedValue || target.includes(normalizedValue)) {
    return;
  }

  target.push(normalizedValue);
}

export function derivePlaceTags(
  place: Pick<Place, 'name' | 'shortReview' | 'fullDescription' | 'category'>,
) {
  const tags: string[] = [];
  const normalizedText = [place.name, place.shortReview, place.fullDescription, place.category]
    .join(' ')
    .toLowerCase();

  if (place.category !== 'place') {
    for (const categoryTag of CATEGORY_TAG_MAP[place.category]) {
      addUnique(tags, categoryTag);
    }
  }

  for (const rule of TAG_RULES) {
    if (rule.keywords.some((keyword) => normalizedText.includes(keyword))) {
      addUnique(tags, rule.tag);
    }
  }

  return tags;
}

export function sortTags(tags: string[]) {
  return [...tags].sort((left, right) => left.localeCompare(right));
}

export function placeHasTag(place: Pick<Place, 'tags'>, tag: string) {
  const normalizedTag = normalizeTag(tag);
  return place.tags.some((placeTag) => normalizeTag(placeTag) === normalizedTag);
}
