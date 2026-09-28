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
});

describe("ensureHighPriorityNotificationChannel", () => {
  it("cria os canais do app e do fallback do OneSignal com importância alta", async () => {
    const { ensureHighPriorityNotificationChannel } = await import("./notificationChannelService");

    await expect(ensureHighPriorityNotificationChannel()).resolves.toBe(true);
    expect(createChannel).toHaveBeenCalledTimes(2);
    expect(createChannel).toHaveBeenCalledWith(expect.objectContaining({
      id: "alumia_alerts_v1",
      importance: 4,
      vibration: true,
    }));
    expect(createChannel).toHaveBeenCalledWith(expect.objectContaining({
      id: "fcm_fallback_notification_channel",
      importance: 4,
      vibration: true,
    }));
  });
});
