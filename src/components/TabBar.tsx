import React from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { makeStyles, useTheme } from '../theme';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export type TabKey = 'categories' | 'fixes' | 'history' | 'evolution';

const TAB_ICON_SIZE = 20;

const TABS: { key: TabKey; label: string; icon: IconName }[] = [
  { key: 'categories', label: 'Catégories', icon: 'categories' },
  { key: 'fixes', label: 'Fixes', icon: 'calendar' },
  { key: 'history', label: 'Historique', icon: 'history' },
  { key: 'evolution', label: 'Évolution', icon: 'trendUp' },
];

type Props = {
  active: TabKey;
  onSelect: (tab: TabKey) => void;
  /** Bouton « + » : ouvre la pop-up Ajouter une dépense. */
  onAdd: () => void;
};

/**
 * Barre de navigation basse (Figma « Nav bar » 187:1482) : bouton « + » puis
 * les 4 onglets ; l'onglet actif affiche son libellé sur fond clair contouré.
 * Gère elle-même la marge basse (zone du geste d'accueil).
 */
export function TabBar({ active, onSelect, onAdd }: Props) {
  const styles = useStyles();
  const { layout, sizes, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  // Un onglet fait 28 de haut (icône 20 + 2 × 4) : on étend sa zone tactile à 44.
  const itemHeight = TAB_ICON_SIZE + spacing[4] * 2;
  const itemSlop = (sizes.touchTarget - itemHeight) / 2;

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, layout.screenBottom) }]}>
      <View style={styles.bar}>
        <Pressable
          onPress={onAdd}
          accessibilityRole="button"
          accessibilityLabel="Ajouter une dépense"
          style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
        >
          <Icon name="add" size={TAB_ICON_SIZE} color="brand" />
        </Pressable>

        <View style={styles.tabs} accessibilityRole="tablist">
          {TABS.map((tab) => {
            const isActive = tab.key === active;
            return (
              <Pressable
                key={tab.key}
                onPress={() => onSelect(tab.key)}
                hitSlop={{ top: itemSlop, bottom: itemSlop }}
                accessibilityRole="tab"
                accessibilityLabel={tab.label}
                accessibilityState={{ selected: isActive }}
                style={({ pressed }) => [styles.item, isActive && styles.itemActive, pressed && styles.pressed]}
              >
                <Icon name={tab.icon} size={TAB_ICON_SIZE} color="brand" />
                {isActive && (
                  <Text variant="label-bold" color="brandStrong" numberOfLines={1}>
                    {tab.label}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  container: {
    paddingHorizontal: t.layout.screenMargin,
    paddingTop: t.spacing[18],
    backgroundColor: t.colors.bg.app,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing[24],
    height: t.sizes.navButton,
  },
  addButton: {
    width: t.sizes.navButton,
    height: t.sizes.navButton,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.radius.full,
    borderWidth: t.sizes.borderWidth.thin,
    borderColor: t.colors.border.brand,
    backgroundColor: t.colors.bg.navAction,
  },
  tabs: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: t.spacing[8],
    borderRadius: t.radius.full,
    backgroundColor: t.colors.bg.navAction,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing[4],
    // Le contour existe toujours (transparent hors sélection) pour que la
    // taille de l'onglet ne change pas quand il devient actif.
    borderWidth: t.sizes.borderWidth.thin,
    borderColor: t.colors.bg.none,
    paddingHorizontal: t.spacing[10] - t.sizes.borderWidth.thin,
    paddingVertical: t.spacing[4] - t.sizes.borderWidth.thin,
    borderRadius: t.radius.full,
  },
  itemActive: {
    backgroundColor: t.colors.bg.navActive,
    borderColor: t.colors.border.brand,
  },
  pressed: {
    opacity: t.opacity.pressed,
  },
}));
