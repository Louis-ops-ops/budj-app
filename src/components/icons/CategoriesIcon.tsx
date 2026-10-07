import React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { IconGlyphProps } from './types';

/** Icône/Catégories (Figma 185:1944), dessinée sur une grille 24 × 24. */
export function CategoriesIcon({ size, color }: IconGlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 18V16H9V18H3ZM3 13V11H15V13H3ZM3 8V6H21V8H3Z" fill={color} />
    </Svg>
  );
}
