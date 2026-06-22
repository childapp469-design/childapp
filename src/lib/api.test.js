jest.mock('./supabase', () => ({
  supabase: {
    from: jest.fn(),
    storage: { from: jest.fn() },
    auth: { getSession: jest.fn() },
  },
  TABLES: {
    CHILDREN: 'children',
    TASKS: 'tasks',
    COMPLETIONS: 'task_completions',
    ADJUSTMENTS: 'score_adjustments',
    AUDIT: 'audit_logs',
    SETTINGS: 'app_settings',
  },
  STORAGE_BUCKET: 'child-photos',
  isSupabaseConfigured: jest.fn(() => false),
}));

jest.mock('./schemaCheck', () => ({
  runSupabaseQuery: jest.fn((fn) => fn()),
}));

jest.mock('./indexedDB', () => ({
  getAllFromStore: jest.fn().mockResolvedValue([]),
  putInStore: jest.fn().mockResolvedValue(undefined),
  putManyInStore: jest.fn().mockResolvedValue(undefined),
  deleteFromStore: jest.fn().mockResolvedValue(undefined),
  addToSyncQueue: jest.fn().mockResolvedValue(undefined),
  getSyncQueue: jest.fn().mockResolvedValue([]),
  removeFromSyncQueue: jest.fn().mockResolvedValue(undefined),
  STORES: {
    children: 'children',
    tasks: 'tasks',
    completions: 'completions',
    adjustments: 'adjustments',
    audit: 'audit',
    syncQueue: 'syncQueue',
  },
}));

import { toggleCompletion } from './api';
import { putInStore, deleteFromStore, addToSyncQueue } from './indexedDB';

const user = { id: 'u1', email: 'test@test.com' };
const task = { id: 't1', points: 5, stars: 2 };

describe('toggleCompletion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
  });

  it('creates a completion with task points and stars', async () => {
    const result = await toggleCompletion('c1', task, '2026-06-22', null, user);
    expect(result).toMatchObject({
      child_id: 'c1',
      task_id: 't1',
      completed_date: '2026-06-22',
      points_earned: 5,
      stars_earned: 2,
    });
    expect(putInStore).toHaveBeenCalled();
    expect(addToSyncQueue).toHaveBeenCalled();
  });

  it('removes existing completion when toggled off', async () => {
    const existing = { id: 'comp-1', child_id: 'c1', task_id: 't1', completed_date: '2026-06-22' };
    const result = await toggleCompletion('c1', task, '2026-06-22', existing, user);
    expect(result).toBeNull();
    expect(deleteFromStore).toHaveBeenCalledWith('completions', 'comp-1');
  });

  it('stores separate completions per date (daily reset)', async () => {
    const day1 = await toggleCompletion('c1', task, '2026-06-22', null, user);
    const day2 = await toggleCompletion('c1', task, '2026-06-23', null, user);
    expect(day1.completed_date).toBe('2026-06-22');
    expect(day2.completed_date).toBe('2026-06-23');
    expect(day1.id).not.toBe(day2.id);
  });
});
