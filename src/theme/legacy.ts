import type { TextStyle } from 'react-native';

/**
 * Tokens de la v1 (palette, espacements, typo), conservés le temps que les
 * écrans v1 soient remplacés par ceux de la v2. Ne plus les utiliser : le
 * nouveau thème passe par useTheme() (voir ./ThemeProvider).
 */
export const colors = {
  noir: '#060606',
  blanc: '#FBFBFB',
  gris: '#B5B5B5',

  bleue: {
    50: '#F1F3FF',
    100: '#E6E9FF',
    200: '#D0D7FF',
    300: '#AAB4FF',
    400: '#7B85FF',
    500: '#4549FF', // couleur de référence (5P) — boutons / actions
    600: '#2A20FF',
    700: '#1D0EF3',
    800: '#170BCC',
    900: '#170CB0',
    950: '#070471',
  },

  // Couleurs des cartes de catégories (paires claire/sombre — popup Figma
  // 18:497 "Pop up ajouter une catégorie" / div_colors_field 18:538).
  categorie: {
    vertClaire: '#F2FFF1',
    vertSombre: '#116D09',
    mauveClaire: '#FFF1F6',
    mauveSombre: '#6D094C',
    // orangeClaire est le seul swatch du sélecteur Figma qui n'a pas de
    // variable nommée (juste un hex brut) : pas de "orange-sombre" défini
    // dans le fichier. orangeSombre ci-dessous est donc une valeur choisie
    // par cohérence avec les autres teintes "sombre", pas extraite de Figma.
    orangeClaire: '#FFE7D0',
    orangeSombre: '#6D3D09',
    rougeClaire: '#FFD0D1',
    rougeSombre: '#6D090B',
    bleueClaire: '#D0F5FF',
    bleueSombre: '#09386D',
    // Pas une couleur du sélecteur Figma : réservée à la catégorie fantôme
    // "Non catégorisé" (voir NON_CATEGORISE_ID dans data/types.ts), jamais
    // proposée à l'utilisateur comme choix de couleur.
    griseClaire: '#EDEDED',
    griseSombre: '#6B6B6B',
  },

  // Alias sémantiques utilisés dans les composants
  fond: '#FBFBFB',
  texte: '#060606',
  texteSecondaire: '#AAB4FF', // bleue-300, utilisé pour les sous-labels
  action: '#4549FF', // bleue-500 / P
} as const;

/** Ordre identique au sélecteur de couleur Figma (div_colors_field 18:538) */
export const categoryPalette = [
  { fond: colors.categorie.vertClaire, texte: colors.categorie.vertSombre },
  { fond: colors.categorie.mauveClaire, texte: colors.categorie.mauveSombre },
  { fond: colors.categorie.orangeClaire, texte: colors.categorie.orangeSombre },
  { fond: colors.categorie.rougeClaire, texte: colors.categorie.rougeSombre },
  { fond: colors.categorie.bleueClaire, texte: colors.categorie.bleueSombre },
] as const;

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

const family = {
  regular: 'Outfit_400Regular',
  medium: 'Outfit_500Medium',
  semibold: 'Outfit_600SemiBold',
  bold: 'Outfit_700Bold',
};

/**
 * Échelle typographique — police "Outfit" (voir page Design system Figma).
 * Chaque style correspond à un rôle défini dans le design (H1-H3, Body, Label).
 */
export const typography: Record<string, TextStyle> = {
  h1: { fontFamily: family.bold, fontSize: 22, lineHeight: 24, color: colors.texte },
  // Le design system utilise SemiBold ici (pas Bold) — voir style "H2 - 20"
  h2: { fontFamily: family.semibold, fontSize: 20, lineHeight: 22, color: colors.texte },
  h3: { fontFamily: family.bold, fontSize: 18, lineHeight: 20, color: colors.texte },
  bodyBold: { fontFamily: family.bold, fontSize: 16, lineHeight: 18, color: colors.texte },
  body: { fontFamily: family.regular, fontSize: 16, lineHeight: 18, color: colors.texte },
  bodyMedium: { fontFamily: family.medium, fontSize: 16, lineHeight: 18, color: colors.texte },
  labelXs: { fontFamily: family.regular, fontSize: 14, lineHeight: 16, color: colors.texte },
  labelXsMedium: { fontFamily: family.medium, fontSize: 14, lineHeight: 16, color: colors.texte },
  labelXxs: { fontFamily: family.medium, fontSize: 10, lineHeight: 12, color: colors.texte },
  // Le très gros montant affiché sur l'accueil (854€)
  montant: { fontFamily: family.bold, fontSize: 84, lineHeight: 90, color: colors.bleue[500] },
};
