import { SECTIONS, CategoryId, CATEGORIES } from "@/types";
import { useApp } from "@/App";
import { cn } from "@/lib/utils";
import {
  CircleCheck, Shield, Smile, GraduationCap, Heart, CircleHelp,
  Dice5, Plus,
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

  return (
    <div className="flex flex-col gap-3">
      {SECTIONS.map((section) => {
        const count = countActive(section.categories);
        return (
          <div
            key={section.sectionClass}
            className={cn(
              "rounded-lg shadow-sm p-5 relative overflow-hidden cursor-pointer transition-all active:translate-y-[-2px] active:shadow-md",
              sectionColors[section.sectionClass]
            )}
            onClick={() => onRandomTask(section.categories)}
          >
            <h2 className="font-display text-2xl text-center leading-tight">
              {section.title}
            </h2>
            <div className="text-center text-sm font-semibold text-foreground/70 mt-2">
              Активных: {count}
            </div>
            <div className="flex justify-center gap-2 mt-3">
              <button
                onClick={(e) => { e.stopPropagation(); onRandomTask(section.categories); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/50 text-sm font-medium active:scale-95 transition-all"
              >
                <Dice5 size={16} />
                <span>случайная задача</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); openAddModal(section.categories[0], section.categories); }}
                className="flex items-center justify-center w-8 h-8 rounded-md bg-white/50 active:scale-95 transition-all"
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
