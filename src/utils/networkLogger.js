const DB_NAME = 'alwar_net_logs';
const STORE = 'logs';
const DB_VERSION = 1;
const MAX_AGE_MS = 15 * 60 * 1000;

let _db = null;

const openDB = () =>
  new Promise((resolve, reject) => {
    if (_db) return resolve(_db);
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = ({ target: { result: idb } }) => {
      if (!idb.objectStoreNames.contains(STORE)) {
        const store = idb.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
        store.createIndex('by_ts', 'timestamp');
      }
    };
    req.onsuccess = ({ target: { result } }) => {
      _db = result;
      resolve(_db);
    };
    req.onerror = () => reject(req.error);
  });

export const truncate = (val, len = 2000) => {
  if (val == null) return null;
  let s;
  try {
    s = typeof val === 'string' ? val : JSON.stringify(val);
  } catch {
    s = String(val);
  }
  return s.length > len ? s.slice(0, len) + '…' : s;
};

export const addNetworkLog = (entry) => {
  openDB()
    .then((idb) => {
      const tx = idb.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).add({ ...entry, timestamp: entry.timestamp ?? Date.now() });
    })
    .catch(() => {});
};

export const getNetworkLogs = async () => {
  try {
    const idb = await openDB();
    return await new Promise((resolve, reject) => {
      const tx = idb.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
};

const clearOldLogs = async () => {
  try {
    const idb = await openDB();
    const cutoff = Date.now() - MAX_AGE_MS;
    await new Promise((resolve, reject) => {
      const tx = idb.transaction(STORE, 'readwrite');
      const req = tx
        .objectStore(STORE)
        .index('by_ts')
        .openCursor(IDBKeyRange.upperBound(cutoff));
      req.onsuccess = ({ target: { result: cur } }) => {
        if (cur) {
          cur.delete();
          cur.continue();
        }
      };
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  } catch {}
};

// Auto-cleanup: runs on import + every 60s
clearOldLogs();
setInterval(clearOldLogs, 60_000);
