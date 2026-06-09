type TypeStyle = {
  fontSize: number;
  lineHeight: number;
  fontFamily:
    | 'Inter-Regular'
    | 'Inter-Medium'
    | 'Inter-SemiBold'
    | 'Inter-Bold'
    | 'Inter-ExtraBold';
  letterSpacing?: number;
};

export const typography = {
  display: {
    fontSize: 28,
    lineHeight: 36,
    fontFamily: 'Inter-ExtraBold',
    letterSpacing: -0.5,
  },
  h1: {
    fontSize: 24,
    lineHeight: 32,
    fontFamily: 'Inter-Bold',
    letterSpacing: -0.3,
  },
  h2: {
    fontSize: 20,
    lineHeight: 28,
    fontFamily: 'Inter-SemiBold',
  },
  h3: {
    fontSize: 18,
    lineHeight: 26,
    fontFamily: 'Inter-SemiBold',
  },
  bodyLg: {
    fontSize: 17,
    lineHeight: 24,
    fontFamily: 'Inter-Regular',
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'Inter-Regular',
  },
  bodyMd: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'Inter-Medium',
  },
  bodySm: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
  },
  caption: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'Inter-Medium',
  },
  button: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.2,
  },
} as const satisfies Record<string, TypeStyle>;

export type TypographyToken = keyof typeof typography;
