import { Task } from "@/types";

const DB_NAME = "korobochka";
const DB_VERSION = 1;
const TASKS_STORE = "tasks";
const META_STORE = "meta";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(TASKS_STORE)) {
        db.createObjectStore(TASKS_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: "key" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function dbLoadTasks(): Promise<Task[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(TASKS_STORE, "readonly");
      const store = tx.objectStore(TASKS_STORE);
      const req = store.getAll();
      req.onsuccess = () => {
        // Maintain order from meta store
        resolve(req.result as Task[]);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

export async function dbSaveTasks(tasks: Task[]): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction([TASKS_STORE, META_STORE], "readwrite");
    const store = tx.objectStore(TASKS_STORE);
    const metaStore = tx.objectStore(META_STORE);

    // Clear and re-add all tasks to preserve order
    store.clear();
    tasks.forEach((t) => store.put(t));

    // Save order as meta
    metaStore.put({ key: "taskOrder", value: tasks.map((t) => t.id) });

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Silently fail
  }
}

export async function dbLoadTasksOrdered(): Promise<Task[]> {
  try {
    const db = await openDB();
    const tx = db.transaction([TASKS_STORE, META_STORE], "readonly");
    const store = tx.objectStore(TASKS_STORE);
    const metaStore = tx.objectStore(META_STORE);

    const [allTasks, orderMeta] = await Promise.all([
      new Promise<Task[]>((res, rej) => {
        const r = store.getAll();
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
      }),
      new Promise<number[] | null>((res, rej) => {
        const r = metaStore.get("taskOrder");
        r.onsuccess = () => res(r.result?.value ?? null);
        r.onerror = () => rej(r.error);
      }),
    ]);

    if (!orderMeta) return allTasks;

    const taskMap = new Map(allTasks.map((t) => [t.id, t]));
    const ordered: Task[] = [];
    for (const id of orderMeta) {
      const t = taskMap.get(id);
      if (t) {
        ordered.push(t);
        taskMap.delete(id);
      }
    }
    // Append any tasks not in order (new tasks)
    taskMap.forEach((t) => ordered.push(t));
    return ordered;
  } catch {
    return [];
  }
}

export async function dbGetMeta<T>(key: string): Promise<T | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(META_STORE, "readonly");
      const store = tx.objectStore(META_STORE);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result?.value ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function dbSetMeta<T>(key: string, value: T): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(META_STORE, "readwrite");
    const store = tx.objectStore(META_STORE);
    store.put({ key, value });
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {}
}

/**
 * Migrate from localStorage to IndexedDB (one-time)
 */
export async function migrateFromLocalStorage(): Promise<Task[] | null> {
  const raw = localStorage.getItem("tasks");
  if (!raw) return null;

  try {
    const tasks = JSON.parse(raw) as Task[];
    if (!Array.isArray(tasks) || tasks.length === 0) return null;

    await dbSaveTasks(tasks);

    // Migrate custom subcategories
    const customSubs = localStorage.getItem("customSubcategories");
    if (customSubs) {
      await dbSetMeta("customSubcategories", JSON.parse(customSubs));
    }

    // Mark migration done and clear localStorage
    localStorage.setItem("idb_migrated", "1");
    localStorage.removeItem("tasks");
    localStorage.removeItem("customSubcategories");

    return tasks;
  } catch {
    return null;
  }
}
