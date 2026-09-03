import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

type Props = {
  label: string;
  size?: number;
};

const PALETTE = [
  { fond: colors.categorie.vertClaire, texte: colors.categorie.vertSombre },
  { fond: colors.categorie.mauveClaire, texte: colors.categorie.mauveSombre },
  { fond: colors.categorie.bleueClaire, texte: colors.categorie.bleueSombre },
  { fond: colors.bleue[100], texte: colors.bleue[700] },
];

function paletteIndexFor(label: string) {
  let hash = 0;
  for (let i = 0; i < label.length; i++) hash = (hash + label.charCodeAt(i)) % PALETTE.length;
  return hash;
}

/**
 * Badge rond "initiale + couleur" utilisé comme repère visuel pour une dépense
 * fixe (ex: Netflix, EDF...) tant que les vrais logos de marque ne sont pas
 * branchés (décision en attente — voir conversation avec l'utilisateur).
 * Prévu pour être remplacé par une vraie image sans changer les écrans
 * appelants : il suffira de rendre une <Image> à la place quand la source du
 * logo sera décidée (bibliothèque de logos ou upload utilisateur).
 */
export function Avatar({ label, size = 38 }: Props) {
  const { fond, texte } = PALETTE[paletteIndexFor(label)];
  const initiale = label.trim().charAt(0).toUpperCase() || '?';
  return (
    <View style={[styles.base, { width: size, height: size, borderRadius: size / 2, backgroundColor: fond }]}>
      <Text style={[styles.label, { color: texte, fontSize: size * 0.42 }]}>{initiale}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: 'Outfit_700Bold' },
});
