import React from 'react';
import { View } from 'react-native';
import { makeStyles } from '../theme';
import { formatMoneyCompact, formatSignedMoney } from '../utils/money';
import { ProgressBar } from './ProgressBar';
import { Text } from './Text';
import type { Tone } from './TrendBadge';

type Props = {
  /** Budget total en centimes. */
  total: number;
  /** Dépensé en centimes. */
  spent: number;
  /** Économie du mois (détail d'un mois) : ajoute la ligne « Économisé ». */
  saved?: number;
  tone: Tone;
};

/**
 * Budget total / dépensé avec jauge (Figma « Carte budget » 191:153), en tête
 * des écrans Détail catégorie, Dépenses fixes et Détail d'un mois.
 */
export function BudgetCard({ total, spent, saved, tone }: Props) {
  const styles = useStyles();
  const hasSaved = saved !== undefined;
  const ratio = total > 0 ? spent / total : spent > 0 ? Infinity : 0;
  return (
    <View style={[styles.card, hasSaved && styles.cardCompact]}>
      <View style={[styles.infos, hasSaved && styles.infosCompact]}>
        <View style={styles.row}>
          <Text variant="heading-h3">Budget total</Text>
          <Text variant="heading-h3">{formatMoneyCompact(total)}</Text>
        </View>
        <View style={styles.row}>
          <Text variant="body-regular">Dépensé</Text>
          <Text
            variant="body-regular"
            color={hasSaved ? 'primary' : tone === 'positive' ? 'success' : tone === 'negative' ? 'danger' : 'brand'}
          >
            {formatMoneyCompact(spent)}
          </Text>
        </View>
        {hasSaved && (
          <View style={styles.row}>
            <Text variant="body-regular">{saved >= 0 ? 'Économisé' : 'Dépassement'}</Text>
            <Text variant="body-regular" color={saved >= 0 ? 'success' : 'danger'}>
              {formatSignedMoney(saved)}
            </Text>
          </View>
        )}
      </View>
      <ProgressBar ratio={ratio} tone={tone} />
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  card: {
    alignSelf: 'stretch',
    gap: t.spacing[16],
    padding: t.spacing[12],
    borderRadius: t.radius.md,
    backgroundColor: t.colors.bg.brandSubtle,
  },
  cardCompact: {
    gap: t.spacing[12],
  },
  infos: {
    gap: t.spacing[12],
  },
  infosCompact: {
    gap: t.spacing[6],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing[8],
  },
}));
