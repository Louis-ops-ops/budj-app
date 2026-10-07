import React from 'react';
import { Pressable } from 'react-native';
import { makeStyles, useTheme } from '../theme';
import { Icon } from './Icon';
import { Text } from './Text';

type Props = {
  label?: string;
  onPress: () => void;
  accessibilityLabel?: string;
};

/** Dernière chip d'une liste : crée une catégorie (Figma « Chip nouvelle catégorie » 205:262). */
export function AddChip({ label = 'Nouvelle', onPress, accessibilityLabel }: Props) {
  const styles = useStyles();
  const { sizes, spacing, text } = useTheme();
  const height = text['label-medium'].lineHeight + spacing[8] * 2;
  return (
    <Pressable
      onPress={onPress}
      hitSlop={(sizes.touchTarget - height) / 2}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
    >
      <Icon name="add" size={16} color="brand" />
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
    gap: t.spacing[4],
    borderWidth: t.sizes.borderWidth.thin,
    borderStyle: 'dashed',
    borderColor: t.colors.border.brandSubtle,
    paddingHorizontal: t.spacing[16] - t.sizes.borderWidth.thin,
    paddingVertical: t.spacing[8] - t.sizes.borderWidth.thin,
    borderRadius: t.radius.full,
  },
  pressed: {
    opacity: t.opacity.pressed,
  },
}));
