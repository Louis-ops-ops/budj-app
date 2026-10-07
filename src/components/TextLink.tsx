import React from 'react';
import { Pressable } from 'react-native';
import { makeStyles, useTheme } from '../theme';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

type Props = {
  label: string;
  onPress: () => void;
  icon?: IconName;
  /** `danger` pour une action destructrice (supprimer). */
  tone?: 'brand' | 'danger';
  accessibilityHint?: string;
};

/** Action secondaire en texte (« Ajouter une autre dépense », « Annuler »). */
export function TextLink({ label, onPress, icon, tone = 'brand', accessibilityHint }: Props) {
  const styles = useStyles();
  const { sizes, spacing, text } = useTheme();
  const height = text['body-medium'].lineHeight + spacing[8] * 2;
  return (
    <Pressable
      onPress={onPress}
      hitSlop={(sizes.touchTarget - height) / 2}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [styles.link, pressed && styles.pressed]}
    >
      {icon && <Icon name={icon} size={16} color={tone === 'danger' ? 'danger' : 'brand'} />}
      <Text variant="body-medium" color={tone === 'danger' ? 'danger' : 'brand'}>
        {label}
      </Text>
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: t.spacing[6],
    padding: t.spacing[8],
  },
  pressed: {
    opacity: t.opacity.pressed,
  },
}));
