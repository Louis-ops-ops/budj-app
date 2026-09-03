import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import type { CategoryColor } from '../data/types';

type Props = {
  budget: number;
  spent: number;
  color: CategoryColor;
};

/**
 * "Div_categorie" du design system (node Figma 18:937, réutilisé identique
 * sur 29:510 "Déplacer une dépense") : budget total / dépensé / barre de
 * progression, colorée avec la couleur de la catégorie.
 */
export function CategoryStatsCard({ budget, spent, color }: Props) {
  const pct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;

  return (
    <View style={styles.card}>
      <View style={styles.infos}>
        <View style={styles.row}>
          <Text style={styles.h1Label}>Budget total</Text>
          <Text style={styles.h1Label}>{Math.round(budget)}€</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.subLabel}>Dépensé</Text>
          <Text style={[styles.subLabel, { color: color.texte }]}>{Math.round(spent)}€</Text>
        </View>
      </View>
      <View style={styles.progressRow}>
        <View style={[styles.track, { backgroundColor: color.fond }]}>
          <View style={[styles.fill, { backgroundColor: color.texte, width: `${pct}%` }]} />
        </View>
        <Text style={[styles.pctLabel, { color: color.texte }]}>{pct}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: colors.bleue[50],
    borderRadius: radius.card,
    padding: spacing.md,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infos: { gap: spacing.xs },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  h1Label: { fontFamily: 'Outfit_500Medium', fontSize: 18, lineHeight: 20, color: colors.texte },
  subLabel: { fontFamily: 'Outfit_400Regular', fontSize: 16, lineHeight: 18, color: colors.texte },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  track: { flex: 1, height: 8, borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
  pctLabel: { fontFamily: 'Outfit_500Medium', fontSize: 10, lineHeight: 12 },
});
