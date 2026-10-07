import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { BudgetCard, Button, CategoryChip, ExpenseRow, IconButton, Text, TextField } from '../components';
import { useBudj } from '../data/BudjContext';
import { monthOf } from '../data/dates';
import { categoryExpenses, categorySpent, categoryTone, findCategory } from '../data/selectors';
import { UNCATEGORIZED_LABEL } from '../data/types';
import type { RootScreenProps } from '../navigation/types';
import { makeStyles } from '../theme';
import { expenseDetail } from './CategoryDetailScreen';
import { ScreenLayout } from './ScreenLayout';
import { BackRow, EmptyText, PageTitle, Stack } from './ScreenParts';

/**
 * Déplacer des dépenses (Figma 29:502) : on coche une ou plusieurs dépenses,
 * on choisit la catégorie de destination dans le bloc du bas, puis Valider.
 */
export function MoveExpenseScreen({ navigation, route }: RootScreenProps<'MoveExpense'>) {
  const styles = useStyles();
  const { data, today, moveExpenses } = useBudj();
  const { categoryId } = route.params;
  const category = findCategory(data, categoryId);
  const missing = categoryId !== null && !category;
  const [selected, setSelected] = useState<string[]>([]);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (missing) navigation.goBack();
  }, [missing, navigation]);
  if (missing) return null;

  const month = monthOf(today);
  const name = category?.name ?? UNCATEGORIZED_LABEL;
  const color = category?.color ?? 'neutre';
  const spent = categorySpent(data, categoryId, month);
  const expenses = categoryExpenses(data, categoryId);
  const targets = data.categories.filter((item) => item.id !== categoryId);
  const target = findCategory(data, targetId);
  const canMove = selected.length > 0 && !!target;

  const toggle = (id: string) =>
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));

  const submit = () => {
    if (!canMove || !target) return;
    moveExpenses(selected, target.id);
    navigation.goBack();
  };

  const footer = (
    <View style={styles.moveBox}>
      <Text variant="body-medium">Déplacer vers ?</Text>
      <TextField
        type="select"
        value={target?.name ?? ''}
        placeholder="Choisir une catégorie"
        open={pickerOpen}
        onPress={() => setPickerOpen((open) => !open)}
      />
      {pickerOpen && (
        <View style={styles.chips}>
          {targets.map((item) => (
            <CategoryChip
              key={item.id}
              label={item.name}
              color={item.color}
              selected={item.id === targetId}
              onPress={() => {
                setTargetId(item.id);
                setPickerOpen(false);
              }}
            />
          ))}
          {targets.length === 0 && <EmptyText>Crée d'abord une autre catégorie.</EmptyText>}
        </View>
      )}
      <Button
        label={selected.length > 1 ? `Valider (${selected.length})` : 'Valider'}
        icon="chevron"
        fullWidth
        disabled={!canMove}
        onPress={submit}
      />
    </View>
  );

  return (
    <ScreenLayout tab="categories" addCategoryId={category?.id} footer={footer}>
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
        {category && <BudgetCard total={category.monthlyBudget} spent={spent} tone={categoryTone(spent, category.monthlyBudget)} />}
      </Stack>

      <Stack gap={24}>
        <PageTitle title="Dernières dépenses" variant="heading-h2" />
        <Stack gap={16}>
          {expenses.map((expense) => (
            <ExpenseRow
              key={expense.id}
              type="move"
              label={expense.label}
              detail={expenseDetail(expense, today)}
              amount={expense.amount}
              amountColor={color}
              selected={selected.includes(expense.id)}
              onPress={() => toggle(expense.id)}
            />
          ))}
          {expenses.length === 0 && <EmptyText>Aucune dépense à déplacer.</EmptyText>}
        </Stack>
      </Stack>
    </ScreenLayout>
  );
}

const useStyles = makeStyles((t) => ({
  moveBox: {
    gap: t.spacing[12],
    padding: t.spacing[12],
    borderRadius: t.radius.md,
    backgroundColor: t.colors.bg.brandMuted,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: t.spacing[8],
  },
}));
