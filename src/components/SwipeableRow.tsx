import React, { useRef, useState } from 'react';
import { Animated, PanResponder, StyleSheet, View } from 'react-native';
import { IconButton } from './IconButton';

const DELETE_WIDTH = 64;

type Props = {
  onDelete: () => void;
  /**
   * Couleur de fond du contenu glissé — doit correspondre au fond réel
   * derrière la ligne (blanc de l'écran, ou bleue-50 si la ligne est dans un
   * encadré) : sans un fond opaque ici, le bouton supprimer positionné
   * derrière resterait visible en transparence même au repos, avant tout
   * glissement.
   */
  backgroundColor: string;
  children: React.ReactNode;
};

/**
 * Ligne "glisser vers la gauche pour supprimer" : le bord gauche de la carte
 * reste fixe, seule sa largeur se réduit en glissant — elle ne part pas hors
 * de l'écran, elle se comprime juste assez pour laisser apparaître le bouton
 * (le même IconButton rond bleu clair que pour supprimer une catégorie sur
 * "Mon budget", pas un bloc rouge). Il faut tapoter ce bouton pour
 * confirmer, le geste seul ne supprime rien.
 */
export function SwipeableRow({ onDelete, backgroundColor, children }: Props) {
  const [fullWidth, setFullWidth] = useState(0);
  // La largeur ne peut pas être animée sur le driver natif — cette valeur
  // reste donc pilotée en JS (pas de useNativeDriver ici).
  const dragX = useRef(new Animated.Value(0)).current;
  const offset = useRef(0);

  const close = () => {
    offset.current = 0;
    Animated.spring(dragX, { toValue: 0, useNativeDriver: false, bounciness: 0 }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 8 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onPanResponderMove: (_, gesture) => {
        const next = Math.min(0, Math.max(-DELETE_WIDTH, offset.current + gesture.dx));
        dragX.setValue(next);
      },
      onPanResponderRelease: (_, gesture) => {
        const next = offset.current + gesture.dx;
        offset.current = next < -DELETE_WIDTH / 2 ? -DELETE_WIDTH : 0;
        Animated.spring(dragX, { toValue: offset.current, useNativeDriver: false, bounciness: 0 }).start();
      },
    })
  ).current;

  return (
    <View style={styles.container} onLayout={(e) => setFullWidth(e.nativeEvent.layout.width)}>
      <View style={styles.deleteSlot}>
        <IconButton
          icon="trash"
          onPress={() => {
            close();
            onDelete();
          }}
        />
      </View>
      <Animated.View
        style={{ backgroundColor, width: fullWidth ? Animated.add(fullWidth, dragX) : '100%' }}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  deleteSlot: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: DELETE_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
