import React from 'react';
import { Pressable } from 'react-native';
import { makeStyles, useTheme, type CategoryTone } from '../theme';
import { Text } from './Text';

type Props = {
  label: string;
  color: CategoryTone;
  selected?: boolean;
  onPress?: () => void;
};

/** Chip de choix d'une catégorie (Figma « Chip catégorie » 205:261). */
export function CategoryChip({ label, color, selected = false, onPress }: Props) {
  const styles = useStyles();
  const { colors, sizes, spacing, text } = useTheme();
  const tone = colors.category[color];
  const height = text['label-medium'].lineHeight + spacing[8] * 2;
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      hitSlop={(sizes.touchTarget - height) / 2}
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected }}
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: selected ? tone.fg : tone.bg },
        // En bleu (sous-catégories de dépenses fixes), la chip non sélectionnée est contourée.
        color === 'bleu' && !selected && styles.outlined,
        pressed && styles.pressed,
      ]}
    >
      <Text variant="label-medium" color="onAccent" categoryColor={selected ? undefined : color} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing[6],
    // Contour toujours présent (transparent par défaut) : toutes les chips ont la même taille.
    borderWidth: t.sizes.borderWidth.thin,
    borderColor: t.colors.bg.none,
    paddingHorizontal: t.spacing[16] - t.sizes.borderWidth.thin,
    paddingVertical: t.spacing[8] - t.sizes.borderWidth.thin,
    borderRadius: t.radius.full,
  },
  outlined: {
    borderColor: t.colors.border.brandSubtle,
  },
  pressed: {
    opacity: t.opacity.pressed,
  },
}));
