import React from 'react';
import { Pressable, View } from 'react-native';
import { makeStyles } from '../theme';
import { Text } from './Text';

export type CalendarDayState = 'default' | 'withExpense' | 'today' | 'selected';

type Props = {
  day: number;
  state?: CalendarDayState;
  /** Nombre de points sous le chiffre (1 à 3, un par prélèvement). */
  dots?: number;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
};

const MAX_DOTS = 3;

/** Case jour 42×42 (Figma « Jour calendrier » 188:1429). */
export function CalendarDay({ day, state = 'default', dots = 0, onPress, disabled = false, accessibilityLabel }: Props) {
  const styles = useStyles();
  const isSelected = state === 'selected';
  const dotCount = Math.min(Math.max(dots, 0), MAX_DOTS);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? String(day)}
      accessibilityState={{ selected: isSelected, disabled }}
      style={({ pressed }) => [styles.cell, isSelected && styles.selected, pressed && styles.pressed]}
    >
      <Text
        variant={state === 'default' ? 'body-regular' : 'body-bold'}
        color={disabled ? 'secondary' : isSelected ? 'onAccent' : state === 'today' ? 'brand' : 'primary'}
      >
        {day}
      </Text>
      {dotCount > 0 && (
        <View style={styles.dots}>
          {Array.from({ length: dotCount }, (_, index) => (
            <View key={index} style={[styles.dot, isSelected && styles.dotOnAccent]} />
          ))}
        </View>
      )}
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  cell: {
    width: t.sizes.calendarDay,
    height: t.sizes.calendarDay,
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing[2],
    borderRadius: t.radius.sm,
  },
  selected: {
    backgroundColor: t.colors.bg.accent,
  },
  pressed: {
    opacity: t.opacity.pressed,
  },
  dots: {
    flexDirection: 'row',
    gap: t.spacing[4],
  },
  dot: {
    width: t.sizes.calendarDot,
    height: t.sizes.calendarDot,
    borderRadius: t.radius.full,
    backgroundColor: t.colors.icon.brand,
  },
  dotOnAccent: {
    backgroundColor: t.colors.icon.onAccent,
  },
}));
