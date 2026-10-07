import { CATEGORY_COLORS } from '../../theme/colors';
import { createDemoData } from '../demo';
import { monthOf } from '../dates';
import { allocatedBudget, fixedTotal, monthSummaries, unallocatedBudget } from '../selectors';

const TODAY = '2026-10-07';

describe('données de démo', () => {
  const data = createDemoData(TODAY);

  it('est reproductible pour un même jour', () => {
    expect(createDemoData(TODAY)).toEqual(data);
  });

  it('répartit moins que le budget mensuel', () => {
    expect(allocatedBudget(data)).toBeLessThanOrEqual(data.settings.monthlyBudget);
    expect(unallocatedBudget(data)).toBeGreaterThanOrEqual(0);
    expect(fixedTotal(data)).toBe(44146);
  });

  it('couvre 6 mois avec des économies et des dépassements', () => {
    const summaries = monthSummaries(data, TODAY);
    expect(summaries).toHaveLength(6);
    expect(summaries[0].state).toBe('current');
    const past = summaries.slice(1).map((s) => s.state);
    expect(past).toContain('progress');
    expect(past).toContain('regress');
  });

  it('ne crée aucune dépense dans le futur', () => {
    expect(data.expenses.every((e) => e.date <= TODAY)).toBe(true);
    expect(data.expenses.some((e) => monthOf(e.date) === monthOf(TODAY))).toBe(true);
  });

  it('utilise des montants entiers et des couleurs utilisateur', () => {
    expect(data.expenses.every((e) => Number.isInteger(e.amount) && e.amount > 0)).toBe(true);
    expect(data.categories.every((c) => CATEGORY_COLORS.includes(c.color))).toBe(true);
    const ids = data.expenses.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
