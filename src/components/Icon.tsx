import React from 'react';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { colors } from '../theme';

export type IconName =
  | 'plus'
  | 'edit'
  | 'trash'
  | 'close'
  | 'chevronRight'
  | 'chevronDown'
  | 'check'
  | 'moveTo'
  | 'home'
  | 'categories'
  | 'calendar'
  | 'history';

type Props = {
  name: IconName;
  size?: number;
  color?: string;
};

/**
 * Set d'icônes minimal, dessiné à la main (traits arrondis, 1.8px de large)
 * en attendant de brancher les vrais SVG exportés depuis Figma
 * ("3 / Icônes" — bibliothèque Material 3 dans le design system).
 */
export function Icon({ name, size = 24, color = colors.texte }: Props) {
  const stroke = color;
  const common = {
    stroke,
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none' as const,
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'plus' && (
        <>
          <Line x1={12} y1={5} x2={12} y2={19} {...common} />
          <Line x1={5} y1={12} x2={19} y2={12} {...common} />
        </>
      )}
      {name === 'edit' && (
        <Path
          d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0 0-3L18.5 6a2.1 2.1 0 0 0-3 0L4.5 16.5 4 20Z"
          {...common}
        />
      )}
      {name === 'trash' && (
        <>
          <Path d="M5 7h14" {...common} />
          <Path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" {...common} />
          <Path d="M7 7l1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13" {...common} />
        </>
      )}
      {name === 'close' && (
        <>
          <Line x1={6} y1={6} x2={18} y2={18} {...common} />
          <Line x1={18} y1={6} x2={6} y2={18} {...common} />
        </>
      )}
      {name === 'chevronRight' && <Path d="M9 5l7 7-7 7" {...common} />}
      {name === 'chevronDown' && <Path d="M5 9l7 7 7-7" {...common} />}
      {name === 'check' && <Path d="M5 13l4 4L19 7" {...common} />}
      {name === 'moveTo' && (
        <>
          <Path d="M10 4H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4" {...common} />
          <Line x1={9} y1={12} x2={20} y2={12} {...common} />
          <Path d="M15 7l5 5-5 5" {...common} />
        </>
      )}
      {name === 'home' && (
        <>
          <Path d="M4 11.5 12 4l8 7.5" {...common} />
          <Path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9" {...common} />
        </>
      )}
      {name === 'categories' && (
        <>
          <Line x1={4} y1={7} x2={20} y2={7} {...common} />
          <Line x1={4} y1={12} x2={20} y2={12} {...common} />
          <Line x1={4} y1={17} x2={14} y2={17} {...common} />
        </>
      )}
      {name === 'calendar' && (
        <>
          <Path d="M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" {...common} />
          <Line x1={4} y1={10} x2={20} y2={10} {...common} />
          <Line x1={8} y1={3} x2={8} y2={7} {...common} />
          <Line x1={16} y1={3} x2={16} y2={7} {...common} />
        </>
      )}
      {name === 'history' && (
        <>
          <Circle cx={12} cy={13} r={8} {...common} />
          <Path d="M12 9v4l3 2" {...common} />
        </>
      )}
    </Svg>
  );
}
