import React from 'react';
import { View } from 'react-native';
import { makeStyles, useTheme, type CategoryTone } from '../theme';
import { formatMoneyCompact, formatSignedMoney } from '../utils/money';
import { Text } from './Text';
import { TrendBadge } from './TrendBadge';

type Props = {
  category: { name: string; color: CategoryTone };
  /** Dépensé dans le mois affiché, en centimes. */
  amount: number;
  /** Dépensé le mois précédent, en centimes. */
  previous: number;
  /** Nom du mois précédent (« juin »). */
  previousMonth: string;
};

/**
 * Comparaison d'une catégorie avec le mois précédent (Figma « Ligne
 * catégorie évolution » 192:270). Dépenser moins est positif.
 */
export function CategoryCompareRow({ category, amount, previous, previousMonth }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const delta = amount - previous;
  const tone = delta < 0 ? 'positive' : delta > 0 ? 'negative' : 'neutral';
  const badge = delta === 0 ? 'Stable' : formatSignedMoney(delta, { rounded: true });
  return (
    <View
      style={[styles.card, { backgroundColor: colors.category[category.color].bg }]}
      accessible
      accessibilityLabel={`${category.name}, ${formatMoneyCompact(amount)}, ${formatMoneyCompact(previous)} en ${previousMonth}`}
    >
      <View style={styles.row}>
        <Text variant="body-medium" numberOfLines={1} style={styles.name}>
          {category.name}
        </Text>
        <Text variant="body-medium">{formatMoneyCompact(amount)}</Text>
      </View>
      <View style={styles.row}>
        <Text variant="label-regular" categoryColor={category.color} numberOfLines={1} style={styles.name}>
          {`${formatMoneyCompact(previous)} en ${previousMonth}`}
        </Text>
        <TrendBadge tone={tone} label={badge} />
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  card: {
    alignSelf: 'stretch',
    gap: t.spacing[6],
    padding: t.spacing[12],
    borderRadius: t.radius.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing[8],
  },
  name: {
    flexShrink: 1,
  },
}));
