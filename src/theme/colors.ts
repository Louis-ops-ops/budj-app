/**
 * Palette issue de la page "Design system" du fichier Figma Budj.
 */
export const colors = {
  noir: '#060606',
  blanc: '#FBFBFB',
  gris: '#CCCCCC',

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
