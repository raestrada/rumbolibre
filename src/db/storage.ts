const DB_NAME = 'rumbo-libre';
const STORE = 'files';
const KEY = 'db';

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const d = req.result;
      if (!d.objectStoreNames.contains(STORE)) d.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveDb(bytes: Uint8Array): Promise<void> {
  const d = await open();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(bytes, KEY);
    tx.oncomplete = () => {
      d.close();
      resolve();
    };
    tx.onerror = () => {
      d.close();
      reject(tx.error);
    };
  });
}

export async function loadDb(): Promise<Uint8Array | null> {
  const d = await open();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(KEY);
    req.onsuccess = () => {
      d.close();
      const v = req.result;
      resolve(v instanceof Uint8Array ? v : null);
    };
    req.onerror = () => {
      d.close();
      reject(req.error);
    };
  });
}
