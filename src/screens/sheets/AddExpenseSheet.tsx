import React, { useEffect, useState } from 'react';
import { Keyboard, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import {
  AddChip,
  AmountInput,
  Button,
  CategoryChip,
  DateChip,
  IconButton,
  MonthCalendar,
  SheetAwareTextInput,
  Text,
  TextField,
  TextLink,
} from '../../components';
import { useBudj } from '../../data/BudjContext';
import { dayOfMonth, makeDay, monthOf, type Day, type Month } from '../../data/dates';
import { findCategory, remainingAfterExpense } from '../../data/selectors';
import type { Category } from '../../data/types';
import { SheetScreen } from '../../navigation/SheetScreen';
import type { RootScreenProps } from '../../navigation/routes';
import { makeStyles, useTheme } from '../../theme';
import { relativeDayLabel } from '../../utils/dateLabels';
import { formatMoney, parseAmountInput, sanitizeAmountInput } from '../../utils/money';
import { ChipWrap, SheetHeader, SheetLabel, SheetSection } from './SheetParts';

type Entry = { key: string; amount: string; label: string; categoryId: string | null };

let entryCounter = 0;
function newEntry(categoryId: string | null = null): Entry {
  entryCounter += 1;
  return { key: `entry_${entryCounter}`, amount: '', label: '', categoryId };
}

/**
 * Pop-up « Nouvelle dépense » (Figma 204:1140, 204:1210) et sa variante
 * plusieurs dépenses (205:1265). « Ajouter une autre dépense » passe en mode
 * multiple en gardant la première saisie.
 */
export function AddExpenseSheet({ navigation, route }: RootScreenProps<'AddExpense'>) {
  const styles = useStyles();
  const { data, today, addExpenses } = useBudj();
  const presetCategory = findCategory(data, route.params?.categoryId);
  const [entries, setEntries] = useState<Entry[]>(() => [newEntry(presetCategory?.id ?? null)]);
  const [date, setDate] = useState<Day>(today);
  const [pickingDate, setPickingDate] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState<Month>(monthOf(today));

  // Retour de la pop-up « Nouvelle catégorie » : on sélectionne la catégorie créée.
  const selectCategoryId = route.params?.selectCategoryId;
  const selectFor = route.params?.selectFor ?? 0;
  useEffect(() => {
    if (!selectCategoryId) return;
    setEntries((current) => current.map((entry, index) => (index === selectFor ? { ...entry, categoryId: selectCategoryId } : entry)));
    navigation.setParams({ selectCategoryId: undefined, selectFor: undefined });
  }, [selectCategoryId, selectFor, navigation]);

  const isMultiple = entries.length > 1;
  const isValid = (entry: Entry) => parseAmountInput(entry.amount) > 0 && !!findCategory(data, entry.categoryId);
  const canSubmit = entries.every(isValid);
  const total = entries.reduce((sum, entry) => sum + parseAmountInput(entry.amount), 0);

  const updateEntry = (index: number, patch: Partial<Entry>) =>
    setEntries((current) => current.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)));
  const addEntry = () => setEntries((current) => [...current, newEntry()]);
  const removeEntry = (index: number) => setEntries((current) => current.filter((_, i) => i !== index));
  const openNewCategory = (index: number) => navigation.navigate('NewCategory', { returnTo: 'AddExpense', entryIndex: index });

  const togglePicker = () => {
    Keyboard.dismiss();
    setCalendarMonth(monthOf(date));
    setPickingDate((open) => !open);
  };

  const submit = () => {
    if (!canSubmit) return;
    addExpenses(
      entries.map((entry) => ({
        amount: parseAmountInput(entry.amount),
        label: entry.label.trim() || findCategory(data, entry.categoryId)?.name || 'Dépense',
        categoryId: entry.categoryId,
        date,
      })),
    );
    navigation.goBack();
  };

  const header = (
    <>
      <SheetHeader
        title={isMultiple ? 'Nouvelles dépenses' : 'Nouvelle dépense'}
        right={<DateChip label={relativeDayLabel(date, today)} onPress={togglePicker} expanded={pickingDate} />}
      />
      {pickingDate && (
        <MonthCalendar
          month={calendarMonth}
          selectedDay={monthOf(date) === calendarMonth ? dayOfMonth(date) : null}
          today={today}
          onChangeMonth={setCalendarMonth}
          canGoNext={calendarMonth < monthOf(today)}
          isDayDisabled={(day) => makeDay(calendarMonth, day) > today}
          onSelectDay={(day) => {
            setDate(makeDay(calendarMonth, day));
            setPickingDate(false);
          }}
        />
      )}
    </>
  );

  if (isMultiple) {
    return (
      <SheetScreen gap={16} accessibilityLabel="Nouvelles dépenses">
        {header}
        {entries.map((entry, index) => (
          <ExpenseCard
            key={entry.key}
            index={index}
            entry={entry}
            categories={data.categories}
            autoFocus={index === entries.length - 1 && entry.amount === ''}
            onChange={(patch) => updateEntry(index, patch)}
            onRemove={() => removeEntry(index)}
            onNewCategory={() => openNewCategory(index)}
          />
        ))}
        <TextLink label="Ajouter une autre dépense" icon="add" onPress={addEntry} />
        <View style={styles.totalRow}>
          <Text variant="body-medium" color="secondary">
            Total
          </Text>
          <Text variant="heading-h2">{formatMoney(total)}</Text>
        </View>
        <Button label={`Ajouter les ${entries.length} dépenses`} icon="add" fullWidth disabled={!canSubmit} onPress={submit} />
      </SheetScreen>
    );
  }

  const entry = entries[0];
  const amount = parseAmountInput(entry.amount);
  const category = findCategory(data, entry.categoryId);
  const remaining = category && amount > 0 ? remainingAfterExpense(data, category.id, amount, monthOf(date)) : null;

  return (
    <SheetScreen accessibilityLabel="Nouvelle dépense">
      {header}
      <View style={styles.amount}>
        <AmountInput
          value={entry.amount}
          onChangeText={(text) => updateEntry(0, { amount: text })}
          autoFocus
          helper={category && remaining !== null ? <ImpactLine category={category} remaining={remaining} /> : 'Saisis le montant de ta dépense'}
        />
      </View>
      <TextField
        type="double"
        label="Libellé"
        value={entry.label}
        placeholder="Ex : Carrefour, Uber…"
        onChangeText={(text) => updateEntry(0, { label: text })}
        returnKeyType="done"
      />
      <SheetSection>
        <SheetLabel>Catégorie</SheetLabel>
        <ChipWrap>
          {data.categories.map((item) => (
            <CategoryChip
              key={item.id}
              label={item.name}
              color={item.color}
              selected={item.id === entry.categoryId}
              onPress={() => updateEntry(0, { categoryId: item.id })}
            />
          ))}
          <AddChip onPress={() => openNewCategory(0)} accessibilityLabel="Nouvelle catégorie" />
        </ChipWrap>
      </SheetSection>
      <View style={styles.actions}>
        <Button label="Ajouter la dépense" icon="add" fullWidth disabled={!canSubmit} onPress={submit} />
        <TextLink label="Ajouter une autre dépense" icon="add" onPress={addEntry} />
      </View>
    </SheetScreen>
  );
}

/** « Il restera 75,22 € sur Courses », ou « Dépassement de 12 € sur Courses ». */
function ImpactLine({ category, remaining }: { category: Category; remaining: number }) {
  const styles = useStyles();
  if (remaining < 0) {
    return (
      <Text variant="label-regular" color="secondary" style={styles.center}>
        <Text variant="label-bold" color="danger">
          {`Dépassement de ${formatMoney(-remaining)}`}
        </Text>
        {` sur ${category.name}`}
      </Text>
    );
  }
  return (
    <Text variant="label-regular" color="secondary" style={styles.center}>
      {'Il restera '}
      <Text variant="label-bold" categoryColor={category.color}>
        {formatMoney(remaining)}
      </Text>
      {` sur ${category.name}`}
    </Text>
  );
}

type CardProps = {
  index: number;
  entry: Entry;
  categories: Category[];
  autoFocus: boolean;
  onChange: (patch: Partial<Entry>) => void;
  onRemove: () => void;
  onNewCategory: () => void;
};

/** Carte d'une dépense en mode multiple : montant, libellé et chips défilantes. */
function ExpenseCard({ index, entry, categories, autoFocus, onChange, onRemove, onNewCategory }: CardProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const number = index + 1;
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitle}>
          <Text variant="label-medium" color="secondary">
            {`Dépense ${number}`}
          </Text>
          <View style={styles.cardAmount}>
            <SheetAwareTextInput
              value={entry.amount}
              onChangeText={(text) => onChange({ amount: sanitizeAmountInput(text) })}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={colors.text.secondary}
              selectionColor={colors.bg.accent}
              autoFocus={autoFocus}
              accessibilityLabel={`Montant de la dépense ${number}`}
              style={styles.cardAmountInput}
            />
            <Text variant="heading-h3" color="secondary">
              €
            </Text>
          </View>
        </View>
        {index > 0 && <IconButton icon="delete" accessibilityLabel={`Retirer la dépense ${number}`} onPress={onRemove} />}
      </View>
      <TextField
        type="double"
        label="Libellé"
        value={entry.label}
        placeholder="Ex : Carrefour, Uber…"
        onChangeText={(text) => onChange({ label: text })}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.chipRow}>
        {categories.map((item) => (
          <CategoryChip
            key={item.id}
            label={item.name}
            color={item.color}
            selected={item.id === entry.categoryId}
            onPress={() => onChange({ categoryId: item.id })}
          />
        ))}
        <AddChip onPress={onNewCategory} accessibilityLabel="Nouvelle catégorie" />
      </ScrollView>
    </View>
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
    paddingTop: t.spacing[8],
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    paddingTop: t.spacing[8],
  },
  card: {
    alignSelf: 'stretch',
    gap: t.spacing[12],
    padding: t.spacing[12],
    borderRadius: t.radius.md,
    backgroundColor: t.colors.bg.surface,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    gap: t.spacing[6],
  },
  cardAmount: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: t.spacing[4],
  },
  cardAmountInput: {
    ...t.text['heading-h1'],
    color: t.colors.text.primary,
    padding: t.spacing[0],
    margin: t.spacing[0],
    includeFontPadding: false,
  },
  chipRow: {
    gap: t.spacing[8],
  },
}));
