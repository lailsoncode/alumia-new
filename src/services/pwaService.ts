let registrationPromise: Promise<ServiceWorkerRegistration> | null = null;

export function registerPwaServiceWorker() {
  if (!import.meta.env.PROD || typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return Promise.resolve(null);
  }

  if (registrationPromise) return registrationPromise;

  registrationPromise = navigator.serviceWorker.register("/sw.js", { scope: "/" });
  return registrationPromise;
}
