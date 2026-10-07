import React, { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { View } from 'react-native';
import GorhomBottomSheet, { BottomSheetBackdrop, BottomSheetScrollView, type BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { makeStyles, useTheme } from '../theme';
import { InSheetContext } from './SheetInput';

export type BottomSheetHandle = {
  /** Referme la feuille avec son animation ; `onClosed` est appelé à la fin. */
  close: () => void;
};

type Props = {
  children: React.ReactNode;
  /** Appelé une fois la feuille refermée (glissée vers le bas, overlay touché, close()). */
  onClosed: () => void;
  /** Espace entre les blocs : 24 (défaut) ou 16 (ajout de plusieurs dépenses). */
  gap?: 16 | 24;
  accessibilityLabel?: string;
};

/**
 * Pop-up qui monte du bas de l'écran (calque « Bottom sheet » des maquettes) :
 * poignée 40×5, fond bg/sheet, coins hauts arrondis, overlay bg/overlay.
 * Sa hauteur suit son contenu ; elle défile si le clavier ne laisse pas assez
 * de place.
 */
export const BottomSheet = forwardRef<BottomSheetHandle, Props>(function BottomSheet(
  { children, onClosed, gap = 24, accessibilityLabel },
  ref,
) {
  const styles = useStyles();
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<GorhomBottomSheet>(null);

  useImperativeHandle(ref, () => ({ close: () => sheetRef.current?.close() }), []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={1}
        pressBehavior="close"
        accessibilityLabel="Fermer"
        style={[props.style, { backgroundColor: colors.bg.overlay }]}
      />
    ),
    [colors.bg.overlay],
  );

  const renderHandle = useCallback(
    () => (
      <View style={styles.handleArea} accessible accessibilityLabel="Faire glisser vers le bas pour fermer">
        <View style={styles.handle} />
      </View>
    ),
    [styles],
  );

  return (
    <GestureHandlerRootView style={styles.root}>
      <GorhomBottomSheet
        ref={sheetRef}
        index={0}
        enableDynamicSizing
        enablePanDownToClose
        // Sans sur-glissement vers le haut, la bibliothèque n'ajoute plus sa marge
        // de sécurité (~80) sous le contenu : la feuille épouse exactement sa hauteur.
        enableOverDrag={false}
        overDragResistanceFactor={0}
        onClose={onClosed}
        topInset={insets.top}
        backdropComponent={renderBackdrop}
        handleComponent={renderHandle}
        backgroundStyle={styles.background}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        accessibilityLabel={accessibilityLabel}
      >
        <InSheetContext.Provider value>
          <BottomSheetScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.content,
              {
                gap: spacing[gap],
                paddingTop: spacing[gap],
                paddingBottom: Math.max(spacing[32], insets.bottom + spacing[16]),
              },
            ]}
          >
            {children}
          </BottomSheetScrollView>
        </InSheetContext.Provider>
      </GorhomBottomSheet>
    </GestureHandlerRootView>
  );
});

const useStyles = makeStyles((t) => ({
  root: {
    flex: 1,
  },
  background: {
    backgroundColor: t.colors.bg.sheet,
    borderTopLeftRadius: t.radius.lg,
    borderTopRightRadius: t.radius.lg,
  },
  handleArea: {
    alignItems: 'center',
    paddingTop: t.spacing[12],
  },
  handle: {
    width: t.sizes.sheetHandle.width,
    height: t.sizes.sheetHandle.height,
    borderRadius: t.radius.full,
    backgroundColor: t.colors.bg.brandStrong,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: t.layout.screenMargin,
  },
}));
