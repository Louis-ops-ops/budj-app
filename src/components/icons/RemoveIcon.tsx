import React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { IconGlyphProps } from './types';

/** Icône/Retirer (Figma 185:1940), dessinée sur une grille 24 × 24. */
export function RemoveIcon({ size, color }: IconGlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 13V11H18V13H6Z" fill={color} />
    </Svg>
  );
}
