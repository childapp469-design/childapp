import { isDateInRange } from './dateUtils';

/**
 * Uşaq üçün müəyyən tarix aralığında ümumi bal hesablayır
 */
export function calculateScores(childId, completions, adjustments, dateRange) {
  let points = 0;
  let stars = 0;

  completions
    .filter((c) => c.child_id === childId)
    .filter((c) => !dateRange || isDateInRange(c.completed_date, dateRange.start, dateRange.end))
    .forEach((c) => {
      points += c.points_earned || 0;
      stars += c.stars_earned || 0;
    });

  adjustments
    .filter((a) => a.child_id === childId)
    .filter((a) => !dateRange || isDateInRange(a.adjustment_date, dateRange.start, dateRange.end))
    .forEach((a) => {
      points += a.points_delta || 0;
      stars += a.stars_delta || 0;
    });

  return { points, stars };
}

/**
 * Uşaq üzrə tapşırıq icra statusu
 */
export function getCompletionForTask(childId, taskId, date, completions) {
  return completions.find(
    (c) => c.child_id === childId && c.task_id === taskId && c.completed_date === date
  );
}

/**
 * Hesabat statistikaları
 */
export function getReportStats(children, completions, adjustments, dateRange) {
  const childScores = children
    .filter((c) => !c.is_archived)
    .map((child) => {
      const scores = calculateScores(child.id, completions, adjustments, dateRange);
      const taskCount = completions.filter(
        (c) =>
          c.child_id === child.id &&
          (!dateRange || isDateInRange(c.completed_date, dateRange.start, dateRange.end))
      ).length;
      return { ...child, ...scores, taskCount };
    });

  const topScorer = [...childScores].sort((a, b) => b.points - a.points)[0];
  const mostActive = [...childScores].sort((a, b) => b.taskCount - a.taskCount)[0];

  return {
    childScores,
    topScorer,
    mostActive,
    totalPoints: childScores.reduce((sum, c) => sum + c.points, 0),
    totalTasks: childScores.reduce((sum, c) => sum + c.taskCount, 0),
    avgPoints: childScores.length
      ? Math.round(childScores.reduce((sum, c) => sum + c.points, 0) / childScores.length)
      : 0,
  };
}
