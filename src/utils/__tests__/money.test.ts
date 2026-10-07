import {
  centsToInput,
  formatAmountInput,
  formatExpenseAmount,
  formatMoney,
  formatMoneyCompact,
  formatMoneyRounded,
  formatPercent,
  formatSignedMoney,
  formatSignedPercent,
  parseAmountInput,
  sanitizeAmountInput,
} from '../money';

/** Les espaces insécables sont rendus visibles pour les comparaisons. */
const visible = (text: string) => text.replace(/ /g, '_');

describe('formatage des montants', () => {
  it('suit le format français, sans décimales pour un montant rond', () => {
    expect(visible(formatMoney(2478))).toBe('24,78_€');
    expect(visible(formatMoney(60000))).toBe('600_€');
    expect(visible(formatMoney(2470))).toBe('24,70_€');
    expect(visible(formatMoney(190000))).toBe('1_900_€');
  });

  it('n’utilise jamais l’espace fine absente de la police Outfit', () => {
    expect(formatMoney(123456789)).not.toMatch(/ /);
  });

  it('propose une variante compacte et une variante arrondie', () => {
    expect(visible(formatMoneyCompact(60000))).toBe('600€');
    expect(visible(formatMoneyCompact(104600))).toBe('1_046€');
    expect(visible(formatMoneyRounded(85449))).toBe('854€');
    expect(visible(formatMoneyRounded(85450))).toBe('855€');
  });

  it('signe les montants et les pourcentages', () => {
    expect(formatSignedMoney(22000)).toBe('+220€');
    expect(formatSignedMoney(-14000)).toBe('−140€');
    expect(formatSignedMoney(0)).toBe('0€');
    expect(visible(formatSignedMoney(-5000, { compact: false }))).toBe('−50_€');
    expect(formatExpenseAmount(2478)).toBe('−24,78€');
    expect(formatPercent(0.554)).toBe('55%');
    expect(formatPercent(1.032)).toBe('103%');
    expect(formatSignedPercent(-0.116)).toBe('−12%');
    expect(formatSignedPercent(0.032)).toBe('+3%');
    expect(formatSignedPercent(0.001)).toBe('0%');
  });
});

describe('saisie des montants', () => {
  it('n’accepte que des chiffres, une virgule et deux décimales', () => {
    expect(sanitizeAmountInput('24.785')).toBe('24,78');
    expect(sanitizeAmountInput('1,2,3')).toBe('1,23');
    expect(sanitizeAmountInput('007')).toBe('7');
    expect(sanitizeAmountInput(',5')).toBe('0,5');
    expect(sanitizeAmountInput('12€ a')).toBe('12');
    expect(sanitizeAmountInput('24,')).toBe('24,');
  });

  it('convertit la saisie en centimes et inversement', () => {
    expect(parseAmountInput('24,78')).toBe(2478);
    expect(parseAmountInput('24,7')).toBe(2470);
    expect(parseAmountInput('24,')).toBe(2400);
    expect(parseAmountInput('')).toBe(0);
    expect(centsToInput(45000)).toBe('450');
    expect(centsToInput(2405)).toBe('24,05');
  });

  it('groupe les milliers pendant la saisie sans perdre la virgule', () => {
    expect(visible(formatAmountInput('1234,5'))).toBe('1_234,5');
    expect(visible(formatAmountInput('24,'))).toBe('24,');
  });
});
