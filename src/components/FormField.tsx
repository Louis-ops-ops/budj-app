import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import { Icon } from './Icon';

const boxStyle = {
  backgroundColor: colors.blanc,
  borderWidth: 2,
  borderColor: colors.bleue[100],
  borderRadius: radius.card,
  padding: spacing.md,
  width: '100%' as const,
};

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  keyboardType?: TextInputProps['keyboardType'];
};

/**
 * Champ "Formulaire" du design system (popup Figma 18:381 "Pop up ajouter") :
 * un petit libellé fixe au-dessus, la valeur saisie juste en dessous. Le
 * placeholder est en bleue-300 — un ton plus clair que le bleue-400 initial,
 * pour rester discret et rester au même niveau visuel que le libellé gris
 * au-dessus plutôt que d'attirer autant l'œil qu'une vraie valeur saisie.
 * Le placeholder disparaît dès que le champ prend le focus (pas seulement
 * une fois un caractère tapé), pour laisser toute la place à la saisie.
 */
export function FormField({ label, value, onChangeText, placeholder, keyboardType }: FieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={boxStyle}>
      <Text style={[typography.labelXs, { color: colors.gris }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={focused ? '' : placeholder}
        placeholderTextColor={colors.bleue[300]}
        keyboardType={keyboardType}
        style={[typography.body, { color: colors.bleue[400], padding: 0, marginTop: 2 }]}
      />
    </View>
  );
}

type SelectFieldProps = {
  label: string;
  value?: string;
  onPress: () => void;
  open?: boolean;
};

/** Variante "sélecteur" du champ Formulaire (ex: Sous catégorie) — une ligne + chevron. */
export function FormSelectField({ label, value, onPress, open }: SelectFieldProps) {
  return (
    <Pressable onPress={onPress} style={[boxStyle, styles.selectRow]}>
      <Text style={[typography.body, { color: value ? colors.bleue[400] : colors.gris }]}>{value ?? label}</Text>
      <View style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}>
        <Icon name="chevronDown" size={18} color={colors.gris} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  selectRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
