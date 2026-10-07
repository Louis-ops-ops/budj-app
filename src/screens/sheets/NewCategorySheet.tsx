import React, { useState } from 'react';
import { View } from 'react-native';
import { Button, CategoryCard, ColorSwatchPicker, ProgressBar, Text, TextField } from '../../components';
import { useBudj } from '../../data/BudjContext';
import { allocatedBudget, isCategoryNameTaken, normalizeName, spendingRatio } from '../../data/selectors';
import type { CategoryColor } from '../../data/types';
import { SheetScreen } from '../../navigation/SheetScreen';
import type { RootScreenProps } from '../../navigation/types';
import { CATEGORY_COLORS, makeStyles } from '../../theme';
import { formatMoney, parseAmountInput, sanitizeAmountInput } from '../../utils/money';
import { SheetHeader, SheetLabel, SheetSection } from './SheetParts';

/**
 * Pop-up « Nouvelle catégorie » (Figma 207:1237) : aperçu en direct, nom,
 * budget, part du budget mensuel déjà répartie, couleur. Prévient sans
 * bloquer si la nouvelle catégorie fait dépasser le budget mensuel.
 */
export function NewCategorySheet({ navigation, route }: RootScreenProps<'NewCategory'>) {
  const styles = useStyles();
  const { data, addCategory } = useBudj();
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [color, setColor] = useState<CategoryColor>(() => {
    const used = new Set(data.categories.map((category) => category.color));
    return CATEGORY_COLORS.find((candidate) => !used.has(candidate)) ?? CATEGORY_COLORS[0];
  });

  const cleanName = normalizeName(name);
  const nameTaken = cleanName !== '' && isCategoryNameTaken(data, cleanName);
  const amount = parseAmountInput(budget);
  const monthly = data.settings.monthlyBudget;
  const allocatedAfter = allocatedBudget(data) + amount;
  const leftAfter = monthly - allocatedAfter;
  const canSubmit = cleanName !== '' && !nameTaken && amount > 0;

  const submit = () => {
    if (!canSubmit) return;
    const category = addCategory({ name: cleanName, color, monthlyBudget: amount });
    if (route.params?.returnTo === 'AddExpense') {
      navigation.popTo('AddExpense', { selectCategoryId: category.id, selectFor: route.params.entryIndex }, { merge: true });
    } else {
      navigation.goBack();
    }
  };

  return (
    <SheetScreen accessibilityLabel="Nouvelle catégorie">
      <SheetHeader title="Nouvelle catégorie" />

      <SheetSection gap={8}>
        <SheetLabel color="secondary">Aperçu</SheetLabel>
        <CategoryCard category={{ name: cleanName || 'Ma catégorie', color }} remaining={amount} budget={amount} />
      </SheetSection>

      <TextField
        type="double"
        label="Nom de la catégorie"
        value={name}
        placeholder="Ex : Voyages"
        onChangeText={setName}
        autoFocus
        autoCapitalize="sentences"
        maxLength={32}
        error={nameTaken ? 'Une catégorie porte déjà ce nom.' : undefined}
      />

      <SheetSection gap={8}>
        <TextField
          type="double"
          label="Budget mensuel"
          value={budget}
          placeholder="0 €"
          suffix="€"
          keyboardType="decimal-pad"
          onChangeText={(text) => setBudget(sanitizeAmountInput(text))}
        />
        <View style={styles.split}>
          <Text variant="label-regular" color="secondary">
            Budget réparti
          </Text>
          <Text variant="label-regular" color="secondary">
            <Text variant="label-bold">{formatMoney(allocatedAfter)}</Text>
            {` / ${formatMoney(monthly)}`}
          </Text>
        </View>
        <ProgressBar ratio={spendingRatio(allocatedAfter, monthly)} tone="neutral" showLabel={false} />
        <Text variant="label-regular" color={leftAfter < 0 ? 'danger' : 'brand'}>
          {leftAfter < 0
            ? `Tu dépasses ton budget mensuel de ${formatMoney(-leftAfter)}.`
            : leftAfter === 0
              ? 'Tout ton budget est réparti avec cette catégorie.'
              : `Il te restera ${formatMoney(leftAfter)} à répartir.`}
        </Text>
      </SheetSection>

      <SheetSection>
        <SheetLabel>Couleur</SheetLabel>
        <ColorSwatchPicker value={color} onChange={setColor} />
      </SheetSection>

      <Button label="Créer la catégorie" icon="add" fullWidth disabled={!canSubmit} onPress={submit} />
    </SheetScreen>
  );
}

const useStyles = makeStyles((t) => ({
  split: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: t.spacing[8],
  },
}));
