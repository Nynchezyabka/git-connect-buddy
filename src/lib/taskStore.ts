import { Task, CategoryId } from "@/types";

const STORAGE_KEY = "tasks";
const CUSTOM_SUBS_KEY = "customSubcategories";

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const valid = new Set([0, 1, 2, 3, 4, 5]);
    return parsed.map((t: any) => {
      const n = parseInt(t.category);
      const category = (Number.isFinite(n) && valid.has(n)) ? n as CategoryId : 0;
      const active = typeof t.active === "boolean" ? t.active : true;
      const text = sanitize(t.text);
      return { ...t, text, category, active };
    });
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {}
}

export function getNextId(tasks: Task[]): number {
  return tasks.reduce((max, t) => Math.max(max, t.id), 0) + 1;
}

export function getCustomSubcategories(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(CUSTOM_SUBS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCustomSubcategories(subs: Record<string, string[]>) {
  localStorage.setItem(CUSTOM_SUBS_KEY, JSON.stringify(subs));
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
