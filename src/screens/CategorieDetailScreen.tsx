import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CategoryStatsCard, IconButton } from '../components';
import { useBudj } from '../data/BudjContext';
import { colors, layout, spacing, typography } from '../theme';
import { formatEuro } from '../utils/format';
import type { RootScreenProps } from '../navigation/types';
import { NON_CATEGORISE_ID } from '../data/types';
import { ModifierBudgetSheet } from './ModifierBudgetSheet';

/**
 * "Dans une Catégorie" (node Figma 18:931 "Catégorie") — pixel perfect :
 * titre coloré avec la couleur de la catégorie (pas noir), carte budget
 * réutilisable (CategoryStatsCard, identique au node 18:937), et liste des
 * dernières dépenses où seul le MONTANT est coloré (le libellé reste noir —
 * contrairement à l'écran Historique où les deux le sont).
 * - Crayon en face du titre → ModifierBudgetSheet (popup Figma 29:452)
 * - Icône "sortie" en face de "Dernières dépenses" → écran DeplacerDepense
 *   (node Figma 29:502), pour déplacer une dépense mal catégorisée
 * - Icône poubelle → bascule un mode suppression sur la liste (pas de bouton
 *   supprimer par ligne visible par défaut dans le design)
 */
export function CategorieDetailScreen({ route, navigation }: RootScreenProps<'CategorieDetail'>) {
  const { displayCategories, expensesForCategory, spentForCategory, deleteExpense, updateCategoryBudget } = useBudj();
  const category = displayCategories.find((c) => c.id === route.params.categoryId);
  const expenses = expensesForCategory(route.params.categoryId);
  const spent = spentForCategory(route.params.categoryId);
  const isGhost = category?.id === NON_CATEGORISE_ID;

  const [deleteMode, setDeleteMode] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);

  if (!category) return null;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.headerRow}>
          <IconButton icon="chevronRight" onPress={() => navigation.goBack()} style={{ transform: [{ rotate: '180deg' }] }} />
        </View>

        <View style={styles.categorySection}>
          <View style={styles.titleRow}>
            <Text style={[typography.h1, { color: category.color.texte }]}>{category.name}</Text>
            {!isGhost && <IconButton icon="edit" onPress={() => setEditSheetOpen(true)} />}
          </View>

          <CategoryStatsCard budget={category.budget} spent={spent} color={category.color} />
        </View>

        <View style={styles.expensesSection}>
          <View style={styles.titleRow}>
            <Text style={typography.h2}>Dernière dépenses</Text>
            <View style={styles.headerActions}>
              <IconButton icon="trash" onPress={() => setDeleteMode((v) => !v)} />
              <IconButton icon="moveTo" onPress={() => navigation.navigate('DeplacerDepense', { categoryId: category.id })} />
            </View>
          </View>

          <View style={styles.expenseList}>
            {expenses.map((item) => (
              <View key={item.id} style={styles.expenseRow}>
                <View>
                  <Text style={typography.bodyMedium}>{item.label}</Text>
                  <Text style={[typography.labelXxs, { color: colors.gris }]}>{item.paymentMethod}</Text>
                </View>
                <View style={styles.expenseActions}>
                  <Text style={[typography.bodyBold, { color: category.color.texte }]}>-{formatEuro(item.amount)}€</Text>
                  {deleteMode && <IconButton icon="trash" size={28} onPress={() => deleteExpense(item.id)} />}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      <ModifierBudgetSheet
        visible={editSheetOpen}
        onClose={() => setEditSheetOpen(false)}
        name={category.name}
        currentBudget={category.budget}
        onSubmit={(budget) => updateCategoryBudget(category.id, budget)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.blanc },
  body: { paddingHorizontal: layout.screenPaddingX, paddingTop: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.xxl },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  categorySection: { gap: spacing.xxl },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  expensesSection: { gap: spacing.xxl },
  headerActions: { flexDirection: 'row', gap: spacing.md },
  expenseList: { gap: spacing.lg },
  expenseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  expenseActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
