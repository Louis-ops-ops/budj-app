import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, IconButton, SwipeableRow } from '../components';
import { useBudj } from '../data/BudjContext';
import { colors, layout, spacing, typography } from '../theme';
import type { RootScreenProps } from '../navigation/types';
import { AjouterDepenseFixeSheet } from './AjouterDepenseFixeSheet';
import { ModifierBudgetSheet } from './ModifierBudgetSheet';

/**
 * Détail "Dépenses fixes" (node Figma 30:851 "Dans catégorie dépenses fixes") :
 * budget total (auto = somme des sous-catégories) + dépensé + barre de
 * progression, puis chaque sous-catégorie (Distractions, Factures...) avec
 * son propre budget, son total "Dépense lié" et la liste de ses dépenses
 * fixes. Les logos de marque (Netflix, EDF...) du design ne sont pas encore
 * décidés côté produit — Avatar affiche une initiale en attendant.
 */
export function DepensesFixesDetailScreen({ navigation }: RootScreenProps<'DepensesFixesDetail'>) {
  const {
    state,
    fixedBudgetTotal,
    fixedSpentTotal,
    spentForFixedSubCategory,
    fixedExpensesForSubCategory,
    deleteFixedSubCategory,
    updateFixedSubCategory,
    deleteFixedExpense,
  } = useBudj();

  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [editingSubCategoryId, setEditingSubCategoryId] = useState<string | null>(null);

  const pct = fixedBudgetTotal > 0 ? Math.min(100, Math.round((fixedSpentTotal / fixedBudgetTotal) * 100)) : 0;
  const editingSubCategory = state.fixedSubCategories.find((c) => c.id === editingSubCategoryId);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.headerRow}>
          <IconButton icon="chevronRight" onPress={() => navigation.goBack()} style={{ transform: [{ rotate: '180deg' }] }} />
          <View style={{ flex: 1 }} />
          <IconButton icon="plus" onPress={() => setAddSheetOpen(true)} />
        </View>

        <Text style={[typography.h1, { color: colors.bleue[500] }]}>Dépenses fixes</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={typography.bodyMedium}>Budget total</Text>
            <Text style={typography.bodyMedium}>{Math.round(fixedBudgetTotal)}€</Text>
          </View>
          <View style={styles.row}>
            <Text style={[typography.body, { color: colors.texte }]}>Dépensé</Text>
            <Text style={[typography.body, { color: colors.bleue[500] }]}>{Math.round(fixedSpentTotal)}€</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${pct}%` }]} />
          </View>
          <Text style={[typography.labelXxs, { color: colors.bleue[500], alignSelf: 'flex-end' }]}>{pct}%</Text>
        </View>

        {state.fixedSubCategories.map((sub) => {
          const spent = spentForFixedSubCategory(sub.id);
          const expenses = fixedExpensesForSubCategory(sub.id);

          return (
            <View key={sub.id} style={styles.subCategory}>
              <View style={styles.subHeaderRow}>
                <Text style={typography.h2}>{sub.name}</Text>
                <View style={{ flexDirection: 'row', gap: spacing.md }}>
                  <IconButton icon="trash" onPress={() => deleteFixedSubCategory(sub.id)} />
                  <IconButton icon="edit" onPress={() => setEditingSubCategoryId(sub.id)} />
                </View>
              </View>
              <View style={styles.subLabelRow}>
                <Text style={[typography.body, { color: colors.bleue[300] }]}>Dépense liée</Text>
                <Text style={[typography.body, { color: colors.bleue[300] }]}>{Math.round(spent)}€ / {sub.budget}€</Text>
              </View>

              <View style={styles.expenseList}>
                {expenses.map((exp) => (
                  <SwipeableRow key={exp.id} onDelete={() => deleteFixedExpense(exp.id)} backgroundColor={colors.bleue[50]}>
                    <View style={styles.expenseRow}>
                      <View style={styles.expenseInfo}>
                        <Avatar label={exp.label} />
                        <View>
                          <Text style={[typography.bodyMedium, { color: colors.bleue[500] }]}>{exp.label}</Text>
                          <Text style={[typography.labelXxs, { color: colors.gris }]}>Prélèvement automatique</Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                        <Text style={[typography.bodyBold, { color: colors.bleue[500] }]}>-{exp.amount}€</Text>
                        <IconButton icon="trash" size={28} onPress={() => deleteFixedExpense(exp.id)} />
                      </View>
                    </View>
                  </SwipeableRow>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <AjouterDepenseFixeSheet visible={addSheetOpen} onClose={() => setAddSheetOpen(false)} />

      {editingSubCategory && (
        <ModifierBudgetSheet
          visible={!!editingSubCategoryId}
          onClose={() => setEditingSubCategoryId(null)}
          name={editingSubCategory.name}
          currentBudget={editingSubCategory.budget}
          onSubmit={(budget) => updateFixedSubCategory(editingSubCategory.id, { budget })}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.blanc },
  body: { paddingHorizontal: layout.screenPaddingX, paddingTop: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.xxl },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  card: { borderRadius: 12, padding: spacing.md, gap: spacing.xs, backgroundColor: colors.bleue[50] },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: colors.bleue[200], overflow: 'hidden', marginTop: spacing.xs },
  progressFill: { height: '100%', backgroundColor: colors.bleue[500] },
  subCategory: { gap: spacing.sm },
  subHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  subLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  expenseList: { backgroundColor: colors.bleue[50], borderRadius: 8, padding: spacing.lg, gap: spacing.md },
  expenseRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  expenseInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
