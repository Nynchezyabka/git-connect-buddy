import { useState, useEffect } from "react";
import {
  Home, List, Archive, CalendarDays, Repeat, Download, Upload,
  ChevronLeft, ChevronRight, Info, Bell, BellOff, BellRing, Type,
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
  { id: "history", label: "Календарь", icon: <CalendarDays size={20} /> },
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

const FONT_SIZE_KEY = "app_font_scale";
const FONT_SIZES = [
  { label: "S", value: 0.9 },
  { label: "M", value: 1.0 },
  { label: "L", value: 1.15 },
  { label: "XL", value: 1.3 },
];

function applyFontScale(scale: number) {
  document.documentElement.style.fontSize = `${scale * 100}%`;
}

function FontSizeControl({ expanded }: { expanded: boolean }) {
  const [scale, setScale] = useState<number>(() => {
    const saved = parseFloat(localStorage.getItem(FONT_SIZE_KEY) || "1");
    return isNaN(saved) ? 1 : saved;
  });

  useEffect(() => {
    applyFontScale(scale);
    localStorage.setItem(FONT_SIZE_KEY, String(scale));
  }, [scale]);

  if (!expanded) {
    return (
      <button
        onClick={() => {
          const idx = FONT_SIZES.findIndex((s) => s.value === scale);
          const next = FONT_SIZES[(idx + 1) % FONT_SIZES.length];
          setScale(next.value);
        }}
        title="Размер шрифта"
        className="flex items-center justify-center py-2.5 px-0 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all"
      >
        <Type size={20} />
      </button>
    );
  }

  return (
    <div className="px-3 py-2">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1.5">
        <Type size={14} />
        <span>Размер шрифта</span>
      </div>
      <div className="flex gap-1">
        {FONT_SIZES.map((s) => (
          <button
            key={s.label}
            onClick={() => setScale(s.value)}
            className={cn(
              "flex-1 py-1 rounded-md text-xs font-semibold border transition-all",
              scale === s.value
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:bg-muted/60"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function AppSidebar({ currentPage, onNavigate, onExport, onImport }: Props) {
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

        {/* Info - as nav item */}
        <button
          onClick={() => onNavigate("info")}
          title={!expanded ? "О приложении" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-lg transition-all text-sm font-medium",
            expanded ? "px-3 py-2.5" : "justify-center py-2.5 px-0",
            currentPage === "info"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          )}
        >
          <span className="shrink-0"><Info size={20} /></span>
          {expanded && <span className="truncate">О приложении</span>}
        </button>

        {/* Notifications */}
        <NotificationSidebarButton expanded={expanded} />

        <div className="border-t border-border my-2" />

        {/* Font size */}
        <FontSizeControl expanded={expanded} />
      </nav>
    </aside>
  );
}
