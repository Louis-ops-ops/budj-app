import * as mutations from '../mutations';
import { categorySpent } from '../selectors';
import { makeData } from './fixtures';

describe('mutations', () => {
  it('ajoute plusieurs dépenses d’un coup, en centimes entiers', () => {
    const data = mutations.addExpenses(makeData(), [
      { id: 'a', amount: 1234.4, label: '  Picard  ', categoryId: 'courses', date: '2026-10-07' },
      { id: 'b', amount: 500, label: 'Pharmacie', categoryId: null, date: '2026-10-07' },
    ]);
    expect(data.expenses.slice(-2)).toEqual([
      expect.objectContaining({ id: 'a', amount: 1234, label: 'Picard' }),
      expect.objectContaining({ id: 'b', amount: 500, categoryId: null }),
    ]);
  });

  it('ne modifie pas les données d’origine', () => {
    const original = makeData();
    mutations.deleteExpense(original, 'e1');
    expect(original.expenses).toHaveLength(7);
  });

  it('déplace plusieurs dépenses vers une catégorie', () => {
    const data = mutations.moveExpenses(makeData(), ['e1', 'e2'], 'restos');
    expect(categorySpent(data, 'restos', '2026-10')).toBe(1890 + 2478 + 180);
    expect(categorySpent(data, 'courses', '2026-10')).toBe(0);
  });

  it('fait passer les dépenses d’une catégorie supprimée en « Sans catégorie »', () => {
    const data = mutations.deleteCategory(makeData(), 'courses');
    expect(data.categories.map((c) => c.id)).toEqual(['restos']);
    expect(data.expenses.filter((e) => e.categoryId === null).map((e) => e.id)).toEqual(['e1', 'e2', 'e4', 'e5', 'e7']);
  });

  it('modifie le budget d’une catégorie et le budget mensuel', () => {
    let data = mutations.updateCategoryBudget(makeData(), 'courses', 45000);
    data = mutations.setMonthlyBudget(data, 200000);
    expect(data.categories[0].monthlyBudget).toBe(45000);
    expect(data.settings.monthlyBudget).toBe(200000);
    expect(mutations.setMonthlyBudget(data, -10).settings.monthlyBudget).toBe(0);
  });

  it('ajoute, modifie et supprime une dépense fixe', () => {
    let data = mutations.addFixedExpense(makeData(), {
      id: 'netflix',
      label: 'Netflix',
      amount: 1599,
      dayOfMonth: 40,
      subcategoryId: 'distractions',
    });
    expect(data.fixedExpenses.at(-1)).toEqual(expect.objectContaining({ id: 'netflix', dayOfMonth: 31 }));
    data = mutations.updateFixedExpense(data, 'netflix', { amount: 1799, dayOfMonth: 12 });
    expect(data.fixedExpenses.at(-1)).toEqual(expect.objectContaining({ amount: 1799, dayOfMonth: 12, label: 'Netflix' }));
    data = mutations.deleteFixedExpense(data, 'netflix');
    expect(data.fixedExpenses.map((f) => f.id)).toEqual(['livret', 'sfr', 'edf']);
  });

  it('retrouve une sous-catégorie par son nom et complète celles par défaut', () => {
    const data = makeData();
    expect(mutations.findFixedSubcategoryByName(data, ' factures ')?.id).toBe('factures');
    const reduced = { ...data, fixedSubcategories: [{ id: 'logement', name: 'Logement' }] };
    let next = 0;
    const completed = mutations.ensureDefaultSubcategories(reduced, () => `new_${++next}`);
    expect(completed.fixedSubcategories.map((s) => s.name)).toEqual(['Logement', 'Épargne', 'Factures', 'Distractions']);
    expect(mutations.ensureDefaultSubcategories(completed, () => 'jamais')).toBe(completed);
  });

  it('enregistre le réglage de thème', () => {
    expect(mutations.setTheme(makeData(), 'dark').settings.theme).toBe('dark');
  });
});
