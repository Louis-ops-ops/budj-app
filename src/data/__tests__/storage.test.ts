import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadInitialData, parseStoredData, STORAGE_KEY } from '../storage';
import { readV1Data } from '../v1Source';
import { makeData, TODAY } from './fixtures';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('../v1Source', () => ({ readV1Data: jest.fn() }));

const mockedReadV1 = readV1Data as jest.MockedFunction<typeof readV1Data>;

beforeEach(async () => {
  await AsyncStorage.clear();
  mockedReadV1.mockReset();
  mockedReadV1.mockResolvedValue(null);
});

describe('parseStoredData', () => {
  it('relit des données valides à l’identique', () => {
    expect(parseStoredData(JSON.stringify(makeData()), TODAY)).toEqual(makeData());
  });

  it('refuse un JSON illisible ou d’une autre version', () => {
    expect(parseStoredData('{oups', TODAY)).toBeNull();
    expect(parseStoredData(JSON.stringify({ ...makeData(), schemaVersion: 1 }), TODAY)).toBeNull();
  });

  it('écarte les entrées abîmées et corrige les valeurs hors limites', () => {
    const broken = {
      ...makeData(),
      settings: { monthlyBudget: 1900.5, theme: 'violet' },
      categories: [{ id: 'x', name: 'Sans couleur', color: 'violet', monthlyBudget: -5, createdAt: 'hier' }],
      expenses: [
        { id: 'ok', amount: 100, label: 'A', categoryId: 'disparue', date: '2026-10-01' },
        { id: 'ko', amount: 100, label: 'B', categoryId: null, date: '2026-13-01' },
      ],
    };
    const parsed = parseStoredData(JSON.stringify(broken), TODAY);
    expect(parsed?.settings).toEqual({ monthlyBudget: 1901, theme: 'system' });
    expect(parsed?.categories).toEqual([{ id: 'x', name: 'Sans couleur', color: 'vert', monthlyBudget: 0, createdAt: TODAY }]);
    expect(parsed?.expenses).toEqual([{ id: 'ok', amount: 100, label: 'A', categoryId: null, date: '2026-10-01' }]);
  });
});

describe('loadInitialData', () => {
  it('reprend les données déjà enregistrées', async () => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(makeData()));
    const result = await loadInitialData(TODAY);
    expect(result.source).toBe('stored');
    expect(result.data.expenses).toHaveLength(7);
    expect(mockedReadV1).not.toHaveBeenCalled();
  });

  it('migre la v1 quand rien n’est encore enregistré, sans toucher à la base v1', async () => {
    mockedReadV1.mockResolvedValue({
      budgetDefini: 1500,
      categories: [{ id: 'c', name: 'Courses', budget: 400, color_fond: '#F2FFF1', color_texte: '#116D09' }],
      fixedSubCategories: [],
      fixedExpenses: [],
      expenses: [{ id: 'e', category_id: 'c', label: 'Lidl', amount: 12.5, date: '2026-10-02', payment_method: 'Espèces' }],
    });
    const result = await loadInitialData(TODAY);
    expect(result.source).toBe('migrated');
    expect(result.data.settings.monthlyBudget).toBe(150000);
    const saved = JSON.parse((await AsyncStorage.getItem(STORAGE_KEY)) ?? 'null');
    expect(saved.expenses[0]).toEqual(expect.objectContaining({ id: 'e', amount: 1250, detail: 'Espèces' }));
  });

  it('crée la démo sans données v1', async () => {
    const result = await loadInitialData(TODAY);
    expect(result.source).toBe('demo');
    expect(result.data.categories.length).toBeGreaterThan(0);
    expect(await AsyncStorage.getItem(STORAGE_KEY)).not.toBeNull();
  });

  it('met de côté des données illisibles avant de les remplacer', async () => {
    await AsyncStorage.setItem(STORAGE_KEY, '{abîmé');
    const result = await loadInitialData(TODAY);
    expect(result.source).toBe('demo');
    const keys = await AsyncStorage.getAllKeys();
    const backup = keys.find((key) => key.startsWith(`${STORAGE_KEY}:illisible:`));
    expect(backup).toBeDefined();
    expect(await AsyncStorage.getItem(backup as string)).toBe('{abîmé');
  });
});
