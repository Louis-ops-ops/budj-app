import { addDays, dayOfMonth, monthIndexOf, monthOf, yearOf, type Day, type Month } from '../data/dates';

const MONTH_NAMES = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
];

/** Abréviations du graphique « Mes économies » (Figma : Févr, Mars, Avr…). */
const MONTH_SHORT_NAMES = ['Janv', 'Févr', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];

/** En-têtes du calendrier, semaine commençant le lundi. */
export const WEEKDAY_INITIALS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'] as const;

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** « juillet » */
export function monthName(month: Month): string {
  return MONTH_NAMES[monthIndexOf(month)];
}

/** « Juillet » */
export function monthTitle(month: Month): string {
  return capitalize(monthName(month));
}

/** « Juillet 2026 » */
export function monthYearTitle(month: Month): string {
  return `${monthTitle(month)} ${yearOf(month)}`;
}

/** « Juil » */
export function monthShortName(month: Month): string {
  return MONTH_SHORT_NAMES[monthIndexOf(month)];
}

/** « 4 août », avec l'année quand elle diffère de celle de `today`. */
export function dayLabel(day: Day, today: Day): string {
  const month = monthOf(day);
  const base = `${dayOfMonth(day)} ${monthName(month)}`;
  return yearOf(month) === yearOf(monthOf(today)) ? base : `${base} ${yearOf(month)}`;
}

/** « Aujourd'hui », « Hier » ou « 4 août ». */
export function relativeDayLabel(day: Day, today: Day): string {
  if (day === today) return "Aujourd'hui";
  if (day === addDays(today, -1)) return 'Hier';
  return dayLabel(day, today);
}
