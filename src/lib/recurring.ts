import { Task, TaskTemplate } from "@/types";

/**
 * Compute next occurrence timestamp for a template, strictly after `from`.
 */
export function nextOccurrence(tpl: TaskTemplate, from: Date = new Date()): number {
  const candidate = new Date(from);
  candidate.setSeconds(0, 0);
  candidate.setMinutes(0);
  candidate.setHours(tpl.recurrenceHour);

  // advance by 1 day until we satisfy the rule and are strictly after `from`
  for (let i = 0; i < 366; i++) {
    if (candidate.getTime() > from.getTime()) {
      switch (tpl.recurrence) {
        case "daily":
          return candidate.getTime();
        case "weekly":
          if (tpl.recurrenceDay === undefined || candidate.getDay() === tpl.recurrenceDay) {
            return candidate.getTime();
          }
          break;
        case "monthly":
          if (tpl.recurrenceDay === undefined || candidate.getDate() === tpl.recurrenceDay) {
            return candidate.getTime();
          }
          break;
      }
    }
    candidate.setDate(candidate.getDate() + 1);
  }
  return candidate.getTime();
}

/**
 * Create the next pending instance of a template (called when current instance is completed).
 */
export function createNextInstance(tpl: TaskTemplate, from: Date = new Date()): Omit<Task, "id"> {
  const next = nextOccurrence(tpl, from);
  return {
    text: tpl.text,
    category: tpl.category,
    subcategory: tpl.subcategory,
    completed: false,
    active: true,
    statusChangedAt: Date.now(),
    templateId: tpl.id,
    scheduledFor: next,
  };
}

/**
 * Safety net: if the app wasn't open for several days, ensure each active template
 * has at least one pending (non-completed) task. Also handles initial seeding.
 */
export function processRecurringTemplates(
  templates: TaskTemplate[],
  existingTasks: Task[]
): { newTasks: Omit<Task, "id">[]; updatedTemplates: TaskTemplate[] | null } {
  const now = new Date();
  const today = toDateStr(now);

  const newTasks: Omit<Task, "id">[] = [];
  let changed = false;

  const updated = templates.map((tpl) => {
    if (!tpl.active) return tpl;

    // If a pending (uncompleted) instance for this template already exists — skip
    const hasPending = existingTasks.some(
      (t) => t.templateId === tpl.id && !t.completed
    );
    if (hasPending) return tpl;

    // Otherwise create the next instance
    newTasks.push(createNextInstance(tpl, now));
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
