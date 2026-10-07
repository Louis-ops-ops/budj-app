import React from 'react';
import { View } from 'react-native';
import { makeStyles } from '../theme';
import { formatExpenseAmount } from '../utils/money';
import { Text } from './Text';

type Props = {
  title: string;
  /** Total du groupe en centimes, affiché en négatif. */
  total: number;
  /** Fixe = sous-catégorie de dépenses fixes ; Simple = un jour de l'historique. */
  variant: 'fixed' | 'simple';
  children: React.ReactNode;
};

/** Liste de dépenses avec en-tête titre + total (Figma « Groupe de dépenses » 191:216). */
export function ExpenseGroup({ title, total, variant, children }: Props) {
  const styles = useStyles();
  return (
    <View style={styles.group}>
      <View style={styles.header}>
        <Text variant={variant === 'fixed' ? 'heading-h2' : 'heading-h3'} accessibilityRole="header" numberOfLines={1} style={styles.title}>
          {title}
        </Text>
        <Text variant="body-regular" color="brandFaint">
          {formatExpenseAmount(total)}
        </Text>
      </View>
      <View style={styles.list}>{children}</View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  group: {
    alignSelf: 'stretch',
    gap: t.spacing[16],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing[8],
  },
  title: {
    flexShrink: 1,
  },
  list: {
    gap: t.spacing[12],
    padding: t.spacing[12],
    borderRadius: t.radius.md,
    backgroundColor: t.colors.bg.brandSubtle,
    overflow: 'hidden',
  },
}));
