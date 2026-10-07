import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import type { V1Data } from './migration';

/** Nom de la base SQLite de la v1 (voir l'historique git de src/data/db.ts). */
const V1_DATABASE = 'budj-v2.db';

type Row = Record<string, unknown>;

/**
 * Lit les données de la v1 sans rien modifier : la base reste intacte, on
 * peut toujours revenir en arrière. Renvoie null si la v1 n'a jamais tourné.
 */
export async function readV1Data(): Promise<V1Data | null> {
  // Sur le web, la v1 n'avait pas de base persistante exploitable.
  if (Platform.OS === 'web') return null;

  const db = await SQLite.openDatabaseAsync(V1_DATABASE);
  try {
    const tables = await db.getAllAsync<{ name: string }>("SELECT name FROM sqlite_master WHERE type = 'table'");
    const names = new Set(tables.map((table) => table.name));
    if (!['settings', 'categories', 'fixed_sub_categories', 'fixed_expenses', 'expenses'].every((name) => names.has(name))) {
      return null;
    }

    const budget = await db.getFirstAsync<{ value: string }>("SELECT value FROM settings WHERE key = 'budgetDefini'");
    const categories = await db.getAllAsync<Row>('SELECT * FROM categories');
    const subcategories = await db.getAllAsync<Row>('SELECT * FROM fixed_sub_categories');
    const fixedExpenses = await db.getAllAsync<Row>('SELECT * FROM fixed_expenses');
    const expenses = await db.getAllAsync<Row>('SELECT * FROM expenses');

    return {
      budgetDefini: Number(budget?.value ?? 0) || 0,
      categories: categories.map((row) => ({
        id: String(row.id),
        name: String(row.name ?? ''),
        budget: Number(row.budget ?? 0),
        color_fond: String(row.color_fond ?? ''),
        color_texte: String(row.color_texte ?? ''),
      })),
      fixedSubCategories: subcategories.map((row) => ({
        id: String(row.id),
        name: String(row.name ?? ''),
        budget: Number(row.budget ?? 0),
      })),
      fixedExpenses: fixedExpenses.map((row) => ({
        id: String(row.id),
        sub_category_id: String(row.sub_category_id ?? ''),
        label: String(row.label ?? ''),
        amount: Number(row.amount ?? 0),
        day_of_month: Number(row.day_of_month ?? 1),
      })),
      expenses: expenses.map((row) => ({
        id: String(row.id),
        category_id: String(row.category_id ?? ''),
        label: String(row.label ?? ''),
        amount: Number(row.amount ?? 0),
        date: String(row.date ?? ''),
        payment_method: row.payment_method == null ? null : String(row.payment_method),
      })),
    };
  } finally {
    await db.closeAsync();
  }
}
