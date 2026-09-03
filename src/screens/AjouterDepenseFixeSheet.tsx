import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomSheet, FormField, FormSelectField, Icon } from '../components';
import { useBudj } from '../data/BudjContext';
import { colors, spacing, typography } from '../theme';

const NEW_SUB_CATEGORY = '__new__';

type Props = {
  visible: boolean;
  onClose: () => void;
  initialSubCategoryId?: string;
};

/**
 * Ajout d'une dépense fixe — feuille qui glisse depuis le bas (voir popup
 * Figma 18:381 "Pop up ajouter / Empty sate", section "Dépenses fixe") :
 * mêmes champs "Formulaire" encadrés (libellé, sous-catégorie, jour du mois,
 * montant), même bouton "Valider" plein largeur. Rendue en overlay local
 * (pas une route de navigation) pour pouvoir s'ouvrir aussi bien depuis
 * l'écran calendrier que depuis le détail des dépenses fixes.
 */
export function AjouterDepenseFixeSheet({ visible, onClose, initialSubCategoryId }: Props) {
  const { state, addFixedExpense } = useBudj();

  const [label, setLabel] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState('');
  const [amount, setAmount] = useState('');
  const [subCategoryId, setSubCategoryId] = useState<string | undefined>(initialSubCategoryId);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubBudget, setNewSubBudget] = useState('');

  const isCreatingNew = subCategoryId === NEW_SUB_CATEGORY;
  const selectedSubName = state.fixedSubCategories.find((c) => c.id === subCategoryId)?.name;
  const parsedAmount = Number(amount.replace(',', '.'));
  const parsedDay = Number(dayOfMonth);

  const canSubmit =
    parsedAmount > 0 &&
    !!label.trim() &&
    parsedDay >= 1 &&
    parsedDay <= 31 &&
    (isCreatingNew ? !!newSubName.trim() && Number.isFinite(Number(newSubBudget.replace(',', '.'))) : !!subCategoryId);

  const reset = () => {
    setLabel('');
    setDayOfMonth('');
    setAmount('');
    setSubCategoryId(initialSubCategoryId);
    setPickerOpen(false);
    setNewSubName('');
    setNewSubBudget('');
  };

  const submit = () => {
    if (!canSubmit) return;
    addFixedExpense({
      subCategoryId: isCreatingNew ? undefined : subCategoryId,
      newSubCategory: isCreatingNew
        ? { name: newSubName.trim(), budget: Number(newSubBudget.replace(',', '.')) }
        : undefined,
      label: label.trim(),
      amount: parsedAmount,
      dayOfMonth: parsedDay,
    });
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
      <Text style={typography.h1}>Ajouter une dépense</Text>

      <View style={styles.form}>
        <FormField
          label="Libellé de dépense"
          value={label}
          onChangeText={setLabel}
          placeholder="(Nom de la dépense)"
        />

        <FormSelectField
          label="Sous catégorie"
          value={isCreatingNew ? 'Nouvelle sous-catégorie' : selectedSubName}
          open={pickerOpen}
          onPress={() => setPickerOpen((v) => !v)}
        />

        {pickerOpen && (
          <View style={styles.picker}>
            {state.fixedSubCategories.map((sc) => (
              <Pressable
                key={sc.id}
                onPress={() => {
                  setSubCategoryId(sc.id);
                  setPickerOpen(false);
                }}
                style={[styles.chip, subCategoryId === sc.id && styles.chipSelected]}
              >
                <Text style={typography.labelXsMedium}>{sc.name}</Text>
              </Pressable>
            ))}
            <Pressable
              onPress={() => {
                setSubCategoryId(NEW_SUB_CATEGORY);
                setPickerOpen(false);
              }}
              style={[styles.chip, isCreatingNew && styles.chipSelected]}
            >
              <Text style={typography.labelXsMedium}>+ Nouvelle</Text>
            </Pressable>
          </View>
        )}

        {isCreatingNew && (
          <>
            <FormField
              label="Nom de la sous-catégorie"
              value={newSubName}
              onChangeText={setNewSubName}
              placeholder="(ex: Abonnements)"
            />
            <FormField
              label="Budget de la sous-catégorie"
              value={newSubBudget}
              onChangeText={setNewSubBudget}
              placeholder="(Euros)"
              keyboardType="decimal-pad"
            />
          </>
        )}

        <FormField
          label="Quel jour du mois ?"
          value={dayOfMonth}
          onChangeText={setDayOfMonth}
          placeholder="(jour de prélévement)"
          keyboardType="number-pad"
        />

        <FormField
          label="Combien ?"
          value={amount}
          onChangeText={setAmount}
          placeholder="(Euros)"
          keyboardType="decimal-pad"
        />
      </View>

      <Pressable
        onPress={submit}
        disabled={!canSubmit}
        style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
      >
        <Icon name="check" size={20} color={colors.blanc} />
        <Text style={styles.submitLabel}>Valider</Text>
      </Pressable>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  form: { width: '100%', gap: spacing.md },
  picker: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: -spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 999, backgroundColor: colors.bleue[50] },
  chipSelected: { borderWidth: 2, borderColor: colors.bleue[500] },
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
