import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme';

type Props = {
  value: string;
  onChangeText: (t: string) => void;
  fontSize?: number;
};

/**
 * Gros champ montant avec placeholder "0€" gris clair (voir popups Figma
 * 29:452 "Pop up modifier X budget" et 18:472 "Pop up ajout") — partagé
 * entre les deux pour éviter de dupliquer ce pattern.
 */
export function AmountField({ value, onChangeText, fontSize = 96 }: Props) {
  return (
    <View style={styles.row}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType="decimal-pad"
        placeholder="0€"
        placeholderTextColor={colors.gris}
        style={[styles.text, { fontSize, color: colors.bleue[500] }]}
      />
      {!!value && <Text style={[styles.text, { fontSize, color: colors.bleue[500] }]}>€</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { width: '100%', flexDirection: 'row', alignItems: 'center' },
  text: { fontFamily: 'Outfit_500Medium', padding: 0 },
});
