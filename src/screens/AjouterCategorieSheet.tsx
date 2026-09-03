import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomSheet, FormField, Icon } from '../components';
import { useBudj } from '../data/BudjContext';
import { categoryPalette, colors, spacing, typography } from '../theme';
import type { CategoryColor } from '../data/types';

type Props = {
  visible: boolean;
  onClose: () => void;
};

/**
 * Ajout d'une catégorie — feuille qui glisse depuis le bas (voir popup
 * Figma 18:497 "Pop up ajouter une carégorie") : mêmes champs "Formulaire"
 * (Nom, Budget aloué avec le reste disponible en rappel), même sélecteur de
 * couleur en pastilles rondes, même bouton "Ajouter la catégorie".
 */
export function AjouterCategorieSheet({ visible, onClose }: Props) {
  const { state, addCategory } = useBudj();

  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [color, setColor] = useState<CategoryColor>(categoryPalette[0]);

  const allocated =
    state.fixedSubCategories.reduce((sum, c) => sum + c.budget, 0) +
    state.categories.reduce((sum, c) => sum + c.budget, 0);
  const available = state.budgetDefini - allocated;

  const parsedBudget = Number(budget.replace(',', '.'));
  const canSubmit = !!name.trim() && Number.isFinite(parsedBudget) && parsedBudget > 0;

  const reset = () => {
    setName('');
    setBudget('');
    setColor(categoryPalette[0]);
  };

  const submit = () => {
    if (!canSubmit) return;
    addCategory({ name: name.trim(), budget: parsedBudget, color });
    reset();
    onClose();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={() => {
        reset();
        onClose();
      }}
    >
      <Text style={typography.h1}>Nouvelle catégorie</Text>

      <View style={styles.form}>
        <FormField label="Nom" value={name} onChangeText={setName} placeholder="Exemple, courses" />

        <FormField
          label={`Budget aloué (${Math.max(0, Math.round(available))}€ disponible)`}
          value={budget}
          onChangeText={setBudget}
          placeholder="Montant €"
          keyboardType="decimal-pad"
        />

        <View style={styles.colorField}>
          <Text style={[typography.labelXs, { color: colors.gris }]}>Choix de la couleur</Text>
          <View style={styles.colorRow}>
            {categoryPalette.map((c, i) => (
              <Pressable
                key={i}
                onPress={() => setColor(c)}
                style={[
                  styles.swatch,
                  { backgroundColor: c.fond },
                  color.fond === c.fond && styles.swatchSelected,
                ]}
              />
            ))}
          </View>
        </View>
      </View>

      <Pressable onPress={submit} disabled={!canSubmit} style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}>
        <Icon name="chevronRight" size={20} color={colors.blanc} />
        <Text style={styles.submitLabel}>Ajouter la catégorie</Text>
      </Pressable>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  form: { width: '100%', gap: spacing.md },
  colorField: {
    width: '100%',
    backgroundColor: colors.blanc,
    borderWidth: 2,
    borderColor: colors.bleue[100],
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.md,
  },
  colorRow: { flexDirection: 'row', justifyContent: 'space-between' },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
  swatchSelected: { borderWidth: 3, borderColor: colors.noir },
  submitButton: {
    width: '100%',
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bleue[500],
    borderRadius: 999,
    paddingVertical: spacing.md,
  },
  submitButtonDisabled: { opacity: 0.4 },
  submitLabel: { fontFamily: 'Outfit_500Medium', fontSize: 18, lineHeight: 20, color: colors.blanc },
});
