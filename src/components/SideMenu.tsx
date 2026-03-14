import { useState } from "react";
import { Menu, X, List, Archive, BarChart3, Download, Upload, Repeat } from "lucide-react";

interface Props {
  onShowTasks: () => void;
  onShowArchive: () => void;
  onShowHistory: () => void;
  onShowTemplates: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

export function SideMenu({ onShowTasks, onShowArchive, onShowHistory, onShowTemplates, onExport, onImport }: Props) {
  const [open, setOpen] = useState(false);

  const handle = (fn: () => void) => {
    fn();
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-md hover:bg-muted active:bg-muted/80 transition-colors"
        aria-label="Меню"
      >
        <Menu size={22} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[10060] flex" onClick={() => setOpen(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Panel */}
          <div
            className="relative ml-auto w-72 max-w-[85vw] h-full bg-background shadow-2xl animate-slide-in-right flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="font-display text-xl text-primary">Меню</span>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-full bg-muted hover:bg-border transition-colors">
                <X size={18} />
              </button>
            </div>

            <nav className="flex-1 p-3 flex flex-col gap-1.5">
              <MenuItem icon={<List size={18} />} label="Все задачи" onClick={() => handle(onShowTasks)} />
              <MenuItem icon={<Archive size={18} />} label="Архив" onClick={() => handle(onShowArchive)} />
              <MenuItem icon={<BarChart3 size={18} />} label="История" onClick={() => handle(onShowHistory)} />
              <MenuItem icon={<Repeat size={18} />} label="Шаблоны" onClick={() => handle(onShowTemplates)} />

              <div className="border-t border-border my-2" />

              <MenuItem icon={<Download size={18} />} label="Скачать задачи" onClick={() => handle(onExport)} />

              <label className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted/60 active:bg-muted transition-colors cursor-pointer">
                <Upload size={18} />
                Загрузить из файла
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) { onImport(f); setOpen(false); }
                    e.target.value = "";
                  }}
                />
              </label>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

function MenuItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted/60 active:bg-muted transition-colors text-left w-full"
    >
      {icon}
      {label}
    </button>
  );
}
