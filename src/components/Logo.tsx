import React from 'react';
import { View } from 'react-native';
import { makeStyles, useTheme, type CategoryTone } from '../theme';
import { Text } from './Text';

type Props = {
  /** Libellé de la dépense fixe (Netflix, EDF…) : son initiale sert de logo. */
  label: string;
};

const PALETTE: CategoryTone[] = ['bleu', 'vert', 'mauve', 'orange', 'rouge', 'cyan'];

function toneFor(label: string): CategoryTone {
  let hash = 0;
  for (let i = 0; i < label.length; i++) hash = (hash * 31 + label.charCodeAt(i)) % 9973;
  return PALETTE[hash % PALETTE.length];
}

/**
 * Pastille ronde d'une dépense fixe (ellipse « Logo » 38×38 de la Ligne
 * dépense). En attendant de vrais logos de marques, elle affiche l'initiale
 * du libellé sur une teinte de catégorie stable pour un même libellé.
 */
export function Logo({ label }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const tone = toneFor(label.trim().toLowerCase());
  const initial = label.trim().charAt(0).toUpperCase() || '?';
  return (
    <View style={[styles.circle, { backgroundColor: colors.category[tone].bg }]} accessible={false}>
      <Text variant="body-bold" categoryColor={tone}>
        {initial}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  circle: {
    width: t.sizes.logo,
    height: t.sizes.logo,
    borderRadius: t.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
