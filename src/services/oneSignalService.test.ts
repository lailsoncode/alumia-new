import { afterEach, describe, expect, it, vi } from "vitest";

const APP_ID = "02bb3971-422c-49f8-aef1-327c36c4fe8d";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
  document.getElementById("onesignal-web-sdk")?.remove();
  delete window.OneSignalDeferred;
});

describe("enablePushNotifications", () => {
  it("solicita a permissão nativa antes de assinar o dispositivo", async () => {
    vi.stubEnv("VITE_ONESIGNAL_APP_ID", APP_ID);

    const pushSubscription = {
      optedIn: false,
      optIn: vi.fn(async () => {
        pushSubscription.optedIn = true;
      }),
      optOut: vi.fn(),
    };
    const notifications = {
      permission: false,
      isPushSupported: () => true,
      requestPermission: vi.fn(async () => {
        notifications.permission = true;
        return true;
      }),
    };
    const sdk = {
      init: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
      Notifications: notifications,
      User: { externalId: null, PushSubscription: pushSubscription },
    };

    window.OneSignalDeferred = {
      push: (callback) => {
        void callback(sdk);
      },
    };

    const { enablePushNotifications } = await import("./oneSignalService");
    const state = await enablePushNotifications();

    expect(notifications.requestPermission).toHaveBeenCalledOnce();
    expect(pushSubscription.optIn).toHaveBeenCalledOnce();
    expect(state.enabled).toBe(true);
  });
});
