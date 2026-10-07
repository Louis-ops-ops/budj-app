/**
 * Persistance locale : une seule clé AsyncStorage contenant tout le modèle
 * v2 en JSON. Au premier lancement, les données viennent soit de la v1
 * (migrées, la base v1 reste intacte), soit de la démo.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CATEGORY_COLORS } from '../theme/colors';
import { isValidDay, type Day } from './dates';
import { createDemoData } from './demo';
import { createId } from './ids';
import { hasV1Content, migrateV1 } from './migration';
import { ensureDefaultSubcategories } from './mutations';
import type { BudjData, Category, CategoryColor, Expense, FixedExpense, FixedSubcategory, ThemePreference } from './types';
import { readV1Data } from './v1Source';

export const STORAGE_KEY = 'budj:data:v2';

type Unknown = Record<string, unknown>;

const isRecord = (value: unknown): value is Unknown => typeof value === 'object' && value !== null;
const toCents = (value: unknown): number => (typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0);
const toText = (value: unknown): string => (typeof value === 'string' ? value : '');
const THEMES: ThemePreference[] = ['system', 'light', 'dark'];

/**
 * Lit le JSON stocké en écartant ce qui serait abîmé (entrées sans id,
 * dates invalides…) plutôt que de tout perdre. null si inexploitable.
 * `today` remplace une date de création de catégorie illisible.
 */
export function parseStoredData(raw: string, today: Day): BudjData | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isRecord(parsed) || parsed.schemaVersion !== 2) return null;

  const settings = isRecord(parsed.settings) ? parsed.settings : {};
  const list = (value: unknown): Unknown[] => (Array.isArray(value) ? value.filter(isRecord) : []);

  const categories: Category[] = list(parsed.categories)
    .filter((c) => typeof c.id === 'string' && toText(c.name).trim() !== '')
    .map((c) => ({
      id: c.id as string,
      name: toText(c.name),
      color: CATEGORY_COLORS.includes(c.color as CategoryColor) ? (c.color as CategoryColor) : CATEGORY_COLORS[0],
      monthlyBudget: toCents(c.monthlyBudget),
      createdAt: isValidDay(toText(c.createdAt)) ? toText(c.createdAt) : today,
    }));

  const fixedSubcategories: FixedSubcategory[] = list(parsed.fixedSubcategories)
    .filter((s) => typeof s.id === 'string')
    .map((s) => ({ id: s.id as string, name: toText(s.name) }));

  const fixedExpenses: FixedExpense[] = list(parsed.fixedExpenses)
    .filter((f) => typeof f.id === 'string' && typeof f.subcategoryId === 'string')
    .map((f) => ({
      id: f.id as string,
      label: toText(f.label),
      amount: toCents(f.amount),
      dayOfMonth: Math.min(31, Math.max(1, Math.round(Number(f.dayOfMonth)) || 1)),
      subcategoryId: f.subcategoryId as string,
      ...(typeof f.logo === 'string' ? { logo: f.logo } : {}),
    }));

  const categoryIds = new Set(categories.map((c) => c.id));
  const expenses: Expense[] = list(parsed.expenses)
    .filter((e) => typeof e.id === 'string' && isValidDay(toText(e.date)))
    .map((e) => ({
      id: e.id as string,
      amount: toCents(e.amount),
      label: toText(e.label),
      categoryId: typeof e.categoryId === 'string' && categoryIds.has(e.categoryId) ? e.categoryId : null,
      date: toText(e.date),
      ...(typeof e.detail === 'string' ? { detail: e.detail } : {}),
    }));

  return {
    schemaVersion: 2,
    settings: {
      monthlyBudget: toCents(settings.monthlyBudget),
      theme: THEMES.includes(settings.theme as ThemePreference) ? (settings.theme as ThemePreference) : 'system',
    },
    categories,
    fixedSubcategories,
    fixedExpenses,
    expenses,
  };
}

export async function writeStoredData(data: BudjData): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export type DataSource = 'stored' | 'migrated' | 'demo';

/**
 * Données au démarrage : celles déjà enregistrées, sinon la v1 migrée, sinon
 * la démo. Un JSON illisible est mis de côté sous une autre clé avant d'être
 * remplacé, pour ne jamais effacer de données sans copie.
 */
export async function loadInitialData(today: Day): Promise<{ data: BudjData; source: DataSource }> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const stored = parseStoredData(raw, today);
      if (stored) return { data: ensureDefaultSubcategories(stored, createId), source: 'stored' };
      await AsyncStorage.setItem(`${STORAGE_KEY}:illisible:${Date.now()}`, raw);
    }
  } catch (error) {
    console.warn('Budj : lecture des données impossible', error);
  }

  try {
    const v1 = await readV1Data();
    if (v1 && hasV1Content(v1)) {
      const data = migrateV1(v1, today);
      await writeStoredData(data);
      return { data, source: 'migrated' };
    }
  } catch (error) {
    console.warn('Budj : migration des données v1 impossible', error);
  }

  const data = createDemoData(today);
  await writeStoredData(data).catch((error) => console.warn('Budj : enregistrement impossible', error));
  return { data, source: 'demo' };
}
