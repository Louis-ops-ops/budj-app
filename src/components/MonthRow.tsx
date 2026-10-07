import React from 'react';
import { Pressable, View } from 'react-native';
import { makeStyles } from '../theme';
import { formatMoneyCompact, formatMoneyRounded, formatSignedPercent } from '../utils/money';
import { ProgressBar } from './ProgressBar';
import { Text } from './Text';
import { TrendBadge, type Tone } from './TrendBadge';

export type MonthRowState = 'progress' | 'regress' | 'current';

type Props = {
  /** Nom du mois (« Août »). */
  month: string;
  /** Total dépensé du mois (fixes + dépenses), en centimes. */
  spent: number;
  /** Économie du mois (ou restant du mois en cours), en centimes. */
  result: number;
  /** Progression = sous le budget, Régression = dépassement, En cours = mois actuel. */
  state: MonthRowState;
  /** Dépensé ÷ budget. */
  ratio: number;
  onPress?: () => void;
};

const TONES: Record<MonthRowState, Tone> = {
  progress: 'positive',
  regress: 'negative',
  current: 'neutral',
};

function resultLabel(state: MonthRowState, result: number): string {
  if (result < 0) return `${formatMoneyRounded(-result)} de dépassement`;
  if (state === 'current') return `${formatMoneyRounded(result)} restants`;
  return `${formatMoneyRounded(result)} économisés`;
}

/** Ligne de la liste « Mois par mois » (Figma « Ligne mois » 192:209). */
export function MonthRow({ month, spent, result, state, ratio, onPress }: Props) {
  const styles = useStyles();
  const tone = TONES[state];
  // Écart au budget : −45 % = 45 % en dessous, +3 % = 3 % au-dessus.
  const badge = Number.isFinite(ratio) ? formatSignedPercent(ratio - 1) : '—';
  const label = resultLabel(state, result);
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`${month}, ${label}, ${formatMoneyCompact(spent)} dépensés`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.infos}>
        <View style={styles.row}>
          <Text variant="heading-h3">{month}</Text>
          <TrendBadge tone={tone} label={badge} />
        </View>
        <View style={styles.row}>
          <Text
            variant="label-regular"
            color={state === 'current' ? (result < 0 ? 'danger' : 'brand') : 'primary'}
            numberOfLines={1}
            style={styles.result}
          >
            {label}
          </Text>
          <Text variant="heading-h3">{formatMoneyRounded(spent)}</Text>
        </View>
      </View>
      <ProgressBar ratio={ratio} tone={tone} />
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  card: {
    alignSelf: 'stretch',
    gap: t.spacing[12],
    padding: t.spacing[12],
    borderRadius: t.radius.md,
    backgroundColor: t.colors.bg.brandSubtle,
  },
  pressed: {
    opacity: t.opacity.pressed,
  },
  infos: {
    gap: t.spacing[6],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing[8],
  },
  result: {
    flexShrink: 1,
  },
}));
