export interface Task {
  id: number;
  text: string;
  category: CategoryId;
  completed: boolean;
  active: boolean;
  statusChangedAt: number;
  subcategory?: string;
  /** Total seconds spent on this task via timer */
  timeSpent?: number;
  /** Recurring template reference */
  templateId?: number;
}

export type CategoryId = 0 | 1 | 2 | 3 | 4 | 5;

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
}

export const CATEGORIES: Record<CategoryId, CategoryInfo> = {
  0: { id: 0, name: "Категория не определена", icon: "circle-help", color: "var(--color-cat-0)", bgColor: "var(--color-cat-0-bg)" },
  1: { id: 1, name: "Обязательные", icon: "circle-check", color: "var(--color-cat-1)", bgColor: "var(--color-cat-1-bg)" },
  2: { id: 2, name: "Безопасность", icon: "shield", color: "var(--color-cat-2)", bgColor: "var(--color-cat-2-bg)" },
  3: { id: 3, name: "Простые радости", icon: "smile", color: "var(--color-cat-3)", bgColor: "var(--color-cat-3-bg)" },
  4: { id: 4, name: "Эго-радости", icon: "graduation-cap", color: "var(--color-cat-4)", bgColor: "var(--color-cat-4-bg)" },
  5: { id: 5, name: "Доступность простых радостей", icon: "heart", color: "var(--color-cat-5)", bgColor: "var(--color-cat-5-bg)" },
};

export const CATEGORY_ASSET_MAP: Record<number, string> = {
  1: "mandatory_yellow",
  2: "security_blue",
  3: "simple_joys_green",
  4: "ego_joys_red",
  5: "accessibility_joys_light_blue",
};

// Predefined subcategories per category
export const DEFAULT_SUBCATEGORIES: Partial<Record<CategoryId, string[]>> = {
  1: ["Работа", "Дом", "Здоровье", "Финансы", "Учёба"],
  2: ["Финансовая подушка", "Здоровье", "Документы", "Страхование", "Навыки"],
  3: ["Природа", "Творчество", "Спорт", "Кулинария", "Чтение", "Музыка"],
  4: ["Карьера", "Образование", "Достижения", "Признание", "Проекты"],
  5: ["Время", "Деньги", "Энергия", "Пространство", "Инструменты"],
};

// Section definitions for the dashboard
export interface SectionDef {
  categories: CategoryId[];
  title: string;
  sectionClass: string;
}

export const SECTIONS: SectionDef[] = [
  { categories: [1], title: "Обязательные дела", sectionClass: "mandatory" },
  { categories: [2, 5], title: "Система безопасности и доступность простых радостей", sectionClass: "security" },
  { categories: [3, 4], title: "Простые и эго-радости", sectionClass: "joys" },
];

// Recurring task templates
export type RecurrenceType = "daily" | "weekly" | "monthly";

export interface TaskTemplate {
  id: number;
  text: string;
  category: CategoryId;
  subcategory?: string;
  recurrence: RecurrenceType;
  /** Day of week (0-6, Sun-Sat) for weekly; day of month (1-31) for monthly */
  recurrenceDay?: number;
  /** Hour to create task (0-23) */
  recurrenceHour: number;
  active: boolean;
  lastCreated?: string; // ISO date string YYYY-MM-DD
}

export const RECURRENCE_LABELS: Record<RecurrenceType, string> = {
  daily: "Ежедневно",
  weekly: "Еженедельно",
  monthly: "Ежемесячно",
};

export const WEEKDAYS = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
