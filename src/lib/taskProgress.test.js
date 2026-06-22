import { getDailyTaskProgress } from './taskProgress';

const tasks = [{ id: 't1' }, { id: 't2' }, { id: 't3' }, { id: 't4' }];

describe('getDailyTaskProgress', () => {
  it('returns none when no tasks exist', () => {
    expect(getDailyTaskProgress('c1', [], [], '2026-06-22')).toEqual({
      total: 0,
      completed: 0,
      remaining: 0,
      percent: 0,
      state: 'none',
    });
  });

  it('returns finished when all tasks done', () => {
    const completions = tasks.map((t) => ({
      child_id: 'c1',
      task_id: t.id,
      completed_date: '2026-06-22',
    }));
    expect(getDailyTaskProgress('c1', tasks, completions, '2026-06-22').state).toBe('finished');
  });

  it('returns near when one task remains', () => {
    const completions = tasks.slice(0, 3).map((t) => ({
      child_id: 'c1',
      task_id: t.id,
      completed_date: '2026-06-22',
    }));
    const result = getDailyTaskProgress('c1', tasks, completions, '2026-06-22');
    expect(result.state).toBe('near');
    expect(result.remaining).toBe(1);
  });

  it('returns near when at least 75% complete', () => {
    const fourTasks = [{ id: 't1' }, { id: 't2' }, { id: 't3' }, { id: 't4' }];
    const completions = [
      { child_id: 'c1', task_id: 't1', completed_date: '2026-06-22' },
      { child_id: 'c1', task_id: 't2', completed_date: '2026-06-22' },
      { child_id: 'c1', task_id: 't3', completed_date: '2026-06-22' },
    ];
    expect(getDailyTaskProgress('c1', fourTasks, completions, '2026-06-22').state).toBe('near');
  });

  it('returns none when less than 75% complete', () => {
    const completions = [{ child_id: 'c1', task_id: 't1', completed_date: '2026-06-22' }];
    expect(getDailyTaskProgress('c1', tasks, completions, '2026-06-22').state).toBe('none');
  });
});
