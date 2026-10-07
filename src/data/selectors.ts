/**
 * Calculs de l'app, en fonctions pures (testées sans UI). Les écrans
 * n'additionnent rien eux-mêmes : ils appellent ces sélecteurs avec le mois
 * voulu (`YYYY-MM`) et le jour courant.
 */
import type { CategoryTone } from '../theme/colors';
import {
  addMonths,
  dayOfMonth,
  effectiveDayOfMonth,
  makeDay,
  monthOf,
  monthsBetween,
  type Day,
  type Month,
} from './dates';
import { UNCATEGORIZED_LABEL, type BudjData, type Category, type Expense, type FixedExpense, type FixedSubcategory } from './types';

export type Tone = 'positive' | 'negative' | 'neutral';

function sum(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

// --- Dépenses fixes -------------------------------------------------------

/** Total mensuel des dépenses fixes (engagées en totalité dès le 1er du mois). */
export function fixedTotal(data: BudjData): number {
  return sum(data.fixedExpenses.map((fixed) => fixed.amount));
}

/** Jour où une dépense fixe est prélevée dans un mois donné (le 31 devient le 30 en avril). */
export function fixedChargeDay(fixed: FixedExpense, month: Month): Day {
  return makeDay(month, effectiveDayOfMonth(fixed.dayOfMonth, month));
}

/** Dépense fixe déjà prélevée : oui pour un mois passé, non pour un mois futur, selon le jour sinon. */
export function isFixedCharged(fixed: FixedExpense, month: Month, today: Day): boolean {
  const current = monthOf(today);
  if (month < current) return true;
  if (month > current) return false;
  return effectiveDayOfMonth(fixed.dayOfMonth, month) <= dayOfMonth(today);
}

/** Total des dépenses fixes déjà prélevées dans le mois (« Dépensé » de l'écran Dépenses fixes). */
export function fixedChargedTotal(data: BudjData, month: Month, today: Day): number {
  return sum(data.fixedExpenses.filter((fixed) => isFixedCharged(fixed, month, today)).map((fixed) => fixed.amount));
}

/** Coût annuel d'une dépense fixe. */
export function fixedAnnualCost(amount: number): number {
  return amount * 12;
}

/** Nombre de prélèvements par jour du mois, pour le calendrier des dépenses fixes. */
export function fixedCalendarMarks(data: BudjData, month: Month): Record<number, number> {
  const marks: Record<number, number> = {};
  for (const fixed of data.fixedExpenses) {
    const day = effectiveDayOfMonth(fixed.dayOfMonth, month);
    marks[day] = (marks[day] ?? 0) + 1;
  }
  return marks;
}

const byLabel = (a: { label: string }, b: { label: string }) => a.label.localeCompare(b.label, 'fr');

/** Dépenses fixes du mois triées par jour de prélèvement. */
export function fixedExpensesByDay(data: BudjData, month: Month): FixedExpense[] {
  return [...data.fixedExpenses].sort(
    (a, b) => effectiveDayOfMonth(a.dayOfMonth, month) - effectiveDayOfMonth(b.dayOfMonth, month) || byLabel(a, b),
  );
}

/** Dépenses fixes prélevées un jour précis du mois. */
export function fixedExpensesOnDay(data: BudjData, month: Month, day: number): FixedExpense[] {
  return data.fixedExpenses.filter((fixed) => effectiveDayOfMonth(fixed.dayOfMonth, month) === day).sort(byLabel);
}

export type FixedGroup = { subcategory: FixedSubcategory; items: FixedExpense[]; total: number };

/** Dépenses fixes regroupées par sous-catégorie (groupes vides omis). */
export function fixedGroups(data: BudjData): FixedGroup[] {
  const known = new Set(data.fixedSubcategories.map((sub) => sub.id));
  const groups: FixedGroup[] = data.fixedSubcategories.map((subcategory) => {
    const items = data.fixedExpenses.filter((fixed) => fixed.subcategoryId === subcategory.id).sort(byLabel);
    return { subcategory, items, total: sum(items.map((fixed) => fixed.amount)) };
  });
  const orphans = data.fixedExpenses.filter((fixed) => !known.has(fixed.subcategoryId)).sort(byLabel);
  if (orphans.length > 0) {
    groups.push({ subcategory: { id: '', name: 'Autres' }, items: orphans, total: sum(orphans.map((fixed) => fixed.amount)) });
  }
  return groups.filter((group) => group.items.length > 0);
}

/** Lignes de la carte « Dépenses fixes » de l'accueil : total par sous-catégorie. */
export function fixedBreakdown(data: BudjData): { id: string; label: string; amount: number }[] {
  return fixedGroups(data).map((group) => ({ id: group.subcategory.id || 'autres', label: group.subcategory.name, amount: group.total }));
}

// --- Dépenses variables ---------------------------------------------------

export function expensesOfMonth(data: BudjData, month: Month): Expense[] {
  return data.expenses.filter((expense) => monthOf(expense.date) === month);
}

/** Dépensé variable du mois (hors dépenses fixes). */
export function variableSpent(data: BudjData, month: Month): number {
  return sum(expensesOfMonth(data, month).map((expense) => expense.amount));
}

/** Dépensé du mois dans une catégorie (`null` = Sans catégorie). */
export function categorySpent(data: BudjData, categoryId: string | null, month: Month): number {
  return sum(
    expensesOfMonth(data, month)
      .filter((expense) => expense.categoryId === categoryId)
      .map((expense) => expense.amount),
  );
}

/** Restant d'une catégorie ; négatif = dépassement. */
export function categoryRemaining(data: BudjData, category: Category, month: Month): number {
  return category.monthlyBudget - categorySpent(data, category.id, month);
}

/** Jauge d'une catégorie : positive tant que le budget n'est pas dépassé. */
export function categoryTone(spent: number, budget: number): Tone {
  return spent <= budget ? 'positive' : 'negative';
}

/** Dépenses d'une catégorie, de la plus récente à la plus ancienne. */
export function categoryExpenses(data: BudjData, categoryId: string | null): Expense[] {
  return sortNewestFirst(data.expenses.filter((expense) => expense.categoryId === categoryId));
}

export function hasUncategorizedExpenses(data: BudjData): boolean {
  return data.expenses.some((expense) => expense.categoryId === null);
}

/** Tri par date décroissante ; à date égale, la dernière saisie d'abord. */
function sortNewestFirst(expenses: Expense[]): Expense[] {
  return expenses
    .map((expense, index) => ({ expense, index }))
    .sort((a, b) => (a.expense.date === b.expense.date ? b.index - a.index : a.expense.date < b.expense.date ? 1 : -1))
    .map(({ expense }) => expense);
}

// --- Budget global ----------------------------------------------------------

/** Total dépensé dans le mois : dépenses fixes (en totalité) + dépenses variables. */
export function monthSpent(data: BudjData, month: Month): number {
  return fixedTotal(data) + variableSpent(data, month);
}

/** Restant global (gros chiffre de l'accueil) = budget − fixes − dépensé variable. */
export function remainingGlobal(data: BudjData, month: Month): number {
  return data.settings.monthlyBudget - monthSpent(data, month);
}

/** Économie d'un mois : positive = économie, négative = dépassement. */
export function monthSavings(data: BudjData, month: Month): number {
  return remainingGlobal(data, month);
}

/** Dépensé ÷ budget (infini si l'on dépense sans budget). */
export function spendingRatio(spent: number, budget: number): number {
  if (budget > 0) return spent / budget;
  return spent > 0 ? Infinity : 0;
}

/** Budget réparti = budgets des catégories + total des dépenses fixes. */
export function allocatedBudget(data: BudjData): number {
  return sum(data.categories.map((category) => category.monthlyBudget)) + fixedTotal(data);
}

/** Reste à répartir (négatif = on a promis plus que le budget mensuel). */
export function unallocatedBudget(data: BudjData): number {
  return data.settings.monthlyBudget - allocatedBudget(data);
}

/** Restant d'une catégorie après une dépense en cours de saisie (pop-up d'ajout). */
export function remainingAfterExpense(data: BudjData, categoryId: string, amount: number, month: Month): number | null {
  const category = findCategory(data, categoryId);
  if (!category) return null;
  return categoryRemaining(data, category, month) - amount;
}

// --- Évolution -------------------------------------------------------------

/** Premier mois avec des données (dépense ou catégorie), sans dépasser le mois courant. */
export function firstDataMonth(data: BudjData, today: Day): Month {
  const current = monthOf(today);
  const months = [
    ...data.expenses.map((expense) => monthOf(expense.date)),
    ...data.categories.map((category) => monthOf(category.createdAt)),
  ].filter((month) => month <= current);
  return months.reduce((first, month) => (month < first ? month : first), current);
}

export type MonthState = 'current' | 'progress' | 'regress';

/** Mois courant → en cours ; mois passé → progression si économie ≥ 0, régression sinon. */
export function monthState(data: BudjData, month: Month, today: Day): MonthState {
  if (month >= monthOf(today)) return 'current';
  return monthSavings(data, month) >= 0 ? 'progress' : 'regress';
}

export type MonthSummary = {
  month: Month;
  spent: number;
  /** Économie du mois (restant pour le mois en cours). */
  savings: number;
  state: MonthState;
  ratio: number;
};

export function monthSummary(data: BudjData, month: Month, today: Day): MonthSummary {
  const spent = monthSpent(data, month);
  return {
    month,
    spent,
    savings: monthSavings(data, month),
    state: monthState(data, month, today),
    ratio: spendingRatio(spent, data.settings.monthlyBudget),
  };
}

/** Liste « Mois par mois », du mois courant au premier mois avec des données. */
export function monthSummaries(data: BudjData, today: Day): MonthSummary[] {
  return monthsBetween(firstDataMonth(data, today), monthOf(today))
    .reverse()
    .map((month) => monthSummary(data, month, today));
}

export type ChartMonth = { month: Month; value: number; selected: boolean };

/** Graphique « Mes économies » : les `count` derniers mois, le mois courant sélectionné. */
export function savingsChart(data: BudjData, today: Day, count = 6): { months: ChartMonth[]; total: number } {
  const current = monthOf(today);
  const months = monthsBetween(addMonths(current, -(count - 1)), current).map((month) => ({
    month,
    value: monthSavings(data, month),
    selected: month === current,
  }));
  return { months, total: sum(months.map((month) => month.value)) };
}

/** Écart d'économie avec le mois précédent (badge « vs mois précédent »). */
export function savingsDelta(data: BudjData, month: Month): number {
  return monthSavings(data, month) - monthSavings(data, addMonths(month, -1));
}

// --- Détail d'un mois ------------------------------------------------------

export type ComparisonRow = {
  key: string;
  name: string;
  color: CategoryTone;
  amount: number;
  previous: number;
  delta: number;
  tone: Tone;
};

/** Badge de comparaison : dépenser moins que le mois précédent est positif. */
export function comparisonTone(delta: number): Tone {
  if (delta < 0) return 'positive';
  if (delta > 0) return 'negative';
  return 'neutral';
}

function comparisonRow(key: string, name: string, color: CategoryTone, amount: number, previous: number): ComparisonRow {
  const delta = amount - previous;
  return { key, name, color, amount, previous, delta, tone: comparisonTone(delta) };
}

/** Chaque catégorie comparée au mois précédent, puis Sans catégorie (s'il y a lieu) et les dépenses fixes. */
export function categoryComparison(data: BudjData, month: Month): ComparisonRow[] {
  const previousMonth = addMonths(month, -1);
  const rows = data.categories.map((category) =>
    comparisonRow(
      category.id,
      category.name,
      category.color,
      categorySpent(data, category.id, month),
      categorySpent(data, category.id, previousMonth),
    ),
  );
  const uncategorized = comparisonRow(
    'uncategorized',
    UNCATEGORIZED_LABEL,
    'neutre',
    categorySpent(data, null, month),
    categorySpent(data, null, previousMonth),
  );
  if (uncategorized.amount !== 0 || uncategorized.previous !== 0) rows.push(uncategorized);
  const fixed = fixedTotal(data);
  rows.push(comparisonRow('fixed', 'Dépenses fixes', 'bleu', fixed, fixed));
  return rows;
}

// --- Historique -------------------------------------------------------------

export type HistoryItem =
  | { kind: 'expense'; key: string; expense: Expense }
  | { kind: 'fixed'; key: string; fixed: FixedExpense; date: Day };

export type HistoryGroup = { date: Day; total: number; items: HistoryItem[] };

/**
 * Historique groupé par jour (du plus récent au plus ancien) : toutes les
 * dépenses, plus les dépenses fixes déjà prélevées ce mois-ci.
 */
export function historyGroups(data: BudjData, today: Day): HistoryGroup[] {
  const month = monthOf(today);
  const items: { date: Day; item: HistoryItem; amount: number }[] = [];
  for (const fixed of data.fixedExpenses) {
    if (!isFixedCharged(fixed, month, today)) continue;
    const date = fixedChargeDay(fixed, month);
    items.push({ date, amount: fixed.amount, item: { kind: 'fixed', key: `fixed-${fixed.id}`, fixed, date } });
  }
  for (const expense of sortNewestFirst(data.expenses)) {
    items.push({ date: expense.date, amount: expense.amount, item: { kind: 'expense', key: expense.id, expense } });
  }

  const groups = new Map<Day, HistoryGroup>();
  for (const { date, item, amount } of items) {
    const group = groups.get(date) ?? { date, total: 0, items: [] };
    group.items.push(item);
    group.total += amount;
    groups.set(date, group);
  }
  return [...groups.values()].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/** « Dépensé ce mois-ci » de l'historique : dépenses du mois + dépenses fixes déjà prélevées. */
export function historyMonthTotal(data: BudjData, today: Day): number {
  const month = monthOf(today);
  return variableSpent(data, month) + fixedChargedTotal(data, month, today);
}

// --- Recherche et validation --------------------------------------------------

export function findCategory(data: BudjData, id: string | null | undefined): Category | undefined {
  return id ? data.categories.find((category) => category.id === id) : undefined;
}

/** Nom nettoyé : espaces en trop retirés. */
export function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

/** Un autre élément porte-t-il déjà ce nom (sans tenir compte de la casse) ? */
export function isCategoryNameTaken(data: BudjData, name: string, exceptId?: string): boolean {
  const wanted = normalizeName(name).toLocaleLowerCase('fr');
  return data.categories.some(
    (category) => category.id !== exceptId && normalizeName(category.name).toLocaleLowerCase('fr') === wanted,
  );
}
