import React from 'react';
import { Pressable, View } from 'react-native';
import { makeStyles, useTheme } from '../theme';
import { formatSignedMoney } from '../utils/money';
import { Text } from './Text';

type Props = {
  /** Écarts proposés, en centimes. */
  steps?: number[];
  onAdjust: (delta: number) => void;
};

const DEFAULT_STEPS = [-5000, -1000, 1000, 5000];

/** Boutons pilule d'ajustement rapide d'un montant (−50 €, −10 €, +10 €, +50 €). */
export function QuickAdjust({ steps = DEFAULT_STEPS, onAdjust }: Props) {
  const styles = useStyles();
  const { sizes, spacing, text } = useTheme();
  const height = text['label-medium'].lineHeight + spacing[8] * 2;
  return (
    <View style={styles.row}>
      {steps.map((step) => {
        const label = formatSignedMoney(step, { compact: false });
        return (
          <Pressable
            key={step}
            onPress={() => onAdjust(step)}
            hitSlop={{ top: (sizes.touchTarget - height) / 2, bottom: (sizes.touchTarget - height) / 2 }}
            accessibilityRole="button"
            accessibilityLabel={`${label} sur le budget`}
            style={({ pressed }) => [styles.pill, pressed && styles.pressed]}
          >
            <Text variant="label-medium" color="brand">
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
  },
  pill: {
    width: t.sizes.quickAdjust,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: t.spacing[8] - t.sizes.borderWidth.thin,
    borderRadius: t.radius.full,
    borderWidth: t.sizes.borderWidth.thin,
    borderColor: t.colors.border.brandSubtle,
    backgroundColor: t.colors.bg.brandSubtle,
  },
  pressed: {
    opacity: t.opacity.pressed,
  },
}));
