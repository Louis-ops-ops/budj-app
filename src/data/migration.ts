/**
 * Conversion des données de la v1 (base SQLite « budj-v2.db », montants en
 * euros décimaux, couleurs en paires hexadécimales) vers le modèle v2.
 * Fonction pure : la lecture de la base est dans ./v1Source.
 */
import { CATEGORY_COLORS } from '../theme/colors';
import { createId } from './ids';
import { ensureDefaultSubcategories } from './mutations';
import { isValidDay, type Day } from './dates';
import type { BudjData, Category, CategoryColor, Expense, FixedExpense } from './types';

/** Lignes telles que la v1 les stockait dans SQLite. */
export type V1Data = {
  budgetDefini: number;
  categories: { id: string; name: string; budget: number; color_fond: string; color_texte: string }[];
  fixedSubCategories: { id: string; name: string; budget: number }[];
  fixedExpenses: { id: string; sub_category_id: string; label: string; amount: number; day_of_month: number }[];
  expenses: { id: string; category_id: string; label: string; amount: number; date: string; payment_method?: string | null }[];
};

/** Catégorie fantôme de la v1 qui recueillait les dépenses d'une catégorie supprimée. */
export const V1_UNCATEGORIZED_ID = 'non-categorise';

/** Teintes de la v1 (fond clair ou texte sombre) → couleur v2. */
const V1_COLORS: Record<string, CategoryColor> = {
  '#f2fff1': 'vert',
  '#e5f2e4': 'vert',
  '#116d09': 'vert',
  '#fff1f6': 'mauve',
  '#6d094c': 'mauve',
  '#ffe7d0': 'orange',
  '#6d3d09': 'orange',
  '#6d4309': 'orange',
  '#ffd0d1': 'rouge',
  '#6d090b': 'rouge',
  '#d0f5ff': 'cyan',
  '#09386d': 'cyan',
};

function toCents(euros: number): number {
  return Number.isFinite(euros) ? Math.max(0, Math.round(euros * 100)) : 0;
}

function v1Color(fond: string, texte: string, index: number): CategoryColor {
  return V1_COLORS[texte?.toLowerCase()] ?? V1_COLORS[fond?.toLowerCase()] ?? CATEGORY_COLORS[index % CATEGORY_COLORS.length];
}

/** La v1 contient-elle autre chose que la base vide créée au premier lancement ? */
export function hasV1Content(v1: V1Data): boolean {
  return (
    v1.budgetDefini > 0 ||
    v1.categories.some((category) => category.id !== V1_UNCATEGORIZED_ID) ||
    v1.fixedExpenses.length > 0 ||
    v1.expenses.length > 0
  );
}

export function migrateV1(v1: V1Data, today: Day, newId: (prefix: string) => string = createId): BudjData {
  const realCategories = v1.categories.filter((category) => category.id !== V1_UNCATEGORIZED_ID);
  const categoryIds = new Set(realCategories.map((category) => category.id));

  const expenses: Expense[] = v1.expenses
    .filter((expense) => isValidDay(expense.date))
    .map((expense) => ({
      id: expense.id,
      amount: toCents(expense.amount),
      label: expense.label.trim(),
      categoryId: categoryIds.has(expense.category_id) ? expense.category_id : null,
      date: expense.date,
      ...(expense.payment_method ? { detail: expense.payment_method } : {}),
    }));

  const categories: Category[] = realCategories.map((category, index) => {
    // La v1 ne datait pas ses catégories : on prend leur plus ancienne dépense.
    const firstExpense = expenses
      .filter((expense) => expense.categoryId === category.id)
      .reduce<Day | null>((first, expense) => (first === null || expense.date < first ? expense.date : first), null);
    return {
      id: category.id,
      name: category.name.trim(),
      color: v1Color(category.color_fond, category.color_texte, index),
      monthlyBudget: toCents(category.budget),
      createdAt: firstExpense && firstExpense < today ? firstExpense : today,
    };
  });

  const subcategoryIds = new Set(v1.fixedSubCategories.map((sub) => sub.id));
  const fixedExpenses: FixedExpense[] = v1.fixedExpenses
    .filter((fixed) => subcategoryIds.has(fixed.sub_category_id))
    .map((fixed) => ({
      id: fixed.id,
      label: fixed.label.trim(),
      amount: toCents(fixed.amount),
      dayOfMonth: Math.min(31, Math.max(1, Math.round(fixed.day_of_month) || 1)),
      subcategoryId: fixed.sub_category_id,
    }));

  const data: BudjData = {
    schemaVersion: 2,
    settings: { monthlyBudget: toCents(v1.budgetDefini), theme: 'system' },
    categories,
    fixedSubcategories: v1.fixedSubCategories.map((sub) => ({ id: sub.id, name: sub.name.trim() })),
    fixedExpenses,
    expenses,
  };
  return ensureDefaultSubcategories(data, newId);
}
