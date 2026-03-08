import { Task, TaskTemplate, CategoryId } from "@/types";

/**
 * Check recurring templates and create tasks that are due.
 * Returns new tasks (without IDs) and updated templates if any were processed.
 */
export function processRecurringTemplates(
  templates: TaskTemplate[],
  existingTasks: Task[]
): { newTasks: Omit<Task, "id">[]; updatedTemplates: TaskTemplate[] | null } {
  const now = new Date();
  const today = toDateStr(now);
  const currentHour = now.getHours();
  const currentDay = now.getDay(); // 0-6
  const currentDate = now.getDate(); // 1-31

  const newTasks: Omit<Task, "id">[] = [];
  let changed = false;
  const updated = templates.map((tpl) => {
    if (!tpl.active) return tpl;
    if (tpl.lastCreated === today) return tpl; // Already created today
    if (currentHour < tpl.recurrenceHour) return tpl; // Not time yet

    let shouldCreate = false;

    switch (tpl.recurrence) {
      case "daily":
        shouldCreate = true;
        break;
      case "weekly":
        shouldCreate = tpl.recurrenceDay === undefined || tpl.recurrenceDay === currentDay;
        break;
      case "monthly":
        shouldCreate = tpl.recurrenceDay === undefined || tpl.recurrenceDay === currentDate;
        break;
    }

    if (!shouldCreate) return tpl;

    // Check if a task with same text+template was already created today
    const alreadyExists = existingTasks.some(
      (t) => t.templateId === tpl.id && t.statusChangedAt > startOfDay(now).getTime()
    );
    if (alreadyExists) return tpl;

    newTasks.push({
      text: tpl.text,
      category: tpl.category,
      subcategory: tpl.subcategory,
      completed: false,
      active: true,
      statusChangedAt: Date.now(),
      templateId: tpl.id,
    });

    changed = true;
    return { ...tpl, lastCreated: today };
  });

  return {
    newTasks,
    updatedTemplates: changed ? updated : null,
  };
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function startOfDay(d: Date): Date {
  const s = new Date(d);
  s.setHours(0, 0, 0, 0);
  return s;
}
