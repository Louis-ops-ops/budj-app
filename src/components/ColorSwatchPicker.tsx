import React from 'react';
import { Pressable, View } from 'react-native';
import { CATEGORY_COLORS, makeStyles, useTheme, type CategoryColor } from '../theme';
import { capitalize } from '../utils/dateLabels';

type Props = {
  value: CategoryColor;
  onChange: (color: CategoryColor) => void;
};

/**
 * Choix de la couleur d'une catégorie : 5 pastilles de 36 (fond + contour de
 * la teinte), la pastille choisie est entourée d'un anneau de 48.
 */
export function ColorSwatchPicker({ value, onChange }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel="Couleur de la catégorie">
      {CATEGORY_COLORS.map((color) => {
        const tone = colors.category[color];
        const selected = color === value;
        return (
          <Pressable
            key={color}
            onPress={() => onChange(color)}
            accessibilityRole="radio"
            accessibilityLabel={capitalize(color)}
            accessibilityState={{ checked: selected }}
            style={[styles.slot, selected && { borderColor: tone.fg }]}
          >
            <View style={[styles.dot, { backgroundColor: tone.bg, borderColor: tone.fg }]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
  },
  slot: {
    width: t.sizes.swatch.ring,
    height: t.sizes.swatch.ring,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.radius.full,
    borderWidth: t.sizes.borderWidth.thick,
    borderColor: t.colors.bg.none,
  },
  dot: {
    width: t.sizes.swatch.dot,
    height: t.sizes.swatch.dot,
    borderRadius: t.radius.full,
    borderWidth: t.sizes.borderWidth.thick,
  },
}));
