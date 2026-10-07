import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { Month } from '../data/dates';

/** Onglets de la barre de navigation basse. */
export type TabParamList = {
  Categories: undefined;
  Fixes: undefined;
  History: undefined;
  Evolution: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  /** `categoryId: null` = dépenses « Sans catégorie ». */
  CategoryDetail: { categoryId: string | null };
  MoveExpense: { categoryId: string | null };
  /** Vue Dépenses fixes ouverte depuis la carte de l'accueil. */
  FixedByCategory: undefined;
  MonthDetail: { month: Month };

  // Pop-ups
  AddExpense:
    | {
        /** Catégorie présélectionnée (ouverture depuis le détail d'une catégorie). */
        categoryId?: string;
        /** Retour de « Nouvelle catégorie » : catégorie à sélectionner… */
        selectCategoryId?: string;
        /** …dans la dépense n° selectFor (mode multiple). */
        selectFor?: number;
      }
    | undefined;
  NewCategory: { returnTo?: 'AddExpense'; entryIndex?: number } | undefined;
  EditBudget: { target: 'global' } | { target: 'category'; categoryId: string };
  FixedExpenseForm: { fixedExpenseId?: string; dayOfMonth?: number } | undefined;
};

export type RootScreenProps<Name extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, Name>;

export type TabScreenProps<Name extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, Name>,
  NativeStackScreenProps<RootStackParamList>
>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
