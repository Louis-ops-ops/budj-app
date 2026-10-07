import type { ColorTokens } from './colors';

/**
 * Styles d'ombre du design system, au format de la prop `boxShadow`
 * (New Architecture). La couleur de l'ombre Carte/Légère vient du token
 * effect/shadow ; l'ombre Élevée empile quatre couches plus douces.
 */
export function buildShadows(colors: ColorTokens) {
  return {
    card: `0px 4px 4px 0px ${colors.effect.shadow}`,
    light: `0px 1px 2px 0px ${colors.effect.shadow}`,
    elevated:
      '0px 1px 2px 0px rgba(0, 0, 0, 0.10), 0px 3px 3px 0px rgba(0, 0, 0, 0.09), 0px 6px 4px 0px rgba(0, 0, 0, 0.05), 0px 11px 4px 0px rgba(0, 0, 0, 0.01)',
  } as const;
}

export type Shadows = ReturnType<typeof buildShadows>;
