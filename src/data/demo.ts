/**
 * Données de démonstration, générées au premier lancement quand il n'existe
 * ni données v2 ni données v1 à migrer. Elles couvrent les 6 derniers mois
 * (économies et dépassements) pour que chaque écran ait quelque chose à
 * montrer. Le tirage est déterministe : même jour = mêmes données.
 */
import { addMonths, daysInMonth, dayOfMonth, makeDay, monthOf, type Day, type Month } from './dates';
import type { BudjData, Category, CategoryColor, Expense, FixedExpense, FixedSubcategory } from './types';

/** Générateur pseudo-aléatoire « mulberry32 » : reproductible à partir d'une graine. */
function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type CategorySeed = {
  key: string;
  name: string;
  color: CategoryColor;
  budget: number;
  /** Part des dépenses du mois qui tombe dans cette catégorie. */
  weight: number;
  labels: string[];
  /** Fourchette d'une dépense, en centimes. */
  range: [number, number];
};

const CATEGORIES: CategorySeed[] = [
  {
    key: 'courses',
    name: 'Courses',
    color: 'vert',
    budget: 50000,
    weight: 0.4,
    labels: ['Carrefour', 'Monoprix', 'Lidl', 'Picard', 'Carrefour City', 'Marché'],
    range: [800, 9000],
  },
  {
    key: 'restaurants',
    name: 'Restaurants',
    color: 'mauve',
    budget: 30000,
    weight: 0.22,
    labels: ['Kokomo', 'Big Mamma', 'Sushi Shop', 'Boulangerie', 'Pizzeria Napoli'],
    range: [600, 4500],
  },
  {
    key: 'sorties',
    name: 'Sorties',
    color: 'cyan',
    budget: 15000,
    weight: 0.12,
    labels: ['Cinéma UGC', 'Concert', 'Bowling', 'Tournois', 'Musée'],
    range: [800, 4000],
  },
  {
    key: 'shopping',
    name: 'Shopping',
    color: 'orange',
    budget: 15000,
    weight: 0.16,
    labels: ['Zara', 'Decathlon', 'Fnac', 'Uniqlo'],
    range: [1500, 8000],
  },
  {
    key: 'sante',
    name: 'Santé',
    color: 'rouge',
    budget: 8000,
    weight: 0.1,
    labels: ['Pharmacie', 'Médecin', 'Opticien'],
    range: [800, 4500],
  },
];

const SUBCATEGORIES: FixedSubcategory[] = [
  { id: 'demo_sub_epargne', name: 'Épargne' },
  { id: 'demo_sub_factures', name: 'Factures' },
  { id: 'demo_sub_distractions', name: 'Distractions' },
];

const FIXED: Omit<FixedExpense, 'id'>[] = [
  { label: 'Livret A', amount: 30000, dayOfMonth: 5, subcategoryId: 'demo_sub_epargne' },
  { label: 'EDF', amount: 5400, dayOfMonth: 8, subcategoryId: 'demo_sub_factures' },
  { label: 'SFR', amount: 899, dayOfMonth: 12, subcategoryId: 'demo_sub_factures' },
  { label: "Bord'eaux", amount: 1200, dayOfMonth: 16, subcategoryId: 'demo_sub_factures' },
  { label: 'Assurance habitation', amount: 1850, dayOfMonth: 16, subcategoryId: 'demo_sub_factures' },
  { label: 'Netflix', amount: 1599, dayOfMonth: 16, subcategoryId: 'demo_sub_distractions' },
  { label: 'Disney+', amount: 1999, dayOfMonth: 23, subcategoryId: 'demo_sub_distractions' },
  { label: 'Spotify', amount: 1199, dayOfMonth: 23, subcategoryId: 'demo_sub_distractions' },
];

const MONTHLY_BUDGET = 190000;
const PAYMENT_METHODS = ['Carte bancaire', 'Carte bancaire', 'Apple Pay', 'Espèces'];

/**
 * Dépensé variable visé pour chaque mois passé, du plus ancien au plus récent.
 * Avec 1 900 € de budget et 441,46 € de fixes, il reste 1 458,54 € par mois :
 * les mois 2 et 5 dépassent, les autres économisent.
 */
const PAST_MONTH_TARGETS = [128000, 152000, 121000, 135000, 149000];
/** Rythme de dépense du mois en cours, rapporté au nombre de jours écoulés. */
const CURRENT_MONTH_PACE = 130000;

function pick<T>(random: () => number, items: readonly T[]): T {
  return items[Math.floor(random() * items.length)];
}

function pickCategory(random: () => number): CategorySeed {
  let roll = random();
  for (const category of CATEGORIES) {
    roll -= category.weight;
    if (roll <= 0) return category;
  }
  return CATEGORIES[0];
}

function monthExpenses(random: () => number, month: Month, target: number, lastDay: number, nextId: () => string): Expense[] {
  const expenses: Expense[] = [];
  let spent = 0;
  while (spent < target) {
    const category = pickCategory(random);
    const [min, max] = category.range;
    const amount = Math.min(Math.round(min + random() * (max - min)), target - spent);
    if (amount < min / 2) break;
    expenses.push({
      id: nextId(),
      amount,
      label: pick(random, category.labels),
      categoryId: `demo_cat_${category.key}`,
      date: makeDay(month, 1 + Math.floor(random() * lastDay)),
      detail: pick(random, PAYMENT_METHODS),
    });
    spent += amount;
  }
  return expenses.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

export function createDemoData(today: Day): BudjData {
  const current = monthOf(today);
  const firstMonth = addMonths(current, -PAST_MONTH_TARGETS.length);
  const random = seededRandom(Number(current.replace('-', '')));
  let counter = 0;
  const nextId = () => `demo_exp_${++counter}`;

  const categories: Category[] = CATEGORIES.map((category) => ({
    id: `demo_cat_${category.key}`,
    name: category.name,
    color: category.color,
    monthlyBudget: category.budget,
    createdAt: makeDay(firstMonth, 1),
  }));

  const expenses: Expense[] = [];
  PAST_MONTH_TARGETS.forEach((target, index) => {
    const month = addMonths(firstMonth, index);
    expenses.push(...monthExpenses(random, month, target, daysInMonth(month), nextId));
  });
  const elapsed = dayOfMonth(today);
  const currentTarget = Math.round((CURRENT_MONTH_PACE * elapsed) / daysInMonth(current));
  expenses.push(...monthExpenses(random, current, currentTarget, elapsed, nextId));

  return {
    schemaVersion: 2,
    settings: { monthlyBudget: MONTHLY_BUDGET, theme: 'system' },
    categories,
    fixedSubcategories: SUBCATEGORIES,
    fixedExpenses: FIXED.map((fixed, index) => ({ ...fixed, id: `demo_fix_${index + 1}` })),
    expenses,
  };
}

/** Données vides (sans démo), avec les sous-catégories de dépenses fixes par défaut. */
export function createEmptyData(): BudjData {
  return {
    schemaVersion: 2,
    settings: { monthlyBudget: 0, theme: 'system' },
    categories: [],
    fixedSubcategories: SUBCATEGORIES,
    fixedExpenses: [],
    expenses: [],
  };
}
