import { StyleSheet, View } from 'react-native';

import {
  TasteCatIcon,
  tasteCatColors,
  TasteRaccoonIcon,
} from './SpicyCatIcon';
import { colors } from '../theme/colors';

export type TasteAvatarTaste = keyof typeof tasteCatColors;
export type TasteAvatarAnimal = 'cat' | 'raccoon';
export type TasteAvatarId = `${TasteAvatarAnimal}:${TasteAvatarTaste}`;

type TasteAvatarOption = {
  id: TasteAvatarId;
  animal: TasteAvatarAnimal;
  taste: TasteAvatarTaste;
  color: string;
};

export const tasteAvatarOptions: TasteAvatarOption[] = [
  { id: 'cat:coffee', animal: 'cat', taste: 'coffee', color: tasteCatColors.coffee },
  { id: 'cat:spicy', animal: 'cat', taste: 'spicy', color: tasteCatColors.spicy },
  { id: 'cat:sweets', animal: 'cat', taste: 'sweets', color: tasteCatColors.sweets },
  { id: 'cat:matcha', animal: 'cat', taste: 'matcha', color: tasteCatColors.matcha },
  { id: 'cat:beer', animal: 'cat', taste: 'beer', color: tasteCatColors.beer },
  { id: 'cat:seafood', animal: 'cat', taste: 'seafood', color: tasteCatColors.seafood },
  { id: 'cat:vegetable', animal: 'cat', taste: 'vegetable', color: tasteCatColors.vegetable },
  { id: 'raccoon:coffee', animal: 'raccoon', taste: 'coffee', color: tasteCatColors.coffee },
  { id: 'raccoon:spicy', animal: 'raccoon', taste: 'spicy', color: tasteCatColors.spicy },
  { id: 'raccoon:sweets', animal: 'raccoon', taste: 'sweets', color: tasteCatColors.sweets },
  { id: 'raccoon:matcha', animal: 'raccoon', taste: 'matcha', color: tasteCatColors.matcha },
  { id: 'raccoon:beer', animal: 'raccoon', taste: 'beer', color: tasteCatColors.beer },
  { id: 'raccoon:seafood', animal: 'raccoon', taste: 'seafood', color: tasteCatColors.seafood },
  { id: 'raccoon:vegetable', animal: 'raccoon', taste: 'vegetable', color: tasteCatColors.vegetable },
] as const;

type TasteAvatarProps = {
  avatarId: string | null | undefined;
  size?: number;
  withFrame?: boolean;
};

function resolveTasteAvatar(avatarId: string | null | undefined) {
  return tasteAvatarOptions.find((option) => option.id === avatarId) ?? null;
}

export function TasteAvatar({ avatarId, size = 28, withFrame = true }: TasteAvatarProps) {
  const option = resolveTasteAvatar(avatarId);

  if (!option) {
    return null;
  }

  const icon = option.animal === 'cat' ? (
    <TasteCatIcon color={option.color} size={size * 0.68} />
  ) : (
    <TasteRaccoonIcon color={option.color} size={size * 0.68} />
  );

  if (!withFrame) {
    return icon;
  }

  return <View style={[styles.frame, { width: size, height: size, borderRadius: size / 2 }]}>{icon}</View>;
}

const styles = StyleSheet.create({
  frame: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: 'rgba(74, 46, 34, 0.08)',
    borderWidth: 1,
    justifyContent: 'center',
  },
});
