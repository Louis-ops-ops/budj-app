import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '../theme';

type Props = {
  /** Nombre de dépenses fixes prélevées à chaque jour du mois (1-31) */
  expenseCountByDay: Record<number, number>;
  selectedDay: number | null;
  onSelectDay: (day: number | null) => void;
};

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const CELL_SIZE = 42;

/**
 * "Calendrier" du design system (node Figma 9:1095 / "Item Calendrier").
 * Mois réel en cours, avec 3 états de jour visuellement distincts :
 * défaut, aujourd'hui (texte bleu gras, sans fond), sélectionné (fond bleu
 * plein, texte blanc) — et un 4ᵉ état "Cours" pour un jour où au moins une
 * dépense fixe est prélevée (chiffre gras + jusqu'à 3 pastilles bleues).
 * Un jour ne peut avoir qu'un seul de ces états à la fois, comme dans le
 * composant Figma (property1 à valeur unique).
 */
export function Calendrier({ expenseCountByDay, selectedDay, onSelectDay }: Props) {
  const now = useMemo(() => new Date(), []);
  const year = now.getFullYear();
  const month = now.getMonth();
  const todayDate = now.getDate();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // 0 = lundi

  const monthLabel = now.toLocaleDateString('fr-FR', { month: 'long' });
  const monthLabelCapitalized = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  const cells = useMemo(() => {
    const arr: (number | null)[] = [];
    for (let i = 0; i < firstWeekday; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [firstWeekday, daysInMonth]);

  return (
    <View style={styles.card}>
      <Text style={[typography.h1, styles.monthTitle]}>{monthLabelCapitalized}</Text>

      <View style={styles.row}>
        {WEEKDAYS.map((w, i) => (
          <View key={i} style={styles.cell}>
            <Text style={styles.weekdayLabel}>{w}</Text>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((day, i) => {
          if (day === null) return <View key={i} style={styles.cell} />;

          const isSelected = day === selectedDay;
          const isToday = day === todayDate && !isSelected;
          const count = expenseCountByDay[day] ?? 0;
          const isCours = count > 0 && !isSelected && !isToday;

          return (
            <Pressable
              key={i}
              style={[styles.cell, isSelected && styles.cellSelected]}
              onPress={() => onSelectDay(isSelected ? null : day)}
            >
              {isCours ? (
                <View style={styles.coursContent}>
                  <Text style={typography.bodyBold}>{day}</Text>
                  <View style={styles.dots}>
                    {Array.from({ length: Math.min(count, 3) }).map((_, di) => (
                      <View key={di} style={styles.dot} />
                    ))}
                  </View>
                </View>
              ) : (
                <Text
                  style={[
                    typography.body,
                    isToday && [typography.bodyBold, { color: colors.bleue[500] }],
                    isSelected && [typography.bodyBold, { color: colors.blanc }],
                  ]}
                >
                  {day}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: colors.blanc,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  monthTitle: { textAlign: 'center' },
  row: { flexDirection: 'row' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', width: CELL_SIZE * 7 },
  cell: { width: CELL_SIZE, height: CELL_SIZE, alignItems: 'center', justifyContent: 'center' },
  cellSelected: { backgroundColor: colors.bleue[500], borderRadius: 8 },
  weekdayLabel: { fontFamily: 'Outfit_500Medium', fontSize: 18, lineHeight: 20, color: colors.texte },
  coursContent: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 8, gap: 2 },
  dots: { flexDirection: 'row', gap: 4 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.bleue[500] },
});
