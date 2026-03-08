import { useState, useRef, useEffect } from "react";
import { CategoryId, CATEGORIES, DEFAULT_SUBCATEGORIES } from "@/types";
import { getCustomSubcategories, saveCustomSubcategories } from "@/lib/taskStore";
import { cn } from "@/lib/utils";
import { X, Plus } from "lucide-react";

interface Props {
  defaultCategory: CategoryId;
  restrictCategories: CategoryId[] | null;
  onAdd: (text: string, category: CategoryId, subcategory?: string) => void;
  onClose: () => void;
}

export function AddTaskModal({ defaultCategory, restrictCategories, onAdd, onClose }: Props) {
  const [text, setText] = useState("");
  const [category, setCategory] = useState<CategoryId>(defaultCategory);
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textRef.current?.focus();
  }, []);

  const cats = restrictCategories ?? ([0, 1, 2, 5, 3, 4] as CategoryId[]);

  const catBgMap: Record<CategoryId, string> = {
    0: "bg-cat-0-bg",
    1: "bg-cat-1-bg",
    2: "bg-cat-2-bg",
    3: "bg-cat-3-bg",
    4: "bg-cat-4-bg",
    5: "bg-cat-5-bg",
  };

  const catBorderMap: Record<CategoryId, string> = {
    0: "border-cat-0",
    1: "border-cat-1",
    2: "border-cat-2",
    3: "border-cat-3",
    4: "border-cat-4",
    5: "border-cat-5",
  };

  const handleSubmit = () => {
    if (!text.trim()) return;
    onAdd(text, category);
    setText("");
    textRef.current?.focus();
  };

  return (
    <div className="fixed inset-0 z-[10100] flex items-center justify-center bg-black/40 p-4">
      <div
        className={cn(
          "w-full max-w-md rounded-xl p-5 shadow-lg relative",
          catBgMap[category]
        )}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-md active:bg-black/10"
        >
          <X size={18} />
        </button>

        <h3 className="font-display text-2xl text-foreground mb-3">Добавить задачу</h3>

        <textarea
          ref={textRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Введите задачу или несколько (каждая с новой строки)..."
          className="w-full min-h-[100px] p-3 rounded-lg border border-border bg-white/70 resize-y text-sm"
        />

        {/* Category picker */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "text-xs px-2.5 py-1.5 rounded-full border-2 transition-all font-medium",
                catBgMap[c],
                category === c
                  ? cn(catBorderMap[c], "shadow-sm")
                  : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              {CATEGORIES[c].name}
            </button>
          ))}
        </div>

        <div className="flex gap-2.5 mt-4">
          <button
            onClick={handleSubmit}
            className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium active:scale-[0.98] transition-all"
          >
            Добавить
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg bg-muted text-muted-foreground font-medium active:scale-[0.98] transition-all"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
