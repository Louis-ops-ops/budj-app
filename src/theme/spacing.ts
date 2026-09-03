/** Échelle d'espacement (section "6 / Les Spacing" du design system) */
export const spacing = {
  none: 0,
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 18,
  xxl: 24,
} as const;

/** Rayons de bordure utilisés dans le design */
export const radius = {
  card: 12,
  screen: 24,
  pill: 64, // "radius/rond" — boutons, badges, barre de nav
} as const;

/** Cadre de référence des écrans (iPhone 16 dans Figma) */
export const layout = {
  screenPaddingX: spacing.xxl,
  screenPaddingTop: 44,
  screenPaddingBottom: spacing.xxl,
};
