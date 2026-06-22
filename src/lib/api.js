import { supabase, TABLES, STORAGE_BUCKET, isSupabaseConfigured } from './supabase';
import { runSupabaseQuery } from './schemaCheck';
import {
  getAllFromStore,
  putInStore,
  putManyInStore,
  deleteFromStore,
  addToSyncQueue,
  STORES,
} from './indexedDB';
import { generateId } from './dateUtils';

async function cacheLocally(fn) {
  try {
    await fn();
  } catch (err) {
    console.warn('Offline cache yazılmadı:', err?.message || err);
  }
}

export async function logAudit(user, tableName, recordId, action, oldValue, newValue) {
  const entry = {
    id: generateId(),
    user_id: user?.id,
    user_email: user?.email,
    table_name: tableName,
    record_id: recordId,
    action,
    old_value: oldValue,
    new_value: newValue,
    created_at: new Date().toISOString(),
  };

  if (navigator.onLine && isSupabaseConfigured()) {
    await runSupabaseQuery(() => supabase.from(TABLES.AUDIT).insert(entry));
  }
  await cacheLocally(() => putInStore(STORES.audit, entry));
  return entry;
}

// --- Children ---

export async function fetchChildren() {
  if (navigator.onLine && isSupabaseConfigured()) {
    const { data, error } = await runSupabaseQuery(() =>
      supabase.from(TABLES.CHILDREN).select('*').order('first_name')
    );
    if (!error && data) {
      await cacheLocally(() => putManyInStore(STORES.children, data));
      return data;
    }
  }
  return getAllFromStore(STORES.children);
}

export async function saveChild(child, user) {
  const isNew = !child.id;
  const record = {
    ...child,
    id: child.id || generateId(),
    updated_at: new Date().toISOString(),
    created_at: child.created_at || new Date().toISOString(),
  };

  if (navigator.onLine && isSupabaseConfigured()) {
    const { data, error } = await runSupabaseQuery(() =>
      supabase.from(TABLES.CHILDREN).upsert(record).select().single()
    );
    if (error) {
      throw new Error(error.message || 'Supabase xətası');
    }
    if (data) {
      await cacheLocally(() => putInStore(STORES.children, data));
      await logAudit(user, TABLES.CHILDREN, data.id, isNew ? 'create' : 'update', isNew ? null : child, data);
      return data;
    }
  }

  await cacheLocally(async () => {
    await addToSyncQueue({ table: TABLES.CHILDREN, operation: 'upsert', data: record });
    await putInStore(STORES.children, record);
  });
  await logAudit(user, TABLES.CHILDREN, record.id, isNew ? 'create' : 'update', null, record);
  return record;
}

export async function archiveChild(id, user) {
  const children = await getAllFromStore(STORES.children);
  const existing = children.find((c) => c.id === id);
  const updated = { ...existing, is_archived: true, updated_at: new Date().toISOString() };

  if (navigator.onLine && isSupabaseConfigured()) {
    const { data, error } = await runSupabaseQuery(() =>
      supabase.from(TABLES.CHILDREN).update({ is_archived: true }).eq('id', id).select().single()
    );
    if (!error && data) {
      await putInStore(STORES.children, data);
      await logAudit(user, TABLES.CHILDREN, id, 'archive', existing, data);
      return data;
    }
  }

  await addToSyncQueue({ table: TABLES.CHILDREN, operation: 'upsert', data: updated });
  await putInStore(STORES.children, updated);
  await logAudit(user, TABLES.CHILDREN, id, 'archive', existing, updated);
  return updated;
}

export async function uploadChildPhoto(file, childId) {
  const ext = file.name.split('.').pop();
  const path = `${childId}/${Date.now()}.${ext}`;

  if (navigator.onLine && isSupabaseConfigured()) {
    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, { upsert: true });
    if (!error) {
      const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(data.path);
      return urlData.publicUrl;
    }
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

// --- Tasks ---

export async function fetchTasks() {
  if (navigator.onLine && isSupabaseConfigured()) {
    const { data, error } = await runSupabaseQuery(() =>
      supabase.from(TABLES.TASKS).select('*').order('name')
    );
    if (!error && data) {
      await cacheLocally(() => putManyInStore(STORES.tasks, data));
      return data;
    }
  }
  return getAllFromStore(STORES.tasks);
}

export async function saveTask(task, user) {
  const isNew = !task.id;
  const record = {
    ...task,
    id: task.id || generateId(),
    updated_at: new Date().toISOString(),
    created_at: task.created_at || new Date().toISOString(),
  };

  if (navigator.onLine && isSupabaseConfigured()) {
    const { data, error } = await runSupabaseQuery(() =>
      supabase.from(TABLES.TASKS).upsert(record).select().single()
    );
    if (!error && data) {
      await putInStore(STORES.tasks, data);
      await logAudit(user, TABLES.TASKS, data.id, isNew ? 'create' : 'update', null, data);
      return data;
    }
  }

  await addToSyncQueue({ table: TABLES.TASKS, operation: 'upsert', data: record });
  await putInStore(STORES.tasks, record);
  return record;
}

export async function deleteTask(id, user) {
  const tasks = await getAllFromStore(STORES.tasks);
  const existing = tasks.find((t) => t.id === id);

  if (navigator.onLine && isSupabaseConfigured()) {
    const { error } = await runSupabaseQuery(() =>
      supabase.from(TABLES.TASKS).update({ is_active: false }).eq('id', id)
    );
    if (!error) {
      const updated = { ...existing, is_active: false };
      await putInStore(STORES.tasks, updated);
      await logAudit(user, TABLES.TASKS, id, 'deactivate', existing, updated);
      return;
    }
  }

  await addToSyncQueue({ table: TABLES.TASKS, operation: 'upsert', data: { ...existing, is_active: false } });
  await putInStore(STORES.tasks, { ...existing, is_active: false });
}

// --- Completions ---

export async function fetchCompletions() {
  if (navigator.onLine && isSupabaseConfigured()) {
    const { data, error } = await runSupabaseQuery(() => supabase.from(TABLES.COMPLETIONS).select('*'));
    if (!error && data) {
      await cacheLocally(() => putManyInStore(STORES.completions, data));
      return data;
    }
  }
  return getAllFromStore(STORES.completions);
}

export async function toggleCompletion(childId, task, date, existing, user) {
  if (existing) {
    if (navigator.onLine && isSupabaseConfigured()) {
      await runSupabaseQuery(() => supabase.from(TABLES.COMPLETIONS).delete().eq('id', existing.id));
    }
    await deleteFromStore(STORES.completions, existing.id);
    await logAudit(user, TABLES.COMPLETIONS, existing.id, 'delete', existing, null);
    return null;
  }

  const record = {
    id: generateId(),
    child_id: childId,
    task_id: task.id,
    completed_date: date,
    points_earned: task.points || 0,
    stars_earned: task.stars || 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (navigator.onLine && isSupabaseConfigured()) {
    const { data, error } = await runSupabaseQuery(() =>
      supabase.from(TABLES.COMPLETIONS).insert(record).select().single()
    );
    if (!error && data) {
      await putInStore(STORES.completions, data);
      await logAudit(user, TABLES.COMPLETIONS, data.id, 'create', null, data);
      return data;
    }
  }

  await addToSyncQueue({ table: TABLES.COMPLETIONS, operation: 'upsert', data: record });
  await putInStore(STORES.completions, record);
  return record;
}

// --- Adjustments ---

export async function fetchAdjustments() {
  if (navigator.onLine && isSupabaseConfigured()) {
    const { data, error } = await runSupabaseQuery(() => supabase.from(TABLES.ADJUSTMENTS).select('*'));
    if (!error && data) {
      await cacheLocally(() => putManyInStore(STORES.adjustments, data));
      return data;
    }
  }
  return getAllFromStore(STORES.adjustments);
}

export async function saveAdjustment(adjustment, user) {
  const record = {
    ...adjustment,
    id: adjustment.id || generateId(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (navigator.onLine && isSupabaseConfigured()) {
    const { data, error } = await runSupabaseQuery(() =>
      supabase.from(TABLES.ADJUSTMENTS).insert(record).select().single()
    );
    if (!error && data) {
      await putInStore(STORES.adjustments, data);
      await logAudit(user, TABLES.ADJUSTMENTS, data.id, 'create', null, data);
      return data;
    }
  }

  await addToSyncQueue({ table: TABLES.ADJUSTMENTS, operation: 'upsert', data: record });
  await putInStore(STORES.adjustments, record);
  return record;
}

export async function deleteAdjustment(id, user) {
  const adjustments = await getAllFromStore(STORES.adjustments);
  const existing = adjustments.find((a) => a.id === id);

  if (navigator.onLine && isSupabaseConfigured()) {
    await runSupabaseQuery(() => supabase.from(TABLES.ADJUSTMENTS).delete().eq('id', id));
  }
  await deleteFromStore(STORES.adjustments, id);
  await logAudit(user, TABLES.ADJUSTMENTS, id, 'delete', existing, null);
}

// --- Sync ---

let syncInProgress = false;

export async function syncAllData() {
  if (!navigator.onLine || !isSupabaseConfigured()) {
    throw new Error('Sinxronizasiya üçün internet bağlantısı lazımdır');
  }
  if (syncInProgress) return { children: [], tasks: [], completions: [], adjustments: [], syncedItems: 0 };

  syncInProgress = true;
  try {
    return await syncAllDataInternal();
  } finally {
    syncInProgress = false;
  }
}

async function syncAllDataInternal() {
  const { getSyncQueue, removeFromSyncQueue } = await import('./indexedDB');
  const queue = await getSyncQueue();

  for (const item of queue) {
    const { table, data } = item;
    const { error } = await runSupabaseQuery(() => supabase.from(table).upsert(data));
    if (!error) await removeFromSyncQueue(item.id);
  }

  const [children, tasks, completions, adjustments] = await Promise.all([
    runSupabaseQuery(() => supabase.from(TABLES.CHILDREN).select('*')),
    runSupabaseQuery(() => supabase.from(TABLES.TASKS).select('*')),
    runSupabaseQuery(() => supabase.from(TABLES.COMPLETIONS).select('*')),
    runSupabaseQuery(() => supabase.from(TABLES.ADJUSTMENTS).select('*')),
  ]);

  if (children.error && children.error.code === 'PGRST205') {
    throw new Error(
      'Supabase cədvəlləri yaradılmayıb. SQL Editor-də migration faylını icra edin və ya npm run setup:db'
    );
  }

  if (children.data) await cacheLocally(() => putManyInStore(STORES.children, children.data));
  if (tasks.data) await cacheLocally(() => putManyInStore(STORES.tasks, tasks.data));
  if (completions.data) await cacheLocally(() => putManyInStore(STORES.completions, completions.data));
  if (adjustments.data) await cacheLocally(() => putManyInStore(STORES.adjustments, adjustments.data));

  return {
    children: children.data || [],
    tasks: tasks.data || [],
    completions: completions.data || [],
    adjustments: adjustments.data || [],
    syncedItems: queue.length,
  };
}

export async function fetchAuditLogs() {
  if (navigator.onLine && isSupabaseConfigured()) {
    const { data } = await runSupabaseQuery(() =>
      supabase.from(TABLES.AUDIT).select('*').order('created_at', { ascending: false }).limit(100)
    );
    if (data) {
      await cacheLocally(() => putManyInStore(STORES.audit, data));
      return data;
    }
  }
  return getAllFromStore(STORES.audit);
}

export async function fetchSettings() {
  if (navigator.onLine && isSupabaseConfigured()) {
    const { data } = await runSupabaseQuery(() => supabase.from(TABLES.SETTINGS).select('*'));
    if (data) return data;
  }
  return [];
}

export async function saveSetting(key, value) {
  if (navigator.onLine && isSupabaseConfigured()) {
    await runSupabaseQuery(() =>
      supabase.from(TABLES.SETTINGS).upsert({ key, value, updated_at: new Date().toISOString() })
    );
  }
}
