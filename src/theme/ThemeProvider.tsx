import React, { createContext, useContext } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import { colors, type ColorTokens } from './colors';
import { layout, spacing } from './spacing';
import { radius } from './radius';
import { maxFontScale, textStyles } from './typography';
import { buildShadows, type Shadows } from './shadows';
import { opacity, sizes } from './sizes';

export type ColorScheme = 'light' | 'dark';
export type ThemePreference = 'system' | ColorScheme;

export type Theme = {
  scheme: ColorScheme;
  colors: ColorTokens;
  spacing: typeof spacing;
  layout: typeof layout;
  radius: typeof radius;
  text: typeof textStyles;
  maxFontScale: typeof maxFontScale;
  shadows: Shadows;
  sizes: typeof sizes;
  opacity: typeof opacity;
};

function buildTheme(scheme: ColorScheme): Theme {
  return {
    scheme,
    colors: colors[scheme],
    spacing,
    layout,
    radius,
    text: textStyles,
    maxFontScale,
    shadows: buildShadows(colors[scheme]),
    sizes,
    opacity,
  };
}

/** Les deux thèmes sont construits une seule fois : leur identité sert de clé de cache aux styles. */
const themes: Record<ColorScheme, Theme> = {
  light: buildTheme('light'),
  dark: buildTheme('dark'),
};

const ThemeContext = createContext<Theme>(themes.light);

type Props = {
  /** Réglage de l'utilisateur ; `system` suit le mode Clair / Sombre du téléphone. */
  preference?: ThemePreference;
  children: React.ReactNode;
};

export function ThemeProvider({ preference = 'system', children }: Props) {
  const systemScheme = useColorScheme();
  const scheme: ColorScheme =
    preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;
  return <ThemeContext.Provider value={themes[scheme]}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}

/**
 * Déclare des styles qui dépendent du thème. Renvoie un hook ; les feuilles
 * de style sont créées une fois par thème (Clair / Sombre) puis réutilisées.
 *
 *   const useStyles = makeStyles((t) => ({ card: { backgroundColor: t.colors.bg.surface } }));
 */
export function makeStyles<T extends StyleSheet.NamedStyles<T>>(factory: (theme: Theme) => T) {
  const cache = new Map<Theme, T>();
  return function useStyles(): T {
    const theme = useTheme();
    let styles = cache.get(theme);
    if (!styles) {
      styles = StyleSheet.create(factory(theme));
      cache.set(theme, styles);
    }
    return styles;
  };
}
