const ONE_SIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID?.trim();
const ONE_SIGNAL_SCRIPT_ID = "onesignal-web-sdk";
const ONE_SIGNAL_SCRIPT_URL = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";

interface OneSignalPushSubscription {
  optedIn: boolean;
  optIn: () => Promise<void> | void;
  optOut: () => Promise<void> | void;
}

interface OneSignalSdk {
  init: (options: {
    appId: string;
    serviceWorkerPath: string;
    serviceWorkerParam: { scope: string };
    notifyButton: { enable: boolean };
  }) => Promise<void>;
  login: (externalId: string) => Promise<void>;
  logout: () => Promise<void>;
  Notifications: {
    isPushSupported: () => boolean;
    permission: boolean;
    requestPermission: () => Promise<boolean>;
  };
  User: {
    externalId: string | null;
    PushSubscription: OneSignalPushSubscription;
  };
}

interface OneSignalDeferredQueue {
  push: (callback: (oneSignal: OneSignalSdk) => Promise<void> | void) => void;
}

declare global {
  interface Window {
    OneSignalDeferred?: OneSignalDeferredQueue;
  }
}

export interface PushNotificationState {
  configured: boolean;
  supported: boolean;
  permission: boolean;
  optedIn: boolean;
  enabled: boolean;
}

let sdkPromise: Promise<OneSignalSdk> | null = null;

export function isOneSignalConfigured() {
  return Boolean(ONE_SIGNAL_APP_ID && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(ONE_SIGNAL_APP_ID));
}

function loadOneSignalSdk() {
  if (!isOneSignalConfigured()) {
    return Promise.reject(new Error("OneSignal não configurado."));
  }

  if (typeof window === "undefined") {
    return Promise.reject(new Error("OneSignal só pode ser iniciado no navegador."));
  }

  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise<OneSignalSdk>((resolve, reject) => {
    const deferredQueue = window.OneSignalDeferred ?? ([] as unknown as OneSignalDeferredQueue);
    window.OneSignalDeferred = deferredQueue;
    deferredQueue.push(async (oneSignal) => {
      try {
        await oneSignal.init({
          appId: ONE_SIGNAL_APP_ID!,
          serviceWorkerPath: "push/onesignal/OneSignalSDKWorker.js",
          serviceWorkerParam: { scope: "/push/onesignal/" },
          notifyButton: { enable: false },
        });
        resolve(oneSignal);
      } catch (error) {
        sdkPromise = null;
        reject(error);
      }
    });

    if (document.getElementById(ONE_SIGNAL_SCRIPT_ID)) return;

    const script = document.createElement("script");
    script.id = ONE_SIGNAL_SCRIPT_ID;
    script.src = ONE_SIGNAL_SCRIPT_URL;
    script.defer = true;
    script.addEventListener(
      "error",
      () => {
        sdkPromise = null;
        reject(new Error("Não foi possível carregar o OneSignal."));
      },
      { once: true },
    );
    document.head.appendChild(script);
  });

  return sdkPromise;
}

function readPushState(oneSignal: OneSignalSdk): PushNotificationState {
  const supported = oneSignal.Notifications.isPushSupported();
  const permission = oneSignal.Notifications.permission;
  const optedIn = oneSignal.User.PushSubscription.optedIn;

  return {
    configured: true,
    supported,
    permission,
    optedIn,
    enabled: supported && permission && optedIn,
  };
}

export async function initializeOneSignal() {
  if (!isOneSignalConfigured()) return false;
  await loadOneSignalSdk();
  return true;
}

export async function synchronizeOneSignalUser(externalId: string | null) {
  if (!isOneSignalConfigured()) return;

  const oneSignal = await loadOneSignalSdk();
  if (externalId && oneSignal.User.externalId !== externalId) {
    await oneSignal.login(externalId);
    return;
  }

  if (!externalId && oneSignal.User.externalId) {
    await oneSignal.logout();
  }
}

export async function getPushNotificationState(): Promise<PushNotificationState> {
  if (!isOneSignalConfigured()) {
    return { configured: false, supported: false, permission: false, optedIn: false, enabled: false };
  }

  return readPushState(await loadOneSignalSdk());
}

export async function enablePushNotifications() {
  const oneSignal = await loadOneSignalSdk();
  if (!oneSignal.Notifications.isPushSupported()) return readPushState(oneSignal);

  if (!oneSignal.Notifications.permission) {
    const permissionGranted = await oneSignal.Notifications.requestPermission();
    if (!permissionGranted) return readPushState(oneSignal);
  }

  await oneSignal.User.PushSubscription.optIn();
  return readPushState(oneSignal);
}

export async function disablePushNotifications() {
  const oneSignal = await loadOneSignalSdk();
  await oneSignal.User.PushSubscription.optOut();
  return readPushState(oneSignal);
}
