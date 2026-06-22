import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  parseISO,
  isWithinInterval,
  isSameDay,
} from 'date-fns';

export const formatDate = (date, pattern = 'dd.MM.yyyy') => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, pattern);
};

export const todayISO = () => format(new Date(), 'yyyy-MM-dd');

export const getWeekRange = (date = new Date()) => ({
  start: format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
  end: format(endOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
});

export const getMonthRange = (date = new Date()) => ({
  start: format(startOfMonth(date), 'yyyy-MM-dd'),
  end: format(endOfMonth(date), 'yyyy-MM-dd'),
});

export const isDateInRange = (dateStr, start, end) => {
  const d = parseISO(dateStr);
  return isWithinInterval(d, { start: parseISO(start), end: parseISO(end) });
};

export const isToday = (dateStr) => isSameDay(parseISO(dateStr), new Date());

export const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
