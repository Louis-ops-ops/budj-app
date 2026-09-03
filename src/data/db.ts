import * as SQLite from 'expo-sqlite';
import { BudjState, Category, CategoryColor, Expense, FixedExpense, FixedSubCategory, NON_CATEGORISE_ID } from './types';
import { seedState } from './seed';

// v2 : les données de démo (Courses, Carrefour, Netflix...) ont été
// retirées du seed — nouveau nom de fichier pour repartir d'une base vide
// plutôt que de garder les anciennes données de test qui traînaient.
const DATABASE_NAME = 'budj-v2.db';

const NON_CATEGORISE_COLOR = { fond: '#EDEDED', texte: '#6B6B6B' };

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/**
 * Base SQLite locale (fichier `budj.db` dans le stockage privé de
 * l'application — voir expo-sqlite). Remplace l'ancien stockage
 * AsyncStorage/localStorage : toutes les données (catégories, dépenses
 * fixes, dépenses) vivent ici, dans un vrai schéma relationnel, directement
 * dans l'app (aucun cache navigateur, aucun service externe).
 */
export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = openAndInit();
  }
  return dbPromise;
}

async function openAndInit(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  // PRAGMA foreign_keys est propre à chaque connexion, à réactiver ici.
  await db.execAsync('PRAGMA foreign_keys = ON;');
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      budget REAL NOT NULL,
      color_fond TEXT NOT NULL,
      color_texte TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS fixed_sub_categories (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      budget REAL NOT NULL
    );
    CREATE TABLE IF NOT EXISTS fixed_expenses (
      id TEXT PRIMARY KEY NOT NULL,
      sub_category_id TEXT NOT NULL REFERENCES fixed_sub_categories(id) ON DELETE CASCADE,
      label TEXT NOT NULL,
      amount REAL NOT NULL,
      day_of_month INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY NOT NULL,
      category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      label TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      payment_method TEXT NOT NULL DEFAULT 'Carte bancaire'
    );
  `);
  await migrate(db);
  await seedIfEmpty(db);
  await ensureNonCategoriseRow(db);
  return db;
}

/**
 * La catégorie fantôme "Non catégorisé" doit exister comme vraie ligne en
 * base (les dépenses pointent vers elle via une clé étrangère), mais ne
 * doit JAMAIS apparaître dans `state.categories` — `loadState` la filtre
 * explicitement. Elle n'est donc visible dans l'app que via
 * `displayCategories` (BudjContext), et seulement quand elle contient
 * effectivement des dépenses.
 */
async function ensureNonCategoriseRow(db: SQLite.SQLiteDatabase) {
  await db.runAsync(
    'INSERT OR IGNORE INTO categories (id, name, budget, color_fond, color_texte) VALUES (?, ?, ?, ?, ?)',
    [NON_CATEGORISE_ID, 'Non catégorisé', 0, NON_CATEGORISE_COLOR.fond, NON_CATEGORISE_COLOR.texte]
  );
}

/**
 * Migrations légères pour les colonnes ajoutées après la création initiale
 * du schéma — `CREATE TABLE IF NOT EXISTS` ne modifie pas une table déjà
 * existante, donc sans ça une base créée avant l'ajout de `payment_method`
 * ferait échouer silencieusement chaque nouvelle dépense (colonne absente).
 * On ne supprime jamais rien ici : les données existantes sont préservées.
 */
async function migrate(db: SQLite.SQLiteDatabase) {
  const expenseColumns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(expenses)');
  const hasPaymentMethod = expenseColumns.some((c) => c.name === 'payment_method');
  if (!hasPaymentMethod) {
    await db.execAsync("ALTER TABLE expenses ADD COLUMN payment_method TEXT NOT NULL DEFAULT 'Carte bancaire';");
  }
}

async function seedIfEmpty(db: SQLite.SQLiteDatabase) {
  const existing = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM settings WHERE key = 'budgetDefini'"
  );
  if (existing) return;

  await db.withTransactionAsync(async () => {
    await db.runAsync('INSERT INTO settings (key, value) VALUES (?, ?)', [
      'budgetDefini',
      String(seedState.budgetDefini),
    ]);
    for (const c of seedState.categories) {
      await db.runAsync(
        'INSERT INTO categories (id, name, budget, color_fond, color_texte) VALUES (?, ?, ?, ?, ?)',
        [c.id, c.name, c.budget, c.color.fond, c.color.texte]
      );
    }
    for (const sc of seedState.fixedSubCategories) {
      await db.runAsync('INSERT INTO fixed_sub_categories (id, name, budget) VALUES (?, ?, ?)', [
        sc.id,
        sc.name,
        sc.budget,
      ]);
    }
    for (const f of seedState.fixedExpenses) {
      await db.runAsync(
        'INSERT INTO fixed_expenses (id, sub_category_id, label, amount, day_of_month) VALUES (?, ?, ?, ?, ?)',
        [f.id, f.subCategoryId, f.label, f.amount, f.dayOfMonth]
      );
    }
    for (const e of seedState.expenses) {
      await db.runAsync(
        'INSERT INTO expenses (id, category_id, label, amount, date, payment_method) VALUES (?, ?, ?, ?, ?, ?)',
        [e.id, e.categoryId, e.label, e.amount, e.date, e.paymentMethod]
      );
    }
  });
}

type CategoryRow = { id: string; name: string; budget: number; color_fond: string; color_texte: string };
type FixedSubCategoryRow = { id: string; name: string; budget: number };
type FixedExpenseRow = { id: string; sub_category_id: string; label: string; amount: number; day_of_month: number };
type ExpenseRow = {
  id: string;
  category_id: string;
  label: string;
  amount: number;
  date: string;
  payment_method: string;
};

export async function loadState(db: SQLite.SQLiteDatabase): Promise<BudjState> {
  const budgetRow = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM settings WHERE key = 'budgetDefini'"
  );
  const categoryRows = await db.getAllAsync<CategoryRow>('SELECT * FROM categories');
  const fixedSubCategoryRows = await db.getAllAsync<FixedSubCategoryRow>('SELECT * FROM fixed_sub_categories');
  const fixedExpenseRows = await db.getAllAsync<FixedExpenseRow>('SELECT * FROM fixed_expenses');
  const expenseRows = await db.getAllAsync<ExpenseRow>('SELECT * FROM expenses ORDER BY date DESC');

  return {
    budgetDefini: budgetRow ? Number(budgetRow.value) : seedState.budgetDefini,
    // "Non catégorisé" existe en base (contrainte de clé étrangère) mais ne
    // doit jamais apparaître comme une vraie catégorie de l'app.
    categories: categoryRows
      .filter((r) => r.id !== NON_CATEGORISE_ID)
      .map(
        (r): Category => ({
          id: r.id,
          name: r.name,
          budget: r.budget,
          color: { fond: r.color_fond, texte: r.color_texte },
        })
      ),
    fixedSubCategories: fixedSubCategoryRows.map(
      (r): FixedSubCategory => ({ id: r.id, name: r.name, budget: r.budget })
    ),
    fixedExpenses: fixedExpenseRows.map(
      (r): FixedExpense => ({
        id: r.id,
        subCategoryId: r.sub_category_id,
        label: r.label,
        amount: r.amount,
        dayOfMonth: r.day_of_month,
      })
    ),
    expenses: expenseRows.map(
      (r): Expense => ({
        id: r.id,
        categoryId: r.category_id,
        label: r.label,
        amount: r.amount,
        date: r.date,
        paymentMethod: r.payment_method as Expense['paymentMethod'],
      })
    ),
  };
}

// --- Écritures (une requête ciblée par action, plutôt qu'un dump JSON complet) ---

export async function updateBudgetDefiniRow(db: SQLite.SQLiteDatabase, budget: number) {
  await db.runAsync('UPDATE settings SET value = ? WHERE key = ?', [String(budget), 'budgetDefini']);
}

export async function insertExpense(db: SQLite.SQLiteDatabase, e: Expense) {
  await db.runAsync(
    'INSERT INTO expenses (id, category_id, label, amount, date, payment_method) VALUES (?, ?, ?, ?, ?, ?)',
    [e.id, e.categoryId, e.label, e.amount, e.date, e.paymentMethod]
  );
}

export async function updateExpenseCategory(db: SQLite.SQLiteDatabase, expenseId: string, categoryId: string) {
  await db.runAsync('UPDATE expenses SET category_id = ? WHERE id = ?', [categoryId, expenseId]);
}

export async function deleteExpenseRow(db: SQLite.SQLiteDatabase, expenseId: string) {
  await db.runAsync('DELETE FROM expenses WHERE id = ?', [expenseId]);
}

export async function insertCategory(db: SQLite.SQLiteDatabase, c: Category) {
  await db.runAsync('INSERT INTO categories (id, name, budget, color_fond, color_texte) VALUES (?, ?, ?, ?, ?)', [
    c.id,
    c.name,
    c.budget,
    c.color.fond,
    c.color.texte,
  ]);
}

/**
 * Réattribue les dépenses de la catégorie supprimée à "Non catégorisé"
 * (plutôt que de les perdre via le ON DELETE CASCADE de la table) puis
 * supprime la catégorie, dans une même transaction.
 */
export async function deleteCategoryRow(db: SQLite.SQLiteDatabase, categoryId: string) {
  await db.withTransactionAsync(async () => {
    await db.runAsync('UPDATE expenses SET category_id = ? WHERE category_id = ?', [
      NON_CATEGORISE_ID,
      categoryId,
    ]);
    await db.runAsync('DELETE FROM categories WHERE id = ?', [categoryId]);
  });
}

export async function updateCategoryBudgetRow(db: SQLite.SQLiteDatabase, categoryId: string, budget: number) {
  await db.runAsync('UPDATE categories SET budget = ? WHERE id = ?', [budget, categoryId]);
}

export async function insertFixedSubCategory(db: SQLite.SQLiteDatabase, sc: FixedSubCategory) {
  await db.runAsync('INSERT INTO fixed_sub_categories (id, name, budget) VALUES (?, ?, ?)', [
    sc.id,
    sc.name,
    sc.budget,
  ]);
}

/** La suppression entraîne celle des dépenses fixes liées via ON DELETE CASCADE. */
export async function deleteFixedSubCategoryRow(db: SQLite.SQLiteDatabase, subCategoryId: string) {
  await db.runAsync('DELETE FROM fixed_sub_categories WHERE id = ?', [subCategoryId]);
}

export async function updateFixedSubCategoryRow(
  db: SQLite.SQLiteDatabase,
  subCategoryId: string,
  patch: { name?: string; budget?: number }
) {
  if (patch.name !== undefined) {
    await db.runAsync('UPDATE fixed_sub_categories SET name = ? WHERE id = ?', [patch.name, subCategoryId]);
  }
  if (patch.budget !== undefined) {
    await db.runAsync('UPDATE fixed_sub_categories SET budget = ? WHERE id = ?', [patch.budget, subCategoryId]);
  }
}

export async function insertFixedExpense(db: SQLite.SQLiteDatabase, f: FixedExpense) {
  await db.runAsync(
    'INSERT INTO fixed_expenses (id, sub_category_id, label, amount, day_of_month) VALUES (?, ?, ?, ?, ?)',
    [f.id, f.subCategoryId, f.label, f.amount, f.dayOfMonth]
  );
}

export async function deleteFixedExpenseRow(db: SQLite.SQLiteDatabase, fixedExpenseId: string) {
  await db.runAsync('DELETE FROM fixed_expenses WHERE id = ?', [fixedExpenseId]);
}

export type { CategoryColor };
