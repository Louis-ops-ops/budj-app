import React from 'react';
import { Pressable, View } from 'react-native';
import { makeStyles } from '../theme';
import { formatMoneyCompact } from '../utils/money';
import { Text } from './Text';

type Props = {
  /** Total mensuel des dépenses fixes, en centimes. */
  total: number;
  /** Une ligne par sous-catégorie (Épargne, Factures…). */
  breakdown: { id: string; label: string; amount: number }[];
  onPress?: () => void;
};

/** Récapitulatif des dépenses fixes, en tête de l'accueil (Figma « Carte dépenses fixes » 190:265). */
export function FixedSummaryCard({ total, breakdown, onPress }: Props) {
  const styles = useStyles();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`Dépenses fixes, ${formatMoneyCompact(total)} par mois`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.titleRow}>
        <Text variant="heading-h2" categoryColor="bleu">
          Dépenses fixes
        </Text>
        <Text variant="body-medium" categoryColor="bleu">
          {formatMoneyCompact(total)}
        </Text>
      </View>
      {breakdown.length > 0 && (
        <View style={styles.lines}>
          {breakdown.map((line) => (
            <View key={line.id} style={styles.line}>
              <Text variant="label-regular" color="brandSubtle" numberOfLines={1} style={styles.label}>
                {line.label}
              </Text>
              <Text variant="label-regular" color="brandSubtle">
                {formatMoneyCompact(line.amount)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  card: {
    alignSelf: 'stretch',
    gap: t.spacing[12],
    padding: t.spacing[12],
    borderRadius: t.radius.md,
    backgroundColor: t.colors.category.bleu.bg,
  },
  pressed: {
    opacity: t.opacity.pressed,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  lines: {
    gap: t.spacing[6],
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing[8],
  },
  label: {
    flexShrink: 1,
  },
}));
