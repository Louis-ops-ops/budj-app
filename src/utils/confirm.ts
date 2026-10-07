import { Alert, Platform } from 'react-native';

type Options = {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
};

/**
 * Demande confirmation avant une action destructrice. Alert ne fait rien sur
 * le web (react-native-web) : on y passe par la boîte de dialogue du navigateur.
 */
export function confirmDestructive({ title, message, confirmLabel, onConfirm }: Options): void {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Annuler', style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
}
