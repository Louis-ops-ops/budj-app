import React, { useState } from 'react';
import { Button, ExpenseRow, MonthCalendar } from '../components';
import { useBudj } from '../data/BudjContext';
import { effectiveDayOfMonth, monthOf } from '../data/dates';
import { fixedCalendarMarks, fixedExpensesByDay, fixedExpensesOnDay, fixedTotal } from '../data/selectors';
import type { TabScreenProps } from '../navigation/types';
import { formatMoneyCompact } from '../utils/money';
import { ScreenLayout } from './ScreenLayout';
import { EmptyText, PageTitle, Stack } from './ScreenParts';

/**
 * Onglet Fixes (Figma 9:174) : calendrier des prélèvements du mois et liste
 * des dépenses fixes. Toucher un jour filtre la liste ; le toucher à nouveau
 * retire le filtre.
 */
export function FixesScreen({ navigation }: TabScreenProps<'Fixes'>) {
  const { data, today } = useBudj();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const month = monthOf(today);
  const count = data.fixedExpenses.length;
  const list = selectedDay === null ? fixedExpensesByDay(data, month) : fixedExpensesOnDay(data, month, selectedDay);

  const footer = (
    <Button
      label="Ajouter"
      icon="add"
      onPress={() => navigation.navigate('FixedExpenseForm', selectedDay === null ? undefined : { dayOfMonth: selectedDay })}
    />
  );

  return (
    <ScreenLayout footer={footer}>
      <Stack gap={24}>
        <PageTitle
          title="Mes dépenses fixes"
          subtitle={[`${count} dépense${count > 1 ? 's' : ''} fixe${count > 1 ? 's' : ''} par mois`, formatMoneyCompact(fixedTotal(data))]}
        />
        <MonthCalendar
          month={month}
          markedDays={fixedCalendarMarks(data, month)}
          selectedDay={selectedDay}
          today={today}
          onSelectDay={(day) => setSelectedDay((current) => (current === day ? null : day))}
        />
      </Stack>

      <Stack gap={16}>
        {list.map((fixed) => (
          <ExpenseRow
            key={fixed.id}
            type="fixed"
            label={fixed.label}
            detail={`Prélèvement le ${effectiveDayOfMonth(fixed.dayOfMonth, month)}`}
            amount={fixed.amount}
            onPress={() => navigation.navigate('FixedExpenseForm', { fixedExpenseId: fixed.id })}
            accessibilityHint="Modifier cette dépense fixe"
          />
        ))}
        {list.length === 0 && (
          <EmptyText>
            {selectedDay === null ? 'Aucune dépense fixe pour l’instant.' : `Aucun prélèvement le ${selectedDay}.`}
          </EmptyText>
        )}
      </Stack>
    </ScreenLayout>
  );
}
