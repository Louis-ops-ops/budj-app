import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { SQLiteDatabase } from 'expo-sqlite';
import { BudjState, Category, Expense, FixedExpense, FixedSubCategory, NON_CATEGORISE_ID, PaymentMethod } from './types';
import { seedState } from './seed';
import * as db from './db';

function makeId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.round(Math.random() * 1e5)}`;
}

// Doit rester synchronisé avec NON_CATEGORISE_COLOR dans db.ts (la ligne
// existe en base avec ces mêmes valeurs — voir ensureNonCategoriseRow).
const NON_CATEGORISE_COLOR = { fond: '#EDEDED', texte: '#6B6B6B' };

type BudjActions = {
  updateBudgetDefini: (budget: number) => void;
  addExpense: (input: {
    categoryId: string;
    label: string;
    amount: number;
    date?: string;
    paymentMethod: PaymentMethod;
  }) => void;
  moveExpense: (expenseId: string, toCategoryId: string) => void;
  deleteExpense: (expenseId: string) => void;
  addCategory: (input: { name: string; budget: number; color: Category['color'] }) => void;
  deleteCategory: (categoryId: string) => void;
  updateCategoryBudget: (categoryId: string, budget: number) => void;

  addFixedSubCategory: (input: { name: string; budget: number }) => void;
  deleteFixedSubCategory: (subCategoryId: string) => void;
  updateFixedSubCategory: (subCategoryId: string, patch: { name?: string; budget?: number }) => void;
  /**
   * `subCategoryId` pour rattacher à une sous-catégorie existante, ou
   * `newSubCategory` pour en créer une à la volée dans la même mise à jour
   * (évite une course entre la création et la liaison de l'id généré).
   */
  addFixedExpense: (input: {
    subCategoryId?: string;
    newSubCategory?: { name: string; budget: number };
    label: string;
    amount: number;
    dayOfMonth: number;
  }) => void;
  deleteFixedExpense: (fixedExpenseId: string) => void;
};

type Derived = {
  /** Budget "Dépenses fixes" — calculé automatiquement, somme des budgets de chaque sous-catégorie */
  fixedBudgetTotal: number;
  /** Total réellement dépensé en dépenses fixes (toutes sous-catégories confondues) */
  fixedSpentTotal: number;
  /** Total dépensé (dépenses fixes + dépenses variables) sur le mois en cours */
  totalDepense: number;
  /** Montant restant = budget défini - total dépensé */
  montantRestant: number;
  /**
   * `state.categories` + la catégorie fantôme "Non catégorisé" (grise),
   * mais seulement si elle contient au moins une dépense — jamais proposée
   * ailleurs (création, sélecteur "Déplacer vers ?"...), qui doivent
   * continuer à utiliser `state.categories` directement.
   */
  displayCategories: Category[];
  /** Dépenses (variables) d'une catégorie, triées de la plus récente à la plus ancienne */
  expensesForCategory: (categoryId: string) => Expense[];
  /** Total dépensé pour une catégorie "normale" */
  spentForCategory: (categoryId: string) => number;
  /** Dépenses fixes d'une sous-catégorie */
  fixedExpensesForSubCategory: (subCategoryId: string) => FixedExpense[];
  /** Total dépensé pour une sous-catégorie de dépenses fixes */
  spentForFixedSubCategory: (subCategoryId: string) => number;
};

type BudjContextValue = {
  state: BudjState;
  isLoaded: boolean;
} & Derived &
  BudjActions;

const BudjContext = createContext<BudjContextValue | null>(null);

/**
 * Toutes les données (catégories, sous-catégories de dépenses fixes,
 * dépenses fixes, dépenses) vivent dans une vraie base SQLite locale à
 * l'application — voir ./db.ts. Chaque action met à jour l'état React
 * immédiatement (retour visuel instantané) ET écrit dans SQLite en tâche de
 * fond ; si l'écriture échoue, l'état en mémoire reste correct pour la
 * session en cours mais ne sera pas persisté — voir le commentaire sur
 * `persist` ci-dessous.
 */
export function BudjProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BudjState>(seedState);
  const [isLoaded, setIsLoaded] = useState(false);
  const dbRef = useRef<SQLiteDatabase | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const database = await db.getDb();
        dbRef.current = database;
        setState(await db.loadState(database));
      } catch (err) {
        // Base indisponible : on reste sur les données de démo pour la session,
        // mais rien ne sera persisté tant que la base n'est pas accessible.
        console.warn('BudjProvider: échec de chargement de la base locale', err);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  /** Exécute une écriture SQLite si la base est prête ; log une erreur sinon (ne bloque jamais l'UI). */
  function persist(write: (database: SQLiteDatabase) => Promise<void>) {
    const database = dbRef.current;
    if (!database) return;
    write(database).catch((err) => console.warn('BudjProvider: échec d\'écriture locale', err));
  }

  const actions: BudjActions = useMemo(
    () => ({
      updateBudgetDefini: (budget) => {
        setState((s) => ({ ...s, budgetDefini: budget }));
        persist((database) => db.updateBudgetDefiniRow(database, budget));
      },
      addExpense: ({ categoryId, label, amount, date, paymentMethod }) => {
        const expense: Expense = {
          id: makeId('ex'),
          categoryId,
          label,
          amount,
          date: date ?? new Date().toISOString().slice(0, 10),
          paymentMethod,
        };
        setState((s) => ({ ...s, expenses: [expense, ...s.expenses] }));
        persist((database) => db.insertExpense(database, expense));
      },
      moveExpense: (expenseId, toCategoryId) => {
        setState((s) => ({
          ...s,
          expenses: s.expenses.map((e) => (e.id === expenseId ? { ...e, categoryId: toCategoryId } : e)),
        }));
        persist((database) => db.updateExpenseCategory(database, expenseId, toCategoryId));
      },
      deleteExpense: (expenseId) => {
        setState((s) => ({ ...s, expenses: s.expenses.filter((e) => e.id !== expenseId) }));
        persist((database) => db.deleteExpenseRow(database, expenseId));
      },
      addCategory: ({ name, budget, color }) => {
        const category: Category = { id: makeId('cat'), name, budget, color };
        setState((s) => ({ ...s, categories: [...s.categories, category] }));
        persist((database) => db.insertCategory(database, category));
      },
      deleteCategory: (categoryId) => {
        setState((s) => ({
          ...s,
          categories: s.categories.filter((c) => c.id !== categoryId),
          // Ses dépenses ne sont pas perdues : elles basculent dans la
          // catégorie fantôme "Non catégorisé" (voir displayCategories),
          // le temps que l'utilisateur les range ailleurs.
          expenses: s.expenses.map((e) => (e.categoryId === categoryId ? { ...e, categoryId: NON_CATEGORISE_ID } : e)),
        }));
        persist((database) => db.deleteCategoryRow(database, categoryId));
      },
      updateCategoryBudget: (categoryId, budget) => {
        setState((s) => ({
          ...s,
          categories: s.categories.map((c) => (c.id === categoryId ? { ...c, budget } : c)),
        }));
        persist((database) => db.updateCategoryBudgetRow(database, categoryId, budget));
      },

      addFixedSubCategory: ({ name, budget }) => {
        const subCategory: FixedSubCategory = { id: makeId('fsc'), name, budget };
        setState((s) => ({ ...s, fixedSubCategories: [...s.fixedSubCategories, subCategory] }));
        persist((database) => db.insertFixedSubCategory(database, subCategory));
      },
      deleteFixedSubCategory: (subCategoryId) => {
        setState((s) => ({
          ...s,
          fixedSubCategories: s.fixedSubCategories.filter((c) => c.id !== subCategoryId),
          fixedExpenses: s.fixedExpenses.filter((f) => f.subCategoryId !== subCategoryId),
        }));
        persist((database) => db.deleteFixedSubCategoryRow(database, subCategoryId));
      },
      updateFixedSubCategory: (subCategoryId, patch) => {
        setState((s) => ({
          ...s,
          fixedSubCategories: s.fixedSubCategories.map((c) =>
            c.id === subCategoryId ? { ...c, ...patch } : c
          ),
        }));
        persist((database) => db.updateFixedSubCategoryRow(database, subCategoryId, patch));
      },
      addFixedExpense: ({ subCategoryId, newSubCategory, label, amount, dayOfMonth }) => {
        const resolvedSubCategoryId = subCategoryId ?? makeId('fsc');
        const fixedExpense: FixedExpense = {
          id: makeId('fx'),
          subCategoryId: resolvedSubCategoryId,
          label,
          amount,
          dayOfMonth,
        };
        const createdSubCategory: FixedSubCategory | null =
          !subCategoryId && newSubCategory ? { id: resolvedSubCategoryId, ...newSubCategory } : null;

        if (!subCategoryId && !newSubCategory) return;

        setState((s) => ({
          ...s,
          fixedSubCategories: createdSubCategory ? [...s.fixedSubCategories, createdSubCategory] : s.fixedSubCategories,
          fixedExpenses: [...s.fixedExpenses, fixedExpense],
        }));
        persist(async (database) => {
          await database.withTransactionAsync(async () => {
            if (createdSubCategory) await db.insertFixedSubCategory(database, createdSubCategory);
            await db.insertFixedExpense(database, fixedExpense);
          });
        });
      },
      deleteFixedExpense: (fixedExpenseId) => {
        setState((s) => ({ ...s, fixedExpenses: s.fixedExpenses.filter((f) => f.id !== fixedExpenseId) }));
        persist((database) => db.deleteFixedExpenseRow(database, fixedExpenseId));
      },
    }),
    []
  );

  const derived: Derived = useMemo(() => {
    const fixedBudgetTotal = state.fixedSubCategories.reduce((sum, c) => sum + c.budget, 0);
    const fixedSpentTotal = state.fixedExpenses.reduce((sum, f) => sum + f.amount, 0);
    const totalVariable = state.expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalDepense = fixedSpentTotal + totalVariable;

    const hasNonCategorise = state.expenses.some((e) => e.categoryId === NON_CATEGORISE_ID);
    const displayCategories = hasNonCategorise
      ? [
          ...state.categories,
          { id: NON_CATEGORISE_ID, name: 'Non catégorisé', budget: 0, color: NON_CATEGORISE_COLOR },
        ]
      : state.categories;

    return {
      fixedBudgetTotal,
      fixedSpentTotal,
      totalDepense,
      montantRestant: state.budgetDefini - totalDepense,
      displayCategories,
      expensesForCategory: (categoryId) =>
        state.expenses.filter((e) => e.categoryId === categoryId).sort((a, b) => (a.date < b.date ? 1 : -1)),
      spentForCategory: (categoryId) =>
        state.expenses.filter((e) => e.categoryId === categoryId).reduce((sum, e) => sum + e.amount, 0),
      fixedExpensesForSubCategory: (subCategoryId) =>
        state.fixedExpenses.filter((f) => f.subCategoryId === subCategoryId),
      spentForFixedSubCategory: (subCategoryId) =>
        state.fixedExpenses
          .filter((f) => f.subCategoryId === subCategoryId)
          .reduce((sum, f) => sum + f.amount, 0),
    };
  }, [state]);

  const value: BudjContextValue = { state, isLoaded, ...derived, ...actions };

  return <BudjContext.Provider value={value}>{children}</BudjContext.Provider>;
}

export function useBudj() {
  const ctx = useContext(BudjContext);
  if (!ctx) throw new Error('useBudj doit être utilisé à l\'intérieur de <BudjProvider>');
  return ctx;
}
