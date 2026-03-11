import { useState, useEffect, useRef, useCallback } from "react";
import { Task, CATEGORIES } from "@/types";
import { useApp } from "@/App";
import { getRandomBackgroundForCategory } from "@/lib/assets";
import { X, Play, Pause, RotateCcw, Check, Undo2, Volume2, VolumeX } from "lucide-react";

interface Props {
  task: Task;
  onClose: () => void;
}

export function TimerScreen({ task, onClose }: Props) {
  const { setTasks } = useApp();
  const [minutes, setMinutes] = useState(15);
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const endAtRef = useRef(0);
  const intervalRef = useRef<number | null>(null);
  const bgImage = useRef(getRandomBackgroundForCategory(task.category));
  const elapsedRef = useRef(0); // total elapsed seconds this session
  const sessionStartRef = useRef(0);

  const updateDisplay = useCallback(() => {
    if (endAtRef.current <= 0) return;
    const remaining = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000));
    setTimeLeft(remaining);
    if (remaining <= 0) {
      clearInterval(intervalRef.current!);
      // Track elapsed time
      if (sessionStartRef.current > 0) {
        elapsedRef.current += Math.round((Date.now() - sessionStartRef.current) / 1000);
        sessionStartRef.current = 0;
      }
      setRunning(false);
      setFinished(true);
      if (soundEnabled) playWindChime();
    }
  }, [soundEnabled]);

  useEffect(() => {
    if (running) {
      intervalRef.current = window.setInterval(updateDisplay, 250);
      return () => clearInterval(intervalRef.current!);
    }
  }, [running, updateDisplay]);

  const saveTimeSpent = useCallback(() => {
    // Add any remaining running time
    let total = elapsedRef.current;
    if (sessionStartRef.current > 0) {
      total += Math.round((Date.now() - sessionStartRef.current) / 1000);
    }
    if (total > 0) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? { ...t, timeSpent: (t.timeSpent ?? 0) + total }
            : t
        )
      );
    }
  }, [task.id, setTasks]);

  const start = () => {
    if (running || finished) return;
    const total = timeLeft > 0 ? timeLeft : minutes * 60;
    endAtRef.current = Date.now() + total * 1000;
    sessionStartRef.current = Date.now();
    setRunning(true);
  };

  const pause = () => {
    if (!running) return;
    clearInterval(intervalRef.current!);
    const remaining = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000));
    // Track elapsed
    if (sessionStartRef.current > 0) {
      elapsedRef.current += Math.round((Date.now() - sessionStartRef.current) / 1000);
      sessionStartRef.current = 0;
    }
    setTimeLeft(remaining);
    endAtRef.current = 0;
    setRunning(false);
  };

  const reset = () => {
    clearInterval(intervalRef.current!);
    // Don't lose already tracked time
    if (sessionStartRef.current > 0) {
      elapsedRef.current += Math.round((Date.now() - sessionStartRef.current) / 1000);
      sessionStartRef.current = 0;
    }
    setRunning(false);
    setFinished(false);
    endAtRef.current = 0;
    setTimeLeft(minutes * 60);
  };

  const completeTask = () => {
    saveTimeSpent();
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, completed: true, statusChangedAt: Date.now() } : t
      )
    );
    onClose();
  };

  const returnTask = () => {
    saveTimeSpent();
    onClose();
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const info = CATEGORIES[task.category];

  // Show elapsed time
  let currentElapsed = elapsedRef.current;
  if (sessionStartRef.current > 0) {
    currentElapsed += Math.round((Date.now() - sessionStartRef.current) / 1000);
  }
  const elapsedMins = Math.floor(currentElapsed / 60);
  const elapsedSecs = currentElapsed % 60;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40">
      <div
        className="force-light relative w-full h-full flex flex-col items-center justify-center p-6 text-foreground overflow-auto"
        style={{
          backgroundColor: info.bgColor,
          backgroundImage: bgImage.current
            ? `linear-gradient(to bottom, rgba(255,255,255,0.3), rgba(255,255,255,0.2)), url('${bgImage.current}')`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <button
          onClick={returnTask}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/60 active:bg-white/80"
        >
          <X size={20} />
        </button>

        <h2 className="font-display text-3xl sm:text-4xl mb-2 timer-label-glow">Ваша задача:</h2>
        <div
          className="text-base sm:text-lg font-semibold text-center px-4 py-2 rounded-lg mb-2 max-w-md shadow-sm"
          style={{ backgroundColor: info.bgColor }}
        >
          {task.text}
        </div>
        <div className="text-sm mb-4 opacity-80 timer-label-glow font-medium">{info.name}</div>

        {/* Elapsed time indicator */}
        {(task.timeSpent ?? 0) > 0 && (
          <div className="text-xs mb-2 opacity-60 flex items-center gap-1 bg-white/40 px-2 py-1 rounded-full">
            ⏱ Ранее: {Math.floor((task.timeSpent ?? 0) / 60)}м
          </div>
        )}

        {/* Timer display */}
        <div className="font-mono text-7xl sm:text-8xl font-bold mb-2 tracking-wider timer-glow">
          {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </div>

        {currentElapsed > 0 && (
          <div className="text-sm mb-4 opacity-70 font-mono bg-white/30 px-3 py-1 rounded-full">
            ▶ {String(elapsedMins).padStart(2, "0")}:{String(elapsedSecs).padStart(2, "0")} в этой сессии
          </div>
        )}

        {!finished && (
          <>
            {/* Minutes input */}
            <div className="flex items-center gap-2 mb-4 bg-white/50 px-3 py-2 rounded-lg shadow-sm">
              <input
                type="number"
                min={1}
                max={120}
                value={minutes}
                onChange={(e) => {
                  const v = Math.max(1, parseInt(e.target.value) || 1);
                  setMinutes(v);
                  if (!running) setTimeLeft(v * 60);
                }}
                className="w-16 text-center rounded-md border border-border bg-white p-1.5 text-sm font-medium"
                disabled={running}
              />
              <span className="text-sm font-medium">мин</span>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="ml-2 p-2 rounded-md bg-white/70 active:bg-white/90 border border-border/30"
              >
                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
            </div>

            {/* Timer controls */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={start}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium active:scale-95 transition-all shadow-sm"
              >
                <Play size={16} /> Старт
              </button>
              <button
                onClick={pause}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-white/70 font-medium active:scale-95 transition-all shadow-sm border border-border/30"
              >
                <Pause size={16} /> Пауза
              </button>
              <button
                onClick={reset}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-white/70 font-medium active:scale-95 transition-all shadow-sm border border-border/30"
              >
                <RotateCcw size={16} /> Сброс
              </button>
            </div>

            {/* Complete now button - muted green */}
            <button
              onClick={completeTask}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-600/80 text-white font-medium active:scale-95 transition-all shadow-md"
            >
              <Check size={18} /> Готово
            </button>
          </>
        )}

        {finished && (
          <div className="flex flex-col gap-3">
            <p className="text-center text-lg font-semibold mb-2 timer-label-glow">Время вышло!</p>
            <button
              onClick={completeTask}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-600/80 text-white font-medium active:scale-95 transition-all shadow-md"
            >
              <Check size={18} /> Завершить задачу
            </button>
            <button
              onClick={returnTask}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-white/70 font-medium active:scale-95 transition-all shadow-sm border border-border/30"
            >
              <Undo2 size={18} /> Вернуть в коробочку
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function playWindChime() {
  try {
    const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtor) return;
    const ctx = new AudioCtor();
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.001, ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + 0.1);
    master.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.0);
    master.connect(ctx.destination);
    const tones = [
      { f: 659, s: 0, l: 1.5, v: 0.3 },
      { f: 784, s: 0.1, l: 1.3, v: 0.25 },
      { f: 880, s: 0.2, l: 1.1, v: 0.2 },
      { f: 1047, s: 0.3, l: 0.9, v: 0.15 },
      { f: 1175, s: 0.4, l: 0.7, v: 0.1 },
    ];
    tones.forEach(({ f, s, l, v }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f, ctx.currentTime + s);
      gain.gain.setValueAtTime(0.001, ctx.currentTime + s);
      gain.gain.exponentialRampToValueAtTime(v, ctx.currentTime + s + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + s + l);
      osc.connect(gain).connect(master);
      osc.start(ctx.currentTime + s);
      osc.stop(ctx.currentTime + s + l + 0.1);
    });
    setTimeout(() => ctx.close(), 3500);
  } catch {}
}