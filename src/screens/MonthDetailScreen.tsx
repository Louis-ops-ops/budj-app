import React from 'react';
import { BudgetCard, CategoryCompareRow, TrendBadge, type Tone } from '../components';
import { useBudj } from '../data/BudjContext';
import { addMonths } from '../data/dates';
import { categoryComparison, monthSpent, monthSummary, type MonthState } from '../data/selectors';
import type { RootScreenProps } from '../navigation/types';
import { monthName, monthYearTitle } from '../utils/dateLabels';
import { formatMoneyCompact } from '../utils/money';
import { ScreenLayout } from './ScreenLayout';
import { BackRow, PageTitle, Stack } from './ScreenParts';

const BADGES: Record<MonthState, { tone: Tone; label: string }> = {
  current: { tone: 'neutral', label: 'En cours' },
  progress: { tone: 'positive', label: 'Progression' },
  regress: { tone: 'negative', label: 'Régression' },
};

/**
 * Évolution — Détail d'un mois (Figma 173:710) : budget, dépensé et économie
 * du mois, puis chaque catégorie comparée au mois précédent.
 */
export function MonthDetailScreen({ route }: RootScreenProps<'MonthDetail'>) {
  const { data, today } = useBudj();
  const { month } = route.params;
  const previous = addMonths(month, -1);
  const summary = monthSummary(data, month, today);
  const badge = BADGES[summary.state];

  return (
    <ScreenLayout tab="evolution">
      <BackRow />
      <Stack gap={24}>
        <PageTitle title={monthYearTitle(month)} actions={<TrendBadge tone={badge.tone} label={badge.label} />} />
        <BudgetCard total={data.settings.monthlyBudget} spent={summary.spent} saved={summary.savings} tone={badge.tone} />
      </Stack>

      <Stack gap={24}>
        <PageTitle
          title={`Comparé à ${monthName(previous)}`}
          variant="heading-h2"
          subtitle={[`Dépensé en ${monthName(previous)}`, formatMoneyCompact(monthSpent(data, previous))]}
        />
        <Stack gap={12}>
          {categoryComparison(data, month).map((row) => (
            <CategoryCompareRow
              key={row.key}
              category={{ name: row.name, color: row.color }}
              amount={row.amount}
              previous={row.previous}
              previousMonth={monthName(previous)}
            />
          ))}
        </Stack>
      </Stack>
    </ScreenLayout>
  );
}
