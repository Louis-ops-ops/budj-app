import React from 'react';
import { ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabBar, type TabKey } from '../components';
import type { RootStackParamList, TabParamList } from '../navigation/types';
import { makeStyles, useTheme } from '../theme';

/** Onglet de la barre ↔ écran du navigateur à onglets. */
export const TAB_ROUTES: Record<TabKey, keyof TabParamList> = {
  categories: 'Categories',
  fixes: 'Fixes',
  history: 'History',
  evolution: 'Evolution',
};

type Props = {
  children: React.ReactNode;
  /**
   * Écran empilé au-dessus des onglets (détail) : affiche la barre de
   * navigation avec cet onglet actif, comme dans les maquettes.
   */
  tab?: TabKey;
  /** Catégorie présélectionnée quand on touche « + » depuis cet écran. */
  addCategoryId?: string;
  /** Bloc fixe au-dessus de la zone qui défile (titre « collant »). */
  header?: React.ReactNode;
  /** Bloc fixe sous la zone qui défile, au-dessus de la barre (bouton d'action). */
  footer?: React.ReactNode;
  /** Espace entre les blocs du contenu : 32 (défaut) ou 24. */
  gap?: 24 | 32;
  /** false quand l'écran gère lui-même son défilement (FlatList). */
  scrollable?: boolean;
};

/**
 * Gabarit commun des écrans : fond bg/app, marges latérales de 24, haut aligné
 * sous la barre d'état (44 au minimum, comme sur l'écran de référence).
 */
export function ScreenLayout({ children, tab, addCategoryId, header, footer, gap = 32, scrollable = true }: Props) {
  const styles = useStyles();
  const { layout, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, layout.screenTop) }]}>
      {header && <View style={styles.header}>{header}</View>}
      {scrollable ? (
        <ScrollView
          style={styles.fill}
          contentContainerStyle={[styles.content, { gap: spacing[gap] }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={styles.fill}>{children}</View>
      )}
      {footer && <View style={styles.footer}>{footer}</View>}
      {tab && (
        <TabBar
          active={tab}
          onSelect={(key) => navigation.popTo('Tabs', { screen: TAB_ROUTES[key] })}
          onAdd={() => navigation.navigate('AddExpense', addCategoryId ? { categoryId: addCategoryId } : undefined)}
        />
      )}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  screen: {
    flex: 1,
    backgroundColor: t.colors.bg.app,
  },
  fill: {
    flex: 1,
  },
  header: {
    paddingHorizontal: t.layout.screenMargin,
    paddingBottom: t.spacing[24],
  },
  content: {
    paddingHorizontal: t.layout.screenMargin,
    paddingBottom: t.spacing[24],
  },
  footer: {
    paddingHorizontal: t.layout.screenMargin,
    paddingTop: t.spacing[18],
  },
}));
