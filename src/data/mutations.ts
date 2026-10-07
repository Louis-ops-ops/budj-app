/**
 * Transitions d'état pures : chaque fonction renvoie une nouvelle version des
 * données sans modifier l'ancienne. Le contexte (BudjContext) les applique ;
 * les tests les appellent directement.
 */
import { normalizeName } from './selectors';
import {
  DEFAULT_FIXED_SUBCATEGORIES,
  type BudjData,
  type Category,
  type Expense,
  type FixedExpense,
  type FixedSubcategory,
  type ThemePreference,
} from './types';

/** Montant en centimes : entier, jamais négatif. */
function cents(amount: number): number {
  return Number.isFinite(amount) ? Math.max(0, Math.round(amount)) : 0;
}

function clampDay(day: number): number {
  return Math.min(31, Math.max(1, Math.round(day)));
}

export function addExpenses(data: BudjData, expenses: Expense[]): BudjData {
  const added = expenses.map((expense) => ({ ...expense, amount: cents(expense.amount), label: normalizeName(expense.label) }));
  return { ...data, expenses: [...data.expenses, ...added] };
}

export function moveExpenses(data: BudjData, ids: string[], categoryId: string | null): BudjData {
  const moved = new Set(ids);
  return {
    ...data,
    expenses: data.expenses.map((expense) => (moved.has(expense.id) ? { ...expense, categoryId } : expense)),
  };
}

export function deleteExpense(data: BudjData, id: string): BudjData {
  return { ...data, expenses: data.expenses.filter((expense) => expense.id !== id) };
}

export function addCategory(data: BudjData, category: Category): BudjData {
  const created = { ...category, name: normalizeName(category.name), monthlyBudget: cents(category.monthlyBudget) };
  return { ...data, categories: [...data.categories, created] };
}

export function updateCategoryBudget(data: BudjData, id: string, monthlyBudget: number): BudjData {
  return {
    ...data,
    categories: data.categories.map((category) =>
      category.id === id ? { ...category, monthlyBudget: cents(monthlyBudget) } : category,
    ),
  };
}

/** Supprime une catégorie ; ses dépenses passent en « Sans catégorie ». */
export function deleteCategory(data: BudjData, id: string): BudjData {
  return {
    ...data,
    categories: data.categories.filter((category) => category.id !== id),
    expenses: data.expenses.map((expense) => (expense.categoryId === id ? { ...expense, categoryId: null } : expense)),
  };
}

export function addFixedExpense(data: BudjData, fixed: FixedExpense): BudjData {
  const created = { ...fixed, label: normalizeName(fixed.label), amount: cents(fixed.amount), dayOfMonth: clampDay(fixed.dayOfMonth) };
  return { ...data, fixedExpenses: [...data.fixedExpenses, created] };
}

export function updateFixedExpense(data: BudjData, id: string, patch: Partial<Omit<FixedExpense, 'id'>>): BudjData {
  return {
    ...data,
    fixedExpenses: data.fixedExpenses.map((fixed) => {
      if (fixed.id !== id) return fixed;
      const next = { ...fixed, ...patch };
      return { ...next, label: normalizeName(next.label), amount: cents(next.amount), dayOfMonth: clampDay(next.dayOfMonth) };
    }),
  };
}

export function deleteFixedExpense(data: BudjData, id: string): BudjData {
  return { ...data, fixedExpenses: data.fixedExpenses.filter((fixed) => fixed.id !== id) };
}

export function addFixedSubcategory(data: BudjData, subcategory: FixedSubcategory): BudjData {
  return {
    ...data,
    fixedSubcategories: [...data.fixedSubcategories, { ...subcategory, name: normalizeName(subcategory.name) }],
  };
}

/** Sous-catégorie existante portant ce nom (sans tenir compte de la casse). */
export function findFixedSubcategoryByName(data: BudjData, name: string): FixedSubcategory | undefined {
  const wanted = normalizeName(name).toLocaleLowerCase('fr');
  return data.fixedSubcategories.find((sub) => normalizeName(sub.name).toLocaleLowerCase('fr') === wanted);
}

/** Ajoute Épargne, Factures et Distractions si elles manquent. */
export function ensureDefaultSubcategories(data: BudjData, createId: (prefix: string) => string): BudjData {
  let next = data;
  for (const name of DEFAULT_FIXED_SUBCATEGORIES) {
    if (!findFixedSubcategoryByName(next, name)) next = addFixedSubcategory(next, { id: createId('sub'), name });
  }
  return next;
}

export function setMonthlyBudget(data: BudjData, amount: number): BudjData {
  return { ...data, settings: { ...data.settings, monthlyBudget: cents(amount) } };
}

export function setTheme(data: BudjData, theme: ThemePreference): BudjData {
  return { ...data, settings: { ...data.settings, theme } };
}
