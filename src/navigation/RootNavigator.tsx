import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MonBudgetScreen } from '../screens/MonBudgetScreen';
import { CategorieDetailScreen } from '../screens/CategorieDetailScreen';
import { DeplacerDepenseScreen } from '../screens/DeplacerDepenseScreen';
import { DepensesFixesScreen } from '../screens/DepensesFixesScreen';
import { DepensesFixesDetailScreen } from '../screens/DepensesFixesDetailScreen';
import { HistoriqueScreen } from '../screens/HistoriqueScreen';
import { AjouterDepenseScreen } from '../screens/AjouterDepenseScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right', animationDuration: 220 }}>
        {/*
          Les 3 écrans reliés par la NavBar (Catégories/Fixe/Historique) sont
          des allers-retours latéraux, pas des approfondissements — un fondu
          rend ce changement d'onglet plus naturel qu'un slide directionnel.
          Les écrans de "drill-down" (détail, déplacer une dépense) gardent
          le slide_from_right par défaut, qui donne la sensation d'aller
          plus loin dans la navigation.
        */}
        <Stack.Screen name="MonBudget" component={MonBudgetScreen} options={{ animation: 'fade' }} />
        <Stack.Screen name="CategorieDetail" component={CategorieDetailScreen} />
        <Stack.Screen name="DeplacerDepense" component={DeplacerDepenseScreen} />
        <Stack.Screen name="DepensesFixes" component={DepensesFixesScreen} options={{ animation: 'fade' }} />
        <Stack.Screen name="DepensesFixesDetail" component={DepensesFixesDetailScreen} />
        <Stack.Screen name="Historique" component={HistoriqueScreen} options={{ animation: 'fade' }} />
        <Stack.Screen
          name="AjouterDepense"
          component={AjouterDepenseScreen}
          // transparentModal + slide_from_bottom : le plus proche d'une vraie
          // feuille glissée depuis le bas qu'offre native-stack pour un écran
          // de route (les autres popups sont des <BottomSheet> locaux, mais
          // celui-ci reste une route car "+" y mène depuis plusieurs écrans).
          options={{ presentation: 'transparentModal', animation: 'slide_from_bottom' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
