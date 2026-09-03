import { TextStyle } from 'react-native';
import { colors } from './colors';

/**
 * Échelle typographique — police "Outfit" (voir page Design system Figma).
 * Chaque style correspond à un rôle défini dans le design (H1-H3, Body, Label).
 */
const family = {
  regular: 'Outfit_400Regular',
  medium: 'Outfit_500Medium',
  semibold: 'Outfit_600SemiBold',
  bold: 'Outfit_700Bold',
};

export const typography: Record<string, TextStyle> = {
  h1: {
    fontFamily: family.bold,
    fontSize: 22,
    lineHeight: 24,
    color: colors.texte,
  },
  h2: {
    // Le design system utilise SemiBold ici (pas Bold) — voir style "H2 - 20"
    fontFamily: family.semibold,
    fontSize: 20,
    lineHeight: 22,
    color: colors.texte,
  },
  h3: {
    fontFamily: family.bold,
    fontSize: 18,
    lineHeight: 20,
    color: colors.texte,
  },
  bodyBold: {
    fontFamily: family.bold,
    fontSize: 16,
    lineHeight: 18,
    color: colors.texte,
  },
  body: {
    fontFamily: family.regular,
    fontSize: 16,
    lineHeight: 18,
    color: colors.texte,
  },
  bodyMedium: {
    fontFamily: family.medium,
    fontSize: 16,
    lineHeight: 18,
    color: colors.texte,
  },
  labelXs: {
    fontFamily: family.regular,
    fontSize: 14,
    lineHeight: 16,
    color: colors.texte,
  },
  labelXsMedium: {
    fontFamily: family.medium,
    fontSize: 14,
    lineHeight: 16,
    color: colors.texte,
  },
  labelXxs: {
    fontFamily: family.medium,
    fontSize: 10,
    lineHeight: 12,
    color: colors.texte,
  },
  // Le très gros montant affiché sur l'accueil (854€)
  montant: {
    fontFamily: family.bold,
    fontSize: 84,
    lineHeight: 90,
    color: colors.bleue[500],
  },
};

export {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';
