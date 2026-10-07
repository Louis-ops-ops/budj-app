import React from 'react';
import { Pressable } from 'react-native';
import { makeStyles, useTheme } from '../theme';
import { Icon } from './Icon';
import { Text } from './Text';

type Props = {
  /** Date choisie, en clair (« Aujourd'hui », « Hier », « 4 août »). */
  label: string;
  onPress: () => void;
  expanded?: boolean;
};

/** Pastille de date des pop-ups d'ajout : ouvre le sélecteur de date. */
export function DateChip({ label, onPress, expanded }: Props) {
  const styles = useStyles();
  const { sizes, spacing, text } = useTheme();
  const height = text['label-medium'].lineHeight + spacing[6] * 2;
  return (
    <Pressable
      onPress={onPress}
      hitSlop={(sizes.touchTarget - height) / 2}
      accessibilityRole="button"
      accessibilityLabel={`Date : ${label}`}
      accessibilityHint="Choisir une autre date"
      accessibilityState={{ expanded }}
      style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
    >
      <Icon name="calendar" size={16} color="brand" />
      <Text variant="label-medium" color="brand">
        {label}
      </Text>
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing[6],
    borderWidth: t.sizes.borderWidth.thin,
    borderColor: t.colors.border.brandSubtle,
    backgroundColor: t.colors.bg.brandSubtle,
    paddingHorizontal: t.spacing[12] - t.sizes.borderWidth.thin,
    paddingVertical: t.spacing[6] - t.sizes.borderWidth.thin,
    borderRadius: t.radius.full,
  },
  pressed: {
    opacity: t.opacity.pressed,
  },
}));
