import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { AmountInput, BudgetCard, Button, CategoryChip, QuickAdjust, Text, TextLink } from '../../components';
import { useBudj } from '../../data/BudjContext';
import { monthOf } from '../../data/dates';
import { allocatedBudget, categorySpent, categoryTone, findCategory, monthSpent, unallocatedBudget } from '../../data/selectors';
import { SheetScreen } from '../../navigation/SheetScreen';
import type { RootScreenProps } from '../../navigation/routes';
import { makeStyles } from '../../theme';
import { centsToInput, formatMoney, formatSignedMoney, parseAmountInput } from '../../utils/money';
import { SheetHeader, SheetLabel, SheetSection } from './SheetParts';

/**
 * Pop-up « Modifier le budget » (Figma 208:1310), pour une catégorie ou pour
 * le budget mensuel global : montant pré-rempli, écart avec le budget actuel,
 * ajustement rapide et aperçu de la carte budget après modification.
 */
export function EditBudgetSheet({ navigation, route }: RootScreenProps<'EditBudget'>) {
  const styles = useStyles();
  const { data, today, updateCategoryBudget, setMonthlyBudget } = useBudj();
  const params = route.params;
  const isCategory = params.target === 'category';
  const category = params.target === 'category' ? findCategory(data, params.categoryId) : undefined;
  const missing = isCategory && !category;
  const current = category ? category.monthlyBudget : data.settings.monthlyBudget;
  const [input, setInput] = useState(() => centsToInput(current));

  // La catégorie a été supprimée entre-temps : plus rien à modifier.
  useEffect(() => {
    if (missing) navigation.goBack();
  }, [missing, navigation]);
  if (missing) return null;

  const next = parseAmountInput(input);
  const diff = next - current;
  const month = monthOf(today);
  const spent = category ? categorySpent(data, category.id, month) : monthSpent(data, month);
  const left = next - spent;
  const overAllocation = category ? -(unallocatedBudget(data) - diff) : allocatedBudget(data) - next;
  const where = category ? ` en ${category.name}` : '';

  const save = () => {
    if (input === '') return;
    if (category) updateCategoryBudget(category.id, next);
    else setMonthlyBudget(next);
    navigation.goBack();
  };

  return (
    <SheetScreen accessibilityLabel="Modifier le budget">
      <SheetHeader
        title="Modifier le budget"
        right={<CategoryChip label={category?.name ?? 'Mon budget'} color={category?.color ?? 'bleu'} selected />}
      />

      <View style={styles.amount}>
        <AmountInput
          value={input}
          onChangeText={setInput}
          autoFocus
          accessibilityLabel={category ? `Budget mensuel de ${category.name}` : 'Budget mensuel'}
          helper={
            <Text variant="label-regular" color="secondary" style={styles.center}>
              {'Budget actuel : '}
              <Text variant="label-bold">{formatMoney(current)}</Text>
              {diff !== 0 && (
                <Text variant="label-regular" color={diff < 0 ? 'danger' : 'success'}>
                  {` (${formatSignedMoney(diff, { compact: false })})`}
                </Text>
              )}
            </Text>
          }
        />
      </View>

      <QuickAdjust onAdjust={(delta) => setInput(centsToInput(Math.max(0, next + delta)))} />

      <SheetSection gap={8}>
        <SheetLabel color="secondary">Après modification</SheetLabel>
        <BudgetCard total={next} spent={spent} tone={categoryTone(spent, next)} />
        {left >= 0 ? (
          <Text variant="label-regular" color="secondary">
            {'Il te restera '}
            <Text variant="label-bold" color={category ? undefined : 'brand'} categoryColor={category?.color}>
              {formatMoney(left)}
            </Text>
            {` à dépenser${where} ce mois-ci.`}
          </Text>
        ) : (
          <Text variant="label-regular" color="secondary">
            <Text variant="label-bold" color="danger">
              {`Dépassement de ${formatMoney(-left)}`}
            </Text>
            {`${where} ce mois-ci.`}
          </Text>
        )}
        {overAllocation > 0 && (
          <Text variant="label-regular" color="danger">
            {category
              ? `Ton budget réparti dépassera ton budget mensuel de ${formatMoney(overAllocation)}.`
              : `Tes catégories et dépenses fixes dépassent ce budget de ${formatMoney(overAllocation)}.`}
          </Text>
        )}
      </SheetSection>

      <View style={styles.actions}>
        <Button label="Enregistrer le budget" fullWidth disabled={input === ''} onPress={save} />
        <TextLink label="Annuler" onPress={() => navigation.goBack()} />
      </View>
    </SheetScreen>
  );
}

const useStyles = makeStyles((t) => ({
  amount: {
    alignSelf: 'stretch',
    paddingVertical: t.spacing[8],
  },
  center: {
    textAlign: 'center',
  },
  actions: {
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: t.spacing[12],
  },
}));
