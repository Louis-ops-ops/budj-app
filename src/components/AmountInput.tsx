import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, View, type TextInput } from 'react-native';
import { makeStyles } from '../theme';
import { formatAmountInput, sanitizeAmountInput } from '../utils/money';
import { SheetAwareTextInput } from './SheetInput';
import { Text } from './Text';

type Props = {
  /** Saisie en cours, virgule comme séparateur décimal (« 24,78 »). */
  value: string;
  onChangeText: (text: string) => void;
  /** Ligne d'aide sous le montant (texte simple ou contenu mis en forme). */
  helper?: React.ReactNode;
  autoFocus?: boolean;
  accessibilityLabel?: string;
};

const BLINK_DURATION = 500;

/**
 * Grand montant des pop-ups : chiffre en Display/XL, curseur et « € » en
 * Display/M. La saisie passe par un champ natif invisible (clavier numérique).
 */
export function AmountInput({ value, onChangeText, helper, autoFocus = false, accessibilityLabel = 'Montant' }: Props) {
  const styles = useStyles();
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const blink = useRef(new Animated.Value(1)).current;
  const isEmpty = value.length === 0;

  useEffect(() => {
    if (!focused) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(blink, { toValue: 0, duration: BLINK_DURATION, useNativeDriver: true }),
        Animated.timing(blink, { toValue: 1, duration: BLINK_DURATION, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
      blink.setValue(1);
    };
  }, [focused, blink]);

  return (
    <View style={styles.block}>
      <Pressable
        onPress={() => inputRef.current?.focus()}
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        style={styles.entry}
      >
        <Text
          variant="display-xl"
          color={isEmpty ? 'secondary' : 'primary'}
          numberOfLines={1}
          adjustsFontSizeToFit
          style={styles.value}
        >
          {isEmpty ? '0' : formatAmountInput(value)}
        </Text>
        <Animated.View style={[styles.cursor, { opacity: focused ? blink : 0 }]} />
        <Text variant="display-m" color="secondary">
          €
        </Text>
      </Pressable>
      <SheetAwareTextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) => onChangeText(sanitizeAmountInput(text))}
        keyboardType="decimal-pad"
        autoFocus={autoFocus}
        caretHidden
        contextMenuHidden
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint="Montant en euros, virgule pour les centimes"
        style={styles.hiddenInput}
      />
      {typeof helper === 'string' ? (
        <Text variant="label-regular" color="secondary" style={styles.helper}>
          {helper}
        </Text>
      ) : (
        helper
      )}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  block: {
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: t.spacing[8],
  },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    gap: t.spacing[4],
  },
  value: {
    flexShrink: 1,
  },
  cursor: {
    width: t.sizes.amountCursor.width,
    height: t.sizes.amountCursor.height,
    borderRadius: t.radius.full,
    backgroundColor: t.colors.bg.accent,
  },
  hiddenInput: {
    position: 'absolute',
    width: t.sizes.borderWidth.thin,
    height: t.sizes.borderWidth.thin,
    opacity: 0,
  },
  helper: {
    textAlign: 'center',
  },
}));
