import React from 'react';
import { Pressable, View } from 'react-native';
import { makeStyles, type CategoryTone } from '../theme';
import { formatExpenseAmount } from '../utils/money';
import { Logo } from './Logo';
import { Text } from './Text';

type Props = {
  /** Fixe = avec logo ; Simple = historique / détail ; Déplacement = sélection. */
  type: 'fixed' | 'simple' | 'move';
  label: string;
  detail?: string;
  /** Montant en centimes, affiché en négatif (« −24,78€ »). */
  amount: number;
  /** Teinte du montant : catégorie de la dépense, ou `brand` pour une dépense fixe. */
  amountColor?: CategoryTone | 'brand' | 'primary';
  /** Libellé servant au logo d'une dépense fixe (par défaut `label`). */
  logo?: string;
  /** Ligne cochée (type `move`). */
  selected?: boolean;
  /** Remplace le montant (ex. icône de suppression en mode édition). */
  trailing?: React.ReactNode;
  onPress?: () => void;
  accessibilityHint?: string;
};

/** Ligne de dépense (Figma « Ligne dépense » 190:140). */
export function ExpenseRow({
  type,
  label,
  detail,
  amount,
  amountColor = type === 'fixed' ? 'brand' : 'primary',
  logo,
  selected = false,
  trailing,
  onPress,
  accessibilityHint,
}: Props) {
  const styles = useStyles();
  const amountText = formatExpenseAmount(amount);
  const isMove = type === 'move';

  const content = (
    <>
      <View style={[styles.infos, isMove && styles.infosMove]}>
        {isMove && <View style={[styles.radio, selected ? styles.radioOn : styles.radioOff]} />}
        {type === 'fixed' && <Logo label={logo ?? label} />}
        <View style={styles.texts}>
          <Text variant="body-medium" numberOfLines={1}>
            {label}
          </Text>
          {!!detail && (
            <Text variant="caption-medium" color="secondary" numberOfLines={1}>
              {detail}
            </Text>
          )}
        </View>
      </View>
      {trailing ?? (
        <Text
          variant="body-bold"
          color={amountColor === 'brand' ? 'brand' : 'primary'}
          categoryColor={amountColor === 'brand' || amountColor === 'primary' ? undefined : amountColor}
        >
          {amountText}
        </Text>
      )}
    </>
  );

  const a11yLabel = [label, detail, amountText].filter(Boolean).join(', ');
  if (!onPress) {
    return (
      <View style={styles.row} accessible accessibilityLabel={a11yLabel}>
        {content}
      </View>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={isMove ? 'checkbox' : 'button'}
      accessibilityLabel={a11yLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={isMove ? { checked: selected } : undefined}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing[8],
  },
  pressed: {
    opacity: t.opacity.pressed,
  },
  infos: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing[8],
    flexShrink: 1,
  },
  infosMove: {
    gap: t.spacing[12],
  },
  texts: {
    gap: t.spacing[2],
    flexShrink: 1,
  },
  radio: {
    width: t.sizes.radio,
    height: t.sizes.radio,
    borderRadius: t.radius.full,
  },
  radioOff: {
    backgroundColor: t.colors.bg.app,
    borderWidth: t.sizes.borderWidth.thin,
    borderColor: t.colors.icon.muted,
  },
  radioOn: {
    backgroundColor: t.colors.bg.accent,
  },
}));
