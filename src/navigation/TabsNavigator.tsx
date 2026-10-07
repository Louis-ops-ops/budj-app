import React from 'react';
import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { TabBar, type TabKey } from '../components';
import { EvolutionScreen } from '../screens/EvolutionScreen';
import { FixesScreen } from '../screens/FixesScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { TAB_ROUTES } from '../screens/ScreenLayout';
import { useTheme } from '../theme';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

const TAB_KEYS: Record<keyof TabParamList, TabKey> = {
  Categories: 'categories',
  Fixes: 'fixes',
  History: 'history',
  Evolution: 'evolution',
};

function AppTabBar({ state, navigation }: BottomTabBarProps) {
  const routeName = state.routes[state.index].name as keyof TabParamList;
  return (
    <TabBar
      active={TAB_KEYS[routeName]}
      // Sous le bouton « Ajouter » de l'onglet Fixes, la barre est un peu plus proche (Figma 9:174).
      topGap={routeName === 'Fixes' ? 12 : 18}
      onSelect={(key) => navigation.navigate(TAB_ROUTES[key])}
      onAdd={() => navigation.navigate('AddExpense')}
    />
  );
}

/** Les 4 onglets : Catégories (accueil), Fixes, Historique, Évolution. */
export function TabsNavigator() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{ headerShown: false, animation: 'fade', sceneStyle: { backgroundColor: colors.bg.app } }}
    >
      <Tab.Screen name="Categories" component={HomeScreen} options={{ title: 'Catégories' }} />
      <Tab.Screen name="Fixes" component={FixesScreen} options={{ title: 'Fixes' }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ title: 'Historique' }} />
      <Tab.Screen name="Evolution" component={EvolutionScreen} options={{ title: 'Évolution' }} />
    </Tab.Navigator>
  );
}
