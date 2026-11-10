export const colors = {
  navy: "#124E66",
  navyDark: "#0D3748",
  blueMid: "#BED7E2",
  rose: "#D45D79",
  green: "#16724C",
  amber: "#76440B",
  red: "#9F2323",
  background: "#F8F9FA",
  card: "#FFFFFF",
  charcoal: "#1E1E24",
  slate: "#45484C",
  muted: "#62666A",
  border: "#D9DEE2",
  overlay: "rgba(20, 25, 28, 0.74)",
} as const;

export const colorTints = {
  navyLight: "#EAF3F7",
  navyMid: "#BED7E2",
  roseLight: "#FDEEF1",
  greenLight: "#E5F8EF",
  greenMid: "#77C9A6",
  amberLight: "#FFF4D8",
  redLight: "#FCEAEA",
} as const;

export type ColorTokens = typeof colors;
