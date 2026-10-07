import {
  allocatedBudget,
  categoryComparison,
  categoryExpenses,
  categoryRemaining,
  categorySpent,
  categoryTone,
  firstDataMonth,
  fixedAnnualCost,
  fixedBreakdown,
  fixedCalendarMarks,
  fixedChargedTotal,
  fixedExpensesByDay,
  fixedExpensesOnDay,
  fixedGroups,
  fixedTotal,
  hasUncategorizedExpenses,
  historyGroups,
  historyMonthTotal,
  isCategoryNameTaken,
  monthSavings,
  monthSpent,
  monthState,
  monthSummaries,
  remainingAfterExpense,
  remainingGlobal,
  savingsChart,
  savingsDelta,
  spendingRatio,
  unallocatedBudget,
  variableSpent,
} from '../selectors';
import { makeData, TODAY } from './fixtures';

const OCT = '2026-10';
const SEP = '2026-09';
const AUG = '2026-08';
const FIXED = 30000 + 899 + 5400;

describe('dépenses fixes', () => {
  it('additionne les montants mensuels', () => {
    expect(fixedTotal(makeData())).toBe(FIXED);
  });

  it('ne compte comme prélevées que les échéances passées du mois courant', () => {
    const data = makeData();
    expect(fixedChargedTotal(data, OCT, TODAY)).toBe(30000);
    expect(fixedChargedTotal(data, OCT, '2026-10-12')).toBe(30899);
    expect(fixedChargedTotal(data, SEP, TODAY)).toBe(FIXED);
    expect(fixedChargedTotal(data, '2026-11', TODAY)).toBe(0);
  });

  it('prélève un « 31 » le dernier jour des mois plus courts', () => {
    const data = makeData();
    expect(fixedCalendarMarks(data, OCT)).toEqual({ 5: 1, 12: 1, 31: 1 });
    expect(fixedCalendarMarks(data, SEP)).toEqual({ 5: 1, 12: 1, 30: 1 });
    expect(fixedCalendarMarks(data, '2026-02')).toEqual({ 5: 1, 12: 1, 28: 1 });
    expect(fixedChargedTotal(data, SEP, '2026-09-30')).toBe(FIXED);
  });

  it('compte plusieurs prélèvements le même jour', () => {
    const data = makeData();
    data.fixedExpenses.push({ id: 'netflix', label: 'Netflix', amount: 1599, dayOfMonth: 12, subcategoryId: 'distractions' });
    expect(fixedCalendarMarks(data, OCT)[12]).toBe(2);
    expect(fixedExpensesOnDay(data, OCT, 12).map((f) => f.id)).toEqual(['netflix', 'sfr']);
  });

  it('trie la liste par jour de prélèvement', () => {
    expect(fixedExpensesByDay(makeData(), OCT).map((f) => f.id)).toEqual(['livret', 'sfr', 'edf']);
  });

  it('regroupe par sous-catégorie en omettant les groupes vides', () => {
    const groups = fixedGroups(makeData());
    expect(groups.map((g) => [g.subcategory.name, g.total])).toEqual([
      ['Épargne', 30000],
      ['Factures', 6299],
    ]);
    expect(fixedBreakdown(makeData())).toEqual([
      { id: 'epargne', label: 'Épargne', amount: 30000 },
      { id: 'factures', label: 'Factures', amount: 6299 },
    ]);
  });

  it('calcule le coût annuel', () => {
    expect(fixedAnnualCost(1599)).toBe(19188);
  });
});

describe('dépenses du mois et restants', () => {
  it('additionne les dépenses variables du mois', () => {
    expect(variableSpent(makeData(), OCT)).toBe(2478 + 180 + 1890 + 1000);
    expect(variableSpent(makeData(), SEP)).toBe(92500);
  });

  it('calcule le restant global : budget − fixes − dépensé variable', () => {
    const data = makeData();
    expect(monthSpent(data, OCT)).toBe(FIXED + 5548);
    expect(remainingGlobal(data, OCT)).toBe(190000 - FIXED - 5548);
  });

  it('calcule le restant d’une catégorie, négatif en cas de dépassement', () => {
    const data = makeData();
    const [courses, restos] = data.categories;
    expect(categorySpent(data, 'courses', OCT)).toBe(2658);
    expect(categoryRemaining(data, courses, OCT)).toBe(50000 - 2658);
    expect(categoryRemaining(data, restos, SEP)).toBe(30000 - 45500);
    expect(categorySpent(data, null, OCT)).toBe(1000);
  });

  it('donne le ton de la jauge d’une catégorie', () => {
    expect(categoryTone(50000, 50000)).toBe('positive');
    expect(categoryTone(50001, 50000)).toBe('negative');
  });

  it('calcule l’impact d’une dépense en cours de saisie', () => {
    expect(remainingAfterExpense(makeData(), 'courses', 1000, OCT)).toBe(50000 - 2658 - 1000);
    expect(remainingAfterExpense(makeData(), 'courses', 60000, OCT)).toBeLessThan(0);
    expect(remainingAfterExpense(makeData(), 'inconnue', 1000, OCT)).toBeNull();
  });

  it('calcule le budget réparti et le reste à répartir', () => {
    const data = makeData();
    expect(allocatedBudget(data)).toBe(50000 + 30000 + FIXED);
    expect(unallocatedBudget(data)).toBe(190000 - 80000 - FIXED);
    data.settings.monthlyBudget = 100000;
    expect(unallocatedBudget(data)).toBeLessThan(0);
  });

  it('gère un budget nul sans division par zéro', () => {
    expect(spendingRatio(0, 0)).toBe(0);
    expect(spendingRatio(100, 0)).toBe(Infinity);
    expect(spendingRatio(25, 100)).toBe(0.25);
  });

  it('trie les dépenses d’une catégorie de la plus récente à la plus ancienne', () => {
    expect(categoryExpenses(makeData(), 'courses').map((e) => e.id)).toEqual(['e2', 'e1', 'e5', 'e7']);
    expect(categoryExpenses(makeData(), null).map((e) => e.id)).toEqual(['e4']);
    expect(hasUncategorizedExpenses(makeData())).toBe(true);
  });
});

describe('évolution', () => {
  it('calcule l’économie d’un mois', () => {
    expect(monthSavings(makeData(), SEP)).toBe(190000 - FIXED - 92500);
  });

  it('commence la liste au premier mois avec des données', () => {
    expect(firstDataMonth(makeData(), TODAY)).toBe(AUG);
    const summaries = monthSummaries(makeData(), TODAY);
    expect(summaries.map((s) => [s.month, s.state])).toEqual([
      [OCT, 'current'],
      [SEP, 'progress'],
      [AUG, 'progress'],
    ]);
    expect(summaries[0].ratio).toBeCloseTo((FIXED + 5548) / 190000);
  });

  it('marque en régression un mois passé en dépassement', () => {
    const data = makeData();
    data.expenses.push({ id: 'big', amount: 150000, label: 'Voyage', categoryId: null, date: '2026-09-28' });
    expect(monthState(data, SEP, TODAY)).toBe('regress');
    expect(monthState(data, OCT, TODAY)).toBe('current');
  });

  it('construit le graphique des 6 derniers mois, mois courant sélectionné', () => {
    const chart = savingsChart(makeData(), TODAY);
    expect(chart.months.map((m) => m.month)).toEqual(['2026-05', '2026-06', '2026-07', AUG, SEP, OCT]);
    expect(chart.months.map((m) => m.selected)).toEqual([false, false, false, false, false, true]);
    expect(chart.total).toBe(chart.months.reduce((total, m) => total + m.value, 0));
    expect(chart.months[4].value).toBe(monthSavings(makeData(), SEP));
  });

  it('compare l’économie au mois précédent', () => {
    const data = makeData();
    expect(savingsDelta(data, OCT)).toBe(monthSavings(data, OCT) - monthSavings(data, SEP));
  });

  it('compare chaque catégorie au mois précédent', () => {
    const rows = categoryComparison(makeData(), OCT);
    expect(rows.map((r) => [r.name, r.amount, r.previous, r.tone])).toEqual([
      ['Courses', 2658, 47000, 'positive'],
      ['Restaurants', 1890, 45500, 'positive'],
      ['Sans catégorie', 1000, 0, 'negative'],
      ['Dépenses fixes', FIXED, FIXED, 'neutral'],
    ]);
    expect(categoryComparison(makeData(), SEP).some((r) => r.key === 'uncategorized')).toBe(false);
  });
});

describe('historique', () => {
  it('groupe par jour, fixes prélevées comprises, du plus récent au plus ancien', () => {
    const groups = historyGroups(makeData(), TODAY);
    expect(groups.map((g) => g.date)).toEqual([
      '2026-10-05',
      '2026-10-04',
      '2026-10-02',
      '2026-10-01',
      '2026-09-20',
      '2026-09-15',
      '2026-08-10',
    ]);
    expect(groups[0].items).toEqual([expect.objectContaining({ kind: 'fixed', date: '2026-10-05' })]);
    expect(groups[1].total).toBe(2658);
    expect(groups[1].items.map((item) => (item.kind === 'expense' ? item.expense.id : item.fixed.id))).toEqual(['e2', 'e1']);
  });

  it('additionne le dépensé du mois, fixes déjà prélevées comprises', () => {
    expect(historyMonthTotal(makeData(), TODAY)).toBe(5548 + 30000);
  });
});

describe('validation', () => {
  it('détecte un nom de catégorie déjà pris, sans tenir compte de la casse', () => {
    const data = makeData();
    expect(isCategoryNameTaken(data, '  courses ')).toBe(true);
    expect(isCategoryNameTaken(data, 'Courses', 'courses')).toBe(false);
    expect(isCategoryNameTaken(data, 'Voyages')).toBe(false);
  });
});
