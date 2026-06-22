import { calculateScores, getCompletionForTask, getReportStats } from './scores';

describe('calculateScores', () => {
  const childId = 'child-1';
  const completions = [
    { child_id: 'child-1', completed_date: '2026-06-22', points_earned: 5, stars_earned: 1 },
    { child_id: 'child-1', completed_date: '2026-06-22', points_earned: 3, stars_earned: 0 },
    { child_id: 'child-1', completed_date: '2026-06-21', points_earned: 10, stars_earned: 2 },
    { child_id: 'child-2', completed_date: '2026-06-22', points_earned: 7, stars_earned: 1 },
  ];
  const adjustments = [
    { child_id: 'child-1', adjustment_date: '2026-06-22', points_delta: 2, stars_delta: 1 },
    { child_id: 'child-1', adjustment_date: '2026-06-20', points_delta: -1, stars_delta: 0 },
  ];

  it('sums points and stars for a single day', () => {
    const result = calculateScores(childId, completions, adjustments, {
      start: '2026-06-22',
      end: '2026-06-22',
    });
    expect(result).toEqual({ points: 10, stars: 2 });
  });

  it('sums across a date range', () => {
    const result = calculateScores(childId, completions, adjustments, {
      start: '2026-06-21',
      end: '2026-06-22',
    });
    expect(result).toEqual({ points: 20, stars: 4 });
  });

  it('returns zero for child with no activity', () => {
    const result = calculateScores('unknown', completions, adjustments, {
      start: '2026-06-22',
      end: '2026-06-22',
    });
    expect(result).toEqual({ points: 0, stars: 0 });
  });

  it('includes all dates when no range is given', () => {
    const result = calculateScores(childId, completions, adjustments, null);
    expect(result).toEqual({ points: 19, stars: 4 });
  });
});

describe('getCompletionForTask', () => {
  const completions = [
    { child_id: 'c1', task_id: 't1', completed_date: '2026-06-22', points_earned: 5 },
    { child_id: 'c1', task_id: 't1', completed_date: '2026-06-21', points_earned: 5 },
  ];

  it('finds completion for exact child, task, and date', () => {
    const result = getCompletionForTask('c1', 't1', '2026-06-22', completions);
    expect(result).toEqual(completions[0]);
  });

  it('returns undefined when no completion exists for that date', () => {
    expect(getCompletionForTask('c1', 't1', '2026-06-23', completions)).toBeUndefined();
  });
});

describe('getReportStats', () => {
  const children = [
    { id: 'c1', first_name: 'Ali', is_archived: false },
    { id: 'c2', first_name: 'Ayşə', is_archived: false },
    { id: 'c3', first_name: 'Arxiv', is_archived: true },
  ];
  const completions = [
    { child_id: 'c1', completed_date: '2026-06-22', points_earned: 10, stars_earned: 1 },
    { child_id: 'c2', completed_date: '2026-06-22', points_earned: 5, stars_earned: 0 },
    { child_id: 'c3', completed_date: '2026-06-22', points_earned: 100, stars_earned: 5 },
  ];

  it('excludes archived children and finds top scorer', () => {
    const stats = getReportStats(children, completions, [], {
      start: '2026-06-22',
      end: '2026-06-22',
    });
    expect(stats.childScores).toHaveLength(2);
    expect(stats.topScorer.first_name).toBe('Ali');
    expect(stats.totalPoints).toBe(15);
    expect(stats.totalTasks).toBe(2);
  });
});
