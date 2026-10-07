import {
  addDays,
  addMonths,
  daysInMonth,
  effectiveDayOfMonth,
  firstWeekdayOfMonth,
  isValidDay,
  monthsBetween,
  toDay,
} from '../dates';
import { dayLabel, monthShortName, monthYearTitle, relativeDayLabel } from '../../utils/dateLabels';

describe('dates', () => {
  it('formate un jour local, pas en UTC', () => {
    expect(toDay(new Date(2026, 9, 7, 0, 30))).toBe('2026-10-07');
    expect(toDay(new Date(2026, 0, 1, 23, 59))).toBe('2026-01-01');
  });

  it('ajoute des mois et des jours en changeant d’année', () => {
    expect(addMonths('2026-01', -1)).toBe('2025-12');
    expect(addMonths('2026-11', 3)).toBe('2027-02');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('connaît la longueur des mois et le jour de la semaine du 1er', () => {
    expect(daysInMonth('2026-02')).toBe(28);
    expect(daysInMonth('2028-02')).toBe(29);
    expect(firstWeekdayOfMonth('2026-10')).toBe(3); // jeudi
    expect(firstWeekdayOfMonth('2026-06')).toBe(0); // lundi
  });

  it('ramène un prélèvement au dernier jour d’un mois court', () => {
    expect(effectiveDayOfMonth(31, '2026-04')).toBe(30);
    expect(effectiveDayOfMonth(30, '2026-02')).toBe(28);
    expect(effectiveDayOfMonth(12, '2026-02')).toBe(12);
  });

  it('liste les mois entre deux bornes', () => {
    expect(monthsBetween('2026-11', '2027-01')).toEqual(['2026-11', '2026-12', '2027-01']);
    expect(monthsBetween('2026-05', '2026-04')).toEqual([]);
  });

  it('valide le format des jours', () => {
    expect(isValidDay('2026-02-28')).toBe(true);
    expect(isValidDay('2026-02-30')).toBe(false);
    expect(isValidDay('2026-2-3')).toBe(false);
  });

  it('écrit les dates en français', () => {
    expect(dayLabel('2026-08-04', '2026-10-07')).toBe('4 août');
    expect(dayLabel('2025-08-04', '2026-10-07')).toBe('4 août 2025');
    expect(relativeDayLabel('2026-10-07', '2026-10-07')).toBe("Aujourd'hui");
    expect(relativeDayLabel('2026-10-06', '2026-10-07')).toBe('Hier');
    expect(monthYearTitle('2026-07')).toBe('Juillet 2026');
    expect(monthShortName('2026-02')).toBe('Févr');
  });
});
