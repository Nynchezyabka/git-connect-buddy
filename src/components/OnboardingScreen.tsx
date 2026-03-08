import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, Box, Clock, Repeat, BarChart3, Sparkles } from "lucide-react";

interface Props {
  onComplete: () => void;
}

const STEPS = [
  {
    icon: <Box size={48} className="text-primary" />,
    title: "Добро пожаловать в КОРОБОЧКУ!",
    text: "Ваш умный планировщик задач с таймером, шаблонами и статистикой. Задачи разделены на 5 категорий жизни.",
  },
  {
    icon: <Sparkles size={48} className="text-primary" />,
    title: "Случайная задача",
    text: "Нажмите на секцию на главном экране — и приложение выберет случайную задачу с таймером. Это весело и продуктивно!",
  },
  {
    icon: <Repeat size={48} className="text-primary" />,
    title: "Шаблоны",
    text: "Создавайте повторяющиеся задачи — ежедневные, еженедельные или ежемесячные. Они будут создаваться автоматически.",
  },
  {
    icon: <Clock size={48} className="text-primary" />,
    title: "Таймер и статистика",
    text: "Каждая задача имеет таймер. Время работы сохраняется — отслеживайте сколько времени уходит на каждую категорию.",
  },
  {
    icon: <BarChart3 size={48} className="text-primary" />,
    title: "Всё готово!",
    text: "Импортируйте задачи из файла или создайте первую вручную. Включите уведомления для напоминаний. Удачи! 🎁",
  },
];

export function OnboardingScreen({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="max-w-sm w-full mx-4 text-center animate-fade-in">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === step ? "w-8 bg-primary" : i < step ? "w-3 bg-primary/40" : "w-3 bg-muted"
              )}
            />
          ))}
        </div>

        {/* Content */}
        <div className="mb-8" key={step}>
          <div className="flex justify-center mb-4 animate-scale-in">
            {current.icon}
          </div>
          <h2 className="font-display text-2xl text-primary mb-3 animate-fade-in">
            {current.title}
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed animate-fade-in">
            {current.text}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-3 rounded-lg bg-muted text-muted-foreground font-medium active:scale-[0.98] transition-all"
            >
              Назад
            </button>
          )}
          <button
            onClick={() => {
              if (isLast) {
                localStorage.setItem("onboarding_done", "1");
                onComplete();
              } else {
                setStep(step + 1);
              }
            }}
            className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            {isLast ? "Начать!" : "Далее"}
            {!isLast && <ChevronRight size={16} />}
          </button>
        </div>

        {/* Skip */}
        {!isLast && (
          <button
            onClick={() => {
              localStorage.setItem("onboarding_done", "1");
              onComplete();
            }}
            className="mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Пропустить
          </button>
        )}
      </div>
    </div>
  );
}
