import { BudjState } from './types';

/**
 * État de départ réel de l'application : entièrement vide. Les données de
 * démonstration (Courses, Carrefour, Netflix...) qui servaient à valider les
 * écrans pendant le développement ont été retirées — tout se construit
 * maintenant depuis l'app, à partir de rien, comme pour un vrai premier
 * lancement.
 */
export const seedState: BudjState = {
  budgetDefini: 0,
  categories: [],
  fixedSubCategories: [],
  fixedExpenses: [],
  expenses: [],
};
