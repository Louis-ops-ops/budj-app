import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

type FixeLine = { label: string; value: string };

type Props =
  | {
      variant: 'fixe';
      title: string;
      total: string;
      lines: FixeLine[];
    }
  | {
      variant: 'normal';
      title: string;
      /** Budget alloué à la catégorie (affiché en petit, en bas) */
      total: string;
      /** Budget restant (affiché en grand, à côté du titre) */
      remaining: string;
      totalLabel?: string;
      color: { fond: string; texte: string };
    };

/**
 * Carte de catégorie ("Div_categorie" / "Div_categorie_depenses_fixes"
 * dans le design system). Le variant "fixe" est réservé aux dépenses fixes
 * (non supprimables) et affiche le détail des sous-catégories ; le variant
 * "normal" met en avant le budget RESTANT (ligne du haut, à côté du titre)
 * et rappelle le budget alloué en dessous (mise à jour Figma : les deux
 * valeurs ont été inversées par rapport à la version précédente).
 */
export function CategoryCard(props: Props) {
  if (props.variant === 'fixe') {
    return (
      <View style={[styles.card, { backgroundColor: colors.bleue[200] }]}>
        <View style={styles.row}>
          <Text style={[typography.bodyMedium, { color: colors.bleue[950] }]}>{props.title}</Text>
          <Text style={[typography.bodyMedium, { color: colors.bleue[950] }]}>{props.total}</Text>
        </View>
        {props.lines.map((line, i) => (
          <View style={styles.row} key={i}>
            <Text style={[typography.labelXs, { color: colors.bleue[400] }]}>{line.label}</Text>
            <Text style={[typography.labelXs, { color: colors.bleue[400] }]}>{line.value}</Text>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: props.color.fond }]}>
      <View style={styles.row}>
        <Text style={typography.bodyMedium}>{props.title}</Text>
        <Text style={typography.bodyMedium}>{props.remaining}</Text>
      </View>
      <View style={styles.row}>
        <Text style={[typography.labelXxs, { color: props.color.texte }]}>
          {props.totalLabel ?? 'Budget alloué'}
        </Text>
        <Text style={[typography.labelXxs, { color: props.color.texte }]}>{props.total}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: radius.card,
    padding: spacing.md,
    gap: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
});
