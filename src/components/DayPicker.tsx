import React, { useEffect, useRef } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { makeStyles, useTheme } from '../theme';
import { CalendarDay } from './CalendarDay';

type Props = {
  /** Jour du mois choisi (1 à 31), ou null tant que rien n'est choisi. */
  value: number | null;
  onChange: (day: number) => void;
};

const DAYS = Array.from({ length: 31 }, (_, index) => index + 1);
/** Nombre de jours laissés visibles à gauche du jour choisi quand la liste s'ouvre. */
const DAYS_BEFORE_SELECTION = 4;

/** Rangée défilante des jours 1 à 31 (jour de prélèvement d'une dépense fixe). */
export function DayPicker({ value, onChange }: Props) {
  const styles = useStyles();
  const { sizes, spacing } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const step = sizes.calendarDay + spacing[4];

  // À l'ouverture, amène le jour déjà choisi (modification d'une dépense) dans le champ de vision.
  useEffect(() => {
    if (value === null) return;
    const x = Math.max(0, (value - 1 - DAYS_BEFORE_SELECTION) * step);
    const timer = setTimeout(() => scrollRef.current?.scrollTo({ x, animated: false }), 0);
    return () => clearTimeout(timer);
    // Uniquement au montage : ensuite c'est l'utilisateur qui fait défiler.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      keyboardShouldPersistTaps="handled"
      accessibilityRole="adjustable"
      accessibilityLabel="Jour du prélèvement"
    >
      {DAYS.map((day) => (
        <CalendarDay
          key={day}
          day={day}
          state={day === value ? 'selected' : 'default'}
          onPress={() => onChange(day)}
          accessibilityLabel={`Le ${day}`}
        />
      ))}
    </ScrollView>
  );
}

const useStyles = makeStyles((t) => ({
  row: {
    gap: t.spacing[4],
  },
}));
