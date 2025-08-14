export const TYPOGRAPHY = {
  HEADER: {
    LARGE: {
      fontSize: 28,
      lineHeight: 36,
      fontWeight: '700',
    },
    MEDIUM: {
      fontSize: 24,
      lineHeight: 32,
      fontWeight: '600',
    },
    SMALL: {
      fontSize: 20,
      lineHeight: 28,
      fontWeight: '600',
    },
  },
  BODY: {
    LARGE: {
      fontSize: 18,
      lineHeight: 28,
      fontWeight: '400',
    },
    MEDIUM: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400',
    },
    SMALL: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400',
    },
  },
  LABEL: {
    LARGE: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '500',
    },
    MEDIUM: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '500',
    },
    SMALL: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '500',
    },
  },
  BUTTON: {
    LARGE: {
      fontSize: 18,
      lineHeight: 28,
      fontWeight: '600',
    },
    MEDIUM: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '600',
    },
    SMALL: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '600',
    },
  },
} as const;

export type TypographyStyle = typeof TYPOGRAPHY;
