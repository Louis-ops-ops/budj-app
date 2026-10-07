import React, { useState } from 'react';
import { View } from 'react-native';
import { AddChip, AmountInput, Button, CategoryChip, DayPicker, Text, TextField, TextLink } from '../../components';
import { useBudj } from '../../data/BudjContext';
import { fixedAnnualCost, normalizeName } from '../../data/selectors';
import { SheetScreen } from '../../navigation/SheetScreen';
import type { RootScreenProps } from '../../navigation/types';
import { makeStyles } from '../../theme';
import { confirmDestructive } from '../../utils/confirm';
import { centsToInput, formatMoney, parseAmountInput } from '../../utils/money';
import { ChipWrap, SheetHeader, SheetLabel, SheetSection } from './SheetParts';

/**
 * Pop-up « Nouvelle dépense fixe » (Figma 209:1378, 209:1450), qui sert aussi
 * à modifier ou supprimer une dépense fixe existante.
 */
export function FixedExpenseFormSheet({ navigation, route }: RootScreenProps<'FixedExpenseForm'>) {
  const styles = useStyles();
  const { data, addFixedExpense, updateFixedExpense, deleteFixedExpense, addFixedSubcategory } = useBudj();
  const editing = data.fixedExpenses.find((fixed) => fixed.id === route.params?.fixedExpenseId);
  const [amount, setAmount] = useState(() => (editing ? centsToInput(editing.amount) : ''));
  const [label, setLabel] = useState(editing?.label ?? '');
  const [day, setDay] = useState<number | null>(editing?.dayOfMonth ?? route.params?.dayOfMonth ?? null);
  const [subcategoryId, setSubcategoryId] = useState<string | null>(editing?.subcategoryId ?? null);
  const [creatingSubcategory, setCreatingSubcategory] = useState(false);
  const [newSubcategory, setNewSubcategory] = useState('');

  const cents = parseAmountInput(amount);
  const hasSubcategory = data.fixedSubcategories.some((sub) => sub.id === subcategoryId);
  const canSubmit = cents > 0 && normalizeName(label) !== '' && day !== null && hasSubcategory;

  const createSubcategory = () => {
    const name = normalizeName(newSubcategory);
    if (!name) return;
    const subcategory = addFixedSubcategory(name);
    setSubcategoryId(subcategory.id);
    setNewSubcategory('');
    setCreatingSubcategory(false);
  };

  const submit = () => {
    if (!canSubmit || day === null || !subcategoryId) return;
    const values = { label: normalizeName(label), amount: cents, dayOfMonth: day, subcategoryId };
    if (editing) updateFixedExpense(editing.id, values);
    else addFixedExpense(values);
    navigation.goBack();
  };

  const remove = () => {
    if (!editing) return;
    confirmDestructive({
      title: 'Supprimer la dépense fixe ?',
      message: `« ${editing.label} » ne sera plus comptée chaque mois.`,
      confirmLabel: 'Supprimer',
      onConfirm: () => {
        deleteFixedExpense(editing.id);
        navigation.goBack();
      },
    });
  };

  return (
    <SheetScreen accessibilityLabel={editing ? 'Modifier la dépense fixe' : 'Nouvelle dépense fixe'}>
      <SheetHeader title={editing ? 'Modifier la dépense fixe' : 'Nouvelle dépense fixe'} />

      <AmountInput
        value={amount}
        onChangeText={setAmount}
        autoFocus={!editing}
        accessibilityLabel="Montant prélevé chaque mois"
        helper={
          cents > 0 ? (
            <Text variant="label-regular" color="secondary" style={styles.center}>
              {'Soit '}
              <Text variant="label-bold" color="brand">
                {formatMoney(fixedAnnualCost(cents))}
              </Text>
              {' par an'}
            </Text>
          ) : (
            'Montant prélevé chaque mois'
          )
        }
      />

      <TextField
        type="double"
        label="Libellé"
        value={label}
        placeholder="Ex : Netflix, Loyer, EDF…"
        onChangeText={setLabel}
        maxLength={40}
        returnKeyType="done"
      />

      <SheetSection gap={8}>
        <View style={styles.dayLabel}>
          <SheetLabel>Jour du prélèvement</SheetLabel>
          <Text variant="label-regular" color="secondary">
            {day === null ? 'Choisis un jour' : `Le ${day} de chaque mois`}
          </Text>
        </View>
        <DayPicker value={day} onChange={setDay} />
      </SheetSection>

      <SheetSection>
        <SheetLabel>Sous-catégorie</SheetLabel>
        <ChipWrap>
          {data.fixedSubcategories.map((sub) => (
            <CategoryChip
              key={sub.id}
              label={sub.name}
              color="bleu"
              selected={sub.id === subcategoryId}
              onPress={() => setSubcategoryId(sub.id)}
            />
          ))}
          {!creatingSubcategory && (
            <AddChip onPress={() => setCreatingSubcategory(true)} accessibilityLabel="Nouvelle sous-catégorie" />
          )}
        </ChipWrap>
        {creatingSubcategory && (
          <>
            <TextField
              value={newSubcategory}
              placeholder="Nom de la sous-catégorie"
              onChangeText={setNewSubcategory}
              autoFocus
              maxLength={24}
              returnKeyType="done"
              onSubmitEditing={createSubcategory}
            />
            <TextLink label="Créer la sous-catégorie" icon="add" onPress={createSubcategory} />
          </>
        )}
      </SheetSection>

      <View style={styles.actions}>
        <Button
          label={editing ? 'Enregistrer' : 'Ajouter la dépense fixe'}
          icon={editing ? undefined : 'add'}
          fullWidth
          disabled={!canSubmit}
          onPress={submit}
        />
        {editing && <TextLink label="Supprimer la dépense fixe" icon="delete" tone="danger" onPress={remove} />}
      </View>
    </SheetScreen>
  );
}

const useStyles = makeStyles((t) => ({
  center: {
    textAlign: 'center',
  },
  dayLabel: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: t.spacing[8],
  },
  actions: {
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: t.spacing[12],
  },
}));
