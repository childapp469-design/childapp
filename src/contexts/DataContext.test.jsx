Object.defineProperty(navigator, 'onLine', { value: true, writable: true, configurable: true });

import { render, waitFor, act } from '@testing-library/react';

const mockUseAuth = jest.fn();
const mockSyncAllData = jest.fn().mockResolvedValue({
  syncedItems: 0,
  children: [],
  tasks: [],
  completions: [],
  adjustments: [],
});
const mockFetchChildren = jest.fn().mockResolvedValue([
  { id: 'c1', first_name: 'Ali', is_archived: false },
]);
const mockFetchTasks = jest.fn().mockResolvedValue([
  { id: 't1', name: 'Oxu', points: 5, stars: 1, is_active: true },
]);
const mockIsSupabaseConfigured = jest.fn(() => true);
const mockCheckSupabaseSchema = jest.fn().mockResolvedValue({ ready: true });

jest.mock('./AuthContext', () => ({
  useAuth: (...args) => mockUseAuth(...args),
}));

jest.mock('../lib/api', () => ({
  fetchChildren: (...args) => mockFetchChildren(...args),
  fetchTasks: (...args) => mockFetchTasks(...args),
  fetchCompletions: jest.fn().mockResolvedValue([]),
  fetchAdjustments: jest.fn().mockResolvedValue([]),
  fetchAuditLogs: jest.fn().mockResolvedValue([]),
  syncAllData: (...args) => mockSyncAllData(...args),
  saveChild: jest.fn(),
  archiveChild: jest.fn(),
  uploadChildPhoto: jest.fn(),
  saveTask: jest.fn(),
  deleteTask: jest.fn(),
  toggleCompletion: jest.fn(),
  saveAdjustment: jest.fn(),
  deleteAdjustment: jest.fn(),
}));

jest.mock('../lib/schemaCheck', () => ({
  checkSupabaseSchema: (...args) => mockCheckSupabaseSchema(...args),
}));

jest.mock('../lib/supabase', () => ({
  isSupabaseConfigured: (...args) => mockIsSupabaseConfigured(...args),
}));

import { DataProvider, useData } from './DataContext';

function Probe() {
  const { loading, childList, taskList } = useData();
  return (
    <div>
      <span data-testid="loading">{loading ? 'yes' : 'no'}</span>
      <span data-testid="children">{childList.length}</span>
      <span data-testid="tasks">{taskList.length}</span>
    </div>
  );
}

describe('DataContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
    mockIsSupabaseConfigured.mockReturnValue(true);
    mockCheckSupabaseSchema.mockResolvedValue({ ready: true });
    mockSyncAllData.mockResolvedValue({
      syncedItems: 0,
      children: [],
      tasks: [],
      completions: [],
      adjustments: [],
    });
    mockFetchChildren.mockResolvedValue([{ id: 'c1', first_name: 'Ali', is_archived: false }]);
    mockFetchTasks.mockResolvedValue([
      { id: 't1', name: 'Oxu', points: 5, stars: 1, is_active: true },
    ]);
  });

  it('does not load data when not authenticated', async () => {
    mockUseAuth.mockReturnValue({ user: null, isAuthenticated: false });

    await act(async () => {
      render(
        <DataProvider>
          <Probe />
        </DataProvider>
      );
    });

    await waitFor(() => {
      expect(mockFetchChildren).not.toHaveBeenCalled();
    });
  });

  it('auto-syncs and loads data on login', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, isAuthenticated: true });

    await act(async () => {
      render(
        <DataProvider>
          <Probe />
        </DataProvider>
      );
    });

    await waitFor(() => {
      expect(mockSyncAllData).toHaveBeenCalled();
      expect(mockFetchChildren).toHaveBeenCalled();
      expect(mockFetchTasks).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(document.querySelector('[data-testid="children"]')).toHaveTextContent('1');
      expect(document.querySelector('[data-testid="tasks"]')).toHaveTextContent('1');
    });
  });

  it('reloads when coming back online', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, isAuthenticated: true });

    await act(async () => {
      render(
        <DataProvider>
          <Probe />
        </DataProvider>
      );
    });

    await waitFor(() => expect(mockSyncAllData).toHaveBeenCalledTimes(1));

    await act(async () => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
      window.dispatchEvent(new Event('offline'));
    });

    await act(async () => {
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
      window.dispatchEvent(new Event('online'));
    });

    await waitFor(() => expect(mockSyncAllData).toHaveBeenCalledTimes(2));
  });
});
