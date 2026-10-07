import React, { createContext, forwardRef, useContext } from 'react';
import { TextInput, type TextInputProps } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';

/** Vrai quand le composant est rendu dans une BottomSheet. */
export const InSheetContext = createContext(false);

/**
 * Champ texte natif qui, dans une pop-up, passe par BottomSheetTextInput :
 * la feuille remonte alors au-dessus du clavier au lieu d'être masquée.
 */
export const SheetAwareTextInput = forwardRef<TextInput, TextInputProps>(function SheetAwareTextInput(props, ref) {
  const inSheet = useContext(InSheetContext);
  if (inSheet) {
    // BottomSheetTextInput attend le TextInput de gesture-handler, de même API.
    return <BottomSheetTextInput ref={ref as never} {...props} />;
  }
  return <TextInput ref={ref} {...props} />;
});
