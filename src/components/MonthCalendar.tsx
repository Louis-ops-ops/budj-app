import React, { useMemo } from 'react';
import { View } from 'react-native';
import { daysInMonth, firstWeekdayOfMonth, makeDay, monthOf, dayOfMonth, addMonths, type Day, type Month } from '../data/dates';
import { makeStyles } from '../theme';
import { monthName, monthTitle, WEEKDAY_INITIALS } from '../utils/dateLabels';
import { CalendarDay, type CalendarDayState } from './CalendarDay';
import { IconButton } from './IconButton';
import { Text } from './Text';

type Props = {
  month: Month;
  /** Nombre de prélèvements par jour (clé = numéro du jour dans le mois). */
  markedDays?: Record<number, number>;
  selectedDay?: number | null;
  /** Jour courant, mis en avant s'il tombe dans le mois affiché. */
  today?: Day;
  onSelectDay?: (day: number) => void;
  /** Si fourni, affiche des flèches pour changer de mois. */
  onChangeMonth?: (month: Month) => void;
  canGoNext?: boolean;
  isDayDisabled?: (day: number) => boolean;
};

const DAYS_PER_WEEK = 7;

/** Calendrier mensuel (Figma « Calendrier » 188:1430). */
export function MonthCalendar({
  month,
  markedDays = {},
  selectedDay = null,
  today,
  onSelectDay,
  onChangeMonth,
  canGoNext = true,
  isDayDisabled,
}: Props) {
  const styles = useStyles();
  const todayInMonth = today && monthOf(today) === month ? dayOfMonth(today) : null;

  const weeks = useMemo(() => {
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstWeekdayOfMonth(month); i++) cells.push(null);
    for (let day = 1; day <= daysInMonth(month); day++) cells.push(day);
    while (cells.length % DAYS_PER_WEEK !== 0) cells.push(null);
    const rows: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += DAYS_PER_WEEK) rows.push(cells.slice(i, i + DAYS_PER_WEEK));
    return rows;
  }, [month]);

  const stateOf = (day: number): CalendarDayState => {
    if (day === selectedDay) return 'selected';
    if (day === todayInMonth) return 'today';
    if ((markedDays[day] ?? 0) > 0) return 'withExpense';
    return 'default';
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {onChangeMonth && (
          <IconButton
            icon="chevron"
            rotation={180}
            accessibilityLabel="Mois précédent"
            onPress={() => onChangeMonth(addMonths(month, -1))}
          />
        )}
        <Text variant="heading-h2" style={styles.title} accessibilityRole="header">
          {monthTitle(month)}
        </Text>
        {onChangeMonth && (
          <IconButton
            icon="chevron"
            accessibilityLabel="Mois suivant"
            disabled={!canGoNext}
            onPress={() => onChangeMonth(addMonths(month, 1))}
          />
        )}
      </View>

      <View style={styles.week}>
        {WEEKDAY_INITIALS.map((initial, index) => (
          <View key={index} style={styles.cell}>
            <Text variant="body-bold">{initial}</Text>
          </View>
        ))}
      </View>

      {weeks.map((week, row) => (
        <View key={row} style={styles.week}>
          {week.map((day, column) => {
            if (day === null) return <View key={column} style={styles.cell} />;
            const count = markedDays[day] ?? 0;
            return (
              <CalendarDay
                key={column}
                day={day}
                state={stateOf(day)}
                dots={count}
                disabled={isDayDisabled?.(day)}
                onPress={onSelectDay ? () => onSelectDay(day) : undefined}
                accessibilityLabel={describeDay(makeDay(month, day), count)}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

function describeDay(day: Day, count: number): string {
  const base = `${dayOfMonth(day)} ${monthName(monthOf(day))}`;
  if (count === 0) return base;
  return `${base}, ${count} prélèvement${count > 1 ? 's' : ''}`;
}

const useStyles = makeStyles((t) => ({
  card: {
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: t.spacing[8],
    padding: t.spacing[16],
    borderRadius: t.radius.md,
    backgroundColor: t.colors.bg.surface,
    boxShadow: t.shadows.elevated,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    gap: t.spacing[12],
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  week: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
  },
  cell: {
    width: t.sizes.calendarDay,
    height: t.sizes.calendarDay,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
