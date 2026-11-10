import { colors, colorTints } from "./colors";
import { fonts, fontSizes, fontWeights } from "./typography";
import { spacing, borderRadius, shadow, sizing } from "./spacing";

export { colors, colorTints } from "./colors";
export { fonts, fontSizes, fontWeights } from "./typography";
export { spacing, borderRadius, shadow, sizing } from "./spacing";

export const tokens = {
  colors,
  colorTints,
  fonts,
  fontSizes,
  fontWeights,
  spacing,
  borderRadius,
  shadow,
  sizing,
} as const;

export const contrastPairs = [
  { fg: colors.charcoal, bg: colors.background, ratio: "11.5:1", level: "AAA" as const, use: "Texto principal" },
  { fg: colors.navy, bg: colors.background, ratio: "9.2:1", level: "AAA" as const, use: "Títulos e links" },
  { fg: colors.card, bg: colors.navy, ratio: "9.2:1", level: "AAA" as const, use: "Texto em botão primário" },
  { fg: colors.muted, bg: colors.background, ratio: "4.6:1", level: "AA" as const, use: "Labels e bordas" },
  { fg: colors.card, bg: colors.rose, ratio: "3.8:1", level: "DECORATIVE" as const, use: "Apenas negrito ≥18pt em botões" },
] as const;


export const forbiddenPairs = [
  { fg: colors.rose, bg: colors.background, reason: "3.8:1 - ilegível para texto corrido (mín. AA 4.5:1)" },
] as const;
