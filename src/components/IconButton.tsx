import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius } from '../theme/legacy';
import { Icon, IconName } from './Icon';

type Props = {
  icon: IconName;
  onPress?: () => void;
  size?: number;
  tone?: 'default' | 'onPrimary';
  style?: ViewStyle;
};

/**
 * "Master bouton" — variante Icône seule : pastille ronde au fond bleue
 * clair, cerclée de 1pt de bleue-500, l'icône reprenant le même bleue-500.
 * L'icône est rendue à 0,625 × la taille du bouton, soit exactement sa
 * taille Figma (20) pour le bouton standard de 32.
 */
export function IconButton({ icon, onPress, size = 32, tone = 'default', style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { width: size, height: size },
        tone === 'onPrimary' ? styles.onPrimary : styles.default,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Icon
        name={icon}
        size={size * 0.625}
        color={tone === 'onPrimary' ? colors.blanc : colors.bleue[500]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  default: {
    backgroundColor: 'rgba(170,180,255,0.2)',
    borderWidth: 1,
    borderColor: colors.bleue[500],
  },
  onPrimary: {
    backgroundColor: colors.bleue[500],
  },
  pressed: {
    opacity: 0.7,
  },
});
