import * as Linking from 'expo-linking';

import type { Place } from '../types/place';

function buildQuery(place: Pick<Place, 'name' | 'address'>) {
  return encodeURIComponent([place.name, place.address].filter(Boolean).join(', '));
}

export async function openPlaceInMaps(place: Pick<Place, 'name' | 'address'>) {
  const query = buildQuery(place);
  const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
  await Linking.openURL(url);
}
