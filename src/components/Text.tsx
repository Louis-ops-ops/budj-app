import React from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { useTheme, type CategoryTone, type TextColor, type TextVariant } from '../theme';

export type TextProps = RNTextProps & {
  /** Style de texte du design system (Display, Heading, Body, Label, Caption). */
  variant?: TextVariant;
  /** Token text/* (couleur par défaut : text/primary). */
  color?: TextColor;
  /**
   * Teinte de catégorie (category/*\/fg) : prioritaire sur `color`, pour les
   * titres et montants affichés aux couleurs d'une catégorie.
   */
  categoryColor?: CategoryTone;
};

/** Texte du design system : la police, la taille et la couleur viennent du thème. */
export function Text({ variant = 'body-regular', color = 'primary', categoryColor, style, ...rest }: TextProps) {
  const theme = useTheme();
  const tint = categoryColor ? theme.colors.category[categoryColor].fg : theme.colors.text[color];
  const isDisplay = variant.startsWith('display');
  return (
    <RNText
      maxFontSizeMultiplier={isDisplay ? theme.maxFontScale.display : theme.maxFontScale.default}
      {...rest}
      style={[theme.text[variant], { color: tint }, style]}
    />
  );
}
