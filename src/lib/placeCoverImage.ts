import type { PlaceCoverImage } from '../types/place';

export const DEFAULT_PLACE_COVER_IMAGE: PlaceCoverImage = {
  scale: 1.08,
  offsetX: 0,
  offsetY: 0,
};

export function normalizePlaceCoverImage(
  value: Partial<PlaceCoverImage> | null | undefined,
): PlaceCoverImage {
  return {
    scale: Math.min(Math.max(value?.scale ?? DEFAULT_PLACE_COVER_IMAGE.scale, 1), 1.6),
    offsetX: Math.min(Math.max(value?.offsetX ?? DEFAULT_PLACE_COVER_IMAGE.offsetX, -120), 120),
    offsetY: Math.min(Math.max(value?.offsetY ?? DEFAULT_PLACE_COVER_IMAGE.offsetY, -180), 180),
  };
}
