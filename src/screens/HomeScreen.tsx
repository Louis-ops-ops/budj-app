import React, { useEffect, useState } from 'react';
import { CategoryCard, FixedSummaryCard, IconButton, Text } from '../components';
import { useBudj } from '../data/BudjContext';
import { monthOf } from '../data/dates';
import {
  categoryRemaining,
  categorySpent,
  fixedBreakdown,
  fixedTotal,
  hasUncategorizedExpenses,
  remainingGlobal,
} from '../data/selectors';
import { UNCATEGORIZED_LABEL, type Category } from '../data/types';
import type { TabScreenProps } from '../navigation/types';
import { confirmDestructive } from '../utils/confirm';
import { formatMoney, formatMoneyCompact, formatMoneyRounded } from '../utils/money';
import { ScreenLayout } from './ScreenLayout';
import { EmptyText, PageTitle, Stack } from './ScreenParts';

/**
 * Accueil « Mon budget » (Figma 181:1312) et son mode suppression (30:763) :
 * restant global, carte des dépenses fixes, puis une carte par catégorie.
 */
export function HomeScreen({ navigation }: TabScreenProps<'Categories'>) {
  const { data, today, deleteCategory } = useBudj();
  const [deleteMode, setDeleteMode] = useState(false);
  const month = monthOf(today);
  const remaining = remainingGlobal(data, month);
  const showUncategorized = hasUncategorizedExpenses(data);

  // Plus rien à supprimer : on quitte le mode suppression.
  useEffect(() => {
    if (deleteMode && data.categories.length === 0) setDeleteMode(false);
  }, [deleteMode, data.categories.length]);

  const askDelete = (category: Category) => {
    const count = data.expenses.filter((expense) => expense.categoryId === category.id).length;
    confirmDestructive({
      title: `Supprimer « ${category.name} » ?`,
      message:
        count === 0
          ? 'Cette catégorie ne contient aucune dépense.'
          : `Ses ${count} dépense${count > 1 ? 's' : ''} passer${count > 1 ? 'ont' : 'a'} en « ${UNCATEGORIZED_LABEL} ».`,
      confirmLabel: 'Supprimer',
      onConfirm: () => deleteCategory(category.id),
    });
  };

  return (
    <ScreenLayout>
      <Stack gap={24}>
        <PageTitle
          title="Mon budget"
          subtitle={['Budget défini de', formatMoneyCompact(data.settings.monthlyBudget)]}
          actions={
            <IconButton
              icon="edit"
              accessibilityLabel="Modifier le budget mensuel"
              onPress={() => navigation.navigate('EditBudget', { target: 'global' })}
            />
          }
        />
        <Text
          variant="display-l"
          color={remaining < 0 ? 'danger' : 'brand'}
          numberOfLines={1}
          adjustsFontSizeToFit
          accessibilityLabel={`${formatMoney(remaining)} restants ce mois-ci`}
        >
          {formatMoneyRounded(remaining)}
        </Text>
      </Stack>

      <Stack gap={24}>
        <PageTitle
          title="Mes catégories"
          actions={
            <>
              <IconButton
                icon="add"
                accessibilityLabel="Nouvelle catégorie"
                onPress={() => navigation.navigate('NewCategory')}
              />
              <IconButton
                icon="delete"
                accessibilityLabel={deleteMode ? 'Terminer la suppression' : 'Supprimer des catégories'}
                active={deleteMode}
                disabled={!deleteMode && data.categories.length === 0}
                onPress={() => setDeleteMode((on) => !on)}
              />
            </>
          }
        />
        <Stack gap={12}>
          <FixedSummaryCard
            total={fixedTotal(data)}
            breakdown={fixedBreakdown(data)}
            onPress={() => navigation.navigate('FixedByCategory')}
          />
          {data.categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              remaining={categoryRemaining(data, category, month)}
              budget={category.monthlyBudget}
              mode={deleteMode ? 'delete' : 'normal'}
              onPress={() => navigation.navigate('CategoryDetail', { categoryId: category.id })}
              onDelete={() => askDelete(category)}
            />
          ))}
          {showUncategorized && !deleteMode && (
            <CategoryCard
              category={{ name: UNCATEGORIZED_LABEL, color: 'neutre' }}
              remaining={-categorySpent(data, null, month)}
              budget={0}
              onPress={() => navigation.navigate('CategoryDetail', { categoryId: null })}
            />
          )}
          {data.categories.length === 0 && (
            <EmptyText>Aucune catégorie pour l'instant : crée la première avec le bouton +.</EmptyText>
          )}
        </Stack>
      </Stack>
    </ScreenLayout>
  );
}
