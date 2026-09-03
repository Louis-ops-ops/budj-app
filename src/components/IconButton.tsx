import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius } from '../theme';
import { Icon, IconName } from './Icon';

type Props = {
  icon: IconName;
  onPress?: () => void;
  size?: number;
  tone?: 'default' | 'onPrimary';
  style?: ViewStyle;
};

/** "Master bouton" — variante Icône seule (badge rond, fond bleue/20%) */
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
      <Icon name={icon} size={size * 0.6} color={tone === 'onPrimary' ? colors.blanc : colors.bleue[600]} />
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
  },
  onPrimary: {
    backgroundColor: colors.bleue[500],
  },
  pressed: {
    opacity: 0.7,
  },
});
