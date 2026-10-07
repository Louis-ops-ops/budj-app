import type { BudjData } from '../types';

/** Jour de référence des tests : mercredi 7 octobre 2026. */
export const TODAY = '2026-10-07';

/**
 * Jeu de données réduit, aux montants simples à recalculer à la main :
 * fixes = 300 + 8,99 + 54 = 362,99 € ; budget 1 900 €.
 */
export function makeData(): BudjData {
  return {
    schemaVersion: 2,
    settings: { monthlyBudget: 190000, theme: 'system' },
    categories: [
      { id: 'courses', name: 'Courses', color: 'vert', monthlyBudget: 50000, createdAt: '2026-08-01' },
      { id: 'restos', name: 'Restaurants', color: 'mauve', monthlyBudget: 30000, createdAt: '2026-09-10' },
    ],
    fixedSubcategories: [
      { id: 'epargne', name: 'Épargne' },
      { id: 'factures', name: 'Factures' },
      { id: 'distractions', name: 'Distractions' },
    ],
    fixedExpenses: [
      { id: 'livret', label: 'Livret A', amount: 30000, dayOfMonth: 5, subcategoryId: 'epargne' },
      { id: 'sfr', label: 'SFR', amount: 899, dayOfMonth: 12, subcategoryId: 'factures' },
      { id: 'edf', label: 'EDF', amount: 5400, dayOfMonth: 31, subcategoryId: 'factures' },
    ],
    expenses: [
      { id: 'e1', amount: 2478, label: 'Carrefour', categoryId: 'courses', date: '2026-10-04', detail: 'Carte bancaire' },
      { id: 'e2', amount: 180, label: 'Monster', categoryId: 'courses', date: '2026-10-04' },
      { id: 'e3', amount: 1890, label: 'Kokomo', categoryId: 'restos', date: '2026-10-02' },
      { id: 'e4', amount: 1000, label: 'Tournois', categoryId: null, date: '2026-10-01' },
      { id: 'e5', amount: 47000, label: 'Carrefour', categoryId: 'courses', date: '2026-09-15' },
      { id: 'e6', amount: 45500, label: 'Big Mamma', categoryId: 'restos', date: '2026-09-20' },
      { id: 'e7', amount: 12000, label: 'Lidl', categoryId: 'courses', date: '2026-08-10' },
    ],
  };
}
