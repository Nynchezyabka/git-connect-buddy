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
        <div className="fixed inset-0 z-[10050] flex items-center justify-center bg-black/50 p-4" onClick={() => setOpen(false)}>
          <div
            className="bg-background rounded-2xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 relative animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-muted text-muted-foreground hover:bg-accent transition-colors"
            >
              <X size={18} />
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
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Названия категорий можно переименовать через иконку ✏️ в списке задач.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-base sm:text-lg mb-1">⚡ Возможности</h3>
                <ul className="space-y-1.5 list-none">
                  <li>🎲 <strong>Случайный выбор задач</strong> — как вытягивание бумажки из коробки</li>
                  <li>⏱️ <strong>Таймер для фокусировки</strong> — настраиваемое время, звуковой сигнал</li>
                  <li>🔄 <strong>Повторяющиеся шаблоны</strong> — ежедневные, еженедельные, ежемесячные</li>
                  <li>📊 <strong>История и статистика</strong> — календарь с выполненными задачами, ручной ввод прошлых задач</li>
                  <li>🏷️ <strong>Подкатегории</strong> — создание своих подкатегорий прямо в карточке задачи (кнопка «+»)</li>
                  <li>✏️ <strong>Переименование</strong> — категории и подкатегории можно переименовать</li>
                  <li>📝 <strong>Гибкое управление</strong> — добавляйте, перемещайте, скрывайте, перетаскивайте задачи</li>
                  <li>🌙 <strong>Тёмная тема</strong> — переключение день/ночь</li>
                  <li>🔔 <strong>Уведомления</strong> — напоминания при разрешении браузера</li>
                  <li>💾 <strong>Автономная работа</strong> — всё на вашем устройстве, без интернета</li>
                  <li>📱 <strong>Установка как приложение</strong> (PWA) — добавьте на домашний экран</li>
                  <li>📤 <strong>Резервное копирование</strong> — экспорт и импорт задач в JSON</li>
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

              <section>
                <h3 className="font-semibold text-base sm:text-lg mb-1">💡 Советы</h3>
                <ul className="space-y-1 list-none">
                  <li>👆 Нажмите на текст задачи для редактирования</li>
                  <li>🏷️ Нажмите на подкатегорию задачи для смены или добавления новой</li>
                  <li>📂 Нажмите на иконку папки для смены категории</li>
                  <li>⬆⬇ Перетаскивайте задачи для изменения порядка</li>
                  <li>👁️ Скройте задачи, чтобы они не попадались в случайном выборе</li>
                  <li>🔄 Создайте шаблоны для регулярных задач</li>
                </ul>
              </section>

              <p className="text-xs sm:text-sm text-muted-foreground pt-2 border-t border-border">
                Приложение не требует регистрации, полностью бесплатно и конфиденциально. Все данные хранятся только на вашем устройстве.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
