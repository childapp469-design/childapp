import { openDB } from 'idb';

const DB_NAME = 'childsapp-offline';
const DB_VERSION = 1;

const STORES = {
  children: 'children',
  tasks: 'tasks',
  completions: 'completions',
  adjustments: 'adjustments',
  audit: 'audit',
  syncQueue: 'syncQueue',
  meta: 'meta',
};

let dbPromise = null;
let opQueue = Promise.resolve();

function resetDB() {
  dbPromise = null;
}

function isRecoverableDbError(err) {
  const name = err?.name || '';
  const message = err?.message || '';
  return (
    name === 'InvalidStateError' ||
    name === 'AbortError' ||
    message.includes('connection is closing') ||
    message.includes('database connection is closing')
  );
}

function enqueueOp(fn) {
  const result = opQueue.then(fn, fn);
  opQueue = result.catch(() => {});
  return result;
}

function attachConnectionHandlers(db) {
  db.onversionchange = () => {
    db.close();
    resetDB();
  };
  db.onclose = () => {
    resetDB();
  };
  return db;
}

async function openConnection() {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORES.children)) {
        db.createObjectStore(STORES.children, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.tasks)) {
        db.createObjectStore(STORES.tasks, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.completions)) {
        const store = db.createObjectStore(STORES.completions, { keyPath: 'id' });
        store.createIndex('by_date', 'completed_date');
        store.createIndex('by_child', 'child_id');
      }
      if (!db.objectStoreNames.contains(STORES.adjustments)) {
        db.createObjectStore(STORES.adjustments, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.audit)) {
        db.createObjectStore(STORES.audit, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.syncQueue)) {
        const store = db.createObjectStore(STORES.syncQueue, { keyPath: 'id', autoIncrement: true });
        store.createIndex('by_created', 'created_at');
      }
      if (!db.objectStoreNames.contains(STORES.meta)) {
        db.createObjectStore(STORES.meta, { keyPath: 'key' });
      }
    },
    blocked() {
      resetDB();
    },
    terminated: () => {
      resetDB();
    },
  });
  return attachConnectionHandlers(db);
}

async function getDB() {
  if (!dbPromise) {
    dbPromise = openConnection();
  }
  return dbPromise;
}

async function withRetry(fn, retries = 3) {
  let lastError;
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (isRecoverableDbError(err) && attempt < retries - 1) {
        resetDB();
        await new Promise((r) => setTimeout(r, 50 * (attempt + 1)));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

async function runDbOp(fn) {
  return enqueueOp(() =>
    withRetry(async () => {
      const db = await getDB();
      return fn(db);
    })
  );
}

export async function getAllFromStore(storeName) {
  return runDbOp((db) => db.getAll(storeName));
}

export async function putInStore(storeName, item) {
  return runDbOp((db) => db.put(storeName, item));
}

export async function putManyInStore(storeName, items) {
  if (!items?.length) return;
  return runDbOp(async (db) => {
    const tx = db.transaction(storeName, 'readwrite');
    await Promise.all([...items.map((item) => tx.store.put(item)), tx.done]);
  });
}

export async function deleteFromStore(storeName, id) {
  return runDbOp((db) => db.delete(storeName, id));
}

export async function clearStore(storeName) {
  return runDbOp((db) => db.clear(storeName));
}

export async function getMeta(key) {
  const row = await runDbOp((db) => db.get(STORES.meta, key));
  return row?.value;
}

export async function setMeta(key, value) {
  return runDbOp((db) => db.put(STORES.meta, { key, value }));
}

export async function addToSyncQueue(operation) {
  return runDbOp((db) =>
    db.add(STORES.syncQueue, {
      ...operation,
      created_at: new Date().toISOString(),
      status: 'pending',
    })
  );
}

export async function getSyncQueue() {
  return runDbOp((db) => db.getAll(STORES.syncQueue));
}

export async function removeFromSyncQueue(id) {
  return runDbOp((db) => db.delete(STORES.syncQueue, id));
}

export async function clearSyncQueue() {
  return runDbOp((db) => db.clear(STORES.syncQueue));
}

export { STORES };
