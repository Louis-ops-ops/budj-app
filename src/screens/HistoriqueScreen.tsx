import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavBar } from '../components';
import { useBudj } from '../data/BudjContext';
import type { Expense } from '../data/types';
import { colors, layout, spacing, typography } from '../theme';
import { formatEuro } from '../utils/format';
import type { RootScreenProps } from '../navigation/types';

/**
 * Pixel perfect sur le node Figma 19:1175 "Historique des dépense" :
 * - sous-titre "Dépensé ce mois-ci" = vrai total du mois en cours (pas tout
 *   l'historique)
 * - un seul encadré (bleue-50, radius 8) par jour, qui regroupe toutes les
 *   dépenses de ce jour — aucune dépense n'a son propre encadré individuel
 * - libellé + montant colorés avec la couleur de la catégorie de la dépense
 *   (le sous-libellé "moyen de paiement" reste gris, comme dans le design)
 */
export function HistoriqueScreen({ navigation }: RootScreenProps<'Historique'>) {
  const { state, displayCategories } = useBudj();

  // displayCategories (pas state.categories) : une dépense orpheline suite à
  // une suppression de catégorie doit apparaître en gris ("Non catégorisé"),
  // pas retomber sur la couleur noire par défaut.
  const categoryById = useMemo(() => new Map(displayCategories.map((c) => [c.id, c])), [displayCategories]);

  const currentMonthPrefix = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  const spentThisMonth = useMemo(
    () => state.expenses.filter((e) => e.date.startsWith(currentMonthPrefix)).reduce((sum, e) => sum + e.amount, 0),
    [state.expenses, currentMonthPrefix]
  );

  const sections = useMemo(() => {
    const byDate = new Map<string, Expense[]>();
    for (const e of state.expenses) {
      const list = byDate.get(e.date) ?? [];
      list.push(e);
      byDate.set(e.date, list);
    }
    return Array.from(byDate.entries())
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([date, items]) => ({
        date,
        title: formatDate(date),
        total: items.reduce((s, d) => s + d.amount, 0),
        items,
      }));
  }, [state.expenses]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.body}>
        <View style={styles.header}>
          <Text style={typography.h1}>Historique des dépenses</Text>
          <View style={styles.sousLabelRow}>
            <Text style={[typography.body, { color: colors.bleue[300] }]}>Dépensé ce mois-ci</Text>
            <Text style={[typography.body, { color: colors.bleue[300] }]}>{formatEuro(spentThisMonth)}€</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.list}>
          {sections.map((section) => (
            <View key={section.date} style={styles.daySection}>
              <View style={styles.sectionHeader}>
                <Text style={typography.h2}>{section.title}</Text>
                <Text style={[typography.labelXs, { color: colors.gris }]}>-{formatEuro(section.total)}€</Text>
              </View>

              <View style={styles.dayBox}>
                {section.items.map((item) => {
                  const color = categoryById.get(item.categoryId)?.color.texte ?? colors.texte;
                  return (
                    <View key={item.id} style={styles.row}>
                      <View>
                        <Text style={[typography.bodyMedium, { color }]}>{item.label}</Text>
                        <Text style={[typography.labelXxs, { color: colors.gris }]}>{item.paymentMethod}</Text>
                      </View>
                      <Text style={[typography.bodyBold, { color }]}>-{formatEuro(item.amount)}€</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.navBarWrapper}>
        <NavBar
          active="historique"
          onNavigate={(section) => {
            if (section === 'categories') navigation.navigate('MonBudget');
            if (section === 'fixe') navigation.navigate('DepensesFixes');
          }}
          onAdd={() => navigation.navigate('AjouterDepense')}
        />
      </View>
    </SafeAreaView>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const label = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.blanc },
  body: { flex: 1, paddingHorizontal: layout.screenPaddingX, paddingTop: spacing.xl },
  header: { gap: spacing.xs, marginBottom: spacing.xxl },
  sousLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  list: { gap: spacing.xxl },
  daySection: { gap: spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  dayBox: { backgroundColor: colors.bleue[50], borderRadius: 8, padding: spacing.lg, gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navBarWrapper: { paddingHorizontal: layout.screenPaddingX, paddingBottom: spacing.md },
});
