import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AmountField, Icon } from '../components';
import { useBudj } from '../data/BudjContext';
import { colors, radius, spacing, typography } from '../theme';
import type { RootScreenProps } from '../navigation/types';
import type { PaymentMethod } from '../data/types';

const PAYMENT_METHODS: PaymentMethod[] = ['Carte bancaire', 'Espèces', 'Apple pay'];

/**
 * Pixel perfect sur le popup Figma 18:472 "Pop up ajout" (section "Ajouter
 * une dépense") : gros montant, champ "Libellé" et sélecteurs "Catégorie" /
 * "Moyen de paiement" tous les deux dans le même style "nu" (texte +
 * chevron, sans encadré) — contrairement aux champs "Formulaire" encadrés
 * des autres popups. "Ajouter une autre dépense ?" enregistre la dépense en
 * cours et réinitialise le formulaire pour en saisir une autre sans
 * refermer la feuille ; "Valider" enregistre et referme.
 */
export function AjouterDepenseScreen({ navigation }: RootScreenProps<'AjouterDepense'>) {
  const { state, addExpense } = useBudj();

  const [amount, setAmount] = useState('');
  const [label, setLabel] = useState('');
  const [categoryId, setCategoryId] = useState(state.categories[0]?.id);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | undefined>(undefined);
  const [openPicker, setOpenPicker] = useState<'categorie' | 'paiement' | null>(null);

  const category = state.categories.find((c) => c.id === categoryId);
  const parsedAmount = Number(amount.replace(',', '.'));
  const canSubmit = parsedAmount > 0 && !!label.trim() && !!categoryId && !!paymentMethod;

  const reset = () => {
    setAmount('');
    setLabel('');
    setPaymentMethod(undefined);
    setOpenPicker(null);
  };

  const save = () => {
    if (!canSubmit || !categoryId || !paymentMethod) return false;
    addExpense({ categoryId, label: label.trim(), amount: parsedAmount, paymentMethod });
    return true;
  };

  const addAnother = () => {
    if (save()) reset();
  };

  const submit = () => {
    if (save()) navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.body}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.handle} />

        <View style={styles.infos}>
          <Text style={typography.h1}>Ajouter une dépense</Text>

          <View style={styles.form}>
            <AmountField value={amount} onChangeText={setAmount} />

            <TextInput
              value={label}
              onChangeText={setLabel}
              placeholder="Libellé"
              placeholderTextColor={colors.gris}
              style={styles.bareInput}
            />

            <BareSelector
              placeholder="Catégorie"
              value={category?.name}
              open={openPicker === 'categorie'}
              onPress={() => setOpenPicker((p) => (p === 'categorie' ? null : 'categorie'))}
            />
            {openPicker === 'categorie' && (
              <View style={styles.picker}>
                {state.categories.map((c) => (
                  <Pressable
                    key={c.id}
                    onPress={() => {
                      setCategoryId(c.id);
                      setOpenPicker(null);
                    }}
                    style={[styles.chip, { backgroundColor: c.color.fond }, categoryId === c.id && styles.chipSelected]}
                  >
                    <Text style={[typography.labelXsMedium, { color: c.color.texte }]}>{c.name}</Text>
                  </Pressable>
                ))}
              </View>
            )}

            <BareSelector
              placeholder="Moyen de paiement"
              value={paymentMethod}
              open={openPicker === 'paiement'}
              onPress={() => setOpenPicker((p) => (p === 'paiement' ? null : 'paiement'))}
            />
            {openPicker === 'paiement' && (
              <View style={styles.picker}>
                {PAYMENT_METHODS.map((m) => (
                  <Pressable
                    key={m}
                    onPress={() => {
                      setPaymentMethod(m);
                      setOpenPicker(null);
                    }}
                    style={[styles.chip, { backgroundColor: colors.bleue[50] }, paymentMethod === m && styles.chipSelected]}
                  >
                    <Text style={typography.labelXsMedium}>{m}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <Pressable onPress={addAnother} disabled={!canSubmit} style={[styles.secondaryButton, !canSubmit && styles.buttonDisabled]}>
          <Icon name="plus" size={18} color={colors.bleue[500]} />
          <Text style={styles.secondaryLabel}>Ajouter une autre dépense ?</Text>
        </Pressable>

        <Pressable onPress={submit} disabled={!canSubmit} style={[styles.primaryButton, !canSubmit && styles.buttonDisabled]}>
          <Icon name="chevronRight" size={20} color={colors.blanc} />
          <Text style={styles.primaryLabel}>Valider</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function BareSelector({
  placeholder,
  value,
  open,
  onPress,
}: {
  placeholder: string;
  value?: string;
  open: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.bareRow}>
      {/* Une fois choisie, la valeur reste dans le même gris clair que le reste du popup (pas de bleu/noir qui tranche) */}
      <Text style={[styles.bareInput, { color: colors.gris }]}>{value ?? placeholder}</Text>
      <View style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}>
        <Icon name="chevronDown" size={18} color={colors.gris} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F6F6F6', borderTopLeftRadius: radius.screen, borderTopRightRadius: radius.screen },
  body: { paddingHorizontal: spacing.xxl, paddingTop: spacing.xxl, paddingBottom: spacing.xxl, gap: spacing.xxl, alignItems: 'center' },
  handle: { width: 64, height: 6, borderRadius: 32, backgroundColor: colors.bleue[100] },
  infos: { width: '100%', gap: spacing.xxl },
  form: { width: '100%', gap: spacing.md },
  bareInput: { fontFamily: 'Outfit_500Medium', fontSize: 18, lineHeight: 20, padding: 0, color: colors.texte },
  bareRow: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  picker: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 999 },
  chipSelected: { borderWidth: 2, borderColor: colors.bleue[500] },
  // En dehors du ScrollView : fixé en bas de l'écran, pas emporté par le défilement du formulaire
  actions: { width: '100%', gap: spacing.md, paddingHorizontal: spacing.xxl, paddingBottom: spacing.xxl },
  secondaryButton: {
    width: '100%',
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bleue[50],
    borderWidth: 1,
    borderColor: colors.bleue[500],
    borderRadius: 999,
    paddingVertical: spacing.md,
  },
  secondaryLabel: { fontFamily: 'Outfit_400Regular', fontSize: 16, lineHeight: 18, color: colors.bleue[500] },
  primaryButton: {
    width: '100%',
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bleue[500],
    borderRadius: 999,
    paddingVertical: spacing.md,
  },
  primaryLabel: { fontFamily: 'Outfit_500Medium', fontSize: 18, lineHeight: 20, color: colors.blanc },
  buttonDisabled: { opacity: 0.4 },
});
