import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  /**
   * Écran unique "Mon budget" (voir node Figma 9:1263 "Catégories / Mon budget") :
   * regroupe le budget global, la carte "Dépenses fixes" et la liste des
   * catégories, avec un mode édition local (icônes supprimer, voir node 30:763
   * "Clique sur supprimer") et une modale d'ajout de catégorie — pas de route
   * séparée pour "Categories", contrairement à une première version de ce code.
   */
  MonBudget: undefined;
  CategorieDetail: { categoryId: string };
  DeplacerDepense: { categoryId: string };
  DepensesFixes: undefined;
  DepensesFixesDetail: undefined;
  Historique: undefined;
  AjouterDepense: undefined;
};

export type RootScreenProps<Screen extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  Screen
>;
