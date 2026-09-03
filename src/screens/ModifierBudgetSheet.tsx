import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AmountField, BottomSheet, Icon } from '../components';
import { colors, spacing, typography } from '../theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  /** Nom affiché dans le titre "Modifier : {name}" — catégorie normale ou sous-catégorie de dépenses fixes */
  name: string;
  currentBudget: number;
  onSubmit: (newBudget: number) => void;
};

/**
 * Modifier le budget d'une catégorie (ou d'une sous-catégorie de dépenses
 * fixes — même popup Figma réutilisé, il n'y a qu'un champ montant, pas de
 * champ nom) — feuille qui glisse depuis le bas (popup Figma 29:452
 * "Pop up modifier X budget") : titre "Modifier : {nom}", budget actuel en
 * rappel, gros champ montant avec placeholder "0€", bouton "Confirmer
 * modification".
 */
export function ModifierBudgetSheet({ visible, onClose, name, currentBudget, onSubmit }: Props) {
  const [amount, setAmount] = useState('');

  const parsedAmount = Number(amount.replace(',', '.'));
  const canSubmit = amount.trim().length > 0 && Number.isFinite(parsedAmount) && parsedAmount > 0;

  const submit = () => {
    if (!canSubmit) return;
    onSubmit(parsedAmount);
    setAmount('');
    onClose();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={() => {
        setAmount('');
        onClose();
      }}
    >
      <View style={styles.titleBlock}>
        <Text style={typography.h1}>Modifier : {name}</Text>
        <View style={styles.sousLabelRow}>
          <Text style={[typography.body, { color: colors.bleue[300] }]}>Budget actuel</Text>
          <Text style={[typography.body, { color: colors.bleue[300] }]}>{currentBudget}€</Text>
        </View>
      </View>

      <AmountField value={amount} onChangeText={setAmount} />

      <Pressable onPress={submit} disabled={!canSubmit} style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}>
        <Icon name="chevronRight" size={20} color={colors.blanc} />
        <Text style={styles.submitLabel}>Confirmer modification</Text>
      </Pressable>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  titleBlock: { width: '100%', gap: spacing.sm },
  sousLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
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
