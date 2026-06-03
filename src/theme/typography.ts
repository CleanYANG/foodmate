export const typography = {
  fonts: {
    regular: 'AppFont_Regular',
    medium: 'AppFont_Medium',
    semibold: 'AppFont_Semibold',
  },
  sizes: {
    eyebrow: 12,
    caption: 13,
    bodySm: 14,
    body: 16,
    titleSm: 20,
    titleMd: 26,
    titleLg: 34,
    hero: 28,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '700',
    bold: '700',
    heavy: '700',
  },
  lineHeights: {
    compact: 19,
    body: 24,
    relaxed: 28,
    title: 32,
    hero: 36,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 1.1,
  },
} as const;
