import type { TextStyle } from 'react-native';

export {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';

/** Noms des polices chargées par useFonts (une famille par graisse). */
export const fontFamily = {
  regular: 'Outfit_400Regular',
  medium: 'Outfit_500Medium',
  semiBold: 'Outfit_600SemiBold',
  bold: 'Outfit_700Bold',
} as const;

/** Styles de texte du design system (police Outfit). */
export const textStyles = {
  'display-xl': { fontFamily: fontFamily.medium, fontSize: 96, lineHeight: 96 },
  'display-l': { fontFamily: fontFamily.bold, fontSize: 84, lineHeight: 84 },
  'display-m': { fontFamily: fontFamily.medium, fontSize: 64, lineHeight: 64 },
  'heading-h1': { fontFamily: fontFamily.bold, fontSize: 22, lineHeight: 24 },
  'heading-h2': { fontFamily: fontFamily.semiBold, fontSize: 20, lineHeight: 22 },
  'heading-h3': { fontFamily: fontFamily.medium, fontSize: 18, lineHeight: 20 },
  'body-regular': { fontFamily: fontFamily.regular, fontSize: 16, lineHeight: 18 },
  'body-medium': { fontFamily: fontFamily.medium, fontSize: 16, lineHeight: 18 },
  'body-bold': { fontFamily: fontFamily.bold, fontSize: 16, lineHeight: 18 },
  'label-regular': { fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 16 },
  'label-medium': { fontFamily: fontFamily.medium, fontSize: 14, lineHeight: 16 },
  'label-bold': { fontFamily: fontFamily.bold, fontSize: 14, lineHeight: 16 },
  'caption-medium': { fontFamily: fontFamily.medium, fontSize: 10, lineHeight: 12 },
} satisfies Record<string, TextStyle>;

export type TextVariant = keyof typeof textStyles;

/**
 * Agrandissement maximal accepté quand l'utilisateur augmente la taille du
 * texte du système : les chiffres géants (Display) ne grossissent pas, sinon
 * ils sortiraient de l'écran ; le reste du texte suit le réglage.
 */
export const maxFontScale = {
  display: 1,
  default: 1.4,
} as const;
