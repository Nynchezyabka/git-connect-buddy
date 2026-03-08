import { useState } from "react";
import { Task, CategoryId, CATEGORIES } from "@/types";
import { useApp } from "@/App";
import { cn } from "@/lib/utils";
import { CategoryIcon } from "@/components/CategoryIcon";
import {
  Play, Eye, EyeOff, Trash2, Check, Undo2, FolderOpen, Plus, X,
} from "lucide-react";

interface Props {
  showArchive: boolean;
  onClose: () => void;
}

export function TaskListPanel({ showArchive, onClose }: Props) {
  const { tasks, setTasks, openTimer, openAddModal } = useApp();

  const source = tasks.filter((t) => (showArchive ? t.completed : !t.completed));

  // Group by category
  const groups = new Map<CategoryId, Task[]>();
  source.forEach((t) => {
    const cat = t.category;
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat)!.push(t);
  });

  const categoryOrder = Array.from(groups.keys()).sort((a, b) => a - b);

  const toggleActive = (id: number) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, active: !t.active, statusChangedAt: Date.now() } : t
      )
    );
  };

  const deleteTask = (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const completeTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: true, statusChangedAt: Date.now() } : t
      )
    );
  };

  const returnTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: false, active: true, statusChangedAt: Date.now() } : t
      )
    );
  };

  const changeCategory = (id: number, newCat: CategoryId) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const updated = { ...t, category: newCat };
        if (t.category === 0 && !t.active && newCat !== 0) {
          updated.active = true;
          updated.statusChangedAt = Date.now();
        }
        if (t.category !== newCat) delete updated.subcategory;
        return updated;
      })
    );
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm mb-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-3xl text-primary">
          {showArchive ? "Выполненные" : "Все задачи"}
        </h2>
        <button onClick={onClose} className="p-2 rounded-md active:bg-muted transition-colors">
          <X size={20} />
        </button>
      </div>

      {categoryOrder.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          {showArchive ? "Нет выполненных задач" : "Нет задач. Добавьте первую!"}
        </p>
      )}

      {categoryOrder.map((cat) => {
        const catTasks = groups.get(cat)!;
        catTasks.sort((a, b) => {
          if (a.active !== b.active) return a.active ? -1 : 1;
          return (a.statusChangedAt || 0) - (b.statusChangedAt || 0);
        });
        const info = CATEGORIES[cat];
        return (
          <div key={cat} className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <CategoryIcon category={cat} size={18} />
              <span className="font-semibold text-sm">{info.name}</span>
              {!showArchive && (
                <button
                  onClick={() => openAddModal(cat)}
                  className="ml-auto p-1 rounded active:bg-muted"
                >
                  <Plus size={14} />
                </button>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              {catTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  showArchive={showArchive}
                  onStart={() => openTimer(task)}
                  onToggle={() => toggleActive(task.id)}
                  onDelete={() => deleteTask(task.id)}
                  onComplete={() => completeTask(task.id)}
                  onReturn={() => returnTask(task.id)}
                  onChangeCategory={(newCat) => changeCategory(task.id, newCat)}
                />
              ))}
            </div>
          </div>
        );
      })}

      <button
        onClick={onClose}
        className="w-full mt-2 py-3 rounded-lg bg-primary text-primary-foreground font-medium active:scale-[0.98] transition-all"
      >
        Скрыть список
      </button>
    </div>
  );
}

interface TaskCardProps {
  task: Task;
  showArchive: boolean;
  onStart: () => void;
  onToggle: () => void;
  onDelete: () => void;
  onComplete: () => void;
  onReturn: () => void;
  onChangeCategory: (cat: CategoryId) => void;
}

function TaskCard({ task, showArchive, onStart, onToggle, onDelete, onComplete, onReturn, onChangeCategory }: TaskCardProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const bgMap: Record<CategoryId, string> = {
    0: "bg-cat-0-bg border-l-4 border-l-cat-0",
    1: "bg-cat-1-bg border-l-4 border-l-cat-1",
    2: "bg-cat-2-bg border-l-4 border-l-cat-2",
    3: "bg-cat-3-bg border-l-4 border-l-cat-3",
    4: "bg-cat-4-bg border-l-4 border-l-cat-4",
    5: "bg-cat-5-bg border-l-4 border-l-cat-5",
  };

  return (
    <div
      className={cn(
        "p-2.5 rounded-md transition-all relative",
        bgMap[task.category],
        !task.active && "opacity-60",
        task.completed && "opacity-70"
      )}
    >
      <div className="flex items-start gap-2">
        <p className={cn("flex-1 text-sm leading-snug break-words", task.completed && "line-through")}>
          {task.text}
          {task.subcategory && (
            <span className="ml-1.5 text-xs opacity-60 italic">({task.subcategory})</span>
          )}
        </p>
        <div className="flex items-center gap-1 shrink-0">
          {!showArchive && (
            <>
              <button
                onClick={onStart}
                className="p-1.5 rounded active:bg-black/10"
                title="Запустить таймер"
              >
                <Play size={14} />
              </button>
              <button
                onClick={onComplete}
                className="p-1.5 rounded active:bg-black/10"
                title="Выполнено"
              >
                <Check size={14} />
              </button>
              <button
                onClick={onToggle}
                className="p-1.5 rounded active:bg-black/10"
                title={task.active ? "Скрыть" : "Показать"}
              >
                {task.active ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </>
          )}
          {showArchive && (
            <button
              onClick={onReturn}
              className="p-1.5 rounded active:bg-black/10"
              title="Вернуть"
            >
              <Undo2 size={14} />
            </button>
          )}
          <button
            onClick={onDelete}
            className="p-1.5 rounded active:bg-black/10"
            title="Удалить"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Category dropdown trigger */}
      {!showArchive && (
        <div className="relative mt-1">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-black/5 active:bg-black/10"
          >
            <FolderOpen size={10} />
            <span>{CATEGORIES[task.category].name}</span>
          </button>
          {showDropdown && (
            <div className="absolute z-50 top-full left-0 mt-1 bg-white rounded-md shadow-lg p-1.5 min-w-[160px]">
              {([0, 1, 2, 5, 3, 4] as CategoryId[]).map((c) => (
                <button
                  key={c}
                  onClick={() => { onChangeCategory(c); setShowDropdown(false); }}
                  className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-muted transition-colors"
                >
                  {CATEGORIES[c].name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
