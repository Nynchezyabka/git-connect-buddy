import { useState, useCallback, useEffect, createContext, useContext } from "react";
import { Task, TaskTemplate, CategoryId } from "@/types";
import { initTaskStore, loadTasks, saveTasks, getNextId, exportTasksToFile, importTasksFromFile } from "@/lib/taskStore";
import { dbGetMeta, dbSetMeta } from "@/lib/db";
import { Dashboard } from "@/components/Dashboard";
import { TaskListPanel } from "@/components/TaskListPanel";
import { TimerScreen } from "@/components/TimerScreen";
import { AddTaskModal } from "@/components/AddTaskModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { InfoPage } from "@/components/InfoPage";
import { TemplatesPanel } from "@/components/TemplatesPanel";
import { AppSidebar, PageId } from "@/components/AppSidebar";
import { HistoryModal } from "@/components/HistoryModal";
import { OnboardingScreen } from "@/components/OnboardingScreen";
import { processRecurringTemplates } from "@/lib/recurring";
import { toast } from "sonner";

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
  const [currentPage, setCurrentPage] = useState<PageId>("home");
  const [timerTask, setTimerTask] = useState<Task | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalCategory, setAddModalCategory] = useState<CategoryId>(0);
  const [addModalRestrict, setAddModalRestrict] = useState<CategoryId[] | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  // Initialize IndexedDB and load tasks + templates
  useEffect(() => {
    Promise.all([
      initTaskStore(),
      dbGetMeta<TaskTemplate[]>("templates"),
    ]).then(([loaded, tpls]) => {
      setTasksRaw(loaded);
      setTemplatesRaw(tpls ?? []);
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

  const renderPage = () => {
    switch (currentPage) {
      case "tasks":
        return <TaskListPanel showArchive={false} />;
      case "archive":
        return <TaskListPanel showArchive={true} />;
      case "history":
        return <HistoryModal />;
      case "templates":
        return <TemplatesPanel templates={templates} onSave={saveTemplates} />;
      default:
        return <Dashboard onRandomTask={handleRandomTask} />;
    }
  };

  return (
    <AppContext.Provider value={ctx}>
      <AppSidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onExport={handleExport}
        onImport={handleImport}
        onShowInfo={() => setShowInfo(true)}
      />

      <div className="ml-12 transition-all duration-300">
        <div className="max-w-4xl mx-auto p-2.5">
          {/* Header */}
          <header className="text-center mb-4 pt-1 relative">
            <div className="absolute right-0 top-1 flex items-center gap-1.5 z-10">
              <ThemeToggle />
            </div>
            <h1 className="font-display text-2xl sm:text-4xl text-primary drop-shadow-sm animate-fade-in px-10">
              🎁 КОРОБОЧКА 5.0
            </h1>
          </header>

          {/* Page content */}
          {renderPage()}
        </div>
      </div>

      {/* Info modal */}
      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}

      {/* Timer (stays modal) */}
      {timerTask && (
        <TimerScreen task={timerTask} onClose={() => setTimerTask(null)} />
      )}

      {/* Add modal (stays modal) */}
      {addModalOpen && (
        <AddTaskModal
          defaultCategory={addModalCategory}
          restrictCategories={addModalRestrict}
          onAdd={handleAddTask}
          onClose={() => setAddModalOpen(false)}
        />
      )}
    </AppContext.Provider>
  );
}

// Inline info modal (content from InfoButton)
function InfoModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[10050] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-background rounded-2xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 relative animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-muted text-muted-foreground hover:bg-accent transition-colors"
        >
          ✕
        </button>

        <h2 className="text-2xl font-display text-primary mb-4">🎁 КОРОБОЧКА</h2>

        <div className="space-y-4 text-sm sm:text-base text-foreground/90 leading-relaxed">
          <section>
            <h3 className="font-semibold text-base sm:text-lg mb-1">📖 История и цель</h3>
            <p>
              КОРОБОЧКА создана по мотивам методики психолога Виолетты Макеевой как инструмент мотивационной гигиены.
              Это инструмент «лайтовой» самодисциплины, где вы сами определяете содержание и можете сделать паузу в любой момент.
            </p>
          </section>
          <section>
            <h3 className="font-semibold text-base sm:text-lg mb-1">🗂️ Категории</h3>
            <ul className="space-y-1 list-none">
              <li>🟨 <strong>Обязательные дела</strong> — срочные и важные задачи</li>
              <li>🟦 <strong>Безопасность</strong> — забота о базовых потребностях</li>
              <li>🟩 <strong>Простые радости</strong> — приятные мелочи</li>
              <li>🟥 <strong>Эго-радости</strong> — статус и признание</li>
              <li>🩵 <strong>Доступность простых радостей</strong> — условия для радостей</li>
            </ul>
          </section>
          <section>
            <h3 className="font-semibold text-base sm:text-lg mb-1">🔄 Как пользоваться</h3>
            <ol className="list-decimal list-inside space-y-1.5">
              <li>Добавьте задачи в категории (кнопка «+» на секции или в списке)</li>
              <li>Нажмите на секцию или «🎲 случайная задача» — получите задачу</li>
              <li>Работайте по таймеру (время настраивается)</li>
              <li>Отметьте результат: ✅ Готово или 🔄 Вернуть в коробочку</li>
              <li>Отслеживайте прогресс в разделе «📊 История»</li>
            </ol>
          </section>
          <p className="text-xs sm:text-sm text-muted-foreground pt-2 border-t border-border">
            Все данные хранятся только на вашем устройстве. Без регистрации, бесплатно, конфиденциально.
          </p>
        </div>
      </div>
    </div>
  );
}
