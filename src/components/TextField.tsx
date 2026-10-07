import React from 'react';
import { Pressable, View, type TextInputProps } from 'react-native';
import { makeStyles, useTheme } from '../theme';
import { Icon } from './Icon';
import { SheetAwareTextInput } from './SheetInput';
import { Text } from './Text';

type BaseProps = {
  value: string;
  placeholder?: string;
  accessibilityLabel?: string;
  /** Message d'erreur affiché sous le champ. */
  error?: string;
};

type InputProps = BaseProps &
  Pick<TextInputProps, 'keyboardType' | 'autoFocus' | 'returnKeyType' | 'onSubmitEditing' | 'maxLength' | 'autoCapitalize'> & {
    /** Simple = un champ ; Double = libellé au-dessus de la valeur. */
    type?: 'simple' | 'double';
    label?: string;
    /** Unité affichée après la valeur saisie (ex. « € »). */
    suffix?: string;
    onChangeText: (text: string) => void;
  };

type SelectProps = BaseProps & {
  /** Menu déroulant : ouvre une liste de choix. */
  type: 'select';
  onPress: () => void;
  open?: boolean;
};

type Props = InputProps | SelectProps;

/** Champ de formulaire des pop-ups (Figma « Champ de formulaire » 188:85). */
export function TextField(props: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const isEmpty = props.value.length === 0;

  if (props.type === 'select') {
    const { value, placeholder, onPress, open, accessibilityLabel, error } = props;
    return (
      <View style={styles.wrapper}>
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel ?? placeholder}
          accessibilityState={{ expanded: open }}
          style={[styles.box, styles.selectRow]}
        >
          <Text variant="body-regular" color={isEmpty ? 'brand' : 'primary'} numberOfLines={1} style={styles.selectValue}>
            {isEmpty ? placeholder : value}
          </Text>
          <Icon name="chevron" size={18} rotation={open ? 270 : 90} color={isEmpty ? 'brand' : 'muted'} />
        </Pressable>
        {!!error && <FieldError message={error} />}
      </View>
    );
  }

  const { type = 'simple', label, suffix, value, placeholder, onChangeText, accessibilityLabel, error, ...inputProps } = props;
  const isDouble = type === 'double';
  return (
    <View style={styles.wrapper}>
      <View style={styles.box}>
        {isDouble && !!label && (
          <Text variant="label-regular" color="brand">
            {label}
          </Text>
        )}
        <View style={styles.inputRow}>
          <SheetAwareTextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={isDouble ? colors.text.secondary : colors.text.brand}
            accessibilityLabel={accessibilityLabel ?? label ?? placeholder}
            selectionColor={colors.bg.accent}
            style={[styles.input, !!suffix && !isEmpty && styles.inputHug]}
            {...inputProps}
          />
          {!!suffix && !isEmpty && <Text variant="body-regular">{suffix}</Text>}
        </View>
      </View>
      {!!error && <FieldError message={error} />}
    </View>
  );
}

function FieldError({ message }: { message: string }) {
  const styles = useStyles();
  return (
    <Text variant="label-regular" color="danger" style={styles.error} accessibilityLiveRegion="polite">
      {message}
    </Text>
  );
}

const useStyles = makeStyles((t) => ({
  wrapper: {
    alignSelf: 'stretch',
  },
  box: {
    alignSelf: 'stretch',
    gap: t.spacing[4],
    // Le contour de 2 est dessiné à l'intérieur dans Figma : le contenu reste à 12 du bord.
    padding: t.spacing[12] - t.sizes.borderWidth.thick,
    borderWidth: t.sizes.borderWidth.thick,
    borderColor: t.colors.border.brandSubtle,
    borderRadius: t.radius.md,
    backgroundColor: t.colors.bg.brandMuted,
  },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectValue: {
    flexShrink: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing[4],
  },
  input: {
    flex: 1,
    ...t.text['body-regular'],
    color: t.colors.text.primary,
    height: t.text['body-regular'].lineHeight,
    padding: t.spacing[0],
    margin: t.spacing[0],
    includeFontPadding: false,
  },
  inputHug: {
    flex: 0,
    flexShrink: 1,
  },
  error: {
    marginTop: t.spacing[4],
  },
}));
