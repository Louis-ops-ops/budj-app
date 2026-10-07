import type React from 'react';
import { AddIcon } from './AddIcon';
import { CalendarIcon } from './CalendarIcon';
import { CategoriesIcon } from './CategoriesIcon';
import { ChevronIcon } from './ChevronIcon';
import { ClockIcon } from './ClockIcon';
import { DeleteIcon } from './DeleteIcon';
import { EditIcon } from './EditIcon';
import { HistoryIcon } from './HistoryIcon';
import { MoveIcon } from './MoveIcon';
import { RemoveIcon } from './RemoveIcon';
import { TrendDownIcon } from './TrendDownIcon';
import { TrendUpIcon } from './TrendUpIcon';
import type { IconGlyphProps } from './types';

/** Les 12 icônes du design system (page Figma « Composants », section Icônes). */
export const glyphs = {
  add: AddIcon,
  remove: RemoveIcon,
  chevron: ChevronIcon,
  categories: CategoriesIcon,
  calendar: CalendarIcon,
  history: HistoryIcon,
  delete: DeleteIcon,
  edit: EditIcon,
  move: MoveIcon,
  clock: ClockIcon,
  trendUp: TrendUpIcon,
  trendDown: TrendDownIcon,
} satisfies Record<string, React.ComponentType<IconGlyphProps>>;

export type IconName = keyof typeof glyphs;
export type { IconGlyphProps };
