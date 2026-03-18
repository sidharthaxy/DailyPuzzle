export interface SavedPuzzleState {
  date: string;
  puzzleType: string;
  moves: any;
  gridState: any;
  timer: number;
  hintsUsed: number;
}

export interface UnsyncedResult {
  id: string;
  date: string;
  score: number;
  time: number;
  puzzleType: string;
}

const DB_NAME = 'DailyPuzzleDB';
const STORE_NAME = 'puzzleStore';
const STORE_NAME_RESULTS = 'unsyncedResultsStore';
const DB_VERSION = 2; // Incremented for new store

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
        return reject(new Error('indexedDB is not defined'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'date' });
      }
      if (!db.objectStoreNames.contains(STORE_NAME_RESULTS)) {
        db.createObjectStore(STORE_NAME_RESULTS, { keyPath: 'id' });
      }
    };
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const savePuzzleProgress = async (state: SavedPuzzleState): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(state);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    // Graceful fallback
    return Promise.resolve();
  }
};

export const loadPuzzleProgress = async (date: string): Promise<SavedPuzzleState | undefined> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(date);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    return Promise.resolve(undefined);
  }
};

export const getUnsyncedResults = async (): Promise<UnsyncedResult[]> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME_RESULTS, 'readonly');
      const store = tx.objectStore(STORE_NAME_RESULTS);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    return Promise.resolve([]);
  }
};

export const markSynced = async (id: string): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME_RESULTS, 'readwrite');
      const store = tx.objectStore(STORE_NAME_RESULTS);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    return Promise.resolve();
  }
};

export const saveUnsyncedResult = async (result: UnsyncedResult): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME_RESULTS, 'readwrite');
      const store = tx.objectStore(STORE_NAME_RESULTS);
      const request = store.put(result);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    return Promise.resolve();
  }
};
