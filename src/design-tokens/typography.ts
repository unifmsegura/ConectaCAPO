export const fonts = {
  display: "'Poppins', sans-serif",
  body: "'Inter', sans-serif",
} as const;

export const fontSizes = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 20,
  xl: 22,
  metric: 30,
} as const;

export const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
} as const;

export type FontTokens = typeof fonts;
