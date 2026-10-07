import React, { useState } from 'react';
import { View } from 'react-native';
import { BudgetCard, ExpenseGroup, ExpenseRow, Icon, IconButton } from '../components';
import { useBudj } from '../data/BudjContext';
import { effectiveDayOfMonth, monthOf } from '../data/dates';
import { fixedChargedTotal, fixedGroups, fixedTotal } from '../data/selectors';
import type { FixedExpense } from '../data/types';
import type { RootScreenProps } from '../navigation/types';
import { makeStyles } from '../theme';
import { confirmDestructive } from '../utils/confirm';
import { formatMoney } from '../utils/money';
import { ScreenLayout } from './ScreenLayout';
import { BackRow, EmptyText, PageTitle, Stack } from './ScreenParts';

type Mode = 'normal' | 'edit' | 'delete';

/**
 * Dépenses fixes par sous-catégorie (Figma 181:1349), ouvert depuis la carte
 * de l'accueil : budget total / déjà prélevé, puis un groupe par
 * sous-catégorie. Les boutons du bas passent en mode modification ou
 * suppression.
 */
export function FixedByCategoryScreen({ navigation }: RootScreenProps<'FixedByCategory'>) {
  const styles = useStyles();
  const { data, today, deleteFixedExpense } = useBudj();
  const [mode, setMode] = useState<Mode>('normal');
  const month = monthOf(today);
  const groups = fixedGroups(data);
  const toggle = (next: Mode) => setMode((current) => (current === next ? 'normal' : next));

  const openForm = (fixed: FixedExpense) => navigation.navigate('FixedExpenseForm', { fixedExpenseId: fixed.id });
  const askDelete = (fixed: FixedExpense) =>
    confirmDestructive({
      title: 'Supprimer la dépense fixe ?',
      message: `« ${fixed.label} » (${formatMoney(fixed.amount)} par mois) ne sera plus comptée.`,
      confirmLabel: 'Supprimer',
      onConfirm: () => deleteFixedExpense(fixed.id),
    });

  const footer =
    groups.length > 0 ? (
      <View style={styles.actions}>
        <IconButton
          icon="delete"
          accessibilityLabel={mode === 'delete' ? 'Terminer la suppression' : 'Supprimer des dépenses fixes'}
          active={mode === 'delete'}
          onPress={() => toggle('delete')}
        />
        <IconButton
          icon="edit"
          accessibilityLabel={mode === 'edit' ? 'Terminer la modification' : 'Modifier des dépenses fixes'}
          active={mode === 'edit'}
          onPress={() => toggle('edit')}
        />
      </View>
    ) : undefined;

  return (
    <ScreenLayout tab="categories" footer={footer} gap={24}>
      <BackRow />
      <Stack gap={24}>
        <PageTitle
          title="Dépenses fixes"
          color="brand"
          actions={
            <IconButton icon="add" accessibilityLabel="Nouvelle dépense fixe" onPress={() => navigation.navigate('FixedExpenseForm')} />
          }
        />
        <BudgetCard total={fixedTotal(data)} spent={fixedChargedTotal(data, month, today)} tone="neutral" />
      </Stack>

      {groups.map((group) => (
        <ExpenseGroup key={group.subcategory.id || 'autres'} title={group.subcategory.name} total={group.total} variant="fixed">
          {group.items.map((fixed) => (
            <ExpenseRow
              key={fixed.id}
              type="fixed"
              label={fixed.label}
              detail={`Prélèvement le ${effectiveDayOfMonth(fixed.dayOfMonth, month)}`}
              amount={fixed.amount}
              onPress={() => (mode === 'delete' ? askDelete(fixed) : openForm(fixed))}
              accessibilityHint={mode === 'delete' ? 'Supprimer cette dépense fixe' : 'Modifier cette dépense fixe'}
              trailing={
                mode === 'delete' ? (
                  <Icon name="delete" size={24} color="danger" />
                ) : mode === 'edit' ? (
                  <Icon name="edit" size={20} color="brand" />
                ) : undefined
              }
            />
          ))}
        </ExpenseGroup>
      ))}
      {groups.length === 0 && <EmptyText>Aucune dépense fixe : ajoute ton premier prélèvement avec le bouton +.</EmptyText>}
    </ScreenLayout>
  );
}

const useStyles = makeStyles((t) => ({
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: t.spacing[12],
  },
}));
