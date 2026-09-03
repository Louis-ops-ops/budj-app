export type CategoryColor = { fond: string; texte: string };

/** Catégorie "normale" créée par l'utilisateur (Courses, Restaurants, Sorties...) */
export type Category = {
  id: string;
  name: string;
  budget: number;
  color: CategoryColor;
};

/**
 * Sous-catégorie de "Dépenses fixes" (Distractions, Factures, Logement...).
 * A son propre budget, comme une mini-catégorie — voir le node Figma 30:851
 * ("Dans catégorie dépenses fixes") qui affiche chaque sous-catégorie avec
 * son propre en-tête + actions éditer/supprimer.
 */
export type FixedSubCategory = {
  id: string;
  name: string;
  budget: number;
};

/** Une dépense fixe récurrente (Netflix, EDF, loyer...) rattachée à une sous-catégorie */
export type FixedExpense = {
  id: string;
  subCategoryId: string;
  label: string;
  amount: number;
  /** Jour du mois où elle est prélevée (1-31), pour l'affichage calendrier */
  dayOfMonth: number;
};

export type PaymentMethod = 'Carte bancaire' | 'Espèces' | 'Apple pay';

/** Une dépense ponctuelle rattachée à une catégorie "normale" */
export type Expense = {
  id: string;
  categoryId: string;
  label: string;
  amount: number;
  /** Date ISO (YYYY-MM-DD) */
  date: string;
  paymentMethod: PaymentMethod;
};

export type BudjState = {
  budgetDefini: number;
  categories: Category[];
  fixedSubCategories: FixedSubCategory[];
  fixedExpenses: FixedExpense[];
  expenses: Expense[];
};

/**
 * Identifiant réservé de la catégorie fantôme "Non catégorisé" : jamais
 * stockée dans `categories`, jamais proposée à la création ni comme cible
 * d'un déplacement — elle n'existe (virtuellement) que pour accueillir les
 * dépenses d'une catégorie que l'utilisateur a supprimée, le temps qu'il les
 * range ailleurs. Voir `deleteCategory` / `displayCategories` dans
 * BudjContext.tsx.
 */
export const NON_CATEGORISE_ID = 'non-categorise';
