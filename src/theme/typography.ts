export const typography = {
  fontFamily: 'System',
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
    bold: '700',
    heavy: '800',
  },
  lineHeights: {
    compact: 20,
    body: 25,
    relaxed: 30,
    title: 36,
    hero: 42,
  },
  letterSpacing: {
    tight: -0.6,
    normal: 0,
    wide: 1.2,
  },
} as const;
