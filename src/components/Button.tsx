import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

type Variant = 'principale' | 'secondaire';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  style?: ViewStyle;
};

/**
 * "Master bouton" — variantes Principale / Secondaire (voir design system, section 4).
 * Pour le variant "Icône seule", voir IconButton.tsx.
 */
export function Button({ label, onPress, variant = 'principale', disabled, style }: Props) {
  const isPrincipale = variant === 'principale';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        isPrincipale ? styles.principale : styles.secondaire,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <Text style={[typography.bodyBold, isPrincipale ? styles.textPrincipale : styles.textSecondaire]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 48,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    width: '100%',
  },
  principale: {
    backgroundColor: colors.bleue[500],
  },
  secondaire: {
    backgroundColor: colors.blanc,
    borderWidth: 1,
    borderColor: colors.bleue[500],
  },
  textPrincipale: {
    color: colors.blanc,
  },
  textSecondaire: {
    color: colors.bleue[500],
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.85,
  },
});
