import { Capacitor } from "@capacitor/core";

// Keep this ID versioned. Android does not allow an app to raise the importance
// of a channel after it has been created on a device.
export const HIGH_PRIORITY_NOTIFICATION_CHANNEL_ID = "alumia_alarms_v2";
export const ALARM_NOTIFICATION_SOUND = "alumia_alarm.wav";
const ONESIGNAL_FALLBACK_NOTIFICATION_CHANNEL_ID = "fcm_fallback_notification_channel";

let channelPromise: Promise<boolean> | null = null;

export function ensureHighPriorityNotificationChannel() {
  if (Capacitor.getPlatform() !== "android") return Promise.resolve(false);
  if (channelPromise) return channelPromise;

  channelPromise = import("@capacitor/local-notifications")
    .then(({ LocalNotifications }) => Promise.all([
      LocalNotifications.createChannel({
        id: HIGH_PRIORITY_NOTIFICATION_CHANNEL_ID,
        name: "Alertas e lembretes",
        description: "Avisos importantes e lembretes da Alumia",
        importance: 4,
        visibility: 1,
        sound: ALARM_NOTIFICATION_SOUND,
        vibration: true,
        lights: true,
        lightColor: "#8B5CF6",
      }),
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
