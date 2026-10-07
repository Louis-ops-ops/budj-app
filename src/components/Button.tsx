import React from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { makeStyles } from '../theme';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

type Props = {
  label: string;
  onPress?: () => void;
  /** Primaire = action principale ; Secondaire = action alternative. */
  variant?: 'primary' | 'secondary';
  icon?: IconName;
  disabled?: boolean;
  /** Pleine largeur (pop-ups) ; sinon le bouton épouse son contenu. */
  fullWidth?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
};

/** Bouton du design system (Figma « Bouton » 185:1970). */
export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  fullWidth = false,
  accessibilityHint,
  style,
}: Props) {
  const styles = useStyles();
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.secondary,
        fullWidth ? styles.fullWidth : styles.hug,
        disabled ? styles.disabled : pressed && styles.pressed,
        style,
      ]}
    >
      {icon && (
        <View>
          <Icon name={icon} size={20} color={isPrimary ? 'onAccent' : 'brand'} />
        </View>
      )}
      <Text variant={isPrimary ? 'heading-h3' : 'body-regular'} color={isPrimary ? 'onAccent' : 'brand'} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing[12],
    minHeight: t.sizes.touchTarget,
    paddingHorizontal: t.spacing[16],
    paddingVertical: t.spacing[12],
    borderRadius: t.radius.full,
  },
  primary: {
    backgroundColor: t.colors.bg.accent,
  },
  secondary: {
    backgroundColor: t.colors.bg.brandSubtle,
    borderWidth: t.sizes.borderWidth.thin,
    borderColor: t.colors.border.brand,
    paddingHorizontal: t.spacing[16] - t.sizes.borderWidth.thin,
    paddingVertical: t.spacing[12] - t.sizes.borderWidth.thin,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  hug: {
    alignSelf: 'center',
  },
  disabled: {
    opacity: t.opacity.disabled,
  },
  pressed: {
    opacity: t.opacity.pressed,
  },
}));
