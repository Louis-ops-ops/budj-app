/**
 * Couleurs brutes du design system (page Figma « Fondations »).
 * Jamais importées par les composants : ils passent par les tokens
 * sémantiques de ./colors, via useTheme().
 */
export const neutral = {
  0: '#FFFFFF',
  50: '#FBFBFB',
  100: '#F6F6F6',
  200: '#E8E8E8',
  300: '#CCCCCC',
  400: '#B5B5B5',
  500: '#8A8A8A',
  600: '#626262',
  700: '#444444',
  800: '#2A2A2E',
  900: '#18181B',
  950: '#060606',
} as const;

export const blue = {
  50: '#F1F3FF',
  100: '#E6E9FF',
  200: '#D0D7FF',
  300: '#AAB4FF',
  400: '#7B85FF',
  500: '#4549FF',
  600: '#2A20FF',
  700: '#1D0EF3',
  800: '#170BCC',
  900: '#170CB0',
  950: '#070471',
  975: '#0E0F2E',
} as const;

export const green = {
  100: '#E5F2E4',
  200: '#B8E3B3',
  700: '#116D09',
  900: '#0F2A0D',
} as const;

export const mauve = {
  100: '#FFF1F6',
  200: '#F5B8DD',
  700: '#6D094C',
  900: '#2E0A22',
} as const;

export const orange = {
  100: '#FFE7D0',
  200: '#F5D2A6',
  700: '#6D4309',
  900: '#2E1F0A',
} as const;

export const red = {
  100: '#FFD0D1',
  200: '#F5B0B2',
  500: '#FF383C',
  700: '#6D090B',
  900: '#2E0A0B',
} as const;

export const cyan = {
  100: '#D0F5FF',
  200: '#A9E4F7',
  700: '#09386D',
  900: '#0A1F33',
} as const;

/** Couleurs avec transparence, au format #RRGGBBAA. */
export const alpha = {
  transparent: '#00000000',
  blue300_20: '#AAB4FF33',
  blue300_30: '#AAB4FF4D',
  white10: '#FFFFFF1A',
  white70: '#FFFFFFB3',
  green700_30: '#116D094D',
  red700_30: '#6D090B4D',
  black25: '#00000040',
  black40: '#00000066',
  black60: '#00000099',
} as const;
