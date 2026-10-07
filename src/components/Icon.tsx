import React from 'react';
import { View } from 'react-native';
import { useTheme, type IconColor, type IconSize } from '../theme';
import { glyphs, type IconName } from './icons';

export type { IconName };

type Props = {
  name: IconName;
  size?: IconSize;
  /** Token icon/* (par défaut icon/primary, comme dans Figma). */
  color?: IconColor;
  /**
   * Couleur déjà résolue depuis le thème, pour les rares cas où aucun token
   * icon/* ne convient (ex. icône d'un badge aux couleurs feedback/*).
   */
  tint?: string;
  /** Rotation du glyphe, en degrés (le chevron pointe à droite par défaut). */
  rotation?: 0 | 90 | 180 | 270;
};

/** Icône du design system (SVG exportés de Figma, grille 24 × 24). */
export function Icon({ name, size = 24, color = 'primary', tint, rotation = 0 }: Props) {
  const { colors } = useTheme();
  const Glyph = glyphs[name];
  const glyph = <Glyph size={size} color={tint ?? colors.icon[color]} />;
  if (rotation === 0) return glyph;
  return <View style={{ transform: [{ rotate: `${rotation}deg` }] }}>{glyph}</View>;
}
