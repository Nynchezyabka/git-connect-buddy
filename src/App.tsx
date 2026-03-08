import { useState, useCallback, useEffect, createContext, useContext } from "react";
import { Task, TaskTemplate, CategoryId } from "@/types";
import { initTaskStore, loadTasks, saveTasks, getNextId, exportTasksToFile, importTasksFromFile } from "@/lib/taskStore";
import { dbGetMeta, dbSetMeta } from "@/lib/db";
import { Dashboard } from "@/components/Dashboard";
import { TaskListPanel } from "@/components/TaskListPanel";
import { TimerScreen } from "@/components/TimerScreen";
import { AddTaskModal } from "@/components/AddTaskModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationButton } from "@/components/NotificationButton";
import { InfoButton } from "@/components/InfoButton";
import { TemplatesPanel } from "@/components/TemplatesPanel";
import { HistoryModal } from "@/components/HistoryModal";
import { OnboardingScreen } from "@/components/OnboardingScreen";
import { processRecurringTemplates } from "@/lib/recurring";
import { toast } from "sonner";
import { Repeat } from "lucide-react";

interface AppContextValue {
  tasks: Task[];
  setTasks: (fn: (prev: Task[]) => Task[]) => void;
  openTimer: (task: Task) => void;
  openAddModal: (category?: CategoryId, restrictCategories?: CategoryId[]) => void;
}

export const AppContext = createContext<AppContextValue>(null!);
export const useApp = () => useContext(AppContext);

export default function App() {
  const [tasks, setTasksRaw] = useState<Task[]>([]);
  const [templates, setTemplatesRaw] = useState<TaskTemplate[]>([]);
  const [ready, setReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [timerTask, setTimerTask] = useState<Task | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalCategory, setAddModalCategory] = useState<CategoryId>(0);
  const [addModalRestrict, setAddModalRestrict] = useState<CategoryId[] | null>(null);

  // Initialize IndexedDB and load tasks + templates
  useEffect(() => {
    Promise.all([
      initTaskStore(),
      dbGetMeta<TaskTemplate[]>("templates"),
    ]).then(([loaded, tpls]) => {
      setTasksRaw(loaded);
      setTemplatesRaw(tpls ?? []);

      // Check onboarding
      if (!localStorage.getItem("onboarding_done") && loaded.length === 0) {
        setShowOnboarding(true);
      }

      setReady(true);
    });
  }, []);

  // Process recurring templates on load and every 30 minutes
  useEffect(() => {
    if (!ready || templates.length === 0) return;

    const process = () => {
      const { newTasks, updatedTemplates } = processRecurringTemplates(templates, tasks);
      if (newTasks.length > 0) {
        let nextId = getNextId(tasks);
        const tasksToAdd = newTasks.map((t) => ({ ...t, id: nextId++ }));
        setTasks((prev) => [...prev, ...tasksToAdd]);
        toast.info(`Создано ${newTasks.length} задач по шаблонам`);
      }
      if (updatedTemplates) {
        setTemplatesRaw(updatedTemplates);
        dbSetMeta("templates", updatedTemplates);
      }
    };

    process();
    const interval = setInterval(process, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [ready, templates.length]); // eslint-disable-line

  const setTasks = useCallback((fn: (prev: Task[]) => Task[]) => {
    setTasksRaw((prev) => {
      const next = fn(prev);
      saveTasks(next);
      return next;
    });
  }, []);

  const saveTemplates = useCallback((tpls: TaskTemplate[]) => {
    setTemplatesRaw(tpls);
    dbSetMeta("templates", tpls);
  }, []);

  const openTimer = useCallback((task: Task) => {
    setTimerTask(task);
  }, []);

  const openAddModal = useCallback((category?: CategoryId, restrictCategories?: CategoryId[]) => {
    setAddModalCategory(category ?? 0);
    setAddModalRestrict(restrictCategories ?? null);
    setAddModalOpen(true);
  }, []);

  const handleAddTask = useCallback((text: string, category: CategoryId, subcategory?: string) => {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return;
    setTasks((prev) => {
      let nextId = getNextId(prev);
      const newTasks = lines.map((line) => {
        const t: Task = {
          id: nextId++,
          text: line,
          category,
          completed: false,
          active: true,
          statusChangedAt: Date.now(),
        };
        if (subcategory) t.subcategory = subcategory;
        return t;
      });
      return [...prev, ...newTasks];
    });
    toast.success(`Добавлено ${lines.length} задач(и)`);
  }, [setTasks]);

  const handleRandomTask = useCallback((categories: CategoryId[]) => {
    const active = tasks.filter(
      (t) => categories.includes(t.category) && t.active && !t.completed
    );
    if (active.length === 0) {
      toast.info("Нет активных задач в этой категории!");
      return;
    }
    const task = active[Math.floor(Math.random() * active.length)];
    openTimer(task);
  }, [tasks, openTimer]);

  const handleExport = useCallback(() => {
    exportTasksToFile(tasks);
    toast.success("Задачи экспортированы");
  }, [tasks]);

  const handleImport = useCallback(async (file: File) => {
    try {
      const imported = await importTasksFromFile(file);
      setTasks(() => imported);
      toast.success(`Импортировано ${imported.length} задач`);
    } catch (err: any) {
      toast.error(err.message);
    }
  }, [setTasks]);

  const ctx: AppContextValue = { tasks, setTasks, openTimer, openAddModal };

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-primary animate-pulse text-xl font-display">🎁 Загрузка...</div>
      </div>
    );
  }

  if (showOnboarding) {
    return <OnboardingScreen onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <AppContext.Provider value={ctx}>
      <div className="max-w-4xl mx-auto p-2.5">
        {/* Header */}
        <header className="text-center mb-4 pt-1 relative">
          <div className="absolute left-0 top-1 z-10">
            <InfoButton />
          </div>
          <div className="absolute right-0 top-1 flex items-center gap-1.5 z-10">
            <NotificationButton />
            <ThemeToggle />
          </div>
          <h1 className="font-display text-4xl text-primary drop-shadow-sm animate-fade-in px-10">
            🎁 КОРОБОЧКА 5.0
          </h1>
        </header>

        {/* Dashboard sections */}
        <Dashboard onRandomTask={handleRandomTask} />

        {/* Controls */}
        <div className="flex flex-col gap-2.5 my-5">
          <button
            onClick={() => { setShowArchive(false); setShowTasks(true); setShowTemplates(false); setShowHistory(false); }}
            className="w-full py-3 px-4 rounded-lg bg-primary text-primary-foreground font-medium shadow-sm active:scale-[0.98] transition-all"
          >
            Все задачи
          </button>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => { setShowHistory(true); setShowTasks(false); setShowTemplates(false); }}
              className="py-3 px-4 rounded-lg bg-primary text-primary-foreground font-medium shadow-sm active:scale-[0.98] transition-all"
            >
              📊 История
            </button>
            <button
              onClick={handleExport}
              className="py-3 px-4 rounded-lg bg-primary text-primary-foreground font-medium shadow-sm active:scale-[0.98] transition-all"
            >
              Скачать задачи
            </button>
          </div>
          <button
            onClick={() => { setShowTemplates(true); setShowTasks(false); setShowHistory(false); }}
            className="w-full py-3 px-4 rounded-lg bg-muted text-muted-foreground font-medium shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Repeat size={16} /> Шаблоны
          </button>
          <label className="w-full py-3 px-4 rounded-lg bg-muted text-muted-foreground font-medium text-center cursor-pointer shadow-sm active:scale-[0.98] transition-all">
            📂 Загрузить из файла
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleImport(f);
                e.target.value = "";
              }}
            />
          </label>
        </div>

        {/* Templates panel */}
        {showTemplates && (
          <TemplatesPanel
            templates={templates}
            onSave={saveTemplates}
            onClose={() => setShowTemplates(false)}
          />
        )}

        {/* History modal */}
        {showHistory && (
          <HistoryModal onClose={() => setShowHistory(false)} />
        )}

        {/* Task list panel */}
        {showTasks && (
          <TaskListPanel
            showArchive={showArchive}
            onClose={() => setShowTasks(false)}
          />
        )}

        {/* Timer */}
        {timerTask && (
          <TimerScreen task={timerTask} onClose={() => setTimerTask(null)} />
        )}

        {/* Add modal */}
        {addModalOpen && (
          <AddTaskModal
            defaultCategory={addModalCategory}
            restrictCategories={addModalRestrict}
            onAdd={handleAddTask}
            onClose={() => setAddModalOpen(false)}
          />
        )}
      </div>
    </AppContext.Provider>
  );
}
