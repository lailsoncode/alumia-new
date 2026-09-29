export type NotificationSound = "device" | "alumia" | "gentle";
export type LocalNotificationKind = "notification" | "reminder";

export interface NotificationPreferences {
  notificationSound: NotificationSound;
  useSameSoundForReminders: boolean;
  reminderSound: NotificationSound;
}

export const NOTIFICATION_SOUND_OPTIONS: ReadonlyArray<{
  value: NotificationSound;
  label: string;
  description: string;
  file?: string;
}> = [
  { value: "device", label: "Padrão do dispositivo", description: "Usa o som escolhido no sistema." },
  { value: "alumia", label: "Alumia", description: "Um aviso claro e presente.", file: "alumia_alarm.wav" },
  { value: "gentle", label: "Alumia suave", description: "Um toque mais leve para lembretes.", file: "alumia_gentle.wav" },
];

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  notificationSound: "device",
  useSameSoundForReminders: false,
  reminderSound: "gentle",
};

const STORAGE_KEY = "alumia_notification_preferences_v1";
const soundValues = new Set<NotificationSound>(NOTIFICATION_SOUND_OPTIONS.map(({ value }) => value));

function isNotificationSound(value: unknown): value is NotificationSound {
  return typeof value === "string" && soundValues.has(value as NotificationSound);
}

export function getStoredNotificationPreferences(): NotificationPreferences {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATION_PREFERENCES;

  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<NotificationPreferences> | null;
    if (!stored) return DEFAULT_NOTIFICATION_PREFERENCES;
    return {
      notificationSound: isNotificationSound(stored.notificationSound)
        ? stored.notificationSound
        : DEFAULT_NOTIFICATION_PREFERENCES.notificationSound,
      useSameSoundForReminders: stored.useSameSoundForReminders === true,
      reminderSound: isNotificationSound(stored.reminderSound)
        ? stored.reminderSound
        : DEFAULT_NOTIFICATION_PREFERENCES.reminderSound,
    };
  } catch {
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }
}

export function saveNotificationPreferences(preferences: NotificationPreferences) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}

export function getSoundForNotificationKind(kind: LocalNotificationKind, preferences = getStoredNotificationPreferences()) {
  if (kind === "notification" || preferences.useSameSoundForReminders) return preferences.notificationSound;
  return preferences.reminderSound;
}

export function getNotificationSoundFile(sound: NotificationSound) {
  return NOTIFICATION_SOUND_OPTIONS.find((option) => option.value === sound)?.file ?? "";
}

