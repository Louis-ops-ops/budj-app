import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, Calendrier, Icon, NavBar, SwipeableRow } from '../components';
import { useBudj } from '../data/BudjContext';
import { colors, layout, spacing, typography } from '../theme';
import type { RootScreenProps } from '../navigation/types';
import { AjouterDepenseFixeSheet } from './AjouterDepenseFixeSheet';
import { AjouterDepenseSheet } from './AjouterDepenseSheet';

/**
 * Onglet "Fixe" de la barre de navigation — pixel perfect sur le node Figma
 * 9:174 "Dépenses fixe" : calendrier du mois en cours (node 9:1095, voir
 * Calendrier.tsx), bouton plein largeur "+ Ajouter" qui ouvre la feuille
 * d'ajout, et la liste des prochaines dépenses fixes SANS encadré (juste
 * l'avatar + le texte, comme dans le design — aucune carte ne les entoure).
 */
export function DepensesFixesScreen({ navigation }: RootScreenProps<'DepensesFixes'>) {
  const { state, fixedBudgetTotal, deleteFixedExpense } = useBudj();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [addDepenseSheetOpen, setAddDepenseSheetOpen] = useState(false);

  const expenseCountByDay = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const f of state.fixedExpenses) counts[f.dayOfMonth] = (counts[f.dayOfMonth] ?? 0) + 1;
    return counts;
  }, [state.fixedExpenses]);

  const visibleExpenses = useMemo(() => {
    const list = selectedDay ? state.fixedExpenses.filter((f) => f.dayOfMonth === selectedDay) : state.fixedExpenses;
    return [...list].sort((a, b) => a.dayOfMonth - b.dayOfMonth);
  }, [state.fixedExpenses, selectedDay]);

  const subCategoryName = (id: string) => state.fixedSubCategories.find((c) => c.id === id)?.name ?? '';

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.body}>
        <View style={styles.header}>
          <Text style={typography.h1}>Mes dépenses fixes</Text>
          <View style={styles.sousLabelRow}>
            <Text style={[typography.body, { color: colors.bleue[300] }]}>
              {state.fixedExpenses.length} dépenses fixes mensuel,
            </Text>
            <Text style={[typography.body, { color: colors.bleue[300] }]}>{Math.round(fixedBudgetTotal)}€</Text>
          </View>
        </View>

        <Calendrier expenseCountByDay={expenseCountByDay} selectedDay={selectedDay} onSelectDay={setSelectedDay} />

        <View style={styles.list}>
          {visibleExpenses.map((item) => (
            <SwipeableRow key={item.id} onDelete={() => deleteFixedExpense(item.id)} backgroundColor={colors.blanc}>
              <View style={styles.row}>
                <View style={styles.rowInfo}>
                  <Avatar label={item.label} />
                  <View>
                    <Text style={[typography.bodyMedium, { color: colors.bleue[500] }]}>{item.label}</Text>
                    <Text style={[typography.labelXxs, { color: colors.bleue[300] }]}>{subCategoryName(item.subCategoryId)}</Text>
                  </View>
                </View>
                <Text style={[typography.bodyBold, { color: colors.bleue[500] }]}>-{item.amount}€</Text>
              </View>
            </SwipeableRow>
          ))}
        </View>
      </View>

      <View style={styles.navBarWrapper}>
        <Pressable style={styles.addButton} onPress={() => setAddSheetOpen(true)}>
          <Icon name="plus" size={20} color={colors.blanc} />
          <Text style={styles.addButtonLabel}>Ajouter</Text>
        </Pressable>

        <NavBar
          active="fixe"
          onNavigate={(section) => {
            if (section === 'categories') navigation.navigate('MonBudget');
            if (section === 'historique') navigation.navigate('Historique');
          }}
          onAdd={() => setAddDepenseSheetOpen(true)}
        />
      </View>

      <AjouterDepenseFixeSheet visible={addSheetOpen} onClose={() => setAddSheetOpen(false)} />
      <AjouterDepenseSheet visible={addDepenseSheetOpen} onClose={() => setAddDepenseSheetOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.blanc },
  body: { flex: 1, paddingHorizontal: layout.screenPaddingX, paddingTop: spacing.xl, gap: spacing.xxl },
  header: { gap: spacing.xs },
  sousLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  list: { gap: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  navBarWrapper: { paddingHorizontal: layout.screenPaddingX, paddingBottom: spacing.md, gap: spacing.md },
  addButton: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.bleue[500],
    borderRadius: 999,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  addButtonLabel: { fontFamily: 'Outfit_500Medium', fontSize: 18, lineHeight: 20, color: colors.blanc },
});
