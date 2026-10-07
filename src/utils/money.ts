/**
 * Formatage des montants (stockés en centimes) pour l'affichage, et lecture
 * de ce que l'utilisateur tape dans les champs montant.
 */

const MINUS = '−';
const NBSP = ' ';

const withCents = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
const withoutCents = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * Intl sépare les milliers et le symbole € par une espace fine insécable
 * (U+202F) que la police Outfit ne contient pas : on la remplace par une
 * espace insécable classique.
 */
function normalizeSpaces(text: string): string {
  return text.replace(/[  ]/g, NBSP);
}

function format(cents: number, compact: boolean): string {
  const euros = Math.abs(cents) / 100;
  const formatter = Number.isInteger(euros) ? withoutCents : withCents;
  let text = normalizeSpaces(formatter.format(euros));
  if (compact) text = text.replace(/\s+€/, '€');
  return cents < 0 ? `${MINUS}${text}` : text;
}

/** « 24,78 € », ou « 600 € » quand le montant tombe rond. */
export function formatMoney(cents: number): string {
  return format(cents, false);
}

/** « 24,78€ » / « 600€ » : variante sans espace, pour les cartes et les listes. */
export function formatMoneyCompact(cents: number): string {
  return format(cents, true);
}

/** « 854€ » : arrondi à l'euro, pour les très gros chiffres (Display). */
export function formatMoneyRounded(cents: number): string {
  return format(Math.round(cents / 100) * 100, true);
}

type SignedOptions = { compact?: boolean; rounded?: boolean };

/** « +220€ », « −140€ » (et « 0€ » sans signe). */
export function formatSignedMoney(cents: number, { compact = true, rounded = false }: SignedOptions = {}): string {
  const value = rounded ? Math.round(cents / 100) * 100 : cents;
  const text = compact ? formatMoneyCompact(value) : formatMoney(value);
  return value > 0 ? `+${text}` : text;
}

/** « −24,78€ » : montant d'une dépense, toujours affiché en négatif. */
export function formatExpenseAmount(cents: number): string {
  return formatMoneyCompact(-Math.abs(cents));
}

/** « 55% » à partir d'un ratio (0,55). */
export function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}

/** « +3% » / « −12% » à partir d'un écart relatif (0,03 / −0,116). */
export function formatSignedPercent(ratio: number): string {
  const value = Math.round(ratio * 100);
  if (value > 0) return `+${value}%`;
  if (value < 0) return `${MINUS}${Math.abs(value)}%`;
  return '0%';
}

/** Nombre maximal de chiffres avant la virgule (999 999,99 €). */
const MAX_INTEGER_DIGITS = 6;

/**
 * Nettoie la saisie d'un montant : chiffres et une seule virgule (le point est
 * converti en virgule), deux décimales au plus, pas de zéros inutiles devant.
 */
export function sanitizeAmountInput(text: string): string {
  const normalized = text.replace(/\./g, ',').replace(/[^\d,]/g, '');
  const [rawInteger, ...rest] = normalized.split(',');
  const integer = rawInteger.replace(/^0+(?=\d)/, '').slice(0, MAX_INTEGER_DIGITS);
  if (rest.length === 0) return integer;
  const decimals = rest.join('').slice(0, 2);
  return `${integer || '0'},${decimals}`;
}

/** Saisie (« 24,78 ») → centimes (2478). Une saisie vide vaut 0. */
export function parseAmountInput(text: string): number {
  const clean = sanitizeAmountInput(text);
  if (!clean) return 0;
  const [integer, decimals = ''] = clean.split(',');
  return Number(integer || '0') * 100 + Number(decimals.padEnd(2, '0'));
}

/** Centimes → texte de saisie (45000 → « 450 », 2478 → « 24,78 », 2470 → « 24,70 »). */
export function centsToInput(cents: number): string {
  const abs = Math.abs(Math.round(cents));
  const integer = Math.floor(abs / 100);
  const decimals = abs % 100;
  return decimals === 0 ? String(integer) : `${integer},${String(decimals).padStart(2, '0')}`;
}

/** Affichage d'une saisie en cours (« 1234,5 » → « 1 234,5 ») sans perdre la virgule tapée. */
export function formatAmountInput(text: string): string {
  const clean = sanitizeAmountInput(text);
  if (!clean) return '';
  const [integer, ...rest] = clean.split(',');
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  return rest.length ? `${grouped},${rest[0]}` : grouped;
}
