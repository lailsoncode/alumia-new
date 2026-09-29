import { beforeEach, describe, expect, it, vi } from "vitest";

const createChannel = vi.fn(async () => undefined);

vi.mock("@capacitor/core", () => ({
  Capacitor: { getPlatform: () => "android" },
}));

vi.mock("@capacitor/local-notifications", () => ({
  LocalNotifications: { createChannel },
}));

beforeEach(() => {
  vi.resetModules();
  createChannel.mockClear();
  window.localStorage.clear();
});

describe("ensureHighPriorityNotificationChannel", () => {
  it("cria os canais do app e do fallback do OneSignal com importância alta", async () => {
    const { ensureHighPriorityNotificationChannel } = await import("./notificationChannelService");

    await expect(ensureHighPriorityNotificationChannel()).resolves.toBe(true);
    expect(createChannel).toHaveBeenCalledTimes(7);
    expect(createChannel).toHaveBeenCalledWith(expect.objectContaining({
      id: "fcm_fallback_notification_channel",
      importance: 4,
      vibration: true,
    }));
    expect(createChannel).toHaveBeenCalledWith(expect.objectContaining({
      id: "alumia_notifications_device_v1",
      importance: 4,
    }));
    expect(createChannel).toHaveBeenCalledWith(expect.objectContaining({
      id: "alumia_reminders_gentle_v1",
      sound: "alumia_gentle.wav",
    }));
  });

  it("seleciona canais distintos para avisos e lembretes", async () => {
    window.localStorage.setItem("alumia_notification_preferences_v1", JSON.stringify({
      notificationSound: "alumia",
      useSameSoundForReminders: false,
      reminderSound: "gentle",
    }));
    const { getLocalNotificationDelivery } = await import("./notificationChannelService");

    expect(getLocalNotificationDelivery("notification")).toEqual({
      sound: "alumia_alarm.wav",
      channelId: "alumia_notifications_alumia_v1",
    });
    expect(getLocalNotificationDelivery("reminder")).toEqual({
      sound: "alumia_gentle.wav",
      channelId: "alumia_reminders_gentle_v1",
    });
  });
});
