import { useState, useEffect } from "react";
import { SECTIONS, CategoryId } from "@/types";
import { useApp } from "@/App";
import { cn } from "@/lib/utils";
import { Dices, Plus } from "lucide-react";

const sectionColors: Record<string, string> = {
  mandatory: "bg-cat-1-bg border-t-[8px] border-t-cat-1",
  security: "bg-cat-2-bg border-t-[8px] border-t-cat-2",
  joys: "bg-cat-3-bg border-t-[8px] border-t-cat-3",
};

const LAST_ACTIVITY_KEY = "section_last_activity";

function getLastActivity(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(LAST_ACTIVITY_KEY) || "{}");
  } catch { return {}; }
}

function setLastActivity(sectionClass: string) {
  const data = getLastActivity();
  data[sectionClass] = Date.now();
  localStorage.setItem(LAST_ACTIVITY_KEY, JSON.stringify(data));
}

function formatRelativeTime(timestamp: number | undefined): string | null {
  if (!timestamp) return null;
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffDays === 0 && diffHours < 1) return "только что ✓";
  if (diffDays === 0) return "сегодня ✓";
  if (diffDays === 1) return "вчера";
  if (diffDays < 5) return `${diffDays} дня назад`;
  if (diffDays < 21) return `${diffDays} дней назад`;
  return `${diffDays} дн. назад`;
}

interface Props {
  onRandomTask: (categories: CategoryId[]) => void;
}

export function Dashboard({ onRandomTask }: Props) {
  const { tasks, openAddModal } = useApp();
  const [activity, setActivity] = useState<Record<string, number>>(getLastActivity);

  // Refresh relative time every minute
  useEffect(() => {
    const interval = setInterval(() => setActivity(getLastActivity()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const countActive = (cats: CategoryId[]) =>
    tasks.filter((t) => cats.includes(t.category) && t.active && !t.completed).length;

  const handleRandomTask = (sectionClass: string, categories: CategoryId[]) => {
    setLastActivity(sectionClass);
    setActivity(getLastActivity());
    onRandomTask(categories);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {SECTIONS.map((section, idx) => {
        const active = countActive(section.categories);
        const lastTs = activity[section.sectionClass];
        const relativeTime = formatRelativeTime(lastTs);
        const daysSince = lastTs ? Math.floor((Date.now() - lastTs) / (1000 * 60 * 60 * 24)) : Infinity;
        const needsAttention = daysSince >= 2;

        return (
          <div
            key={section.sectionClass}
            className={cn(
              "rounded-lg shadow-sm p-5 relative overflow-hidden cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm animate-fade-in aspect-auto sm:aspect-square flex flex-col items-center justify-center",
              sectionColors[section.sectionClass],
              needsAttention && "ring-2 ring-foreground/10"
            )}
            style={{ animationDelay: `${idx * 80}ms`, animationFillMode: "both" }}
            onClick={() => handleRandomTask(section.sectionClass, section.categories)}
          >
            {/* Subtle attention dot */}
            {needsAttention && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-foreground/20" />
            )}

            <h2 className="font-display text-2xl sm:text-xl md:text-2xl text-center leading-tight">
              {section.title}
            </h2>
            <div className="flex justify-center text-sm sm:text-xs font-semibold text-foreground/70 mt-2">
              <span>Активных: {active}</span>
            </div>

            {/* Last activity hint */}
            <div className="text-xs text-foreground/50 mt-1 h-4 text-center">
              {relativeTime ? `была ${relativeTime}` : "ещё не открывалась"}
            </div>

            <div className="flex justify-center gap-2 mt-3">
              <button
                onClick={(e) => { e.stopPropagation(); handleRandomTask(section.sectionClass, section.categories); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/50 dark:bg-white/20 text-sm sm:text-xs font-medium active:scale-95 hover:bg-white/70 dark:hover:bg-white/30 transition-all"
              >
                <Dices size={16} />
                <span>случайная задача</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); openAddModal(section.categories[0], section.categories); }}
                className="flex items-center justify-center w-8 h-8 rounded-md bg-white/50 dark:bg-white/20 active:scale-95 hover:bg-white/70 dark:hover:bg-white/30 transition-all"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
