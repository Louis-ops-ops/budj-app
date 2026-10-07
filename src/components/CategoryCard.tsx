import React from 'react';
import { Pressable, View } from 'react-native';
import { makeStyles, useTheme, type CategoryTone } from '../theme';
import { formatMoneyCompact } from '../utils/money';
import { Icon } from './Icon';
import { Text } from './Text';

const DELETE_ICON_SIZE = 24;

type Props = {
  category: { name: string; color: CategoryTone };
  /** Restant du mois en centimes (négatif = dépassement). */
  remaining: number;
  /** Budget alloué en centimes. */
  budget: number;
  /** Normal = restant + budget ; Suppression = icône poubelle à la place. */
  mode?: 'normal' | 'delete';
  onPress?: () => void;
  onDelete?: () => void;
};

/** Carte d'une catégorie sur l'accueil (Figma « Carte catégorie » 190:264). */
export function CategoryCard({ category, remaining, budget, mode = 'normal', onPress, onDelete }: Props) {
  const styles = useStyles();
  const { colors, sizes } = useTheme();
  const tone = colors.category[category.color];

  if (mode === 'delete') {
    return (
      <View style={[styles.card, { backgroundColor: tone.bg }]}>
        <View style={styles.row}>
          <Text variant="heading-h3" categoryColor={category.color} numberOfLines={1} style={styles.name}>
            {category.name}
          </Text>
          <Pressable
            onPress={onDelete}
            hitSlop={(sizes.touchTarget - DELETE_ICON_SIZE) / 2}
            accessibilityRole="button"
            accessibilityLabel={`Supprimer la catégorie ${category.name}`}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <Icon name="delete" size={DELETE_ICON_SIZE} color="danger" />
          </Pressable>
        </View>
      </View>
    );
  }

  const isOver = remaining < 0;
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`${category.name}, ${formatMoneyCompact(remaining)} restants sur ${formatMoneyCompact(budget)}`}
      style={({ pressed }) => [styles.card, { backgroundColor: tone.bg }, pressed && styles.pressed]}
    >
      <View style={styles.row}>
        <Text variant="heading-h3" categoryColor={category.color} numberOfLines={1} style={styles.name}>
          {category.name}
        </Text>
        <Text variant="heading-h3" categoryColor={isOver ? undefined : category.color} color="danger">
          {formatMoneyCompact(remaining)}
        </Text>
      </View>
      <View style={styles.row}>
        <Text variant="label-regular">Budget alloué</Text>
        <Text variant="label-regular">{formatMoneyCompact(budget)}</Text>
      </View>
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  card: {
    alignSelf: 'stretch',
    gap: t.spacing[12],
    padding: t.spacing[12],
    borderRadius: t.radius.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing[8],
  },
  name: {
    flexShrink: 1,
  },
  pressed: {
    opacity: t.opacity.pressed,
  },
}));
