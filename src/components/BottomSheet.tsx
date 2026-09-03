import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { radius, spacing } from '../theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

/**
 * Feuille modale qui glisse depuis le bas de l'écran (voir popups Figma
 * "Pop up ajouter..." — coins arrondis en haut uniquement, poignée de
 * fermeture, fond #F6F6F6 légèrement distinct du blanc de l'app). S'appuie
 * sur le <Modal> natif de React Native (animationType="slide") pour une
 * animation fluide et cohérente sur iOS/Android/web sans dépendance
 * supplémentaire.
 */
export function BottomSheet({ visible, onClose, children }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <Pressable onPress={onClose} hitSlop={12} style={styles.handle} />
        {children}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(6,6,6,0.4)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F6F6F6',
    borderTopLeftRadius: radius.screen,
    borderTopRightRadius: radius.screen,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl + 24,
    gap: spacing.xxl,
    alignItems: 'center',
  },
  handle: {
    width: 64,
    height: 6,
    borderRadius: 32,
    backgroundColor: '#EEF1FE',
  },
});
