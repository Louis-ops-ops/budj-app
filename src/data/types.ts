import type { CategoryColor } from '../theme/colors';
import type { ThemePreference } from '../theme/ThemeProvider';
import type { Day } from './dates';

export type { CategoryColor, ThemePreference };
export type { Day, Month } from './dates';

/**
 * Modèle de données v2, stocké en JSON sous une seule clé AsyncStorage.
 * Tous les montants sont en centimes (entiers), les dates en `YYYY-MM-DD`.
 */
export interface Settings {
  /** Budget mensuel global, en centimes (ex. 190000 = 1 900 €). */
  monthlyBudget: number;
  theme: ThemePreference;
}

export interface Category {
  id: string;
  /** Unique, non vide. */
  name: string;
  color: CategoryColor;
  /** Budget mensuel alloué, en centimes. */
  monthlyBudget: number;
  createdAt: Day;
}

/** Épargne, Factures, Distractions + celles créées par l'utilisateur. */
export interface FixedSubcategory {
  id: string;
  name: string;
}

export interface FixedExpense {
  id: string;
  /** Ex. Netflix. */
  label: string;
  /** Montant mensuel, en centimes. */
  amount: number;
  /** 1 à 31 ; si le mois est plus court, le prélèvement tombe le dernier jour. */
  dayOfMonth: number;
  subcategoryId: string;
  /** Clé d'un logo connu (optionnel). */
  logo?: string;
}

export interface Expense {
  id: string;
  /** En centimes. */
  amount: number;
  label: string;
  /** null = « Sans catégorie ». */
  categoryId: string | null;
  date: Day;
  /** Ex. « Carte bancaire ». */
  detail?: string;
}

export interface BudjData {
  schemaVersion: 2;
  settings: Settings;
  categories: Category[];
  fixedSubcategories: FixedSubcategory[];
  fixedExpenses: FixedExpense[];
  expenses: Expense[];
}

/** Sous-catégories de dépenses fixes toujours proposées. */
export const DEFAULT_FIXED_SUBCATEGORIES = ['Épargne', 'Factures', 'Distractions'] as const;

/** Libellé des dépenses dont la catégorie a été supprimée. */
export const UNCATEGORIZED_LABEL = 'Sans catégorie';
