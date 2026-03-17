export function InfoPage() {
  return (
    <div className="animate-fade-in space-y-6 pb-8">
      <h2 className="text-2xl font-display text-primary flex items-center gap-2">
        📖 О приложении
      </h2>

      <div className="bg-card rounded-xl border border-border p-5 space-y-5 text-sm sm:text-base text-foreground/90 leading-relaxed">
        <section>
          <h3 className="font-semibold text-base sm:text-lg mb-2 flex items-center gap-2">
            🎁 Что такое КОРОБОЧКА?
          </h3>
          <p>
            КОРОБОЧКА создана по мотивам методики психолога Виолетты Макеевой как инструмент мотивационной гигиены.
            Это инструмент «лайтовой» самодисциплины, где вы сами определяете содержание и можете сделать паузу в любой момент.
          </p>
        </section>

        <hr className="border-border" />

        <section>
          <h3 className="font-semibold text-base sm:text-lg mb-3 flex items-center gap-2">
            🗂️ Категории задач
          </h3>
          <div className="grid gap-2">
            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-cat-1-bg/50">
              <span className="text-lg leading-none mt-0.5">🟨</span>
              <div><strong>Обязательные дела</strong> <span className="text-muted-foreground">— срочные и важные задачи</span></div>
            </div>
            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-cat-2-bg/50">
              <span className="text-lg leading-none mt-0.5">🟦</span>
              <div><strong>Безопасность</strong> <span className="text-muted-foreground">— забота о базовых потребностях</span></div>
            </div>
            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-cat-3-bg/50">
              <span className="text-lg leading-none mt-0.5">🟩</span>
              <div><strong>Простые радости</strong> <span className="text-muted-foreground">— приятные мелочи</span></div>
            </div>
            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-cat-4-bg/50">
              <span className="text-lg leading-none mt-0.5">🟥</span>
              <div><strong>Эго-радости</strong> <span className="text-muted-foreground">— статус и признание</span></div>
            </div>
            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-accent/30">
              <span className="text-lg leading-none mt-0.5">🩵</span>
              <div><strong>Доступность простых радостей</strong> <span className="text-muted-foreground">— условия для радости</span></div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            ✏️ Названия категорий и подкатегорий можно переименовать.
          </p>
        </section>

        <hr className="border-border" />

        <section>
          <h3 className="font-semibold text-base sm:text-lg mb-3 flex items-center gap-2">
            🔄 Как пользоваться
          </h3>
          <ol className="space-y-2.5">
            {[
              ["➊", "Добавьте задачи в категории — кнопка «+» на секции или в списке"],
              ["➋", "Нажмите на секцию или «🎲 случайная задача» — вытяните случайную задачу"],
              ["➌", "Работайте по таймеру — время настраивается"],
              ["➍", "Отметьте результат — ✅ Готово или 🔄 Вернуть в коробочку"],
              ["➎", "Отслеживайте прогресс — раздел «📊 История»"],
            ].map(([num, text]) => (
              <li key={num} className="flex items-start gap-2.5">
                <span className="text-primary font-bold text-base leading-none mt-0.5">{num}</span>
                <span>{text}</span>
              </li>
            ))}
          </ol>
        </section>

        <hr className="border-border" />

        <section>
          <h3 className="font-semibold text-base sm:text-lg mb-3 flex items-center gap-2">
            ⚡ Возможности
          </h3>
          <div className="grid gap-1.5">
            {[
              ["🎲", "Случайный выбор задач", "как вытягивание бумажки из коробки"],
              ["⏱️", "Таймер для фокусировки", "настраиваемое время, звуковой сигнал"],
              ["🔄", "Повторяющиеся шаблоны", "ежедневные, еженедельные, ежемесячные"],
              ["📊", "История и статистика", "календарь выполненных задач"],
              ["🏷️", "Подкатегории", "создание своих подкатегорий в карточке задачи"],
              ["📝", "Гибкое управление", "добавление, перемещение, перетаскивание"],
              ["🌙", "Тёмная тема", "переключение день/ночь"],
              ["🔔", "Уведомления", "напоминания через браузер"],
              ["💾", "Автономная работа", "всё на вашем устройстве"],
              ["📱", "Установка как приложение", "добавьте на домашний экран (PWA)"],
              ["📤", "Резервное копирование", "экспорт/импорт в JSON"],
            ].map(([icon, title, desc]) => (
              <div key={title} className="flex items-start gap-2 py-1">
                <span className="text-base leading-none mt-0.5">{icon}</span>
                <span><strong>{title}</strong> <span className="text-muted-foreground">— {desc}</span></span>
              </div>
            ))}
          </div>
        </section>

        <hr className="border-border" />

        <section>
          <h3 className="font-semibold text-base sm:text-lg mb-3 flex items-center gap-2">
            💡 Советы
          </h3>
          <div className="grid gap-1.5">
            {[
              ["👆", "Нажмите на текст задачи для редактирования"],
              ["🏷️", "Нажмите на подкатегорию для смены или добавления новой"],
              ["📂", "Нажмите на иконку папки для смены категории"],
              ["⬆⬇", "Перетаскивайте задачи для изменения порядка"],
              ["👁️", "Скрывайте задачи, чтобы они не попадались случайно"],
              ["🔄", "Создавайте шаблоны для регулярных задач"],
            ].map(([icon, text]) => (
              <div key={text} className="flex items-start gap-2 py-1">
                <span className="text-base leading-none mt-0.5">{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Без регистрации · Бесплатно · Конфиденциально · Все данные на вашем устройстве
          </p>
        </div>
      </div>
    </div>
  );
}
