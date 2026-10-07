import { alpha, blue, cyan, green, mauve, neutral, orange, red } from './primitives';

/** Couleurs proposées pour une catégorie créée par l'utilisateur. */
export const CATEGORY_COLORS = ['vert', 'mauve', 'orange', 'rouge', 'cyan'] as const;
export type CategoryColor = (typeof CATEGORY_COLORS)[number];

/**
 * Toutes les teintes de catégorie du thème : les 5 couleurs utilisateur,
 * `bleu` (réservé aux dépenses fixes) et `neutre` (« Sans catégorie », qui
 * n'existe pas dans Figma : ajouté pour les dépenses orphelines).
 */
export type CategoryTone = CategoryColor | 'bleu' | 'neutre';

type Pair = { bg: string; fg: string };

export type ColorTokens = {
  bg: {
    app: string;
    sheet: string;
    surface: string;
    brandSubtle: string;
    brandMuted: string;
    brandStrong: string;
    accent: string;
    iconButton: string;
    navAction: string;
    navActive: string;
    danger: string;
    successSubtle: string;
    dangerSubtle: string;
    overlay: string;
    none: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    onAccent: string;
    brand: string;
    brandStrong: string;
    brandSubtle: string;
    brandFaint: string;
    brandDeep: string;
    success: string;
    danger: string;
  };
  icon: {
    primary: string;
    brand: string;
    onAccent: string;
    muted: string;
    danger: string;
  };
  border: {
    brand: string;
    brandSubtle: string;
    subtle: string;
    glass: string;
  };
  feedback: {
    success: Pair;
    danger: Pair;
  };
  category: Record<CategoryTone, Pair>;
  effect: {
    shadow: string;
  };
};

export type TextColor = keyof ColorTokens['text'];
export type IconColor = keyof ColorTokens['icon'];

const light: ColorTokens = {
  bg: {
    app: neutral[50],
    sheet: neutral[100],
    surface: neutral[0],
    brandSubtle: blue[50],
    brandMuted: blue[100],
    brandStrong: blue[200],
    accent: blue[500],
    iconButton: alpha.blue300_20,
    navAction: alpha.blue300_30,
    navActive: neutral[50],
    danger: red[500],
    successSubtle: alpha.green700_30,
    dangerSubtle: alpha.red700_30,
    overlay: alpha.black40,
    none: alpha.transparent,
  },
  text: {
    primary: neutral[950],
    secondary: neutral[400],
    tertiary: neutral[700],
    onAccent: neutral[50],
    brand: blue[500],
    brandStrong: blue[600],
    brandSubtle: blue[400],
    brandFaint: blue[300],
    brandDeep: blue[950],
    success: green[700],
    danger: red[700],
  },
  icon: {
    primary: neutral[950],
    brand: blue[500],
    onAccent: neutral[50],
    muted: neutral[400],
    danger: red[500],
  },
  border: {
    brand: blue[500],
    brandSubtle: blue[300],
    subtle: blue[50],
    glass: alpha.white10,
  },
  feedback: {
    success: { bg: green[100], fg: green[700] },
    danger: { bg: red[100], fg: red[700] },
  },
  category: {
    vert: { bg: green[100], fg: green[700] },
    mauve: { bg: mauve[100], fg: mauve[700] },
    orange: { bg: orange[100], fg: orange[700] },
    rouge: { bg: red[100], fg: red[700] },
    cyan: { bg: cyan[100], fg: cyan[700] },
    bleu: { bg: blue[50], fg: blue[950] },
    neutre: { bg: neutral[200], fg: neutral[700] },
  },
  effect: {
    shadow: alpha.black25,
  },
};

const dark: ColorTokens = {
  bg: {
    app: neutral[950],
    sheet: neutral[900],
    surface: neutral[800],
    brandSubtle: blue[975],
    brandMuted: blue[950],
    brandStrong: blue[900],
    accent: blue[500],
    iconButton: alpha.blue300_20,
    navAction: alpha.blue300_30,
    navActive: neutral[800],
    danger: red[500],
    successSubtle: alpha.green700_30,
    dangerSubtle: alpha.red700_30,
    overlay: alpha.black60,
    none: alpha.transparent,
  },
  text: {
    primary: neutral[50],
    secondary: neutral[500],
    tertiary: neutral[300],
    onAccent: neutral[50],
    brand: blue[300],
    brandStrong: blue[200],
    brandSubtle: blue[400],
    brandFaint: blue[400],
    brandDeep: blue[100],
    success: green[200],
    danger: red[200],
  },
  icon: {
    primary: neutral[50],
    brand: blue[300],
    onAccent: neutral[50],
    muted: neutral[500],
    danger: red[500],
  },
  border: {
    brand: blue[400],
    brandSubtle: blue[800],
    subtle: blue[950],
    glass: alpha.white10,
  },
  feedback: {
    success: { bg: green[900], fg: green[200] },
    danger: { bg: red[900], fg: red[200] },
  },
  category: {
    vert: { bg: green[900], fg: green[200] },
    mauve: { bg: mauve[900], fg: mauve[200] },
    orange: { bg: orange[900], fg: orange[200] },
    rouge: { bg: red[900], fg: red[200] },
    cyan: { bg: cyan[900], fg: cyan[200] },
    bleu: { bg: blue[975], fg: blue[100] },
    neutre: { bg: neutral[800], fg: neutral[300] },
  },
  effect: {
    shadow: alpha.black25,
  },
};

export const colors = { light, dark } as const;
