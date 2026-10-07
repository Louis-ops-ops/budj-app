import React from 'react';
import { View } from 'react-native';
import { makeStyles, useTheme } from '../theme';
import { formatSignedMoney } from '../utils/money';
import { Text } from './Text';

export type SavingsChartMonth = {
  key: string;
  /** Mois abrégé (« Juil »). */
  label: string;
  /** Économie du mois en centimes (négatif = dépassement). */
  value: number;
  selected: boolean;
};

type Props = {
  months: SavingsChartMonth[];
  /** Somme des économies des mois affichés, en centimes. */
  total: number;
  title?: string;
};

/**
 * Graphique « Mes économies » (Figma 198:224). Hauteur d'une barre =
 * |valeur| ÷ max(|valeurs|) × 52 (2 minimum) ; les économies montent au-dessus
 * de l'axe, les dépassements descendent en dessous.
 */
export function SavingsChart({ months, total, title = 'Mes économies' }: Props) {
  const styles = useStyles();
  const { sizes } = useTheme();
  const maxAbs = Math.max(0, ...months.map((m) => Math.abs(m.value)));
  const barHeight = (value: number) =>
    maxAbs === 0 ? sizes.chart.barMin : Math.max(sizes.chart.barMin, (Math.abs(value) / maxAbs) * sizes.chart.barMax);
  const totalIsPositive = total >= 0;

  return (
    <View style={[styles.card, totalIsPositive ? styles.cardPositive : styles.cardNegative]}>
      <View style={styles.titleRow}>
        <Text variant="heading-h3">{title}</Text>
        <Text variant="label-medium" color={totalIsPositive ? 'success' : 'danger'}>
          {`${formatSignedMoney(total, { rounded: true })} sur ${months.length} mois`}
        </Text>
      </View>

      <View style={styles.chart}>
        {months.map((month) => {
          const positive = month.value >= 0;
          const valueText = formatSignedMoney(month.value, { rounded: true });
          const valueLabel = (
            <Text
              variant={month.selected ? 'label-medium' : 'caption-medium'}
              color={month.selected ? (positive ? 'success' : 'danger') : 'secondary'}
              numberOfLines={1}
            >
              {valueText}
            </Text>
          );
          const bar = (
            <View
              style={[
                styles.bar,
                positive ? styles.barUp : styles.barDown,
                positive
                  ? month.selected
                    ? styles.positiveSelected
                    : styles.positive
                  : month.selected
                    ? styles.negativeSelected
                    : styles.negative,
                { height: barHeight(month.value) },
              ]}
            />
          );
          return (
            <View
              key={month.key}
              style={styles.column}
              accessible
              accessibilityLabel={`${month.label} : ${valueText}`}
            >
              <View style={styles.zones}>
                <View style={styles.top}>
                  {positive && valueLabel}
                  {positive && bar}
                </View>
                <View style={styles.bottom}>
                  {!positive && bar}
                  {!positive && valueLabel}
                </View>
              </View>
              <Text variant={month.selected ? 'label-medium' : 'label-regular'} color={month.selected ? 'primary' : 'secondary'}>
                {month.label}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.legendSaved]} />
          <Text variant="label-regular" color="secondary">
            Économisé
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.legendOver]} />
          <Text variant="label-regular" color="secondary">
            Dépassement du budget
          </Text>
        </View>
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  card: {
    alignSelf: 'stretch',
    gap: t.spacing[16],
    // Contour de 2 dessiné à l'intérieur dans Figma.
    padding: t.spacing[16] - t.sizes.borderWidth.thick,
    borderRadius: t.radius.md,
    borderWidth: t.sizes.borderWidth.thick,
    backgroundColor: t.colors.bg.app,
  },
  cardPositive: {
    borderColor: t.colors.category.vert.fg,
  },
  cardNegative: {
    borderColor: t.colors.category.rouge.fg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing[8],
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.spacing[6],
  },
  column: {
    flex: 1,
    alignItems: 'center',
    gap: t.spacing[4],
  },
  zones: {
    alignSelf: 'stretch',
    gap: t.spacing[10],
  },
  top: {
    height: t.sizes.chart.top,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: t.spacing[8],
  },
  bottom: {
    height: t.sizes.chart.bottom,
    alignItems: 'center',
    gap: t.spacing[4],
  },
  bar: {
    alignSelf: 'stretch',
  },
  barUp: {
    borderTopLeftRadius: t.radius.sm,
    borderTopRightRadius: t.radius.sm,
  },
  barDown: {
    borderBottomLeftRadius: t.radius.sm,
    borderBottomRightRadius: t.radius.sm,
  },
  positive: {
    backgroundColor: t.colors.bg.successSubtle,
  },
  positiveSelected: {
    backgroundColor: t.colors.feedback.success.fg,
  },
  negative: {
    backgroundColor: t.colors.bg.dangerSubtle,
  },
  negativeSelected: {
    backgroundColor: t.colors.feedback.danger.fg,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: t.spacing[16],
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing[6],
  },
  legendDot: {
    width: t.sizes.chart.legendDot,
    height: t.sizes.chart.legendDot,
    borderRadius: t.radius.xs,
  },
  legendSaved: {
    backgroundColor: t.colors.category.vert.fg,
  },
  legendOver: {
    backgroundColor: t.colors.category.rouge.fg,
  },
}));
