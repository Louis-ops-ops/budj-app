/**
 * Dimensions fixes des composants du design system (page Figma
 * « Composants »), regroupées ici pour qu'aucun composant ne porte de
 * valeur en dur.
 */
export const sizes = {
  borderWidth: { thin: 1, thick: 2 },
  /** Zone tactile minimale (recommandation d'accessibilité iOS / Android). */
  touchTarget: 44,
  iconButton: 32,
  navButton: 44,
  calendarDay: 42,
  calendarDot: 5,
  logo: 38,
  radio: 20,
  progress: { height: 12, track: 8, label: 32 },
  swatch: { dot: 36, ring: 48 },
  amountCursor: { width: 3, height: 72 },
  sheetHandle: { width: 40, height: 5 },
  chart: { barMax: 52, barMin: 2, top: 96, bottom: 72, legendDot: 8 },
  quickAdjust: 76,
} as const;

/** Tailles d'icône utilisées dans le design system. */
export type IconSize = 14 | 16 | 18 | 20 | 24;

export const opacity = {
  disabled: 0.4,
  pressed: 0.7,
} as const;
