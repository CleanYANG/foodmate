export const typography = {
  fonts: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
  },
  sizes: {
    eyebrow: 12,
    caption: 13,
    bodySm: 15,
    body: 16,
    titleSm: 22,
    titleMd: 30,
    titleLg: 38,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '600',
    heavy: '600',
  },
  lineHeights: {
    compact: 20,
    body: 25,
    relaxed: 29,
    title: 36,
    hero: 42,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 1.1,
  },
} as const;
