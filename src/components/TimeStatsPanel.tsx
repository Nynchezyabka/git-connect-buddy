import { useState } from "react";
import { Task, CATEGORIES, CategoryId } from "@/types";
import { useApp } from "@/App";
import { cn } from "@/lib/utils";
import { X, Clock, BarChart3 } from "lucide-react";
import { CategoryIcon } from "@/components/CategoryIcon";

interface Props {
  onClose: () => void;
}

export function TimeStatsPanel({ onClose }: Props) {
  const { tasks } = useApp();
  const [tab, setTab] = useState<"tasks" | "categories">("categories");

  const tasksWithTime = tasks.filter((t) => (t.timeSpent ?? 0) > 0);
  const totalSeconds = tasksWithTime.reduce((s, t) => s + (t.timeSpent ?? 0), 0);

  // Group by category
  const catTotals = new Map<CategoryId, number>();
  tasksWithTime.forEach((t) => {
    catTotals.set(t.category, (catTotals.get(t.category) || 0) + (t.timeSpent ?? 0));
  });

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}ч ${m}м`;
    return `${m}м`;
  };

  const maxCatTime = Math.max(...Array.from(catTotals.values()), 1);

  return (
    <div className="bg-background rounded-lg p-4 shadow-md mb-5 animate-fade-in border border-border">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-2xl text-primary flex items-center gap-2">
          <BarChart3 size={22} /> Статистика времени
        </h2>
        <button onClick={onClose} className="p-2 rounded-md active:bg-muted transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Total */}
      <div className="text-center mb-4 p-3 rounded-lg bg-muted/30">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">Всего потрачено</p>
        <p className="text-3xl font-bold font-display text-primary">
          {totalSeconds > 0 ? formatTime(totalSeconds) : "—"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {tasksWithTime.length} задач с трекингом
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-3">
        <button
          onClick={() => setTab("categories")}
          className={cn("flex-1 text-xs py-1.5 rounded-md transition-all", tab === "categories" ? "bg-primary text-primary-foreground font-semibold" : "bg-muted text-muted-foreground")}
        >
          По категориям
        </button>
        <button
          onClick={() => setTab("tasks")}
          className={cn("flex-1 text-xs py-1.5 rounded-md transition-all", tab === "tasks" ? "bg-primary text-primary-foreground font-semibold" : "bg-muted text-muted-foreground")}
        >
          По задачам
        </button>
      </div>

      {tab === "categories" && (
        <div className="flex flex-col gap-2">
          {Array.from(catTotals.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([cat, seconds]) => (
              <div key={cat} className="flex items-center gap-2">
                <CategoryIcon category={cat} size={14} />
                <span className="text-xs flex-1 truncate">{CATEGORIES[cat].name}</span>
                <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary/60 transition-all"
                    style={{ width: `${(seconds / maxCatTime) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-mono w-12 text-right">{formatTime(seconds)}</span>
              </div>
            ))}
          {catTotals.size === 0 && (
            <p className="text-center text-muted-foreground text-sm py-4">
              Нет данных. Используйте таймер для задач!
            </p>
          )}
        </div>
      )}

      {tab === "tasks" && (
        <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto">
          {tasksWithTime
            .sort((a, b) => (b.timeSpent ?? 0) - (a.timeSpent ?? 0))
            .map((t) => (
              <div key={t.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-muted/30 transition-colors">
                <CategoryIcon category={t.category} size={12} />
                <span className={cn("text-xs flex-1 truncate", t.completed && "line-through opacity-60")}>
                  {t.text}
                </span>
                <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                  <Clock size={10} />
                  {formatTime(t.timeSpent ?? 0)}
                </span>
              </div>
            ))}
          {tasksWithTime.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-4">
              Нет данных. Используйте таймер для задач!
            </p>
          )}
        </div>
      )}

      <button
        onClick={onClose}
        className="w-full mt-3 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium active:scale-[0.98] transition-all"
      >
        Закрыть
      </button>
    </div>
  );
}
