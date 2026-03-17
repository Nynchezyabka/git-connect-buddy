import { useState } from "react";
import {
  Home, List, Archive, CalendarDays, Repeat, Download, Upload,
  ChevronLeft, ChevronRight, Info, Bell, BellOff, BellRing,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  sendNotification,
} from "@/lib/notifications";
import { toast } from "sonner";

export type PageId = "home" | "tasks" | "archive" | "history" | "templates" | "info";

interface Props {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  
}

const NAV_ITEMS: { id: PageId; label: string; icon: React.ReactNode }[] = [
  { id: "home", label: "Главная", icon: <Home size={20} /> },
  { id: "tasks", label: "Все задачи", icon: <List size={20} /> },
  { id: "archive", label: "Архив", icon: <Archive size={20} /> },
  { id: "history", label: "История", icon: <CalendarDays size={20} /> },
  { id: "templates", label: "Шаблоны", icon: <Repeat size={20} /> },
];

function NotificationSidebarButton({ expanded }: { expanded: boolean }) {
  const [permission, setPermission] = useState<NotificationPermission>(
    getNotificationPermission()
  );

  if (!isNotificationSupported()) return null;

  const handleClick = async () => {
    if (permission === "granted") {
      sendNotification("🎁 КОРОБОЧКА", { body: "Уведомления работают!" });
      toast.success("Уведомления включены");
      return;
    }
    if (permission === "denied") {
      toast.error("Уведомления заблокированы в настройках браузера");
      return;
    }
    const granted = await requestNotificationPermission();
    setPermission(granted ? "granted" : "denied");
    if (granted) {
      toast.success("Уведомления включены!");
      sendNotification("🎁 КОРОБОЧКА", { body: "Теперь вы будете получать напоминания" });
    } else {
      toast.error("Разрешение не получено");
    }
  };

  const Icon = permission === "granted" ? BellRing : permission === "denied" ? BellOff : Bell;
  const label = permission === "granted" ? "Уведомления вкл." : permission === "denied" ? "Уведомления выкл." : "Уведомления";

  return (
    <button
      onClick={handleClick}
      title={!expanded ? label : undefined}
      className={cn(
        "flex items-center gap-3 rounded-lg transition-all text-sm font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground",
        expanded ? "px-3 py-2.5" : "justify-center py-2.5 px-0"
      )}
    >
      <span className="shrink-0"><Icon size={20} /></span>
      {expanded && <span className="truncate">{label}</span>}
    </button>
  );
}

export function AppSidebar({ currentPage, onNavigate, onExport, onImport, onShowInfo }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full z-[100] flex flex-col bg-background border-r border-border shadow-lg transition-all duration-300 ease-in-out",
        expanded ? "w-52" : "w-12"
      )}
    >
      {/* Toggle button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-center h-12 hover:bg-muted/60 transition-colors shrink-0 border-b border-border"
        aria-label={expanded ? "Свернуть меню" : "Развернуть меню"}
      >
        {expanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-0.5 p-1 pt-2">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            title={!expanded ? item.label : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg transition-all text-sm font-medium",
              expanded ? "px-3 py-2.5" : "justify-center py-2.5 px-0",
              currentPage === item.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
          >
            <span className="shrink-0">{item.icon}</span>
            {expanded && <span className="truncate">{item.label}</span>}
          </button>
        ))}

        <div className="border-t border-border my-2" />

        {/* Export */}
        <button
          onClick={onExport}
          title={!expanded ? "Скачать задачи" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-lg transition-all text-sm font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            expanded ? "px-3 py-2.5" : "justify-center py-2.5 px-0"
          )}
        >
          <span className="shrink-0"><Download size={20} /></span>
          {expanded && <span className="truncate">Скачать задачи</span>}
        </button>

        {/* Import */}
        <label
          title={!expanded ? "Загрузить из файла" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-lg transition-all text-sm font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground cursor-pointer",
            expanded ? "px-3 py-2.5" : "justify-center py-2.5 px-0"
          )}
        >
          <span className="shrink-0"><Upload size={20} /></span>
          {expanded && <span className="truncate">Загрузить из файла</span>}
          <input
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onImport(f);
              e.target.value = "";
            }}
          />
        </label>

        <div className="border-t border-border my-2" />

        {/* Info */}
        <button
          onClick={onShowInfo}
          title={!expanded ? "О приложении" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-lg transition-all text-sm font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            expanded ? "px-3 py-2.5" : "justify-center py-2.5 px-0"
          )}
        >
          <span className="shrink-0"><Info size={20} /></span>
          {expanded && <span className="truncate">О приложении</span>}
        </button>

        {/* Notifications */}
        <NotificationSidebarButton expanded={expanded} />
      </nav>
    </aside>
  );
}
