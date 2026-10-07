import React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { IconGlyphProps } from './types';

/** Icône/Chevron (Figma 185:1942), dessinée sur une grille 24 × 24. */
export function ChevronIcon({ size, color }: IconGlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M13.2162 12L7 5.86667L8.89189 4L17 12L8.89189 20L7 18.1333L13.2162 12Z" fill={color} />
    </Svg>
  );
}
