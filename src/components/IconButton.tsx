import React from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { makeStyles, useTheme } from '../theme';
import { Icon, type IconName } from './Icon';

type Props = {
  icon: IconName;
  /** Obligatoire : un bouton sans texte doit être décrit au lecteur d'écran. */
  accessibilityLabel: string;
  onPress?: () => void;
  rotation?: 0 | 90 | 180 | 270;
  /** Bouton « enfoncé » (mode suppression ou édition en cours). */
  active?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Bouton rond 32×32 à icône seule (Figma « Bouton icône » 187:4). La zone
 * tactile est étendue à 44×44 par hitSlop.
 */
export function IconButton({ icon, accessibilityLabel, onPress, rotation, active = false, disabled = false, style }: Props) {
  const styles = useStyles();
  const { sizes } = useTheme();
  const slop = (sizes.touchTarget - sizes.iconButton) / 2;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={slop}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled, selected: active }}
      style={({ pressed }) => [
        styles.base,
        active && styles.active,
        disabled ? styles.disabled : pressed && styles.pressed,
        style,
      ]}
    >
      <Icon name={icon} size={16} color={active ? 'onAccent' : 'brand'} rotation={rotation} />
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  base: {
    width: t.sizes.iconButton,
    height: t.sizes.iconButton,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.radius.full,
    borderWidth: t.sizes.borderWidth.thin,
    borderColor: t.colors.border.brand,
    backgroundColor: t.colors.bg.iconButton,
  },
  active: {
    backgroundColor: t.colors.bg.accent,
  },
  disabled: {
    opacity: t.opacity.disabled,
  },
  pressed: {
    opacity: t.opacity.pressed,
  },
}));
