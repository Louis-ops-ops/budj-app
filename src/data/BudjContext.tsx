import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { todayDay, type Day } from './dates';
import { createEmptyData } from './demo';
import { createId } from './ids';
import * as mutations from './mutations';
import { loadInitialData, writeStoredData } from './storage';
import type { BudjData, Category, CategoryColor, Expense, FixedExpense, FixedSubcategory, ThemePreference } from './types';

/** Délai d'écriture : plusieurs modifications rapprochées ne donnent qu'une écriture. */
const SAVE_DELAY_MS = 300;

export type NewExpense = Omit<Expense, 'id'>;
export type NewCategory = { name: string; color: CategoryColor; monthlyBudget: number };
export type NewFixedExpense = Omit<FixedExpense, 'id'>;

type BudjActions = {
  /** Ajoute une ou plusieurs dépenses d'un coup. */
  addExpenses: (expenses: NewExpense[]) => Expense[];
  moveExpenses: (ids: string[], categoryId: string | null) => void;
  deleteExpense: (id: string) => void;
  addCategory: (input: NewCategory) => Category;
  updateCategoryBudget: (id: string, monthlyBudget: number) => void;
  /** Les dépenses de la catégorie passent en « Sans catégorie ». */
  deleteCategory: (id: string) => void;
  addFixedExpense: (input: NewFixedExpense) => FixedExpense;
  updateFixedExpense: (id: string, patch: Partial<NewFixedExpense>) => void;
  deleteFixedExpense: (id: string) => void;
  /** Crée la sous-catégorie, ou renvoie celle qui porte déjà ce nom. */
  addFixedSubcategory: (name: string) => FixedSubcategory;
  setMonthlyBudget: (amount: number) => void;
  setTheme: (theme: ThemePreference) => void;
};

type BudjContextValue = BudjActions & {
  data: BudjData;
  /** `loading` tant que les données enregistrées ne sont pas lues. */
  status: 'loading' | 'ready';
  /** Jour courant, rafraîchi au retour de l'app au premier plan. */
  today: Day;
};

const BudjContext = createContext<BudjContextValue | null>(null);

export function BudjProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<BudjData>(createEmptyData);
  const [status, setStatus] = useState<'loading' | 'ready'>('loading');
  const [today, setToday] = useState<Day>(todayDay);

  // Copie toujours à jour des données, pour les actions synchrones et l'écriture différée.
  const dataRef = useRef(data);
  dataRef.current = data;
  const dirty = useRef(false);

  useEffect(() => {
    let cancelled = false;
    loadInitialData(todayDay()).then(({ data: initial }) => {
      if (cancelled) return;
      setData(initial);
      setStatus('ready');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const flush = useCallback(() => {
    if (!dirty.current) return;
    dirty.current = false;
    writeStoredData(dataRef.current).catch((error) => {
      dirty.current = true;
      console.warn('Budj : enregistrement impossible', error);
    });
  }, []);

  // Écriture différée après chaque modification.
  useEffect(() => {
    if (status !== 'ready' || !dirty.current) return;
    const timer = setTimeout(flush, SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [data, status, flush]);

  // L'app passe en arrière-plan : on écrit tout de suite (elle peut être tuée), et
  // à son retour on recale le jour courant (l'app a pu rester ouverte la nuit).
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') setToday(todayDay());
      else flush();
    });
    return () => subscription.remove();
  }, [flush]);

  const update = useCallback((transition: (current: BudjData) => BudjData) => {
    dirty.current = true;
    setData((current) => transition(current));
  }, []);

  const actions = useMemo<BudjActions>(
    () => ({
      addExpenses: (inputs) => {
        const expenses = inputs.map((input) => ({ ...input, id: createId('exp') }));
        update((current) => mutations.addExpenses(current, expenses));
        return expenses;
      },
      moveExpenses: (ids, categoryId) => update((current) => mutations.moveExpenses(current, ids, categoryId)),
      deleteExpense: (id) => update((current) => mutations.deleteExpense(current, id)),
      addCategory: (input) => {
        const category: Category = { ...input, id: createId('cat'), createdAt: todayDay() };
        update((current) => mutations.addCategory(current, category));
        return category;
      },
      updateCategoryBudget: (id, monthlyBudget) => update((current) => mutations.updateCategoryBudget(current, id, monthlyBudget)),
      deleteCategory: (id) => update((current) => mutations.deleteCategory(current, id)),
      addFixedExpense: (input) => {
        const fixed: FixedExpense = { ...input, id: createId('fix') };
        update((current) => mutations.addFixedExpense(current, fixed));
        return fixed;
      },
      updateFixedExpense: (id, patch) => update((current) => mutations.updateFixedExpense(current, id, patch)),
      deleteFixedExpense: (id) => update((current) => mutations.deleteFixedExpense(current, id)),
      addFixedSubcategory: (name) => {
        const existing = mutations.findFixedSubcategoryByName(dataRef.current, name);
        if (existing) return existing;
        const subcategory: FixedSubcategory = { id: createId('sub'), name: name.trim() };
        update((current) => mutations.addFixedSubcategory(current, subcategory));
        return subcategory;
      },
      setMonthlyBudget: (amount) => update((current) => mutations.setMonthlyBudget(current, amount)),
      setTheme: (theme) => update((current) => mutations.setTheme(current, theme)),
    }),
    [update],
  );

  const value = useMemo<BudjContextValue>(() => ({ data, status, today, ...actions }), [data, status, today, actions]);

  return <BudjContext.Provider value={value}>{children}</BudjContext.Provider>;
}

export function useBudj(): BudjContextValue {
  const context = useContext(BudjContext);
  if (!context) throw new Error('useBudj doit être utilisé dans <BudjProvider>');
  return context;
}
