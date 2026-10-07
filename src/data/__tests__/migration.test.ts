import { hasV1Content, migrateV1, V1_UNCATEGORIZED_ID, type V1Data } from '../migration';

const TODAY = '2026-10-07';

function v1(): V1Data {
  return {
    budgetDefini: 1900,
    categories: [
      { id: 'cat_1', name: 'Courses ', budget: 500, color_fond: '#F2FFF1', color_texte: '#116D09' },
      { id: 'cat_2', name: 'Sorties', budget: 199.99, color_fond: '#D0F5FF', color_texte: '#09386D' },
      { id: 'cat_3', name: 'Shopping', budget: 150, color_fond: '#FFE7D0', color_texte: '#6D3D09' },
      { id: V1_UNCATEGORIZED_ID, name: 'Non catégorisé', budget: 0, color_fond: '#EDEDED', color_texte: '#6B6B6B' },
    ],
    fixedSubCategories: [
      { id: 'fsc_1', name: 'Distractions', budget: 60 },
      { id: 'fsc_2', name: 'Logement', budget: 700 },
    ],
    fixedExpenses: [
      { id: 'fx_1', sub_category_id: 'fsc_1', label: 'Netflix', amount: 15.99, day_of_month: 16 },
      { id: 'fx_2', sub_category_id: 'fsc_2', label: 'Loyer', amount: 650, day_of_month: 0 },
      { id: 'fx_3', sub_category_id: 'fsc_inconnue', label: 'Orpheline', amount: 1, day_of_month: 3 },
    ],
    expenses: [
      { id: 'ex_1', category_id: 'cat_1', label: 'Carrefour', amount: 24.78, date: '2026-08-04', payment_method: 'Carte bancaire' },
      { id: 'ex_2', category_id: V1_UNCATEGORIZED_ID, label: 'Kokomo', amount: 18.9, date: '2026-09-02', payment_method: 'Apple pay' },
      { id: 'ex_3', category_id: 'cat_2', label: 'Cinéma', amount: 0.1 + 0.2, date: '2026-10-01', payment_method: null },
      { id: 'ex_4', category_id: 'cat_1', label: 'Date cassée', amount: 5, date: '04/08/2026' },
    ],
  };
}

describe('migration v1 → v2', () => {
  const data = migrateV1(v1(), TODAY, (prefix) => `${prefix}_test`);

  it('convertit les montants en centimes entiers', () => {
    expect(data.settings.monthlyBudget).toBe(190000);
    expect(data.categories.find((c) => c.id === 'cat_2')?.monthlyBudget).toBe(19999);
    expect(data.fixedExpenses.find((f) => f.id === 'fx_1')?.amount).toBe(1599);
    expect(data.expenses.find((e) => e.id === 'ex_1')?.amount).toBe(2478);
    expect(data.expenses.find((e) => e.id === 'ex_3')?.amount).toBe(30);
  });

  it('associe les paires de couleurs v1 aux couleurs v2', () => {
    expect(data.categories.map((c) => [c.name, c.color])).toEqual([
      ['Courses', 'vert'],
      ['Sorties', 'cyan'],
      ['Shopping', 'orange'],
    ]);
  });

  it('remplace la catégorie fantôme « Non catégorisé » par Sans catégorie', () => {
    expect(data.categories.some((c) => c.id === V1_UNCATEGORIZED_ID)).toBe(false);
    expect(data.expenses.find((e) => e.id === 'ex_2')?.categoryId).toBeNull();
  });

  it('garde le moyen de paiement comme détail', () => {
    expect(data.expenses.find((e) => e.id === 'ex_1')?.detail).toBe('Carte bancaire');
    expect(data.expenses.find((e) => e.id === 'ex_3')).not.toHaveProperty('detail');
  });

  it('écarte les lignes inexploitables', () => {
    expect(data.expenses.some((e) => e.id === 'ex_4')).toBe(false);
    expect(data.fixedExpenses.some((f) => f.id === 'fx_3')).toBe(false);
    expect(data.fixedExpenses.find((f) => f.id === 'fx_2')?.dayOfMonth).toBe(1);
  });

  it('date les catégories de leur plus ancienne dépense', () => {
    expect(data.categories.find((c) => c.id === 'cat_1')?.createdAt).toBe('2026-08-04');
    expect(data.categories.find((c) => c.id === 'cat_3')?.createdAt).toBe(TODAY);
  });

  it('conserve les sous-catégories et ajoute celles par défaut', () => {
    expect(data.fixedSubcategories.map((s) => s.name)).toEqual(['Distractions', 'Logement', 'Épargne', 'Factures']);
  });

  it('reconnaît une base v1 vide', () => {
    const empty: V1Data = { budgetDefini: 0, categories: [v1().categories[3]], fixedSubCategories: [], fixedExpenses: [], expenses: [] };
    expect(hasV1Content(empty)).toBe(false);
    expect(hasV1Content(v1())).toBe(true);
  });
});
