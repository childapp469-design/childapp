import * as XLSX from 'xlsx';
import { formatDate } from './dateUtils';

/**
 * İllik Excel faylı ixracı (məs: 2026.xlsx)
 */
export function exportYearToExcel(data, year) {
  const { children, tasks, completions, adjustments } = data;

  const dailySheet = completions
    .filter((c) => c.completed_date?.startsWith(String(year)))
    .map((c) => {
      const child = children.find((ch) => ch.id === c.child_id);
      const task = tasks.find((t) => t.id === c.task_id);
      return {
        Tarix: c.completed_date,
        Uşaq: child ? `${child.first_name} ${child.last_name || ''}`.trim() : '',
        Tapşırıq: task?.name || '',
        Bal: c.points_earned,
        Ulduz: c.stars_earned,
      };
    });

  const weeklyMap = {};
  dailySheet.forEach((row) => {
    const weekKey = getWeekKey(row.Tarix);
    const childName = row.Uşaq;
    if (!weeklyMap[weekKey]) weeklyMap[weekKey] = {};
    if (!weeklyMap[weekKey][childName]) weeklyMap[weekKey][childName] = { bal: 0, ulduz: 0 };
    weeklyMap[weekKey][childName].bal += row.Bal || 0;
    weeklyMap[weekKey][childName].ulduz += row.Ulduz || 0;
  });

  const weeklySheet = [];
  Object.entries(weeklyMap).forEach(([week, childrenData]) => {
    Object.entries(childrenData).forEach(([name, scores]) => {
      weeklySheet.push({ Həftə: week, Uşaq: name, Bal: scores.bal, Ulduz: scores.ulduz });
    });
  });

  const monthlyMap = {};
  dailySheet.forEach((row) => {
    const monthKey = row.Tarix?.substring(0, 7);
    const childName = row.Uşaq;
    if (!monthlyMap[monthKey]) monthlyMap[monthKey] = {};
    if (!monthlyMap[monthKey][childName]) monthlyMap[monthKey][childName] = { bal: 0, ulduz: 0 };
    monthlyMap[monthKey][childName].bal += row.Bal || 0;
    monthlyMap[monthKey][childName].ulduz += row.Ulduz || 0;
  });

  const monthlySheet = [];
  Object.entries(monthlyMap).forEach(([month, childrenData]) => {
    Object.entries(childrenData).forEach(([name, scores]) => {
      monthlySheet.push({ Ay: month, Uşaq: name, Bal: scores.bal, Ulduz: scores.ulduz });
    });
  });

  const adjustmentSheet = adjustments
    .filter((a) => a.adjustment_date?.startsWith(String(year)))
    .map((a) => {
      const child = children.find((ch) => ch.id === a.child_id);
      return {
        Tarix: a.adjustment_date,
        Uşaq: child ? `${child.first_name} ${child.last_name || ''}`.trim() : '',
        BalDəyişikliyi: a.points_delta,
        UlduzDəyişikliyi: a.stars_delta,
        Səbəb: a.reason || '',
      };
    });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dailySheet), 'Günlük');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(weeklySheet), 'Həftəlik');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(monthlySheet), 'Aylıq');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(adjustmentSheet), 'Düzəlişlər');

  XLSX.writeFile(wb, `${year}.xlsx`);
}

function getWeekKey(dateStr) {
  const d = new Date(dateStr);
  const start = new Date(d);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  start.setDate(diff);
  return formatDate(start, 'yyyy-MM-dd');
}

/**
 * Excel faylından oxuma
 */
export function importFromExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' });
        const daily = XLSX.utils.sheet_to_json(wb.Sheets['Günlük'] || wb.Sheets[wb.SheetNames[0]] || {});
        resolve({ daily });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
