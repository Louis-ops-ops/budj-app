import React from 'react';
import { View } from 'react-native';
import { MonthRow, SavingsChart, Text, TrendBadge } from '../components';
import { useBudj } from '../data/BudjContext';
import { addMonths, monthOf } from '../data/dates';
import { monthSavings, monthSummaries, savingsChart, savingsDelta } from '../data/selectors';
import type { TabScreenProps } from '../navigation/types';
import { makeStyles } from '../theme';
import { monthName, monthShortName, monthTitle } from '../utils/dateLabels';
import { formatMoney, formatMoneyCompact, formatMoneyRounded, formatSignedMoney } from '../utils/money';
import { ScreenLayout } from './ScreenLayout';
import { PageTitle, Stack } from './ScreenParts';

/**
 * Évolution — Mois par mois (Figma 171:632, 173:855) : économie du mois en
 * cours, écart avec le mois précédent, graphique des 6 derniers mois puis la
 * liste de tous les mois. Le titre reste fixe pendant le défilement.
 */
export function EvolutionScreen({ navigation }: TabScreenProps<'Evolution'>) {
  const styles = useStyles();
  const { data, today } = useBudj();
  const current = monthOf(today);
  const previous = addMonths(current, -1);
  const savings = monthSavings(data, current);
  const delta = savingsDelta(data, current);
  const chart = savingsChart(data, today);

  const header = (
    <PageTitle
      title="Mon évolution"
      subtitle={[`Performance de ${monthName(current)}`, `sur ${formatMoneyCompact(data.settings.monthlyBudget)}`]}
    />
  );

  return (
    <ScreenLayout header={header}>
      <View>
        <Text
          variant="display-l"
          color={savings < 0 ? 'danger' : 'brand'}
          numberOfLines={1}
          adjustsFontSizeToFit
          accessibilityLabel={`${formatMoney(savings)} ${savings < 0 ? 'de dépassement' : 'économisés'} en ${monthName(current)}`}
        >
          {formatMoneyRounded(savings)}
        </Text>
        <TrendBadge
          tone={delta > 0 ? 'positive' : delta < 0 ? 'negative' : 'neutral'}
          label={delta === 0 ? `Stable vs ${monthName(previous)}` : `${formatSignedMoney(delta, { rounded: true })} vs ${monthName(previous)}`}
        />
      </View>

      <SavingsChart
        total={chart.total}
        months={chart.months.map((month) => ({
          key: month.month,
          label: monthShortName(month.month),
          value: month.value,
          selected: month.selected,
        }))}
      />

      <Stack gap={24}>
        <PageTitle title="Mois par mois" />
        <View style={styles.list}>
          {monthSummaries(data, today).map((summary) => (
            <MonthRow
              key={summary.month}
              month={monthTitle(summary.month)}
              spent={summary.spent}
              result={summary.savings}
              state={summary.state}
              ratio={summary.ratio}
              onPress={() => navigation.navigate('MonthDetail', { month: summary.month })}
            />
          ))}
        </View>
      </Stack>
    </ScreenLayout>
  );
}

const useStyles = makeStyles((t) => ({
  list: {
    gap: t.spacing[12],
  },
}));
