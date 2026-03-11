import { Task, CategoryId } from "@/types";
import { dbSaveTasks, dbLoadTasksOrdered, dbGetMeta, dbSetMeta, migrateFromLocalStorage } from "@/lib/db";

// In-memory cache for sync access
let cachedTasks: Task[] = [];
let initialized = false;

// Normalize old English subcategory names to Russian
const SUBCATEGORY_MIGRATIONS: Record<string, string> = {
  "WORK": "Работа",
  "Work": "Работа",
  "HOME": "Дом",
  "Home": "Дом",
  "HEALTH": "Здоровье",
  "Health": "Здоровье",
  "FINANCE": "Финансы",
  "Finance": "Финансы",
  "STUDY": "Учёба",
  "Study": "Учёба",
};

function normalizeTasks(tasks: Task[]): Task[] {
  return tasks.map(t => {
    if (t.subcategory && SUBCATEGORY_MIGRATIONS[t.subcategory]) {
      return { ...t, subcategory: SUBCATEGORY_MIGRATIONS[t.subcategory] };
    }
    return t;
  });
}

export async function initTaskStore(): Promise<Task[]> {
  if (initialized) return cachedTasks;

  // One-time migration from localStorage
  if (!localStorage.getItem("idb_migrated")) {
    const migrated = await migrateFromLocalStorage();
    if (migrated) {
      cachedTasks = normalizeTasks(migrated);
      initialized = true;
      return cachedTasks;
    }
  }

  const raw = await dbLoadTasksOrdered();
  cachedTasks = normalizeTasks(raw);
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
  // Also save to localStorage for sync access
  try { localStorage.setItem("customSubcategories", JSON.stringify(subs)); } catch {}
}

// Custom category names
export function getCustomCategoryNamesSync(): Record<string, string> {
  try {
    const raw = localStorage.getItem("customCategoryNames");
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export async function saveCustomCategoryNames(names: Record<string, string>) {
  try { localStorage.setItem("customCategoryNames", JSON.stringify(names)); } catch {}
  await dbSetMeta("customCategoryNames", names);
}

const DEFAULT_CAT_NAMES: Record<number, string> = {
  0: "Категория не определена",
  1: "Обязательные",
  2: "Безопасность",
  3: "Простые радости",
  4: "Эго-радости",
  5: "Доступность простых радостей",
};

export function getCategoryDisplayName(cat: CategoryId | number): string {
  const custom = getCustomCategoryNamesSync();
  return custom[String(cat)] || DEFAULT_CAT_NAMES[cat] || "Категория";
}

export function renameSubcategory(
  cat: CategoryId,
  oldName: string,
  newName: string,
  tasks: Task[]
): { updatedSubs: Record<string, string[]>; updatedTasks: Task[] } {
  const subs = getCustomSubcategoriesSync();
  const key = String(cat);
  if (subs[key]) {
    subs[key] = subs[key].map(s => s === oldName ? newName : s);
  }
  const updatedTasks = tasks.map(t => {
    if (t.category === cat && t.subcategory === oldName) {
      return { ...t, subcategory: newName };
    }
    return t;
  });
  return { updatedSubs: subs, updatedTasks };
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

const VALID_CATEGORIES = [0, 1, 2, 3, 4, 5];
const MAX_TEXT_LENGTH = 1000;
const MAX_TASKS = 10000;

function isValidTask(t: unknown): t is Task {
  if (!t || typeof t !== "object") return false;
  const o = t as Record<string, unknown>;
  return (
    typeof o.id === "number" &&
    Number.isFinite(o.id) &&
    typeof o.text === "string" &&
    o.text.length <= MAX_TEXT_LENGTH &&
    typeof o.category === "number" &&
    VALID_CATEGORIES.includes(o.category) &&
    typeof o.completed === "boolean" &&
    typeof o.active === "boolean" &&
    typeof o.statusChangedAt === "number" &&
    (o.subcategory === undefined || (typeof o.subcategory === "string" && o.subcategory.length <= 200)) &&
    (o.timeSpent === undefined || (typeof o.timeSpent === "number" && Number.isFinite(o.timeSpent) && o.timeSpent >= 0)) &&
    (o.templateId === undefined || (typeof o.templateId === "number" && Number.isFinite(o.templateId)))
  );
}

function sanitizeTask(t: Task): Task {
  return {
    ...t,
    text: sanitize(t.text).slice(0, MAX_TEXT_LENGTH),
    subcategory: t.subcategory ? sanitize(t.subcategory).slice(0, 200) : undefined,
  };
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
        if (data.length > MAX_TASKS) {
          reject(new Error(`Слишком много задач (макс. ${MAX_TASKS})`));
          return;
        }
        const valid = data.filter(isValidTask).map(sanitizeTask);
        if (valid.length === 0) {
          reject(new Error("Файл не содержит валидных задач"));
          return;
        }
        resolve(valid);
      } catch (err: any) {
        reject(new Error("Ошибка чтения: " + err.message));
      }
    };
    reader.readAsText(file);
  });
}
