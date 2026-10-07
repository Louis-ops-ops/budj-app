import React, { useCallback, useEffect, useRef } from 'react';
import { Keyboard } from 'react-native';
import { useNavigation, type NavigationAction } from '@react-navigation/native';
import { BottomSheet, type BottomSheetHandle } from '../components';

type Props = {
  children: React.ReactNode;
  gap?: 16 | 24;
  accessibilityLabel?: string;
};

/** Si l'animation de fermeture ne se termine pas (cas limite), on ferme quand même. */
const CLOSE_FALLBACK_MS = 800;

/**
 * Écran de pop-up : une BottomSheet dont la fermeture suit la navigation.
 * Quand l'écran doit partir (bouton retour, goBack, popTo…), on joue d'abord
 * l'animation de la feuille puis on rejoue l'action de navigation ; quand
 * l'utilisateur ferme la feuille (glissé, overlay), on revient en arrière.
 */
export function SheetScreen({ children, gap, accessibilityLabel }: Props) {
  const navigation = useNavigation();
  const sheetRef = useRef<BottomSheetHandle>(null);
  const closed = useRef(false);
  const pendingAction = useRef<NavigationAction | null>(null);
  const fallback = useRef<ReturnType<typeof setTimeout> | null>(null);

  const finish = useCallback(() => {
    if (closed.current) return;
    closed.current = true;
    if (fallback.current) clearTimeout(fallback.current);
    const action = pendingAction.current;
    if (action) navigation.dispatch(action);
    else navigation.goBack();
  }, [navigation]);

  useEffect(
    () =>
      navigation.addListener('beforeRemove', (event) => {
        if (closed.current) return;
        event.preventDefault();
        pendingAction.current = event.data.action;
        Keyboard.dismiss();
        sheetRef.current?.close();
        fallback.current = setTimeout(finish, CLOSE_FALLBACK_MS);
      }),
    [navigation, finish],
  );

  useEffect(
    () => () => {
      if (fallback.current) clearTimeout(fallback.current);
    },
    [],
  );

  return (
    <BottomSheet ref={sheetRef} onClosed={finish} gap={gap} accessibilityLabel={accessibilityLabel}>
      {children}
    </BottomSheet>
  );
}
