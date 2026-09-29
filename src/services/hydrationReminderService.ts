import { Capacitor } from "@capacitor/core";
import { ensureHighPriorityNotificationChannel, getLocalNotificationDelivery } from "@/services/notificationChannelService";

export interface HydrationReminderPreferences {
  enabled: boolean;
  startHour: number;
  endHour: number;
  intervalHours: number;
}

const STORAGE_KEY = "alumia_hydration_reminders";
const NOTIFICATION_ID_BASE = 1_760_000_000;
const MAX_REMINDERS = 8;

export const DEFAULT_HYDRATION_REMINDERS: HydrationReminderPreferences = {
  enabled: false,
  startHour: 9,
  endHour: 21,
  intervalHours: 3,
};

export function isHydrationReminderSupported() {
  return Capacitor.isNativePlatform();
}

export function getHydrationReminderTimes(preferences: HydrationReminderPreferences) {
  const times: number[] = [];
  for (let hour = preferences.startHour; hour <= preferences.endHour && times.length < MAX_REMINDERS; hour += preferences.intervalHours) {
    times.push(hour);
  }
  return times;
}

export function getStoredHydrationReminders(): HydrationReminderPreferences {
  if (typeof window === "undefined") return DEFAULT_HYDRATION_REMINDERS;
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<HydrationReminderPreferences> | null;
    if (!stored) return DEFAULT_HYDRATION_REMINDERS;
    return {
      enabled: stored.enabled === true,
      startHour: Number(stored.startHour) || 9,
      endHour: Number(stored.endHour) || 21,
      intervalHours: Number(stored.intervalHours) || 3,
    };
  } catch {
    return DEFAULT_HYDRATION_REMINDERS;
  }
}

async function cancelScheduledReminders() {
  if (!isHydrationReminderSupported()) return;
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  await LocalNotifications.cancel({
    notifications: Array.from({ length: MAX_REMINDERS }, (_, index) => ({ id: NOTIFICATION_ID_BASE + index })),
  });
}

export async function saveHydrationReminders(preferences: HydrationReminderPreferences, requestPermission = true) {
  if (preferences.startHour < 0 || preferences.endHour > 23 || preferences.startHour > preferences.endHour) {
    throw new Error("Horário inválido.");
  }
  if (![2, 3, 4].includes(preferences.intervalHours)) throw new Error("Intervalo inválido.");
  if (!isHydrationReminderSupported()) return false;

  const { LocalNotifications } = await import("@capacitor/local-notifications");
  await cancelScheduledReminders();

  if (!preferences.enabled) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    return true;
  }

  let permission = await LocalNotifications.checkPermissions();
  if (permission.display !== "granted" && requestPermission) permission = await LocalNotifications.requestPermissions();
  if (permission.display !== "granted") return false;

  const hasNotificationChannels = await ensureHighPriorityNotificationChannel();
  const notifications = getHydrationReminderTimes(preferences).map((hour, index) => ({
    id: NOTIFICATION_ID_BASE + index,
    title: "Uma pausa para você",
    body: "Que tal beber um pouco de água?",
    schedule: { on: { hour, minute: 0 }, repeats: true, allowWhileIdle: true },
    autoCancel: true,
    foreground: true,
    interruptionLevel: "active" as const,
    ...getLocalNotificationDelivery("reminder", hasNotificationChannels),
    extra: { route: "/hidratacao", kind: "hydration_reminder" },
  }));
  await LocalNotifications.schedule({ notifications });
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  return true;
}

export function synchronizeHydrationReminders() {
  return saveHydrationReminders(getStoredHydrationReminders(), false);
}
