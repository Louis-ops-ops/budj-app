/**
 * Dates manipulées comme des chaînes : `YYYY-MM-DD` pour un jour, `YYYY-MM`
 * pour un mois. Aucune Date n'est stockée ; ces fonctions pures servent aux
 * sélecteurs et aux composants (calendrier, sélecteur de jour).
 */
export type Day = string;
export type Month = string;

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

/** Jour local (et non UTC, contrairement à toISOString) d'une Date. */
export function toDay(date: Date): Day {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayDay(): Day {
  return toDay(new Date());
}

export function monthOf(day: Day): Month {
  return day.slice(0, 7);
}

export function dayOfMonth(day: Day): number {
  return Number(day.slice(8, 10));
}

function splitMonth(month: Month): { year: number; index: number } {
  return { year: Number(month.slice(0, 4)), index: Number(month.slice(5, 7)) - 1 };
}

export function makeMonth(year: number, monthIndex: number): Month {
  const date = new Date(year, monthIndex, 1);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

export function makeDay(month: Month, day: number): Day {
  return `${month}-${pad(day)}`;
}

export function addMonths(month: Month, delta: number): Month {
  const { year, index } = splitMonth(month);
  return makeMonth(year, index + delta);
}

export function addDays(day: Day, delta: number): Day {
  const { year, index } = splitMonth(monthOf(day));
  return toDay(new Date(year, index, dayOfMonth(day) + delta));
}

export function daysInMonth(month: Month): number {
  const { year, index } = splitMonth(month);
  return new Date(year, index + 1, 0).getDate();
}

/** Position du 1er du mois dans la semaine, lundi = 0 … dimanche = 6. */
export function firstWeekdayOfMonth(month: Month): number {
  const { year, index } = splitMonth(month);
  return (new Date(year, index, 1).getDay() + 6) % 7;
}

export function yearOf(month: Month): number {
  return splitMonth(month).year;
}

/** Index du mois dans l'année, janvier = 0. */
export function monthIndexOf(month: Month): number {
  return splitMonth(month).index;
}

/** Mois de `from` à `to` inclus, du plus ancien au plus récent (vide si from > to). */
export function monthsBetween(from: Month, to: Month): Month[] {
  const months: Month[] = [];
  for (let month = from; month <= to; month = addMonths(month, 1)) months.push(month);
  return months;
}

/** Jour effectif d'un prélèvement mensuel : le 31 devient le 30 en avril, le 28/29 en février. */
export function effectiveDayOfMonth(dayOfMonthValue: number, month: Month): number {
  return Math.min(Math.max(1, dayOfMonthValue), daysInMonth(month));
}

export function isValidDay(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const month = monthOf(value);
  const day = dayOfMonth(value);
  return Number(value.slice(5, 7)) >= 1 && Number(value.slice(5, 7)) <= 12 && day >= 1 && day <= daysInMonth(month);
}
