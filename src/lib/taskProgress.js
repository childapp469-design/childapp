/**
 * Uşaq üçün gündəlik tapşırıq irəliləyişini hesablayır
 */
export function getDailyTaskProgress(childId, taskList, completions, displayDate) {
  const total = taskList.length;
  if (total === 0) {
    return { total: 0, completed: 0, remaining: 0, percent: 0, state: 'none' };
  }

  const completed = taskList.filter((task) =>
    completions.some(
      (c) =>
        c.child_id === childId && c.task_id === task.id && c.completed_date === displayDate
    )
  ).length;

  const remaining = total - completed;
  const percent = Math.round((completed / total) * 100);

  let state = 'none';
  if (remaining === 0) {
    state = 'finished';
  } else if (remaining === 1 || percent >= 75) {
    state = 'near';
  }

  return { total, completed, remaining, percent, state };
}
