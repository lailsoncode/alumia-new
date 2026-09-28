import { Capacitor } from "@capacitor/core";
import type { OneSignalPlugin } from "onesignal-cordova-plugin";
import { ensureHighPriorityNotificationChannel } from "@/services/notificationChannelService";

const ONE_SIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID?.trim();
const ONE_SIGNAL_NATIVE_APP_ID = import.meta.env.VITE_ONESIGNAL_NATIVE_APP_ID?.trim() || ONE_SIGNAL_APP_ID;
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
let nativeSdkPromise: Promise<OneSignalPlugin> | null = null;

function isValidAppId(value?: string) {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
}

export function isOneSignalConfigured() {
  return isValidAppId(Capacitor.isNativePlatform() ? ONE_SIGNAL_NATIVE_APP_ID : ONE_SIGNAL_APP_ID);
}

async function loadNativeOneSignalSdk() {
  if (!isValidAppId(ONE_SIGNAL_NATIVE_APP_ID)) {
    return Promise.reject(new Error("OneSignal nativo não configurado."));
  }

  if (!nativeSdkPromise) {
    nativeSdkPromise = ensureHighPriorityNotificationChannel()
      .then(() => import("onesignal-cordova-plugin"))
      .then(({ default: oneSignal }) => {
        oneSignal.initialize(ONE_SIGNAL_NATIVE_APP_ID!);
        return oneSignal;
      })
      .catch((error) => {
        nativeSdkPromise = null;
        throw error;
      });
  }

  return nativeSdkPromise;
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
  if (Capacitor.isNativePlatform()) await loadNativeOneSignalSdk();
  else await loadOneSignalSdk();
  return true;
}

export async function synchronizeOneSignalUser(externalId: string | null) {
  if (!isOneSignalConfigured()) return;

  if (Capacitor.isNativePlatform()) {
    const oneSignal = await loadNativeOneSignalSdk();
    const currentExternalId = await oneSignal.User.getExternalId();
    if (externalId && currentExternalId !== externalId) oneSignal.login(externalId);
    else if (!externalId && currentExternalId) oneSignal.logout();
    return;
  }

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

  if (Capacitor.isNativePlatform()) {
    const oneSignal = await loadNativeOneSignalSdk();
    const [permission, optedIn] = await Promise.all([
      oneSignal.Notifications.getPermissionAsync(),
      oneSignal.User.pushSubscription.getOptedInAsync(),
    ]);
    return { configured: true, supported: true, permission, optedIn, enabled: permission && optedIn };
  }

  return readPushState(await loadOneSignalSdk());
}

export async function enablePushNotifications() {
  if (Capacitor.isNativePlatform()) {
    const oneSignal = await loadNativeOneSignalSdk();
    let permission = await oneSignal.Notifications.getPermissionAsync();
    if (!permission) permission = await oneSignal.Notifications.requestPermission(true);
    if (permission) oneSignal.User.pushSubscription.optIn();
    const optedIn = permission ? await oneSignal.User.pushSubscription.getOptedInAsync() : false;
    return { configured: true, supported: true, permission, optedIn, enabled: permission && optedIn };
  }

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
  if (Capacitor.isNativePlatform()) {
    const oneSignal = await loadNativeOneSignalSdk();
    oneSignal.User.pushSubscription.optOut();
    const permission = await oneSignal.Notifications.getPermissionAsync();
    return { configured: true, supported: true, permission, optedIn: false, enabled: false };
  }

  const oneSignal = await loadOneSignalSdk();
  await oneSignal.User.PushSubscription.optOut();
  return readPushState(oneSignal);
}
