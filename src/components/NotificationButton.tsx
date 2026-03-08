import { useState } from "react";
import { Bell, BellOff, BellRing } from "lucide-react";
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  sendNotification,
} from "@/lib/notifications";
import { toast } from "sonner";

export function NotificationButton() {
  const [permission, setPermission] = useState<NotificationPermission>(
    getNotificationPermission()
  );

  if (!isNotificationSupported()) return null;

  const handleClick = async () => {
    if (permission === "granted") {
      sendNotification("🎁 КОРОБОЧКА", {
        body: "Уведомления работают!",
      });
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
      sendNotification("🎁 КОРОБОЧКА", {
        body: "Теперь вы будете получать напоминания",
      });
    } else {
      toast.error("Разрешение не получено");
    }
  };

  const Icon = permission === "granted" ? BellRing : permission === "denied" ? BellOff : Bell;

  return (
    <button
      onClick={handleClick}
      className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-border active:scale-95 transition-all"
      title={
        permission === "granted"
          ? "Уведомления включены"
          : permission === "denied"
          ? "Уведомления заблокированы"
          : "Включить уведомления"
      }
    >
      <Icon size={18} />
    </button>
  );
}
