import { Capacitor } from "@capacitor/core";
import {
  getNotificationSoundFile,
  getSoundForNotificationKind,
  type LocalNotificationKind,
  type NotificationSound,
} from "@/services/notificationPreferencesService";

const ONESIGNAL_FALLBACK_NOTIFICATION_CHANNEL_ID = "fcm_fallback_notification_channel";

const channelIds: Record<LocalNotificationKind, Record<NotificationSound, string>> = {
  notification: {
    device: "alumia_notifications_device_v1",
    alumia: "alumia_notifications_alumia_v1",
    gentle: "alumia_notifications_gentle_v1",
  },
  reminder: {
    device: "alumia_reminders_device_v1",
    alumia: "alumia_reminders_alumia_v1",
    gentle: "alumia_reminders_gentle_v1",
  },
};

let channelPromise: Promise<boolean> | null = null;

export function ensureHighPriorityNotificationChannel() {
  if (Capacitor.getPlatform() !== "android") return Promise.resolve(false);
  if (channelPromise) return channelPromise;

  channelPromise = import("@capacitor/local-notifications")
    .then(({ LocalNotifications }) => Promise.all([
      // OneSignal uses this channel when a push has no category. Creating it
      // before the SDK gives uncategorized pushes heads-up behavior on new installs.
      LocalNotifications.createChannel({
        id: ONESIGNAL_FALLBACK_NOTIFICATION_CHANNEL_ID,
        name: "Notificações",
        description: "Notificações gerais da Alumia",
        importance: 4,
        visibility: 1,
        vibration: true,
        lights: true,
        lightColor: "#8B5CF6",
      }),
      ...(["notification", "reminder"] as const).flatMap((kind) =>
        (["device", "alumia", "gentle"] as const).map((sound) => {
          const soundFile = getNotificationSoundFile(sound);
          const soundName = sound === "device" ? "padrão do dispositivo" : sound === "alumia" ? "Alumia" : "Alumia suave";
          return LocalNotifications.createChannel({
            id: channelIds[kind][sound],
            name: `${kind === "notification" ? "Avisos" : "Lembretes"} — ${soundName}`,
            description: kind === "notification"
              ? "Avisos de tarefas e outros cuidados"
              : "Lembretes antecipados e recorrentes",
            importance: 4,
            visibility: 1,
            ...(soundFile ? { sound: soundFile } : {}),
            vibration: true,
            lights: true,
            lightColor: "#8B5CF6",
          });
        }),
      ),
    ]))
    .then(() => true)
    .catch((error) => {
      // Channels do not exist before Android 8. Notifications still work there
      // using the priority set by the notification itself.
      console.warn("Não foi possível preparar o canal de notificações prioritárias:", error);
      return false;
    });

  return channelPromise;
}

export function getLocalNotificationDelivery(kind: LocalNotificationKind, useAndroidChannel = true) {
  const sound = getSoundForNotificationKind(kind);
  const soundFile = getNotificationSoundFile(sound);
  return {
    // An empty filename asks iOS and Android 7 to fall back to the system sound.
    sound: soundFile,
    ...(Capacitor.getPlatform() === "android" && useAndroidChannel ? { channelId: channelIds[kind][sound] } : {}),
  };
}
