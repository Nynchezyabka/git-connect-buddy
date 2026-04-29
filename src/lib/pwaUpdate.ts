// PWA update manager: registers SW, exposes manual check + apply.
import { registerSW } from "virtual:pwa-register";

type Listener = (state: { needRefresh: boolean; checking: boolean }) => void;

let needRefresh = false;
let checking = false;
const listeners = new Set<Listener>();

let updateSWFn: ((reload?: boolean) => Promise<void>) | null = null;

function emit() {
  listeners.forEach((l) => l({ needRefresh, checking }));
}

function isPreviewOrIframe(): boolean {
  try {
    if (window.self !== window.top) return true;
  } catch {
    return true;
  }
  const h = window.location.hostname;
  return h.includes("id-preview--") || h.includes("lovableproject.com");
}

export function initPwaUpdates() {
  if (typeof window === "undefined") return;
  if (isPreviewOrIframe()) return; // не регистрируем SW внутри редактора Lovable
  if (!("serviceWorker" in navigator)) return;

  updateSWFn = registerSW({
    immediate: true,
    onNeedRefresh() {
      needRefresh = true;
      emit();
    },
    onOfflineReady() {
      // no-op
    },
  });
}

export function subscribeUpdates(l: Listener) {
  listeners.add(l);
  l({ needRefresh, checking });
  return () => listeners.delete(l);
}

export async function checkForUpdates(): Promise<"unavailable" | "current" | "available"> {
  if (isPreviewOrIframe() || !("serviceWorker" in navigator)) return "unavailable";
  checking = true;
  emit();
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) return "unavailable";
    await reg.update();
    // Дать SW время сообщить о новой версии
    await new Promise((r) => setTimeout(r, 800));
    return needRefresh ? "available" : "current";
  } catch {
    return "unavailable";
  } finally {
    checking = false;
    emit();
  }
}

export async function applyUpdate() {
  if (updateSWFn) {
    await updateSWFn(true); // skipWaiting + перезагрузка
  } else {
    window.location.reload();
  }
}

export function isUpdateSupported() {
  return !isPreviewOrIframe() && typeof navigator !== "undefined" && "serviceWorker" in navigator;
}
