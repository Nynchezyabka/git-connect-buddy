import { useState } from "react";
import { Info, X } from "lucide-react";

export function InfoButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-full bg-muted text-muted-foreground hover:bg-accent transition-colors"
        aria-label="О приложении"
      >
        <Info size={18} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setOpen(false)}>
          <div
            className="bg-background rounded-2xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-muted text-muted-foreground hover:bg-accent transition-colors"
            >
              <X size={18} />
            </button>

            <h2 className="text-2xl font-display text-primary mb-4">🎁 КОРОБОЧКА</h2>

            <div className="space-y-4 text-sm text-foreground/90 leading-relaxed">
              <section>
                <h3 className="font-semibold text-base mb-1">📖 История и цель</h3>
                <p>
                  КОРОБОЧКА создана по мотивам методики психолога Виолетты Макеевой как инструмент мотивационной гигиены.
                  Это инструмент «лайтовой» самодисциплины, где вы сами определяете содержание и можете сделать паузу в любой момент.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-1">🗂️ Категории</h3>
                <ul className="space-y-1 list-none">
                  <li>🟨 <strong>Обязательные дела</strong> — срочные и важные задачи</li>
                  <li>🟦 <strong>Безопасность</strong> — забота о базовых потребностях</li>
                  <li>🟩 <strong>Простые радости</strong> — приятные мелочи</li>
                  <li>🟥 <strong>Эго-радости</strong> — статус и признание</li>
                  <li>🩵 <strong>Доступность простых радостей</strong> — условия для радостей</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-1">⚡ Возможности</h3>
                <ul className="space-y-1 list-none">
                  <li>✅ Случайный выбор задач — как вытягивание бумажки из коробки</li>
                  <li>⏱️ Таймер для фокусировки</li>
                  <li>🔄 Повторяющиеся шаблоны — ежедневные, еженедельные, ежемесячные</li>
                  <li>📊 Статистика по затраченному времени</li>
                  <li>📝 Гибкое управление — добавляйте, перемещайте, скрывайте задачи</li>
                  <li>💾 Автономная работа — всё на вашем устройстве, без интернета</li>
                  <li>📱 Установка как приложение (PWA)</li>
                  <li>📤 Резервное копирование в JSON</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-1">🔄 Как пользоваться</h3>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Добавьте задачи в категории</li>
                  <li>Выберите секцию — получите случайную задачу</li>
                  <li>Работайте по таймеру</li>
                  <li>Отметьте результат: ✅ Завершить или 🔄 Вернуть</li>
                </ol>
              </section>

              <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                Приложение не требует регистрации, полностью бесплатно и конфиденциально. Все данные хранятся только на вашем устройстве.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
