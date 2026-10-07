import React, { useMemo } from 'react';
import { DarkTheme, DefaultTheme, NavigationContainer, type Theme as NavigationTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CategoryDetailScreen } from '../screens/CategoryDetailScreen';
import { FixedByCategoryScreen } from '../screens/FixedByCategoryScreen';
import { MonthDetailScreen } from '../screens/MonthDetailScreen';
import { MoveExpenseScreen } from '../screens/MoveExpenseScreen';
import { AddExpenseSheet } from '../screens/sheets/AddExpenseSheet';
import { EditBudgetSheet } from '../screens/sheets/EditBudgetSheet';
import { FixedExpenseFormSheet } from '../screens/sheets/FixedExpenseFormSheet';
import { NewCategorySheet } from '../screens/sheets/NewCategorySheet';
import { useTheme } from '../theme';
import type { RootStackParamList } from './types';
import { TabsNavigator } from './TabsNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Pile racine : les onglets, les écrans de détail, puis les pop-ups. Les
 * pop-ups sont des écrans transparents qui dessinent leur propre BottomSheet
 * (overlay, poignée et coins du design, impossibles à obtenir avec la
 * présentation formSheet native).
 */
export function RootNavigator() {
  const theme = useTheme();
  const navigationTheme = useMemo<NavigationTheme>(() => {
    const base = theme.scheme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: theme.colors.bg.accent,
        background: theme.colors.bg.app,
        card: theme.colors.bg.app,
        text: theme.colors.text.primary,
        border: theme.colors.border.subtle,
      },
    };
  }, [theme]);

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.bg.app } }}>
        <Stack.Screen name="Tabs" component={TabsNavigator} />
        <Stack.Screen name="CategoryDetail" component={CategoryDetailScreen} />
        <Stack.Screen name="MoveExpense" component={MoveExpenseScreen} />
        <Stack.Screen name="FixedByCategory" component={FixedByCategoryScreen} />
        <Stack.Screen name="MonthDetail" component={MonthDetailScreen} />
        <Stack.Group
          screenOptions={{
            presentation: 'transparentModal',
            animation: 'none',
            contentStyle: { backgroundColor: theme.colors.bg.none },
          }}
        >
          <Stack.Screen name="AddExpense" component={AddExpenseSheet} />
          <Stack.Screen name="NewCategory" component={NewCategorySheet} />
          <Stack.Screen name="EditBudget" component={EditBudgetSheet} />
          <Stack.Screen name="FixedExpenseForm" component={FixedExpenseFormSheet} />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
