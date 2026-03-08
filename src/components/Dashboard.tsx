import { SECTIONS, CategoryId, CATEGORIES } from "@/types";
import { useApp } from "@/App";
import { cn } from "@/lib/utils";
import {
  CircleCheck, Shield, Smile, GraduationCap, Heart, CircleHelp,
  Dices, Plus,
} from "lucide-react";

const sectionColors: Record<string, string> = {
  mandatory: "bg-cat-1-bg border-t-4 border-t-cat-1",
  security: "bg-cat-2-bg border-t-4 border-t-cat-2",
  joys: "bg-cat-3-bg border-t-4 border-t-cat-3",
};

interface Props {
  onRandomTask: (categories: CategoryId[]) => void;
}

export function Dashboard({ onRandomTask }: Props) {
  const { tasks, openAddModal } = useApp();

  const countActive = (cats: CategoryId[]) =>
    tasks.filter((t) => cats.includes(t.category) && t.active && !t.completed).length;

  const countCompleted = (cats: CategoryId[]) =>
    tasks.filter((t) => cats.includes(t.category) && t.completed).length;

  const countTotal = (cats: CategoryId[]) =>
    tasks.filter((t) => cats.includes(t.category)).length;

  return (
    <div className="flex flex-col gap-3">
      {SECTIONS.map((section, idx) => {
        const active = countActive(section.categories);
        const completed = countCompleted(section.categories);
        const total = countTotal(section.categories);
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
        return (
          <div
            key={section.sectionClass}
            className={cn(
              "rounded-lg shadow-sm p-5 relative overflow-hidden cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm animate-fade-in",
              sectionColors[section.sectionClass]
            )}
            style={{ animationDelay: `${idx * 80}ms`, animationFillMode: "both" }}
            onClick={() => onRandomTask(section.categories)}
          >
            <h2 className="font-display text-2xl text-center leading-tight">
              {section.title}
            </h2>
            <div className="flex justify-center gap-4 text-xs font-semibold text-foreground/70 mt-2">
              <span>Активных: {active}</span>
              <span>Выполнено: {completed}</span>
            </div>
            {total > 0 && (
              <div className="mt-2 mx-auto max-w-[200px]">
                <div className="h-1.5 rounded-full bg-black/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-foreground/40 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-[10px] text-center text-foreground/50 mt-0.5">{progress}%</p>
              </div>
            )}
            <div className="flex justify-center gap-2 mt-3">
              <button
                onClick={(e) => { e.stopPropagation(); onRandomTask(section.categories); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/50 text-sm font-medium active:scale-95 hover:bg-white/70 transition-all"
              >
                <Dice5 size={16} />
                <span>случайная задача</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); openAddModal(section.categories[0], section.categories); }}
                className="flex items-center justify-center w-8 h-8 rounded-md bg-white/50 active:scale-95 hover:bg-white/70 transition-all"
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
