import React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { IconGlyphProps } from './types';

/** Icône/Ajouter (Figma 185:1938), dessinée sur une grille 24 × 24. */
export function AddIcon({ size, color }: IconGlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M11 13H5V11H11V5H13V11H19V13H13V19H11V13Z" fill={color} />
    </Svg>
  );
}
