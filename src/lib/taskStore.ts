import { Task, CategoryId } from "@/types";
import { dbSaveTasks, dbLoadTasksOrdered, dbGetMeta, dbSetMeta, migrateFromLocalStorage } from "@/lib/db";

// In-memory cache for sync access
let cachedTasks: Task[] = [];
let initialized = false;

export async function initTaskStore(): Promise<Task[]> {
  if (initialized) return cachedTasks;

  // One-time migration from localStorage
  if (!localStorage.getItem("idb_migrated")) {
    const migrated = await migrateFromLocalStorage();
    if (migrated) {
      cachedTasks = migrated;
      initialized = true;
      return cachedTasks;
    }
  }

  cachedTasks = await dbLoadTasksOrdered();
  initialized = true;
  return cachedTasks;
}

export function loadTasks(): Task[] {
  // Sync fallback for initial render (returns cached or empty)
  return cachedTasks;
}

export function saveTasks(tasks: Task[]) {
  cachedTasks = tasks;
  // Async save to IndexedDB
  dbSaveTasks(tasks).catch(() => {});
}

export function getNextId(tasks: Task[]): number {
  return tasks.reduce((max, t) => Math.max(max, t.id), 0) + 1;
}

export async function getCustomSubcategories(): Promise<Record<string, string[]>> {
  const result = await dbGetMeta<Record<string, string[]>>("customSubcategories");
  return result ?? {};
}

export function getCustomSubcategoriesSync(): Record<string, string[]> {
  // Sync fallback - try localStorage first, then return empty
  try {
    const raw = localStorage.getItem("customSubcategories");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function saveCustomSubcategories(subs: Record<string, string[]>) {
  await dbSetMeta("customSubcategories", subs);
}

function sanitize(s: unknown): string {
  if (typeof s !== "string") return String(s ?? "");
  return s
    .replace(/\uFFFD/g, "")
    .replace(/&shy;|&#173;|\u00AD/g, "")
    .replace(/\u200B/g, "")
    .replace(/[\r\n]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function exportTasksToFile(tasks: Task[]) {
  const dataStr = JSON.stringify(tasks, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const name = `коробочка-задачи-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}-${pad(now.getMinutes())}.json`;
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function importTasksFromFile(file: File): Promise<Task[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (!Array.isArray(data)) {
          reject(new Error("Файл должен содержать массив задач"));
          return;
        }
        resolve(data);
      } catch (err: any) {
        reject(new Error("Ошибка чтения: " + err.message));
      }
    };
    reader.readAsText(file);
  });
}
