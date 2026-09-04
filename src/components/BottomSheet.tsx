import React from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
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
 *
 * Enveloppée dans un KeyboardAvoidingView : sans ça, le clavier natif du
 * téléphone recouvre la feuille (elle est ancrée en bas, pile là où le
 * clavier apparaît) et cache le champ en cours de saisie. La feuille est
 * positionnée par flexbox (justifyContent: 'flex-end') plutôt qu'en absolu
 * pour que le padding ajouté par le KeyboardAvoidingView la pousse
 * réellement vers le haut.
 */
export function BottomSheet({ visible, onClose, children }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <KeyboardAvoidingView
        style={styles.keyboardAvoider}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        pointerEvents="box-none"
      >
        <View style={styles.sheet}>
          <Pressable onPress={onClose} hitSlop={12} style={styles.handle} />
          {/*
            Défilable et bornée en hauteur : une fois le clavier ouvert, la
            place restante peut être insuffisante pour tout le contenu — sans
            ça, un champ du haut resterait inaccessible plutôt que de pouvoir
            scroller jusqu'à lui.
          */}
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(6,6,6,0.4)' },
  keyboardAvoider: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: '#F6F6F6',
    borderTopLeftRadius: radius.screen,
    borderTopRightRadius: radius.screen,
    paddingTop: spacing.xxl,
    alignItems: 'center',
  },
  scroll: { width: '100%' },
  scrollContent: {
    paddingHorizontal: spacing.xxl,
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
