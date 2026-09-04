import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CategoryStatsCard, FormSelectField, Icon, IconButton, NavBar } from '../components';
import { useBudj } from '../data/BudjContext';
import { colors, layout, spacing, typography } from '../theme';
import { formatEuro } from '../utils/format';
import type { RootScreenProps } from '../navigation/types';
import { NON_CATEGORISE_ID } from '../data/types';
import { AjouterDepenseSheet } from './AjouterDepenseSheet';
import { ModifierBudgetSheet } from './ModifierBudgetSheet';

/**
 * "Déplacer une dépense" (node Figma 29:502) — accessible depuis l'icône
 * "sortie" de l'écran catégorie, pour rattraper une dépense enregistrée dans
 * la mauvaise catégorie par erreur : on sélectionne LA dépense à déplacer
 * (liste à sélection unique, ronds façon radio) puis la catégorie de
 * destination, et on valide.
 * Les icônes poubelle/sortie dupliquées à côté de "Dernière dépenses" dans
 * la maquette Figma (identiques à celles de l'écran catégorie) n'ont pas de
 * sens sur cet écran même (on y est déjà) — volontairement omises ici.
 */
export function DeplacerDepenseScreen({ route, navigation }: RootScreenProps<'DeplacerDepense'>) {
  const { state, displayCategories, expensesForCategory, spentForCategory, moveExpense, updateCategoryBudget } = useBudj();
  const category = displayCategories.find((c) => c.id === route.params.categoryId);
  const expenses = expensesForCategory(route.params.categoryId);
  const spent = spentForCategory(route.params.categoryId);
  // Cible du déplacement : toujours une vraie catégorie (jamais "Non catégorisé").
  const otherCategories = state.categories.filter((c) => c.id !== route.params.categoryId);
  const isGhost = category?.id === NON_CATEGORISE_ID;

  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [addDepenseSheetOpen, setAddDepenseSheetOpen] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const [targetCategoryId, setTargetCategoryId] = useState<string | undefined>(otherCategories[0]?.id);
  const [pickerOpen, setPickerOpen] = useState(false);

  if (!category) return null;

  const targetCategory = otherCategories.find((c) => c.id === targetCategoryId);
  const canSubmit = !!selectedExpenseId && !!targetCategoryId;

  const submit = () => {
    if (!canSubmit || !selectedExpenseId || !targetCategoryId) return;
    moveExpense(selectedExpenseId, targetCategoryId);
    navigation.goBack();
  };

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
          <Text style={typography.h2}>Dernière dépenses</Text>

          <View style={styles.expenseList}>
            {expenses.map((item) => {
              const selected = item.id === selectedExpenseId;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setSelectedExpenseId(item.id)}
                  style={styles.expenseRow}
                >
                  <View style={styles.expenseInfo}>
                    <View style={[styles.radio, selected && styles.radioSelected]} />
                    <View>
                      <Text style={typography.bodyMedium}>{item.label}</Text>
                      <Text style={[typography.labelXxs, { color: colors.gris }]}>{item.paymentMethod}</Text>
                    </View>
                  </View>
                  <Text style={[typography.bodyBold, { color: category.color.texte }]}>-{formatEuro(item.amount)}€</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.moveBox}>
          <Text style={styles.moveLabel}>Déplacer vers ?</Text>
          <FormSelectField label="Choisir une catégorie" value={targetCategory?.name} open={pickerOpen} onPress={() => setPickerOpen((v) => !v)} />
          {pickerOpen && (
            <View style={styles.picker}>
              {otherCategories.map((c) => (
                <Pressable
                  key={c.id}
                  onPress={() => {
                    setTargetCategoryId(c.id);
                    setPickerOpen(false);
                  }}
                  style={[styles.chip, { backgroundColor: c.color.fond }, targetCategoryId === c.id && styles.chipSelected]}
                >
                  <Text style={[typography.labelXsMedium, { color: c.color.texte }]}>{c.name}</Text>
                </Pressable>
              ))}
            </View>
          )}
          <Pressable onPress={submit} disabled={!canSubmit} style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}>
            <Icon name="chevronRight" size={20} color={colors.blanc} />
            <Text style={styles.submitLabel}>Valider</Text>
          </Pressable>
        </View>
      </ScrollView>

      <View style={styles.navBarWrapper}>
        <NavBar
          active="categories"
          onNavigate={(section) => {
            if (section === 'fixe') navigation.navigate('DepensesFixes');
            if (section === 'historique') navigation.navigate('Historique');
          }}
          onAdd={() => setAddDepenseSheetOpen(true)}
        />
      </View>

      <ModifierBudgetSheet
        visible={editSheetOpen}
        onClose={() => setEditSheetOpen(false)}
        name={category.name}
        currentBudget={category.budget}
        onSubmit={(budget) => updateCategoryBudget(category.id, budget)}
      />

      <AjouterDepenseSheet visible={addDepenseSheetOpen} onClose={() => setAddDepenseSheetOpen(false)} />
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
  expenseList: { gap: spacing.lg },
  expenseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  expenseInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: colors.gris, backgroundColor: colors.blanc },
  radioSelected: { backgroundColor: colors.bleue[500] },
  moveBox: { backgroundColor: colors.bleue[100], borderRadius: 12, padding: spacing.md, gap: spacing.md },
  moveLabel: { fontFamily: 'Outfit_500Medium', fontSize: 16, lineHeight: 18, color: colors.noir },
  picker: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 999 },
  chipSelected: { borderWidth: 2, borderColor: colors.bleue[500] },
  submitButton: {
    width: '100%',
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bleue[500],
    borderRadius: 999,
    paddingVertical: spacing.md,
  },
  submitButtonDisabled: { opacity: 0.4 },
  submitLabel: { fontFamily: 'Outfit_500Medium', fontSize: 18, lineHeight: 20, color: colors.blanc },
  navBarWrapper: { paddingHorizontal: layout.screenPaddingX, paddingBottom: spacing.md },
});
