import React, { useEffect, useState } from 'react';
import { Pressable } from 'react-native';
import { BudgetCard, ExpenseRow, Icon, IconButton } from '../components';
import { useBudj } from '../data/BudjContext';
import { monthOf } from '../data/dates';
import { categoryExpenses, categorySpent, categoryTone, findCategory } from '../data/selectors';
import { UNCATEGORIZED_LABEL, type Expense } from '../data/types';
import type { RootScreenProps } from '../navigation/types';
import { useTheme } from '../theme';
import { confirmDestructive } from '../utils/confirm';
import { dayLabel } from '../utils/dateLabels';
import { formatMoney } from '../utils/money';
import { ScreenLayout } from './ScreenLayout';
import { BackRow, EmptyText, PageTitle, Stack } from './ScreenParts';

const DELETE_ICON_SIZE = 24;

/** « 4 août · Carte bancaire » : la liste couvre plusieurs mois, on rappelle la date. */
export function expenseDetail(expense: Expense, today: string): string {
  const date = dayLabel(expense.date, today);
  return expense.detail ? `${date} · ${expense.detail}` : date;
}

/**
 * Détail d'une catégorie (Figma 18:931) : titre à sa couleur, carte budget
 * du mois et dernières dépenses ; aussi utilisé pour « Sans catégorie ».
 */
export function CategoryDetailScreen({ navigation, route }: RootScreenProps<'CategoryDetail'>) {
  const { data, today, deleteExpense } = useBudj();
  const { sizes } = useTheme();
  const { categoryId } = route.params;
  const category = findCategory(data, categoryId);
  const missing = categoryId !== null && !category;
  const [deleteMode, setDeleteMode] = useState(false);

  // Catégorie supprimée entre-temps : on revient à l'accueil.
  useEffect(() => {
    if (missing) navigation.goBack();
  }, [missing, navigation]);
  if (missing) return null;

  const month = monthOf(today);
  const name = category?.name ?? UNCATEGORIZED_LABEL;
  const color = category?.color ?? 'neutre';
  const budget = category?.monthlyBudget ?? 0;
  const spent = categorySpent(data, categoryId, month);
  const expenses = categoryExpenses(data, categoryId);

  const askDelete = (expense: Expense) =>
    confirmDestructive({
      title: 'Supprimer la dépense ?',
      message: `« ${expense.label} » (${formatMoney(expense.amount)}) sera retirée.`,
      confirmLabel: 'Supprimer',
      onConfirm: () => deleteExpense(expense.id),
    });

  return (
    <ScreenLayout tab="categories" addCategoryId={category?.id}>
      <BackRow />
      <Stack gap={24}>
        <PageTitle
          title={name}
          categoryColor={color}
          actions={
            category && (
              <IconButton
                icon="edit"
                accessibilityLabel={`Modifier le budget de ${name}`}
                onPress={() => navigation.navigate('EditBudget', { target: 'category', categoryId: category.id })}
              />
            )
          }
        />
        {category && <BudgetCard total={budget} spent={spent} tone={categoryTone(spent, budget)} />}
        {!category && <EmptyText>Ces dépenses n'ont plus de catégorie : déplace-les vers l'une de tes catégories.</EmptyText>}
      </Stack>

      <Stack gap={24}>
        <PageTitle
          title="Dernières dépenses"
          variant="heading-h2"
          actions={
            expenses.length > 0 && (
              <>
                <IconButton
                  icon="delete"
                  accessibilityLabel={deleteMode ? 'Terminer la suppression' : 'Supprimer des dépenses'}
                  active={deleteMode}
                  onPress={() => setDeleteMode((on) => !on)}
                />
                <IconButton
                  icon="move"
                  accessibilityLabel="Déplacer des dépenses vers une autre catégorie"
                  onPress={() => navigation.navigate('MoveExpense', { categoryId })}
                />
              </>
            )
          }
        />
        <Stack gap={16}>
          {expenses.map((expense) => (
            <ExpenseRow
              key={expense.id}
              type="simple"
              label={expense.label}
              detail={expenseDetail(expense, today)}
              amount={expense.amount}
              amountColor={color}
              trailing={
                deleteMode ? (
                  <Pressable
                    onPress={() => askDelete(expense)}
                    hitSlop={(sizes.touchTarget - DELETE_ICON_SIZE) / 2}
                    accessibilityRole="button"
                    accessibilityLabel={`Supprimer ${expense.label}`}
                  >
                    <Icon name="delete" size={DELETE_ICON_SIZE} color="danger" />
                  </Pressable>
                ) : undefined
              }
            />
          ))}
          {expenses.length === 0 && <EmptyText>Aucune dépense dans cette catégorie pour l'instant.</EmptyText>}
        </Stack>
      </Stack>
    </ScreenLayout>
  );
}
