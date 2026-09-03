import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CategoryCard, IconButton, NavBar } from '../components';
import { useBudj } from '../data/BudjContext';
import { colors, layout, spacing, typography } from '../theme';
import type { RootScreenProps } from '../navigation/types';
import { NON_CATEGORISE_ID } from '../data/types';
import { AjouterCategorieSheet } from './AjouterCategorieSheet';
import { ModifierBudgetSheet } from './ModifierBudgetSheet';

/**
 * Écran "Mon budget" — un seul écran (node Figma 9:1263 "Catégories / Mon
 * budget"), pas deux : l'icône crayon bascule un mode édition local qui fait
 * apparaître les icônes supprimer sur chaque catégorie (node 30:763 "Clique
 * sur supprimer"), et l'icône "+" ouvre la feuille "Nouvelle catégorie"
 * (popup Figma 18:497 "Pop up ajouter une carégorie", voir
 * AjouterCategorieSheet.tsx).
 */
export function MonBudgetScreen({ navigation }: RootScreenProps<'MonBudget'>) {
  const { state, montantRestant, fixedBudgetTotal, displayCategories, spentForCategory, deleteCategory, updateBudgetDefini } =
    useBudj();

  const [editMode, setEditMode] = useState(false);
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [budgetSheetOpen, setBudgetSheetOpen] = useState(false);

  const fixedLines = state.fixedSubCategories.map((sc) => ({
    label: sc.name,
    value: `${Math.round(sc.budget)}€`,
  }));

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.body}>
        <FlatList
          data={displayCategories}
          keyExtractor={(item) => item.id}
          // Un peu de marge horizontale à l'intérieur de la FlatList elle-même
          // (en plus de celle du body) : sans ça, les cartes touchent le bord
          // de la zone de clip de la liste et leur ombre portée est coupée à
          // gauche/droite (voir "body"/"listPadding" ci-dessous, qui se
          // partagent l'inset total pour garder la même position visuelle).
          contentContainerStyle={{ gap: spacing.md, paddingHorizontal: spacing.sm }}
          ListHeaderComponent={
            <View>
              <View style={styles.monBudget}>
                <View style={styles.h1Row}>
                  <Text style={typography.h1}>Mon budget</Text>
                  <IconButton icon="edit" onPress={() => setBudgetSheetOpen(true)} />
                </View>
                <View style={styles.sousLabelRow}>
                  <Text style={[typography.body, { color: colors.bleue[300] }]}>Budget définis de</Text>
                  <Text style={[typography.body, { color: colors.bleue[300] }]}>{state.budgetDefini}€</Text>
                </View>
                <View style={styles.montantRow}>
                  <Text style={typography.montant}>{Math.round(montantRestant)}€</Text>
                  <Text style={[typography.body, { color: colors.bleue[300] }]}>Restant</Text>
                </View>
              </View>

              <View style={styles.categoriesHeader}>
                <Text style={typography.h1}>Mes catégories</Text>
                <View style={styles.categoriesActions}>
                  <IconButton icon="plus" onPress={() => setAddSheetOpen(true)} />
                  <IconButton icon={editMode ? 'close' : 'trash'} onPress={() => setEditMode((v) => !v)} />
                </View>
              </View>

              <Pressable onPress={() => navigation.navigate('DepensesFixesDetail')} style={{ marginBottom: spacing.md }}>
                <CategoryCard
                  variant="fixe"
                  title="Dépenses fixes"
                  total={`${Math.round(fixedBudgetTotal)}€`}
                  lines={fixedLines}
                />
              </Pressable>
            </View>
          }
          renderItem={({ item }) => {
            const spent = spentForCategory(item.id);
            const remaining = item.budget - spent;
            return (
              <Pressable onPress={() => navigation.navigate('CategorieDetail', { categoryId: item.id })}>
                <View style={styles.categoryRow}>
                  <View style={{ flex: 1 }}>
                    <CategoryCard
                      variant="normal"
                      title={item.name}
                      total={`${item.budget}€`}
                      remaining={`${Math.round(remaining)}€`}
                      color={item.color}
                    />
                  </View>
                  {editMode && item.id !== NON_CATEGORISE_ID && (
                    <IconButton icon="trash" onPress={() => deleteCategory(item.id)} style={{ marginLeft: spacing.sm }} />
                  )}
                </View>
              </Pressable>
            );
          }}
        />
      </View>

      <View style={styles.navBarWrapper}>
        <NavBar
          active="categories"
          onNavigate={(section) => {
            if (section === 'fixe') navigation.navigate('DepensesFixes');
            if (section === 'historique') navigation.navigate('Historique');
          }}
          onAdd={() => navigation.navigate('AjouterDepense')}
        />
      </View>

      <AjouterCategorieSheet visible={addSheetOpen} onClose={() => setAddSheetOpen(false)} />

      <ModifierBudgetSheet
        visible={budgetSheetOpen}
        onClose={() => setBudgetSheetOpen(false)}
        name="Mon budget"
        currentBudget={state.budgetDefini}
        onSubmit={updateBudgetDefini}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.blanc,
  },
  body: {
    flex: 1,
    // 8px de moins ici, repris par le padding interne de la FlatList
    // (spacing.sm) pour laisser respirer l'ombre des cartes sans changer
    // la position visuelle globale (inset total inchangé : 24px).
    paddingHorizontal: layout.screenPaddingX - spacing.sm,
    paddingTop: spacing.xl,
  },
  monBudget: {
    gap: spacing.xs,
    marginBottom: spacing.xxl,
  },
  h1Row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sousLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  montantRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  categoriesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  categoriesActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  categoryRow: { flexDirection: 'row', alignItems: 'center' },
  navBarWrapper: {
    paddingHorizontal: layout.screenPaddingX,
    paddingBottom: spacing.md,
  },
});
