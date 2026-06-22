import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  fetchChildren,
  fetchTasks,
  fetchCompletions,
  fetchAdjustments,
  saveChild,
  archiveChild,
  uploadChildPhoto,
  saveTask,
  deleteTask,
  toggleCompletion,
  saveAdjustment,
  deleteAdjustment,
  syncAllData,
  fetchAuditLogs,
} from '../lib/api';
import { useAuth } from './AuthContext';
import { todayISO } from '../lib/dateUtils';
import { checkSupabaseSchema } from '../lib/schemaCheck';
import { isSupabaseConfigured } from '../lib/supabase';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [childList, setChildList] = useState([]);
  const [taskList, setTaskList] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [adjustments, setAdjustments] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [searchQuery, setSearchQuery] = useState('');
  const [period, setPeriod] = useState('daily');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [schemaReady, setSchemaReady] = useState(false);

  const recheckSchema = useCallback(async () => {
    const result = await checkSupabaseSchema();
    setSchemaReady(result.ready);
    return result;
  }, []);

  const loadAll = useCallback(async ({ syncFirst = false } = {}) => {
    setLoading(true);
    let syncResult = null;
    try {
      if (syncFirst && isOnline && isSupabaseConfigured()) {
        setSyncStatus('syncing');
        try {
          syncResult = await syncAllData();
          setSyncStatus('success');
        } catch {
          setSyncStatus('error');
        }
      }

      const schema = await checkSupabaseSchema();
      setSchemaReady(schema?.ready ?? false);

      const [c, t, comp, adj, audit] = await Promise.all([
        fetchChildren(),
        fetchTasks(),
        fetchCompletions(),
        fetchAdjustments(),
        fetchAuditLogs(),
      ]);
      setChildList(c || []);
      setTaskList((t || []).filter((task) => task.is_active !== false));
      setCompletions(comp || []);
      setAdjustments(adj || []);
      setAuditLogs(audit || []);
      return syncResult;
    } finally {
      setLoading(false);
    }
  }, [isOnline]);

  // Girişdən sonra avtomatik sinxronizasiya və məlumat yükləmə
  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    loadAll({ syncFirst: isOnline && isSupabaseConfigured() });
  }, [isAuthenticated, isOnline, loadAll]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addOrUpdateChild = async (childData, photoFile) => {
    let photo_url = childData.photo_url;
    if (photoFile) {
      photo_url = await uploadChildPhoto(photoFile, childData.id || 'new');
    }
    const saved = await saveChild({ ...childData, photo_url }, user);
    setChildList((prev) => {
      const idx = prev.findIndex((c) => c.id === saved.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = saved;
        return updated;
      }
      return [...prev, saved];
    });
    return saved;
  };

  const removeChild = async (id) => {
    const archived = await archiveChild(id, user);
    setChildList((prev) => prev.map((c) => (c.id === id ? archived : c)));
  };

  const addOrUpdateTask = async (taskData) => {
    const saved = await saveTask(taskData, user);
    setTaskList((prev) => {
      const idx = prev.findIndex((t) => t.id === saved.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = saved;
        return updated;
      }
      return [...prev, saved];
    });
    return saved;
  };

  const removeTask = async (id) => {
    await deleteTask(id, user);
    setTaskList((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTaskCompletion = async (childId, task) => {
    const existing = completions.find(
      (c) => c.child_id === childId && c.task_id === task.id && c.completed_date === selectedDate
    );
    const result = await toggleCompletion(childId, task, selectedDate, existing, user);
    if (result) {
      setCompletions((prev) => [...prev, result]);
    } else {
      setCompletions((prev) => prev.filter((c) => c.id !== existing?.id));
    }
  };

  const addAdjustment = async (adjustment) => {
    const saved = await saveAdjustment(adjustment, user);
    setAdjustments((prev) => [...prev, saved]);
    return saved;
  };

  const removeAdjustment = async (id) => {
    await deleteAdjustment(id, user);
    setAdjustments((prev) => prev.filter((a) => a.id !== id));
  };

  const manualSync = async () => {
    const result = await loadAll({ syncFirst: true });
    return result || { syncedItems: 0 };
  };

  const activeChildren = childList.filter((c) => !c.is_archived);

  const filteredChildren = activeChildren.filter((c) => {
    if (!searchQuery) return true;
    const name = `${c.first_name} ${c.last_name || ''}`.toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  return (
    <DataContext.Provider
      value={{
        childList,
        activeChildren,
        filteredChildren,
        taskList,
        completions,
        adjustments,
        auditLogs,
        loading,
        selectedDate,
        setSelectedDate,
        searchQuery,
        setSearchQuery,
        period,
        setPeriod,
        isOnline,
        syncStatus,
        schemaReady,
        recheckSchema,
        loadAll,
        addOrUpdateChild,
        removeChild,
        addOrUpdateTask,
        removeTask,
        toggleTaskCompletion,
        addAdjustment,
        removeAdjustment,
        manualSync,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData DataProvider daxilində istifadə edilməlidir');
  return ctx;
}
