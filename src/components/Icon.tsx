import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme/legacy';

export type IconName =
  | 'plus'
  | 'edit'
  | 'trash'
  | 'close'
  | 'chevronRight'
  | 'chevronDown'
  | 'check'
  | 'moveTo'
  | 'categories'
  | 'calendar'
  | 'history';

type Props = {
  name: IconName;
  size?: number;
  color?: string;
};

/**
 * Boîte de référence des icônes. Les SVG exportés de Figma sont rognés sur
 * leur encre (pas de viewBox carrée) et dessinés à l'échelle Material 20dp :
 * on les recentre donc dans un carré de 20, et `size = 20` rend chaque icône
 * exactement à la taille du fichier Figma.
 */
const BOX = 20;

type Glyph = {
  /** Largeur/hauteur réelles de l'encre du SVG Figma (≠ viewBox du fichier) */
  w: number;
  h: number;
  d: string;
};

/**
 * Tracés repris tels quels des exports Figma ("3 / Icônes" — Material 3).
 * Le `fill` d'origine est retiré de chaque tracé pour que la couleur reste
 * pilotée par la prop `color` (les exports sont figés en #4549FF / #7B85FF /
 * #2A20FF / #FBFBFB selon l'écran d'où ils viennent).
 */
const GLYPHS: Record<IconName, Glyph> = {
  plus: {
    w: 11.6667,
    h: 11.6667,
    d: 'M5 6.66667H0V5H5V0H6.66667V5H11.6667V6.66667H6.66667V11.6667H5V6.66667Z',
  },
  edit: {
    w: 12,
    h: 12,
    d: 'M0 12V9.16667L8.8 0.383333C8.93333 0.261111 9.08056 0.166667 9.24167 0.1C9.40278 0.0333333 9.57222 0 9.75 0C9.92778 0 10.1 0.0333333 10.2667 0.1C10.4333 0.166667 10.5778 0.266667 10.7 0.4L11.6167 1.33333C11.75 1.45556 11.8472 1.6 11.9083 1.76667C11.9694 1.93333 12 2.1 12 2.26667C12 2.44444 11.9694 2.61389 11.9083 2.775C11.8472 2.93611 11.75 3.08333 11.6167 3.21667L2.83333 12H0ZM9.73333 3.2L10.6667 2.26667L9.73333 1.33333L8.8 2.26667L9.73333 3.2Z',
  },
  trash: {
    w: 10.6667,
    h: 12,
    d: 'M2 12C1.63333 12 1.31944 11.8694 1.05833 11.6083C0.797222 11.3472 0.666667 11.0333 0.666667 10.6667V2H0V0.666667H3.33333V0H7.33333V0.666667H10.6667V2H10V10.6667C10 11.0333 9.86944 11.3472 9.60833 11.6083C9.34722 11.8694 9.03333 12 8.66667 12H2ZM8.66667 2H2V10.6667H8.66667V2ZM3.33333 9.33333H4.66667V3.33333H3.33333V9.33333ZM6 9.33333H7.33333V3.33333H6V9.33333Z',
  },
  moveTo: {
    w: 14,
    h: 12,
    d: 'M11.4333 6.66667H3.33333V5.33333H11.4333L10.4 4.3L11.3333 3.33333L14 6L11.3333 8.66667L10.4 7.7L11.4333 6.66667ZM8 4V1.33333H1.33333V10.6667H8V8H9.33333V10.6667C9.33333 11.0333 9.20278 11.3472 8.94167 11.6083C8.68056 11.8694 8.36667 12 8 12H1.33333C0.966667 12 0.652778 11.8694 0.391667 11.6083C0.130556 11.3472 0 11.0333 0 10.6667V1.33333C0 0.966667 0.130556 0.652778 0.391667 0.391667C0.652778 0.130556 0.966667 0 1.33333 0H8C8.36667 0 8.68056 0.130556 8.94167 0.391667C9.20278 0.652778 9.33333 0.966667 9.33333 1.33333V4H8Z',
  },
  chevronRight: {
    w: 10,
    h: 16,
    d: 'M6.21622 8L0 1.86667L1.89189 0L10 8L1.89189 16L0 14.1333L6.21622 8Z',
  },
  // Même chevron, pivoté d'un quart de tour (pas d'export dédié dans Figma).
  chevronDown: {
    w: 16,
    h: 10,
    d: 'M8 6.21622L14.13333 0L16 1.89189L8 10L0 1.89189L1.86667 0L8 6.21622Z',
  },
  categories: {
    w: 15,
    h: 10,
    d: 'M0 10V8.33333H5V10H0ZM0 5.83333V4.16667H10V5.83333H0ZM0 1.66667V0H15V1.66667H0Z',
  },
  calendar: {
    w: 15,
    h: 16.6667,
    d: 'M1.66667 16.6667C1.20833 16.6667 0.815972 16.5035 0.489583 16.1771C0.163194 15.8507 0 15.4583 0 15V3.33333C0 2.875 0.163194 2.48264 0.489583 2.15625C0.815972 1.82986 1.20833 1.66667 1.66667 1.66667H2.5V0H4.16667V1.66667H10.8333V0H12.5V1.66667H13.3333C13.7917 1.66667 14.184 1.82986 14.5104 2.15625C14.8368 2.48264 15 2.875 15 3.33333V15C15 15.4583 14.8368 15.8507 14.5104 16.1771C14.184 16.5035 13.7917 16.6667 13.3333 16.6667H1.66667ZM1.66667 15H13.3333V6.66667H1.66667V15ZM1.66667 5H13.3333V3.33333H1.66667V5Z',
  },
  history: {
    w: 15,
    h: 16.6667,
    d: 'M2.5 16.6667C1.80556 16.6667 1.21528 16.4236 0.729167 15.9375C0.243056 15.4514 0 14.8611 0 14.1667V11.6667H2.5V0H15V14.1667C15 14.8611 14.7569 15.4514 14.2708 15.9375C13.7847 16.4236 13.1944 16.6667 12.5 16.6667H2.5ZM12.5 15C12.7361 15 12.934 14.9201 13.0938 14.7604C13.2535 14.6007 13.3333 14.4028 13.3333 14.1667V1.66667H4.16667V11.6667H11.6667V14.1667C11.6667 14.4028 11.7465 14.6007 11.9062 14.7604C12.066 14.9201 12.2639 15 12.5 15ZM5 5.83333V4.16667H12.5V5.83333H5ZM5 8.33333V6.66667H12.5V8.33333H5ZM2.5 15H10V13.3333H1.66667V14.1667C1.66667 14.4028 1.74653 14.6007 1.90625 14.7604C2.06597 14.9201 2.26389 15 2.5 15ZM2.5 15H1.66667H10H2.5Z',
  },
  // "close" et "check" ne font pas partie des exports fournis : tracés
  // Material 3 (close / check), ramenés à la même échelle 20dp que les autres.
  close: {
    w: 11.6667,
    h: 11.6667,
    d: 'M1.16667 11.66667L0 10.5L4.66667 5.83333L0 1.16667L1.16667 0L5.83333 4.66667L10.5 0L11.66667 1.16667L7 5.83333L11.66667 10.5L10.5 11.66667L5.83333 7L1.16667 11.66667Z',
  },
  check: {
    w: 13.5833,
    h: 10.0208,
    d: 'M4.75 10.02083L0 5.27083L1.1875 4.08333L4.75 7.64583L12.39583 0L13.58333 1.1875L4.75 10.02083Z',
  },
};

/**
 * Icônes du design system, exportées depuis Figma (silhouettes pleines
 * Material 3). Chaque tracé est recentré dans la boîte de 20 et peint avec
 * `color`, ce qui permet de réutiliser la même icône en bleue-500 (actions),
 * bleue-400 (onglet inactif) ou blanc (sur fond bleu).
 */
export function Icon({ name, size = BOX, color = colors.texte }: Props) {
  const glyph = GLYPHS[name];
  // Décaler l'origine de la viewBox recentre l'encre sans transformation.
  const minX = -(BOX - glyph.w) / 2;
  const minY = -(BOX - glyph.h) / 2;

  return (
    <Svg width={size} height={size} viewBox={`${minX} ${minY} ${BOX} ${BOX}`}>
      <Path d={glyph.d} fill={color} />
    </Svg>
  );
}
