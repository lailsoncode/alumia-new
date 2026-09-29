import { beforeEach, describe, expect, it } from "vitest";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  getSoundForNotificationKind,
  getStoredNotificationPreferences,
  saveNotificationPreferences,
} from "./notificationPreferencesService";

beforeEach(() => window.localStorage.clear());

describe("notificationPreferencesService", () => {
  it("usa o som do dispositivo para avisos e um toque suave para lembretes por padrão", () => {
    expect(getStoredNotificationPreferences()).toEqual(DEFAULT_NOTIFICATION_PREFERENCES);
    expect(getSoundForNotificationKind("notification")).toBe("device");
    expect(getSoundForNotificationKind("reminder")).toBe("gentle");
  });

  it("permite usar o mesmo som para notificações e lembretes", () => {
    saveNotificationPreferences({
      notificationSound: "alumia",
      useSameSoundForReminders: true,
      reminderSound: "gentle",
    });

    expect(getSoundForNotificationKind("notification")).toBe("alumia");
    expect(getSoundForNotificationKind("reminder")).toBe("alumia");
  });

  it("descarta valores de som inválidos salvos no dispositivo", () => {
    window.localStorage.setItem("alumia_notification_preferences_v1", JSON.stringify({
      notificationSound: "arquivo_desconhecido",
      reminderSound: "gentle",
    }));

    expect(getStoredNotificationPreferences()).toEqual({
      notificationSound: "device",
      useSameSoundForReminders: false,
      reminderSound: "gentle",
    });
  });
});
