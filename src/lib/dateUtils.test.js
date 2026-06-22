import {
  formatDate,
  todayISO,
  getWeekRange,
  getMonthRange,
  isDateInRange,
  isToday,
  generateId,
} from './dateUtils';

describe('dateUtils', () => {
  it('formats dates as dd.MM.yyyy', () => {
    expect(formatDate('2026-06-22')).toBe('22.06.2026');
  });

  it('returns today in ISO format', () => {
    const today = new Date();
    const expected = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    expect(todayISO()).toBe(expected);
  });

  it('checks if date is within range', () => {
    expect(isDateInRange('2026-06-15', '2026-06-01', '2026-06-30')).toBe(true);
    expect(isDateInRange('2026-07-01', '2026-06-01', '2026-06-30')).toBe(false);
  });

  it('detects today', () => {
    expect(isToday(todayISO())).toBe(true);
    expect(isToday('2020-01-01')).toBe(false);
  });

  it('returns week range starting Monday', () => {
    const range = getWeekRange(new Date('2026-06-22')); // Monday
    expect(range.start).toBe('2026-06-22');
    expect(range.end).toBe('2026-06-28');
  });

  it('returns month range', () => {
    const range = getMonthRange(new Date('2026-06-15'));
    expect(range.start).toBe('2026-06-01');
    expect(range.end).toBe('2026-06-30');
  });

  it('generates unique ids', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).toMatch(/^[0-9a-f-]{36}$/i);
    expect(id1).not.toBe(id2);
  });
});
